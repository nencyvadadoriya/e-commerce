'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  if (pages <= 1) return null

  // Build page number list with ellipsis
  function getPageNumbers(): (number | '...')[] {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const result: (number | '...')[] = [1]
    if (page > 3) result.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      result.push(i)
    }
    if (page < pages - 2) result.push('...')
    result.push(pages)
    return result
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-10 pb-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={14} />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
              …
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              aria-label={`Page ${num}`}
              aria-current={num === page ? 'page' : undefined}
              className={`min-w-[34px] rounded-sm border px-2 py-2 text-xs font-semibold transition ${
                num === page
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary hover:text-primary'
              }`}
            >
              {num}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
        className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <ChevronRight size={14} />
      </button>
    </nav>
  )
}
