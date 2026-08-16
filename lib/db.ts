import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailed: number;
}
const globalWithMongoose = globalThis as typeof globalThis & { mongoose?: MongooseCache }
const cached = globalWithMongoose.mongoose ?? { conn: null, promise: null, lastFailed: 0 }

globalWithMongoose.mongoose = cached

const COOLDOWN_MS = 30000 // 30 seconds cooldown before trying to connect again

export async function connectToDatabase() {
  if (!MONGODB_URI) return null
  if (cached.conn) return cached.conn

  // Cooldown check
  if (Date.now() - cached.lastFailed < COOLDOWN_MS) {
    return null
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000, // Reduced from 5000 to 2000
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    cached.lastFailed = Date.now()
    console.error('MongoDB connection failed (cooldown activated):', error)
    return null
  }
}
