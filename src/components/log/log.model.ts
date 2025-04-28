import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type LogDocument = Log & Document;

@Schema()
export class Log {
    @Prop({ required: true })
    level: string;

    @Prop({ required: true })
    timestamp: Date;

    @Prop({ required: true })
    expirationDate: Date;
    
    @Prop({ required: true })
    document: string;

    @Prop({ required: true })
    method: string;
    
    @Prop({ required: true })
    message: string;
}
export const LogSchema = SchemaFactory.createForClass(Log);
LogSchema.index({ level: 1 });
LogSchema.index({ timestamp: 1 });
LogSchema.index({ expirationDate: 1 }, { expireAfterSeconds: 0});