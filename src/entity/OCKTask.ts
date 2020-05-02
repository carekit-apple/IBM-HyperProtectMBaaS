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

import { Column, Entity, ObjectIdColumn, ObjectID, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Timezone } from "./Timezone";
import { KnowledgeVector } from "./KnowledgeVector";

export class Note {
  @Column()
  author: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column((type) => Timezone)
  timezone: Timezone;
}

export class Interval {
  @Column()
  minute: number;

  @Column()
  hour: number;

  @Column()
  second: number;

  @Column()
  day: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column()
  weekOfYear: number;
}

export class SchemaVersion {
  @Column()
  majorVersion: number;

  @Column()
  minorVersion: number;

  @Column()
  patchNumber: number;
}

export class UserInfo {
  @Column()
  user: string;
}

export class Duration {
  @Column()
  seconds: number;

  @Column()
  isAllDay: boolean;
}
export class Element {
  @Column()
  text: string;

  @Column((type) => Duration)
  duration: Duration;

  @Column((type) => Interval)
  interval: Interval;

  @Column()
  targetValues: any[];

  @Column((type) => Timezone)
  timezone: Timezone;

  @Column()
  start: number;
}

export class Schedule {
  @Column({ type: Element, array: true })
  elements: Element[];
}

@Entity()
export class OCKTask {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  title: string;

  @Column({ array: true })
  tags: string[];

  @Column()
  updatedDate: number;

  @Column()
  uuid: string;

  @Column()
  instructions: string;

  @Column((type) => Schedule)
  schedule: Schedule;

  @Column((type) => UserInfo)
  userInfo: UserInfo;

  @Column()
  remoteID: string;

  @Column()
  carePlanUUID: string;

  @Column()
  nextVersionUUID: string;

  @Column()
  asset: string;

  @Column()
  createdDate: number;

  @Column((type) => SchemaVersion)
  schemaVersion: SchemaVersion;

  @Column()
  impactsAdherence: boolean;

  @Column((type) => Timezone)
  timezone: Timezone;

  @Column({ type: Note, array: true })
  notes: Note[];

  @Column()
  effectiveDate: number;

  @Column()
  groupIdentifier: string;

  @Column()
  previousVersionUUID: string;

  @Column()
  deletedDate: number;

  @Column((type) => KnowledgeVector)
  kv: KnowledgeVector;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
