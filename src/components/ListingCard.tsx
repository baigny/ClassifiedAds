import { Link } from 'react-router-dom'
import { getCategoryById } from '../lib/categories'
import { formatPrice, formatRelativeDate, getAvatarUrl, getListingThumbnail } from '../lib/format'
import type { Listing } from '../types'

interface ListingCardProps {
  listing: Listing
  featured?: boolean
}

export function ListingCard({ listing, featured }: ListingCardProps) {
  if (!listing) return null

  const category = getCategoryById(listing.category)
  const seller   = listing.profiles
  const sold     = listing.status === 'sold'

  return (
    <article
      className={`bg-surface border rounded-md overflow-hidden card-lift group ${
        featured ? 'border-accent/40 shadow-md' : 'border-border'
      }`}
    >
      <Link to={`/listings/${listing.id}`} aria-label={listing.title}>
        {/* Image */}
        <div className="aspect-video bg-surface-elevated relative overflow-hidden">
          <img
            src={getListingThumbnail(listing)}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {sold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-wider">SOLD</span>
            </div>
          )}
          {featured && !sold && (
            <div className="absolute top-2 left-2">
              <span className="badge" style={{ background: 'var(--color-accent)', color: '#fff' }}>⭐ Featured</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="badge" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              {category.icon} {category.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm capitalize line-clamp-2 group-hover:text-primary transition leading-snug">
            {listing.title}
          </h3>
          <p className="text-xs text-muted line-clamp-2 mt-1">{listing.body}</p>

          <div className="mt-2 flex items-center justify-between">
            <p className="font-display font-black text-lg text-primary">{formatPrice(listing.price)}</p>
            <span className={`badge ${sold ? 'badge-sold' : 'badge-active'}`}>
              {sold ? 'Sold' : listing.condition}
            </span>
          </div>
        </div>
      </Link>

      {/* Seller footer */}
      {seller && (
        <div className="px-3 pb-3 flex items-center justify-between border-t border-border mt-1 pt-2">
          <Link
            to={seller.role === 'seller' ? `/sellers/${seller.id}` : `/buyers/${seller.id}`}
            className="flex items-center gap-1.5 hover:text-primary transition"
            aria-label={`View ${seller.name}'s profile`}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={getAvatarUrl(seller.id, 40)}
              alt={seller.name}
              className="w-5 h-5 rounded-full object-cover border border-border"
            />
            <span className="text-xs text-muted hover:text-primary transition truncate max-w-[80px]">
              {seller.name.split(' ')[0]}
            </span>
          </Link>
          <span className="text-xs text-muted">{formatRelativeDate(listing.created_at)}</span>
        </div>
      )}
    </article>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="skeleton aspect-video" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="flex justify-between mt-2">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}
