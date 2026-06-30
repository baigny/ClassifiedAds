import { Routes, Route } from 'react-router-dom'
import RootLayout from './pages/RootLayout'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/listings/ListingsPage'
import NewListingPage from './pages/listings/NewListingPage'
import ListingDetailPage from './pages/listings/ListingDetailPage'
import SellersPage from './pages/sellers/SellersPage'
import SellerDetailPage from './pages/sellers/SellerDetailPage'
import BuyersPage from './pages/buyers/BuyersPage'
import BuyerDetailPage from './pages/buyers/BuyerDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="listings">
          <Route index element={<ListingsPage />} />
          <Route path="new" element={<NewListingPage />} />
          <Route path=":id" element={<ListingDetailPage />} />
        </Route>
        <Route path="sellers">
          <Route index element={<SellersPage />} />
          <Route path=":id" element={<SellerDetailPage />} />
        </Route>
        <Route path="buyers">
          <Route index element={<BuyersPage />} />
          <Route path=":id" element={<BuyerDetailPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
