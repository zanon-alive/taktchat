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
  DataType,
  HasMany
} from "sequelize-typescript";
import Contact from "./Contact";
import Message from "./Message";

import Plan from "./Plan";
import Queue from "./Queue";
import Setting from "./Setting";
import Ticket from "./Ticket";
import TicketTraking from "./TicketTraking";
import User from "./User";
import UserRating from "./UserRating";
import Whatsapp from "./Whatsapp";
import CompaniesSettings from "./CompaniesSettings";
import Invoices from "./Invoices";

@Table
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  phone: string;

  @Column
  email: string;

  @Column({ defaultValue: "" })
  document: string;

  @Column({ defaultValue: "" })
  paymentMethod: string;

  @Column
  lastLogin: Date;

  @Column
  status: boolean;

  @Column
  dueDate: string;

  @Column
  recurrence: string;

  @Column({
    type: DataType.JSONB
  })
  schedules: [];

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  folderSize: string;

  @Column
  numberFileFolder: string;

  @Column
  updatedAtFolder: string;

  @Column({
    type: DataType.STRING,
    defaultValue: "direct"
  })
  type: "platform" | "direct" | "whitelabel";

  @ForeignKey(() => Company)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  parentCompanyId: number | null;

  @BelongsTo(() => Company, "parentCompanyId")
  parentCompany: Company;

  @Column({ defaultValue: false })
  accessBlockedByParent: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true })
  trialDaysForChildCompanies: number | null;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  signupToken: string | null;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  siteChatToken: string | null;

  @HasMany(() => Company, "parentCompanyId")
  childCompanies: Company[];

  @HasMany(() => User, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  users: User[];

  @HasMany(() => UserRating, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  userRatings: UserRating[];

  @HasMany(() => Queue, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  queues: Queue[];

  @HasMany(() => Whatsapp, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  whatsapps: Whatsapp[];

  @HasMany(() => Message, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  messages: Message[];

  @HasMany(() => Contact, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  contacts: Contact[];

  @HasMany(() => Setting, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  settings: Setting[];

  @HasMany (() => CompaniesSettings, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  companieSettings: CompaniesSettings;

  @HasMany(() => Ticket, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  tickets: Ticket[];

  @HasMany(() => TicketTraking, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  ticketTrankins: TicketTraking[];

  @HasMany(() => Invoices, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  invoices: Invoices[];
}

export default Company;
