import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function RootLayout() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('theme-dark')
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('theme-dark', next)
    localStorage.setItem('bazaar-theme', next ? 'dark' : 'light')
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/listings?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl font-bold text-foreground hover:text-primary transition-colors shrink-0"
            aria-label="Bazaar home"
          >
            Bazaar
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-lg">
            <div className="relative w-full">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search listings…"
                aria-label="Search listings"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
            </div>
          </form>

          {/* Nav links — desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <AppNavLink to="/listings">Browse</AppNavLink>
            <AppNavLink to="/sellers">Sellers</AppNavLink>
            <AppNavLink to="/buyers">Buyers</AppNavLink>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="ml-2 p-2 rounded-md border border-border hover:bg-surface-elevated transition text-muted hover:text-foreground"
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <Link
              to="/listings/new"
              className="ml-2 px-4 py-2 bg-primary text-primary-fg text-sm font-semibold rounded-md hover:opacity-90 transition"
            >
              + Post Ad
            </Link>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-md border border-border text-muted">
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-md border border-border text-muted"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-2">
            <form onSubmit={handleSearch}>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search listings…"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </form>
            <Link to="/listings" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium hover:text-primary transition">Browse Listings</Link>
            <Link to="/sellers"  onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium hover:text-primary transition">Sellers</Link>
            <Link to="/buyers"   onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium hover:text-primary transition">Buyers</Link>
            <Link to="/listings/new" onClick={() => setMenuOpen(false)} className="py-2 text-center bg-primary text-primary-fg text-sm font-semibold rounded-md">+ Post Ad</Link>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-surface mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-xl font-bold">Bazaar</span>
            <p className="mt-2 text-sm text-muted">Modern classified ads marketplace. Buy and sell anything.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/listings" className="hover:text-primary transition">All Listings</Link></li>
              <li><Link to="/listings/new" className="hover:text-primary transition">Post an Ad</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Community</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/sellers" className="hover:text-primary transition">Sellers</Link></li>
              <li><Link to="/buyers"  className="hover:text-primary transition">Buyers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Trust & Safety</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-primary transition">Safety Tips</a></li>
              <li><a href="#" className="hover:text-primary transition">Report a Listing</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border px-4 sm:px-6 py-4 text-center text-xs text-muted">
          © {new Date().getFullYear()} Bazaar. Modern classified ads marketplace.
        </div>
      </footer>
    </div>
  )
}

function AppNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'px-3 py-2 text-sm font-medium text-foreground rounded-md bg-surface-elevated'
          : 'px-3 py-2 text-sm font-medium text-muted hover:text-foreground rounded-md hover:bg-surface-elevated transition'
      }
    >
      {children}
    </NavLink>
  )
}
