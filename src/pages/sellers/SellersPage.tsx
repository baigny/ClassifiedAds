import { Link } from 'react-router-dom'
import useSWR from 'swr'
import { profilesApi } from '../../api/profiles'
import { getAvatarUrl } from '../../lib/format'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import type { Profile } from '../../types'

export default function SellersPage() {
  const { data: sellers, isLoading, error } = useSWR(
    'profiles:sellers',
    profilesApi.getSellers
  )

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Verified Sellers</h1>
      <p className="text-muted mb-8">Browse our trusted sellers and explore their listings.</p>

      {error && <ErrorMessage message={(error as Error).message} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SellerCardSkeleton key={i} />)
          : (sellers ?? []).map(seller => <SellerCard key={seller.id} seller={seller} />)
        }
      </div>
    </div>
  )
}

function SellerCard({ seller }: { seller: Profile }) {
  return (
    <Link
      to={`/sellers/${seller.id}`}
      className="bg-surface border border-border rounded-md p-5 flex items-start gap-4 card-lift hover:border-primary/30 transition"
    >
      <img
        src={getAvatarUrl(seller.id, 80)}
        alt={seller.name}
        className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="font-semibold truncate">{seller.name}</h2>
          <span className="badge badge-seller shrink-0">Seller</span>
        </div>
        <p className="text-xs text-muted truncate">@{seller.username}</p>
        <p className="text-xs text-muted truncate mt-1">{seller.email}</p>
        {seller.city && <p className="text-xs text-muted mt-0.5">📍 {seller.city}</p>}
        <p className="text-xs text-primary mt-2 font-medium">View listings →</p>
      </div>
    </Link>
  )
}

function SellerCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-md p-5 flex items-start gap-4">
      <div className="skeleton w-14 h-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  )
}
