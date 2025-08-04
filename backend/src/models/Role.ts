import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

const RoleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  permissions: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

const Role = mongoose.model<IRole>('Role', RoleSchema);
export default Role;