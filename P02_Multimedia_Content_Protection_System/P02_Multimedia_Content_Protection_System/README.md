# P02: Multimedia Content Protection System (AegisVault)
**Course:** CS311 Software Engineering Lab — IIIT Bhagalpur  
**Domain:** Offline Desktop / Web Application (Zero external dependencies, runs 100% offline)

---

## How to Run Directly on Your PC (Offline)
1. Extract this ZIP folder anywhere on your PC.
2. Double-click **`index.html`** (or double-click **`Launch_AegisVault.bat`** on Windows) to open it directly in Chrome, Edge, or Brave.
3. No internet connection, server installation, or `npm install` is required.

---

## Quick Demo Guide for Course Instructor Presentation
1. **Default Pre-loaded User Profile (Tab 2 - User Profile):**
   - **Owner:** Vishal Bharti (`2301CS14`)
   - **Security Answer:** `dijkstra`
2. **Instant Sample Multimedia Files:**
   - Click **"✨ Load Demo Files"** in the top-right header.
   - This creates two AES-256-GCM encrypted files (a confidential text document and a synthesized `.wav` audio file) with **PIN: `1234`** and **Security Answer: `dijkstra`**.
3. **Demonstrate All 5 Functional Requirements:**
   - **Encrypt a Document:** Drag & drop any `.txt`, `.mp3`, `.mp4`, `.pdf`, or image file, set a PIN, and click **Encrypt & Store in Vault** (also exports a portable `.aegis` encrypted container).
   - **Open a Protected Document:** Click **👁️ Open** → enter valid PIN + Security Answer → previews text/audio/video/image securely in-app.
   - **Decrypt a Document:** Click **⬇️ Decrypt** → saves the restored plaintext file back to your PC.
   - **Copy a Protected Document:** Click **📋 Copy** → creates an authenticated duplicate in the vault and exports a `.aegis` backup.
   - **Delete a Protected Document:** Click **🗑️ Delete** → authenticates and permanently purges the record.
4. **Demonstrate 3-Attempt Intrusion Lockout:**
   - Click **Open**, **Copy**, or **Delete** on any file and enter a **wrong PIN 3 times**.
   - On the 3rd failure, the document account immediately locks (`🔒 LOCKED (3/3 Fails)`), preventing any further access until the Document Owner verifies their Roll ID & Security Answer.
5. **Section 5 Software Engineering Blueprint (Tab 3):**
   - Contains complete **Actors**, **Use-Case Matrix**, **Data Model Entities**, and **Enforced System Rules** ready to show your instructor.
