import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull
} from "sequelize-typescript";
import Company from "./Company";
import Queue from "./Queue";
import Tag from "./Tag";
import Whatsapp from "./Whatsapp";

@Table({ tableName: "ChannelEntryConfigs" })
class ChannelEntryConfig extends Model<ChannelEntryConfig> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  entrySource: string;

  @AllowNull
  @ForeignKey(() => Queue)
  @Column
  defaultQueueId: number;

  @BelongsTo(() => Queue)
  defaultQueue: Queue;

  @AllowNull
  @ForeignKey(() => Tag)
  @Column
  defaultTagId: number;

  @BelongsTo(() => Tag)
  defaultTag: Tag;

  @AllowNull
  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ChannelEntryConfig;
