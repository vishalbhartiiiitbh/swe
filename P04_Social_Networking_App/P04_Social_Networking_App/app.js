/* ==========================================================================
   NexusConnect - Offline Social Networking Application Logic
   CS311 Software Engineering Lab (P04) - IIIT Bhagalpur
   100% Self-Contained Offline Engine using LocalStorage
   ========================================================================== */

const DB_KEYS = {
  USERS: 'nexus_p04_users',
  FRIENDSHIPS: 'nexus_p04_friendships',
  MESSAGES: 'nexus_p04_messages',
  POSTS: 'nexus_p04_posts',
  SESSION: 'nexus_p04_current_user',
  AUDIT: 'nexus_p04_audit_logs'
};

let activeChatFriendId = null;
let activeModalUserId = null;

// Built-in SVG Data URI Avatars so photos work 100% offline with zero broken links
function generateAvatarSVG(initials, bg1 = '#4f46e5', bg2 = '#0ea5e9') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="80" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
      font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${initials}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Seed Initial Realistic Dataset for Immediate Demonstration
function seedInitialData() {
  if (localStorage.getItem(DB_KEYS.USERS)) {
    ensureTestUser();
    return;
  }

  const users = [
    {
      id: 'u_test',
      name: 'Test User',
      email: 'test@gmail.com',
      password: '12345678',
      dob: '2000-01-01',
      address: 'IIIT Bhagalpur Campus, Sabour, Bihar',
      phone: '+91 98765 43210',
      education: 'B.Tech Computer Science & Engineering, IIIT Bhagalpur',
      profession: 'Software Developer & Network Member',
      hobbies: ['Web Development', 'Machine Learning', 'Competitive Coding', 'Music'],
      photo: generateAvatarSVG('TU', '#7c3aed', '#ec4899')
    },
    {
      id: 'u_vishal',
      name: 'Vishal Bharti',
      email: 'vishal@iiitbh.ac.in',
      password: 'Pass@123',
      dob: '2006-01-29',
      address: 'IIIT Bhagalpur Campus, Sabour, Bihar',
      phone: '+91 98350 11223',
      education: 'B.Tech Computer Science & Engineering, IIIT Bhagalpur',
      profession: 'Competitive Programmer & Systems Developer',
      hobbies: ['Competitive Coding', 'C++ & Algorithms', 'Microcontrollers', 'Travel'],
      photo: generateAvatarSVG('VB', '#4f46e5', '#0ea5e9')
    },
    {
      id: 'u_aarav',
      name: 'Aarav Sharma',
      email: 'aarav@iiitbh.ac.in',
      password: 'Pass@123',
      dob: '2005-08-14',
      address: 'Bhagalpur, Bihar',
      phone: '+91 91234 55678',
      education: 'B.Tech CSE, IIIT Bhagalpur',
      profession: 'Full-Stack Web Developer & Open Source Contributor',
      hobbies: ['React & Node.js', 'Badminton', 'Photography'],
      photo: generateAvatarSVG('AS', '#059669', '#10b981')
    },
    {
      id: 'u_priya',
      name: 'Priya Verma',
      email: 'priya@iiitbh.ac.in',
      password: 'Pass@123',
      dob: '2005-11-03',
      address: 'Patna, Bihar',
      phone: '+91 99887 76655',
      education: 'B.Tech ECE, IIIT Bhagalpur',
      profession: 'Embedded Systems & Signal Processing Enthusiast',
      hobbies: ['Digital Signal Processing', 'Chess', 'Sketching'],
      photo: generateAvatarSVG('PV', '#db2777', '#f43f5e')
    },
    {
      id: 'u_rohan',
      name: 'Rohan Kulkarni',
      email: 'rohan@iiitbh.ac.in',
      password: 'Pass@123',
      dob: '2005-04-21',
      address: 'Pune, Maharashtra',
      phone: '+91 97654 32109',
      education: 'B.Tech Mechatronics, IIIT Bhagalpur',
      profession: 'Robotics & AI Research Intern',
      hobbies: ['Robotics', 'Trekking', 'Guitar'],
      photo: generateAvatarSVG('RK', '#d97706', '#f59e0b')
    },
    {
      id: 'u_sneha',
      name: 'Sneha Gupta',
      email: 'sneha@iiitbh.ac.in',
      password: 'Pass@123',
      dob: '2006-02-17',
      address: 'Lucknow, Uttar Pradesh',
      phone: '+91 94512 88990',
      education: 'B.Tech CSE, IIIT Bhagalpur',
      profession: 'UI/UX Designer & Frontend Engineer',
      hobbies: ['Design Systems', 'Reading', 'Badminton'],
      photo: generateAvatarSVG('SG', '#7c3aed', '#a855f7')
    }
  ];

  const friendships = [
    { id: 'f_0', senderId: 'u_vishal', receiverId: 'u_test', status: 'ACCEPTED', createdAt: '2026-11-15' },
    { id: 'f_01', senderId: 'u_aarav', receiverId: 'u_test', status: 'ACCEPTED', createdAt: '2026-11-16' },
    { id: 'f_02', senderId: 'u_priya', receiverId: 'u_test', status: 'PENDING', createdAt: '2026-11-19' },
    { id: 'f_1', senderId: 'u_vishal', receiverId: 'u_aarav', status: 'ACCEPTED', createdAt: '2026-11-10' },
    { id: 'f_2', senderId: 'u_priya', receiverId: 'u_vishal', status: 'PENDING', createdAt: '2026-11-18' },
    { id: 'f_3', senderId: 'u_aarav', receiverId: 'u_sneha', status: 'ACCEPTED', createdAt: '2026-11-12' }
  ];

  const messages = [
    {
      id: 'm_0',
      senderId: 'u_vishal',
      receiverId: 'u_test',
      body: 'Welcome to NexusConnect! Feel free to explore connections, feeds, and messaging.',
      timestamp: '09:00 AM'
    },
    {
      id: 'm_1',
      senderId: 'u_aarav',
      receiverId: 'u_vishal',
      body: 'Hey Vishal! Are you ready for tomorrow’s CS311 Software Engineering Lab evaluation?',
      timestamp: '08:15 PM'
    },
    {
      id: 'm_2',
      senderId: 'u_vishal',
      receiverId: 'u_aarav',
      body: 'Yes! Built NexusConnect with full profile management, friend requests, and real-time offline chat.',
      timestamp: '08:18 PM'
    }
  ];

  const posts = [
    {
      id: 'p_0',
      authorId: 'u_test',
      tag: 'Project',
      content: 'Welcome to NexusConnect! Testing out the new network feed, real-time messaging, and profile customization.',
      likes: ['u_vishal', 'u_aarav'],
      timestamp: '30 mins ago'
    },
    {
      id: 'p_1',
      authorId: 'u_vishal',
      tag: 'Project',
      content: 'Excited to present NexusConnect for CS311 Software Engineering Lab (P04)! Built with clean modular architecture, enforced business rules, friend discovery, and instant messaging.',
      likes: ['u_aarav', 'u_priya'],
      timestamp: '2 hours ago'
    },
    {
      id: 'p_2',
      authorId: 'u_aarav',
      tag: 'Academic',
      content: 'Tip for everyone preparing use-case diagrams: map each functional requirement directly to an actor and verify all boundary constraints with dedicated test cases.',
      likes: ['u_vishal'],
      timestamp: '5 hours ago'
    },
    {
      id: 'p_3',
      authorId: 'u_sneha',
      tag: 'Career',
      content: 'Completed our UI design sprint today! Clean typography and intuitive navigation make all the difference in social platforms.',
      likes: ['u_aarav'],
      timestamp: '1 day ago'
    }
  ];

  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(DB_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
  localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(messages));
  localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(posts));
  localStorage.setItem(DB_KEYS.AUDIT, JSON.stringify([
    'System initialized with seeded IIIT Bhagalpur demo database.'
  ]));
}

// Ensure hardcoded test user (test@gmail.com / 12345678) is always active
function ensureTestUser() {
  const users = getUsers();
  const testUser = users.find(u => u.email && u.email.toLowerCase() === 'test@gmail.com');
  if (!testUser) {
    users.unshift({
      id: 'u_test',
      name: 'Test User',
      email: 'test@gmail.com',
      password: '12345678',
      dob: '2000-01-01',
      address: 'IIIT Bhagalpur Campus, Sabour, Bihar',
      phone: '+91 98765 43210',
      education: 'B.Tech Computer Science & Engineering, IIIT Bhagalpur',
      profession: 'Software Developer & Network Member',
      hobbies: ['Web Development', 'Machine Learning', 'Competitive Coding', 'Music'],
      photo: generateAvatarSVG('TU', '#7c3aed', '#ec4899')
    });
    saveUsers(users);
  } else if (testUser.password !== '12345678') {
    testUser.password = '12345678';
    saveUsers(users);
  }
}

// Database Helpers
const getUsers = () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
const saveUsers = (u) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(u));

const getFriendships = () => JSON.parse(localStorage.getItem(DB_KEYS.FRIENDSHIPS) || '[]');
const saveFriendships = (f) => localStorage.setItem(DB_KEYS.FRIENDSHIPS, JSON.stringify(f));

const getMessages = () => JSON.parse(localStorage.getItem(DB_KEYS.MESSAGES) || '[]');
const saveMessages = (m) => localStorage.setItem(DB_KEYS.MESSAGES, JSON.stringify(m));

const getPosts = () => JSON.parse(localStorage.getItem(DB_KEYS.POSTS) || '[]');
const savePosts = (p) => localStorage.setItem(DB_KEYS.POSTS, JSON.stringify(p));

function getCurrentUser() {
  const id = localStorage.getItem(DB_KEYS.SESSION);
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

function logAudit(text) {
  const logs = JSON.parse(localStorage.getItem(DB_KEYS.AUDIT) || '[]');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  logs.unshift(`[${time}] ${text}`);
  localStorage.setItem(DB_KEYS.AUDIT, JSON.stringify(logs.slice(0, 20)));
  renderAuditLog();
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ==========================================================================
// AUTHENTICATION & BUSINESS RULES
// ==========================================================================
function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');

  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('register-error').classList.add('hidden');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    loginForm.classList.add('hidden');
    regForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
  }
}

function quickLogin(email, password) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = password;
  handleLogin(new Event('submit'));
}

function resetDemoData() {
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  seedInitialData();
  showToast('Demo database reset to factory state!', 'success');
}

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function handleRegister(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('reg-name').value.trim() || 'Test User';
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const dob = document.getElementById('reg-dob').value;
  const education = document.getElementById('reg-edu').value.trim() || 'Student at IIIT Bhagalpur';
  const errBox = document.getElementById('register-error');

  // Hardcoded test user signup support
  if (email === 'test@gmail.com') {
    let users = getUsers();
    let existingIndex = users.findIndex(u => u.email && u.email.toLowerCase() === 'test@gmail.com');
    if (existingIndex !== -1) {
      users[existingIndex].password = password || '12345678';
      users[existingIndex].name = name || users[existingIndex].name || 'Test User';
      saveUsers(users);
      localStorage.setItem(DB_KEYS.SESSION, users[existingIndex].id);
      logAudit(`Account active: ${users[existingIndex].name} (${email})`);
      showToast(`Welcome to NexusConnect, ${users[existingIndex].name}!`, 'success');
      bootApp();
      return;
    }
  }

  // Business Rule BR-01: Unique Email Check
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email)) {
    errBox.textContent = 'Rule Violation (BR-01): An account with this email already exists.';
    errBox.classList.remove('hidden');
    return;
  }

  // Business Rule BR-02: Password Length
  if (password.length < 6) {
    errBox.textContent = 'Rule Violation (BR-02): Password must be at least 6 characters.';
    errBox.classList.remove('hidden');
    return;
  }

  // Business Rule BR-03: Minimum Age >= 13
  if (!dob || calculateAge(dob) < 13) {
    errBox.textContent = 'Rule Violation (BR-03): Users must be at least 13 years old to register.';
    errBox.classList.remove('hidden');
    return;
  }

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email,
    password,
    dob,
    address: 'India',
    phone: '',
    education,
    profession: 'Member on NexusConnect',
    hobbies: ['Networking', 'Technology'],
    photo: generateAvatarSVG(initials || 'NC')
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(DB_KEYS.SESSION, newUser.id);
  logAudit(`New account registered: ${name} (${email})`);
  showToast(`Welcome to NexusConnect, ${name}!`, 'success');
  bootApp();
}

function handleLogin(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
  const password = passwordInput ? passwordInput.value : '';
  const errBox = document.getElementById('login-error');

  // Hardcoded test user login check
  if (email === 'test@gmail.com' && password === '12345678') {
    ensureTestUser();
  }

  const user = getUsers().find(u => u.email.toLowerCase() === email && u.password === password);
  if (!user) {
    errBox.textContent = 'Authentication Failed: Invalid email or password.';
    errBox.classList.remove('hidden');
    return;
  }

  localStorage.setItem(DB_KEYS.SESSION, user.id);
  logAudit(`User logged in: ${user.name}`);
  showToast(`Signed in as ${user.name}`, 'success');
  bootApp();
}

function handleLogout() {
  const user = getCurrentUser();
  if (user) logAudit(`User logged out: ${user.name}`);
  localStorage.removeItem(DB_KEYS.SESSION);
  activeChatFriendId = null;
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('auth-view').classList.remove('hidden');
  showToast('Logged out successfully.');
}

// ==========================================================================
// NAVIGATION & APP SHELL RENDERING
// ==========================================================================
function bootApp() {
  const user = getCurrentUser();
  if (!user) {
    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    if (loginEmail && !loginEmail.value) loginEmail.value = 'test@gmail.com';
    if (loginPass && !loginPass.value) loginPass.value = '12345678';

    const regEmail = document.getElementById('reg-email');
    const regPass = document.getElementById('reg-password');
    if (regEmail && !regEmail.value) regEmail.value = 'test@gmail.com';
    if (regPass && !regPass.value) regPass.value = '12345678';

    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('app-view').classList.add('hidden');
    return;
  }

  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  updateSidebarAndTopbar();
  navigateTo('feed');
  renderAuditLog();
}

function navigateTo(page) {
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById('page-' + page).classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  if (page === 'feed') renderFeed();
  if (page === 'friends') renderFriendsPage();
  if (page === 'messages') renderMessagesPage();
  if (page === 'profile') loadProfileForm();
}

function updateSidebarAndTopbar() {
  const me = getCurrentUser();
  if (!me) return;

  const friendships = getFriendships();
  const myFriends = friendships.filter(
    f => f.status === 'ACCEPTED' && (f.senderId === me.id || f.receiverId === me.id)
  );
  const incomingReqs = friendships.filter(
    f => f.status === 'PENDING' && f.receiverId === me.id
  );
  const myPosts = getPosts().filter(p => p.authorId === me.id);

  // Topbar
  document.getElementById('topbar-avatar').src = me.photo;
  document.getElementById('topbar-name').textContent = me.name.split(' ')[0];

  // Mini Card
  document.getElementById('mini-avatar').src = me.photo;
  document.getElementById('mini-name').textContent = me.name;
  document.getElementById('mini-headline').textContent = me.profession || me.education;
  document.getElementById('mini-location').textContent = '📍 ' + (me.address || 'Location not set');
  document.getElementById('mini-friends-count').textContent = myFriends.length;
  document.getElementById('mini-posts-count').textContent = myPosts.length;
  document.getElementById('composer-avatar').src = me.photo;

  // Notification Badge
  const reqBadge = document.getElementById('nav-req-badge');
  if (incomingReqs.length > 0) {
    reqBadge.textContent = incomingReqs.length;
    reqBadge.classList.remove('hidden');
  } else {
    reqBadge.classList.add('hidden');
  }

  renderRightSuggestions();
}

function renderAuditLog() {
  const container = document.getElementById('audit-log');
  if (!container) return;
  const logs = JSON.parse(localStorage.getItem(DB_KEYS.AUDIT) || '[]');
  container.innerHTML = logs.map(l => `<div class="audit-entry">${l}</div>`).join('');
}

// ==========================================================================
// FEED & POSTS
// ==========================================================================
function createPost() {
  const me = getCurrentUser();
  const input = document.getElementById('post-content');
  const tag = document.getElementById('post-tag').value;
  const content = input.value.trim();

  if (!content) {
    showToast('Please write something before publishing.', 'error');
    return;
  }

  const posts = getPosts();
  posts.unshift({
    id: 'p_' + Date.now(),
    authorId: me.id,
    tag,
    content,
    likes: [],
    timestamp: 'Just now'
  });
  savePosts(posts);
  input.value = '';
  logAudit(`${me.name} published a ${tag} post.`);
  showToast('Post published to feed!', 'success');
  updateSidebarAndTopbar();
  renderFeed();
}

function toggleLike(postId) {
  const me = getCurrentUser();
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const idx = post.likes.indexOf(me.id);
  if (idx === -1) post.likes.push(me.id);
  else post.likes.splice(idx, 1);

  savePosts(posts);
  renderFeed();
}

function renderFeed() {
  const me = getCurrentUser();
  const users = getUsers();
  const posts = getPosts();
  const container = document.getElementById('feed-list');

  container.innerHTML = posts.map(post => {
    const author = users.find(u => u.id === post.authorId) || { name: 'Member', photo: '', profession: '' };
    const isLiked = post.likes.includes(me.id);
    return `
      <div class="post-card">
        <div class="post-header">
          <div class="post-author" onclick="openFriendModal('${author.id}')">
            <img src="${author.photo}" alt="${author.name}" />
            <div>
              <h4>${author.name}</h4>
              <div class="post-meta">${author.profession || author.education} • ${post.timestamp}</div>
            </div>
          </div>
          <span class="post-tag-pill">${post.tag}</span>
        </div>
        <div class="post-body">${escapeHTML(post.content)}</div>
        <div class="post-footer">
          <button class="post-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
            ${isLiked ? '❤️' : '🤍'} Like (${post.likes.length})
          </button>
          ${author.id !== me.id ? `
            <button class="post-action-btn" onclick="openFriendModal('${author.id}')">
              👤 View Profile
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// FRIENDSHIP SYSTEM & BUSINESS RULES
// ==========================================================================
function getRelationStatus(meId, otherId) {
  if (meId === otherId) return 'SELF';
  const f = getFriendships().find(
    item =>
      (item.senderId === meId && item.receiverId === otherId) ||
      (item.senderId === otherId && item.receiverId === meId)
  );
  if (!f) return 'NONE';
  if (f.status === 'ACCEPTED') return 'ACCEPTED';
  return f.senderId === meId ? 'SENT_PENDING' : 'RECEIVED_PENDING';
}

function sendFriendRequest(targetId) {
  const me = getCurrentUser();
  // Business Rule BR-04: No Self-Friending
  if (me.id === targetId) {
    showToast('Rule Violation (BR-04): Cannot send friend request to yourself.', 'error');
    return;
  }

  // Business Rule BR-05: No Duplicate Requests
  const status = getRelationStatus(me.id, targetId);
  if (status !== 'NONE') {
    showToast('Rule Violation (BR-05): Connection or request already exists.', 'error');
    return;
  }

  const friendships = getFriendships();
  friendships.push({
    id: 'f_' + Date.now(),
    senderId: me.id,
    receiverId: targetId,
    status: 'PENDING',
    createdAt: new Date().toISOString().slice(0, 10)
  });
  saveFriendships(friendships);

  const target = getUsers().find(u => u.id === targetId);
  logAudit(`${me.name} sent friend request to ${target ? target.name : targetId}`);
  showToast(`Friend request sent to ${target.name}!`, 'success');
  updateSidebarAndTopbar();
  renderFriendsPage();
}

function respondFriendRequest(senderId, accept) {
  const me = getCurrentUser();
  let friendships = getFriendships();
  const idx = friendships.findIndex(
    f => f.senderId === senderId && f.receiverId === me.id && f.status === 'PENDING'
  );
  if (idx === -1) return;

  const sender = getUsers().find(u => u.id === senderId);
  if (accept) {
    friendships[idx].status = 'ACCEPTED';
    logAudit(`${me.name} accepted friend request from ${sender.name}`);
    showToast(`You are now connected with ${sender.name}!`, 'success');
  } else {
    friendships.splice(idx, 1);
    logAudit(`${me.name} declined friend request from ${sender.name}`);
    showToast('Friend request declined.');
  }

  saveFriendships(friendships);
  updateSidebarAndTopbar();
  renderFriendsPage();
}

function renderFriendsPage(filterQuery = '') {
  const me = getCurrentUser();
  const users = getUsers().filter(u => u.id !== me.id);
  const q = filterQuery.toLowerCase();

  const filteredUsers = q
    ? users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        (u.education && u.education.toLowerCase().includes(q)) ||
        (u.profession && u.profession.toLowerCase().includes(q)) ||
        (u.hobbies && u.hobbies.join(' ').toLowerCase().includes(q))
      )
    : users;

  const pendingList = [];
  const friendsList = [];
  const discoverList = [];

  filteredUsers.forEach(u => {
    const rel = getRelationStatus(me.id, u.id);
    if (rel === 'RECEIVED_PENDING') pendingList.push(u);
    else if (rel === 'ACCEPTED') friendsList.push(u);
    else discoverList.push({ user: u, rel });
  });

  // Pending Requests
  const pendingSec = document.getElementById('pending-requests-section');
  document.getElementById('pending-count').textContent = pendingList.length;
  if (pendingList.length > 0) {
    pendingSec.classList.remove('hidden');
    document.getElementById('pending-requests-grid').innerHTML = pendingList.map(u => `
      <div class="person-card">
        <img src="${u.photo}" alt="${u.name}" onclick="openFriendModal('${u.id}')" />
        <h4 onclick="openFriendModal('${u.id}')">${u.name}</h4>
        <div class="person-sub">${u.education}</div>
        <div class="person-actions">
          <button class="btn-success" onclick="respondFriendRequest('${u.id}', true)">✓ Accept Request</button>
          <button class="btn-danger-outline" onclick="respondFriendRequest('${u.id}', false)">✕ Decline</button>
        </div>
      </div>
    `).join('');
  } else {
    pendingSec.classList.add('hidden');
  }

  // My Friends
  document.getElementById('my-friends-count').textContent = friendsList.length;
  document.getElementById('my-friends-grid').innerHTML = friendsList.length
    ? friendsList.map(u => `
      <div class="person-card">
        <img src="${u.photo}" alt="${u.name}" onclick="openFriendModal('${u.id}')" />
        <h4 onclick="openFriendModal('${u.id}')">${u.name}</h4>
        <div class="person-sub">${u.profession || u.education}</div>
        <div class="person-actions">
          <button class="btn-primary btn-sm" onclick="startChatWith('${u.id}')">💬 Message</button>
          <button class="btn-outline btn-sm" onclick="openFriendModal('${u.id}')">View Profile</button>
        </div>
      </div>
    `).join('')
    : '<p style="color:#64748b;font-size:0.9rem;">No friends connected yet. Send a request below!</p>';

  // Discover People
  document.getElementById('discover-people-grid').innerHTML = discoverList.length
    ? discoverList.map(({ user: u, rel }) => `
      <div class="person-card">
        <img src="${u.photo}" alt="${u.name}" onclick="openFriendModal('${u.id}')" />
        <h4 onclick="openFriendModal('${u.id}')">${u.name}</h4>
        <div class="person-sub">${u.education}</div>
        <div class="person-actions">
          ${rel === 'SENT_PENDING'
            ? `<button class="btn-outline btn-sm" disabled>⏳ Request Sent</button>`
            : `<button class="btn-primary btn-sm" onclick="sendFriendRequest('${u.id}')">+ Add Friend</button>`
          }
          <button class="btn-outline btn-sm" onclick="openFriendModal('${u.id}')">View Basic Profile</button>
        </div>
      </div>
    `).join('')
    : '<p style="color:#64748b;font-size:0.9rem;">No other members match your search.</p>';
}

function renderRightSuggestions() {
  const me = getCurrentUser();
  const suggestions = getUsers()
    .filter(u => u.id !== me.id && getRelationStatus(me.id, u.id) === 'NONE')
    .slice(0, 3);

  const box = document.getElementById('sidebar-suggestions');
  if (!suggestions.length) {
    box.innerHTML = '<p style="font-size:0.82rem;color:#64748b;">All available peers have been requested or connected!</p>';
    return;
  }

  box.innerHTML = suggestions.map(u => `
    <div class="suggestion-item">
      <div class="suggestion-left" onclick="openFriendModal('${u.id}')">
        <img src="${u.photo}" alt="${u.name}" />
        <div>
          <h5>${u.name}</h5>
          <span>${u.education.slice(0, 26)}...</span>
        </div>
      </div>
      <button class="btn-outline btn-sm" onclick="sendFriendRequest('${u.id}')">+ Add</button>
    </div>
  `).join('');
}

function handleGlobalSearch(query) {
  navigateTo('friends');
  renderFriendsPage(query);
}

// ==========================================================================
// DIRECT MESSAGING (FRIENDSHIP-GATED)
// ==========================================================================
function startChatWith(friendId) {
  const me = getCurrentUser();
  // Business Rule BR-06: Only accepted friends can be messaged
  if (getRelationStatus(me.id, friendId) !== 'ACCEPTED') {
    showToast('Rule Violation (BR-06): You must be connected friends to message.', 'error');
    return;
  }
  activeChatFriendId = friendId;
  navigateTo('messages');
}

function renderMessagesPage() {
  const me = getCurrentUser();
  const friends = getUsers().filter(
    u => u.id !== me.id && getRelationStatus(me.id, u.id) === 'ACCEPTED'
  );

  const listEl = document.getElementById('chat-friends-list');
  if (!friends.length) {
    listEl.innerHTML = '<p style="padding:16px;font-size:0.85rem;color:#64748b;">Connect with friends first to unlock messaging.</p>';
    document.getElementById('chat-empty-state').classList.remove('hidden');
    document.getElementById('chat-active-window').classList.add('hidden');
    return;
  }

  listEl.innerHTML = friends.map(f => `
    <div class="chat-friend-item ${activeChatFriendId === f.id ? 'active' : ''}" onclick="selectChatFriend('${f.id}')">
      <img src="${f.photo}" alt="${f.name}" />
      <div class="chat-friend-meta">
        <h4>${f.name}</h4>
        <p>${f.profession || f.education}</p>
      </div>
    </div>
  `).join('');

  if (activeChatFriendId && friends.some(f => f.id === activeChatFriendId)) {
    selectChatFriend(activeChatFriendId);
  } else {
    document.getElementById('chat-empty-state').classList.remove('hidden');
    document.getElementById('chat-active-window').classList.add('hidden');
  }
}

function selectChatFriend(friendId) {
  activeChatFriendId = friendId;
  const me = getCurrentUser();
  const friend = getUsers().find(u => u.id === friendId);
  if (!friend) return;

  document.querySelectorAll('.chat-friend-item').forEach(el => el.classList.remove('active'));
  renderMessagesSidebarSelection();

  document.getElementById('chat-empty-state').classList.add('hidden');
  document.getElementById('chat-active-window').classList.remove('hidden');

  document.getElementById('chat-peer-avatar').src = friend.photo;
  document.getElementById('chat-peer-name').textContent = friend.name;

  const msgs = getMessages().filter(
    m =>
      (m.senderId === me.id && m.receiverId === friendId) ||
      (m.senderId === friendId && m.receiverId === me.id)
  );

  const box = document.getElementById('chat-messages-box');
  box.innerHTML = msgs.length
    ? msgs.map(m => `
      <div class="msg-bubble ${m.senderId === me.id ? 'msg-sent' : 'msg-received'}">
        ${escapeHTML(m.body)}
        <span class="msg-time">${m.timestamp}</span>
      </div>
    `).join('')
    : `<div style="text-align:center;color:#64748b;margin:auto;font-size:0.88rem;">
         Say hello to <strong>${friend.name}</strong>! Start your conversation below.
       </div>`;

  box.scrollTop = box.scrollHeight;
}

function renderMessagesSidebarSelection() {
  const me = getCurrentUser();
  const friends = getUsers().filter(
    u => u.id !== me.id && getRelationStatus(me.id, u.id) === 'ACCEPTED'
  );
  const listEl = document.getElementById('chat-friends-list');
  listEl.innerHTML = friends.map(f => `
    <div class="chat-friend-item ${activeChatFriendId === f.id ? 'active' : ''}" onclick="selectChatFriend('${f.id}')">
      <img src="${f.photo}" alt="${f.name}" />
      <div class="chat-friend-meta">
        <h4>${f.name}</h4>
        <p>${f.profession || f.education}</p>
      </div>
    </div>
  `).join('');
}

function sendMessage(e) {
  e.preventDefault();
  const me = getCurrentUser();
  const input = document.getElementById('chat-input');
  const body = input.value.trim();
  if (!body || !activeChatFriendId) return;

  // Enforce Business Rule BR-06
  if (getRelationStatus(me.id, activeChatFriendId) !== 'ACCEPTED') {
    showToast('Rule Violation (BR-06): Messaging allowed only between friends.', 'error');
    return;
  }

  const msgs = getMessages();
  msgs.push({
    id: 'm_' + Date.now(),
    senderId: me.id,
    receiverId: activeChatFriendId,
    body,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  saveMessages(msgs);
  input.value = '';
  logAudit(`${me.name} sent a direct message.`);
  selectChatFriend(activeChatFriendId);
}

// ==========================================================================
// PROFILE VIEW & EDIT
// ==========================================================================
function loadProfileForm() {
  const me = getCurrentUser();
  if (!me) return;

  document.getElementById('prof-avatar-preview').src = me.photo;
  document.getElementById('prof-display-name').textContent = me.name;
  document.getElementById('prof-display-headline').textContent = me.profession || me.education;

  document.getElementById('edit-name').value = me.name;
  document.getElementById('edit-email').value = me.email;
  document.getElementById('edit-dob').value = me.dob || '';
  document.getElementById('edit-phone').value = me.phone || '';
  document.getElementById('edit-address').value = me.address || '';
  document.getElementById('edit-education').value = me.education || '';
  document.getElementById('edit-profession').value = me.profession || '';
  document.getElementById('edit-hobbies').value = (me.hobbies || []).join(', ');
  document.getElementById('edit-photo').value = me.photo || '';
}

function previewAvatarUrl(url) {
  if (url && url.trim()) {
    document.getElementById('prof-avatar-preview').src = url.trim();
  }
}

function setAvatarPreset(type) {
  const name = document.getElementById('edit-name').value.trim() || 'NC';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  let svg = '';
  if (type === 'male1') svg = generateAvatarSVG('👨‍💻', '#1e3a8a', '#3b82f6');
  else if (type === 'female1') svg = generateAvatarSVG('👩‍💻', '#831843', '#ec4899');
  else if (type === 'grad') svg = generateAvatarSVG('🎓', '#065f46', '#10b981');
  else svg = generateAvatarSVG(initials, '#4f46e5', '#0ea5e9');

  document.getElementById('edit-photo').value = svg;
  document.getElementById('prof-avatar-preview').src = svg;
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('edit-photo').value = e.target.result;
    document.getElementById('prof-avatar-preview').src = e.target.result;
    showToast('Photo loaded! Click Save Profile Changes to apply.', 'info');
  };
  reader.readAsDataURL(file);
}

function saveProfile(e) {
  e.preventDefault();
  const me = getCurrentUser();
  const dob = document.getElementById('edit-dob').value;

  if (calculateAge(dob) < 13) {
    showToast('Rule Violation (BR-03): Age must be at least 13 years.', 'error');
    return;
  }

  const users = getUsers();
  const idx = users.findIndex(u => u.id === me.id);
  if (idx === -1) return;

  users[idx].name = document.getElementById('edit-name').value.trim();
  users[idx].dob = dob;
  users[idx].phone = document.getElementById('edit-phone').value.trim();
  users[idx].address = document.getElementById('edit-address').value.trim();
  users[idx].education = document.getElementById('edit-education').value.trim();
  users[idx].profession = document.getElementById('edit-profession').value.trim();
  users[idx].hobbies = document.getElementById('edit-hobbies').value
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);
  users[idx].photo = document.getElementById('edit-photo').value.trim() || users[idx].photo;

  saveUsers(users);
  logAudit(`${users[idx].name} updated their profile details.`);
  showToast('Profile saved successfully!', 'success');
  updateSidebarAndTopbar();
  loadProfileForm();
}

// ==========================================================================
// FRIEND BASIC PROFILE MODAL
// ==========================================================================
function openFriendModal(userId) {
  const me = getCurrentUser();
  if (userId === me.id) {
    navigateTo('profile');
    return;
  }
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;

  activeModalUserId = userId;
  const rel = getRelationStatus(me.id, userId);

  document.getElementById('modal-avatar').src = user.photo;
  document.getElementById('modal-name').textContent = user.name;
  document.getElementById('modal-profession').textContent = user.profession || 'Member on NexusConnect';
  document.getElementById('modal-education').textContent = user.education || 'Not specified';
  document.getElementById('modal-address').textContent = user.address || 'Not specified';
  document.getElementById('modal-dob').textContent = user.dob || 'Private';
  // Privacy rule: Phone number shown only to accepted friends
  document.getElementById('modal-phone').textContent =
    rel === 'ACCEPTED' ? (user.phone || 'Not added') : '🔒 Visible to friends only';

  const hobbiesEl = document.getElementById('modal-hobbies');
  hobbiesEl.innerHTML = (user.hobbies || []).length
    ? user.hobbies.map(h => `<span class="hobby-pill">${escapeHTML(h)}</span>`).join('')
    : '<span style="color:#64748b;">No hobbies listed</span>';

  const badge = document.getElementById('modal-relation-badge');
  const actions = document.getElementById('modal-actions');

  if (rel === 'ACCEPTED') {
    badge.textContent = '✓ Connected Friend';
    badge.style.background = '#dcfce7';
    badge.style.color = '#166534';
    actions.innerHTML = `
      <button class="btn-primary" onclick="closeFriendModal(); startChatWith('${user.id}')">💬 Send Direct Message</button>
    `;
  } else if (rel === 'SENT_PENDING') {
    badge.textContent = '⏳ Friend Request Sent';
    badge.style.background = '#fef3c7';
    badge.style.color = '#92400e';
    actions.innerHTML = `<button class="btn-outline" disabled>Awaiting Approval</button>`;
  } else if (rel === 'RECEIVED_PENDING') {
    badge.textContent = '📩 Sent You a Friend Request';
    badge.style.background = '#e0e7ff';
    badge.style.color = '#3730a3';
    actions.innerHTML = `
      <button class="btn-success" onclick="respondFriendRequest('${user.id}', true); closeFriendModal();">✓ Accept Request</button>
      <button class="btn-danger-outline" onclick="respondFriendRequest('${user.id}', false); closeFriendModal();">✕ Decline</button>
    `;
  } else {
    badge.textContent = '🌐 NexusConnect Member';
    badge.style.background = '#f1f5f9';
    badge.style.color = '#475569';
    actions.innerHTML = `
      <button class="btn-primary" onclick="sendFriendRequest('${user.id}'); closeFriendModal();">+ Add Friend</button>
    `;
  }

  document.getElementById('friend-modal').classList.remove('hidden');
}

function openSelectedFriendModal() {
  if (activeChatFriendId) openFriendModal(activeChatFriendId);
}

function closeFriendModal() {
  document.getElementById('friend-modal').classList.add('hidden');
  activeModalUserId = null;
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'friend-modal') closeFriendModal();
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
  seedInitialData();
  bootApp();
});
