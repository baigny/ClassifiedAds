export const CATEGORIES = [
  { id: 'electronics',  label: 'Electronics',   icon: '💻' },
  { id: 'vehicles',     label: 'Vehicles',       icon: '🚗' },
  { id: 'furniture',    label: 'Furniture',      icon: '🪑' },
  { id: 'fashion',      label: 'Fashion',        icon: '👗' },
  { id: 'home-garden',  label: 'Home & Garden',  icon: '🌿' },
  { id: 'sports',       label: 'Sports',         icon: '⚽' },
  { id: 'books',        label: 'Books & Media',  icon: '📚' },
  { id: 'toys',         label: 'Toys & Games',   icon: '🎮' },
  { id: 'services',     label: 'Services',       icon: '🛠️' },
  { id: 'other',        label: 'Other',          icon: '📦' },
]

export function getAllCategories() {
  return CATEGORIES
}

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
