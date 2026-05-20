// eSHOP Electronics - Unified Operations Dashboard Controller

let activeRole = "client";
let activeClientFilter = "All";
let selectedPaymentMethod = "Momo Pay";
let currentHRUser = null;
let currentWorkerUser = null;
let currentManagerUser = null;
let currentSupervisorUser = null;
let clientCart = [];

// --- CART OPERATIONS ---
function addToCart(productId) {
  const prod = eshopStore.state.products.find(p => p.id === productId);
  if (!prod) return;

  if (prod.stock <= 0) {
    showToast("Sorry, this item is out of stock!", "alert");
    return;
  }

  const existing = clientCart.find(item => item.productId === productId);
  if (existing) {
    if (existing.qty >= prod.stock) {
      showToast(`Cannot add more. Only ${prod.stock} units available in warehouse.`, "alert");
      return;
    }
    existing.qty++;
  } else {
    clientCart.push({ productId, qty: 1 });
  }

  showToast(`Added ${prod.name} to cart!`, "success");
  updateCartUI();
}

function adjustCartQty(productId, delta) {
  const prod = eshopStore.state.products.find(p => p.id === productId);
  if (!prod) return;

  const item = clientCart.find(i => i.productId === productId);
  if (!item) return;

  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQty > prod.stock) {
    showToast(`Cannot adjust. Only ${prod.stock} units available in warehouse.`, "alert");
    return;
  }

  item.qty = newQty;
  updateCartUI();
}

function removeFromCart(productId) {
  clientCart = clientCart.filter(item => item.productId !== productId);
  showToast("Item removed from cart.", "info");
  updateCartUI();
}

function updateCartUI() {
  const listContainer = document.getElementById("cart-items-list");
  const totalSpan = document.getElementById("cart-total-amount");
  const payBtn = document.getElementById("cart-pay-btn");
  if (!listContainer) return;

  listContainer.innerHTML = "";
  let total = 0;

  if (clientCart.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.85rem;">
        Your cart is empty.<br>Select items from the catalog.
      </div>
    `;
    totalSpan.textContent = "$0";
    payBtn.disabled = true;
    payBtn.classList.add("btn-secondary");
    payBtn.classList.remove("btn-primary");
    return;
  }

  payBtn.disabled = false;
  payBtn.classList.remove("btn-secondary");
  payBtn.classList.add("btn-primary");

  clientCart.forEach(item => {
    const prod = eshopStore.state.products.find(p => p.id === item.productId);
    if (!prod) return;

    const itemTotal = prod.price * item.qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.background = "var(--bg-app)";
    div.style.padding = "0.6rem";
    div.style.borderRadius = "8px";
    div.style.fontSize = "0.85rem";
    div.style.marginBottom = "0.5rem";
    div.innerHTML = `
      <div style="max-width: 50%;">
        <strong style="color: var(--color-primary);">${prod.name}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">$${prod.price} each</div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.4rem;">
        <button class="btn" onclick="adjustCartQty('${prod.id}', -1)" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: var(--bg-card); min-width: 20px;">-</button>
        <span style="font-weight: 700; min-width: 15px; text-align: center;">${item.qty}</span>
        <button class="btn" onclick="adjustCartQty('${prod.id}', 1)" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: var(--bg-card); min-width: 20px;">+</button>
        <button class="btn" onclick="removeFromCart('${prod.id}')" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: var(--color-danger-bg); color: var(--color-danger); min-width: 20px; margin-left: 0.2rem;">🗑️</button>
      </div>
    `;
    listContainer.appendChild(div);
  });

  totalSpan.textContent = `$${total.toLocaleString()}`;
}

function proceedToCartCheckout() {
  if (clientCart.length === 0) return;

  let total = 0;
  let itemsSummaryMarkup = `<div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 150px; overflow-y: auto; margin-bottom: 0.8rem;">`;
  
  clientCart.forEach(item => {
    const prod = eshopStore.state.products.find(p => p.id === item.productId);
    if (!prod) return;
    const itemTotal = prod.price * item.qty;
    total += itemTotal;
    itemsSummaryMarkup += `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
        <span>${prod.name} <strong>(x${item.qty})</strong></span>
        <strong>$${itemTotal}</strong>
      </div>
    `;
  });
  itemsSummaryMarkup += `</div>`;

  document.getElementById("checkout-product-id").value = "cart";
  document.getElementById("checkout-amount").value = total;

  const detailsDiv = document.getElementById("checkout-product-details");
  detailsDiv.innerHTML = `
    <h4 style="color:var(--color-primary); margin-bottom: 0.6rem;">🛒 Your Cart Purchase Details</h4>
    ${itemsSummaryMarkup}
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:1.05rem; font-weight:800; color:var(--color-primary); border-top: 1px solid var(--color-accent); padding-top: 0.6rem;">
      <span>Grand Total:</span>
      <span>$${total}</span>
    </div>
  `;

  selectPaymentMethod("Momo Pay");
  
  const client = eshopStore.state.activeClient;
  if (client) {
    document.getElementById("checkout-momo-number").value = client.phone;
  }

  const nameConfirmCheck = document.getElementById("checkout-name-confirm");
  if (nameConfirmCheck) {
    nameConfirmCheck.checked = false;
  }

  openModal("modal-purchase-checkout");
}

function handleHRAnnouncementSubmit(e) {
  e.preventDefault();
  const text = document.getElementById("hr-ann-text").value.trim();
  const checkboxes = document.querySelectorAll(".hr-ann-target:checked");
  
  if (!text) return;
  if (checkboxes.length === 0) {
    showToast("Please select at least one target audience role.", "alert");
    return;
  }

  const audiences = Array.from(checkboxes).map(cb => cb.value).join(", ");
  eshopStore.createDirectAnnouncement(text, audiences, "HR");
  
  showToast("Corporate announcement broadcasted successfully!", "success");
  renderActiveView();
}

function handleManagerAnnouncementSubmit(e) {
  e.preventDefault();
  const text = document.getElementById("manager-ann-text").value.trim();
  const checkboxes = document.querySelectorAll(".manager-ann-target:checked");
  
  if (!text) return;
  if (checkboxes.length === 0) {
    showToast("Please select at least one target audience role.", "alert");
    return;
  }

  const audiences = Array.from(checkboxes).map(cb => cb.value).join(", ");
  eshopStore.createDirectAnnouncement(text, audiences, "Manager");
  
  showToast("Operations announcement broadcasted successfully!", "success");
  renderActiveView();
}

// Global window mappings for cart operations & announcements
window.addToCart = addToCart;
window.adjustCartQty = adjustCartQty;
window.removeFromCart = removeFromCart;
window.proceedToCartCheckout = proceedToCartCheckout;
window.handleHRAnnouncementSubmit = handleHRAnnouncementSubmit;
window.handleManagerAnnouncementSubmit = handleManagerAnnouncementSubmit;


// DOM Elements cache
const elWorkspace = document.getElementById("workspace-canvas");
const elNavRoleBadge = document.getElementById("nav-active-role-badge");
const elNavBalance = document.getElementById("top-nav-balance-widget");
const elSystemClock = document.getElementById("nav-system-time");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupRoleSwitcher();
  setupFormListeners();
  startClock();
  
  // Initial render
  updateNavBalance();
  renderActiveView();

  // Listen to state changes to trigger re-renders
  window.addEventListener("eshop_state_updated", () => {
    updateNavBalance();
    renderActiveView();
  });
});

// --- CLOCK & BALANCE WIDGET ---
function startClock() {
  const formatTime = () => {
    const now = new Date();
    return "🕒 " + now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  elSystemClock.textContent = formatTime();
  setInterval(() => {
    elSystemClock.textContent = formatTime();
  }, 1000);
}

// --- CURRENCY FORMATTER UTILITY ---
function formatCurrency(amount) {
  if (amount < 0) {
    return `-$${Math.abs(amount).toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

function updateNavBalance() {
  const cashBook = eshopStore.state.cashBook;
  const cashIn = cashBook.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = cashBook.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const balance = cashIn - cashOut;
  
  if (balance < 0) {
    elNavBalance.innerHTML = `📉 Shop Net: <span style="font-family:inherit;">${formatCurrency(balance)}</span>`;
    elNavBalance.classList.add("negative");
  } else {
    elNavBalance.innerHTML = `💰 Shop Net: <span style="font-family:inherit;">${formatCurrency(balance)}</span>`;
    elNavBalance.classList.remove("negative");
  }
}

// --- ROUTER / ROLE SWITCHER ---
function setupRoleSwitcher() {
  const buttons = document.querySelectorAll("#role-switcher-list .role-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRole = btn.dataset.role;
      
      // Update badge
      const emoji = btn.querySelector(".role-avatar").textContent;
      const text = btn.querySelector("span:not(.role-avatar)").textContent;
      elNavRoleBadge.innerHTML = `<span>${emoji}</span> ${text.toUpperCase()}`;
      
      renderActiveView();
    });
  });
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type === 'success' ? 'success' : 'alert'}`;
  
  const icon = type === 'success' ? '✅' : '🔔';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  // Play subtle feedback sound if browser allows
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    if (type === "success") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// --- MODAL UTILITIES ---
function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// --- DYNAMIC RENDERING PANEL CONTROLLERS ---

function renderActiveView() {
  elWorkspace.innerHTML = ""; // Clear canvas
  
  // Render Supervisor Announcement Banner if active on HR/Workers views
  if (activeRole === "worker" || activeRole === "hr" || activeRole === "client") {
    renderAnnouncementBanner();
  }

  switch (activeRole) {
    case "client":
      renderClientView();
      break;
    case "worker":
      renderWorkerView();
      break;
    case "hr":
      renderHRView();
      break;
    case "manager":
      renderManagerView();
      break;
    case "supervisor":
      renderSupervisorView();
      break;
  }
}

// --- GLOBAL ANNOUNCEMENT BANNER RENDERER ---
function renderAnnouncementBanner() {
  const publishedAnn = eshopStore.state.announcements.filter(a => a.status === "Published");
  if (publishedAnn.length === 0) return;

  // Filter announcements matching the active role
  const matches = publishedAnn.filter(a => {
    const aud = (a.audience || "").toLowerCase();
    
    if (activeRole === "client") {
      return aud.includes("client");
    } else {
      if (aud.includes("staff")) return true;
      return aud.includes(activeRole);
    }
  });

  if (matches.length === 0) return;

  const latest = matches[matches.length - 1];

  const banner = document.createElement("div");
  banner.className = "announcement-banner";
  banner.style.marginBottom = "1.5rem";
  banner.innerHTML = `
    <div class="announcement-icon">📢</div>
    <div class="announcement-body">
      <h4>Official Announcement (To: ${latest.audience.toUpperCase()})</h4>
      <p>${latest.content}</p>
    </div>
  `;
  elWorkspace.appendChild(banner);
}

// ==========================================
// 1. CLIENT SHOP CONSOLE
// ==========================================
function renderClientView() {
  const client = eshopStore.state.activeClient;

  if (!client) {
    // Unauthenticated Store Homepage
    elWorkspace.innerHTML += `
      <div class="client-hero">
        <div class="client-hero-content">
          <h2>Premium Electronic Tools Shop</h2>
          <p>We deliver state-of-the-art consumer electronics and tools direct to your doorstep. Create a secure account to purchase.</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.8rem;">
          <button class="btn btn-primary" onclick="openModal('modal-client-register')">🔓 Register New Account</button>
          <button class="btn btn-secondary" onclick="openModal('modal-client-login')">🔐 Log In to Buy</button>
        </div>
      </div>
    `;
    renderClientStorefront(false);
    return;
  }

  // Authenticated Shop Layout
  elWorkspace.innerHTML += `
    <div class="client-hero">
      <div class="client-hero-content">
        <h2>Welcome back, ${client.name}!</h2>
        <p>Logged in securely via: <strong>${client.phone}</strong></p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="logoutClientUser()">🚪 Sign Out</button>
      </div>
    </div>
  `;

  // Grid for Store, History and Customer care
  const mainDiv = document.createElement("div");
  mainDiv.style.display = "flex";
  mainDiv.style.flexDirection = "column";
  mainDiv.style.gap = "2rem";

  // Section 1: Storefront
  const storefrontSection = document.createElement("div");
  storefrontSection.id = "storefront-section";
  mainDiv.appendChild(storefrontSection);

  // Section 2: Order Tracking & Customer Service
  const dashboardSplit = document.createElement("div");
  dashboardSplit.className = "dashboard-grid";
  
  // Sub 2.1: Order History
  const historyCard = document.createElement("div");
  historyCard.className = "dashboard-card";
  historyCard.innerHTML = `
    <h3>📦 Your Purchase & Delivery History</h3>
    <div class="custom-table-container">
      <table class="custom-table" id="client-orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Item</th>
            <th>Paid Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Injected dynamically -->
        </tbody>
      </table>
    </div>
  `;
  dashboardSplit.appendChild(historyCard);

  // Sub 2.2: Care Center
  const careCard = document.createElement("div");
  careCard.className = "dashboard-card";
  careCard.innerHTML = `
    <h3>💬 Customer Care Center</h3>
    <div class="chat-window">
      <div class="chat-messages" id="client-care-messages">
        <!-- Messages -->
      </div>
      <form id="client-care-form" onsubmit="submitClientMessage(event)" class="chat-input-area">
        <input type="text" class="form-control" id="client-chat-input" placeholder="Type a question for our workers..." required style="border-radius: 8px 0 0 8px;">
        <button class="btn btn-primary" type="submit" style="border-radius: 0 8px 8px 0;">Send</button>
      </form>
    </div>
  `;
  dashboardSplit.appendChild(careCard);

  // Sub 2.3: Comments & Issues
  const feedbackCard = document.createElement("div");
  feedbackCard.className = "dashboard-card";
  feedbackCard.innerHTML = `
    <h3>📝 Client Comments & Issues</h3>
    <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">Submit comments, reviews, or operational issues directly to our management team.</p>
    <form id="client-feedback-form" onsubmit="submitClientFeedback(event)" style="margin-bottom: 1.5rem;">
      <div class="form-group">
        <label>Feedback Type</label>
        <select class="form-control" id="feedback-type" required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;">
          <option value="Comment">💬 General Comment / Review</option>
          <option value="Issue">⚠️ Delivery / Operational Issue</option>
        </select>
      </div>
      <div class="form-group">
        <label>Department Category</label>
        <select class="form-control" id="feedback-cat" required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;">
          <option value="Delivery">Delivery / Courier</option>
          <option value="Product Quality">Product Quality</option>
          <option value="Payment System">Payment / Momo Pay</option>
          <option value="Other">Other Inquiry</option>
        </select>
      </div>
      <div class="form-group">
        <label>Your Message</label>
        <textarea class="form-control" id="feedback-content" placeholder="Describe your experience or describe the issue..." rows="3" required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%; padding:0.6rem;">📨 Submit Feedback</button>
    </form>

    <h4>Your Filed Comments & Issues</h4>
    <div class="custom-table-container" style="max-height: 180px; overflow-y: auto; margin-top: 1rem;">
      <table class="custom-table" id="client-feedback-table" style="font-size:0.8rem;">
        <thead>
          <tr>
            <th>Type</th>
            <th>Category</th>
            <th>Content</th>
            <th>Status</th>
            <th>Response</th>
          </tr>
        </thead>
        <tbody>
          <!-- Injected dynamically -->
        </tbody>
      </table>
    </div>
  `;
  dashboardSplit.appendChild(feedbackCard);

  mainDiv.appendChild(dashboardSplit);
  elWorkspace.appendChild(mainDiv);

  renderClientStorefront(true);
  populateClientHistory(client.phone);
  populateClientChat(client.phone, client.name);
  populateClientFeedbackTable(client.phone);
}

function renderClientStorefront(canBuy) {
  const container = document.getElementById("storefront-section") || elWorkspace;
  container.innerHTML = "<h3>🛍️ Electronic Commodities Catalog</h3>";

  let catalogContainer = container;
  if (canBuy) {
    const gridWrap = document.createElement("div");
    gridWrap.style.display = "grid";
    gridWrap.style.gridTemplateColumns = "2.2fr 1fr";
    gridWrap.style.gap = "2rem";
    gridWrap.style.alignItems = "start";
    container.appendChild(gridWrap);

    const leftPane = document.createElement("div");
    leftPane.id = "catalog-left-pane";
    gridWrap.appendChild(leftPane);
    catalogContainer = leftPane;

    const rightPane = document.createElement("div");
    rightPane.id = "catalog-right-pane";
    rightPane.innerHTML = `
      <div class="dashboard-card" style="position: sticky; top: 1rem; border-top: 5px solid var(--color-primary);">
        <h3>🛒 Selected Gadgets</h3>
        <div id="cart-items-list" style="display: flex; flex-direction: column; gap: 0.8rem; max-height: 350px; overflow-y: auto; padding-right: 0.3rem; margin-bottom: 1rem;">
          <!-- Injected via updateCartUI -->
        </div>
        <div style="border-top: 1px dashed var(--color-accent); padding-top: 1rem; margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem;">
            <span>Total Amount:</span>
            <span id="cart-total-amount">$0</span>
          </div>
          <button id="cart-pay-btn" class="btn btn-primary" onclick="proceedToCartCheckout()" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem;" disabled>
            💳 Pay Selected Total
          </button>
        </div>
      </div>
    `;
    gridWrap.appendChild(rightPane);
  }

  // Category Filtering
  const filterWrap = document.createElement("div");
  filterWrap.className = "store-filters";
  const categories = ["All", "Telephone", "Airtel", "Machine", "Laptop", "Radio", "Television"];
  
  categories.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = `filter-chip ${activeClientFilter === cat ? 'active' : ''}`;
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeClientFilter = cat;
      renderClientStorefront(canBuy);
    });
    filterWrap.appendChild(chip);
  });
  catalogContainer.appendChild(filterWrap);
  
  // Catalog Product Grid
  const grid = document.createElement("div");
  grid.className = "product-grid";

  const filteredProds = eshopStore.state.products.filter(p => {
    if (activeClientFilter === "All") return true;
    return p.category === activeClientFilter;
  });

  filteredProds.forEach(prod => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    const buyButton = canBuy 
      ? `<button class="btn btn-primary" onclick="addToCart('${prod.id}')" style="width:100%; margin-top:1rem;">🛒 Add to Cart</button>`
      : `<button class="btn btn-secondary" onclick="openModal('modal-client-register')" style="width:100%; margin-top:1rem;">🔒 Register to Purchase</button>`;

    card.innerHTML = `
      <div>
        <div class="prod-header">
          <span class="prod-badge">${prod.subCategory}</span>
          <span class="prod-icon">${prod.icon}</span>
        </div>
        <div class="prod-body">
          <h4 class="prod-title">${prod.name}</h4>
          <p class="prod-desc">${prod.description}</p>
        </div>
      </div>
      <div>
        <div class="prod-stock">
          <span class="badge ${prod.stock > 0 ? 'badge-success' : 'badge-danger'}">
            ${prod.stock > 0 ? `Stock: ${prod.stock} units` : 'Out of stock'}
          </span>
        </div>
        <div class="prod-meta">
          <span class="prod-cost">Retail Price:</span>
          <span class="prod-price">$${prod.price}</span>
        </div>
        ${prod.stock > 0 ? buyButton : '<button class="btn btn-secondary" disabled style="width:100%; margin-top:1rem;">Sold Out</button>'}
      </div>
    `;
    grid.appendChild(card);
  });
  catalogContainer.appendChild(grid);

  if (canBuy) {
    updateCartUI();
  }
}

function openCheckoutModal(productId) {
  const prod = eshopStore.state.products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById("checkout-product-id").value = prod.id;
  document.getElementById("checkout-amount").value = prod.price;
  
  const detailsDiv = document.getElementById("checkout-product-details");
  detailsDiv.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h4 style="color:var(--color-primary);">${prod.name}</h4>
      <strong style="font-size:1.2rem; color:var(--color-primary);">$${prod.price}</strong>
    </div>
    <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">${prod.description}</p>
  `;

  // Default Momo selection
  selectPaymentMethod("Momo Pay");
  
  // Set default client number to modal phone if registered
  const client = eshopStore.state.activeClient;
  if (client) {
    document.getElementById("checkout-momo-number").value = client.phone;
  }

  openModal("modal-purchase-checkout");
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  const momoCard = document.getElementById("method-momo");
  const directCard = document.getElementById("method-direct");
  const instructionBox = document.getElementById("paycode-instruction-container");
  const inputLabel = document.getElementById("payment-field-label");

  if (method === "Momo Pay") {
    momoCard.classList.add("selected");
    directCard.classList.remove("selected");
    instructionBox.innerHTML = `Dial Momo Code:<br><span style="color:var(--color-warning); font-size:1.3rem;">*182*8*1*681288#</span>`;
    instructionBox.style.display = "block";
    inputLabel.textContent = "Sender Mobile Money Number";
  } else {
    directCard.classList.add("selected");
    momoCard.classList.remove("selected");
    instructionBox.innerHTML = `Direct Payment Agent:<br><span style="color:var(--color-info); font-size:1.2rem;">Transfer funds to: +250784983451</span>`;
    instructionBox.style.display = "block";
    inputLabel.textContent = "Your Contact Number";
  }
}

function populateClientHistory(phone) {
  const tableBody = document.querySelector("#client-orders-table tbody");
  tableBody.innerHTML = "";
  
  const clientOrders = eshopStore.state.orders.filter(o => o.clientPhone === phone);
  if (clientOrders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No purchases made yet. Add some gadgets!</td></tr>`;
    return;
  }

  clientOrders.forEach(ord => {
    const tr = document.createElement("tr");
    let badgeClass = "badge-warning";
    if (ord.status === "Delivered") badgeClass = "badge-success";
    if (ord.status === "Delivering") badgeClass = "badge-info";

    tr.innerHTML = `
      <td><strong>#${ord.id}</strong></td>
      <td>${ord.productName}</td>
      <td>$${ord.price}</td>
      <td><span class="badge ${badgeClass}">${ord.status}</span></td>
    `;
    tableBody.appendChild(tr);
  });
}

function populateClientChat(phone, name) {
  const chatMessages = document.getElementById("client-care-messages");
  chatMessages.innerHTML = "";

  const myMessages = eshopStore.state.messages.filter(m => m.phone === phone);
  if (myMessages.length === 0) {
    chatMessages.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); font-size:0.8rem; margin-top:2rem;">
        Welcome to Helpdesk! Write any question or delivery issue above to chat with our staff.
      </div>
    `;
    return;
  }

  myMessages.forEach(msg => {
    // Client message
    const divCli = document.createElement("div");
    divCli.className = "chat-bubble client";
    divCli.textContent = msg.message;
    chatMessages.appendChild(divCli);

    // Staff replies
    msg.replies.forEach(rep => {
      const divRep = document.createElement("div");
      divRep.className = "chat-bubble worker";
      divRep.innerHTML = `<strong style="font-size:0.75rem; display:block; color:var(--color-primary);">${rep.sender}:</strong>${rep.message}`;
      chatMessages.appendChild(divRep);
    });
  });
  
  // Auto scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function submitClientMessage(e) {
  e.preventDefault();
  const client = eshopStore.state.activeClient;
  if (!client) return;

  const textInput = document.getElementById("client-chat-input");
  const msgText = textInput.value.trim();
  if (!msgText) return;

  eshopStore.sendClientMessage(client.name, client.phone, msgText);
  textInput.value = "";
  
  showToast("Support message dispatched to Workers!", "success");
  populateClientChat(client.phone, client.name);
}

function submitClientFeedback(e) {
  e.preventDefault();
  const client = eshopStore.state.activeClient;
  if (!client) return;

  const type = document.getElementById("feedback-type").value;
  const cat = document.getElementById("feedback-cat").value;
  const content = document.getElementById("feedback-content").value.trim();

  if (!content) return;

  eshopStore.submitCommentOrIssue(client.name, client.phone, type, cat, content);
  showToast("Feedback submitted successfully to Management!", "success");
  renderActiveView();
}

function populateClientFeedbackTable(phone) {
  const tbody = document.querySelector("#client-feedback-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  const myFeedback = eshopStore.state.commentsAndIssues.filter(i => i.clientPhone === phone);

  if (myFeedback.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1rem 0;">No comments or issues filed yet.</td></tr>`;
    return;
  }

  myFeedback.forEach(feed => {
    const tr = document.createElement("tr");
    let badgeClass = "badge-warning";
    if (feed.status === "Resolved") badgeClass = "badge-success";

    tr.innerHTML = `
      <td><strong>${feed.type}</strong></td>
      <td><span class="badge badge-info" style="font-size:0.6rem;">${feed.category}</span></td>
      <td style="max-width: 150px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${feed.content}">${feed.content}</td>
      <td><span class="badge ${badgeClass}">${feed.status}</span></td>
      <td style="font-size:0.75rem; color:var(--color-primary); font-weight:600;">
        ${feed.adminComment ? `💬 "${feed.adminComment}"` : '⏳ Waiting response'}
      </td>
    `;
    tableBody = tbody.appendChild(tr);
  });
}

function logoutClientUser() {
  eshopStore.logoutClient();
  clientCart = [];
  showToast("Logged out successfully.", "info");
}

// ==========================================
// 2. WORKERS PORTAL CONSOLE
// ==========================================
function renderWorkerView() {
  if (!currentWorkerUser) {
    // Renders Attendance Entry
    elWorkspace.innerHTML += `
      <div class="dashboard-card attendance-layout" style="max-width: 480px; margin: 2rem auto; border-top: 5px solid var(--color-primary);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 3rem;">🛠️</span>
          <h3 style="margin-top: 0.5rem; border-bottom: none; padding-bottom: 0;">Worker Shift Check-in</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Please enter your details and secure worker password to check-in for your shift.</p>
        </div>
        <form id="worker-checkin-form" onsubmit="handleWorkerCheckin(event)">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" class="form-control" id="worker-fname" placeholder="Enter first name" required autocomplete="given-name">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" class="form-control" id="worker-lname" placeholder="Enter last name" required autocomplete="family-name">
          </div>
          <div class="form-group">
            <label>Telephone Number</label>
            <input type="tel" class="form-control" id="worker-phone" placeholder="e.g. +250780000001" required autocomplete="tel">
          </div>
          <div class="form-group">
            <label>Worker Password</label>
            <input type="password" class="form-control" id="worker-pass" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:1rem;">Check In & Fill Tasks</button>
        </form>
      </div>
    `;
    return;
  }

  // Verified Worker Dashboard
  const workerRecord = eshopStore.state.workers.find(w => w.telephone === currentWorkerUser.telephone);
  const statusMarkup = workerRecord && workerRecord.status !== "Approved"
    ? `<div style="background-color: var(--color-warning-bg); border-left:4px solid var(--color-warning); padding:1rem; border-radius:8px; margin-bottom:1.5rem; font-weight:600; color:var(--color-warning);">
         ⚠️ Your shift attendance is currently PENDING approval from Human Resources. You can review tasks, but finalized delivery changes will reflect when approved.
       </div>`
    : ``;

  elWorkspace.innerHTML += `
    <div class="client-hero">
      <div class="client-hero-content">
        <h2>Worker Dashboard: ${currentWorkerUser.firstName} ${currentWorkerUser.lastName}</h2>
        <p>Checked in today at: <strong>${currentWorkerUser.timeArrived}</strong> | Status: <span class="badge ${workerRecord && workerRecord.status === 'Approved' ? 'badge-success' : 'badge-warning'}">${workerRecord ? workerRecord.status : 'Pending'}</span></p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="logoutWorker()">🚪 Clock Out</button>
      </div>
    </div>
    ${statusMarkup}
  `;

  // Worker Tasks Layout
  const tasksGrid = document.createElement("div");
  tasksGrid.className = "dashboard-grid";
  
  // Task 1: Deliveries
  const deliveryCard = document.createElement("div");
  deliveryCard.className = "dashboard-card";
  deliveryCard.style.gridColumn = "span 2";
  deliveryCard.innerHTML = `
    <h3>📦 Task: Deliver Goods Purchased by Clients</h3>
    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Manage delivery logistics for incoming client payments. Deliveries must be made promptly.</p>
    <div class="custom-table-container">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Recipient</th>
            <th>Item</th>
            <th>Momo Receipt</th>
            <th>Status</th>
            <th style="text-align:right;">Operations</th>
          </tr>
        </thead>
        <tbody id="worker-deliveries-tbody">
          <!-- Injected dynamically -->
        </tbody>
      </table>
    </div>
  `;
  tasksGrid.appendChild(deliveryCard);

  // Task 2: Caring Clients
  const careCard = document.createElement("div");
  careCard.className = "dashboard-card";
  careCard.innerHTML = `
    <h3>💬 Task: Caring Clients (Support Inbox)</h3>
    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Answer customer inquiries and maintain high customer satisfaction ratings.</p>
    <div style="display:flex; flex-direction:column; gap:1rem;" id="worker-support-list">
      <!-- Chat cards dynamic -->
    </div>
  `;
  tasksGrid.appendChild(careCard);

  elWorkspace.appendChild(tasksGrid);
  populateWorkerDeliveries();
  populateWorkerInboxes();
}

function handleWorkerCheckin(e) {
  e.preventDefault();
  const fname = document.getElementById("worker-fname").value.trim();
  const lname = document.getElementById("worker-lname").value.trim();
  const phone = document.getElementById("worker-phone").value.trim();
  const pass = document.getElementById("worker-pass").value;
  
  const result = eshopStore.checkInWorker(fname, lname, phone, pass);
  
  if (!result.success) {
    showToast(result.message, "alert");
    return;
  }
  
  currentWorkerUser = result.worker;
  
  if (result.suspicious) {
    showToast("⚠️ Attendance logged! Note: System flagged attendance as suspicious (matching telephone audit check). HR notified.", "alert");
  } else {
    showToast("Shift checked-in successfully! Registered under Pending approval.", "success");
  }
  renderActiveView();
}

function populateWorkerDeliveries() {
  const tbody = document.getElementById("worker-deliveries-tbody");
  tbody.innerHTML = "";

  const orders = eshopStore.state.orders;
  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No customer orders exist in database ledger.</td></tr>`;
    return;
  }

  orders.forEach(ord => {
    const tr = document.createElement("tr");
    
    let btnGroup = ``;
    if (ord.status === "Pending Delivery") {
      btnGroup = `<button class="btn btn-secondary" onclick="updateOrderDelivery('${ord.id}', 'Delivering')" style="padding:0.4rem 0.8rem; font-size:0.75rem;">🚚 Deliver</button>`;
    } else if (ord.status === "Delivering") {
      btnGroup = `<button class="btn btn-success" onclick="updateOrderDelivery('${ord.id}', 'Delivered')" style="padding:0.4rem 0.8rem; font-size:0.75rem;">✅ Complete</button>`;
    } else {
      btnGroup = `<span style="color:var(--color-success); font-size:0.8rem; font-weight:700;">Delivered! 🎉</span>`;
    }

    let statusBadge = "badge-warning";
    if (ord.status === "Delivering") statusBadge = "badge-info";
    if (ord.status === "Delivered") statusBadge = "badge-success";

    tr.innerHTML = `
      <td><strong>#${ord.id}</strong></td>
      <td>
        <div style="font-weight:700;">${ord.clientName}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${ord.clientPhone}</div>
      </td>
      <td>${ord.productName}</td>
      <td><span style="font-size:0.78rem; font-family:monospace; color:var(--color-primary);">${ord.paymentDetails}</span></td>
      <td><span class="badge ${statusBadge}">${ord.status}</span></td>
      <td style="text-align:right;">${btnGroup}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateOrderDelivery(orderId, newStatus) {
  const workerRecord = eshopStore.state.workers.find(w => w.telephone === currentWorkerUser.telephone);
  if (workerRecord && workerRecord.status !== "Approved") {
    showToast("Action Locked: Attendance must be approved by HR first!", "alert");
    return;
  }
  eshopStore.updateDeliveryStatus(orderId, newStatus);
  showToast(`Order status updated to: ${newStatus}`, "success");
  populateWorkerDeliveries();
}

function populateWorkerInboxes() {
  const list = document.getElementById("worker-support-list");
  list.innerHTML = "";

  const messages = eshopStore.state.messages;
  const openMsgs = messages.filter(m => m.status === "Open");

  if (messages.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding:2rem 0;">No active help requests from clients.</div>`;
    return;
  }

  messages.forEach(msg => {
    const card = document.createElement("div");
    card.style.background = "var(--bg-card)";
    card.style.padding = "1rem";
    card.style.borderRadius = "8px";
    card.style.borderLeft = msg.status === "Open" ? "4px solid var(--color-warning)" : "4px solid var(--color-success)";

    let replyFormMarkup = ``;
    if (msg.status === "Open") {
      replyFormMarkup = `
        <form onsubmit="handleWorkerReply(event, '${msg.id}')" style="display:flex; gap:0.5rem; margin-top:0.8rem;">
          <input type="text" placeholder="Type reply message..." class="form-control" style="background:#fff; font-size:0.8rem;" required>
          <button class="btn btn-primary" type="submit" style="padding:0.4rem 0.8rem; font-size:0.8rem;">Reply</button>
        </form>
      `;
    } else {
      replyFormMarkup = `
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.6rem; padding:0.4rem; background:#fff; border-radius:4px;">
          <strong>Replied:</strong> ${msg.replies[msg.replies.length - 1].message}
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size:0.85rem; color:var(--color-primary);">${msg.clientName} (${msg.phone})</strong>
        <span class="badge ${msg.status === 'Open' ? 'badge-warning' : 'badge-success'}" style="font-size:0.6rem;">${msg.status}</span>
      </div>
      <p style="font-size:0.8rem; color:var(--text-dark); margin-top:0.4rem;">${msg.message}</p>
      ${replyFormMarkup}
    `;
    list.appendChild(card);
  });
}

function handleWorkerReply(e, messageId) {
  e.preventDefault();
  const workerRecord = eshopStore.state.workers.find(w => w.telephone === currentWorkerUser.telephone);
  if (workerRecord && workerRecord.status !== "Approved") {
    showToast("Action Locked: Attendance must be approved by HR first!", "alert");
    return;
  }
  
  const textInput = e.target.querySelector("input");
  const replyText = textInput.value.trim();
  if (!replyText) return;

  eshopStore.replyToMessage(messageId, currentWorkerUser.firstName, replyText);
  showToast("Sent customer support response!", "success");
  populateWorkerInboxes();
}

function logoutWorker() {
  currentWorkerUser = null;
  showToast("Clocked out successfully.", "info");
  renderActiveView();
}

// ==========================================
// 3. HUMAN RESOURCES (HR) CONSOLE
// ==========================================
function renderHRView() {
  if (!currentHRUser) {
    elWorkspace.innerHTML += `
      <div class="dashboard-card attendance-layout" style="max-width: 480px; margin: 2rem auto; border-top: 5px solid var(--color-primary);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 3rem;">👔</span>
          <h3 style="margin-top: 0.5rem; border-bottom: none; padding-bottom: 0;">HR Secure Sign-in</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Please provide your administrator credentials to manage human resources operations.</p>
        </div>
        <form id="hr-login-form" onsubmit="handleHRLogin(event)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" id="hr-login-email" value="didierira22@gmail.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="hr-login-pass" value="Didie@" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">🔓 Authenticate & Enter</button>
        </form>
      </div>
    `;
    return;
  }

  // Authenticated HR Portal
  elWorkspace.innerHTML += `
    <div class="client-hero">
      <div class="client-hero-content">
        <h2>HR Dashboard: ${currentHRUser.firstName} ${currentHRUser.lastName}</h2>
        <p>Logged in: <strong>${currentHRUser.email}</strong> | Human Resources Division</p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="logoutHR()">🚪 Sign Out</button>
      </div>
    </div>

    <!-- Split Pane for HR Worksheets -->
    <div class="dashboard-grid">
      
      <!-- Worker Shifts Control panel -->
      <div class="dashboard-card" style="grid-column: span 2;">
        <h3>👥 Task: Approve/Reject Workers Daily Shifts</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Verify worker arrival timestamps and check validity before approving payroll shifts.</p>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Telephone</th>
                <th>Time Arrived</th>
                <th>Security Flag</th>
                <th>Shift Status</th>
                <th style="text-align:right;">Operations</th>
              </tr>
            </thead>
            <tbody id="hr-workers-shift-tbody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Fraud Verification Dashboard -->
      <div class="dashboard-card">
        <h3>🚨 double-sign-in Fraud Scanner</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Checks for duplicate telephones or malicious attendance claims (registering absent coworkers).</p>
        <div id="hr-fraud-alerts" style="display:flex; flex-direction:column; gap:0.8rem;">
          <!-- Suspicious alerts injected here -->
        </div>
      </div>

      <!-- HR Announcement Broadcaster -->
      <div class="dashboard-card" style="border-top: 4px solid var(--color-warning);">
        <h3>📢 Send Corporate Announcement</h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">Publish an announcement directly to selected organizational roles.</p>
        <form onsubmit="handleHRAnnouncementSubmit(event)">
          <div class="form-group">
            <label>Announcement Body</label>
            <textarea class="form-control" id="hr-ann-text" rows="3" placeholder="Type announcement content here..." required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;"></textarea>
          </div>
          <div class="form-group">
            <label>Select Target Audience</label>
            <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="hr-ann-target" value="worker" checked style="width: 14px; height: 14px;"> Workers Portal
              </label>
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="hr-ann-target" value="manager" checked style="width: 14px; height: 14px;"> Manager Hub
              </label>
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="hr-ann-target" value="supervisor" checked style="width: 14px; height: 14px;"> Supervisor Console
              </label>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding:0.6rem;">📨 Broadcast Announcement</button>
        </form>
      </div>
      
      <!-- Worker Credentials Registry -->
      <div class="dashboard-card" style="grid-column: span 3;">
        <h3>👥 Worker Registry & Login Access Information</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">As HR, you have full privileges to view and manage worker login passwords.</p>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Telephone Account</th>
                <th>Active Password</th>
                <th style="text-align:right;">Operations & Reset</th>
              </tr>
            </thead>
            <tbody id="hr-workers-login-tbody">
              <!-- Populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  `;

  populateHRWorkersList();
  runHRFraudChecks();
  populateHRWorkerCredentials();
}

function handleHRLogin(e) {
  e.preventDefault();
  const email = document.getElementById("hr-login-email").value.trim();
  const pass = document.getElementById("hr-login-pass").value;
  
  if (email === "didierira22@gmail.com" && pass === "Didie@") {
    currentHRUser = { firstName: "Didier", lastName: "Iradukunda", email: email, timeArrived: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    showToast("HR Administrator Authenticated Successfully!", "success");
    renderActiveView();
  } else {
    showToast("Invalid HR Email or Password.", "alert");
  }
}

function populateHRWorkerCredentials() {
  const tbody = document.getElementById("hr-workers-login-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  const workers = eshopStore.state.workers;
  
  workers.forEach(w => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${w.firstName} ${w.lastName}</strong></td>
      <td><span style="font-family:monospace;">${w.telephone}</span></td>
      <td><span style="font-family:monospace; color:var(--color-primary); font-weight:700;">${w.password || 'worker123'}</span></td>
      <td style="text-align:right;">
        <form onsubmit="handleHRUpdateWorkerPassword(event, '${w.telephone}')" style="display:inline-flex; gap:0.4rem; justify-content:flex-end;">
          <input type="text" placeholder="new pass" class="form-control" style="width:120px; padding:0.35rem; font-size:0.8rem; background:#fff; border:1px solid var(--color-accent);" required>
          <button class="btn btn-primary" type="submit" style="padding:0.35rem 0.6rem; font-size:0.75rem;">Reset</button>
        </form>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleHRUpdateWorkerPassword(e, telephone) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const newPass = input.value.trim();
  if (!newPass) return;
  
  eshopStore.updateWorkerPassword(telephone, newPass);
  showToast("Worker login credentials updated successfully!", "success");
  renderActiveView();
}

function populateHRWorkersList() {
  const tbody = document.getElementById("hr-workers-shift-tbody");
  tbody.innerHTML = "";

  const workers = eshopStore.state.workers;
  if (workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No worker shifts checked in today.</td></tr>`;
    return;
  }

  workers.forEach((worker, index) => {
    const tr = document.createElement("tr");

    let ops = ``;
    if (worker.status === "Pending") {
      ops = `
        <button class="btn btn-success" onclick="approveShift(${index})" style="padding:0.35rem 0.7rem; font-size:0.75rem;">Approve</button>
        <button class="btn btn-danger" onclick="rejectShift(${index})" style="padding:0.35rem 0.7rem; font-size:0.75rem;">Reject</button>
      `;
    } else {
      ops = `<span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Shift Concluded</span>`;
    }

    const flagBadge = worker.flagged 
      ? `<span class="badge badge-danger" style="cursor:pointer;" onclick="toggleFlag(${index})">⚠️ FLAGGED</span>`
      : `<span class="badge badge-success" style="cursor:pointer;" onclick="toggleFlag(${index})">PASS</span>`;

    let statusColor = "badge-warning";
    if (worker.status === "Approved") statusColor = "badge-success";
    if (worker.status === "Rejected/Absent") statusColor = "badge-danger";

    tr.innerHTML = `
      <td><strong>${worker.firstName} ${worker.lastName}</strong></td>
      <td>${worker.telephone}</td>
      <td>${worker.timeArrived}</td>
      <td>${flagBadge}</td>
      <td><span class="badge ${statusColor}">${worker.status}</span></td>
      <td style="text-align:right; display:flex; gap:0.4rem; justify-content:flex-end;">${ops}</td>
    `;
    tbody.appendChild(tr);
  });
}

function approveShift(index) {
  eshopStore.approveWorker(index);
  showToast("Worker shift attendance APPROVED.", "success");
  renderActiveView();
}

function rejectShift(index) {
  eshopStore.rejectWorker(index);
  showToast("Worker shift marked as REJECTED / ABSENT.", "success");
  renderActiveView();
}

function toggleFlag(index) {
  const currentFlag = eshopStore.state.workers[index].flagged;
  eshopStore.flagWorker(index, !currentFlag);
  showToast(`Security audit flag updated.`, "info");
  renderActiveView();
}

function runHRFraudChecks() {
  const alertsContainer = document.getElementById("hr-fraud-alerts");
  alertsContainer.innerHTML = "";

  const workers = eshopStore.state.workers;
  const phoneCounts = {};
  
  // Count frequency of telephones to detect duplication
  workers.forEach(w => {
    phoneCounts[w.telephone] = (phoneCounts[w.telephone] || 0) + 1;
  });

  let violationsFound = false;

  workers.forEach((w, index) => {
    if (phoneCounts[w.telephone] > 1) {
      violationsFound = true;
      const alert = document.createElement("div");
      alert.style.padding = "0.8rem";
      alert.style.background = "var(--color-danger-bg)";
      alert.style.borderLeft = "4px solid var(--color-danger)";
      alert.style.borderRadius = "6px";
      alert.style.fontSize = "0.8rem";
      alert.innerHTML = `
        <strong>⚠️ CRITICAL SUSPICION ALERT:</strong><br>
        Multiple check-ins found for phone: <span style="font-weight:700;">${w.telephone}</span>.<br>
        User: <span style="font-weight:700;">${w.firstName} ${w.lastName}</span>.<br>
        Possible Double-Sign-In fraud (someone registering absent colleague).
        <div style="margin-top:0.4rem; display:flex; gap:0.4rem;">
          <button class="btn btn-danger" onclick="rejectShift(${index})" style="padding:0.25rem 0.5rem; font-size:0.7rem;">Quick Absent</button>
          <button class="btn btn-secondary" onclick="toggleFlag(${index})" style="padding:0.25rem 0.5rem; font-size:0.7rem;">Unflag</button>
        </div>
      `;
      alertsContainer.appendChild(alert);
    }
  });

  if (!violationsFound) {
    alertsContainer.innerHTML = `
      <div style="text-align:center; padding:2rem 0; color:var(--color-success); font-weight:600; font-size:0.85rem;">
        🟢 Scanner Integrity: PASS<br>
        <span style="font-weight:normal; color:var(--text-muted); font-size:0.78rem;">No duplicate logins or telephone conflicts detected in system registries.</span>
      </div>
    `;
  }
}

function logoutHR() {
  currentHRUser = null;
  showToast("HR clock-out recorded.", "info");
  renderActiveView();
}


// ==========================================
// 4. MANAGER CONSOLE
// ==========================================
function renderManagerView() {
  if (!currentManagerUser) {
    elWorkspace.innerHTML += `
      <div class="dashboard-card attendance-layout" style="max-width: 480px; margin: 2rem auto; border-top: 5px solid var(--color-success);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 3rem;">📈</span>
          <h3 style="margin-top: 0.5rem; border-bottom: none; padding-bottom: 0;">Manager Hub Login</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Please authenticate to manage electronic commodities and review financial cash books.</p>
        </div>
        <form id="manager-login-form" onsubmit="handleManagerLogin(event)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" id="manager-login-email" value="patrick66@gmail.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="manager-login-pass" value="Patrick@" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 1rem;">🔓 Sign In as Manager</button>
        </form>
      </div>
    `;
    return;
  }

  // Check manager reports stats
  const cashBook = eshopStore.state.cashBook;
  const cashIn = cashBook.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = cashBook.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const profit = cashIn - cashOut;

  const profitColorClass = profit < 0 ? "var(--color-danger)" : "var(--color-info)";
  const profitFormatted = formatCurrency(profit);
  const profitIcon = profit < 0 ? "📉" : "📈";

  // Render Manager Workspace
  elWorkspace.innerHTML += `
    <div class="client-hero" style="margin-bottom:1.5rem;">
      <div class="client-hero-content">
        <h2>Manager Operations Hub</h2>
        <p>Logistics Management, Profit Ledgers, Restocking, and Feedback Resolution. Logged in: <strong>${currentManagerUser.email}</strong></p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="logoutManager()">🚪 Sign Out</button>
      </div>
    </div>

    <!-- Manager Key Metrics Grid -->
    <div class="dashboard-grid">
      <div class="dashboard-card" style="border-left: 5px solid var(--color-success);">
        <h3>📥 Total Money Earned (Cash In)</h3>
        <h2 style="font-size:2.2rem; color:var(--color-success); font-weight:800; margin-top:0.4rem;">$${cashIn.toLocaleString()}</h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Accumulated sales from buyer transactions.</p>
      </div>
      <div class="dashboard-card" style="border-left: 5px solid var(--color-warning);">
        <h3>📤 Total Expenditures (Cash Out)</h3>
        <h2 style="font-size:2.2rem; color:var(--color-warning); font-weight:800; margin-top:0.4rem;">$${cashOut.toLocaleString()}</h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Inventory restocks, operational utilities.</p>
      </div>
      <div class="dashboard-card" style="border-left: 5px solid ${profitColorClass};">
        <h3>${profitIcon} Operating Net Profit</h3>
        <h2 style="font-size:2.2rem; color:${profitColorClass}; font-weight:800; margin-top:0.4rem;">${profitFormatted}</h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Total Earnings after expenditures deduct.</p>
      </div>
    </div>

    <!-- Financial Analytics Ledger Chart and announcements publishers -->
    <div class="financial-ledger-grid" style="margin-bottom: 2rem;">
      
      <!-- Financial Ledgers and Custom Progress Meter -->
      <div class="dashboard-card">
        <h3>📊 Financial Analytics Progress Ratio</h3>
        <div class="custom-chart-container">
          <div class="metric-bar-group">
            <div class="metric-bar-header">
              <span>Cash In ratio</span>
              <span>100%</span>
            </div>
            <div class="metric-bar-outer">
              <div class="metric-bar-inner bar-in" style="width: 100%;"></div>
            </div>
          </div>
          <div class="metric-bar-group">
            <div class="metric-bar-header">
              <span>Expenditure ratio</span>
              <span>${cashIn > 0 ? Math.round((cashOut / cashIn) * 100) : 0}%</span>
            </div>
            <div class="metric-bar-outer">
              <div class="metric-bar-inner bar-out" style="width: ${cashIn > 0 ? Math.min((cashOut / cashIn) * 100, 100) : 0}%;"></div>
            </div>
          </div>
          <div class="metric-bar-group">
            <div class="metric-bar-header">
              <span>Net Profit margins</span>
              <span>${cashIn > 0 ? Math.round((profit / cashIn) * 100) : 0}%</span>
            </div>
            <div class="metric-bar-outer">
              <div class="metric-bar-inner bar-profit" style="width: ${cashIn > 0 ? Math.max(Math.min((profit / cashIn) * 100, 100), 0) : 0}%;"></div>
            </div>
          </div>
        </div>

        <h3 style="margin-top:2rem; margin-bottom:1rem;">🧾 Real-Time Cash Book Ledger</h3>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Tx Code</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${cashBook.map(tx => `
                <tr>
                  <td><span style="font-family:monospace; font-weight:700;">${tx.id.substring(0,8)}</span></td>
                  <td>${tx.category}</td>
                  <td style="font-size:0.82rem;">${tx.description}</td>
                  <td><span class="badge ${tx.type === 'in' ? 'badge-success' : 'badge-warning'}">${tx.type.toUpperCase()}</span></td>
                  <td><strong style="color: ${tx.type === 'in' ? 'var(--color-success)' : 'var(--color-warning)'}">$${tx.amount}</strong></td>
                </tr>
              `).reverse().slice(0, 5).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Announcements from Supervisor -->
      <div class="dashboard-card">
        <h3>📢 Supervisor Directive Pipeline</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Supervisor writes directives; Manager must formally approve and publish them to Workers and HR shift logs.</p>
        <div id="manager-supervisor-directives-container" style="display:flex; flex-direction:column; gap:0.8rem;">
          <!-- Directive items injected dynamically -->
        </div>
      </div>
      
    </div>

    <!-- Split Pane for Product Catalog Entries -->
    <div class="dashboard-grid">
      
      <!-- Manager Announcement Broadcaster -->
      <div class="dashboard-card" style="border-top: 4px solid var(--color-success);">
        <h3>📢 Send Operations Announcement</h3>
        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1rem;">Publish an announcement directly to Workers, HR, or Supervisor channels.</p>
        <form onsubmit="handleManagerAnnouncementSubmit(event)">
          <div class="form-group">
            <label>Announcement Body</label>
            <textarea class="form-control" id="manager-ann-text" rows="3" placeholder="Type operations update here..." required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;"></textarea>
          </div>
          <div class="form-group">
            <label>Select Target Audience</label>
            <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="manager-ann-target" value="worker" checked style="width: 14px; height: 14px;"> Workers Portal
              </label>
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="manager-ann-target" value="hr" checked style="width: 14px; height: 14px;"> HR Dashboard
              </label>
              <label style="display:flex; align-items:center; gap:0.4rem; text-transform:none; font-weight:500; color:var(--text-dark);">
                <input type="checkbox" class="manager-ann-target" value="supervisor" checked style="width: 14px; height: 14px;"> Supervisor Console
              </label>
            </div>
          </div>
          <button type="submit" class="btn btn-success" style="width: 100%; padding:0.6rem;">📨 Broadcast Announcement</button>
        </form>
      </div>

      <!-- Input Products Catalog Form -->
      <div class="dashboard-card">
        <h3>📥 Task: Restock & Input New Electronic Commodities</h3>
        <form onsubmit="handleNewProductSubmit(event)">
          <div class="form-group">
            <label>Product Title</label>
            <input type="text" class="form-control" id="new-prod-name" placeholder="e.g. Tecno Phantom V Fold" required>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
            <div class="form-group">
              <label>Category</label>
              <select class="form-control" id="new-prod-cat" required>
                <option value="Telephone">Telephone</option>
                <option value="Airtel">Airtel</option>
                <option value="Machine">Machine</option>
                <option value="Laptop">Laptop</option>
                <option value="Radio">Radio</option>
                <option value="Television">Television</option>
              </select>
            </div>
            <div class="form-group">
              <label>SubCategory/Brand</label>
              <input type="text" class="form-control" id="new-prod-subcat" placeholder="e.g. Tecno / Infinix" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
            <div class="form-group">
              <label>Retail Price ($)</label>
              <input type="number" class="form-control" id="new-prod-price" placeholder="400" min="1" required>
            </div>
            <div class="form-group">
              <label>Acquisition Cost Price ($)</label>
              <input type="number" class="form-control" id="new-prod-cost" placeholder="250" min="1" required>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
            <div class="form-group">
              <label>Stock Qty</label>
              <input type="number" class="form-control" id="new-prod-stock" placeholder="10" min="1" required>
            </div>
            <div class="form-group">
              <label>Product Icon</label>
              <select class="form-control" id="new-prod-icon">
                <option value="📱">📱 Phone</option>
                <option value="📶">📶 Wifi/Telecom</option>
                <option value="💻">💻 Computer</option>
                <option value="🧺">🧺 Machine</option>
                <option value="📺">📺 TV</option>
                <option value="📻">📻 Radio</option>
                <option value="🔌">🔌 Adapter</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Product Specification</label>
            <textarea class="form-control" id="new-prod-desc" placeholder="Details and specs..." rows="2" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">📥 Add Electronic Commodity</button>
        </form>
      </div>

      <!-- Output products log (Warehouse Inventory levels) -->
      <div class="dashboard-card" style="grid-column: span 2;">
        <h3>📦 Inventory Logistics Levels & Output Products Log</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Current items in warehouse inventory. Instantly restock items by providing add volumes.</p>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Gadget</th>
                <th>Category</th>
                <th>Unit Cost</th>
                <th>Retail Price</th>
                <th>Remaining Stock</th>
                <th style="text-align:right;">Quick Restock</th>
              </tr>
            </thead>
            <tbody>
              ${eshopStore.state.products.map(p => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span style="font-size:1.5rem;">${p.icon}</span>
                      <div>
                        <div style="font-weight:700;">${p.name}</div>
                        <div style="font-size:0.7rem; color:var(--text-muted); font-family:monospace;">${p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>${p.category}</td>
                  <td>$${p.costPrice}</td>
                  <td><strong>$${p.price}</strong></td>
                  <td>
                    <span class="badge ${p.stock > 10 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}">
                      ${p.stock} units
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <form onsubmit="handleQuickRestock(event, '${p.id}')" style="display:inline-flex; gap:0.4rem; justify-content:flex-end;">
                      <input type="number" placeholder="qty" class="form-control" style="width:70px; padding:0.35rem; font-size:0.8rem; background:#fff; border:1px solid var(--color-accent);" required min="1">
                      <button class="btn btn-secondary" type="submit" style="padding:0.35rem 0.6rem; font-size:0.75rem;">+</button>
                    </form>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>

    <!-- Manager report submissions pipeline -->
    <div class="dashboard-card" style="margin-top: 2rem;">
      <h3>👑 Task: Provide Financial & Logistics Report to Supervisor</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Compile shift financials, inputs, and warehouse deliveries into a formal report for Supervisor review.</p>
      
      <form onsubmit="handleReportSubmit(event)" style="margin-bottom:2rem;">
        <div class="form-group">
          <label>Your Manager Name</label>
          <input type="text" class="form-control" id="manager-report-name" placeholder="Enter manager name" required value="${currentManagerUser.name}">
        </div>
        <div class="form-group">
          <label>Report Content & Issues</label>
          <textarea class="form-control" id="manager-report-text" rows="3" placeholder="Specify cash positions, worker attendance statistics, and stock updates..." required></textarea>
        </div>
        <button class="btn btn-primary" type="submit">📨 Dispatch Report to Supervisor</button>
      </form>

      <h4>Previous Submissions History & Feedback</h4>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Compiled By</th>
              <th>Content</th>
              <th>Status</th>
              <th>Supervisor Comment</th>
            </tr>
          </thead>
          <tbody>
            ${eshopStore.state.reports.map(rep => {
              let badgeColor = rep.status === "Pending" ? "badge-warning" : "badge-success";
              return `
                <tr>
                  <td style="font-size:0.8rem;">${new Date(rep.timestamp).toLocaleString()}</td>
                  <td><strong>${rep.managerName}</strong></td>
                  <td style="font-size:0.82rem; max-width:250px;">${rep.content}</td>
                  <td><span class="badge ${badgeColor}">${rep.status}</span></td>
                  <td style="font-size:0.82rem; color:var(--color-info); font-weight:600;">
                    ${rep.supervisorComment ? `💬 "${rep.supervisorComment}"` : '⏳ Waiting comment'}
                  </td>
                </tr>
              `;
            }).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Client Feedback Management Panel -->
    <div class="dashboard-card" style="margin-top: 2rem;">
      <h3>💬 Client Comments & Operational Issues Registry</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Review reviews, operational comments, and address delivery issues raised by buyers.</p>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Category</th>
              <th>Feedback / Issue Details</th>
              <th>Status</th>
              <th style="text-align:right;">Operations & Resolution</th>
            </tr>
          </thead>
          <tbody>
            ${eshopStore.state.commentsAndIssues.map(feed => {
              const badgeClass = feed.status === "Resolved" ? "badge-success" : "badge-warning";
              let opsMarkup = ``;
              if (feed.status === "Pending") {
                opsMarkup = `
                  <form onsubmit="handleResolveFeedback(event, '${feed.id}')" style="display:inline-flex; gap:0.4rem; justify-content:flex-end;">
                    <input type="text" placeholder="Resolution response..." class="form-control" style="width:180px; padding:0.35rem; font-size:0.8rem; background:#fff; border:1px solid var(--color-accent);" required>
                    <button class="btn btn-success" type="submit" style="padding:0.35rem 0.6rem; font-size:0.75rem;">Resolve</button>
                  </form>
                `;
              } else {
                opsMarkup = `<span style="font-size:0.8rem; color:var(--color-success); font-weight:700;">Resolved 💬: "${feed.adminComment}"</span>`;
              }
              return `
                <tr>
                  <td>
                    <strong>${feed.clientName}</strong>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${feed.clientPhone}</div>
                  </td>
                  <td><strong>${feed.type}</strong></td>
                  <td><span class="badge badge-info" style="font-size:0.65rem;">${feed.category}</span></td>
                  <td style="font-size:0.82rem; max-width:250px; white-space:normal; word-break:break-all;">${feed.content}</td>
                  <td><span class="badge ${badgeClass}">${feed.status}</span></td>
                  <td style="text-align:right;">${opsMarkup}</td>
                </tr>
              `;
            }).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  populateManagerDirectives();
}

function handleManagerLogin(e) {
  e.preventDefault();
  const email = document.getElementById("manager-login-email").value.trim();
  const pass = document.getElementById("manager-login-pass").value;
  
  if (
    (email === "patrick66@gmail.com" && pass === "Patrick@") ||
    (email === "jeani@gmail.com" && pass === "Jeani@")
  ) {
    currentManagerUser = { email: email, name: email === "patrick66@gmail.com" ? "Patrick" : "Jean" };
    showToast(`Welcome back, Manager ${currentManagerUser.name}!`, "success");
    renderActiveView();
  } else {
    showToast("Invalid Manager Email or Password.", "alert");
  }
}

function logoutManager() {
  currentManagerUser = null;
  showToast("Logged out of Manager console.", "info");
  renderActiveView();
}

function handleResolveFeedback(e, id) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  
  eshopStore.resolveCommentOrIssue(id, text);
  showToast("Client comment/issue resolved and response dispatched!", "success");
  renderActiveView();
}

function handleNewProductSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("new-prod-name").value.trim();
  const cat = document.getElementById("new-prod-cat").value;
  const subcat = document.getElementById("new-prod-subcat").value.trim();
  const price = document.getElementById("new-prod-price").value;
  const cost = document.getElementById("new-prod-cost").value;
  const stock = document.getElementById("new-prod-stock").value;
  const icon = document.getElementById("new-prod-icon").value;
  const desc = document.getElementById("new-prod-desc").value.trim();

  eshopStore.addProduct(name, cat, subcat, price, cost, stock, desc, icon);
  showToast(`Added new commodity: ${name}. Stock costs deducted from ledger.`, "success");
  renderActiveView();
}

function handleQuickRestock(e, productId) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const qty = parseInt(input.value);
  if (isNaN(qty) || qty <= 0) return;

  eshopStore.updateStock(productId, qty);
  showToast(`Restocked gadget in inventory! Cost updated in ledgers.`, "success");
  renderActiveView();
}

function populateManagerDirectives() {
  const container = document.getElementById("manager-supervisor-directives-container");
  container.innerHTML = "";

  const announcements = eshopStore.state.announcements;
  const drafted = announcements.filter(a => a.status === "Drafted");

  if (drafted.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:2rem 0; color:var(--text-muted); font-size:0.82rem;">
        No pending announcements from Supervisor console.
      </div>
    `;
    return;
  }

  drafted.forEach(ann => {
    const card = document.createElement("div");
    card.style.background = "var(--bg-app)";
    card.style.padding = "1rem";
    card.style.borderRadius = "8px";
    card.style.borderLeft = "4px solid var(--color-info)";
    card.innerHTML = `
      <p style="font-size:0.85rem; font-weight:500;">${ann.content}</p>
      <div style="margin-top:0.6rem; display:flex; gap:0.4rem; justify-content:flex-end;">
        <button class="btn btn-success" onclick="publishAnnouncement('${ann.id}')" style="padding:0.3rem 0.6rem; font-size:0.72rem;">📢 Publish to Staff</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function publishAnnouncement(id) {
  eshopStore.publishAnnouncement(id);
  showToast("Directive published successfully! HR and Workers notice boards updated.", "success");
  renderActiveView();
}

function handleReportSubmit(e) {
  e.preventDefault();
  const managerName = document.getElementById("manager-report-name").value.trim();
  const content = document.getElementById("manager-report-text").value.trim();
  
  eshopStore.submitReport(managerName, content);
  document.getElementById("manager-report-text").value = "";
  
  showToast("Report compiled and submitted to Supervisor console!", "success");
  renderActiveView();
}


// ==========================================
// 5. SUPERVISOR CONSOLE
// ==========================================
function renderSupervisorView() {
  if (!currentSupervisorUser) {
    elWorkspace.innerHTML += `
      <div class="dashboard-card attendance-layout" style="max-width: 480px; margin: 2rem auto; border-top: 5px solid var(--color-info);">
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <span style="font-size: 3rem;">👑</span>
          <h3 style="margin-top: 0.5rem; border-bottom: none; padding-bottom: 0;">Supervisor Executive Suite</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Access executive organization directives, reports audit, and client feedback registries.</p>
        </div>
        <form id="supervisor-login-form" onsubmit="handleSupervisorLogin(event)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" id="supervisor-login-email" value="supervisor@eshop.com" required autocomplete="email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" id="supervisor-login-pass" value="Supervisor@" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; background-color: var(--color-info);">🔓 Authenticate Executive Portal</button>
        </form>
      </div>
    `;
    return;
  }

  const products = eshopStore.state.products;
  const workers = eshopStore.state.workers;
  const reports = eshopStore.state.reports;
  const orders = eshopStore.state.orders;
  const cashBook = eshopStore.state.cashBook;

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const activeWorkers = workers.filter(w => w.status === 'Approved').length;
  const pendingWorkers = workers.filter(w => w.status === 'Pending').length;
  const totalSalesVal = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.price, 0);

  const cashIn = cashBook.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = cashBook.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
  const profit = cashIn - cashOut;

  const profitColorClass = profit < 0 ? "var(--color-danger)" : "var(--color-info)";
  const profitFormatted = formatCurrency(profit);
  const profitIcon = profit < 0 ? "📉" : "📈";

  // Render Supervisor workspace
  elWorkspace.innerHTML += `
    <div class="client-hero" style="margin-bottom:1.5rem; background: linear-gradient(135deg, var(--color-primary), var(--text-dark));">
      <div class="client-hero-content">
        <h2 style="color:var(--text-light);">Supervisor Executive Suite</h2>
        <p style="color:var(--color-accent);">High-Level Auditing and Directives Broadcasts. Logged in: <strong>${currentSupervisorUser.email}</strong></p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="logoutSupervisor()">🚪 Sign Out</button>
      </div>
    </div>

    <!-- Executive Overview Metrics Cards -->
    <div class="dashboard-grid">
      <div class="dashboard-card" style="border-left: 5px solid var(--color-info);">
        <h3>Warehouse Inventory Volume</h3>
        <h2 style="font-size:2.2rem; color:var(--color-info); font-weight:800; margin-top:0.4rem;">${totalStock} <span style="font-size:1rem; font-weight:500;">items remaining</span></h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Sum of all products currently stocked in warehouse.</p>
      </div>
      <div class="dashboard-card" style="border-left: 5px solid var(--color-success);">
        <h3>Shift Workforce Status</h3>
        <h2 style="font-size:2.2rem; color:var(--color-success); font-weight:800; margin-top:0.4rem;">${activeWorkers} <span style="font-size:1rem; font-weight:500; color:var(--color-warning);">(${pendingWorkers} pending)</span></h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Workers approved today by Human Resources.</p>
      </div>
      <div class="dashboard-card" style="border-left: 5px solid var(--color-warning);">
        <h3>Completed Sales Value</h3>
        <h2 style="font-size:2.2rem; color:var(--color-warning); font-weight:800; margin-top:0.4rem;">$${totalSalesVal.toLocaleString()}</h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Sum of delivered orders purchased by client catalog.</p>
      </div>
      <div class="dashboard-card" style="border-left: 5px solid ${profitColorClass};">
        <h3>${profitIcon} Operating Net Profit</h3>
        <h2 style="font-size:2.2rem; color:${profitColorClass}; font-weight:800; margin-top:0.4rem;">${profitFormatted}</h2>
        <p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">Total Earnings after expenditures deduct.</p>
      </div>
    </div>

    <!-- Split Layout: Comments Resolution & Announcements Generator -->
    <div class="financial-ledger-grid">
      
      <!-- Manager Issues Inbox -->
      <div class="dashboard-card">
        <h3>📥 Manager Correspondence & Incident Reports</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Review balance logs and logistical reports from operations managers. Write dynamic feedback to resolve issues.</p>
        
        <div style="display:flex; flex-direction:column; gap:1.2rem;" id="supervisor-reports-list">
          <!-- Dynamically populated reports list -->
        </div>
      </div>

      <!-- Announcements Pipeline Form -->
      <div class="dashboard-card">
        <h3>📢 Create Corporate Directive Announcements</h3>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Directives are dispatched to the Manager for review. Manager publishes them to propagate announcements onto shift logs.</p>
        
        <form onsubmit="handleSupervisorAnnouncement(event)">
          <div class="form-group">
            <label>Announcement Body</label>
            <textarea class="form-control" id="supervisor-ann-text" rows="4" placeholder="Write corporate updates, delivery time mandates, or worker incentives..." required></textarea>
          </div>
          <div class="form-group">
            <label>Target Audience</label>
            <select class="form-control" id="supervisor-ann-target" required style="background:#fff; border:1px solid var(--color-accent); font-size:0.85rem; padding:0.5rem;">
              <option value="clients">🛒 Clients Only</option>
              <option value="staff">👔 Staff Only (Workers, HR, Manager)</option>
            </select>
          </div>
          <button class="btn btn-primary" type="submit" style="width:100%;">📨 Dispatch Announcement to Manager</button>
        </form>

        <h4 style="margin-top:2rem; margin-bottom:0.8rem; font-size:0.95rem; border-bottom: 1px solid var(--bg-card); padding-bottom:0.4rem;">Directives Status</h4>
        <div style="display:flex; flex-direction:column; gap:0.6rem;" id="supervisor-announcements-status">
          <!-- Dynamic statuses list -->
        </div>
      </div>
      
    </div>

    <!-- HR & Manager Broadcasted Announcements Panel (Supervisor Console) -->
    <div class="dashboard-card" style="margin-top: 2rem; border-top: 4px solid var(--color-success);">
      <h3>📢 HR & Manager Broadcasted Announcements</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">Monitor live announcements broadcasted by Human Resources (HR) and Operations Managers to workers, supervisor, or staff channels.</p>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Broadcaster (Sender)</th>
              <th>Target Audience</th>
              <th>Message Content</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              const hrManagerAnns = eshopStore.state.announcements.filter(a => a.sender === "HR" || a.sender === "Manager");
              if (hrManagerAnns.length === 0) {
                return `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1rem 0;">No announcements broadcasted by HR or Manager yet.</td></tr>`;
              }
              return hrManagerAnns.map(ann => {
                const badgeClass = ann.sender === "HR" ? "badge-info" : "badge-success";
                return `
                  <tr>
                    <td style="font-size:0.8rem;">${new Date(ann.timestamp).toLocaleString()}</td>
                    <td><span class="badge ${badgeClass}" style="font-size:0.75rem;">👤 ${ann.sender}</span></td>
                    <td><span style="font-size:0.8rem; font-weight:600; color:var(--color-primary);">${ann.audience.toUpperCase()}</span></td>
                    <td style="font-size:0.82rem; white-space:normal; word-break:break-all;">${ann.content}</td>
                    <td><span class="badge badge-success" style="font-size:0.7rem;">${ann.status}</span></td>
                  </tr>
                `;
              }).reverse().join("");
            })()}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Client Comments & Issues Panel (Supervisor Console) -->
    <div class="dashboard-card" style="margin-top: 2rem;">
      <h3>💬 Executive Client Comments & Issues Registry</h3>
      <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem;">High-level oversight of operational comments and unresolved/resolved buyer issues.</p>
      <div class="custom-table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Category</th>
              <th>Feedback / Issue Details</th>
              <th>Status</th>
              <th style="text-align:right;">Operations & Resolution</th>
            </tr>
          </thead>
          <tbody>
            ${eshopStore.state.commentsAndIssues.map(feed => {
              const badgeClass = feed.status === "Resolved" ? "badge-success" : "badge-warning";
              let opsMarkup = ``;
              if (feed.status === "Pending") {
                opsMarkup = `
                  <form onsubmit="handleResolveFeedback(event, '${feed.id}')" style="display:inline-flex; gap:0.4rem; justify-content:flex-end;">
                    <input type="text" placeholder="Resolution response..." class="form-control" style="width:180px; padding:0.35rem; font-size:0.8rem; background:#fff; border:1px solid var(--color-accent);" required>
                    <button class="btn btn-success" type="submit" style="padding:0.35rem 0.6rem; font-size:0.75rem;">Resolve</button>
                  </form>
                `;
              } else {
                opsMarkup = `<span style="font-size:0.8rem; color:var(--color-success); font-weight:700;">Resolved 💬: "${feed.adminComment}"</span>`;
              }
              return `
                <tr>
                  <td>
                    <strong>${feed.clientName}</strong>
                    <div style="font-size:0.72rem; color:var(--text-muted);">${feed.clientPhone}</div>
                  </td>
                  <td><strong>${feed.type}</strong></td>
                  <td><span class="badge badge-info" style="font-size:0.65rem;">${feed.category}</span></td>
                  <td style="font-size:0.82rem; max-width:250px; white-space:normal; word-break:break-all;">${feed.content}</td>
                  <td><span class="badge ${badgeClass}">${feed.status}</span></td>
                  <td style="text-align:right;">${opsMarkup}</td>
                </tr>
              `;
            }).reverse().join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  populateSupervisorReports();
  populateSupervisorAnnouncements();
}

function populateSupervisorReports() {
  const container = document.getElementById("supervisor-reports-list");
  container.innerHTML = "";

  const reports = eshopStore.state.reports;
  if (reports.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem 0; color:var(--text-muted); font-size:0.85rem;">
        No incident reports received from operations managers.
      </div>
    `;
    return;
  }

  reports.forEach(rep => {
    const card = document.createElement("div");
    card.style.background = "var(--bg-app)";
    card.style.padding = "1.2rem";
    card.style.borderRadius = "8px";
    card.style.borderLeft = rep.status === "Pending" ? "4px solid var(--color-warning)" : "4px solid var(--color-success)";

    let actionMarkup = ``;
    if (rep.status === "Pending") {
      actionMarkup = `
        <form onsubmit="handleSupervisorReportResolve(event, '${rep.id}')" style="margin-top:1rem; border-top:1px dashed var(--color-accent); padding-top:0.8rem;">
          <div class="form-group">
            <label style="font-size:0.72rem;">Write Resolution Comment</label>
            <input type="text" class="form-control" placeholder="Instruct manager or approve proposal..." required style="background:#fff; font-size:0.8rem; padding:0.5rem 0.8rem;">
          </div>
          <button class="btn btn-success" type="submit" style="padding:0.4rem 0.8rem; font-size:0.75rem;">Resolve Incident</button>
        </form>
      `;
    } else {
      actionMarkup = `
        <div style="margin-top:0.8rem; padding:0.6rem; background:#fff; border-radius:4px; font-size:0.8rem; color:var(--color-success); font-weight:600;">
          Resolved 💬: "${rep.supervisorComment}"
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size:0.9rem; color:var(--color-primary);">Report by ${rep.managerName}</strong>
        <span class="badge ${rep.status === 'Pending' ? 'badge-warning' : 'badge-success'}">${rep.status}</span>
      </div>
      <p style="font-size:0.82rem; color:var(--text-dark); margin-top:0.6rem; line-height:1.4;">${rep.content}</p>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.4rem;">${new Date(rep.timestamp).toLocaleString()}</div>
      ${actionMarkup}
    `;
    container.appendChild(card);
  });
}

function handleSupervisorReportResolve(e, reportId) {
  e.preventDefault();
  const comment = e.target.querySelector("input").value.trim();
  if (!comment) return;

  const report = eshopStore.state.reports.find(r => r.id === reportId);
  const managerName = report ? report.managerName : "Manager";

  eshopStore.resolveReport(reportId, comment);
  showToast(`Incident report resolved! Feedback returned to Manager ${managerName}.`, "success");
  renderActiveView();
}

function handleSupervisorAnnouncement(e) {
  e.preventDefault();
  const text = document.getElementById("supervisor-ann-text").value.trim();
  const audience = document.getElementById("supervisor-ann-target").value;
  if (!text) return;

  eshopStore.createAnnouncement(text, audience);
  document.getElementById("supervisor-ann-text").value = "";
  
  showToast("Directive dispatched to Manager! Pending Manager publishing.", "success");
  renderActiveView();
}

function populateSupervisorAnnouncements() {
  const container = document.getElementById("supervisor-announcements-status");
  container.innerHTML = "";

  const announcements = eshopStore.state.announcements;
  if (announcements.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.75rem; padding:1rem 0;">No directives issued yet.</div>`;
    return;
  }

  announcements.forEach(ann => {
    const div = document.createElement("div");
    div.style.background = "var(--bg-app)";
    div.style.padding = "0.6rem 0.8rem";
    div.style.borderRadius = "6px";
    div.style.fontSize = "0.78rem";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    
    let badgeClass = ann.status === "Published" ? "badge-success" : "badge-warning";
    div.innerHTML = `
      <span style="font-weight:500; max-width:60%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ann.content}</span>
      <span style="display:flex; gap:0.4rem;">
        <span class="badge badge-info" style="font-size:0.6rem;">${ann.audience === 'clients' ? 'Clients' : 'Staff'}</span>
        <span class="badge ${badgeClass}" style="font-size:0.6rem;">${ann.status}</span>
      </span>
    `;
    container.appendChild(div);
  });
}

function handleSupervisorLogin(e) {
  e.preventDefault();
  const email = document.getElementById("supervisor-login-email").value.trim();
  const pass = document.getElementById("supervisor-login-pass").value;
  
  if (email === "supervisor@eshop.com" && pass === "Supervisor@") {
    currentSupervisorUser = { email: email };
    showToast("Supervisor Executive Authenticated Successfully!", "success");
    renderActiveView();
  } else {
    showToast("Invalid Supervisor Email or Password.", "alert");
  }
}

function logoutSupervisor() {
  currentSupervisorUser = null;
  showToast("Logged out of Supervisor console.", "info");
  renderActiveView();
}


// ==========================================
// GLOBAL FORM SUBMISSION HANDLERS
// ==========================================
function setupFormListeners() {
  // Client Registration Form
  document.getElementById("client-register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const pass = document.getElementById("reg-pass").value;

    const res = eshopStore.registerClient(name, email, phone, pass);
    if (res.success) {
      closeModal("modal-client-register");
      showToast(`Welcome ${name}! Your account is registered.`, "success");
      // Reset form
      e.target.reset();
    } else {
      showToast(res.message, "alert");
    }
  });

  // Client Login Form
  document.getElementById("client-login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const phone = document.getElementById("login-phone").value.trim();
    const pass = document.getElementById("login-pass").value;

    const res = eshopStore.loginClient(phone, pass);
    if (res.success) {
      closeModal("modal-client-login");
      clientCart = []; // Reset cart on login
      showToast(`Welcome back, ${res.client.name}!`, "success");
      e.target.reset();
    } else {
      showToast(res.message, "alert");
    }
  });

  // Purchase Checkout Form
  document.getElementById("checkout-payment-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const productId = document.getElementById("checkout-product-id").value;
    const momoNumber = document.getElementById("checkout-momo-number").value.trim();
    const client = eshopStore.state.activeClient;

    if (!client) {
      showToast("Access Denied: Please log in to complete purchase.", "alert");
      return;
    }

    // Explicitly check if they verified the receiver's name (safety requirement!)
    const nameConfirmCheck = document.getElementById("checkout-name-confirm");
    if (nameConfirmCheck && !nameConfirmCheck.checked) {
      showToast("Verification Required: Please check the box to confirm you see the recipient is IRADUSHUBIJE Didier.", "alert");
      return;
    }

    let res;
    if (productId === "cart") {
      res = eshopStore.createMultiPurchase(client.name, client.phone, clientCart, selectedPaymentMethod, momoNumber);
      if (res.success) {
        clientCart = []; // Clear cart on success
        updateCartUI();
      }
    } else {
      res = eshopStore.createPurchase(client.name, client.phone, productId, 1, selectedPaymentMethod, momoNumber);
    }

    if (res.success) {
      closeModal("modal-purchase-checkout");
      showToast(`Purchase Successful! Momo payment details recorded.`, "success");
      e.target.reset();
      
      // Update UI panels synchronously
      renderActiveView();
    } else {
      showToast(res.message, "alert");
    }
  });
}
