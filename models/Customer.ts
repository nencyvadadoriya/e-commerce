import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, default: '' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true })

export type Customer = InferSchemaType<typeof CustomerSchema> & { _id: mongoose.Types.ObjectId }
export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
