
export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};
export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};
const cleanPrice = (price) => {
  if (typeof price === "number") return price;

  if (typeof price === "string") {
    return Number(price.replace(/[^0-9.]/g, "")) || 0;
  }

  return 0;
};

export const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({id: product.id,title: product.title,image: product.image || "",price: cleanPrice(product.price),quantity: 1});
  }
  saveCart(cart);
};
export const updateQuantity = (id, qty) => {
  const cart = getCart().map(item =>item.id === id? { ...item, quantity: Number(qty) || 1 }: item);
  saveCart(cart);
};

export const removeFromCart = (id) => {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};