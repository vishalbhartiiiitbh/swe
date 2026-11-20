# P01: Railway Commodity Reservation System (IRCTC FreightConnect)
**Course:** CS311 Software Engineering Lab — IIIT Bhagalpur  
**Project Code:** P01  

## How to Run Offline on Any PC
1. Extract this ZIP archive anywhere on your computer.
2. Double-click **`index.html`** to open it directly in any web browser (Chrome, Edge, Firefox, Brave).
3. No internet connection, Node.js, Python server, or external libraries are required. All data persists locally via `localStorage`.

## Features Implemented (Aligned with Project Manual)
- **Check Slot Availability:** Filter rail corridors by Origin, Destination, Commodity Type, Service Tier (`Express` vs. `Normal`), and Dispatch Date with real-time remaining tonnage calculation.
- **Book Transportation Slot:** Reserve metric tonnage (MT) on a corridor, enforce capacity and date constraints, and issue an official printable **FNR Waybill Confirmation**.
- **Cancel Existing Booking:** Revoke any confirmed reservation, restore exact wagon capacity back to that route/date slot, and issue an official **Cancellation Confirmation**.
- **Network & Schedule Management (Admin):** Add new freight corridors, set Express/Normal tariffs, and reset demo data anytime during your lab evaluation.
- **SE Design Artifacts Tab:** Built-in documentation covering **5(a) Actors**, **5(b) Use Cases**, **5(c) Relational Data Model**, and **5(d) Enforced System Constraints** for direct presentation to your course instructor.
