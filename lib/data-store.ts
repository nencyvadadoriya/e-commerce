import fs from 'fs'
import path from 'path'
import { connectToDatabase } from '@/lib/db'
import { ProductModel } from '@/models/Product'
import { CategoryModel } from '@/models/Category'
import { OrderModel } from '@/models/Order'
import { CustomerModel } from '@/models/Customer'
import { BannerModel } from '@/models/Banner'
import { CouponModel } from '@/models/Coupon'
import { SettingModel } from '@/models/Setting'

export type ProductVariant = {
  id: string
  name: string
  color?: string
  size?: string
  price?: number
  originalPrice?: number
  discount?: number
  stock: number
  sku?: string
  images: string[]
  image?: string
}

export type ProductItem = {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  subcategory?: string
  originalPrice: number
  sellingPrice: number
  discount?: number
  stock: number
  rating: number
  reviewCount: number
  image: string
  images: string[]
  badge: string
  description?: string
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  active?: boolean
  sku?: string
  size?: string
  color?: string
  hasVariants?: boolean
  variants?: ProductVariant[]
  tags?: string[]
}

export type CategoryItem = {
  id: string
  name: string
  slug: string
  group: string
  description?: string
  subcategories: { name: string; slug: string; description?: string; active: boolean }[]
  active: boolean
}

export type OrderItem = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: { line: string; city: string; pincode: string }
  items: {
    productId: string
    variantId?: string
    variantName?: string
    name: string
    image?: string
    brand?: string
    category?: string
    price: number
    quantity: number
  }[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  paymentStatus: 'Paid' | 'Pending' | 'Failed'
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  createdAt: string
}

export type CustomerItem = {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  status: 'Active' | 'Inactive'
  createdAt: string
}

export type BannerItem = {
  id: string
  title: string
  eyebrow: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  active: boolean
  order: number
}

export type CouponItem = {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  startDate: string
  expiryDate: string
  active: boolean
}

export type StoreSettings = {
  storeName: string
  supportEmail: string
  supportPhone: string
  currency: string
  taxRate: number
  freeShippingThreshold: number
  shippingFee: number
  address: string
  enableCOD: boolean
  enableCardPayment: boolean
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pages: number
}

const DATA_DIR = path.join(process.cwd(), 'data')
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
} catch {
}

function loadPersisted<T>(filename: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      if (content.trim()) {
        return JSON.parse(content) as T
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8')
    return fallback
  } catch (err) {
    console.error(`Error loading persistent file ${filename}:`, err)
    return fallback
  }
}

function savePersisted<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error(`Error saving persistent file ${filename}:`, err)
  }
}

const initialProducts: ProductItem[] = [
  {
    id: '1',
    name: 'Linen Relaxed Shirt',
    slug: 'linen-relaxed-shirt',
    brand: 'Northline',
    category: 'Men',
    subcategory: 'Shirts',
    originalPrice: 2499,
    sellingPrice: 1499,
    discount: 40,
    rating: 4.8,
    reviewCount: 128,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
    ],
    badge: 'Bestseller',
    active: true,
    sku: 'NL-SH-01',
    hasVariants: true,
    variants: [
      {
        id: 'var-1-blue',
        name: 'Navy Blue',
        color: 'Navy Blue',
        size: 'XL',
        price: 1599,
        originalPrice: 2499,
        stock: 6,
        sku: 'NL-SH-01-NAV',
        images: [
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Sculpted Shoulder Bag',
    slug: 'sculpted-shoulder-bag',
    brand: 'Mysa Studio',
    category: 'Accessories',
    subcategory: 'Handbags',
    originalPrice: 3299,
    sellingPrice: 2199,
    discount: 33,
    rating: 4.7,
    reviewCount: 86,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85'],
    badge: 'New',
    description: 'Structured silhouette in vegan leather with antique brass finish hardware and interior organizing pocket.',
    active: true,
    sku: 'MS-SB-02',
    hasVariants: true,
    variants: [
      {
        id: 'var-2-tan',
        name: 'Tan Caramel',
        color: 'Caramel',
        price: 2199,
        originalPrice: 3299,
        stock: 7,
        sku: 'MS-SB-02-TAN',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85'],
      },
      {
        id: 'var-2-black',
        name: 'Noir Black',
        color: 'Black',
        price: 2199,
        originalPrice: 3299,
        stock: 5,
        sku: 'MS-SB-02-BLK',
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85'],
      },
    ],
  },
  {
    id: '3',
    name: 'Everyday Knit Set',
    slug: 'everyday-knit-set',
    brand: 'Aster & Row',
    category: 'Women',
    subcategory: 'Co-ords',
    originalPrice: 2899,
    sellingPrice: 1899,
    discount: 34,
    rating: 4.9,
    reviewCount: 214,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85'],
    badge: 'Trending',
    description: 'Fine-ribbed modal blend matching set designed for seamless day-to-evening dressing.',
    active: true,
    sku: 'AR-KS-03',
  },
  {
    id: '4',
    name: 'Court Classic Sneakers',
    slug: 'court-classic-sneakers',
    brand: 'Nava Studio',
    category: 'Footwear',
    subcategory: 'Sneakers',
    originalPrice: 4299,
    sellingPrice: 2999,
    discount: 30,
    rating: 4.6,
    reviewCount: 64,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=85'],
    badge: 'Popular',
    description: 'Minimalist low-top leather sneaker with cushioned memory foam insole and vulcanized rubber sole.',
    active: true,
    sku: 'NV-SN-04',
  },
  {
    id: '5',
    name: 'Oversized Trench Coat',
    slug: 'oversized-trench-coat',
    brand: 'Northline',
    category: 'Men',
    subcategory: 'Jackets',
    originalPrice: 5999,
    sellingPrice: 3999,
    discount: 33,
    rating: 4.9,
    reviewCount: 43,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85'],
    badge: 'Premium',
    description: 'Water-resistant cotton twill trench coat with raglan sleeves and belted waist.',
    active: true,
    sku: 'NL-TC-05',
  },
  {
    id: '6',
    name: 'Minimal Gold Hoops',
    slug: 'minimal-gold-hoops',
    brand: 'Mysa Studio',
    category: 'Jewellery',
    subcategory: 'Earrings',
    originalPrice: 1599,
    sellingPrice: 999,
    discount: 38,
    rating: 4.8,
    reviewCount: 172,
    stock: 31,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85'],
    badge: 'Bestseller',
    description: '18k gold-plated hypoallergenic lightweight everyday hoops.',
    active: true,
    sku: 'MS-GH-06',
  },
  {
    id: '7',
    name: 'Soft Cotton Co-ord',
    slug: 'soft-cotton-co-ord',
    brand: 'Aster & Row',
    category: 'Women',
    subcategory: 'Dresses',
    originalPrice: 3199,
    sellingPrice: 2099,
    discount: 34,
    rating: 4.7,
    reviewCount: 97,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85'],
    badge: 'New',
    description: 'Chic lounge co-ord set with elasticated waist and cropped tee.',
    active: true,
    sku: 'AR-CC-07',
  },
  {
    id: '8',
    name: 'Everyday Carry Tote',
    slug: 'everyday-carry-tote',
    brand: 'Mysa Studio',
    category: 'Accessories',
    subcategory: 'Backpacks',
    originalPrice: 2699,
    sellingPrice: 1699,
    discount: 37,
    rating: 4.6,
    reviewCount: 55,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85'],
    badge: 'Limited',
    description: 'Spacious canvas tote with laptop sleeve and inner zip pocket.',
    active: true,
    sku: 'MS-TT-08',
  },
]

const initialCategories: CategoryItem[] = [
  { id: '1', name: 'Men', slug: 'men', group: 'Apparel', description: 'Men\'s apparel & footwear', subcategories: [{ name: 'Shirts', slug: 'shirts', active: true }, { name: 'T-Shirts', slug: 't-shirts', active: true }, { name: 'Jeans', slug: 'jeans', active: true }, { name: 'Jackets', slug: 'jackets', active: true }], active: true },
  { id: '2', name: 'Women', slug: 'women', group: 'Apparel', description: 'Women\'s dresses, tops & co-ords', subcategories: [{ name: 'Dresses', slug: 'dresses', active: true }, { name: 'Tops', slug: 'tops', active: true }, { name: 'Co-ords', slug: 'co-ords', active: true }, { name: 'Sarees', slug: 'sarees', active: true }], active: true },
  { id: '3', name: 'Kids', slug: 'kids', group: 'Apparel', description: 'Kids clothing & footwear', subcategories: [{ name: 'Boys Clothing', slug: 'boys-clothing', active: true }, { name: 'Girls Clothing', slug: 'girls-clothing', active: true }, { name: 'Toys', slug: 'toys', active: true }], active: true },
  { id: '4', name: 'Footwear', slug: 'footwear', group: 'Fashion', description: 'Sneakers, sandals & shoes', subcategories: [{ name: 'Sneakers', slug: 'sneakers', active: true }, { name: 'Casual Shoes', slug: 'casual-shoes', active: true }, { name: 'Sandals', slug: 'sandals', active: true }], active: true },
  { id: '5', name: 'Accessories', slug: 'accessories', group: 'Lifestyle', description: 'Bags, belts & sunglasses', subcategories: [{ name: 'Handbags', slug: 'handbags', active: true }, { name: 'Backpacks', slug: 'backpacks', active: true }, { name: 'Wallets', slug: 'wallets', active: true }], active: true },
  { id: '6', name: 'Jewellery', slug: 'jewellery', group: 'Lifestyle', description: 'Minimalist & occasion jewellery', subcategories: [{ name: 'Earrings', slug: 'earrings', active: true }, { name: 'Necklaces', slug: 'necklaces', active: true }, { name: 'Rings', slug: 'rings', active: true }], active: true },
  { id: '7', name: 'Home', slug: 'home', group: 'Living', description: 'Decor & living essentials', subcategories: [{ name: 'Home Décor', slug: 'home-decor', active: true }, { name: 'Candles', slug: 'candles', active: true }], active: true },
  { id: '8', name: 'Beauty', slug: 'beauty', group: 'Personal Care', description: 'Skincare & makeup', subcategories: [{ name: 'Makeup', slug: 'makeup', active: true }, { name: 'Skincare', slug: 'skincare', active: true }], active: true },
  { id: '9', name: 'GenZ', slug: 'genz', group: 'Trending', description: 'Youth fits & aesthetic styles', subcategories: [{ name: 'Trending Fits', slug: 'trending-fits', active: true }, { name: 'Party Wear', slug: 'party-wear', active: true }], active: true },
]

const initialOrders: OrderItem[] = [
  { id: 'ord-101', orderNumber: 'NAV-9021', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', customerPhone: '+91 98201 12345', shippingAddress: { line: '402 Sunrise Towers, Juhu', city: 'Mumbai', pincode: '400049' }, items: [{ productId: '1', name: 'Linen Relaxed Shirt', price: 1499, quantity: 1 }], subtotal: 1499, discount: 0, shipping: 0, total: 1499, paymentStatus: 'Paid', orderStatus: 'Delivered', createdAt: '2026-08-14T10:30:00.000Z' },
  { id: 'ord-102', orderNumber: 'NAV-9022', customerName: 'Aman Verma', customerEmail: 'aman@example.com', customerPhone: '+91 98110 54321', shippingAddress: { line: '12-B MG Road', city: 'Bengaluru', pincode: '560001' }, items: [{ productId: '4', name: 'Court Classic Sneakers', price: 2999, quantity: 1 }], subtotal: 2999, discount: 200, shipping: 0, total: 2799, couponCode: 'NAVAWELCOME', paymentStatus: 'Paid', orderStatus: 'Shipped', createdAt: '2026-08-15T14:20:00.000Z' },
  { id: 'ord-103', orderNumber: 'NAV-9023', customerName: 'Riya Patel', customerEmail: 'riya@example.com', customerPhone: '+91 97234 88990', shippingAddress: { line: '78 Satellite Colony', city: 'Ahmedabad', pincode: '380015' }, items: [{ productId: '2', name: 'Sculpted Shoulder Bag', price: 2199, quantity: 1 }, { productId: '6', name: 'Minimal Gold Hoops', price: 999, quantity: 1 }], subtotal: 3198, discount: 0, shipping: 0, total: 3198, paymentStatus: 'Paid', orderStatus: 'Processing', createdAt: '2026-08-16T09:15:00.000Z' },
]

const initialCustomers: CustomerItem[] = [
  { id: 'cust-1', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98201 12345', totalOrders: 3, totalSpent: 4897, status: 'Active', createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'cust-2', name: 'Aman Verma', email: 'aman@example.com', phone: '+91 98110 54321', totalOrders: 1, totalSpent: 2799, status: 'Active', createdAt: '2026-02-14T11:20:00.000Z' },
  { id: 'cust-3', name: 'Riya Patel', email: 'riya@example.com', phone: '+91 97234 88990', totalOrders: 2, totalSpent: 5397, status: 'Active', createdAt: '2026-03-01T08:45:00.000Z' },
]

const initialBanners: BannerItem[] = [
  { id: 'ban-1', title: 'Made for your pace.', eyebrow: 'The new everyday', description: 'Thoughtful essentials, considered details, and pieces that stay with you.', image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=85', buttonText: 'Explore the edit', buttonLink: '#shop', active: true, order: 1 },
  { id: 'ban-2', title: 'A little more considered.', eyebrow: 'Soft structure', description: 'Easy layers and quiet details for days that move at their own rhythm.', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=85', buttonText: 'Shop Women', buttonLink: '/category/women', active: true, order: 2 },
  { id: 'ban-3', title: 'The art of doing less.', eyebrow: 'Off-duty edit', description: 'Relaxed silhouettes, useful textures, and the pieces you reach for again.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=85', buttonText: 'Shop Men', buttonLink: '/category/men', active: true, order: 3 },
  { id: 'ban-4', title: 'Keep the good things close.', eyebrow: 'New classics', description: 'Objects and accessories that finish the day without trying too hard.', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1800&q=85', buttonText: 'Shop Accessories', buttonLink: '/category/accessories', active: true, order: 4 },
]

const initialCoupons: CouponItem[] = [
  { id: 'coup-1', code: 'NAVAWELCOME', discountType: 'percentage', discountValue: 10, minOrderValue: 999, maxDiscount: 500, usageLimit: 500, usedCount: 42, startDate: '2026-01-01', expiryDate: '2026-12-31', active: true },
  { id: 'coup-2', code: 'FLAT500', discountType: 'fixed', discountValue: 500, minOrderValue: 2999, maxDiscount: 500, usageLimit: 200, usedCount: 18, startDate: '2026-02-01', expiryDate: '2026-08-31', active: true },
]

const initialSettings: StoreSettings = {
  storeName: 'Nava Studio',
  supportEmail: 'support@nava.com',
  supportPhone: '+91 98765 43210',
  currency: 'INR',
  taxRate: 18,
  freeShippingThreshold: 999,
  shippingFee: 99,
  address: '102 Design Quarter, Bandra West, Mumbai 400050',
  enableCOD: true,
  enableCardPayment: true,
}

type GlobalStore = typeof globalThis & {
  __persistedProducts?: ProductItem[]
  __persistedCategories?: CategoryItem[]
  __persistedOrders?: OrderItem[]
  __persistedCustomers?: CustomerItem[]
  __persistedBanners?: BannerItem[]
  __persistedCoupons?: CouponItem[]
  __persistedSettings?: StoreSettings
  __dbSeeded?: boolean
}

const globalStore = globalThis as GlobalStore
if (!globalStore.__persistedProducts) globalStore.__persistedProducts = loadPersisted<ProductItem[]>('products.json', initialProducts)
if (!globalStore.__persistedCategories) globalStore.__persistedCategories = loadPersisted<CategoryItem[]>('categories.json', initialCategories)
if (!globalStore.__persistedOrders) globalStore.__persistedOrders = loadPersisted<OrderItem[]>('orders.json', initialOrders)
if (!globalStore.__persistedCustomers) globalStore.__persistedCustomers = loadPersisted<CustomerItem[]>('customers.json', initialCustomers)
if (!globalStore.__persistedBanners) globalStore.__persistedBanners = loadPersisted<BannerItem[]>('banners.json', initialBanners)
if (!globalStore.__persistedCoupons) globalStore.__persistedCoupons = loadPersisted<CouponItem[]>('coupons.json', initialCoupons)
if (!globalStore.__persistedSettings) globalStore.__persistedSettings = loadPersisted<StoreSettings>('settings.json', initialSettings)

const memoryProducts = globalStore.__persistedProducts!
const memoryCategories = globalStore.__persistedCategories!
const memoryOrders = globalStore.__persistedOrders!
const memoryCustomers = globalStore.__persistedCustomers!
const memoryBanners = globalStore.__persistedBanners!
const memoryCoupons = globalStore.__persistedCoupons!
const memorySettings = globalStore.__persistedSettings!

async function ensureDbSynced(): Promise<void> {
  if (globalStore.__dbSeeded) return
  const db = await connectToDatabase()
  if (!db) return
  try {
    const productCount = await ProductModel.countDocuments()
    if (productCount === 0 && memoryProducts.length > 0) {
      const docsToInsert = memoryProducts.map((p) => {
        const { id, ...rest } = p
        return rest
      })
      await ProductModel.insertMany(docsToInsert)
      console.log(`[DB] Successfully seeded ${docsToInsert.length} products to MongoDB`)
    }
    const catCount = await CategoryModel.countDocuments()
    if (catCount === 0 && memoryCategories.length > 0) {
      const docs = memoryCategories.map((c) => {
        const { id, ...rest } = c
        return rest
      })
      await CategoryModel.insertMany(docs)
    }
    globalStore.__dbSeeded = true
  } catch (err) {
    console.error('[DB] Seeding error:', err)
  }
}

export async function getProductsStore(
  query?: string,
  category?: string,
  sort = 'popular',
  page = 1,
  limit = 50
): Promise<ProductItem[]> {
  await ensureDbSynced()
  const db = await connectToDatabase()
  if (db) {
    try {
      const filter: Record<string, unknown> = { active: { $ne: false } }
      if (category && category !== 'All') {
        filter.category = { $regex: new RegExp(`^${category}$`, 'i') }
      }
      if (query) {
        filter.$or = [
          { name: new RegExp(query, 'i') },
          { brand: new RegExp(query, 'i') },
          { category: new RegExp(query, 'i') },
          { subcategory: new RegExp(query, 'i') },
          { slug: new RegExp(query, 'i') },
        ]
      }
      const sortMap: Record<string, Record<string, 1 | -1>> = {
        popular: { rating: -1 },
        newest: { createdAt: -1 },
        'price-low': { sellingPrice: 1 },
        'price-high': { sellingPrice: -1 },
      }
      const docs = await ProductModel.find(filter)
        .sort(sortMap[sort] ?? sortMap.popular)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
      if (docs && docs.length > 0) {
        return docs.map((doc: any) => ({ ...doc, id: doc._id.toString() }))
      }
    } catch {
    }
  }

  let items = [...memoryProducts].filter((p) => p.active !== false)
  if (category && category !== 'All') {
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }
  if (query) {
    const q = query.toLowerCase()
    items = items.filter((p) =>
      `${p.name} ${p.brand} ${p.category} ${p.subcategory ?? ''} ${p.slug ?? ''}`.toLowerCase().includes(q)
    )
  }
  if (sort === 'price-low') items.sort((a, b) => a.sellingPrice - b.sellingPrice)
  if (sort === 'price-high') items.sort((a, b) => b.sellingPrice - a.sellingPrice)
  if (sort === 'newest') items.sort((a, b) => Number(b.id) - Number(a.id))
  return items.slice((page - 1) * limit, page * limit)
}

export async function getAllAdminProductsStore(
  page = 1,
  limit = 20,
  query?: string,
  category?: string
): Promise<PaginatedResult<ProductItem>> {
  await ensureDbSynced()
  const db = await connectToDatabase()
  if (db) {
    try {
      const filter: Record<string, unknown> = {}
      if (category && category !== 'All') filter.category = category
      if (query) {
        filter.$or = [
          { name: new RegExp(query, 'i') },
          { brand: new RegExp(query, 'i') },
          { sku: new RegExp(query, 'i') },
          { slug: new RegExp(query, 'i') },
        ]
      }
      const [docs, total] = await Promise.all([
        ProductModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        ProductModel.countDocuments(filter),
      ])
      if (docs && docs.length > 0) {
        return {
          items: docs.map((doc: any) => ({ ...doc, id: doc._id.toString() })),
          total,
          page,
          pages: Math.max(1, Math.ceil(total / limit)),
        }
      }
    } catch {
    }
  }

  let items = [...memoryProducts]
  if (category && category !== 'All') {
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }
  if (query) {
    const q = query.toLowerCase()
    items = items.filter((p) =>
      `${p.name} ${p.brand} ${p.category} ${p.sku ?? ''}`.toLowerCase().includes(q)
    )
  }
  const total = items.length
  const paginated = items.slice((page - 1) * limit, page * limit)
  return {
    items: paginated,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getProductByIdStore(id: string): Promise<ProductItem | null> {
  const cleanId = decodeURIComponent(id || '').trim()
  if (!cleanId) return null
  await ensureDbSynced()
  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)
      const doc = await ProductModel.findOne({
        $or: [
          ...(isObjectId ? [{ _id: cleanId }] : []),
          { slug: cleanId },
          { id: cleanId },
          { sku: cleanId },
        ],
      }).lean()
      if (doc) return { ...(doc as any), id: (doc as any)._id.toString() }
    } catch {
    }
  }

  return (
    memoryProducts.find(
      (p) =>
        p.id === cleanId ||
        p.slug === cleanId ||
        p.sku === cleanId ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId.toLowerCase()
    ) ?? null
  )
}

export async function createProductStore(data: Partial<ProductItem>): Promise<ProductItem> {
  const images =
    data.images && data.images.length > 0
      ? data.images
      : data.image
      ? [data.image]
      : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85']

  const originalPrice = Number(data.originalPrice ?? data.sellingPrice ?? 1999)
  const sellingPrice = Number(data.sellingPrice ?? 1499)
  const discount =
    data.discount !== undefined
      ? Number(data.discount)
      : Math.max(0, Math.round((1 - sellingPrice / originalPrice) * 100))

  const newProduct: ProductItem = {
    id: Date.now().toString(),
    name: data.name ?? 'Untitled Product',
    slug:
      data.slug?.trim() ||
      data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `product-${Date.now()}`,
    brand: data.brand ?? 'Nava',
    category: data.category ?? 'General',
    subcategory: data.subcategory ?? '',
    originalPrice,
    sellingPrice,
    discount,
    stock: Number(data.stock ?? 10),
    rating: data.rating ?? 4.8,
    reviewCount: data.reviewCount ?? 1,
    image: images[0],
    images: images,
    badge: data.badge ?? 'New',
    description: data.description ?? '',
    active: data.active !== false,
    sku: data.sku ?? `SKU-${Date.now().toString().slice(-4)}`,
    size: data.size ?? '',
    color: data.color ?? '',
    hasVariants: Boolean(data.hasVariants || (data.variants && data.variants.length > 0)),
    variants: (data.variants ?? []).map((v, i) => ({
      ...v,
      id: v.id || `var-${Date.now()}-${i}`,
      name: v.name || `${v.color || ''} ${v.size || ''}`.trim() || `Variant ${i + 1}`,
      price: Number(v.price || sellingPrice),
      originalPrice: Number(v.originalPrice || originalPrice),
      discount:
        v.discount !== undefined
          ? Number(v.discount)
          : Math.max(0, Math.round((1 - Number(v.price || sellingPrice) / Number(v.originalPrice || originalPrice)) * 100)),
      stock: Number(v.stock ?? data.stock ?? 10),
      images: v.images && v.images.length > 0 ? v.images : images,
      image: v.image || (v.images && v.images.length > 0 ? v.images[0] : images[0]),
    })),
  }

  const db = await connectToDatabase()
  if (db) {
    try {
      const doc = await ProductModel.create(newProduct)
      const item = { ...(doc.toObject() as any), id: doc._id.toString() }
      memoryProducts.unshift(item)
      savePersisted('products.json', memoryProducts)
      return item
    } catch (err) {
      console.error('[DB] Product insert error:', err)
    }
  }

  memoryProducts.unshift(newProduct)
  savePersisted('products.json', memoryProducts)
  return newProduct
}

export async function updateProductStore(id: string, data: Partial<ProductItem>): Promise<ProductItem | null> {
  const cleanId = decodeURIComponent(id || '').trim()
  if (!cleanId) return null

  const images = data.images && data.images.length > 0 ? data.images : data.image ? [data.image] : undefined
  const updatePayload: Record<string, any> = { ...data }
  if (images) {
    updatePayload.images = images
    updatePayload.image = images[0]
  }
  if (data.originalPrice !== undefined || data.sellingPrice !== undefined) {
    const orig = Number(data.originalPrice ?? 1999)
    const sell = Number(data.sellingPrice ?? orig)
    if (data.discount === undefined) {
      updatePayload.discount = Math.max(0, Math.round((1 - sell / orig) * 100))
    }
  }

  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)
      const query = isObjectId ? { _id: cleanId } : { $or: [{ slug: cleanId }, { id: cleanId }] }
      const doc = await ProductModel.findOneAndUpdate(query, updatePayload, { new: true }).lean()
      if (doc) {
        const item = { ...(doc as any), id: (doc as any)._id.toString() }
        const idx = memoryProducts.findIndex((p) => p.id === cleanId || p.slug === cleanId)
        if (idx !== -1) {
          memoryProducts[idx] = item
        } else {
          memoryProducts.unshift(item)
        }
        savePersisted('products.json', memoryProducts)
        return item
      }
    } catch (err) {
      console.error('[DB] Product update error:', err)
    }
  }

  const index = memoryProducts.findIndex((p) => p.id === cleanId || p.slug === cleanId)
  if (index === -1) return null
  memoryProducts[index] = { ...memoryProducts[index], ...updatePayload }
  savePersisted('products.json', memoryProducts)
  return memoryProducts[index]
}

export async function deleteProductStore(id: string): Promise<boolean> {
  const cleanId = decodeURIComponent(id || '').trim()
  if (!cleanId) return false

  let deleted = false
  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)
      const query = isObjectId ? { _id: cleanId } : { $or: [{ slug: cleanId }, { id: cleanId }] }
      const res = await ProductModel.findOneAndDelete(query)
      if (res) deleted = true
    } catch (err) {
      console.error('[DB] Product delete error:', err)
    }
  }

  const index = memoryProducts.findIndex((p) => p.id === cleanId || p.slug === cleanId)
  if (index !== -1) {
    memoryProducts.splice(index, 1)
    savePersisted('products.json', memoryProducts)
    deleted = true
  }

  return deleted
}

export async function getCategoriesStore(): Promise<CategoryItem[]> {
  await ensureDbSynced()
  const db = await connectToDatabase()
  if (db) {
    try {
      const docs = await CategoryModel.find({ active: true })
        .select('name slug group description subcategories active')
        .lean()
      if (docs && docs.length) return docs.map((d: any) => ({ ...d, id: d._id.toString() }))
    } catch {}
  }
  return memoryCategories.filter((c) => c.active !== false)
}

export async function createCategoryStore(data: Partial<CategoryItem>): Promise<CategoryItem> {
  const newCat: CategoryItem = {
    id: Date.now().toString(),
    name: data.name ?? 'New Category',
    slug: data.slug ?? data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? 'category',
    group: data.group ?? 'General',
    description: data.description ?? '',
    subcategories: data.subcategories ?? [],
    active: true,
  }
  const db = await connectToDatabase()
  if (db) {
    try {
      const doc = await CategoryModel.create(newCat)
      const item = { ...(doc.toObject() as any), id: doc._id.toString() }
      memoryCategories.push(item)
      savePersisted('categories.json', memoryCategories)
      return item
    } catch {}
  }
  memoryCategories.push(newCat)
  savePersisted('categories.json', memoryCategories)
  return newCat
}

export async function updateCategoryStore(id: string, data: Partial<CategoryItem>): Promise<CategoryItem | null> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
      const query = isObjectId ? { _id: id } : { slug: id }
      const doc = await CategoryModel.findOneAndUpdate(query, data, { new: true }).lean()
      if (doc) {
        const item = { ...(doc as any), id: (doc as any)._id.toString() }
        const idx = memoryCategories.findIndex((c) => c.id === id || c.slug === id)
        if (idx !== -1) memoryCategories[idx] = item
        savePersisted('categories.json', memoryCategories)
        return item
      }
    } catch {}
  }
  const index = memoryCategories.findIndex((c) => c.id === id || c.slug === id)
  if (index === -1) return null
  memoryCategories[index] = { ...memoryCategories[index], ...data }
  savePersisted('categories.json', memoryCategories)
  return memoryCategories[index]
}

export async function deleteCategoryStore(id: string): Promise<boolean> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
      const query = isObjectId ? { _id: id } : { slug: id }
      await CategoryModel.findOneAndDelete(query)
    } catch {}
  }
  const index = memoryCategories.findIndex((c) => c.id === id || c.slug === id)
  if (index !== -1) {
    memoryCategories.splice(index, 1)
    savePersisted('categories.json', memoryCategories)
    return true
  }
  return false
}

export async function getOrdersStore(page = 1, limit = 20, status?: string, query?: string): Promise<PaginatedResult<OrderItem>> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const filter: Record<string, unknown> = {}
      if (status && status !== 'All') filter.orderStatus = status
      if (query) {
        filter.$or = [
          { orderNumber: new RegExp(query, 'i') },
          { customerName: new RegExp(query, 'i') },
          { customerEmail: new RegExp(query, 'i') },
        ]
      }
      const [docs, total] = await Promise.all([
        OrderModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        OrderModel.countDocuments(filter),
      ])
      if (docs && docs.length > 0) {
        return {
          items: docs.map((d: any) => ({ ...d, id: d._id.toString() })),
          total,
          page,
          pages: Math.max(1, Math.ceil(total / limit)),
        }
      }
    } catch {}
  }
  let filtered = [...memoryOrders]
  if (status && status !== 'All') filtered = filtered.filter((o) => o.orderStatus === status)
  if (query) filtered = filtered.filter((o) => `${o.orderNumber} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(query.toLowerCase()))
  const total = filtered.length
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getOrderByIdStore(id: string): Promise<OrderItem | null> {
  const cleanId = decodeURIComponent(id || '').trim()
  const db = await connectToDatabase()
  if (db) {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)
      const doc = await OrderModel.findOne({ $or: [...(isObjectId ? [{ _id: cleanId }] : []), { orderNumber: cleanId }, { id: cleanId }] }).lean()
      if (doc) return { ...(doc as any), id: (doc as any)._id.toString() }
    } catch {}
  }
  return memoryOrders.find((o) => o.id === cleanId || o.orderNumber === cleanId) ?? null
}

export async function createOrderStore(data: Partial<OrderItem>): Promise<OrderItem> {
  const newOrder: OrderItem = {
    id: `ord-${Date.now()}`,
    orderNumber: data.orderNumber ?? `NAV-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: data.customerName ?? 'Guest Customer',
    customerEmail: data.customerEmail ?? 'guest@example.com',
    customerPhone: data.customerPhone ?? '+91 98765 43210',
    shippingAddress: data.shippingAddress ?? { line: 'Street Address', city: 'Mumbai', pincode: '400001' },
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    discount: data.discount ?? 0,
    shipping: data.shipping ?? 0,
    total: data.total ?? 0,
    couponCode: data.couponCode,
    paymentStatus: data.paymentStatus ?? 'Paid',
    orderStatus: data.orderStatus ?? 'Confirmed',
    createdAt: new Date().toISOString(),
  }

  const db = await connectToDatabase()
  if (db) {
    try {
      const doc = await OrderModel.create(newOrder)
      const item = { ...(doc.toObject() as any), id: doc._id.toString() }
      memoryOrders.unshift(item)
      savePersisted('orders.json', memoryOrders)
      return item
    } catch {}
  }

  memoryOrders.unshift(newOrder)
  savePersisted('orders.json', memoryOrders)
  return newOrder
}

export async function updateOrderStatusStore(id: string, status: OrderItem['orderStatus']): Promise<OrderItem | null> {
  const index = memoryOrders.findIndex((o) => o.id === id || o.orderNumber === id)
  if (index === -1) return null
  memoryOrders[index].orderStatus = status
  savePersisted('orders.json', memoryOrders)
  return memoryOrders[index]
}

export async function getCustomersStore(page = 1, limit = 20, query?: string): Promise<PaginatedResult<CustomerItem>> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const filter: Record<string, unknown> = {}
      if (query) filter.$or = [{ name: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }, { phone: new RegExp(query, 'i') }]
      const [docs, total] = await Promise.all([
        CustomerModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        CustomerModel.countDocuments(filter),
      ])
      if (docs && docs.length > 0) {
        return {
          items: docs.map((d: any) => ({ ...d, id: d._id.toString() })),
          total,
          page,
          pages: Math.max(1, Math.ceil(total / limit)),
        }
      }
    } catch {}
  }
  let filtered = [...memoryCustomers]
  if (query) filtered = filtered.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase()))
  const total = filtered.length
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getBannersStore(onlyActive = true): Promise<BannerItem[]> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const query = onlyActive ? { active: true } : {}
      const docs = await BannerModel.find(query).select('title eyebrow description image buttonText buttonLink active order').sort({ order: 1 }).lean()
      if (docs && docs.length) return docs.map((d: any) => ({ ...d, id: d._id.toString() }))
    } catch {}
  }
  return onlyActive ? memoryBanners.filter((b) => b.active) : memoryBanners
}

export async function createBannerStore(data: Partial<BannerItem>): Promise<BannerItem> {
  const newBanner: BannerItem = {
    id: `ban-${Date.now()}`,
    title: data.title ?? 'New Banner',
    eyebrow: data.eyebrow ?? 'Featured',
    description: data.description ?? '',
    image: data.image ?? 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=85',
    buttonText: data.buttonText ?? 'Explore the edit',
    buttonLink: data.buttonLink ?? '#shop',
    active: true,
    order: memoryBanners.length + 1,
  }
  memoryBanners.push(newBanner)
  savePersisted('banners.json', memoryBanners)
  return newBanner
}

export async function updateBannerStore(id: string, data: Partial<BannerItem>): Promise<BannerItem | null> {
  const index = memoryBanners.findIndex((b) => b.id === id)
  if (index === -1) return null
  memoryBanners[index] = { ...memoryBanners[index], ...data }
  savePersisted('banners.json', memoryBanners)
  return memoryBanners[index]
}

export async function deleteBannerStore(id: string): Promise<boolean> {
  const index = memoryBanners.findIndex((b) => b.id === id)
  if (index !== -1) {
    memoryBanners.splice(index, 1)
    savePersisted('banners.json', memoryBanners)
    return true
  }
  return false
}

export async function getCouponsStore(onlyActive = false): Promise<CouponItem[]> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const query = onlyActive ? { active: true } : {}
      const docs = await CouponModel.find(query).sort({ createdAt: -1 }).lean()
      if (docs && docs.length) return docs.map((d: any) => ({ ...d, id: d._id.toString() }))
    } catch {}
  }
  return onlyActive ? memoryCoupons.filter((c) => c.active) : memoryCoupons
}

export async function createCouponStore(data: Partial<CouponItem>): Promise<CouponItem> {
  const newCoupon: CouponItem = {
    id: `coup-${Date.now()}`,
    code: (data.code ?? 'DISCOUNT10').toUpperCase(),
    discountType: data.discountType ?? 'percentage',
    discountValue: Number(data.discountValue ?? 10),
    minOrderValue: Number(data.minOrderValue ?? 0),
    maxDiscount: Number(data.maxDiscount ?? 500),
    usageLimit: Number(data.usageLimit ?? 100),
    usedCount: 0,
    startDate: data.startDate ?? new Date().toISOString().split('T')[0],
    expiryDate: data.expiryDate ?? '2026-12-31',
    active: true,
  }
  memoryCoupons.unshift(newCoupon)
  savePersisted('coupons.json', memoryCoupons)
  return newCoupon
}

export async function updateCouponStore(id: string, data: Partial<CouponItem>): Promise<CouponItem | null> {
  const index = memoryCoupons.findIndex((c) => c.id === id)
  if (index === -1) return null
  memoryCoupons[index] = { ...memoryCoupons[index], ...data }
  savePersisted('coupons.json', memoryCoupons)
  return memoryCoupons[index]
}

export async function deleteCouponStore(id: string): Promise<boolean> {
  const index = memoryCoupons.findIndex((c) => c.id === id)
  if (index !== -1) {
    memoryCoupons.splice(index, 1)
    savePersisted('coupons.json', memoryCoupons)
    return true
  }
  return false
}

export async function validateCouponStore(code: string, cartTotal: number): Promise<{ valid: boolean; discount: number; message?: string; coupon?: CouponItem }> {
  const coupons = await getCouponsStore(true)
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase())
  if (!coupon) return { valid: false, discount: 0, message: 'Invalid coupon code' }
  if (cartTotal < coupon.minOrderValue) return { valid: false, discount: 0, message: `Minimum order value for ${coupon.code} is ₹${coupon.minOrderValue}` }
  let discount = coupon.discountType === 'percentage' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue
  if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount)
  return { valid: true, discount: Math.round(discount), coupon }
}

export async function getSettingsStore(): Promise<StoreSettings> {
  const db = await connectToDatabase()
  if (db) {
    try {
      const doc = await SettingModel.findOne().lean()
      if (doc) return doc as any
    } catch {}
  }
  return memorySettings
}

export async function updateSettingsStore(data: Partial<StoreSettings>): Promise<StoreSettings> {
  Object.assign(memorySettings, data)
  savePersisted('settings.json', memorySettings)
  const db = await connectToDatabase()
  if (db) {
    try {
      await SettingModel.findOneAndUpdate({}, memorySettings, { upsert: true })
    } catch {}
  }
  return memorySettings
}
