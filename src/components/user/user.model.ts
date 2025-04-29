import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true})
    _id: string;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    department: string;

    @Prop({ required: true })
    position: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1 });
UserSchema.index({ name: 1 });
UserSchema.pre('save', async function (next) {
    const user = this as UserDocument;
    if (user.isModified('password')) {
        const salt = await bcrypt.genSalt(10); 
        user.password = await bcrypt.hash(user.password, salt);
    }
    next();
});