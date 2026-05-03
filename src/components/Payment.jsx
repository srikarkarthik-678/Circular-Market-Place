import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../utils/api";

const Payment = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("checkoutCart")) || [];
    setCart(data);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const { data: order } = await axios.post(
        `${BASE_URL}/api/payment/create-order`,
        { amount: total }
      );

      const options = {
        key: "rzp_test_Si7bDm7aWWNb78",
        amount: order.amount,
        currency: "INR",
        name: "My Store",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response) {
          const verify = await axios.post(
            `${BASE_URL}/api/payment/verify`,
            response
          );

          if (verify.data.success) {
            const username = localStorage.getItem("username");

            for (const item of cart) {
              await axios.put(`${BASE_URL}/purchase/${item.id}`, { buyer: username });
            }

            alert("Payment Successful 🎉");
            localStorage.removeItem("checkoutCart");
            window.location.href = "/";
          } else {
            alert("Payment verification failed");
          }
        },

        theme: { color: "#facc15" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 font-mono">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-lg mb-2">Delivery Address</h2>
            <p className="text-gray-600 text-sm">Karthik, Hyderabad, Telangana - 500001</p>
            <button className="text-blue-600 text-sm mt-2">Change</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="font-semibold text-lg mb-4">Order Items</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-3">
                <div className="flex items-center gap-4">
                  <img src={item.image || "https://via.placeholder.com/60"} alt="" className="w-14 h-14 object-cover rounded" />
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit sticky top-6">
          <h2 className="font-semibold text-lg mb-4">Price Details</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Items Total</span><span>₹{total}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span className="text-green-600">FREE</span></div>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total Amount</span><span>₹{total}</span>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-lg font-semibold transition ${loading ? "bg-gray-400" : "bg-black hover:bg-yellow-600 text-white"}`}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">🔒 Safe & Secure Payments</p>
        </div>
      </div>
    </div>
  );
};

export default Payment;