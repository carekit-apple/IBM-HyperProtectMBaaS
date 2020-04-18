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
import { getRepository } from "typeorm";
import { OCKRevisionRecord } from "../entity/OCKRevisionRecord";
import { OCKTask } from "../entity/OCKTask";
import { OCKOutcome } from "../entity/OCKOutcome";

class RevisionRecordController {
  static listAll = async (req: Request, res: Response) => {
    const revisionRecordRepository = getRepository(OCKRevisionRecord);
    const revisionRecords = await revisionRecordRepository.find();

    //console.log(util.inspect(revisionRecords, false, null, true /* enable colors */));
    res.send(revisionRecords);
  };

  static getOneById = async (req: Request, res: Response) => {
    //todo
  };

  static newRevisionRecord = async (req: Request, res: Response) => {
    const revRecord = req.body as OCKRevisionRecord;
    const revisionRecordRepository = getRepository(OCKRevisionRecord);

    try {
      const revisionRecord = revisionRecordRepository.create(revRecord);
      await revisionRecordRepository.save(revisionRecord);

      for (let [i, entity] of revRecord.entities.entries()) {
        switch (entity.type) {
          case "task":
            const taskRepository = getRepository(OCKTask);
            try {
              const task = taskRepository.create(entity.object);
              await taskRepository.save(task);
            } catch (e) {
              res.status(409).send("Task exists");
              return;
            }
            break;
          case "outcome": {
            const outcomeRepository = getRepository(OCKOutcome);
            try {
              const outcome = outcomeRepository.create(entity.object);
              await outcomeRepository.save(outcome);
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
    const revisionRecordRepository = getRepository(OCKRevisionRecord);
    try {
      await revisionRecordRepository.deleteMany({});
    } catch (e) {
      res.status(409).send("Does not exist");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("RevisionRecords deleted");
  };
}

export default RevisionRecordController;
