import { Link, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { profilesApi } from '../../api/profiles'
import { listingsApi } from '../../api/listings'
import { getAvatarUrl, formatRelativeDate } from '../../lib/format'
import { ListingCard, ListingCardSkeleton } from '../../components/ListingCard'

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: profile, isLoading, error } = useSWR(
    id ? `profile:${id}` : null,
    () => profilesApi.getOne(id!)
  )

  const { data: listings, isLoading: listingsLoading } = useSWR(
    id ? `listings:byProfile:${id}` : null,
    () => listingsApi.getByProfile(id!)
  )

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="font-display text-2xl font-bold mb-2">Seller not found</h1>
        <Link to="/sellers" className="text-primary hover:underline">← Back to sellers</Link>
      </div>
    )
  }

  const activeListings = listings?.filter(l => l.status === 'active').length ?? 0

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Profile header */}
      <div className="bg-surface border border-border rounded-md p-6 mb-8 flex flex-col sm:flex-row gap-5 items-start">
        {isLoading ? (
          <div className="flex gap-5 w-full">
            <div className="skeleton w-20 h-20 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-60" />
              <div className="skeleton h-4 w-48" />
            </div>
          </div>
        ) : profile ? (
          <>
            <img
              src={getAvatarUrl(profile.id, 120)}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                <span className="badge badge-seller">🏪 Seller</span>
              </div>
              <p className="text-muted text-sm">@{profile.username}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                <span>📧 {profile.email}</span>
                {profile.phone   && <span>📞 {profile.phone}</span>}
                {profile.city    && <span>📍 {profile.city}</span>}
                {profile.website && (
                  <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    🌐 {profile.website}
                  </a>
                )}
              </div>
              <p className="text-xs text-muted mt-1">Member since {formatRelativeDate(profile.created_at)}</p>
            </div>
            <div className="flex gap-4 text-center shrink-0">
              <StatBadge value={listings?.length ?? 0} label="Listings" />
              <StatBadge value={activeListings} label="Active" color="success" />
            </div>
          </>
        ) : null}
      </div>

      {/* Listings */}
      <section aria-label={`${profile?.name ?? 'Seller'}'s listings`}>
        <h2 className="font-display text-xl font-bold mb-4">Listings</h2>
        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings?.length === 0 ? (
          <p className="text-muted text-sm">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings?.map(listing => (
              <ListingCard key={listing.id} listing={{ ...listing, profiles: profile }} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatBadge({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="text-center">
      <p className={`font-display text-2xl font-black ${color === 'success' ? 'text-success' : 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}
