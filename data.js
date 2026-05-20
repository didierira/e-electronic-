// eSHOP Electronics - State Management & Data Layer

const DEFAULT_PRODUCTS = [
  {
    id: "prod-infinix",
    name: "Infinix Hot 40 Pro",
    category: "Telephone",
    subCategory: "Infinix",
    price: 180,
    costPrice: 120, // Business cost for financial reporting
    stock: 25,
    description: "6.78\" 120Hz display, Helio G99 processor, 108MP triple camera, 5000mAh battery with 33W fast charge.",
    icon: "📱"
  },
  {
    id: "prod-iphone",
    name: "iPhone 15 Pro",
    category: "Telephone",
    subCategory: "Iphone",
    price: 999,
    costPrice: 700,
    stock: 12,
    description: "Aerospace-grade titanium design, A17 Pro chip, customizable Action button, powerful 48MP main camera.",
    icon: "🍎"
  },
  {
    id: "prod-tecno",
    name: "Tecno Spark 20 Pro",
    category: "Telephone",
    subCategory: "Tecno",
    price: 150,
    costPrice: 100,
    stock: 30,
    description: "108MP Ultra-sensing camera, Helio G99 processor, 120Hz punch-hole display, 256GB ROM + 8GB RAM.",
    icon: "📲"
  },
  {
    id: "prod-airtel",
    name: "Airtel 4G Smart Router",
    category: "Airtel",
    subCategory: "Telecom",
    price: 45,
    costPrice: 25,
    stock: 40,
    description: "High-speed 4G LTE connection, supports up to 32 users, 2500mAh built-in battery for portable power.",
    icon: "📶"
  },
  {
    id: "prod-machine",
    name: "Smart Eco-Wash Washing Machine",
    category: "Machine",
    subCategory: "Home Appliance",
    price: 450,
    costPrice: 310,
    stock: 8,
    description: "8kg front-load inverter washing machine, steam sanitization, smart auto-dose detergent system, eco-friendly.",
    icon: "🧺"
  },
  {
    id: "prod-laptop",
    name: "ZenBook 14 OLED Laptop",
    category: "Laptop",
    subCategory: "Computing",
    price: 850,
    costPrice: 650,
    stock: 15,
    description: "Intel Core Ultra 7, 16GB LPDDR5X RAM, 1TB SSD, 14\" 3K 120Hz OLED screen, ultra-thin metal body.",
    icon: "💻"
  },
  {
    id: "prod-radio",
    name: "Retro Digital Wooden Radio",
    category: "Radio",
    subCategory: "Audio",
    price: 35,
    costPrice: 18,
    stock: 50,
    description: "AM/FM/SW bands, Bluetooth 5.0, wooden vintage acoustic chamber, rechargeable battery, USB/SD playback.",
    icon: "📻"
  },
  {
    id: "prod-tv",
    name: "UltraHD 4K Smart QLED TV 55\"",
    category: "Television",
    subCategory: "Display",
    price: 600,
    costPrice: 420,
    stock: 10,
    description: "Quantum dot color technology, Dolby Vision & Atmos, Google TV built-in, hands-free voice control.",
    icon: "📺"
  }
];

const DEFAULT_WORKERS = [
  { firstName: "Jean", lastName: "Mugisha", telephone: "+250780000001", password: "jean123", timeArrived: "08:15 AM", status: "Approved", flagged: false },
  { firstName: "Aline", lastName: "Umutoni", telephone: "+250780000002", password: "aline123", timeArrived: "08:22 AM", status: "Approved", flagged: false }
];

const DEFAULT_HRS = [
  { firstName: "Claudio", lastName: "Gasana", telephone: "+250780000003", timeArrived: "07:55 AM" }
];

const DEFAULT_ORDERS = [
  {
    id: "ord-1001",
    clientName: "David Keza",
    clientPhone: "+250781234567",
    productId: "prod-iphone",
    productName: "iPhone 15 Pro",
    price: 999,
    costPrice: 700,
    status: "Delivered",
    paymentMethod: "Momo Pay",
    paymentDetails: "*182*8*1*681288# (Paid $999)",
    timestamp: "2026-05-16T14:30:00.000Z"
  },
  {
    id: "ord-1002",
    clientName: "Sonia Gisa",
    clientPhone: "+250788888888",
    productId: "prod-laptop",
    productName: "ZenBook 14 OLED Laptop",
    price: 850,
    costPrice: 650,
    status: "Pending Delivery",
    paymentMethod: "Mobile Number Direct",
    paymentDetails: "+250784983451 (Paid $850)",
    timestamp: "2026-05-17T08:05:00.000Z"
  }
];

const DEFAULT_CASHBOOK = [
  { id: "cash-1", type: "in", category: "Sale", amount: 999, description: "Client Purchase - iPhone 15 Pro (David Keza)", timestamp: "2026-05-16T14:30:00.000Z" },
  { id: "cash-2", type: "in", category: "Sale", amount: 850, description: "Client Purchase - ZenBook 14 OLED Laptop (Sonia Gisa)", timestamp: "2026-05-17T08:05:00.000Z" },
  { id: "cash-3", type: "out", category: "Restock", amount: 1350, description: "Initial Inventory Restocking", timestamp: "2026-05-15T09:00:00.000Z" },
  { id: "cash-4", type: "out", category: "Expense", amount: 150, description: "Office Internet Subscription & Utilities", timestamp: "2026-05-16T10:00:00.000Z" }
];

const DEFAULT_REPORTS = [
  {
    id: "rep-1",
    managerName: "Manzi Eric",
    content: "Daily Financial & Logistics Report. Stock levels are stable. Phone demand is strong. Recommended restocking for iPhones next week.",
    timestamp: "2026-05-16T17:00:00.000Z",
    status: "Resolved",
    supervisorComment: "Approved. Proceed with iPhone restock request."
  }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    content: "We have launched brand new Infinix Hot 40 Pro and iPhone 15 models! Buy today for direct doorstep delivery.",
    timestamp: "2026-05-16T09:00:00.000Z",
    status: "Published",
    audience: "clients"
  },
  {
    id: "ann-2",
    content: "Please ensure all client orders are delivered within 2 hours of payment confirmation. Keep up the great work!",
    timestamp: "2026-05-16T09:30:00.000Z",
    status: "Published",
    audience: "staff"
  }
];

const DEFAULT_COMMENTS_AND_ISSUES = [
  {
    id: "feed-1",
    clientName: "David Keza",
    clientPhone: "+250781234567",
    type: "Issue",
    category: "Delivery",
    content: "My order #ord-1001 was delayed by 30 minutes, but the support was excellent!",
    timestamp: "2026-05-16T16:00:00.000Z",
    status: "Resolved",
    adminComment: "Thank you David! We apologize for the short delay. We will improve our delivery windows."
  },
  {
    id: "feed-2",
    clientName: "Sonia Gisa",
    clientPhone: "+250788888888",
    type: "Comment",
    category: "Product Quality",
    content: "The ZenBook OLED screen is breathtaking. Highly recommend this electronics portal!",
    timestamp: "2026-05-17T08:30:00.000Z",
    status: "Pending",
    adminComment: ""
  }
];

const DEFAULT_MESSAGES = [
  {
    id: "msg-1",
    clientName: "David Keza",
    phone: "+250781234567",
    message: "Hello! Do you have standard warranty on the Infinix phones?",
    timestamp: "2026-05-16T15:00:00.000Z",
    replies: [
      { sender: "Worker (Jean)", message: "Yes David! We offer a 1-year official manufacturer warranty on all Infinix and Tecno models.", timestamp: "2026-05-16T15:20:00.000Z" }
    ],
    status: "Resolved"
  }
];

// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
// Copy your actual Web SDK Config from the Firebase Console and paste it here!
const firebaseConfig = {
  apiKey: "AIzaSyDk_zYIRmTJZrhcSGsTZbvN8gU_NvL1vJo",
  authDomain: "e-electronic-shop.firebaseapp.com",
  projectId: "e-electronic-shop",
  storageBucket: "e-electronic-shop.firebasestorage.app",
  messagingSenderId: "790021875453",
  appId: "1:790021875453:web:aeb186ad326163b0c58094",
  measurementId: "G-NFWCQQR874"
};

// Initialize State Manager with real-time Firebase support & LocalStorage fallback
class StateManager {
  constructor() {
    this.key = "eshop_electronics_state";
    this.state = this.loadState();
    
    // Attempt to initialize Firebase if a valid configuration is provided
    this.isFirebase = false;
    if (typeof firebase !== 'undefined' && firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_")) {
      try {
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.isFirebase = true;
        console.log("eSHOP State Layer: Connected to Firebase Cloud Firestore successfully.");
        this.setupFirestoreListeners();
      } catch (e) {
        console.error("eSHOP State Layer: Failed to initialize Firebase. Using LocalStorage fallback.", e);
      }
    } else {
      console.log("eSHOP State Layer: Firebase config not found or invalid. Using LocalStorage fallback.");
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.key);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.commentsAndIssues) parsed.commentsAndIssues = DEFAULT_COMMENTS_AND_ISSUES;
        // Make sure announcements have audience field
        if (parsed.announcements) {
          parsed.announcements.forEach((a, index) => {
            if (!a.audience) {
              a.audience = index === 0 ? "clients" : "staff";
            }
          });
        }
        // Make sure workers have passwords in current state
        if (parsed.workers) {
          parsed.workers.forEach(w => {
            if (!w.password) {
              const defW = DEFAULT_WORKERS.find(dw => dw.telephone === w.telephone);
              w.password = defW ? defW.password : "worker123";
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse localStorage state", e);
    }
    
    // Default initial state
    const initialState = {
      products: DEFAULT_PRODUCTS,
      clients: [], // Registrations
      activeClient: null,
      workers: DEFAULT_WORKERS,
      hrs: DEFAULT_HRS,
      orders: DEFAULT_ORDERS,
      cashBook: DEFAULT_CASHBOOK,
      reports: DEFAULT_REPORTS,
      announcements: DEFAULT_ANNOUNCEMENTS,
      commentsAndIssues: DEFAULT_COMMENTS_AND_ISSUES,
      messages: DEFAULT_MESSAGES
    };
    
    this.saveStateToStorage(initialState);
    return initialState;
  }

  saveState() {
    this.saveStateToStorage(this.state);
    // Dispatch system event to update UI across panels synchronously
    window.dispatchEvent(new CustomEvent("eshop_state_updated", { detail: this.state }));
  }

  saveStateToStorage(state) {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  // --- REAL-TIME FIRESTORE SYNCHRONIZATION ---
  setupFirestoreListeners() {
    const collections = [
      'products',
      'clients',
      'workers',
      'hrs',
      'orders',
      'cashBook',
      'reports',
      'announcements',
      'commentsAndIssues',
      'messages'
    ];

    collections.forEach(col => {
      this.db.collection(col).onSnapshot(snapshot => {
        if (snapshot.empty) {
          console.log(`[Firebase] Collection '${col}' is empty. Seeding defaults...`);
          this.seedFirestoreCollection(col);
          return;
        }

        const items = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });

        // Maintain consistent chronological / alphabetical sorting for tables
        if (col === 'orders' || col === 'cashBook' || col === 'reports' || col === 'announcements' || col === 'commentsAndIssues' || col === 'messages') {
          items.sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
        } else if (col === 'products') {
          items.sort((a, b) => a.name.localeCompare(b.name));
        }

        // Merge back into local state and keep UI perfectly synchronous
        this.state[col] = items;
        this.saveStateToStorage(this.state);
        window.dispatchEvent(new CustomEvent("eshop_state_updated", { detail: this.state }));
      }, error => {
        console.error(`[Firebase] Snapshot error listening to collection '${col}':`, error);
      });
    });
  }

  seedFirestoreCollection(col) {
    let defaultData = [];
    if (col === 'products') defaultData = DEFAULT_PRODUCTS;
    else if (col === 'workers') defaultData = DEFAULT_WORKERS;
    else if (col === 'hrs') defaultData = DEFAULT_HRS;
    else if (col === 'orders') defaultData = DEFAULT_ORDERS;
    else if (col === 'cashBook') defaultData = DEFAULT_CASHBOOK;
    else if (col === 'reports') defaultData = DEFAULT_REPORTS;
    else if (col === 'announcements') defaultData = DEFAULT_ANNOUNCEMENTS;
    else if (col === 'commentsAndIssues') defaultData = DEFAULT_COMMENTS_AND_ISSUES;
    else if (col === 'messages') defaultData = DEFAULT_MESSAGES;
    else if (col === 'clients') defaultData = [];

    defaultData.forEach(item => {
      const docId = item.id || item.telephone || ('doc-' + Math.floor(Math.random() * 10000000));
      const dataToSave = { ...item };
      delete dataToSave.id;

      this.db.collection(col).doc(docId).set(dataToSave)
        .catch(err => console.error(`[Firebase] Error seeding doc ${docId} in ${col}:`, err));
    });
  }

  // --- ACTIONS ---

  // Clients
  registerClient(name, email, phone, password) {
    // Check if duplicate phone
    const exists = this.state.clients.find(c => c.phone === phone);
    if (exists) return { success: false, message: "A client with this phone number is already registered." };

    const newClient = { name, email, phone, password };
    const docId = "cli-" + Date.now();

    if (this.isFirebase) {
      this.db.collection('clients').doc(docId).set(newClient)
        .catch(err => console.error("Firebase registerClient error:", err));
      // Save local session
      this.state.activeClient = { id: docId, ...newClient };
      this.saveStateToStorage(this.state);
    } else {
      newClient.id = docId;
      this.state.clients.push(newClient);
      this.state.activeClient = newClient;
      this.saveState();
    }
    return { success: true, client: { id: docId, ...newClient } };
  }

  loginClient(phone, password) {
    const client = this.state.clients.find(c => c.phone === phone && c.password === password);
    if (client) {
      this.state.activeClient = client;
      if (this.isFirebase) {
        this.saveStateToStorage(this.state);
        window.dispatchEvent(new CustomEvent("eshop_state_updated", { detail: this.state }));
      } else {
        this.saveState();
      }
      return { success: true, client };
    }
    return { success: false, message: "Invalid phone number or password." };
  }

  logoutClient() {
    this.state.activeClient = null;
    if (this.isFirebase) {
      this.saveStateToStorage(this.state);
      window.dispatchEvent(new CustomEvent("eshop_state_updated", { detail: this.state }));
    } else {
      this.saveState();
    }
  }

  // Workers
  checkInWorker(firstName, lastName, telephone, password, timeArrived) {
    const existing = this.state.workers.find(w => w.telephone === telephone);
    const timeVal = timeArrived || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existing) {
      if (existing.password && existing.password !== password) {
        return { success: false, message: "Incorrect password for this telephone account." };
      }
      if (this.isFirebase) {
        this.db.collection('workers').doc(existing.id).update({
          timeArrived: timeVal,
          status: "Pending"
        }).catch(err => console.error("Firebase check-in update error:", err));
      } else {
        existing.timeArrived = timeVal;
        existing.status = "Pending";
        this.saveState();
      }
      return { success: true, worker: existing, suspicious: false };
    }

    const duplicates = this.state.workers.filter(w => w.telephone === telephone);
    const suspicious = duplicates.length > 0;
    
    const newWorker = {
      firstName,
      lastName,
      telephone,
      password: password || "worker123",
      timeArrived: timeVal,
      status: "Pending",
      flagged: suspicious
    };

    if (this.isFirebase) {
      this.db.collection('workers').doc(telephone).set(newWorker)
        .catch(err => console.error("Firebase new worker check-in error:", err));
    } else {
      this.state.workers.push(newWorker);
      this.saveState();
    }
    return { success: true, worker: newWorker, suspicious };
  }

  approveWorker(index) {
    const worker = this.state.workers[index];
    if (worker) {
      if (this.isFirebase) {
        this.db.collection('workers').doc(worker.id).update({ status: "Approved" })
          .catch(err => console.error(err));
      } else {
        worker.status = "Approved";
        this.saveState();
      }
    }
  }

  rejectWorker(index) {
    const worker = this.state.workers[index];
    if (worker) {
      if (this.isFirebase) {
        this.db.collection('workers').doc(worker.id).update({ status: "Rejected/Absent" })
          .catch(err => console.error(err));
      } else {
        worker.status = "Rejected/Absent";
        this.saveState();
      }
    }
  }

  flagWorker(index, flagState) {
    const worker = this.state.workers[index];
    if (worker) {
      if (this.isFirebase) {
        this.db.collection('workers').doc(worker.id).update({ flagged: flagState })
          .catch(err => console.error(err));
      } else {
        worker.flagged = flagState;
        this.saveState();
      }
    }
  }

  // HR
  checkInHR(firstName, lastName, telephone, timeArrived) {
    const timeVal = timeArrived || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHR = {
      firstName,
      lastName,
      telephone,
      timeArrived: timeVal
    };

    if (this.isFirebase) {
      this.db.collection('hrs').doc(telephone).set(newHR)
        .catch(err => console.error("Firebase HR check-in error:", err));
    } else {
      this.state.hrs.push(newHR);
      this.saveState();
    }
    return { success: true, hr: newHR };
  }

  // Inventory Management (Manager Input Products)
  addProduct(name, category, subCategory, price, costPrice, stock, description, icon = "📦") {
    const docId = "prod-" + Date.now();
    const newProd = {
      name,
      category,
      subCategory,
      price: parseFloat(price),
      costPrice: parseFloat(costPrice),
      stock: parseInt(stock),
      description,
      icon
    };
    const restockCost = parseFloat(costPrice) * parseInt(stock);

    if (this.isFirebase) {
      this.db.collection('products').doc(docId).set(newProd)
        .catch(err => console.error("Firebase addProduct error:", err));
      this.addTransaction("out", "Restock", restockCost, `Restocked Inventory: Added ${stock}x ${name}`);
    } else {
      newProd.id = docId;
      this.state.products.push(newProd);
      this.addTransaction("out", "Restock", restockCost, `Restocked Inventory: Added ${stock}x ${name}`);
      this.saveState();
    }
    return { id: docId, ...newProd };
  }

  updateStock(productId, addAmount) {
    const prod = this.state.products.find(p => p.id === productId);
    if (prod) {
      const expense = prod.costPrice * parseInt(addAmount);
      const newStock = prod.stock + parseInt(addAmount);
      
      if (this.isFirebase) {
        this.db.collection('products').doc(productId).update({ stock: newStock })
          .catch(err => console.error("Firebase updateStock error:", err));
        this.addTransaction("out", "Restock", expense, `Restocked ${addAmount}x ${prod.name}`);
      } else {
        prod.stock += parseInt(addAmount);
        this.addTransaction("out", "Restock", expense, `Restocked ${addAmount}x ${prod.name}`);
        this.saveState();
      }
    }
  }

  // Purchases (Client Output Products)
  createPurchase(clientName, clientPhone, productId, qty, payMethod, momoNumber) {
    const prod = this.state.products.find(p => p.id === productId);
    if (!prod) return { success: false, message: "Product not found." };
    if (prod.stock < qty) return { success: false, message: "Insufficient stock." };

    const totalRevenue = prod.price * qty;
    const newStock = prod.stock - qty;
    const docId = "ord-" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      clientName,
      clientPhone,
      productId,
      productName: prod.name,
      price: totalRevenue,
      costPrice: prod.costPrice,
      status: "Pending Delivery",
      paymentMethod: payMethod,
      paymentDetails: payMethod === "Momo Pay" ? `*182*8*1*681288# (Paid $${totalRevenue} via ${momoNumber})` : `Direct: +250784983451 (Paid $${totalRevenue} via ${momoNumber})`,
      timestamp: new Date().toISOString()
    };

    if (this.isFirebase) {
      this.db.collection('products').doc(productId).update({ stock: newStock })
        .catch(err => console.error(err));
      this.db.collection('orders').doc(docId).set(newOrder)
        .catch(err => console.error(err));
      this.addTransaction("in", "Sale", totalRevenue, `Client Purchase - ${prod.name} x${qty} (${clientName})`);
    } else {
      prod.stock -= qty;
      newOrder.id = docId;
      this.state.orders.push(newOrder);
      this.addTransaction("in", "Sale", totalRevenue, `Client Purchase - ${prod.name} x${qty} (${clientName})`);
      this.saveState();
    }
    return { success: true, order: { id: docId, ...newOrder } };
  }

  createMultiPurchase(clientName, clientPhone, cartItems, payMethod, momoNumber) {
    if (!cartItems || cartItems.length === 0) return { success: false, message: "Cart is empty." };

    // 1. Verify stock for all items
    for (const item of cartItems) {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (!prod) return { success: false, message: "Product not found." };
      if (prod.stock < item.qty) return { success: false, message: `Insufficient stock for ${prod.name}.` };
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let productNames = [];

    // 2. Process stock deduction for each item
    for (const item of cartItems) {
      const prod = this.state.products.find(p => p.id === item.productId);
      const newStock = prod.stock - item.qty;
      totalRevenue += prod.price * item.qty;
      totalCost += prod.costPrice * item.qty;
      productNames.push(`${prod.name} (x${item.qty})`);

      if (this.isFirebase) {
        this.db.collection('products').doc(item.productId).update({ stock: newStock })
          .catch(err => console.error("Firebase update stock error:", err));
      } else {
        prod.stock -= item.qty;
      }
    }

    const docId = "ord-" + Math.floor(1000 + Math.random() * 9000);
    const prodNamesStr = productNames.join(", ");

    const newOrder = {
      clientName,
      clientPhone,
      productId: cartItems.map(i => i.productId).join(","),
      productName: prodNamesStr,
      price: totalRevenue,
      costPrice: totalCost,
      status: "Pending Delivery",
      paymentMethod: payMethod,
      paymentDetails: payMethod === "Momo Pay" ? `*182*8*1*681288# (Paid $${totalRevenue} via ${momoNumber})` : `Direct: +250784983451 (Paid $${totalRevenue} via ${momoNumber})`,
      timestamp: new Date().toISOString()
    };

    if (this.isFirebase) {
      this.db.collection('orders').doc(docId).set(newOrder)
        .catch(err => console.error("Firebase set order error:", err));
      this.addTransaction("in", "Sale", totalRevenue, `Client Purchase - ${prodNamesStr} (${clientName})`);
    } else {
      newOrder.id = docId;
      this.state.orders.push(newOrder);
      this.addTransaction("in", "Sale", totalRevenue, `Client Purchase - ${prodNamesStr} (${clientName})`);
      this.saveState();
    }

    return { success: true, order: { id: docId, ...newOrder } };
  }

  updateDeliveryStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      if (this.isFirebase) {
        this.db.collection('orders').doc(orderId).update({ status: newStatus })
          .catch(err => console.error(err));
      } else {
        order.status = newStatus;
        this.saveState();
      }
    }
  }

  // Cash Ledger Utilities
  addTransaction(type, category, amount, description) {
    const docId = "cash-" + Date.now();
    const newTx = {
      type, // 'in' or 'out'
      category, // 'Sale', 'Restock', 'Expense'
      amount: parseFloat(amount),
      description,
      timestamp: new Date().toISOString()
    };

    if (this.isFirebase) {
      this.db.collection('cashBook').doc(docId).set(newTx)
        .catch(err => console.error("Firebase addTransaction error:", err));
    } else {
      newTx.id = docId;
      this.state.cashBook.push(newTx);
      this.saveState();
    }
  }

  // Messaging (Caring Clients)
  sendClientMessage(clientName, phone, text) {
    const docId = "msg-" + Date.now();
    const newMsg = {
      clientName,
      phone,
      message: text,
      timestamp: new Date().toISOString(),
      replies: [],
      status: "Open"
    };

    if (this.isFirebase) {
      this.db.collection('messages').doc(docId).set(newMsg)
        .catch(err => console.error("Firebase sendClientMessage error:", err));
    } else {
      newMsg.id = docId;
      this.state.messages.push(newMsg);
      this.saveState();
    }
    return { id: docId, ...newMsg };
  }

  replyToMessage(messageId, workerName, text) {
    const msg = this.state.messages.find(m => m.id === messageId);
    if (msg) {
      const newReply = {
        sender: `Worker (${workerName})`,
        message: text,
        timestamp: new Date().toISOString()
      };

      if (this.isFirebase) {
        this.db.collection('messages').doc(messageId).update({
          replies: firebase.firestore.FieldValue.arrayUnion(newReply),
          status: "Resolved"
        }).catch(err => console.error("Firebase replyToMessage error:", err));
      } else {
        msg.replies.push(newReply);
        msg.status = "Resolved";
        this.saveState();
      }
    }
  }

  // Manager -> Supervisor Reports
  submitReport(managerName, content) {
    const docId = "rep-" + Date.now();
    const newRep = {
      managerName,
      content,
      timestamp: new Date().toISOString(),
      status: "Pending",
      supervisorComment: ""
    };

    if (this.isFirebase) {
      this.db.collection('reports').doc(docId).set(newRep)
        .catch(err => console.error("Firebase submitReport error:", err));
    } else {
      newRep.id = docId;
      this.state.reports.push(newRep);
      this.saveState();
    }
    return { id: docId, ...newRep };
  }

  // Supervisor -> Manager Issues Resolution
  resolveReport(reportId, commentText) {
    const report = this.state.reports.find(r => r.id === reportId);
    if (report) {
      if (this.isFirebase) {
        this.db.collection('reports').doc(reportId).update({
          status: "Resolved",
          supervisorComment: commentText
        }).catch(err => console.error("Firebase resolveReport error:", err));
      } else {
        report.status = "Resolved";
        report.supervisorComment = commentText;
        this.saveState();
      }
    }
  }

  // Supervisor -> Manager -> Announcements Pipeline
  createAnnouncement(content, audience = "clients") {
    const docId = "ann-" + Date.now();
    const newAnn = {
      content,
      audience,
      timestamp: new Date().toISOString(),
      status: "Drafted"
    };

    if (this.isFirebase) {
      this.db.collection('announcements').doc(docId).set(newAnn)
        .catch(err => console.error("Firebase createAnnouncement error:", err));
    } else {
      newAnn.id = docId;
      this.state.announcements.push(newAnn);
      this.saveState();
    }
    return { id: docId, ...newAnn };
  }

  createDirectAnnouncement(content, audience = "clients", sender = "System") {
    const docId = "ann-" + Date.now();
    const newAnn = {
      content,
      audience,
      sender,
      timestamp: new Date().toISOString(),
      status: "Published"
    };

    if (this.isFirebase) {
      this.db.collection('announcements').doc(docId).set(newAnn)
        .catch(err => console.error("Firebase createDirectAnnouncement error:", err));
    } else {
      newAnn.id = docId;
      this.state.announcements.push(newAnn);
      this.saveState();
    }
    return { id: docId, ...newAnn };
  }

  publishAnnouncement(announcementId) {
    const ann = this.state.announcements.find(a => a.id === announcementId);
    if (ann) {
      if (this.isFirebase) {
        this.db.collection('announcements').doc(announcementId).update({ status: "Published" })
          .catch(err => console.error("Firebase publishAnnouncement error:", err));
      } else {
        ann.status = "Published";
        this.saveState();
      }
    }
  }

  // Client Comments & Issues
  submitCommentOrIssue(clientName, clientPhone, type, category, content) {
    const docId = "feed-" + Date.now();
    const newIssue = {
      clientName,
      clientPhone,
      type,
      category,
      content,
      timestamp: new Date().toISOString(),
      status: "Pending",
      adminComment: ""
    };

    if (this.isFirebase) {
      this.db.collection('commentsAndIssues').doc(docId).set(newIssue)
        .catch(err => console.error("Firebase submitCommentOrIssue error:", err));
    } else {
      newIssue.id = docId;
      this.state.commentsAndIssues.push(newIssue);
      this.saveState();
    }
    return { id: docId, ...newIssue };
  }

  resolveCommentOrIssue(id, commentText) {
    const issue = this.state.commentsAndIssues.find(i => i.id === id);
    if (issue) {
      if (this.isFirebase) {
        this.db.collection('commentsAndIssues').doc(id).update({
          status: "Resolved",
          adminComment: commentText
        }).catch(err => console.error("Firebase resolveCommentOrIssue error:", err));
      } else {
        issue.status = "Resolved";
        issue.adminComment = commentText;
        this.saveState();
      }
    }
  }

  updateWorkerPassword(telephone, newPassword) {
    const worker = this.state.workers.find(w => w.telephone === telephone);
    if (worker) {
      if (this.isFirebase) {
        this.db.collection('workers').doc(worker.id).update({ password: newPassword })
          .catch(err => console.error("Firebase updateWorkerPassword error:", err));
        return true;
      } else {
        worker.password = newPassword;
        this.saveState();
        return true;
      }
    }
    return false;
  }
}

// Global instance
const store = new StateManager();
window.eshopStore = store;
console.log("eSHOP State Layer Initialized Successfully.");
