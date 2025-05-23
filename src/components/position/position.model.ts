import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PositionDocument = Position & Document;

@Schema()
export class Position {
    @Prop({ required: true, unique: true })
    name: string;
}
export const PositionSchema = SchemaFactory.createForClass(Position);