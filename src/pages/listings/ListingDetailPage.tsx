import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import useSWR from 'swr'
import { listingsApi } from '../../api/listings'
import { inquiriesApi } from '../../api/inquiries'
import { getCategoryById } from '../../lib/categories'
import { formatPrice, formatRelativeDate, getAvatarUrl, getListingThumbnail } from '../../lib/format'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { ListingCard } from '../../components/ListingCard'
import type { Profile, Inquiry } from '../../types'

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activePhoto, setActivePhoto] = useState(0)

  const { data: listing, isLoading, error } = useSWR(
    id ? `listing:${id}` : null,
    () => listingsApi.getOne(id!)
  )

  const { data: inquiries, isLoading: inquiriesLoading, mutate: reloadInquiries } = useSWR(
    id ? `inquiries:${id}` : null,
    () => inquiriesApi.getByListing(id!)
  )

  const { data: related } = useSWR(
    listing?.category ? `related:${id}:${listing.category}` : null,
    () => listingsApi.getRelated(id!, listing!.category)
  )

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="font-display text-2xl font-bold mb-2">Listing not found</h1>
        <Link to="/listings" className="text-primary hover:underline">← Back to listings</Link>
      </div>
    )
  }

  if (isLoading) return <ListingDetailSkeleton />

  if (!listing) return null

  const seller   = listing.profiles
  const category = getCategoryById(listing.category)
  const sold     = listing.status === 'sold'
  const gallery  = listing.images?.length ? listing.images : [getListingThumbnail(listing)]

  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        listing.title,
    description: listing.body,
    offers: {
      '@type':       'Offer',
      price:          listing.price,
      priceCurrency: 'INR',
      availability:   sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    },
  }

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to="/listings" className="hover:text-primary transition">Listings</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/listings?category=${category.id}`} className="hover:text-primary transition">{category.label}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground line-clamp-1 max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Images + Details ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-surface rounded-md border border-border overflow-hidden">
            <div className="aspect-video bg-surface-elevated relative">
              <img
                src={gallery[activePhoto]}
                alt={listing.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {sold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-display text-3xl font-bold">SOLD</span>
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition ${
                      activePhoto === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="bg-surface rounded-md border border-border p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${sold ? 'badge-sold' : 'badge-active'}`}>
                    {sold ? 'Sold' : 'Available'}
                  </span>
                  <span className="badge" style={{ background: 'rgba(138,129,120,0.12)', color: 'var(--color-muted)' }}>
                    {category.icon} {category.label}
                  </span>
                  <span className="badge" style={{ background: 'rgba(138,129,120,0.12)', color: 'var(--color-muted)' }}>
                    {listing.condition}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold capitalize leading-tight">
                  {listing.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-black text-primary">{formatPrice(listing.price)}</p>
                <p className="text-xs text-muted mt-0.5">Posted {formatRelativeDate(listing.created_at)}</p>
              </div>
            </div>

            <div className="divider my-4" />

            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted leading-relaxed">{listing.body}</p>

            {seller?.city && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <span aria-hidden="true">📍</span>
                <span>{seller.city}</span>
              </div>
            )}

            <ShareBar title={listing.title} />
          </div>

          {/* Inquiries */}
          <InquirySection
            listingId={id!}
            inquiries={inquiries}
            isLoading={inquiriesLoading}
            onSuccess={() => reloadInquiries()}
          />
        </div>

        {/* ── Right: Seller Card + CTA ── */}
        <aside className="space-y-4" aria-label="Seller information">
          <div className="bg-surface rounded-md border border-border p-5 sticky top-20">
            <p className="font-display text-2xl font-black text-primary mb-1">{formatPrice(listing.price)}</p>
            <p className="text-sm text-muted mb-4">{sold ? 'This item has been sold.' : 'Price negotiable'}</p>

            {!sold && (
              <div className="space-y-2">
                <button className="w-full py-2.5 bg-primary text-primary-fg font-semibold rounded-md hover:opacity-90 transition focus-visible:ring-2">
                  Contact Seller
                </button>
                <button className="w-full py-2.5 border border-border font-medium rounded-md hover:bg-surface-elevated transition text-sm">
                  Make an Offer
                </button>
              </div>
            )}

            <div className="divider my-4" />

            {seller ? (
              <SellerCard seller={seller} />
            ) : (
              <div className="space-y-2">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            )}
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-md p-4 text-sm">
            <p className="font-semibold text-warning mb-1">⚠️ Safety Tips</p>
            <ul className="text-muted space-y-1 text-xs list-disc list-inside">
              <li>Meet in a public place</li>
              <li>Never pay in advance</li>
              <li>Inspect before buying</li>
              <li>Trust your instincts</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Related Listings */}
      {related && related.length > 0 && (
        <section className="mt-12" aria-label="Related listings">
          <h2 className="font-display text-2xl font-bold mb-4">Related Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function SellerCard({ seller }: { seller: Profile }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={getAvatarUrl(seller.id)}
          alt={seller.name}
          className="w-10 h-10 rounded-full object-cover border border-border"
        />
        <div>
          <p className="font-semibold text-sm">{seller.name}</p>
          <span className={`badge ${seller.role === 'seller' ? 'badge-seller' : 'badge-buyer'}`}>
            {seller.role === 'seller' ? 'Seller' : 'Buyer'}
          </span>
        </div>
      </div>
      {seller.email && <p className="text-xs text-muted mb-1">📧 {seller.email}</p>}
      {seller.phone && <p className="text-xs text-muted mb-3">📞 {seller.phone}</p>}
      <Link
        to={seller.role === 'seller' ? `/sellers/${seller.id}` : `/buyers/${seller.id}`}
        className="text-xs text-primary font-medium hover:underline"
      >
        View all listings →
      </Link>
    </div>
  )
}

function ShareBar({ title }: { title: string }) {
  const url = window.location.href
  function copy() {
    navigator.clipboard.writeText(url)
    alert('Link copied!')
  }
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-muted">
      <span className="font-medium text-foreground">Share:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition" aria-label="Share on Twitter">𝕏</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition" aria-label="Share on Facebook">f</a>
      <button onClick={copy} className="hover:text-primary transition" aria-label="Copy link">🔗 Copy</button>
    </div>
  )
}

interface InquirySectionProps {
  listingId: string
  inquiries?: Inquiry[]
  isLoading: boolean
  onSuccess: () => void
}

function InquirySection({ listingId, inquiries, isLoading, onSuccess }: InquirySectionProps) {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [body,      setBody]      = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isError,   setIsError]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !body) return
    setIsPending(true)
    setIsError(false)
    try {
      await inquiriesApi.create({ listingId, name, email, body })
      setSubmitted(true)
      onSuccess()
    } catch {
      setIsError(true)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="bg-surface rounded-md border border-border p-6">
      <h2 className="font-display text-xl font-bold mb-4">
        Inquiries <span className="text-muted font-body text-sm font-normal">({inquiries?.length ?? 0})</span>
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-md" />)}
        </div>
      ) : inquiries?.length === 0 ? (
        <p className="text-muted text-sm mb-4">No inquiries yet. Be the first!</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {inquiries?.slice(0, 5).map(c => (
            <li key={c.id} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium capitalize">{c.name}</p>
                <p className="text-xs text-muted">{c.email}</p>
              </div>
              <p className="text-sm text-muted line-clamp-2">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      {submitted ? (
        <p className="text-success text-sm font-medium">✅ Inquiry sent! The seller will contact you.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-4">
          <h3 className="font-semibold text-sm">Send an Inquiry</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              aria-label="Your name"
              className="inq-field"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-label="Email address"
              className="inq-field"
            />
          </div>
          <textarea
            placeholder="Your message…"
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={3}
            aria-label="Your message"
            className="inq-field w-full resize-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-fg text-sm font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50"
          >
            {isPending ? 'Sending…' : 'Send Inquiry'}
          </button>
          {isError && <ErrorMessage message="Failed to send. Please try again." />}
        </form>
      )}

      <style>{`
        .inq-field {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-background);
          color: var(--color-foreground);
          font-size: 14px;
          font-family: var(--font-body);
          transition: border-color 0.15s;
        }
        .inq-field:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(200,75,47,0.15);
        }
      `}</style>
    </div>
  )
}

function ListingDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="skeleton aspect-video rounded-md" />
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </div>
      <div className="space-y-4">
        <div className="skeleton h-48 rounded-md" />
        <div className="skeleton h-24 rounded-md" />
      </div>
    </div>
  )
}
