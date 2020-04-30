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
import { isUndefined } from "util";
import {
  createOrIncrementClock,
  getLatestKnowledgeVector,
  isOutcomeNew,
  deleteExistingOutcomeForUpdate,
} from "../utils";

class RevisionRecordController {
  static listAll = async (req: Request, res: Response) => {
    const clock = Number(isUndefined(req.query.clock) ? 0 : req.query.clock);
    const revisionRecordRepository = getRepository(OCKRevisionRecord);
    //const revisionRecords: OCKRevisionRecord[] = await revisionRecordRepository.find({"knowledgeVector.processes.clock": {$gte: clock}});

    // FIXME : send only latest rev record
    const revisionRecords: OCKRevisionRecord[] = await revisionRecordRepository.find({
      $query: {},
      $orderby: { "knowledgeVector.processes.clock": -1 },
    });
    //console.log(util.inspect(revisionRecords , false, null, true /* enable colors */));

    let returnRevRecord = new OCKRevisionRecord();
    returnRevRecord.entities = [];

    // merge revision records greater than clock, but use clock of thee newest record
    // for (let entity of revisionRecords) {
    //   entity.entities.map((entity) => returnRevRecord.entities.push(entity));
    // }
    returnRevRecord.knowledgeVector = await getLatestKnowledgeVector();
    //console.log(util.inspect(revisionRecords.length == 0 ? returnRevRecord : revisionRecords[revisionRecords.length-1], false, null, true /* enable colors */));
    res.status(201).send(revisionRecords.length == 0 ? returnRevRecord : revisionRecords[revisionRecords.length - 1]);
  };

  static getOneById = async (req: Request, res: Response) => {
    const clock = isUndefined(req.query.clock) ? 0 : req.query.clock;
    const revisionRecordRepository = getRepository(OCKRevisionRecord);
    const revisionRecords = await revisionRecordRepository.find();

    console.log(util.inspect(revisionRecords, false, null, true /* enable colors */));
    res.send(isUndefined(revisionRecords) ? {} : revisionRecords);
  };

  static newRevisionRecord = async (req: Request, res: Response) => {
    const revRecord = req.body as OCKRevisionRecord;
    const revisionRecordRepository = getRepository(OCKRevisionRecord);

    console.log(util.inspect(revRecord, false, null, true /* enable colors */));
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
              if (isUndefined(taskExists)) {
                const task = taskRepository.create(entity.object);
                await taskRepository.save(task);
                await createOrIncrementClock();
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
              if (isUndefined(outcomeExists)) {
                const outcome = outcomeRepository.create(entity.object);
                await outcomeRepository.save(outcome);
                await createOrIncrementClock();
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
            break;
          }
          default: {
            res.status(400).send("Bad request");
            break;
          }
        }
      }
    } catch (e) {
      res.status(409).send("Error processing request");
      return;
    }

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
