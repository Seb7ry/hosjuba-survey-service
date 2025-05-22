import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeletedCaseDocument = DeletedCase & Document;

@Schema({ timestamps: true, collection: 'deletedcases' })
export class DeletedCase {
  @Prop({ type: Object, required: true })
  originalCase: any;

  @Prop({ required: true, default: Date.now, index: { expires: '30d' } })
  deletedAt: Date;
}

export const DeletedCaseSchema = SchemaFactory.createForClass(DeletedCase);
