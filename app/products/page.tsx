import { SearchResults } from '@/components/search-results'

export default async function ProductsListPage({ searchParams }: { searchParams: Promise<{ search?: string; q?: string; category?: string }> }) {
  const params = await searchParams
  const query = params.search ?? params.q ?? params.category ?? ''
  return <SearchResults initialQuery={query} />
}
