// Default Seed Data for Indian Railways Freight Corridors
const DEFAULT_ROUTES = [
    {
        id: "RT-101",
        code: "EDFC-01",
        name: "Eastern Dedicated Coal & Mineral Express",
        origin: "Dhanbad (DHN)",
        destination: "Dadri Hub (DER)",
        cargoType: "Coal & Minerals",
        serviceTier: "Express",
        schedule: "Daily 05:30 (18h 15m)",
        costPerMT: 1850,
        maxCapacity: 2400
    },
    {
        id: "RT-102",
        code: "WDFC-04",
        name: "Western Container & FMCG Superfast",
        origin: "JNPT Mumbai (JNPT)",
        destination: "Tughlakabad (TKD)",
        cargoType: "Containers & FMCG",
        serviceTier: "Express",
        schedule: "Daily 21:00 (22h 00m)",
        costPerMT: 2400,
        maxCapacity: 1800
    },
    {
        id: "RT-103",
        code: "AGRI-208",
        name: "Gangetic Grain & Harvest Goods",
        origin: "Bhagalpur (BGP)",
        destination: "Howrah Freight (HWH)",
        cargoType: "Food Grains & Agri",
        serviceTier: "Normal",
        schedule: "Daily 14:15 (11h 40m)",
        costPerMT: 980,
        maxCapacity: 1500
    },
    {
        id: "RT-104",
        code: "STL-312",
        name: "Chotanagpur Steel & Heavy Alloy Line",
        origin: "Jamshedpur (TATA)",
        destination: "Chennai Harbour (MAS)",
        cargoType: "Steel & Cement",
        serviceTier: "Express",
        schedule: "Mon/Wed/Fri 08:00 (28h 30m)",
        costPerMT: 2150,
        maxCapacity: 2000
    },
    {
        id: "RT-105",
        code: "PET-405",
        name: "Barauni Refinery Bulk Tanker Link",
        origin: "Barauni (BJU)",
        destination: "Lucknow Yard (LKO)",
        cargoType: "Petroleum & Chemicals",
        serviceTier: "Normal",
        schedule: "Daily 19:45 (15h 10m)",
        costPerMT: 1420,
        maxCapacity: 1200
    },
    {
        id: "RT-106",
        code: "CEM-519",
        name: "Central Cement & Clinker Freight",
        origin: "Satna (STA)",
        destination: "Patna Junction (PNBE)",
        cargoType: "Steel & Cement",
        serviceTier: "Normal",
        schedule: "Daily 11:20 (13h 50m)",
        costPerMT: 1120,
        maxCapacity: 1600
    }
];

// Utility: Get YYYY-MM-DD for today + offsetDays
function getOffsetDate(offsetDays = 1) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0];
}

// Application State persisted in localStorage
let routes = [];
let bookings = [];

function initStorage() {
    const savedRoutes = localStorage.getItem("irctc_freight_routes_v1");
    const savedBookings = localStorage.getItem("irctc_freight_bookings_v1");

    if (savedRoutes) {
        routes = JSON.parse(savedRoutes);
    } else {
        routes = [...DEFAULT_ROUTES];
        saveRoutes();
    }

    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    } else {
        // Seed 2 initial realistic bookings so instructor sees live ledger immediately
        const tomorrow = getOffsetDate(1);
        bookings = [
            {
                fnr: "FNR-849201",
                routeId: "RT-103",
                companyName: "Bihar Agro Exports Pvt Ltd",
                gstin: "10AABCB4512K1Z9",
                dispatchDate: tomorrow,
                tonnage: 350,
                totalCost: 350 * 980,
                status: "CONFIRMED",
                bookedAt: new Date().toLocaleString()
            },
            {
                fnr: "FNR-849202",
                routeId: "RT-101",
                companyName: "NTPC Kahalgaon Fuel Supply",
                gstin: "10AAACN0255D1Z2",
                dispatchDate: tomorrow,
                tonnage: 600,
                totalCost: 600 * 1850,
                status: "CONFIRMED",
                bookedAt: new Date().toLocaleString()
            }
        ];
        saveBookings();
    }
}

function saveRoutes() {
    localStorage.setItem("irctc_freight_routes_v1", JSON.stringify(routes));
}

function saveBookings() {
    localStorage.setItem("irctc_freight_bookings_v1", JSON.stringify(bookings));
}

// Core Domain Logic: Compute remaining capacity for a route on a specific date
function getRemainingCapacity(routeId, dateStr) {
    const route = routes.find(r => r.id === routeId);
    if (!route) return 0;

    const bookedTonnage = bookings
        .filter(b => b.routeId === routeId && b.dispatchDate === dateStr && b.status === "CONFIRMED")
        .reduce((sum, b) => sum + Number(b.tonnage), 0);

    return Math.max(0, route.maxCapacity - bookedTonnage);
}

// Populate Origin & Destination dropdowns dynamically
function populateLocationFilters() {
    const originSel = document.getElementById("origin-select");
    const destSel = document.getElementById("dest-select");
    const currentOrigin = originSel.value;
    const currentDest = destSel.value;

    const origins = [...new Set(routes.map(r => r.origin))].sort();
    const dests = [...new Set(routes.map(r => r.destination))].sort();

    originSel.innerHTML = `<option value="ALL">All Origins (${origins.length})</option>` +
        origins.map(o => `<option value="${o}">${o}</option>`).join("");

    destSel.innerHTML = `<option value="ALL">All Destinations (${dests.length})</option>` +
        dests.map(d => `<option value="${d}">${d}</option>`).join("");

    if (origins.includes(currentOrigin)) originSel.value = currentOrigin;
    if (dests.includes(currentDest)) destSel.value = currentDest;
}

// Render Route Availability Cards
function renderRoutes() {
    const originFilter = document.getElementById("origin-select").value;
    const destFilter = document.getElementById("dest-select").value;
    const cargoFilter = document.getElementById("cargo-select").value;
    const serviceFilter = document.getElementById("service-select").value;
    const selectedDate = document.getElementById("dispatch-date").value || getOffsetDate(1);

    const filtered = routes.filter(r => {
        if (originFilter !== "ALL" && r.origin !== originFilter) return false;
        if (destFilter !== "ALL" && r.destination !== destFilter) return false;
        if (cargoFilter !== "ALL" && r.cargoType !== cargoFilter) return false;
        if (serviceFilter !== "ALL" && r.serviceTier !== serviceFilter) return false;
        return true;
    });

    document.getElementById("results-title").textContent =
        `Available Freight Corridors for ${selectedDate} (${filtered.length} found)`;

    const container = document.getElementById("routes-list");
    if (filtered.length === 0) {
        container.innerHTML = `<div class="card empty-state" style="grid-column: 1 / -1;">
            <p>No freight routes match your selected criteria. Try resetting filters to "All".</p>
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(route => {
        const remaining = getRemainingCapacity(route.id, selectedDate);
        const pct = Math.round((remaining / route.maxCapacity) * 100);
        let fillClass = "";
        if (remaining === 0) fillClass = "full";
        else if (pct < 30) fillClass = "low";

        return `
        <div class="route-card">
            <div>
                <div class="route-top">
                    <span class="train-code">${route.code}</span>
                    <span class="tier-pill tier-${route.serviceTier}">${route.serviceTier} Service</span>
                </div>
                <div class="route-title">${route.name}</div>
                <div class="route-terminals">
                    <span>${route.origin}</span>
                    <span>&rarr;</span>
                    <span>${route.destination}</span>
                </div>
                <div class="route-meta">
                    <div><strong>Commodity:</strong><br>${route.cargoType}</div>
                    <div><strong>Schedule:</strong><br>${route.schedule}</div>
                </div>
                <div class="capacity-section">
                    <div class="cap-labels">
                        <span>Remaining Capacity (${selectedDate})</span>
                        <span>${remaining.toLocaleString()} / ${route.maxCapacity.toLocaleString()} MT</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${fillClass}" style="width: ${pct}%"></div>
                    </div>
                </div>
            </div>
            <div class="route-footer">
                <div class="price-tag">&#8377;${route.costPerMT.toLocaleString()} <span>/ MT</span></div>
                <button class="btn btn-primary btn-sm"
                    ${remaining === 0 ? "disabled style='opacity:0.5;cursor:not-allowed;'" : ""}
                    onclick="openBookingModal('${route.id}')">
                    ${remaining === 0 ? "Slot Full" : "Book Slot"}
                </button>
            </div>
        </div>`;
    }).join("");
}

// Render Bookings Ledger Table
function renderBookings() {
    const query = (document.getElementById("fnr-search").value || "").toLowerCase().trim();
    const tbody = document.getElementById("bookings-tbody");
    const emptyState = document.getElementById("empty-bookings");

    const filtered = bookings.filter(b => {
        if (!query) return true;
        return b.fnr.toLowerCase().includes(query) || b.companyName.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    tbody.innerHTML = filtered.slice().reverse().map(b => {
        const route = routes.find(r => r.id === b.routeId) || {
            code: "N/A", origin: "Unknown", destination: "Unknown", cargoType: "-", serviceTier: "Normal"
        };
        const isConfirmed = b.status === "CONFIRMED";

        return `
        <tr>
            <td><strong>${b.fnr}</strong></td>
            <td>${b.companyName}<br><small class="hint-text">GST: ${b.gstin}</small></td>
            <td><strong>${route.code}</strong><br><small>${route.origin} &rarr; ${route.destination}</small></td>
            <td>${route.cargoType}<br><span class="tier-pill tier-${route.serviceTier}">${route.serviceTier}</span></td>
            <td>${b.dispatchDate}</td>
            <td><strong>${Number(b.tonnage).toLocaleString()} MT</strong></td>
            <td>&#8377;${Number(b.totalCost).toLocaleString()}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
            <td>
                <div style="display:flex; gap:0.4rem;">
                    <button class="btn btn-outline btn-sm" onclick="viewReceipt('${b.fnr}')">Receipt</button>
                    ${isConfirmed
                        ? `<button class="btn btn-danger" onclick="cancelBooking('${b.fnr}')">Cancel</button>`
                        : `<span class="hint-text">Cancelled</span>`}
                </div>
            </td>
        </tr>`;
    }).join("");
}

// Render Admin Compact List & Top KPI Stats
function updateDashboardStats() {
    const activeBookings = bookings.filter(b => b.status === "CONFIRMED");
    const totalTonnage = activeBookings.reduce((sum, b) => sum + Number(b.tonnage), 0);
    const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.totalCost), 0);

    document.getElementById("stat-routes").textContent = routes.length;
    document.getElementById("stat-bookings").textContent = activeBookings.length;
    document.getElementById("booking-badge").textContent = activeBookings.length;
    document.getElementById("stat-tonnage").textContent = `${totalTonnage.toLocaleString()} MT`;
    document.getElementById("stat-revenue").textContent = `₹${totalRevenue.toLocaleString()}`;

    const adminList = document.getElementById("admin-route-list");
    adminList.innerHTML = routes.map(r => `
        <li>
            <span><strong>${r.code}</strong>: ${r.origin} &rarr; ${r.destination} (${r.serviceTier})</span>
            <span>&#8377;${r.costPerMT}/MT &bull; ${r.maxCapacity} MT</span>
        </li>
    `).join("");
}

// Booking Modal Flow
function openBookingModal(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const selectedDate = document.getElementById("dispatch-date").value || getOffsetDate(1);
    const remaining = getRemainingCapacity(routeId, selectedDate);

    document.getElementById("modal-route-id").value = route.id;
    document.getElementById("modal-date").value = selectedDate;
    document.getElementById("modal-date").min = getOffsetDate(0);
    document.getElementById("modal-tonnage").value = Math.min(100, remaining);
    document.getElementById("modal-tonnage").max = remaining;
    document.getElementById("booking-error").classList.add("hidden");

    document.getElementById("modal-route-summary").innerHTML = `
        <strong>${route.code} &mdash; ${route.name}</strong><br>
        Corridor: ${route.origin} &rarr; ${route.destination} &bull; Tier: <strong>${route.serviceTier}</strong><br>
        Commodity Class: ${route.cargoType} &bull; Schedule: ${route.schedule}
    `;

    updateModalFareCalculation();
    document.getElementById("booking-modal").classList.remove("hidden");
}

function closeBookingModal() {
    document.getElementById("booking-modal").classList.add("hidden");
}

function updateModalFareCalculation() {
    const routeId = document.getElementById("modal-route-id").value;
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const dateVal = document.getElementById("modal-date").value;
    const remaining = getRemainingCapacity(routeId, dateVal);
    const qty = Number(document.getElementById("modal-tonnage").value) || 0;

    document.getElementById("modal-cap-hint").textContent =
        `Available on ${dateVal}: ${remaining.toLocaleString()} MT`;
    document.getElementById("fare-rate").textContent = `₹${route.costPerMT.toLocaleString()} / MT`;
    document.getElementById("fare-tier").textContent =
        route.serviceTier === "Express" ? "Express Priority Tariff Applied" : "Standard Goods Tariff";
    document.getElementById("fare-total").textContent = `₹${(qty * route.costPerMT).toLocaleString()}`;
}

// Confirm Booking Submission
document.getElementById("confirm-booking-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const errorBox = document.getElementById("booking-error");
    errorBox.classList.add("hidden");

    const routeId = document.getElementById("modal-route-id").value;
    const route = routes.find(r => r.id === routeId);
    const companyName = document.getElementById("consignor-name").value.trim();
    const gstin = document.getElementById("consignor-gst").value.trim().toUpperCase();
    const dispatchDate = document.getElementById("modal-date").value;
    const tonnage = Number(document.getElementById("modal-tonnage").value);

    // Enforce System Constraints (Section 5d)
    const today = getOffsetDate(0);
    if (dispatchDate < today) {
        errorBox.textContent = "Constraint Violation (C-02): Dispatch date cannot be in the past.";
        errorBox.classList.remove("hidden");
        return;
    }

    const remaining = getRemainingCapacity(routeId, dispatchDate);
    if (tonnage <= 0 || tonnage > remaining) {
        errorBox.textContent = `Constraint Violation (C-01): Requested ${tonnage} MT exceeds remaining capacity (${remaining} MT) for ${dispatchDate}.`;
        errorBox.classList.remove("hidden");
        return;
    }

    const fnr = "FNR-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
        fnr,
        routeId,
        companyName,
        gstin,
        dispatchDate,
        tonnage,
        totalCost: tonnage * route.costPerMT,
        status: "CONFIRMED",
        bookedAt: new Date().toLocaleString()
    };

    bookings.push(newBooking);
    saveBookings();

    // Sync search date to booked date so user sees updated capacity bar immediately
    document.getElementById("dispatch-date").value = dispatchDate;

    closeBookingModal();
    refreshAllViews();
    viewReceipt(fnr);
});

// Cancel Existing Booking
function cancelBooking(fnr) {
    const booking = bookings.find(b => b.fnr === fnr);
    if (!booking || booking.status !== "CONFIRMED") return;

    booking.status = "CANCELLED";
    booking.cancelledAt = new Date().toLocaleString();
    saveBookings();
    refreshAllViews();
    viewReceipt(fnr);
}

// Show Official Booking / Cancellation Receipt
function viewReceipt(fnr) {
    const b = bookings.find(item => item.fnr === fnr);
    if (!b) return;
    const route = routes.find(r => r.id === b.routeId) || {
        code: "N/A", name: "Freight Service", origin: "-", destination: "-", serviceTier: "Normal", cargoType: "-"
    };

    const isCancelled = b.status === "CANCELLED";
    document.getElementById("receipt-title").textContent =
        isCancelled ? "Official Cancellation Confirmation" : "Official Freight Booking Confirmation";

    document.getElementById("receipt-body").innerHTML = `
        <h4>INDIAN RAILWAYS &bull; FREIGHT WAYBILL (${b.status})</h4>
        <div class="receipt-meta">
            FNR Number: <strong>${b.fnr}</strong> &bull; Generated: ${isCancelled ? b.cancelledAt : b.bookedAt}
        </div>
        <div class="receipt-grid">
            <div><strong>Consignor:</strong><br>${b.companyName}</div>
            <div><strong>GSTIN:</strong><br>${b.gstin}</div>
            <div><strong>Train / Corridor:</strong><br>${route.code} (${route.serviceTier})</div>
            <div><strong>Commodity:</strong><br>${route.cargoType}</div>
            <div><strong>Origin Terminal:</strong><br>${route.origin}</div>
            <div><strong>Destination Terminal:</strong><br>${route.destination}</div>
            <div><strong>Dispatch Date:</strong><br>${b.dispatchDate}</div>
            <div><strong>Reserved Tonnage:</strong><br>${Number(b.tonnage).toLocaleString()} Metric Tons</div>
        </div>
        <div style="margin-top:0.85rem; padding-top:0.65rem; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between;">
            <strong>${isCancelled ? "Refundable Freight Amount:" : "Total Paid Tariff:"}</strong>
            <strong>&#8377;${Number(b.totalCost).toLocaleString()}</strong>
        </div>
        <p style="margin-top:0.65rem; font-size:0.76rem; color:#475569;">
            ${isCancelled
                ? "Status Note: Wagon capacity of " + b.tonnage + " MT has been released back to the corridor inventory."
                : "Status Note: Present this FNR Waybill at the origin freight terminal 2 hours prior to departure."}
        </p>
    `;

    document.getElementById("receipt-modal").classList.remove("hidden");
}

function closeReceiptModal() {
    document.getElementById("receipt-modal").classList.add("hidden");
}

// Add New Route (Admin)
document.getElementById("add-route-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const newRoute = {
        id: "RT-" + Math.floor(200 + Math.random() * 800),
        code: document.getElementById("new-code").value.trim().toUpperCase(),
        name: document.getElementById("new-name").value.trim(),
        origin: document.getElementById("new-origin").value.trim(),
        destination: document.getElementById("new-dest").value.trim(),
        cargoType: document.getElementById("new-cargo").value,
        serviceTier: document.getElementById("new-service").value,
        schedule: document.getElementById("new-schedule").value.trim(),
        maxCapacity: Number(document.getElementById("new-capacity").value),
        costPerMT: Number(document.getElementById("new-cost").value)
    };

    routes.push(newRoute);
    saveRoutes();
    e.target.reset();
    refreshAllViews();
    alert(`Freight Corridor ${newRoute.code} registered successfully!`);
});

// Reset Demo Data
document.getElementById("reset-demo-btn").addEventListener("click", function () {
    localStorage.removeItem("irctc_freight_routes_v1");
    localStorage.removeItem("irctc_freight_bookings_v1");
    initStorage();
    refreshAllViews();
    alert("Demo database restored to initial default state.");
});

// Tab Navigation
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

// Event Listeners for Live Filtering
document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    renderRoutes();
});
document.getElementById("dispatch-date").addEventListener("change", renderRoutes);
document.getElementById("fnr-search").addEventListener("input", renderBookings);
document.getElementById("modal-tonnage").addEventListener("input", updateModalFareCalculation);
document.getElementById("modal-date").addEventListener("change", updateModalFareCalculation);

function refreshAllViews() {
    populateLocationFilters();
    renderRoutes();
    renderBookings();
    updateDashboardStats();
}

// Initialize App on Load
window.addEventListener("DOMContentLoaded", () => {
    const defaultDate = getOffsetDate(1);
    const dateInput = document.getElementById("dispatch-date");
    dateInput.value = defaultDate;
    dateInput.min = getOffsetDate(0);

    initStorage();
    refreshAllViews();
});
