import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const BannerSchema = new Schema({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  buttonText: { type: String, default: 'Explore the edit' },
  buttonLink: { type: String, default: '#shop' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export type Banner = InferSchemaType<typeof BannerSchema> & { _id: mongoose.Types.ObjectId }
export const BannerModel = mongoose.models.Banner || mongoose.model('Banner', BannerSchema)
