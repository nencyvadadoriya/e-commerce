import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const VariantSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: String,
  size: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  stock: { type: Number, default: 0 },
  sku: String,
  images: { type: [String], default: [] },
  image: String,
}, { _id: false })

const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  brand: { type: String, index: true },
  category: { type: String, index: true },
  subcategory: String,
  description: String,
  images: [String],
  image: String,
  originalPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  discount: Number,
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 12 },
  badge: { type: String, default: 'New' },
  tags: [String],
  variants: [VariantSchema],
  hasVariants: { type: Boolean, default: false },
  featured: Boolean,
  bestSeller: Boolean,
  newArrival: Boolean,
  active: { type: Boolean, default: true },
  sku: String,
  size: String,
  color: String,
}, { timestamps: true })

ProductSchema.index({ name: 'text', brand: 'text', category: 'text', tags: 'text' })

export type Product = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId }
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema)
