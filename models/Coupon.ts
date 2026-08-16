import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const CouponSchema = new Schema({
  code: { type: String, required: true, uppercase: true, unique: true, index: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  startDate: String,
  expiryDate: String,
  active: { type: Boolean, default: true },
}, { timestamps: true })

export type Coupon = InferSchemaType<typeof CouponSchema> & { _id: mongoose.Types.ObjectId }
export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema)
