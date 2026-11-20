/**
 * AegisVault (Project P02) - Multimedia Content Protection System
 * CS311 Software Engineering Lab, IIIT Bhagalpur
 *
 * 100% Offline Cryptographic Engine using Browser Web Crypto API:
 * - Key Derivation: PBKDF2-SHA256 (100,000 iterations) binding PIN + User Profile ID + Security Answer
 * - Symmetric Encryption: AES-256-GCM with 96-bit random IV and 128-bit random Salt
 * - Intrusion Policy: Account/Document locks after 3 consecutive failed attempts on Open, Copy, or Delete
 */

const STORAGE_KEYS = {
  PROFILE: "aegis_p02_profile",
  DOCS: "aegis_p02_documents",
  LOGS: "aegis_p02_audit_logs"
};

const MAX_FAILED_ATTEMPTS = 3;

// Application State
let userProfile = null;
let documents = [];
let auditLogs = [];

let activeModalContext = null; // { docId, operation: 'OPEN' | 'COPY' | 'DELETE' | 'DECRYPT' }
let activeUnlockDocId = null;
let activeViewerBlobUrl = null;
let activeViewerFileName = null;

// ============================================================================
// 1. INITIALIZATION & STATE PERSISTENCE
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  bindNavigation();
  bindProfileForm();
  bindEncryptForm();
  bindModals();
  bindHeaderButtons();
  renderAll();
});

function loadState() {
  try {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    const savedDocs = localStorage.getItem(STORAGE_KEYS.DOCS);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    userProfile = savedProfile ? JSON.parse(savedProfile) : {
      fullName: "Vishal Bharti",
      userId: "2301CS14",
      email: "vishal@iiitbh.ac.in",
      department: "CSE, IIIT Bhagalpur",
      securityQuestion: "What is your favorite algorithm?",
      securityAnswer: "dijkstra"
    };

    if (userProfile.fullName !== "Vishal Bharti" && userProfile.userId === "2301CS14") {
      userProfile.fullName = "Vishal Bharti";
      userProfile.email = "vishal@iiitbh.ac.in";
      saveState();
    }

    documents = savedDocs ? JSON.parse(savedDocs) : [];
    auditLogs = savedLogs ? JSON.parse(savedLogs) : [];

    // Persist default profile if first run so user can test immediately
    if (!savedProfile) {
      saveState();
      logAudit("SYSTEM_INIT", "System", "SUCCESS", "Initialized default Document Owner profile");
    }
  } catch (err) {
    console.error("State load error:", err);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(documents));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
}

// ============================================================================
// 2. REAL AES-256-GCM CRYPTOGRAPHY ENGINE (WEB CRYPTO API - 100% OFFLINE)
// ============================================================================
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveAesKey(pin, securityAnswer, ownerId, saltBytes) {
  const enc = new TextEncoder();
  // Bind PIN + Profile Owner ID + Normalized Security Answer
  const compositeSecret = `${pin.trim()}::${ownerId.trim().toLowerCase()}::${securityAnswer.trim().toLowerCase()}`;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(compositeSecret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptBuffer(plainBuffer, pin, securityAnswer, ownerId) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(pin, securityAnswer, ownerId, salt);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plainBuffer
  );

  return {
    ciphertextB64: arrayBufferToBase64(cipherBuffer),
    ivB64: arrayBufferToBase64(iv.buffer),
    saltB64: arrayBufferToBase64(salt.buffer)
  };
}

async function decryptBuffer(doc, pin, securityAnswer) {
  const salt = new Uint8Array(base64ToArrayBuffer(doc.saltB64));
  const iv = new Uint8Array(base64ToArrayBuffer(doc.ivB64));
  const cipherBuffer = base64ToArrayBuffer(doc.ciphertextB64);

  const key = await deriveAesKey(pin, securityAnswer, doc.ownerId, salt);
  // Throws OperationError if PIN, Security Answer, or Ciphertext is invalid/tampered
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBuffer
  );
  return plainBuffer;
}

// ============================================================================
// 3. UI RENDERING & NAVIGATION
// ============================================================================
function bindNavigation() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
      });
    });
  });

  document.getElementById("filter-type").addEventListener("change", renderVault);
}

function showBanner(message, type = "success") {
  const banner = document.getElementById("status-banner");
  banner.textContent = message;
  banner.className = `banner ${type}`;
  clearTimeout(banner._timer);
  banner._timer = setTimeout(() => {
    banner.classList.add("hidden");
  }, 5500);
}

function renderAll() {
  renderKPIs();
  populateProfileForm();
  renderVault();
  renderAuditLogs();
}

function renderKPIs() {
  const ownerEl = document.getElementById("kpi-owner");
  const ownerMetaEl = document.getElementById("kpi-owner-meta");
  const totalEl = document.getElementById("kpi-total-files");
  const lockStatusEl = document.getElementById("kpi-lock-status");

  if (userProfile) {
    ownerEl.textContent = userProfile.fullName;
    ownerMetaEl.textContent = `${userProfile.userId} • ${userProfile.department}`;
  } else {
    ownerEl.textContent = "Not Configured";
    ownerMetaEl.textContent = "Configure profile in Tab 2";
  }

  totalEl.textContent = documents.length;
  const lockedCount = documents.filter((d) => d.isLocked).length;
  lockStatusEl.textContent = lockedCount > 0
    ? `${lockedCount} Locked Document(s)`
    : "Active (Max 3 Tries)";
}

function classifyMediaType(mimeType, fileName) {
  const lower = fileName.toLowerCase();
  if (mimeType.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/.test(lower)) return "AUDIO";
  if (mimeType.startsWith("video/") || /\.(mp4|webm|mkv|mov)$/.test(lower)) return "VIDEO";
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    /\.(txt|md|csv|json|xml|html|js|py|c|cpp|java)$/.test(lower)
  ) {
    return "TEXT";
  }
  return "OTHER";
}

function mediaIcon(mediaType) {
  switch (mediaType) {
    case "AUDIO": return "🎵";
    case "VIDEO": return "🎬";
    case "TEXT": return "📄";
    default: return "📦";
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function renderVault() {
  const grid = document.getElementById("vault-grid");
  const empty = document.getElementById("vault-empty");
  const filter = document.getElementById("filter-type").value;

  const filtered = filter === "ALL"
    ? documents
    : documents.filter((d) => d.mediaType === filter);

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  grid.innerHTML = filtered.map((doc) => {
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - doc.failedAttempts);
    const statusBadge = doc.isLocked
      ? `<span class="badge badge-danger">🔒 LOCKED (3/3 Fails)</span>`
      : `<span class="badge badge-success">🛡️ Protected</span>`;

    const actionButtons = doc.isLocked
      ? `<button class="act-btn unlock-btn" onclick="openUnlockModal('${doc.docId}')">🔓 Locked After 3 Failed Attempts — Owner Unlock</button>`
      : `
        <button class="act-btn" onclick="requestProtectedAction('${doc.docId}', 'OPEN')">👁️ Open</button>
        <button class="act-btn" onclick="requestProtectedAction('${doc.docId}', 'DECRYPT')">⬇️ Decrypt</button>
        <button class="act-btn" onclick="requestProtectedAction('${doc.docId}', 'COPY')">📋 Copy</button>
        <button class="act-btn danger" onclick="requestProtectedAction('${doc.docId}', 'DELETE')">🗑️ Delete</button>
      `;

    return `
      <div class="doc-card ${doc.isLocked ? "locked-card" : ""}">
        <div>
          <div class="doc-top">
            <div class="doc-title-wrap">
              <div class="media-icon">${mediaIcon(doc.mediaType)}</div>
              <div style="min-width:0">
                <div class="doc-name" title="${escapeHtml(doc.fileName)}">${escapeHtml(doc.fileName)}</div>
                <div class="doc-meta">${doc.mediaType} &bull; ${formatBytes(doc.originalSize)} &bull; ${doc.classification}</div>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="doc-security-bar">
            <span>Owner: <strong>${escapeHtml(doc.ownerId)}</strong></span>
            <span>Tries Left: <strong>${remaining} / ${MAX_FAILED_ATTEMPTS}</strong></span>
          </div>
        </div>

        <div class="doc-actions">
          ${actionButtons}
        </div>
      </div>
    `;
  }).join("");
}

// ============================================================================
// 4. USER PROFILE MANAGEMENT
// ============================================================================
function populateProfileForm() {
  if (!userProfile) return;
  document.getElementById("prof-name").value = userProfile.fullName || "";
  document.getElementById("prof-id").value = userProfile.userId || "";
  document.getElementById("prof-email").value = userProfile.email || "";
  document.getElementById("prof-org").value = userProfile.department || "";
  document.getElementById("prof-sec-q").value = userProfile.securityQuestion || "What is your favorite algorithm?";
  document.getElementById("prof-sec-a").value = userProfile.securityAnswer || "";
}

function bindProfileForm() {
  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    userProfile = {
      fullName: document.getElementById("prof-name").value.trim(),
      userId: document.getElementById("prof-id").value.trim(),
      email: document.getElementById("prof-email").value.trim(),
      department: document.getElementById("prof-org").value.trim(),
      securityQuestion: document.getElementById("prof-sec-q").value,
      securityAnswer: document.getElementById("prof-sec-a").value.trim()
    };
    saveState();
    logAudit("PROFILE_UPDATE", userProfile.fullName, "SUCCESS", `Updated profile for ${userProfile.userId}`);
    renderAll();
    showBanner(`✅ User Profile saved and cryptographically bound for ${userProfile.fullName} (${userProfile.userId}).`, "success");
  });
}

// ============================================================================
// 5. ENCRYPT DOCUMENT (FUNCTIONAL REQUIREMENT 1)
// ============================================================================
function bindEncryptForm() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileLabel = document.getElementById("file-label");

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      fileLabel.textContent = `Selected: ${e.dataTransfer.files[0].name}`;
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      fileLabel.textContent = `Selected: ${fileInput.files[0].name}`;
    }
  });

  document.getElementById("encrypt-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!userProfile) {
      showBanner("⚠️ Please configure your User Profile first.", "warning");
      return;
    }

    const file = fileInput.files[0];
    if (!file) {
      showBanner("⚠️ Please choose a file to protect.", "warning");
      return;
    }

    const pin = document.getElementById("encrypt-pin").value;
    const secAns = document.getElementById("encrypt-sec-ans").value;
    const classification = document.getElementById("doc-classification").value;

    if (secAns.trim().toLowerCase() !== userProfile.securityAnswer.trim().toLowerCase()) {
      showBanner("❌ Security Answer does not match your active User Profile.", "error");
      logAudit("ENCRYPT", file.name, "FAILURE", "Profile security answer mismatch during encryption");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const encrypted = await encryptBuffer(arrayBuffer, pin, secAns, userProfile.userId);

      const newDoc = {
        docId: "DOC-" + Date.now().toString(36).toUpperCase(),
        ownerId: userProfile.userId,
        ownerName: userProfile.fullName,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        mediaType: classifyMediaType(file.type || "", file.name),
        originalSize: file.size,
        classification,
        ciphertextB64: encrypted.ciphertextB64,
        ivB64: encrypted.ivB64,
        saltB64: encrypted.saltB64,
        failedAttempts: 0,
        isLocked: false,
        createdAt: new Date().toISOString()
      };

      documents.unshift(newDoc);
      saveState();
      logAudit("ENCRYPT", file.name, "SUCCESS", `Encrypted (${formatBytes(file.size)}) with AES-256-GCM`);
      renderAll();

      // Also offer automatic .aegis container download
      downloadAegisContainer(newDoc);

      e.target.reset();
      fileLabel.textContent = "Click or drag a file here to protect";
      showBanner(`🔒 "${file.name}" encrypted & protected! Downloaded portable ${file.name}.aegis container.`, "success");
    } catch (err) {
      console.error(err);
      showBanner("❌ Encryption failed: " + err.message, "error");
    }
  });

  // External .aegis file import
  document.getElementById("import-aegis-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.ciphertextB64 || !parsed.ivB64 || !parsed.saltB64) {
        throw new Error("Invalid .aegis encrypted container format.");
      }
      parsed.docId = "IMP-" + Date.now().toString(36).toUpperCase();
      parsed.failedAttempts = 0;
      parsed.isLocked = false;
      documents.unshift(parsed);
      saveState();
      logAudit("IMPORT_AEGIS", parsed.fileName, "SUCCESS", "Imported external .aegis container into Vault");
      renderAll();
      showBanner(`📥 Imported "${parsed.fileName}" into Vault. Authenticate to Open or Decrypt.`, "success");
    } catch (err) {
      showBanner("❌ Failed to import .aegis file: " + err.message, "error");
    }
    e.target.value = "";
  });
}

function downloadAegisContainer(doc) {
  const payload = JSON.stringify({
    system: "AegisVault-P02-CS311",
    version: "1.0",
    ownerId: doc.ownerId,
    ownerName: doc.ownerName,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    mediaType: doc.mediaType,
    originalSize: doc.originalSize,
    classification: doc.classification,
    ciphertextB64: doc.ciphertextB64,
    ivB64: doc.ivB64,
    saltB64: doc.saltB64,
    createdAt: doc.createdAt
  }, null, 2);

  const blob = new Blob([payload], { type: "application/json" });
  triggerDownload(blob, `${doc.fileName}.aegis`);
}

// ============================================================================
// 6. OPEN, DECRYPT, COPY, DELETE + 3-ATTEMPT LOCKOUT ENFORCEMENT
// ============================================================================
window.requestProtectedAction = function (docId, operation) {
  const doc = documents.find((d) => d.docId === docId);
  if (!doc) return;

  if (doc.isLocked) {
    openUnlockModal(docId);
    return;
  }

  activeModalContext = { docId, operation };

  const titles = {
    OPEN: "👁️ Open Protected Document",
    DECRYPT: "⬇️ Decrypt & Export Original Document",
    COPY: "📋 Copy Protected Document",
    DELETE: "🗑️ Delete Protected Document"
  };

  const descs = {
    OPEN: `Authenticate to decrypt in-memory and preview "${doc.fileName}".`,
    DECRYPT: `Authenticate to decrypt and save original "${doc.fileName}" to your PC.`,
    COPY: `Authenticate to create an encrypted backup copy of "${doc.fileName}" and export .aegis container.`,
    DELETE: `Authenticate to permanently delete "${doc.fileName}" from the secure vault.`
  };

  document.getElementById("modal-title").textContent = titles[operation];
  document.getElementById("modal-desc").textContent = descs[operation];
  document.getElementById("modal-sec-label").textContent =
    userProfile ? `Security Answer (${userProfile.securityQuestion})` : "Profile Security Answer";

  const remaining = MAX_FAILED_ATTEMPTS - doc.failedAttempts;
  document.getElementById("attempt-indicator").textContent =
    `Attempts remaining before account lock: ${remaining} / ${MAX_FAILED_ATTEMPTS}`;

  document.getElementById("modal-pin").value = "";
  document.getElementById("modal-sec-ans").value = "";
  document.getElementById("modal-error").classList.add("hidden");
  document.getElementById("auth-modal").classList.remove("hidden");
  document.getElementById("modal-pin").focus();
};

function bindModals() {
  const closeAuth = () => {
    document.getElementById("auth-modal").classList.add("hidden");
    activeModalContext = null;
  };
  document.getElementById("modal-close").addEventListener("click", closeAuth);
  document.getElementById("modal-cancel").addEventListener("click", closeAuth);

  // Handle Operation Verification (OPEN, DECRYPT, COPY, DELETE)
  document.getElementById("modal-auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeModalContext) return;

    const { docId, operation } = activeModalContext;
    const doc = documents.find((d) => d.docId === docId);
    if (!doc) return;

    const pin = document.getElementById("modal-pin").value;
    const secAns = document.getElementById("modal-sec-ans").value;
    const errBox = document.getElementById("modal-error");

    try {
      // Cryptographic verification: AES-GCM decryption will ONLY succeed if PIN + Profile ID + Security Answer match!
      const plainBuffer = await decryptBuffer(doc, pin, secAns);

      // Reset failed attempt counter on valid authentication
      doc.failedAttempts = 0;
      saveState();
      closeAuth();

      if (operation === "OPEN") {
        logAudit("OPEN", doc.fileName, "SUCCESS", "Authenticated and opened protected multimedia viewer");
        renderAll();
        openMultimediaViewer(doc, plainBuffer);
        showBanner(`✅ Access Granted: Opened "${doc.fileName}".`, "success");
      } else if (operation === "DECRYPT") {
        const blob = new Blob([plainBuffer], { type: doc.mimeType });
        triggerDownload(blob, doc.fileName);
        logAudit("DECRYPT", doc.fileName, "SUCCESS", "Decrypted and downloaded original file");
        renderAll();
        showBanner(`✅ Decryption Success: "${doc.fileName}" saved to your PC.`, "success");
      } else if (operation === "COPY") {
        const copyDoc = {
          ...doc,
          docId: "DOC-" + Date.now().toString(36).toUpperCase(),
          fileName: `Copy_of_${doc.fileName}`,
          failedAttempts: 0,
          isLocked: false,
          createdAt: new Date().toISOString()
        };
        documents.unshift(copyDoc);
        saveState();
        downloadAegisContainer(copyDoc);
        logAudit("COPY", doc.fileName, "SUCCESS", `Created protected copy "${copyDoc.fileName}"`);
        renderAll();
        showBanner(`✅ Copy Success: Created "${copyDoc.fileName}" & downloaded .aegis copy.`, "success");
      } else if (operation === "DELETE") {
        documents = documents.filter((d) => d.docId !== docId);
        saveState();
        logAudit("DELETE", doc.fileName, "SUCCESS", "Authenticated deletion of protected document");
        renderAll();
        showBanner(`✅ Delete Success: "${doc.fileName}" permanently removed from Vault.`, "success");
      }
    } catch (authErr) {
      // FAILED ATTEMPT HANDLING (3-STRIKE ACCOUNT LOCKOUT)
      doc.failedAttempts += 1;
      const remaining = MAX_FAILED_ATTEMPTS - doc.failedAttempts;

      if (doc.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        doc.isLocked = true;
        saveState();
        logAudit(operation, doc.fileName, "LOCKED", "Account/Document LOCKED after 3 consecutive failed attempts");
        closeAuth();
        renderAll();
        showBanner(`🚨 SECURITY LOCKOUT: "${doc.fileName}" has been LOCKED after 3 failed ${operation} attempts!`, "error");
      } else {
        saveState();
        logAudit(operation, doc.fileName, "FAILURE", `Invalid credentials (Attempt ${doc.failedAttempts}/${MAX_FAILED_ATTEMPTS})`);
        renderAll();
        document.getElementById("attempt-indicator").textContent =
          `Attempts remaining before account lock: ${remaining} / ${MAX_FAILED_ATTEMPTS}`;
        errBox.textContent = `❌ Authentication Failed! Invalid PIN or Security Answer. ${remaining} attempt(s) left before lockout.`;
        errBox.classList.remove("hidden");
      }
    }
  });

  // Viewer Modal Controls
  const closeViewer = () => {
    document.getElementById("viewer-modal").classList.add("hidden");
    document.getElementById("viewer-content").innerHTML = "";
    if (activeViewerBlobUrl) {
      URL.revokeObjectURL(activeViewerBlobUrl);
      activeViewerBlobUrl = null;
    }
  };
  document.getElementById("viewer-close").addEventListener("click", closeViewer);
  document.getElementById("viewer-done-btn").addEventListener("click", closeViewer);
  document.getElementById("viewer-download-btn").addEventListener("click", () => {
    if (activeViewerBlobUrl && activeViewerFileName) {
      const a = document.createElement("a");
      a.href = activeViewerBlobUrl;
      a.download = activeViewerFileName;
      a.click();
    }
  });

  // Owner Unlock Modal Controls
  const closeUnlock = () => {
    document.getElementById("unlock-modal").classList.add("hidden");
    activeUnlockDocId = null;
  };
  document.getElementById("unlock-close").addEventListener("click", closeUnlock);
  document.getElementById("unlock-cancel").addEventListener("click", closeUnlock);

  document.getElementById("unlock-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const doc = documents.find((d) => d.docId === activeUnlockDocId);
    if (!doc || !userProfile) return;

    const uid = document.getElementById("unlock-userid").value.trim().toLowerCase();
    const sec = document.getElementById("unlock-sec").value.trim().toLowerCase();
    const errEl = document.getElementById("unlock-error");

    if (
      uid === userProfile.userId.trim().toLowerCase() &&
      sec === userProfile.securityAnswer.trim().toLowerCase()
    ) {
      doc.isLocked = false;
      doc.failedAttempts = 0;
      saveState();
      logAudit("OWNER_UNLOCK", doc.fileName, "SUCCESS", "Owner identity verified; lockout cleared");
      closeUnlock();
      renderAll();
      showBanner(`🔓 "${doc.fileName}" has been unlocked by Document Owner.`, "success");
    } else {
      logAudit("OWNER_UNLOCK", doc.fileName, "FAILURE", "Failed owner recovery verification");
      errEl.textContent = "❌ Owner ID or Profile Security Answer did not match.";
      errEl.classList.remove("hidden");
    }
  });
}

window.openUnlockModal = function (docId) {
  activeUnlockDocId = docId;
  document.getElementById("unlock-userid").value = "";
  document.getElementById("unlock-sec").value = "";
  document.getElementById("unlock-error").classList.add("hidden");
  document.getElementById("unlock-modal").classList.remove("hidden");
};

function openMultimediaViewer(doc, plainBuffer) {
  const viewerContent = document.getElementById("viewer-content");
  document.getElementById("viewer-title").textContent = `🔓 ${doc.fileName}`;

  if (activeViewerBlobUrl) URL.revokeObjectURL(activeViewerBlobUrl);
  const blob = new Blob([plainBuffer], { type: doc.mimeType });
  activeViewerBlobUrl = URL.createObjectURL(blob);
  activeViewerFileName = doc.fileName;

  if (doc.mediaType === "TEXT") {
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(plainBuffer);
    viewerContent.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
  } else if (doc.mediaType === "AUDIO") {
    viewerContent.innerHTML = `
      <p class="muted">Playing decrypted audio stream securely in memory:</p>
      <audio controls autoplay src="${activeViewerBlobUrl}"></audio>
    `;
  } else if (doc.mediaType === "VIDEO") {
    viewerContent.innerHTML = `
      <p class="muted">Playing decrypted video stream securely in memory:</p>
      <video controls autoplay src="${activeViewerBlobUrl}"></video>
    `;
  } else if (doc.mimeType.startsWith("image/")) {
    viewerContent.innerHTML = `<img src="${activeViewerBlobUrl}" alt="${escapeHtml(doc.fileName)}" />`;
  } else {
    viewerContent.innerHTML = `
      <p>Binary file <strong>${escapeHtml(doc.fileName)}</strong> (${formatBytes(doc.originalSize)}) decrypted successfully.</p>
      <p class="muted">Click "Save Decrypted Copy to PC" below to open with its native desktop application.</p>
    `;
  }

  document.getElementById("viewer-modal").classList.remove("hidden");
}

// ============================================================================
// 7. AUDIT LOGS & DEMO DATA SEEDER (FOR LIVE VIVA PRESENTATION)
// ============================================================================
function logAudit(operation, docName, status, details) {
  auditLogs.unshift({
    timestamp: new Date().toLocaleString(),
    operation,
    docName,
    status,
    details
  });
  if (auditLogs.length > 100) auditLogs.pop();
  saveState();
}

function renderAuditLogs() {
  const tbody = document.getElementById("audit-tbody");
  if (!auditLogs.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No security events recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = auditLogs.map((log) => {
    const badgeClass =
      log.status === "SUCCESS" ? "badge-success" :
      log.status === "LOCKED" ? "badge-danger" : "badge-info";

    return `
      <tr>
        <td>${escapeHtml(log.timestamp)}</td>
        <td><strong>${escapeHtml(log.operation)}</strong></td>
        <td>${escapeHtml(log.docName)}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(log.status)}</span></td>
        <td>${escapeHtml(log.details)}</td>
      </tr>
    `;
  }).join("");
}

function bindHeaderButtons() {
  document.getElementById("clear-logs-btn").addEventListener("click", () => {
    auditLogs = [];
    saveState();
    renderAuditLogs();
  });

  document.getElementById("reset-system-btn").addEventListener("click", () => {
    if (confirm("Reset all protected vault documents and logs?")) {
      localStorage.removeItem(STORAGE_KEYS.DOCS);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      documents = [];
      auditLogs = [];
      logAudit("RESET", "Vault", "SUCCESS", "Vault cleared by user");
      renderAll();
      showBanner("↺ Vault reset complete.", "warning");
    }
  });

  // One-click Demo Files Generator (Creates real encrypted Text + Audio WAV files with PIN: 1234)
  document.getElementById("demo-seed-btn").addEventListener("click", async () => {
    if (!userProfile) return;
    const demoPin = "1234";
    const demoAns = userProfile.securityAnswer;

    // 1. Sample Confidential Text File
    const sampleText = new TextEncoder().encode(
      `CONFIDENTIAL PROJECT REPORT - CS311 SOFTWARE ENGINEERING LAB\n` +
      `Institution: IIIT Bhagalpur\n` +
      `Owner: ${userProfile.fullName} (${userProfile.userId})\n` +
      `Security Standard: AES-256-GCM + PBKDF2-SHA256\n\n` +
      `This document demonstrates real offline encryption, decryption, copy protection, and 3-attempt intrusion lockout.`
    );
    const encText = await encryptBuffer(sampleText.buffer, demoPin, demoAns, userProfile.userId);

    // 2. Sample Synthesized Chime Audio (.wav)
    const wavBuffer = generateDemoWavBuffer();
    const encAudio = await encryptBuffer(wavBuffer, demoPin, demoAns, userProfile.userId);

    documents.unshift(
      {
        docId: "DEMO-TXT-01",
        ownerId: userProfile.userId,
        ownerName: userProfile.fullName,
        fileName: "IIITBH_Confidential_Notes.txt",
        mimeType: "text/plain",
        mediaType: "TEXT",
        originalSize: sampleText.byteLength,
        classification: "Confidential",
        ciphertextB64: encText.ciphertextB64,
        ivB64: encText.ivB64,
        saltB64: encText.saltB64,
        failedAttempts: 0,
        isLocked: false,
        createdAt: new Date().toISOString()
      },
      {
        docId: "DEMO-AUD-02",
        ownerId: userProfile.userId,
        ownerName: userProfile.fullName,
        fileName: "Encrypted_Voice_Memo.wav",
        mimeType: "audio/wav",
        mediaType: "AUDIO",
        originalSize: wavBuffer.byteLength,
        classification: "Top Secret",
        ciphertextB64: encAudio.ciphertextB64,
        ivB64: encAudio.ivB64,
        saltB64: encAudio.saltB64,
        failedAttempts: 0,
        isLocked: false,
        createdAt: new Date().toISOString()
      }
    );

    saveState();
    logAudit("DEMO_SEED", "2 Sample Files", "SUCCESS", `Loaded sample Text & Audio files (Demo PIN: 1234, Answer: ${demoAns})`);
    renderAll();
    showBanner(`✨ Demo Text & Audio files loaded! Use PIN "1234" & Security Answer "${demoAns}" to unlock, or enter wrong PIN 3x to demo Lockout.`, "success");
  });
}

// Synthesizes a valid 1.5-second pleasant chord WAV file offline in JS
function generateDemoWavBuffer() {
  const sampleRate = 22050;
  const duration = 1.5;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-2.2 * t);
    const wave = 0.4 * Math.sin(2 * Math.PI * 523.25 * t) + 0.3 * Math.sin(2 * Math.PI * 659.25 * t);
    const sample = Math.max(-1, Math.min(1, wave * env));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  return buffer;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
