import {
  Table,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Company from "./Company";

@Table({ tableName: "PartnerBillingSnapshots", timestamps: true, updatedAt: false })
class PartnerBillingSnapshot extends Model<PartnerBillingSnapshot> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  partnerId: number;

  @BelongsTo(() => Company, { foreignKey: "partnerId" })
  partner: Company;

  @Column
  periodStart: Date;

  @Column
  periodEnd: Date;

  @Column
  childCompaniesCount: number;

  @Column
  activeLicensesCount: number;

  @Column
  totalAmountDue: number;

  @CreatedAt
  createdAt: Date;
}

export default PartnerBillingSnapshot;
