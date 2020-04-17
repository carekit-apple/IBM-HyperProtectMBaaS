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

import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { SchemaVersion } from "./SchemaVersion";
import { Schedule } from "./Schedule";
import { Timezone } from "./Timezone";
import { IsNotEmpty } from "class-validator";

type UUID = string;
type Date = number;
type OCKNote = any[];
type OCKSemanticVersion = number;

@Entity()
export class OCKTask {
  @ObjectIdColumn()
  _id?: ObjectID;

  @Column((type) => SchemaVersion)
  schemaVersion?: SchemaVersion;

  @Column()
  createdDate?: number;

  @IsNotEmpty()
  @Column()
  id: string;

  @Column()
  instructions: string;

  @Column()
  impactsAdherence: boolean;

  @IsNotEmpty()
  @Column((type) => Schedule)
  schedule: Schedule;

  @Column()
  groupIdentifier: string;

  @Column()
  tags: string;

  @IsNotEmpty()
  @Column()
  effectiveDate: Date;

  @Column()
  deletedDate: Date;

  @Column()
  uuid: UUID;

  @Column()
  nextVersionUUID: UUID;

  @Column()
  previousVersionUUID: UUID;

  @Column()
  createdDate: Date;

  @Column()
  updatedDate: Date;

  @Column()
  remoteID: string;

  @Column()
  source: string;

  @Column()
  userInfo: Map<string, string>;

  @Column()
  asset: string;

  @Column({ type: "OCKNote", array: true })
  notes: OCKNote[]; // TODO

  @Column((type) => Timezone)
  timezone: Timezone;
}
