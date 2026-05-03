import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Hero2 from './components/Hero2'
import Hero3 from './components/Hero3'
import Hero4 from './components/Hero4'
import Contactform from './components/Contactform'
import Login from './components/Login'
import Sell from './components/Sell'
import { Routes, Route } from "react-router-dom";
import Explore from './components/Explore'
import ProductDetails from './components/ProductDetails'
import Cart from './components/Cart'
import Payment from './components/Payment'
import Repair from './components/Repair'
import MySellItems from './components/MySellItems'
import MyOrders from './components/MyOrders'
import RepairRequests from './components/RepairRequests'
import AdminRepairApprovals from './components/AdminRepairApprovals'
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Hero />
            <Hero2 />
            <Hero3 />
            <Hero4 />
            <Contactform />
          </>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/explore/sell" element={<Sell />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/repair" element={<Repair />} />
      <Route path="/my-products" element={<MySellItems />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/repair-requests" element={<RepairRequests />} />
      <Route path="/admin/repair-approvals" element={<AdminRepairApprovals />} />
    </Routes>
  )
}

export default App