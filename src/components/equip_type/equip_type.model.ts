import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type EquipTypeDocument = EquipType & Document;

@Schema()
export class EquipType {
    @Prop({ required: true, unique: true })
    name: string;
}
export const EquipTypeSchema = SchemaFactory.createForClass(EquipType);