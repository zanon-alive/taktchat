import {
    Table,
    Column,
    CreatedAt,
    UpdatedAt,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    Default,
    AllowNull,
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";
import Company from "./Company";

@Table({ tableName: "ConnectionLogs" })
class ConnectionLog extends Model<ConnectionLog> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => Whatsapp)
    @Column
    whatsappId: number;

    @BelongsTo(() => Whatsapp)
    whatsapp: Whatsapp;

    @ForeignKey(() => Company)
    @Column
    companyId: number;

    @BelongsTo(() => Company)
    company: Company;

    @Column(DataType.STRING)
    eventType: string;

    @AllowNull(true)
    @Column(DataType.JSON)
    eventData: any;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    statusCode: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    errorMessage: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    diagnosis: string;

    @AllowNull(true)
    @Column(DataType.JSON)
    suggestions: string[];

    @Default("info")
    @Column(DataType.ENUM("info", "warning", "error", "critical"))
    severity: string;

    @Default(DataType.NOW)
    @Column(DataType.DATE)
    timestamp: Date;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default ConnectionLog;
