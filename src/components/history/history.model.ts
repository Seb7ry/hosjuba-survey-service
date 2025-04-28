    import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

    export type HistoryDocument = History & Document;

    @Schema()
    export class History {
        @Prop({ required: true })
        timestamp: Date;

        @Prop({ required: true})
        expirationDate: Date;

        @Prop({ required: true })
        username: string;

        @Prop({ required: true })
        message: string;
    }
    export const HistorySchema = SchemaFactory.createForClass(History);
    HistorySchema.index({ username: 1 });
    HistorySchema.index({ timestamp: 1 });
    HistorySchema.index({ expirationDate: 1}, { expireAfterSeconds: 0 });