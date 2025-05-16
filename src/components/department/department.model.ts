import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type DepartmentDocument = Department & Document;

@Schema()
export class Department {
    @Prop({ required: true, unique: true})
    name: string;
}
export const DepartmentSchema = SchemaFactory.createForClass(Department);

DepartmentSchema.index({ name: 1 });