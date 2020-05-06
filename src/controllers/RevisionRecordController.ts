/*
 Copyright (c) 2020, International Business Machines All rights reserved.
 
 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:
 
 1.  Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 
 2.  Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation and/or
 other materials provided with the distribution.
 
 3. Neither the name of the copyright holder(s) nor the names of any contributors
 may be used to endorse or promote products derived from this software without
 specific prior written permission. No license is granted to the trademarks of
 the copyright holders even if such marks are included in this software.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Request, Response } from "express";
import { getRepository, getMongoRepository } from "typeorm";
import { OCKRevisionRecord } from "../entity/OCKRevisionRecord";
import { OCKTask } from "../entity/OCKTask";
import { OCKOutcome } from "../entity/OCKOutcome";
import * as util from "util";
import {
  createOrIncrementClock,
  getLatestKnowledgeVector,
  isOutcomeNew,
  deleteExistingOutcomeForUpdate,
  uuid,
  mergeKnowledgeVectors,
} from "../utils";
import { KnowledgeVector, Process } from "../entity/KnowledgeVector";
import assert from "assert";
import { isEmpty, isNotEmpty, isUUID, validate } from "class-validator";
import { TypedJSON } from "typedjson";
import Ajv from "ajv";
export const kvSchema = require("../jsonSchema/knowledgeVector.json");

class RevisionRecordController {
  static listAll = async (req: Request, res: Response) => {
    console.log(util.inspect(req.query.knowledgeVector, false, null, true /* enable colors */));

    if (isEmpty(req.query.knowledgeVector)) {
      res
        .status(400)
        .send(
          'Must send an array of knowledge vectors as query param. An empty knowledge vector would be { processes: [{ id : "validUUIDv4" , clock : 0 } ]}'
        );
      return;
    }

    // Thorough JSON validation using JSON Schema, TypedJSON and class-validator
    const ajv = new Ajv();
    const valid = ajv.validate(kvSchema, req.query.knowledgeVector);
    if (!valid) {
      console.log(ajv.errors);
      res.status(400).send(ajv.errors);
      return;
    }

    let incomingKV: KnowledgeVector;
    try {
      incomingKV = new TypedJSON(KnowledgeVector).parse(req.query.knowledgeVector);
    } catch (error) {
      res.status(400).send("JSON schema error");
      return;
    }

    console.log(util.inspect(incomingKV, false, null, true /* enable colors */));

    const errors = await validate(incomingKV);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    console.log(util.inspect(incomingKV, false, null, true /* enable colors */));

    let returnRevRecord = new OCKRevisionRecord();
    returnRevRecord.entities = [];

    // Case 1 : iOS device is syncing for the first time, it has no knowledge of the servers clock
    if (isEmpty(incomingKV.processes.find((process) => process.id === uuid))) {
      // store incoming clock locally
      let clockRepo = getMongoRepository(Process);

      for (const process of incomingKV.processes) {
        assert(isUUID(process.id));
        const processExists = await clockRepo.findOne({ id: process.id });
        if (isEmpty(processExists)) {
          assert(isNotEmpty(process.id));
          await clockRepo.save(process);
        }
      }

      // send all outcomes and tasks
      const taskRepository = getMongoRepository(OCKTask);
      const tasks = await taskRepository.find({});

      const outcomeRepository = getMongoRepository(OCKOutcome);
      const outcomes = await outcomeRepository.find({});

      tasks.map((entity) => {
        delete entity.kv;
        returnRevRecord.entities.push({ type: "task", object: entity });
      });
      outcomes.map((entity) => {
        delete entity.kv;
        returnRevRecord.entities.push({ type: "outcome", object: entity });
      });

      // set kv for revisionRecord
      returnRevRecord.knowledgeVector = await getLatestKnowledgeVector();

      //console.log(util.inspect(returnRevRecord, false, null, true /* enable colors */));
      res.status(201).send(returnRevRecord);
      return;
    }

    // Case 2 : It has synced before but its clock might be older than local, send entities newer than clock
    const clock = incomingKV.processes.find((process) => process.id === uuid).clock;
    assert(!isEmpty(clock), "clock cannot be undefined at this point");

    const taskRepository = getMongoRepository(OCKTask);
    const tasks = await taskRepository.find({
      $and: [{ "kv.processes.clock": { $gt: clock } }, { "kv.processes.id": { $eq: uuid } }],
    });

    const outcomeRepository = getMongoRepository(OCKOutcome);
    const outcomes = await outcomeRepository.find({
      $and: [{ "kv.processes.clock": { $gt: clock } }, { "kv.processes.id": { $eq: uuid } }],
    });

    tasks.map((entity) => {
      delete entity.kv;
      returnRevRecord.entities.push({ type: "task", object: entity });
    });
    outcomes.map((entity) => {
      delete entity.kv;
      returnRevRecord.entities.push({ type: "outcome", object: entity });
    });

    // set kv for revisionRecord
    returnRevRecord.knowledgeVector = await getLatestKnowledgeVector();

    //console.log(util.inspect(returnRevRecord, false, null, true /* enable colors */));
    res.status(201).send(returnRevRecord);
  };

  /**
   * TODO Implement id based lookup
   * @param req
   * @param res
   */
  static getOneById = async (req: Request, res: Response) => {
    const revisionRecordRepository = getRepository(OCKRevisionRecord);
    const revisionRecords = await revisionRecordRepository.find();

    //console.log(util.inspect(revisionRecords, false, null, true /* enable colors */));
    res.send(isEmpty(revisionRecords) ? {} : revisionRecords);
  };

  static newRevisionRecord = async (req: Request, res: Response) => {
    const revRecord = req.body as OCKRevisionRecord;
    const revisionRecordRepository = getRepository(OCKRevisionRecord);

    // console.log(util.inspect(revRecord, false, null, true /* enable colors */));
    try {
      const revisionRecord = revisionRecordRepository.create(revRecord);
      await revisionRecordRepository.save(revisionRecord);

      for (let entity of revRecord.entities) {
        switch (entity.type) {
          case "task":
            const taskRepository = getMongoRepository(OCKTask);
            try {
              const taskExists = await taskRepository.findOne({ uuid: entity.object.uuid });
              // if task exists, don't overwrite
              if (isEmpty(taskExists)) {
                const task = taskRepository.create(entity.object);
                task.kv = await getLatestKnowledgeVector();
                console.log(util.inspect(task, false, null, true /* enable colors */));
                await taskRepository.save(task);
                //await createOrIncrementClock();
              }
            } catch (e) {
              res.status(409).send("Task exists");
              return;
            }
            break;
          case "outcome": {
            const outcomeRepository = getMongoRepository(OCKOutcome);
            // if this is an update, delete old version
            if (!(await isOutcomeNew(entity.object))) {
              await deleteExistingOutcomeForUpdate(entity.object);
            }
            try {
              const outcomeExists = await outcomeRepository.findOne({ uuid: entity.object.uuid });
              // if outcome exists, don't overwrite. Update scenario was handled above
              if (isEmpty(outcomeExists)) {
                const outcome = outcomeRepository.create(entity.object);
                outcome.kv = await getLatestKnowledgeVector();
                console.log(util.inspect(outcome, false, null, true /* enable colors */));
                await outcomeRepository.save(outcome);
                //await createOrIncrementClock();
              }
            } catch (e) {
              res.status(409).send("Error storing outcome");
              return;
            }
            break;
          }
          case "careplan":
          case "contact":
          case "patient": {
            res.status(501).send("Unimplemented");
            return;
          }
          default: {
            res.status(400).send("Bad request");
            return;
          }
        }
      }
    } catch (e) {
      res.status(409).send("Error processing request");
      return;
    }

    await mergeKnowledgeVectors(revRecord.knowledgeVector);
    await createOrIncrementClock(); // increment after merging a revision

    //If all ok, send 201 response
    res.status(201).send("RevisionRecord stored");
  };

  // Delete all revisionRecords in the collection
  static deleteRevisionRecords = async (req: Request, res: Response) => {
    try {
      await getMongoRepository(OCKRevisionRecord).deleteMany({});
      await getMongoRepository(OCKTask).deleteMany({});
      await getMongoRepository(OCKOutcome).deleteMany({});
    } catch (e) {
      res.status(201).send("Does not exist");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("RevisionRecords deleted");
  };
}

export default RevisionRecordController;
