
import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const sampleProducts = [
  {
    _id: "p1",
    name: "Wireless Headphones",
    category: "Electronics",
    price: 79.99,
    stock: 15,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
    description: "Premium wireless headphones with rich sound and comfortable ear cushions.",
  },
  {
    _id: "p2",
    name: "Classic Wrist Watch",
    category: "Accessories",
    price: 119.99,
    stock: 8,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    description: "A minimalist watch designed for everyday style.",
  },
  {
    _id: "p3",
    name: "Running Sneakers",
    category: "Fashion",
    price: 64.99,
    stock: 20,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
    description: "Lightweight sneakers for daily wear and active lifestyles.",
  },
  {
    _id: "p4",
    name: "Modern Backpack",
    category: "Accessories",
    price: 49.99,
    stock: 12,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
    description: "A versatile backpack with practical everyday storage.",
  },
  {
    _id: "p5",
    name: "Smart Camera",
    category: "Electronics",
    price: 249.99,
    stock: 6,
    featured: true,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700",
    description: "Capture memorable moments with a compact digital camera.",
  },
  {
    _id: "p6",
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 18.99,
    stock: 30,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=700",
    description: "A simple ceramic mug for your morning coffee or tea.",
  },
  {
    _id: "p7",
    name: "Sunglasses",
    category: "Fashion",
    price: 34.99,
    stock: 18,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700",
    description: "Everyday sunglasses with a timeless, modern look.",
  },
  {
    _id: "p8",
    name: "Desk Lamp",
    category: "Home",
    price: 39.99,
    stock: 10,
    featured: false,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
    description: "A clean, contemporary lamp for your workspace.",
  },
];

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [products, setProducts] = useState(sampleProducts);
  const [cart, setCart] = useState(() => readStored("shopsphere-cart", []));
  const [wishlist, setWishlist] = useState(() =>
    readStored("shopsphere-wishlist", [])
  );
  const [user, setUser] = useState(() => readStored("shopsphere-user", null));
  const [token, setToken] = useState(
    () => localStorage.getItem("shopsphere-token") || ""
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [activePage, setActivePage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    localStorage.setItem("shopsphere-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("shopsphere-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) localStorage.setItem("shopsphere-user", JSON.stringify(user));
    else localStorage.removeItem("shopsphere-user");
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Could not load products");

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.products;

        if (!cancelled && Array.isArray(items) && items.length) {
          setProducts(items);
        }
      } catch {
        // Use sample products when the API is not running.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 2800);
    return () => clearTimeout(timeout);
  }, [notice]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.description || ""} ${
        product.category
      }`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesWishlist =
        activePage !== "wishlist" ||
        wishlist.includes(String(product._id));

      return matchesSearch && matchesCategory && matchesWishlist;
    });

    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") {
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
  }, [products, search, category, sort, activePage, wishlist]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 || subtotal === 0 ? 0 : 7.99;
  const total = subtotal + shippingCost;

  function addToCart(product) {
    if (product.stock === 0) {
      setNotice("This product is currently out of stock.");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => String(item._id) === String(product._id)
      );

      if (existing) {
        return current.map((item) =>
          String(item._id) === String(product._id)
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock || 99),
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to your cart.`);
  }

  function updateQuantity(id, change) {
    setCart((current) =>
      current
        .map((item) => {
          if (String(item._id) !== String(id)) return item;
          const max = item.stock || 99;
          return { ...item, quantity: Math.min(max, item.quantity + change) };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleWishlist(product) {
    const id = String(product._id);
    const exists = wishlist.includes(id);

    setWishlist((current) =>
      exists ? current.filter((itemId) => itemId !== id) : [...current, id]
    );
    setNotice(exists ? "Removed from wishlist." : "Added to wishlist.");
  }

  async function handleAuth(event) {
    event.preventDefault();

    const endpoint =
      authMode === "login" ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      const authToken = data.token || data.accessToken;
      const account = data.user || data;

      if (authToken) {
        localStorage.setItem("shopsphere-token", authToken);
        setToken(authToken);
      }

      setUser({
        _id: account._id,
        name: account.name || authForm.name || authForm.email.split("@")[0],
        email: account.email || authForm.email,
        role: account.role || "user",
      });

      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      setNotice("You are now signed in.");
    } catch (error) {
      setNotice(error.message || "Unable to sign in. Please try again.");
    }
  }

  function logout() {
    localStorage.removeItem("shopsphere-token");
    setToken("");
    setUser(null);
    setNotice("You have been signed out.");
  }

  async function placeOrder(event) {
    event.preventDefault();

    if (!cart.length) {
      setNotice("Your cart is empty.");
      return;
    }

    const orderItems = cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: shipping,
          paymentMethod: "demo",
          subtotal,
          shippingCost,
          total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not place the order.");
      }

      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setActivePage("home");
      setNotice(`Order placed successfully${data.orderNumber ? `: ${data.orderNumber}` : "!"}`);
    } catch (error) {
      // If the backend is unavailable, keep the demo checkout usable.
      if (!navigator.onLine) {
        setNotice("You appear to be offline. Please reconnect and try again.");
        return;
      }

      const isApiUnavailable =
        error instanceof TypeError ||
        /failed to fetch|networkerror/i.test(error.message);

      if (isApiUnavailable) {
        const demoOrder = {
          orderNumber: `DEMO-${Date.now().toString().slice(-7)}`,
          items: cart,
          shipping,
          total,
          createdAt: new Date().toISOString(),
        };

        const history = readStored("shopsphere-demo-orders", []);
        localStorage.setItem(
          "shopsphere-demo-orders",
          JSON.stringify([demoOrder, ...history])
        );

        setCart([]);
        setCheckoutOpen(false);
        setCartOpen(false);
        setActivePage("home");
        setNotice(`Demo order confirmed: ${demoOrder.orderNumber}`);
        return;
      }

      setNotice(error.message || "Checkout failed. Please try again.");
    }
  }

  function openCheckout() {
    if (!cart.length) {
      setNotice("Add a product before checking out.");
      return;
    }

    if (user) {
      setShipping((current) => ({
        ...current,
        name: current.name || user.name || "",
        email: current.email || user.email || "",
      }));
    }

    setCartOpen(false);
    setCheckoutOpen(true);
  }

  const pageTitle =
    activePage === "wishlist"
      ? "Your Wishlist"
      : search
        ? "Search Results"
        : category !== "All"
          ? category
          : "Discover Our Collection";

  return (
    <div className="shop-app">
      <div className="announcement">
        <span>Free shipping on orders over $100</span>
        <span className="announcement-right">Thoughtful finds. Better living.</span>
      </div>

      <header className="site-header">
        <a
          className="brand"
          href="#home"
          onClick={() => {
            setActivePage("home");
            setCategory("All");
          }}
        >
          <span className="brand-mark">S</span>
          <span>Shop<span className="brand-accent">Sphere</span></span>
        </a>

        <form
          className="header-search"
          onSubmit={(event) => {
            event.preventDefault();
            setActivePage("home");
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search products"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setActivePage("home");
            }}
            placeholder="Search for products..."
          />
          <button type="submit">Search</button>
        </form>

        <nav className="header-actions" aria-label="Main navigation">
          <button
            className={`icon-button ${activePage === "wishlist" ? "active" : ""}`}
            onClick={() => setActivePage("wishlist")}
            aria-label="Open wishlist"
            title="Wishlist"
          >
            ♡ <span className="action-label">Wishlist</span>
          </button>

          {user ? (
            <button className="account-button" onClick={logout} title="Sign out">
              <span className="account-avatar">
                {(user.name || "U").charAt(0).toUpperCase()}
              </span>
              <span className="action-label">{user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              className="icon-button"
              onClick={() => {
                setAuthMode("login");
                setAuthOpen(true);
              }}
            >
              ♙ <span className="action-label">Account</span>
            </button>
          )}

          <button
            className="icon-button cart-action"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartCount} items`}
          >
            ♧ <span className="action-label">Cart</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </nav>
      </header>

      <main>
        {activePage === "home" && (
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow">THE EVERYDAY EDIT</span>
              <h1>Good things.<br /><span>Better living.</span></h1>
              <p>
                Discover thoughtfully selected essentials that bring style,
                comfort, and simplicity to your everyday life.
              </p>
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById("products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore collection <span aria-hidden="true">→</span>
              </button>
              <div className="hero-trust">
                <span>✓ Carefully selected</span>
                <span>✓ Easy demo checkout</span>
              </div>
            </div>
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
                alt="Modern retail store interior"
              />
              <div className="hero-image-note">
                <span className="note-dot" />
                <div>
                  <strong>Everyday favorites</strong>
                  <small>Made for your lifestyle</small>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="catalog-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SHOP YOUR WAY</span>
              <h2>{pageTitle}</h2>
              <p className="section-description">
                Find something you'll love, every time.
              </p>
            </div>

            <label className="sort-control">
              <span>Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          <div className="category-list" aria-label="Product categories">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-chip ${category === item ? "selected" : ""}`}
                onClick={() => {
                  setCategory(item);
                  setActivePage("home");
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && (
            <p className="loading-message">Loading products...</p>
          )}

          <div className="product-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(String(product._id));

              return (
                <article className="product-card" key={product._id}>
                  <div className="product-image-wrap">
                    <img
                      className="product-image"
                      src={
                        product.image ||
                        "https://placehold.co/700x700/f4f3ef/333333?text=ShopSphere"
                      }
                      alt={product.name}
                      loading="lazy"
                    />

                    {product.featured && (
                      <span className="product-badge">Featured</span>
                    )}

                    <button
                      className={`wishlist-button ${isWishlisted ? "wishlisted" : ""}`}
                      onClick={() => toggleWishlist(product)}
                      aria-label={
                        isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                      }
                      title="Toggle wishlist"
                    >
                      {isWishlisted ? "♥" : "♡"}
                    </button>

                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of stock" : "＋ Add to cart"}
                    </button>
                  </div>

                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <div className="product-bottom">
                      <span className="product-price">{money(product.price)}</span>
                      <span className="stock-label">
                        {product.stock > 0 ? "In stock" : "Sold out"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">⌕</span>
              <h3>No products found</h3>
              <p>Try another search term or choose a different category.</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setActivePage("home");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="benefits-section">
          <div className="benefit-item">
            <span className="benefit-icon">↗</span>
            <div>
              <h3>Quality picks</h3>
              <p>Products selected with care.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">◇</span>
            <div>
              <h3>Simple shopping</h3>
              <p>A clean and easy experience.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <div>
              <h3>Demo checkout</h3>
              <p>No real payment is collected.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">S</span>
          <span>Shop<span className="brand-accent">Sphere</span></span>
        </a>
        <p>Thoughtful finds for everyday living.</p>
        <small>© {new Date().getFullYear()} ShopSphere. Demo e-commerce project.</small>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <span>✓</span> {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCartOpen(false);
        }}>
          <aside className="side-panel" aria-label="Shopping cart">
            <div className="panel-header">
              <div>
                <span className="eyebrow">YOUR SELECTION</span>
                <h2>Shopping cart ({cartCount})</h2>
              </div>
              <button className="close-button" onClick={() => setCartOpen(false)}>
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state cart-empty">
                <span className="empty-icon">♧</span>
                <h3>Your cart is empty</h3>
                <p>Discover something special and add it to your cart.</p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    document.getElementById("products")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  Browse products
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p>{money(item.price)}</p>
                        <div className="quantity-control">
                          <button onClick={() => updateQuantity(item._id, -1)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            disabled={item.quantity >= (item.stock || 99)}
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() =>
                          setCart((current) =>
                            current.filter(
                              (entry) => String(entry._id) !== String(item._id)
                            )
                          )
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div><span>Shipping</span><strong>{shippingCost === 0 ? "Free" : money(shippingCost)}</strong></div>
                  <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
                  <p className="demo-note">Demo checkout only. No real payment is taken.</p>
                  <button className="primary-button full-button" onClick={openCheckout}>
                    Continue to checkout <span>→</span>
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {authOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthOpen(false);
        }}>
          <section className="dialog-card" aria-label="Account form">
            <button className="close-button dialog-close" onClick={() => setAuthOpen(false)}>
              ×
            </button>
            <span className="brand-mark large-mark">S</span>
            <span className="eyebrow">WELCOME TO SHOPSPHERE</span>
            <h2>{authMode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="dialog-description">
              {authMode === "login"
                ? "Sign in to continue shopping."
                : "Join us for a more personal shopping experience."}
            </p>

            <form className="form-stack" onSubmit={handleAuth}>
              {authMode === "register" && (
                <label>
                  Full name
                  <input
                    required
                    value={authForm.name}
                    onChange={(event) =>
                      setAuthForm({ ...authForm, name: event.target.value })
                    }
                    placeholder="Your name"
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  required
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, email: event.target.value })
                  }
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  minLength={6}
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, password: event.target.value })
                  }
                  placeholder="At least 6 characters"
                />
              </label>
              <button className="primary-button full-button" type="submit">
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="switch-auth">
              {authMode === "login" ? "New to ShopSphere?" : "Already have an account?"}{" "}
              <button
                onClick={() =>
                  setAuthMode((mode) => mode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>
          </section>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCheckoutOpen(false);
        }}>
          <section className="dialog-card checkout-dialog" aria-label="Demo checkout">
            <button className="close-button dialog-close" onClick={() => setCheckoutOpen(false)}>
              ×
            </button>
            <span className="eyebrow">ALMOST THERE</span>
            <h2>Checkout</h2>
            <p className="dialog-description">
              Enter delivery details. This is a demo checkout and does not collect payment.
            </p>

            <form className="form-stack" onSubmit={placeOrder}>
              <label>
                Full name
                <input
                  required
                  value={shipping.name}
                  onChange={(event) => setShipping({ ...shipping, name: event.target.value })}
                  placeholder="Your full name"
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  value={shipping.email}
                  onChange={(event) => setShipping({ ...shipping, email: event.target.value })}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Delivery address
                <input
                  required
                  value={shipping.address}
                  onChange={(event) => setShipping({ ...shipping, address: event.target.value })}
                  placeholder="Street address"
                />
              </label>
              <div className="form-row">
                <label>
                  City
                  <input
                    required
                    value={shipping.city}
                    onChange={(event) => setShipping({ ...shipping, city: event.target.value })}
                    placeholder="City"
                  />
                </label>
                <label>
                  Postal code
                  <input
                    required
                    value={shipping.postalCode}
                    onChange={(event) => setShipping({ ...shipping, postalCode: event.target.value })}
                    placeholder="Postal code"
                  />
                </label>
              </div>

              <div className="checkout-total">
                <span>Order total</span>
                <strong>{money(total)}</strong>
              </div>

              <div className="demo-payment-notice">
                <strong>Demo payment</strong>
                <p>No card details required. No real money will be charged.</p>
              </div>

              <button className="primary-button full-button" type="submit">
                Place demo order <span>→</span>
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
