import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const SettingSchema = new Schema({
  storeName: { type: String, default: 'Nava Studio' },
  supportEmail: { type: String, default: 'support@nava.com' },
  supportPhone: { type: String, default: '+91 98765 43210' },
  currency: { type: String, default: 'INR' },
  taxRate: { type: Number, default: 18 },
  freeShippingThreshold: { type: Number, default: 999 },
  shippingFee: { type: Number, default: 99 },
  address: { type: String, default: '102 Design Quarter, Bandra West, Mumbai 400050' },
  enableCOD: { type: Boolean, default: true },
  enableCardPayment: { type: Boolean, default: true },
}, { timestamps: true })

export type Setting = InferSchemaType<typeof SettingSchema> & { _id: mongoose.Types.ObjectId }
export const SettingModel = mongoose.models.Setting || mongoose.model('Setting', SettingSchema)
