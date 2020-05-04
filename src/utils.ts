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

import { KnowledgeVector, Process } from "./entity/KnowledgeVector";
import { getMongoRepository } from "typeorm";
import { OCKOutcome } from "./entity/OCKOutcome";
import { UUID } from "./entity/uuid";
import uuid_lib = require("uuid");
import { isNotEmpty } from "class-validator";
import assert from "assert";

export let uuid: string = "";

/**
 * This will set/save the UUID for the backend across microservice re-starts. While it would be functionally OK to generate a UUID each time
 * the microservice starts, it would lead to vector clock pollution, wasted space (as clocks get stored with entities) and a lot of network traffic
 * since the backend sync logic wouldn't find the clock with newly generated UUID in the vec clocks coming in from the frontend for a new microservice instance
 */
export async function getLocalUUID(): Promise<string> {
  if (uuid) {
    // optimization to prevent DB look up each time
    return uuid;
  }

  let repo = getMongoRepository(UUID);
  let mongoUuid = await repo.find();
  assert(mongoUuid.length < 2, "Multiple UUIDs found for local db");
  if (!mongoUuid.length) {
    const new_uuid = uuid_lib.v4().toUpperCase();
    await repo.insertOne(new UUID(new_uuid));
    return new_uuid;
  }
  assert(isNotEmpty(mongoUuid[0].uuid));
  return mongoUuid[0].uuid;
}

/**
 *
 * @param increment
 */
export async function createOrIncrementClock(increment: boolean = true) {
  uuid = await getLocalUUID();
  console.log("UUID : " + uuid);
  let repo = getMongoRepository(Process);
  let clock = await repo.findOne({ id: uuid });
  assert(uuid);
  if (!clock) await repo.insertOne(new Process(uuid, 0));
  else {
    if (increment) {
      assert(uuid);
      await repo.updateOne({ id: uuid }, { $inc: { clock: 1 } }, { upsert: true });
    }
  }
}

/**
 * Adds new (unknown) clocks to local db. This method does not increment any clocks.
 *
 * @param processes clocks (typically from a knowledge vector )
 */
export async function mergeNewClocksWithExisting(processes: Process[]) {
  let clockRepo = getMongoRepository(Process);

  for (const process of processes) {
    const processExists = await clockRepo.findOne({ id: process.id });
    if (isNotEmpty(processExists)) {
      assert(isNotEmpty(process.id));
      await clockRepo.save(process);
    }
  }
}

/**
 * Gets local knowledge vector (i.e all clocks stores in MongoDB)
 */
export async function getLatestKnowledgeVector(): Promise<KnowledgeVector> {
  const clocks = await getMongoRepository(Process).find();
  //console.log(clocks);
  assert(clocks.length > 0, "At least one clock must always exist");
  let kv = new KnowledgeVector();

  // paranoid check to ensure quality of UUID data in db
  clocks.forEach((process) => assert(isNotEmpty(process.id)));

  // Removes _id field
  kv.processes = clocks.map(({ _id, ...item }) => item) as Process[];
  return kv;
}

/**
 * Checks if outcome exists in db
 * @param outcome
 */
export async function isOutcomeNew(outcome: OCKOutcome): Promise<boolean> {
  const outcomeExists = await getMongoRepository(OCKOutcome).findOne({
    taskUUID: outcome.taskUUID,
    taskOccurrenceIndex: outcome.taskOccurrenceIndex,
  });
  return isNotEmpty(outcomeExists);
}

/**
 * This deletes outcomes based on matching taskUUID and taskOccurrenceIndex.
 * This does not delete based on UUID as the UUID for an updated outcome will be different since its an un-versioned object
 * @param outcome
 */
export async function deleteExistingOutcomeForUpdate(outcome: OCKOutcome) {
  await getMongoRepository(OCKOutcome).deleteOne({
    taskUUID: outcome.taskUUID,
    taskOccurrenceIndex: outcome.taskOccurrenceIndex,
  });
}
