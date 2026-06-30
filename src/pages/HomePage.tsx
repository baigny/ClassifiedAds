import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useSWR from 'swr'
import { listingsApi } from '../api/listings'
import { getAllCategories } from '../lib/categories'
import { ListingCard, ListingCardSkeleton } from '../components/ListingCard'
import { ErrorMessage } from '../components/ui/ErrorMessage'

export default function HomePage() {
  const { data: featured, isLoading: featuredLoading, error: featuredError } = useSWR(
    'listings:featured',
    () => listingsApi.getFeatured()
  )

  const { data: recent, isLoading: recentLoading } = useSWR(
    'listings:recent',
    () => listingsApi.getRecent()
  )

  const categories = getAllCategories()

  return (
    <div className="page-enter">
      {/* ── Hero ── */}
      <section
        className="relative bg-foreground text-surface overflow-hidden"
        aria-label="Hero"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, var(--color-primary) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--color-accent) 0%, transparent 40%)',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <h1 className="font-display text-4xl sm:text-6xl font-black leading-tight text-balance max-w-2xl">
            Buy & Sell <span className="text-accent">Anything</span>, Locally.
          </h1>
          <p className="mt-4 text-lg text-surface/70 max-w-xl">
            Thousands of listings from verified sellers. Find electronics, furniture, vehicles, and more — all in one place.
          </p>
          <HeroSearch />
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-surface/50">
            <span>Popular:</span>
            {categories.slice(0, 5).map((c: any) => (
              <Link
                key={c.id}
                to={`/listings?category=${encodeURIComponent(c.id)}`}
                className="hover:text-surface transition"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Nav ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10" aria-label="Browse by category">
        <h2 className="font-display text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              to={`/listings?category=${encodeURIComponent(cat.id)}`}
              className="flex flex-col items-center gap-2 p-4 rounded-md border border-border bg-surface hover:border-primary hover:shadow-md transition text-center group"
            >
              <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
              <span className="text-sm font-medium text-muted group-hover:text-foreground transition">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" aria-label="Featured listings">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Featured Listings</h2>
          <Link to="/listings" className="text-sm text-primary font-medium hover:underline">View all →</Link>
        </div>

        {featuredError && <ErrorMessage message="Failed to load featured listings." />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : (featured ?? []).map(listing => (
                <ListingCard key={listing.id} listing={listing} featured />
              ))
          }
        </div>
      </section>

      {/* ── Recent Listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" aria-label="Recent listings">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Recently Posted</h2>
          <Link to="/listings" className="text-sm text-primary font-medium hover:underline">See more →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentLoading
            ? Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : (recent ?? []).map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
          }
        </div>
      </section>

      {/* ── Trust section ── */}
      <section className="bg-surface border-y border-border py-12 mt-8" aria-label="Trust and safety">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Why Choose Bazaar?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: '🛡️', title: 'Verified Sellers', desc: 'All sellers are verified with contact details and ratings.' },
              { icon: '💬', title: 'Direct Contact', desc: 'Message sellers directly — no middlemen, no fees.' },
              { icon: '🔒', title: 'Safe Transactions', desc: 'Follow our safety tips for secure in-person meetups.' },
            ].map(item => (
              <div key={item.title} className="p-6 rounded-md border border-border bg-background">
                <div className="text-4xl mb-3" aria-hidden="true">{item.icon}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function HeroSearch() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) navigate(`/listings?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex gap-2 max-w-xl">
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="What are you looking for?"
        aria-label="Search listings"
        className="flex-1 px-4 py-3 rounded-md bg-surface/10 border border-surface/20 text-surface placeholder:text-surface/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-base"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-primary text-primary-fg font-semibold rounded-md hover:opacity-90 transition"
      >
        Search
      </button>
    </form>
  )
}
