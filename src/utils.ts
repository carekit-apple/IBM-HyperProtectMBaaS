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
import { isUndefined } from "util";

// FIXME : For testing until good typescript uuid es6 compatable library is available
export const uuid = "ADADC9C7-EC04-41A6-9256-422E213FBB33";

// This is used when we connect to Mongo or from put operations. Since merge operations are idempotent, its safe to increment this conservatively
export async function createOrIncrementClock() {
  let repo = getMongoRepository(KnowledgeVector);
  let kvExists = await repo.findOne({ "processes.id": uuid });
  if (isUndefined(kvExists)) await repo.insertOne(kv);
  else {
    let kv = new KnowledgeVector();
    kv.processes = [];
    let process = new Process();
    kv.processes.push(process);
    process.clock = 1;
    process.id = uuid;
    await repo.updateOne({ "processes.id": uuid }, { $inc: { "processes.$[].clock": 1 } }, { upsert: true });
  }
}

export async function getLatestKnowledgeVector(): KnowledgeVector {
  const kvExists = await getMongoRepository(KnowledgeVector).findOne({ "processes.id": uuid });
  console.assert(!isUndefined(kvExists), "Knowledge Vector should never be null");
  return kvExists;
}
// Given a an array of knowledge vectors, returns a vector with the latest clocks for the processes
export async function constructLatestKnowledgeVector(kvectors: KnowledgeVector[]) {
  for (let kv in kvectors) {
  }
}
