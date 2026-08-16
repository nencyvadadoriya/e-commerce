import { getProductByIdStore } from '@/lib/data-store'
import { ProductDetailClient } from '@/components/product-detail-client'
import { ProductDetailLoader } from '@/components/product-detail-loader'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductByIdStore(id)

  if (product) {
    return <ProductDetailClient product={product} />
  }

  // Fallback client loader if SSR missed it
  return <ProductDetailLoader productId={id} />
}
