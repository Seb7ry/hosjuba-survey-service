import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type SessionDocument = Session & Document;

@Schema()
export class Session {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    accessToken: string;

    @Prop({ required: true })
    position: string;

    @Prop({ required: true })
    department: string;

    @Prop({ required:true })
    expiredDateAt: Date;
}
export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ username: 1 });
SessionSchema.index({ expiredDateAt: 1 }, { expireAfterSeconds: 0 });