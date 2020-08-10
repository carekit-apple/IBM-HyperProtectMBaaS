import { Column } from "typeorm";
import { Timezone } from "./Timezone";
import { Schedule } from "./Schedule";
import { Value } from "./Value";
import { ColumnEmbeddedOptions } from "typeorm/decorator/options/ColumnEmbeddedOptions";

export class OCKObject {
  @Column()
  createdDate: number;

  @Column()
  id?: string;

  @Column()
  title?: string;

  @Column()
  uuid: string;

  @Column()
  impactsAdherence?: boolean;

  @Column()
  updatedDate: number;

  @Column((type) => Timezone)
  timezone: Timezone;

  @Column()
  effectiveDate?: number;

  @Column((type) => Schedule)
  schedule?: Schedule;

  @Column((type)=> Value, {array: true} as ColumnEmbeddedOptions)
  values?: Value[];

  @Column()
  taskUUID?: string;

  @Column()
  taskOccurrenceIndex?: number;
}
