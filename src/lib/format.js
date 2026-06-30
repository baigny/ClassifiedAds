/**
 * Pure formatting utilities — no API calls, no side effects.
 */

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

/** Convert an ISO date string to a human-friendly relative label. */
export function formatRelativeDate(isoString) {
  if (!isoString) return ''
  const diffMs   = Date.now() - new Date(isoString).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30)  return `${diffDays} days ago`
  const diffMonths = Math.floor(diffDays / 30)
  return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`
}

/**
 * Deterministic avatar for a profile UUID (uses pravatar.cc for demo).
 * Derives a stable 1-70 index from the UUID so avatars don't change on refresh.
 */
export function getAvatarUrl(profileId, size = 80) {
  if (!profileId) return `https://i.pravatar.cc/${size}?img=1`
  const clean = profileId.replace(/-/g, '')
  const num   = (parseInt(clean.slice(-4), 16) % 70) + 1
  return `https://i.pravatar.cc/${size}?img=${num}`
}

/**
 * Returns the first image from a listing's images array,
 * falling back to a coloured placeholder.
 */
export function getListingThumbnail(listing) {
  if (listing?.images?.length) return listing.images[0]
  const colors  = ['2c3e50', 'e74c3c', '3498db', '2ecc71', '9b59b6', 'f39c12', '1abc9c', 'e67e22', '34495e', 'c0392b']
  const seed    = listing?.id ? listing.id.replace(/-/g, '').charCodeAt(0) : 0
  const color   = colors[seed % colors.length]
  const label   = encodeURIComponent((listing?.title ?? 'Listing').slice(0, 12))
  return `https://placehold.co/400x300/${color}/ffffff?text=${label}`
}
