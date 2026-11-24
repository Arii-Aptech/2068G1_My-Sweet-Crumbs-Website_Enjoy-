
(() => {
  "use strict";

  const products = [
    { id: "strawberry-cloud", name: "Strawberry Cloud Cake", category: "Cakes", price: 58, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85", description: "Vanilla bean sponge, seasonal strawberries and soft whipped cream.", ingredients: "Vanilla sponge, fresh strawberries, cream, free-range eggs, wheat flour.", tag: "Bestseller" },
    { id: "midnight-chocolate", name: "Midnight Chocolate Tart", category: "Chocolates", price: 12, image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=85", description: "Silky dark chocolate ganache in a crisp cocoa shell.", ingredients: "Dark chocolate, cream, cultured butter, wheat flour, cocoa.", tag: "Rich & lovely" },
    { id: "butter-croissant", name: "The Butter Croissant", category: "Pastries", price: 5, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85", description: "Belgian butter, slow-fermented dough and a thousand delicate layers.", ingredients: "Wheat flour, cultured butter, milk, yeast, free-range eggs.", tag: "Baked daily" },
    { id: "rose-macarons", name: "Rose & Raspberry Macarons", category: "Macarons", price: 18, image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=85", description: "Six delicate almond shells filled with rose-raspberry ganache.", ingredients: "Almond flour, egg whites, sugar, raspberries, white chocolate.", tag: "Set of six" },
    { id: "brown-butter-cookie", name: "Brown Butter Cookies", category: "Cookies", price: 14, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=85", description: "A little crisp at the edge, soft in the middle, finished with sea salt.", ingredients: "Wheat flour, brown butter, dark chocolate, brown sugar, sea salt.", tag: "Set of four" },
    { id: "lemon-olive-oil", name: "Lemon Olive Oil Loaf", category: "Cakes", price: 32, image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=85", description: "Bright lemon, grassy olive oil and a tender golden crumb.", ingredients: "Lemon, extra-virgin olive oil, wheat flour, eggs, sugar.", tag: "Seasonal" },
    { id: "pistachio-choux", name: "Pistachio Choux Buns", category: "Pastries", price: 16, image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=85", description: "Six crisp choux buns filled with silky roasted pistachio cream.", ingredients: "Pistachios, cream, eggs, wheat flour, butter.", tag: "Set of six" },
    { id: "chocolate-bonbons", name: "Painted Chocolate Bonbons", category: "Chocolates", price: 22, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=85", description: "Eight hand-painted bonbons with rotating seasonal centers.", ingredients: "Single-origin chocolate, seasonal fruit, cream, cocoa butter.", tag: "Hand-painted" }
  ];
  const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const getCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem("sweetcrumbs-cart") || "[]");
      return Array.isArray(value) ? value.filter(item => item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch (error) {
      console.error("Could not read the shopping bag from local storage.", error);
      return [];
    }
  };
  const saveCart = cart => {
    try { localStorage.setItem("sweetcrumbs-cart", JSON.stringify(cart)); }
    catch (error) { notify("Your bag could not be saved in this browser. Please check your storage settings."); console.error("Could not save shopping bag.", error); }
    updateCount();
  };
  const updateCount = () => {
    const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach(el => { el.textContent = String(count); });
  };
  function notify(message) {
    const container = document.getElementById("toast-container");
    if (!container || !window.bootstrap) { window.alert(message); return; }
    const toast = document.createElement("div");
    toast.className = "toast align-items-center";
    toast.setAttribute("role", "status");
    toast.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
    toast.querySelector(".toast-body").textContent = message;
    container.appendChild(toast);
    const instance = new bootstrap.Toast(toast, { delay: 3000 });
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
    instance.show();
  }
  const addToCart = (id, quantity = 1) => {
    const product = products.find(item => item.id === id);
    if (!product) { notify("This treat is currently unavailable."); return; }
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += quantity;
    else cart.push({ id, quantity });
    saveCart(cart);
    notify(`${product.name} added to your bag.`);
  };
  const cardMarkup = product => `<div class="col-6 col-lg-3"><article class="product-card"><a class="product-image-link" href="product.html?id=${encodeURIComponent(product.id)}"><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-tag">${product.tag}</span></a><div class="product-info"><div class="d-flex justify-content-between gap-2"><h3 class="product-title"><a href="product.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3><span class="product-price">${money(product.price)}</span></div><p class="product-description">${product.description}</p><div class="product-actions"><a class="text-link" href="product.html?id=${encodeURIComponent(product.id)}">Details <span>→</span></a><button class="quick-add" type="button" data-add="${product.id}">Add to bag +</button></div></div></article></div>`;
  const renderCards = (target, items) => { if (target) target.innerHTML = items.map(cardMarkup).join(""); };
  const collectionGrid = document.getElementById("product-grid");
  if (collectionGrid) {
    let activeCategory = new URLSearchParams(location.search).get("category") || "All";
    const search = document.getElementById("product-search");
    const draw = () => {
      const query = search.value.trim().toLowerCase();
      const visible = products.filter(product => (activeCategory === "All" || product.category === activeCategory) && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query));
      renderCards(collectionGrid, visible);
      document.getElementById("results-count").textContent = `${visible.length} ${visible.length === 1 ? "treat" : "treats"}`;
      if (!visible.length) collectionGrid.innerHTML = '<div class="col-12 empty-results">No treats found. Try another search or category.</div>';
      document.querySelectorAll(".filter-btn").forEach(button => button.classList.toggle("active", button.dataset.filter === activeCategory));
    };
    document.querySelectorAll(".filter-btn").forEach(button => button.addEventListener("click", () => { activeCategory = button.dataset.filter; draw(); }));
    search.addEventListener("input", draw);
    draw();
  }
  renderCards(document.getElementById("home-products"), products.slice(0, 4));

  const detail = document.getElementById("product-detail");
  if (detail) {
    const product = products.find(item => item.id === new URLSearchParams(location.search).get("id")) || products[0];
    document.title = `${product.name} | SWEETCRUMBS`;
    document.getElementById("product-breadcrumb").textContent = product.name;
    detail.innerHTML = `<div class="row g-4 product-detail-layout"><div class="col-lg-6"><img class="product-detail-image" src="${product.image}" alt="${product.name}"></div><div class="col-lg-6 product-detail-info"><p class="eyebrow">${product.category.toUpperCase()} · MADE IN SMALL BATCHES</p><h1>${product.name}</h1><div class="price">${money(product.price)}</div><p class="description">${product.description} Prepared fresh in our Brooklyn kitchen with thoughtful ingredients and plenty of care.</p><p class="ingredient-list"><strong>INGREDIENTS</strong><br>${product.ingredients}<br><span class="small-muted">Please contact us about allergens before ordering.</span></p><div class="quantity-row"><label class="visually-hidden" for="detail-quantity">Quantity</label><input class="form-control quantity-input" id="detail-quantity" type="number" min="1" max="20" value="1"><button class="btn btn-burgundy" type="button" id="detail-add">Add to bag · ${money(product.price)}</button></div><p class="small-muted">Baked fresh to order · Pickup at our Brooklyn bakery</p></div></div>`;
    document.getElementById("detail-add").addEventListener("click", () => {
      const input = document.getElementById("detail-quantity");
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) { input.setCustomValidity("Choose a quantity between 1 and 20."); input.reportValidity(); return; }
      input.setCustomValidity("");
      addToCart(product.id, quantity);
    });
    renderCards(document.getElementById("related-products"), products.filter(item => item.id !== product.id).slice(0, 4));
  }

  const cartContent = document.getElementById("cart-content");
  const drawCart = () => {
    if (!cartContent) return;
    const cart = getCart();
    const available = cart.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
    if (!available.length) {
      cartContent.innerHTML = '<div class="empty-cart"><p class="eyebrow">NOTHING IN THE BAG, YET</p><h2>Something sweet is waiting.</h2><p>Take a look at the collection and find a little favorite.</p><a class="btn btn-burgundy mt-2" href="collection.html">Explore the collection <span>→</span></a></div>';
      return;
    }
    const subtotal = available.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    cartContent.innerHTML = `<div class="cart-layout"><div class="cart-lines">${available.map(item => `<div class="cart-line"><a href="product.html?id=${encodeURIComponent(item.id)}"><img src="${item.product.image}" alt="${item.product.name}" loading="lazy"></a><div><h3><a href="product.html?id=${encodeURIComponent(item.id)}">${item.product.name}</a></h3><span class="cart-category">${item.product.category} · ${money(item.product.price)} each</span><div class="d-flex align-items-center gap-3 mt-2"><label class="visually-hidden" for="qty-${item.id}">Quantity of ${item.product.name}</label><input class="form-control quantity-input cart-quantity" id="qty-${item.id}" type="number" min="1" max="20" value="${item.quantity}" data-quantity="${item.id}"><button type="button" class="remove-item" data-remove="${item.id}">Remove</button></div></div><strong data-line-total="${item.id}">${money(item.product.price * item.quantity)}</strong></div>`).join("")}</div><aside class="cart-summary"><h2>Order summary</h2><div class="summary-row"><span>Subtotal</span><strong data-subtotal>${money(subtotal)}</strong></div><div class="summary-row"><span>Pickup</span><span>Arranged at checkout</span></div><div class="summary-row summary-total"><span>Total</span><strong data-subtotal>${money(subtotal)}</strong></div><div class="checkout-panel"><form id="checkout-form"><h3 class="h6 mb-3">Pickup details</h3><label class="form-label" for="checkout-name">Your name</label><input class="form-control mb-3" id="checkout-name" required><label class="form-label" for="checkout-email">Email address</label><input class="form-control mb-3" type="email" id="checkout-email" required><label class="form-label" for="pickup-date">Preferred pickup date</label><input class="form-control mb-3" type="date" id="pickup-date" required><button class="btn btn-burgundy w-100" type="submit">Request pickup</button><p class="small-muted mt-3 mb-0">Demo checkout only — no payment is processed and no order is sent.</p></form></div></aside></div>`;
    cartContent.querySelectorAll("[data-quantity]").forEach(input => input.addEventListener("change", () => {
      const value = Number(input.value);
      if (!Number.isInteger(value) || value < 1 || value > 20) {
        input.setCustomValidity("Choose a quantity between 1 and 20.");
        input.reportValidity();
        return;
      }
      input.setCustomValidity("");
      const next = getCart().map(item => item.id === input.dataset.quantity ? { ...item, quantity: value } : item);
      saveCart(next);
      const updatedSubtotal = next.reduce((sum, item) => {
        const product = products.find(candidate => candidate.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0);
      const product = products.find(item => item.id === input.dataset.quantity);
      cartContent.querySelector(`[data-line-total="${input.dataset.quantity}"]`).textContent = money(product.price * value);
      cartContent.querySelectorAll("[data-subtotal]").forEach(element => { element.textContent = money(updatedSubtotal); });
    }));
    cartContent.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      saveCart(getCart().filter(item => item.id !== button.dataset.remove));
      drawCart();
      notify("Treat removed from your bag.");
    }));
    document.getElementById("checkout-form").addEventListener("submit", event => {
      event.preventDefault();
      if (!event.currentTarget.reportValidity()) return;
      notify("Pickup request noted for this demo. No order has been sent.");
    });
  };
  drawCart();

  const cakeForm = document.getElementById("cake-form");
  if (cakeForm) {
    const size = document.getElementById("cake-size");
    const estimate = document.getElementById("cake-estimate");
    const basePrices = { "6": 48, "8": 68, "10": 92, "12": 125 };
    const updateEstimate = () => { estimate.textContent = basePrices[size.value] ? `from ${money(basePrices[size.value])}` : "$—"; };
    size.addEventListener("change", updateEstimate);
    const eventDate = document.getElementById("cake-event");
    const minimumDate = new Date();
    minimumDate.setHours(0, 0, 0, 0);
    minimumDate.setDate(minimumDate.getDate() + 7);
    eventDate.min = `${minimumDate.getFullYear()}-${String(minimumDate.getMonth() + 1).padStart(2, "0")}-${String(minimumDate.getDate()).padStart(2, "0")}`;
    eventDate.addEventListener("input", () => eventDate.setCustomValidity(""));
    cakeForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!cakeForm.reportValidity()) return;
      const selectedDate = new Date(`${eventDate.value}T00:00:00`);
      if (selectedDate < minimumDate) { eventDate.setCustomValidity("Please choose a date at least 7 days from today."); eventDate.reportValidity(); return; }
      eventDate.setCustomValidity("");
      notify("Thank you! Your cake consultation request is ready. This demo does not send it to the bakery.");
      cakeForm.reset(); updateEstimate();
    });
  }

  document.querySelectorAll("[data-newsletter]").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    notify("You're on the list. Thank you for joining us!");
    form.reset();
  }));
  const contactForm = document.getElementById("contact-form");
  if (contactForm) contactForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    notify("Thanks for your note! This demo form does not send messages.");
    contactForm.reset();
  });
  const topButton = document.querySelector(".back-to-top");
  if (topButton) {
    window.addEventListener("scroll", () => topButton.classList.toggle("visible", window.scrollY > 400), { passive: true });
    topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(button.dataset.add);
  });
  updateCount();
})();
