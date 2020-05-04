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

import { Column, CreateDateColumn, Entity, ObjectID, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { IsDefined, IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { jsonObject, jsonMember, jsonArrayMember } from "typedjson";

@Entity()
@jsonObject()
export class Process {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  @IsString()
  @jsonMember
  @IsNotEmpty()
  id: string;

  @Column()
  @IsDefined()
  @jsonMember
  @IsNotEmpty()
  clock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(id: string, clock: number) {
    this.id = id;
    this.clock = clock;
  }

  lessThanOrEqualTo(process: Process): boolean {
    if (this.id === process.id) {
      if (this.clock > process.clock) {
        return false;
      }
    }
    return true;
  }

  greaterThan(process: Process): boolean {
    return !this.lessThanOrEqualTo(process);
  }
}

@jsonObject
export class KnowledgeVector {
  @Column({ type: Process, array: true })
  @IsDefined()
  @jsonArrayMember(Process)
  @ValidateNested()
  @IsNotEmpty()
  processes: Process[];

  /**
   * Returns true if *strictly* less than p
   *
   * Here processes1.lessThan(processes2) would return true
   * processes1 = [{ id : "A" , clock : 1 }, { id : "B" , clock : 2}]
   * processes2 = [{ id : "A" , clock : 2 }, { id : "B" , clock : 3}, { id : "C" , clock : 1}]
   *
   * but here, it would not as id's A would be equal to (but not less than), even though id : B is less than
   * processes1 = [{ id : "A" , clock : 1 }, { id : "B" , clock : 2}]
   * processes2 = [{ id : "A" , clock : 1 }, { id : "B" , clock : 3}, { id : "C" , clock : 1}]
   *
   * @param rhs
   */
  lessThanOrEqualTo(rhs: KnowledgeVector) {
    for (let lhsProcess of this.processes) {
      for (let rhsProcess of rhs.processes)
        if (lhsProcess.greaterThan(rhsProcess)) {
          return false;
        }
    }
    return true;
  }
}
