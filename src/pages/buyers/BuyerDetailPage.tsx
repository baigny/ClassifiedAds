import { Link, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { profilesApi } from '../../api/profiles'
import { listingsApi } from '../../api/listings'
import { getAvatarUrl, formatRelativeDate } from '../../lib/format'
import { ErrorMessage } from '../../components/ui/ErrorMessage'

export default function BuyerDetailPage() {
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
        <h1 className="font-display text-2xl font-bold mb-2">Buyer not found</h1>
        <Link to="/buyers" className="text-primary hover:underline">← Back to buyers</Link>
      </div>
    )
  }

  return (
    <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="bg-surface border border-border rounded-md p-6 mb-8">
        {isLoading ? (
          <div className="flex gap-5">
            <div className="skeleton w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-4 w-64" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={getAvatarUrl(profile.id, 120)}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                <span className="badge badge-buyer">🛍️ Buyer</span>
              </div>
              <p className="text-muted text-sm">@{profile.username}</p>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                <span>📧 {profile.email}</span>
                {profile.phone && <span>📞 {profile.phone}</span>}
                {profile.city  && <span>📍 {profile.city}</span>}
              </div>
              <p className="text-xs text-muted mt-1">Member since {formatRelativeDate(profile.created_at)}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Also Selling — buyers can post listings too */}
      {(listingsLoading || (listings && listings.length > 0)) && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-3">Also Selling</h2>
          {listingsLoading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="skeleton h-20 rounded-md" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings!.slice(0, 4).map(listing => (
                <Link
                  key={listing.id}
                  to={`/listings/${listing.id}`}
                  className="bg-surface border border-border rounded-md p-4 hover:border-primary/30 card-lift"
                >
                  <p className="font-medium text-sm capitalize line-clamp-2">{listing.title}</p>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{listing.body}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Contact card */}
      {!isLoading && profile && (
        <div className="bg-surface border border-border rounded-md p-5 text-sm">
          <h2 className="font-semibold mb-3">Contact</h2>
          <div className="space-y-1.5 text-muted">
            <p>📧 {profile.email}</p>
            {profile.phone && <p>📞 {profile.phone}</p>}
            {profile.city  && <p>📍 {profile.city}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
