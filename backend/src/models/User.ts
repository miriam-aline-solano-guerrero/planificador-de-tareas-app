import mongoose, { Schema, Document, Types } from 'mongoose';
//import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: mongoose.Types.ObjectId;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
});

UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return enteredPassword === this.password;
};

export default mongoose.model<IUser>('User', UserSchema);