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

import { Column, ObjectID, ObjectIdColumn, Entity, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Timezone } from "./Timezone";
import { SchemaVersion } from "./SchemaVersion";
import { KnowledgeVector } from "./KnowledgeVector";

export class Note {
  @Column()
  author: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column("Timezone")
  timezone: Timezone;
}

export class UserInfo {
  @Column()
  user: string;
}

export class Value {
  @Column("SchemaVersion")
  schemaVersion: SchemaVersion;

  @Column()
  uuid: string;

  @Column()
  index: number;

  @Column()
  createdDate: Date;

  @Column("string")
  tags: string;

  @Column()
  updatedDate: Date;

  @Column()
  units: string;

  @Column()
  value: number;

  @Column()
  type: string;

  @Column()
  remoteID: string;

  @Column()
  group: string;

  @Column()
  source: string;

  @Column("Timezone")
  timezone: Timezone;

  @Column()
  kind: string;

  @Column("UserInfo")
  userInfo: UserInfo;
}

@Entity()
export class OCKOutcome {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  uuid: string;

  @Column()
  createdDate: number;

  @Column("string")
  tags: string[];

  @Column()
  updatedDate: number;

  @Column()
  source: string;

  @Column("Value")
  values: Value[];

  @Column()
  taskUUID: string;

  @Column()
  remoteID: string;

  @Column()
  taskOccurrenceIndex: number;

  @Column()
  asset: string;

  @Column()
  groupIdentifier: string;

  @Column()
  deletedDate: number;

  @Column("Note")
  notes: Note[];

  @Column("Timezone")
  timezone: Timezone;

  @Column("UserInfo")
  userInfo: UserInfo;

  @Column("KnowledgeVector")
  kv: KnowledgeVector;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
