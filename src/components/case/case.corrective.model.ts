import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type CaseCorrectiveDocument = CaseCorrective & Document;

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
export class CaseCorrective {

  @Prop()
  caseNumber: string;

  @Prop({ required: true })
  toRating: boolean;

  @Prop()
  rated: boolean;

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

export const CaseCorrectiveSchema = SchemaFactory.createForClass(CaseCorrective);

CaseCorrectiveSchema.index({ caseNumber: 1 }, { unique: true });
CaseCorrectiveSchema.index({ typeCase: 1 });
CaseCorrectiveSchema.index({ serviceType: 1 });
CaseCorrectiveSchema.index({ dependency: 1 });
CaseCorrectiveSchema.index({ status: 1 });
CaseCorrectiveSchema.index({ reportedAt: -1 });
CaseCorrectiveSchema.index({ "reportedBy._id": 1 });
CaseCorrectiveSchema.index({ "assignedTechnician._id": 1 });
CaseCorrectiveSchema.index({
  reportedAt: 1,
  status: 1
});
CaseCorrectiveSchema.index({
  dependency: 1,
  serviceType: 1,
  status: 1
});
CaseCorrectiveSchema.index({
  "effectivenessRating.value": 1,
  "satisfactionRating.value": 1
});
