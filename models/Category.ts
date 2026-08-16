import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const SubcategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  active: { type: Boolean, default: true },
}, { _id: false })

const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  group: { type: String, default: 'General' },
  description: String,
  subcategories: [SubcategorySchema],
  image: String,
  active: { type: Boolean, default: true },
}, { timestamps: true })

export type Category = InferSchemaType<typeof CategorySchema> & { _id: mongoose.Types.ObjectId }
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema)
