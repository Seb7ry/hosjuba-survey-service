import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type EquipmentDocument = Equipment & Document;

@Schema()
export class Equipment {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    brand: string;

    @Prop({ required: true })
    model: string;

    @Prop({ required: true })
    type: string;

    @Prop()
    serial?: string;

    @Prop()
    numberInventory?: string;
}

export const EquipmentSchema = SchemaFactory.createForClass(Equipment);

EquipmentSchema.index({ name: 1 });