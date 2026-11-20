// ============================================================================
// CS311 Software Engineering Lab (IIIT Bhagalpur) — P03: Delivery Agent System
// Offline-Ready State Management & Automated Courier Dispatch Engine
// ============================================================================

const STORAGE_KEY = "cs311_p03_delivery_system_v1";

const DEFAULT_COURIERS = [
  {
    id: "CR-101",
    name: "BlueDart Express",
    localities: ["Bhagalpur", "Patna", "Lucknow", "Delhi", "Kolkata"],
    baseRate: 70,
    perKgRate: 28,
    slaDays: 2,
    rating: 4.9,
    maxCapacity: 12,
    activeLoad: 2,
    rewardBalance: 350,
    available: true
  },
  {
    id: "CR-102",
    name: "Delhivery Surface",
    localities: ["Bhagalpur", "Patna", "Lucknow", "Delhi", "Kolkata"],
    baseRate: 45,
    perKgRate: 18,
    slaDays: 4,
    rating: 4.5,
    maxCapacity: 20,
    activeLoad: 1,
    rewardBalance: 150,
    available: true
  },
  {
    id: "CR-103",
    name: "DTDC Prime",
    localities: ["Bhagalpur", "Patna", "Kolkata"],
    baseRate: 50,
    perKgRate: 20,
    slaDays: 3,
    rating: 4.6,
    maxCapacity: 15,
    activeLoad: 1,
    rewardBalance: 100,
    available: true
  },
  {
    id: "CR-104",
    name: "Ecom Express",
    localities: ["Patna", "Lucknow", "Delhi"],
    baseRate: 40,
    perKgRate: 16,
    slaDays: 3,
    rating: 4.3,
    maxCapacity: 18,
    activeLoad: 0,
    rewardBalance: -50,
    available: true
  },
  {
    id: "CR-105",
    name: "Shadowfax Hyperlocal",
    localities: ["Bhagalpur", "Patna", "Lucknow"],
    baseRate: 55,
    perKgRate: 22,
    slaDays: 2,
    rating: 4.7,
    maxCapacity: 10,
    activeLoad: 0,
    rewardBalance: 200,
    available: true
  }
];

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const DEFAULT_STATE = {
  nextBookingNum: 1005,
  nextNoticeNum: 503,
  couriers: JSON.parse(JSON.stringify(DEFAULT_COURIERS)),
  deliveries: [
    {
      trackingId: "DEL-1001",
      orderRef: "FLP-88210",
      customerName: "Rohan Verma",
      source: "Bhagalpur",
      destination: "Patna",
      address: "Fraser Road, Near Dakbunglow Crossing, Patna - 800001",
      weightKg: 2.5,
      courierId: "CR-101",
      courierName: "BlueDart Express",
      scheduledDate: offsetDate(1),
      totalCost: 140,
      status: "IN_TRANSIT",
      history: ["Booked via Portal", "Auto-assigned to BlueDart Express", "Dispatched from Bhagalpur Hub"]
    },
    {
      trackingId: "DEL-1002",
      orderRef: "AMZ-44109",
      customerName: "Ananya Singh",
      source: "Patna",
      destination: "Delhi",
      address: "Sector 18, Noida / East Delhi Border - 110096",
      weightKg: 4.0,
      courierId: "CR-102",
      courierName: "Delhivery Surface",
      scheduledDate: offsetDate(3),
      totalCost: 117,
      status: "BOOKED",
      history: ["Booked via Portal", "Auto-assigned to Delhivery Surface (Lowest Cost)"]
    },
    {
      trackingId: "DEL-1003",
      orderRef: "FLP-88904",
      customerName: "Priyam Kumar",
      source: "Bhagalpur",
      destination: "Kolkata",
      address: "Sector V, Salt Lake, Kolkata - 700091",
      weightKg: 1.5,
      courierId: "CR-103",
      courierName: "DTDC Prime",
      scheduledDate: offsetDate(2),
      totalCost: 80,
      status: "OUT_FOR_DELIVERY",
      history: ["Booked via Portal", "Assigned to DTDC Prime", "Out for delivery in Kolkata"]
    }
  ],
  archive: [
    {
      trackingId: "DEL-0998",
      orderRef: "AMZ-31002",
      customerName: "Vikramaditya Roy",
      source: "Bhagalpur",
      destination: "Patna",
      weightKg: 3.0,
      courierId: "CR-101",
      courierName: "BlueDart Express",
      finalCost: 154,
      closedAt: offsetDate(-2),
      outcome: "DELIVERED_ON_TIME"
    },
    {
      trackingId: "DEL-0999",
      orderRef: "FLP-77120",
      customerName: "Sneha Gupta",
      source: "Lucknow",
      destination: "Delhi",
      weightKg: 5.0,
      courierId: "CR-102",
      courierName: "Delhivery Surface",
      finalCost: 135,
      closedAt: offsetDate(-1),
      outcome: "DELIVERED_ON_TIME"
    }
  ],
  ledger: [
    {
      noticeId: "NTC-501",
      timestamp: offsetDate(-2) + " 14:20",
      courierId: "CR-101",
      courierName: "BlueDart Express",
      deliveryId: "DEL-0998",
      type: "REWARD",
      amount: 150,
      remarks: "On-time SLA delivery completed ahead of schedule"
    },
    {
      noticeId: "NTC-502",
      timestamp: offsetDate(-1) + " 18:05",
      courierId: "CR-104",
      courierName: "Ecom Express",
      deliveryId: "DEL-0995",
      type: "PENALTY",
      amount: -200,
      remarks: "24-hour transit delay on Lucknow-Delhi corridor"
    }
  ],
  notices: [
    {
      title: "System Initialized",
      detail: "Loaded 5 active couriers, 3 live shipments, and 2 archived historical records.",
      time: "Ready"
    }
  ]
};

let state = loadState();
let selectedTrackingId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("LocalStorage unavailable, using in-memory session.");
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function showToast(message, type = "info") {
  const area = document.getElementById("toastArea");
  const div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerHTML = `<span>${message}</span><button style="background:none;border:none;cursor:pointer;font-weight:bold;" onclick="this.parentElement.remove()">✕</button>`;
  area.prepend(div);
  setTimeout(() => {
    if (div.parentElement) div.remove();
  }, 6000);
}

function logOutputNotice(title, detail) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  state.notices.unshift({ title, detail, time: now });
  if (state.notices.length > 20) state.notices.pop();
  saveState();
  renderNotices();
}

// Navigation
const TAB_TITLES = {
  dashboard: ["Dashboard & Live Dispatch", "Automated courier assignment engine & real-time shipment operations"],
  book: ["Book a Delivery", "Accept online portal requests & auto-match optimal available couriers"],
  manage: ["Track / Reschedule / Cancel", "Inspect live delivery status reports, modify schedules, or cancel bookings"],
  couriers: ["Couriers & Rewards/Penalties", "Manage service localities, pricing rates, and SLA reward/penalty notices"],
  archive: ["Archive & Courier Query", "Audit past deliveries and query historical service records per courier"],
  "se-artifacts": ["SE Lab Design Artifacts", "CS311 Section 5: Actors, Use Cases, Data Model Entities & System Constraints"]
};

function switchTab(tabId) {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });
  const [title, sub] = TAB_TITLES[tabId] || ["Delivery Agent System", ""];
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageSubtitle").textContent = sub;
  refreshAllViews();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Core Dispatch Matching Algorithm
function computeShippingCost(courier, weightKg, source, dest) {
  const interCityMultiplier = source === dest ? 0.8 : 1.0;
  return Math.round((courier.baseRate + courier.perKgRate * weightKg) * interCityMultiplier);
}

function findEligibleCouriers(source, dest, weightKg, mode = "balanced") {
  const eligible = state.couriers.filter(c =>
    c.available &&
    c.activeLoad < c.maxCapacity &&
    c.localities.includes(source) &&
    c.localities.includes(dest)
  );

  return eligible.map(c => {
    const cost = computeShippingCost(c, weightKg, source, dest);
    // Lower score = better candidate
    let score = cost;
    if (mode === "fastest") {
      score = c.slaDays * 100 + cost * 0.2 - c.rating * 10;
    } else if (mode === "balanced") {
      score = cost * 0.55 + c.slaDays * 35 - c.rating * 18 - (c.rewardBalance * 0.02);
    }
    return { courier: c, cost, score };
  }).sort((a, b) => a.score - b.score);
}

// Render Functions
function renderKPIs() {
  document.getElementById("kpiActive").textContent = state.deliveries.length;
  const availCount = state.couriers.filter(c => c.available && c.activeLoad < c.maxCapacity).length;
  document.getElementById("kpiCouriers").textContent = `${availCount} / ${state.couriers.length}`;
  document.getElementById("kpiArchived").textContent = state.archive.length;
  const netPool = state.couriers.reduce((acc, c) => acc + c.rewardBalance, 0);
  document.getElementById("kpiRewards").textContent = `₹${netPool}`;
}

function statusPillHtml(status) {
  const map = {
    BOOKED: "pill-booked",
    RESCHEDULED: "pill-rescheduled",
    IN_TRANSIT: "pill-transit",
    OUT_FOR_DELIVERY: "pill-transit",
    DELIVERED_ON_TIME: "pill-delivered",
    DELIVERED_DELAYED: "pill-warning",
    CANCELLED: "pill-cancelled"
  };
  return `<span class="pill ${map[status] || "pill-booked"}">${status.replaceAll("_", " ")}</span>`;
}

function renderActiveDeliveries() {
  const tbody = document.getElementById("activeDeliveriesTable");
  if (state.deliveries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#64748b;padding:20px;">No active deliveries in queue. Book a new delivery to begin.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.deliveries.map(d => `
    <tr>
      <td><strong>${d.trackingId}</strong></td>
      <td>${d.customerName}<br><span style="font-size:0.78rem;color:#64748b;">${d.orderRef}</span></td>
      <td>${d.source} → ${d.destination}<br><span style="font-size:0.78rem;color:#64748b;">${d.weightKg} kg</span></td>
      <td><strong>${d.courierName}</strong><br><span style="font-size:0.78rem;color:#64748b;">${d.courierId}</span></td>
      <td>${d.scheduledDate}</td>
      <td><strong>₹${d.totalCost}</strong></td>
      <td>${statusPillHtml(d.status)}</td>
      <td>
        <button class="btn-secondary-sm" onclick="openInManage('${d.trackingId}')">Manage</button>
      </td>
    </tr>
  `).join("");
}

function renderNotices() {
  const feed = document.getElementById("outputReceiptFeed");
  feed.innerHTML = state.notices.map(n => `
    <div class="receipt-item">
      <div class="receipt-header">
        <span>${n.title}</span>
        <span style="font-size:0.76rem;color:#64748b;font-weight:500;">${n.time}</span>
      </div>
      <div>${n.detail}</div>
    </div>
  `).join("");
}

function updateMatchPreview() {
  const src = document.getElementById("sourceLocality").value;
  const dst = document.getElementById("destLocality").value;
  const wt = parseFloat(document.getElementById("pkgWeight").value) || 1;
  const mode = document.getElementById("priorityMode").value;

  const matches = findEligibleCouriers(src, dst, wt, mode);
  const container = document.getElementById("matchingPreviewList");
  const manualSelect = document.getElementById("manualCourierSelect");

  if (matches.length === 0) {
    container.innerHTML = `<div class="toast danger">No available courier covers both <strong>${src}</strong> and <strong>${dst}</strong> right now.</div>`;
    manualSelect.innerHTML = `<option value="">No eligible couriers</option>`;
    return;
  }

  manualSelect.innerHTML = matches.map(m =>
    `<option value="${m.courier.id}">${m.courier.name} — ₹${m.cost} (${m.courier.slaDays}d SLA, ★${m.courier.rating})</option>`
  ).join("");

  container.innerHTML = matches.map((m, idx) => `
    <div class="match-item ${idx === 0 ? "best" : ""}">
      <div>
        <strong>${idx === 0 ? "★ Best Match: " : ""}${m.courier.name}</strong>
        <div class="match-meta">
          SLA: ${m.courier.slaDays} day(s) • Rating: ★${m.courier.rating} • Load: ${m.courier.activeLoad}/${m.courier.maxCapacity}
        </div>
      </div>
      <div class="match-price">
        <strong>₹${m.cost}</strong>
        <span style="font-size:0.75rem;color:#64748b;">Base ₹${m.courier.baseRate} + ₹${m.courier.perKgRate}/kg</span>
      </div>
    </div>
  `).join("");
}

function renderCouriersAndLedger() {
  const tbody = document.getElementById("couriersTableBody");
  tbody.innerHTML = state.couriers.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td>${c.name}</td>
      <td>${c.localities.join(", ")}</td>
      <td>₹${c.baseRate} + ₹${c.perKgRate}/kg</td>
      <td>${c.slaDays}d</td>
      <td>★ ${c.rating}</td>
      <td>${c.activeLoad} / ${c.maxCapacity}</td>
      <td style="font-weight:700;color:${c.rewardBalance >= 0 ? "#059669" : "#dc2626"};">
        ${c.rewardBalance >= 0 ? "+" : ""}₹${c.rewardBalance}
      </td>
      <td>
        <button class="btn-secondary-sm" onclick="toggleCourierAvailability('${c.id}')">
          ${c.available ? "🟢 Active" : "🔴 Offline"}
        </button>
      </td>
    </tr>
  `).join("");

  const rpSelect = document.getElementById("rpCourierSelect");
  rpSelect.innerHTML = state.couriers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join("");

  const ledgerBody = document.getElementById("rewardLedgerBody");
  ledgerBody.innerHTML = state.ledger.map(item => `
    <tr>
      <td><strong>${item.noticeId}</strong></td>
      <td>${item.timestamp}</td>
      <td>${item.courierName} (${item.courierId})</td>
      <td>${item.deliveryId || "—"}</td>
      <td><span class="pill ${item.type === "REWARD" ? "pill-delivered" : "pill-cancelled"}">${item.type}</span></td>
      <td style="font-weight:700;color:${item.amount >= 0 ? "#059669" : "#dc2626"};">
        ${item.amount >= 0 ? "+" : ""}₹${item.amount}
      </td>
      <td>${item.remarks}</td>
    </tr>
  `).join("");
}

function renderArchive() {
  const filterSelect = document.getElementById("archiveCourierFilter");
  const currentVal = filterSelect.value || "ALL";
  filterSelect.innerHTML = `<option value="ALL">All Couriers (Complete Archive)</option>` +
    state.couriers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join("");
  filterSelect.value = currentVal;

  const filtered = currentVal === "ALL"
    ? state.archive
    : state.archive.filter(a => a.courierId === currentVal);

  const totalRev = filtered.reduce((s, a) => s + a.finalCost, 0);
  const deliveredCount = filtered.filter(a => a.outcome.startsWith("DELIVERED")).length;
  const cancelledCount = filtered.filter(a => a.outcome === "CANCELLED").length;

  document.getElementById("courierServiceSummary").innerHTML = `
    <div><strong>Query Scope:</strong> ${currentVal === "ALL" ? "All Couriers" : currentVal}</div>
    <div><strong>Total Past Services:</strong> ${filtered.length}</div>
    <div><strong>Completed Deliveries:</strong> ${deliveredCount}</div>
    <div><strong>Cancelled:</strong> ${cancelledCount}</div>
    <div><strong>Total Billed Value:</strong> ₹${totalRev}</div>
  `;

  const tbody = document.getElementById("archiveTableBody");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#64748b;padding:20px;">No archived records match the selected courier query.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(a => `
    <tr>
      <td><strong>${a.trackingId}</strong></td>
      <td>${a.courierName} (${a.courierId})</td>
      <td>${a.customerName}<br><span style="font-size:0.78rem;color:#64748b;">${a.orderRef}</span></td>
      <td>${a.source} → ${a.destination}</td>
      <td>${a.weightKg} kg</td>
      <td><strong>₹${a.finalCost}</strong></td>
      <td>${a.closedAt}</td>
      <td>${statusPillHtml(a.outcome)}</td>
    </tr>
  `).join("");
}

function renderManageDropdown() {
  const sel = document.getElementById("quickSelectBooking");
  sel.innerHTML = `<option value="">-- Select Active Delivery --</option>` +
    state.deliveries.map(d => `<option value="${d.trackingId}">${d.trackingId} — ${d.customerName} (${d.source} → ${d.destination})</option>`).join("");
}

function refreshAllViews() {
  renderKPIs();
  renderActiveDeliveries();
  renderNotices();
  updateMatchPreview();
  renderCouriersAndLedger();
  renderArchive();
  renderManageDropdown();
}

// Event Handlers: Booking
document.getElementById("deliveryDate").value = offsetDate(2);
["sourceLocality", "destLocality", "pkgWeight", "priorityMode"].forEach(id => {
  document.getElementById(id).addEventListener("change", updateMatchPreview);
  document.getElementById(id).addEventListener("input", updateMatchPreview);
});

document.getElementById("assignmentMode").addEventListener("change", (e) => {
  document.getElementById("manualCourierBox").style.display = e.target.value === "manual" ? "flex" : "none";
});

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const customerName = document.getElementById("custName").value.trim();
  const orderRef = document.getElementById("orderRef").value.trim();
  const source = document.getElementById("sourceLocality").value;
  const destination = document.getElementById("destLocality").value;
  const address = document.getElementById("destAddress").value.trim();
  const weightKg = parseFloat(document.getElementById("pkgWeight").value);
  const scheduledDate = document.getElementById("deliveryDate").value;
  const priorityMode = document.getElementById("priorityMode").value;
  const assignmentMode = document.getElementById("assignmentMode").value;

  const matches = findEligibleCouriers(source, destination, weightKg, priorityMode);
  if (matches.length === 0) {
    showToast(`Constraint Error: No courier available for ${source} → ${destination}.`, "danger");
    return;
  }

  let chosen = matches[0];
  if (assignmentMode === "manual") {
    const manualId = document.getElementById("manualCourierSelect").value;
    chosen = matches.find(m => m.courier.id === manualId) || matches[0];
  }

  const trackingId = `DEL-${state.nextBookingNum++}`;
  chosen.courier.activeLoad += 1;

  const newDelivery = {
    trackingId,
    orderRef,
    customerName,
    source,
    destination,
    address,
    weightKg,
    courierId: chosen.courier.id,
    courierName: chosen.courier.name,
    scheduledDate,
    totalCost: chosen.cost,
    status: "BOOKED",
    history: [
      `Booked via Online Portal (${orderRef})`,
      `Assigned to ${chosen.courier.name} (${chosen.courier.id}) • Charge ₹${chosen.cost}`
    ]
  };

  state.deliveries.unshift(newDelivery);
  saveState();

  const receiptMsg = `Booking Confirmation [${trackingId}]: Assigned ${chosen.courier.name} for ${source} → ${destination} (${weightKg} kg). Total: ₹${chosen.cost}, ETA: ${scheduledDate}.`;
  showToast(receiptMsg, "success");
  logOutputNotice(`Output 1: Booking Confirmation (${trackingId})`, receiptMsg);

  e.target.reset();
  document.getElementById("pkgWeight").value = "2.0";
  document.getElementById("deliveryDate").value = offsetDate(2);
  switchTab("dashboard");
});

// Event Handlers: Track / Reschedule / Cancel
function openInManage(trackingId) {
  switchTab("manage");
  document.getElementById("lookupInput").value = trackingId;
  loadDeliveryForManagement(trackingId);
}

document.getElementById("quickSelectBooking").addEventListener("change", (e) => {
  if (e.target.value) {
    document.getElementById("lookupInput").value = e.target.value;
    loadDeliveryForManagement(e.target.value);
  }
});

document.getElementById("lookupBtn").addEventListener("click", () => {
  const id = document.getElementById("lookupInput").value.trim().toUpperCase();
  loadDeliveryForManagement(id);
});

function loadDeliveryForManagement(trackingId) {
  const delivery = state.deliveries.find(d => d.trackingId === trackingId);
  const workspace = document.getElementById("manageWorkspace");

  if (!delivery) {
    const archived = state.archive.find(a => a.trackingId === trackingId);
    if (archived) {
      showToast(`${trackingId} is already closed & archived (${archived.outcome}) on ${archived.closedAt}.`, "warning");
    } else {
      showToast(`Tracking ID "${trackingId}" not found in active shipments.`, "danger");
    }
    workspace.style.display = "none";
    return;
  }

  selectedTrackingId = trackingId;
  workspace.style.display = "grid";
  document.getElementById("newDeliveryDate").value = delivery.scheduledDate;

  const badge = document.getElementById("reportStatusBadge");
  badge.textContent = delivery.status.replaceAll("_", " ");
  badge.className = "pill pill-booked";

  document.getElementById("statusReportCard").innerHTML = `
    <div class="report-field"><span>Tracking ID</span><strong>${delivery.trackingId}</strong></div>
    <div class="report-field"><span>Order Ref</span><strong>${delivery.orderRef}</strong></div>
    <div class="report-field"><span>Customer</span><strong>${delivery.customerName}</strong></div>
    <div class="report-field"><span>Assigned Courier</span><strong>${delivery.courierName} (${delivery.courierId})</strong></div>
    <div class="report-field"><span>Route</span><strong>${delivery.source} → ${delivery.destination}</strong></div>
    <div class="report-field"><span>Scheduled Date</span><strong>${delivery.scheduledDate}</strong></div>
    <div class="report-field"><span>Package Weight</span><strong>${delivery.weightKg} kg</strong></div>
    <div class="report-field"><span>Total Charge</span><strong>₹${delivery.totalCost}</strong></div>
    <div class="report-field" style="grid-column:1/-1;"><span>Destination Address</span><strong>${delivery.address}</strong></div>
    <div class="report-field" style="grid-column:1/-1;"><span>Audit Trail</span><strong>${delivery.history.join(" → ")}</strong></div>
  `;

  logOutputNotice(
    `Output 2: Delivery Status Report (${delivery.trackingId})`,
    `Status: ${delivery.status} | Courier: ${delivery.courierName} | Scheduled: ${delivery.scheduledDate}`
  );
}

function advanceShipmentStatus(newStatus) {
  const delivery = state.deliveries.find(d => d.trackingId === selectedTrackingId);
  if (!delivery) return;
  delivery.status = newStatus;
  delivery.history.push(`Status updated to ${newStatus}`);
  saveState();
  showToast(`Shipment ${delivery.trackingId} status updated to ${newStatus.replaceAll("_", " ")}.`, "success");
  loadDeliveryForManagement(delivery.trackingId);
  refreshAllViews();
}

function completeAndArchiveShipment(onTime) {
  const idx = state.deliveries.findIndex(d => d.trackingId === selectedTrackingId);
  if (idx === -1) return;
  const delivery = state.deliveries[idx];

  const courier = state.couriers.find(c => c.id === delivery.courierId);
  if (courier) {
    courier.activeLoad = Math.max(0, courier.activeLoad - 1);
    const delta = onTime ? 150 : -200;
    courier.rewardBalance += delta;
    state.ledger.unshift({
      noticeId: `NTC-${state.nextNoticeNum++}`,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      courierId: courier.id,
      courierName: courier.name,
      deliveryId: delivery.trackingId,
      type: onTime ? "REWARD" : "PENALTY",
      amount: delta,
      remarks: onTime
        ? `Auto-reward: ${delivery.trackingId} delivered within SLA`
        : `Auto-penalty: ${delivery.trackingId} breached delivery SLA`
    });
  }

  const outcome = onTime ? "DELIVERED_ON_TIME" : "DELIVERED_DELAYED";
  const today = new Date().toISOString().split("T")[0];

  state.archive.unshift({
    trackingId: delivery.trackingId,
    orderRef: delivery.orderRef,
    customerName: delivery.customerName,
    source: delivery.source,
    destination: delivery.destination,
    weightKg: delivery.weightKg,
    courierId: delivery.courierId,
    courierName: delivery.courierName,
    finalCost: delivery.totalCost,
    closedAt: today,
    outcome
  });

  state.deliveries.splice(idx, 1);
  saveState();

  document.getElementById("manageWorkspace").style.display = "none";
  const msg = `Shipment ${delivery.trackingId} archived (${outcome}). Courier ${delivery.courierName} ${onTime ? "awarded +₹150" : "penalized -₹200"}.`;
  showToast(msg, onTime ? "success" : "warning");
  logOutputNotice(`Output 5 & Archive: ${delivery.trackingId} Completed`, msg);
  refreshAllViews();
}

document.getElementById("rescheduleForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const delivery = state.deliveries.find(d => d.trackingId === selectedTrackingId);
  if (!delivery) return;

  const newDate = document.getElementById("newDeliveryDate").value;
  const reason = document.getElementById("rescheduleReason").value.trim();
  const oldDate = delivery.scheduledDate;

  delivery.scheduledDate = newDate;
  delivery.status = "RESCHEDULED";
  delivery.history.push(`Rescheduled from ${oldDate} to ${newDate} (${reason})`);
  saveState();

  const msg = `Updated Record [${delivery.trackingId}]: Rescheduled from ${oldDate} to ${newDate}. Reason: ${reason}.`;
  showToast(msg, "success");
  logOutputNotice(`Output 4: Rescheduled Record (${delivery.trackingId})`, msg);
  e.target.reset();
  loadDeliveryForManagement(delivery.trackingId);
  refreshAllViews();
});

document.getElementById("cancelForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const idx = state.deliveries.findIndex(d => d.trackingId === selectedTrackingId);
  if (idx === -1) return;

  const delivery = state.deliveries[idx];
  const reason = document.getElementById("cancelReason").value.trim();

  const courier = state.couriers.find(c => c.id === delivery.courierId);
  if (courier) courier.activeLoad = Math.max(0, courier.activeLoad - 1);

  state.archive.unshift({
    trackingId: delivery.trackingId,
    orderRef: delivery.orderRef,
    customerName: delivery.customerName,
    source: delivery.source,
    destination: delivery.destination,
    weightKg: delivery.weightKg,
    courierId: delivery.courierId,
    courierName: delivery.courierName,
    finalCost: 0,
    closedAt: new Date().toISOString().split("T")[0],
    outcome: "CANCELLED"
  });

  state.deliveries.splice(idx, 1);
  saveState();

  document.getElementById("manageWorkspace").style.display = "none";
  const msg = `Cancellation Confirmation [${delivery.trackingId}]: Booking cancelled (${reason}). Courier ${delivery.courierName} capacity released & record archived.`;
  showToast(msg, "danger");
  logOutputNotice(`Output 3: Cancellation Confirmation (${delivery.trackingId})`, msg);
  e.target.reset();
  refreshAllViews();
});

// Event Handlers: Couriers & Rewards/Penalties
function toggleCourierAvailability(courierId) {
  const courier = state.couriers.find(c => c.id === courierId);
  if (!courier) return;
  courier.available = !courier.available;
  saveState();
  showToast(`${courier.name} marked as ${courier.available ? "Available" : "Offline"}.`, "info");
  refreshAllViews();
}

document.getElementById("rewardPenaltyForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const courierId = document.getElementById("rpCourierSelect").value;
  const deliveryId = document.getElementById("rpDeliveryId").value.trim().toUpperCase();
  const eventType = document.getElementById("rpEventType").value;
  const remarks = document.getElementById("rpRemarks").value.trim();

  const courier = state.couriers.find(c => c.id === courierId);
  if (!courier) return;

  const eventMap = {
    ON_TIME_BONUS: { type: "REWARD", amount: 150 },
    HIGH_RATING_BONUS: { type: "REWARD", amount: 100 },
    DELAY_PENALTY: { type: "PENALTY", amount: -200 },
    DAMAGE_PENALTY: { type: "PENALTY", amount: -350 }
  };

  const { type, amount } = eventMap[eventType];
  courier.rewardBalance += amount;

  const noticeId = `NTC-${state.nextNoticeNum++}`;
  state.ledger.unshift({
    noticeId,
    timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
    courierId: courier.id,
    courierName: courier.name,
    deliveryId: deliveryId || "GENERAL",
    type,
    amount,
    remarks
  });

  saveState();
  const msg = `Notice [${noticeId}]: ${type} of ${amount >= 0 ? "+" : ""}₹${amount} issued to ${courier.name}. New balance: ₹${courier.rewardBalance}.`;
  showToast(msg, type === "REWARD" ? "success" : "warning");
  logOutputNotice(`Output 5: ${type} Notice (${noticeId})`, msg);
  e.target.reset();
  refreshAllViews();
});

// Archive Filter & CSV Export
document.getElementById("archiveCourierFilter").addEventListener("change", renderArchive);

document.getElementById("exportArchiveBtn").addEventListener("click", () => {
  const rows = [
    ["Tracking ID", "Order Ref", "Customer", "Courier ID", "Courier Name", "Source", "Destination", "Weight (kg)", "Final Cost (INR)", "Closed Date", "Outcome"],
    ...state.archive.map(a => [a.trackingId, a.orderRef, a.customerName, a.courierId, a.courierName, a.source, a.destination, a.weightKg, a.finalCost, a.closedAt, a.outcome])
  ];
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "CS311_P03_Delivery_Archive.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
});

// Reset & Clear
document.getElementById("clearNoticesBtn").addEventListener("click", () => {
  state.notices = [];
  saveState();
  renderNotices();
});

document.getElementById("resetDemoBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  saveState();
  document.getElementById("manageWorkspace").style.display = "none";
  showToast("Demo database reset to initial state.", "info");
  refreshAllViews();
});

// Initialize on load
refreshAllViews();
