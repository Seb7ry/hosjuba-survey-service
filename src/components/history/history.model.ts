import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type HistoryDocument = History & Document;

@Schema()
export class History {
    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    timestamp: Date;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    document: string;

    @Prop({ required: true })
    message: string;
}
export const HistorySchema = SchemaFactory.createForClass(History);