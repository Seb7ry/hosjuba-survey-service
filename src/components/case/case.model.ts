import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type CaseDocument = Case & Document;

@Schema({ _id: false })
export class Rating {
  @Prop({ min: 0, max: 4 })
  value: number;
}

@Schema({ _id: false })
export class UserRef {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop()
  department?: string;

  @Prop()
  signature?: string;
}

@Schema({ timestamps: true })
export class Case {

  @Prop()
  caseNumber: string;

  @Prop({ required: true })
  toRating: boolean;

  @Prop({
    required: true
  })
  typeCase: string;

  @Prop({ required: true })
  serviceType: string;

  @Prop({ required: true })
  dependency: string;

  @Prop({
    default: "Abierto",
    enum: ["Abierto", "En proceso", "Cerrado", "En escalamiento"]
  })
  status: string;

  @Prop({ default: Date.now })
  reportedAt: Date;

  @Prop()
  observations: string;

  @Prop({ type: UserRef })
  reportedBy: UserRef;

  @Prop({ type: UserRef })
  assignedTechnician: UserRef;

  @Prop({ type: Rating })
  effectivenessRating?: Rating;

  @Prop({ type: Rating })
  satisfactionRating?: Rating;

  @Prop({ type: MongooseSchema.Types.Mixed })
  serviceData?: any;
}

export const CaseSchema = SchemaFactory.createForClass(Case);

CaseSchema.index({ caseNumber: 1 }, { unique: true });
CaseSchema.index({ typeCase: 1 });
CaseSchema.index({ serviceType: 1 });
CaseSchema.index({ dependency: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ reportedAt: -1 });
CaseSchema.index({ "reportedBy._id": 1 });
CaseSchema.index({ "assignedTechnician._id": 1 });
CaseSchema.index({
  reportedAt: 1,
  status: 1
});
CaseSchema.index({
  dependency: 1,
  serviceType: 1,
  status: 1
});
CaseSchema.index({
  "effectivenessRating.value": 1,
  "satisfactionRating.value": 1
});
