import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type EquipTypeDocument = EquipType & Document;

@Schema()
export class EquipType {
    @Prop({ required: true })
    name: string;
}
export const EquipTypeSchema = SchemaFactory.createForClass(EquipType);

EquipTypeSchema.index({ name: 1 });