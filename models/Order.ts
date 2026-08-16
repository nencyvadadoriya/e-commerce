import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: String,
  brand: String,
  category: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false })

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  shippingAddress: {
    line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: String,
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Confirmed' },
}, { timestamps: true })

export type Order = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId }
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema)
