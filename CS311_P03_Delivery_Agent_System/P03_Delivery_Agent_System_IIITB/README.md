# CS311 Software Engineering Lab — IIIT Bhagalpur
## Project P03: SwiftDispatch — Delivery Agent System

### How to Run Offline on Any PC
1. Extract this ZIP folder anywhere on your PC.
2. Double-click **`index.html`** to open it directly in any web browser (Chrome, Edge, Firefox, Brave) — **no internet connection, server, or installation required**.
3. All bookings, rescheduling updates, cancellations, courier rewards/penalties, and archived records persist automatically in browser `localStorage` (and can be reset anytime via **Reset Demo Data** in the sidebar).

---

### Complete Coverage of Project P03 Requirements

| Requirement Category | Implemented Features in SwiftDispatch |
| :--- | :--- |
| **Inputs** | Shipping source/destination localities, customer/order details, package weight, courier locality coverage, base + per-kg pricing, SLA days, capacity, and availability. |
| **1. Book a Delivery** | Portal booking form with live courier matching preview and automated best-courier assignment (Balanced, Cheapest, or Fastest SLA) + **Booking Confirmation Receipt**. |
| **2. Check Delivery Status** | Lookup by Tracking ID (`DEL-1001`, etc.) generating a structured **Delivery Status Report** with full audit trail. |
| **3. Cancel a Booking** | Cancels active shipments, releases courier capacity, archives the cancelled record, and issues a **Cancellation Confirmation**. |
| **4. Reschedule a Delivery** | Updates delivery date with reason logging, records history, and produces an **Updated Record after Rescheduling**. |
| **5. Rewards & Penalties** | Automatic SLA bonus/penalty on delivery completion + manual inspector adjustments generating **Notice of Reward/Penalty** entries. |
| **6. Archive & Courier Query** | Automatic archiving of all completed/cancelled deliveries with **Filter by Courier** summary metrics and one-click **CSV Export**. |
| **Section 5 SE Artifacts** | Dedicated tab documenting **(a) System Actors**, **(b) Use Cases per Actor**, **(c) Relational Data Model**, and **(d) Enforced Constraints**. |
