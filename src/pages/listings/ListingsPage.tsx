import { Link, useSearchParams } from 'react-router-dom'
import useSWR from 'swr'
import { listingsApi } from '../../api/listings'
import { getAllCategories } from '../../lib/categories'
import { ListingCard, ListingCardSkeleton } from '../../components/ListingCard'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import type { SearchParams } from '../../types'

const PAGE_SIZE = 12

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q        = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const role     = (searchParams.get('role') ?? 'all') as SearchParams['role']
  const sort     = (searchParams.get('sort') ?? 'newest') as SearchParams['sort']
  const status   = (searchParams.get('status') ?? 'all') as SearchParams['status']
  const page     = parseInt(searchParams.get('page') ?? '1', 10)

  const params: SearchParams = { q, category, role, sort, status, page, pageSize: PAGE_SIZE }

  const { data, isLoading, error } = useSWR(
    JSON.stringify(params),
    () => listingsApi.search(params),
    { keepPreviousData: true }
  )

  const listings   = data?.listings ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function setParam(key: string, value: string | number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set(key, String(value))
      next.set('page', '1')
      return next
    })
  }

  function setPage(p: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categories = getAllCategories()

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">
        {q ? `Results for "${q}"` : category ? (categories.find((c: any) => c.id === category)?.label ?? 'Listings') : 'All Listings'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar filters ── */}
        <aside className="lg:w-56 shrink-0" aria-label="Filters">
          <div className="bg-surface border border-border rounded-md p-4 space-y-5 sticky top-20">
            <FilterSection title="Category">
              <button
                onClick={() => setParam('category', '')}
                className={`filter-btn ${!category ? 'active' : ''}`}
              >All</button>
              {categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setParam('category', c.id)}
                  className={`filter-btn ${category === c.id ? 'active' : ''}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </FilterSection>

            <div className="divider" />

            <FilterSection title="Poster Role">
              {([['all','All'],['seller','Sellers Only'],['buyer','Buyers Only']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setParam('role', v)} className={`filter-btn ${role === v ? 'active' : ''}`}>{l}</button>
              ))}
            </FilterSection>

            <div className="divider" />

            <FilterSection title="Status">
              {([['all','All'],['active','Active'],['sold','Sold']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setParam('status', v)} className={`filter-btn ${status === v ? 'active' : ''}`}>{l}</button>
              ))}
            </FilterSection>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-muted">
              {isLoading ? '—' : `${total} listing${total !== 1 ? 's' : ''}`}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted">Sort:</label>
              <select
                id="sort"
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {error && <ErrorMessage message={(error as Error).message} />}

          {!isLoading && !error && listings.length === 0 && (
            <EmptyState q={q} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => <ListingCardSkeleton key={i} />)
              : listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-1" aria-label="Pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-surface-elevated transition"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={page === p ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded-md border text-sm transition ${
                      page === p
                        ? 'bg-primary text-primary-fg border-primary'
                        : 'border-border hover:bg-surface-elevated'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md border border-border text-sm disabled:opacity-40 hover:bg-surface-elevated transition"
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>

      <style>{`
        .filter-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 5px 8px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--color-muted);
          transition: all 0.15s;
        }
        .filter-btn:hover { background: var(--color-surface-elevated); color: var(--color-foreground); }
        .filter-btn.active { background: rgba(200,75,47,0.1); color: var(--color-primary); font-weight: 600; }
      `}</style>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function EmptyState({ q }: { q: string }) {
  return (
    <div className="text-center py-20 text-muted">
      <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
      <h2 className="font-display text-xl font-bold text-foreground mb-1">No listings found</h2>
      <p className="text-sm">{q ? `No results for "${q}"` : 'Try adjusting your filters.'}</p>
      <Link to="/listings" className="mt-4 inline-block text-sm text-primary hover:underline">Clear filters</Link>
    </div>
  )
}
