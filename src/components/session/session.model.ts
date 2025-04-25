import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type SessionDocument = Session & Document;

@Schema()
export class Session {
    @Prop({ required:true })
    username: string;

    @Prop({ required:true })
    accessToken: string;

    @Prop({ required:true })
    groupp: string;

    @Prop({ required:true })
    expiredDateAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);