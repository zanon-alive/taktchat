import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  AllowNull,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import Plan from "./Plan";

@Table({ tableName: "Licenses" })
class License extends Model<License> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @Column({ defaultValue: "active" })
  status: string;

  @Column
  startDate: Date;

  @AllowNull(true)
  @Column
  endDate: Date | null;

  @AllowNull(true)
  @Column
  amount: string;

  @AllowNull(true)
  @Column
  recurrence: string;

  @AllowNull(true)
  @Column
  activatedAt: Date | null;

  @Default(0)
  @Column
  paidMonths: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default License;
