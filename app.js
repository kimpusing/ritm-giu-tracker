const stages = [
  "Request received",
  "Files received",
  "Metadata checking",
  "Quality control",
  "Analysis ongoing",
  "Review and validation",
  "Report generation",
  "Completed",
];

const statuses = ["In progress", "Needs input", "On hold", "Delayed", "Completed"];
const priorities = ["High", "Medium", "Routine"];
const giuLabName = "Genomics and Innovation Unit";
const legacyGiuLabName = "Genomics Informatics Unit";
const laboratories = [
  "National Reference Laboratory for Dengue and Other Arboviruses",
  "National Reference Laboratory for Influenza and Other Respiratory Viruses",
  "National Reference Laboratory for Measles, Rubella, and Other Exanthems",
  "National Reference Laboratory for Polio and Other Enteroviruses",
  "National Rotavirus Laboratory",
  "National Reference Laboratory for HIV/AIDS and Other Sexually Transmitted Infections",
];
const requisitionerSections = [giuLabName, ...laboratories, "Other section"];
const labColorClassMap = new Map([
  [laboratories[0], "lab-dengue"],
  [laboratories[1], "lab-influenza"],
  [laboratories[2], "lab-measles"],
  [laboratories[3], "lab-polio"],
  [laboratories[4], "lab-rotavirus"],
  [laboratories[5], "lab-hiv"],
]);
const diseasePrograms = [
  "Dengue",
  "Other Arboviruses",
  "Influenza",
  "Other Respiratory Viruses",
  "Measles",
  "Rubella",
  "Other Exanthems",
  "Polio",
  "Other Enteroviruses",
  "Rotavirus",
  "HIV/AIDS",
  "Other Sexually Transmitted Infections",
];
const staffOptions = [
  "GIU - Marlon",
  "GIU - Bea",
  "GIU - Sharlene",
  "GIU - Iona",
  "GIU - Kim",
];
const assistanceOptions = [
  "Sequencing analysis",
  "Sequencing preparation",
  "Assay optimization",
  "PCR troubleshooting",
  "Reagent verification",
  "Staff orientation",
  "Training",
  "Others",
];
const storageKey = "giu-nrl-status-tracker";
const userCacheKey = "giu-nrl-user-manager-cache";
const lastViewedKey = "giu-nrl-last-viewed";
let previousLastViewed = localStorage.getItem(lastViewedKey) || "";

function displayLabName(lab) {
  return lab === legacyGiuLabName ? giuLabName : lab;
}

const sampleRequests = [
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-001",
    lab: "National Reference Laboratory for Influenza and Other Respiratory Viruses",
    program: "Influenza",
    project: "WGS analysis for May surveillance batch",
    stage: "Quality control",
    status: "In progress",
    priority: "High",
    assignee: "GIU - Marlon",
    received: "2026-05-13",
    target: "2026-05-29",
    updated: "2026-05-25",
    notes: "FASTQ files received. QC summary is being reviewed for low-depth samples.",
    nextStep: "Confirm sample exclusions with the NRL before assembly and lineage analysis.",
    requisitionerName: "Influenza NRL focal person",
    requisitionerSection: laboratories[1],
    requiredAssistance: "Sequencing analysis",
  },
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-002",
    lab: "National Reference Laboratory for Dengue and Other Arboviruses",
    program: "Other Arboviruses",
    project: "Phylogenetic analysis support",
    stage: "Analysis ongoing",
    status: "In progress",
    priority: "Medium",
    assignee: "GIU - Kim",
    received: "2026-05-09",
    target: "2026-05-30",
    updated: "2026-05-24",
    notes: "Reference dataset curated. Tree building is underway with updated metadata labels.",
    nextStep: "Generate annotated tree and send draft interpretation for review.",
    requisitionerName: "Arbovirus surveillance team",
    requisitionerSection: laboratories[0],
    requiredAssistance: "Sequencing analysis",
  },
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-003",
    lab: "National Reference Laboratory for Dengue and Other Arboviruses",
    program: "Dengue",
    project: "Serotype confirmation sequencing run",
    stage: "Metadata checking",
    status: "Needs input",
    priority: "High",
    assignee: "GIU - Kim",
    received: "2026-05-18",
    target: "2026-05-27",
    updated: "2026-05-25",
    notes: "Sample sheet has mismatched collection dates for six records.",
    nextStep: "Await corrected metadata file from the NRL focal person.",
    requisitionerName: "Dengue NRL focal person",
    requisitionerSection: laboratories[0],
    requiredAssistance: "PCR troubleshooting",
  },
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-004",
    lab: "National Reference Laboratory for Polio and Other Enteroviruses",
    program: "Enteric viruses",
    project: "Protocol consultation for amplicon sequencing",
    stage: "Review and validation",
    status: "On hold",
    priority: "Routine",
    assignee: "GIU - Sharlene",
    received: "2026-05-02",
    target: "2026-05-31",
    updated: "2026-05-22",
    notes: "Draft workflow reviewed. Hold requested while lab finalizes reagent availability.",
    nextStep: "Resume once updated reagent list and planned batch size are available.",
    requisitionerName: "Enterovirus laboratory staff",
    requisitionerSection: laboratories[3],
    requiredAssistance: "Assay optimization",
  },
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-005",
    lab: "National Reference Laboratory for Measles, Rubella, and Other Exanthems",
    program: "Measles/Rubella",
    project: "Monthly genotyping report",
    stage: "Report generation",
    status: "Delayed",
    priority: "Medium",
    assignee: "GIU - Bea",
    received: "2026-05-06",
    target: "2026-05-23",
    updated: "2026-05-25",
    notes: "Analysis complete. Report delayed pending final validation comments.",
    nextStep: "Incorporate validator comments and publish final PDF.",
    requisitionerName: "Exanthems reporting team",
    requisitionerSection: laboratories[2],
    requiredAssistance: "Sequencing analysis",
  },
  {
    id: crypto.randomUUID(),
    displayId: "GIU-2026-006",
    lab: "National Rotavirus Laboratory",
    program: "Rotavirus",
    project: "Variant surveillance summary",
    stage: "Completed",
    status: "Completed",
    priority: "Routine",
    assignee: "GIU - Iona",
    received: "2026-05-01",
    target: "2026-05-20",
    updated: "2026-05-20",
    notes: "Final report transmitted to laboratory focal person.",
    nextStep: "Archive analysis files and include in monthly GIU accomplishment summary.",
    requisitionerName: "Rotavirus laboratory staff",
    requisitionerSection: laboratories[4],
    requiredAssistance: "Reagent verification",
  },
];

let requests = [];
let activeView = "queue";
let supabaseClient = null;
let currentUser = null;
let currentSession = null;
let cachedAccessToken = "";
let currentProfile = null;
let syncTimer = null;
let isSyncing = false;
let profileError = "";
let suggestedDisplayId = "";
let profileNoticeShownForUser = "";

const els = {
  activeCount: document.querySelector("#activeCount"),
  holdCount: document.querySelector("#holdCount"),
  doneCount: document.querySelector("#doneCount"),
  tatValue: document.querySelector("#tatValue"),
  resultCount: document.querySelector("#resultCount"),
  queueList: document.querySelector("#queueList"),
  nrlBoard: document.querySelector("#nrlBoard"),
  searchInput: document.querySelector("#searchInput"),
  labFilter: document.querySelector("#labFilter"),
  stageFilter: document.querySelector("#stageFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  clearFilters: document.querySelector("#clearFilters"),
  viewToggle: document.querySelector(".view-toggle"),
  queueView: document.querySelector("#queueView"),
  nrlView: document.querySelector("#nrlView"),
  newRequest: document.querySelector("#newRequest"),
  resetData: document.querySelector("#resetData"),
  syncBadge: document.querySelector("#syncBadge"),
  authButton: document.querySelector("#authButton"),
  manageUsers: document.querySelector("#manageUsers"),
  adminNote: document.querySelector("#adminNote"),
  patientInfoReminder: document.querySelector("#patientInfoReminder"),
  sessionInfo: document.querySelector("#sessionInfo"),
  toastRegion: document.querySelector("#toastRegion"),
  dialog: document.querySelector("#requestDialog"),
  form: document.querySelector("#requestForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeRequestDialog: document.querySelector("#closeRequestDialog"),
  cancelRequest: document.querySelector("#cancelRequest"),
  requestId: document.querySelector("#requestId"),
  displayId: document.querySelector("#displayId"),
  labName: document.querySelector("#labName"),
  programName: document.querySelector("#programName"),
  projectName: document.querySelector("#projectName"),
  requisitionerName: document.querySelector("#requisitionerName"),
  requisitionerSection: document.querySelector("#requisitionerSection"),
  requiredAssistance: document.querySelector("#requiredAssistance"),
  stageName: document.querySelector("#stageName"),
  stagePreview: document.querySelector("#stagePreview"),
  statusName: document.querySelector("#statusName"),
  priorityName: document.querySelector("#priorityName"),
  assigneeName: document.querySelector("#assigneeName"),
  receivedDate: document.querySelector("#receivedDate"),
  targetDate: document.querySelector("#targetDate"),
  notesText: document.querySelector("#notesText"),
  nextStepText: document.querySelector("#nextStepText"),
  deleteRequest: document.querySelector("#deleteRequest"),
  saveRequest: document.querySelector("#saveRequest"),
  userDialog: document.querySelector("#userDialog"),
  userForm: document.querySelector("#userForm"),
  userList: document.querySelector("#userList"),
  userMessage: document.querySelector("#userMessage"),
  refreshUsers: document.querySelector("#refreshUsers"),
  approveAllUsers: document.querySelector("#approveAllUsers"),
  closeUserDialog: document.querySelector("#closeUserDialog"),
  cancelUsers: document.querySelector("#cancelUsers"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  closeAuthDialog: document.querySelector("#closeAuthDialog"),
  cancelAuth: document.querySelector("#cancelAuth"),
  authTitle: document.querySelector("#authTitle"),
  authCopy: document.querySelector("#authCopy"),
  authModeSignIn: document.querySelector("#authModeSignIn"),
  authModeCreate: document.querySelector("#authModeCreate"),
  authNameLabel: document.querySelector("#authNameLabel"),
  authName: document.querySelector("#authName"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authMessage: document.querySelector("#authMessage"),
  createAccount: document.querySelector("#createAccount"),
  passwordSignIn: document.querySelector("#passwordSignIn"),
};

initialize();

async function initialize() {
  localStorage.setItem(lastViewedKey, new Date().toISOString());
  fillSelect(els.stageName, stages);
  fillSelect(els.statusName, statuses);
  fillSelect(els.priorityName, priorities);
  fillSelect(els.labName, laboratories);
  fillSelect(els.programName, diseasePrograms);
  fillSelect(els.assigneeName, staffOptions);
  fillSelect(els.requisitionerSection, requisitionerSections);
  els.requisitionerSection.insertAdjacentHTML(
    "afterbegin",
    '<option value="">Select NRL or section</option>'
  );
  els.requisitionerSection.value = "";
  fillSelect(els.requiredAssistance, assistanceOptions);
  els.requiredAssistance.insertAdjacentHTML(
    "afterbegin",
    '<option value="">Select assistance type</option>'
  );
  els.requiredAssistance.value = "";
  bindEvents();
  await initializeDataSource();
  render();
}

function bindEvents() {
  [els.searchInput, els.labFilter, els.stageFilter, els.statusFilter, els.priorityFilter].forEach((el) => {
    el.addEventListener("input", render);
  });

  els.clearFilters.addEventListener("click", () => {
    els.searchInput.value = "";
    els.labFilter.value = "All";
    els.stageFilter.value = "All";
    els.statusFilter.value = "All";
    els.priorityFilter.value = "All";
    render();
  });

  els.queueView.addEventListener("click", () => switchView("queue"));
  els.nrlView.addEventListener("click", () => switchView("nrl"));
  els.newRequest.addEventListener("click", openNewRequest);
  els.resetData.addEventListener("click", resetData);
  els.saveRequest.addEventListener("click", saveRequest);
  els.deleteRequest.addEventListener("click", deleteRequest);
  els.closeRequestDialog.addEventListener("click", closeRequestDialog);
  els.cancelRequest.addEventListener("click", closeRequestDialog);
  els.manageUsers.addEventListener("click", openUserManager);
  els.refreshUsers.addEventListener("click", loadUserManager);
  els.approveAllUsers.addEventListener("click", approveAllReadyUsers);
  els.closeUserDialog.addEventListener("click", closeUserManager);
  els.cancelUsers.addEventListener("click", closeUserManager);
  els.authButton.addEventListener("click", handleAuthButton);
  els.authModeSignIn.addEventListener("click", () => setAuthMode("sign-in"));
  els.authModeCreate.addEventListener("click", () => setAuthMode("create"));
  els.createAccount.addEventListener("click", createAccount);
  els.passwordSignIn.addEventListener("click", passwordSignIn);
  els.closeAuthDialog.addEventListener("click", closeAuthDialog);
  els.cancelAuth.addEventListener("click", closeAuthDialog);
  els.stageName.addEventListener("input", updateStagePreview);
}

async function initializeDataSource() {
  const config = window.GIU_SUPABASE_CONFIG || {};
  const hasCredentials = Boolean(config.url && config.anonKey);
  const hasConfig = Boolean(hasCredentials && window.supabase);

  if (!hasCredentials) {
    requests = loadLocalRequests();
    setMode("Demo mode", "Local browser storage");
    updateAccessControls();
    return;
  }

  if (!window.supabase) {
    requests = [];
    setMode("Connection issue", "Supabase client script did not load");
    updateAccessControls();
    return;
  }

  supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });
  await finishAuthRedirect();
  const sessionResult = await withTimeout(
    supabaseClient.auth.getSession(),
    2500,
    "Supabase session check took too long."
  );
  currentSession = sessionResult.data?.session || null;
  cachedAccessToken = currentSession?.access_token || readStoredAccessToken();
  currentUser = currentSession?.user || null;
  if (currentUser) {
    await ensurePendingProfile();
  }
  await loadProfile();
  await loadSupabaseRequests();
  listenForAuthChanges();
  setupPassiveSync();
}

function listenForAuthChanges() {
  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentSession = session || null;
    cachedAccessToken = session?.access_token || "";
    currentUser = session?.user || null;
    await loadProfile();
    await loadSupabaseRequests();
    render();
  });
}

function clearSignedInState() {
  currentSession = null;
  cachedAccessToken = "";
  currentUser = null;
  currentProfile = null;
  profileError = "";
  profileNoticeShownForUser = "";
  requests = [];
  setMode("Sign in required", "Signed out");
  updateAccessControls();
  render();
}

function setupPassiveSync() {
  window.addEventListener("focus", syncFromSupabase);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncFromSupabase();
    }
  });

  if (syncTimer) window.clearInterval(syncTimer);
  syncTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") {
      syncFromSupabase();
    }
  }, 60000);
}

async function syncFromSupabase() {
  if (!supabaseClient || isSyncing) return;
  if (!currentUser || !currentProfile || currentProfile.role === "pending") return;

  isSyncing = true;
  try {
    await loadSupabaseRequests();
    render();
  } finally {
    isSyncing = false;
  }
}

async function loadProfile() {
  profileError = "";

  if (!currentUser) {
    currentProfile = null;
    setMode("Sign in required", "Supabase connected");
    updateAccessControls();
    return;
  }

  const { data, error } = await fetchCurrentProfileDirect();

  if (error) {
    profileError = error.message;
    if (!currentProfile) {
      setMode("Profile error", error.message);
    }
  } else if (!data) {
    await ensurePendingProfile();
    const retry = await fetchCurrentProfileDirect();

    if (retry.data) {
      currentProfile = retry.data;
      const label = retry.data.role === "pending" ? "Pending approval" : retry.data.role === "nrl" ? displayLabName(retry.data.lab) : `${retry.data.role.toUpperCase()} view`;
      setMode(label, currentUser.email);
      if (retry.data.role === "pending" && profileNoticeShownForUser !== currentUser.id) {
        profileNoticeShownForUser = currentUser.id;
        showToast(
          "Account pending approval",
          "Your tracker profile was created. A GIU admin needs to assign your access.",
          "warning"
        );
      }
    } else {
      currentProfile = null;
      profileError = retry.error?.message || "No profile row was found for this signed-in user.";
      setMode("Profile setup needed", "Ask a GIU admin to check profile access");
      if (profileNoticeShownForUser !== currentUser.id) {
        profileNoticeShownForUser = currentUser.id;
        showToast(
          "Profile setup needed",
          "You signed in, but no tracker profile was found yet. Please wait for GIU approval.",
          "warning"
        );
      }
    }
  } else {
    currentProfile = data;
    const label = data.role === "pending" ? "Pending approval" : data.role === "nrl" ? displayLabName(data.lab) : `${data.role.toUpperCase()} view`;
    setMode(label, currentUser.email);
  }

  updateAccessControls();
}

async function fetchCurrentProfileDirect() {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken("No active Supabase session was found. Please sign in again.");
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token || !currentUser?.id) {
    return {
      data: null,
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const url = `${config.url}/rest/v1/profiles?select=id,full_name,lab,role&id=eq.${encodeURIComponent(currentUser.id)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: { message: body?.message || `Supabase returned ${response.status} while loading your profile.` },
      };
    }

    return { data: Array.isArray(body) ? body[0] || null : null, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to load your profile. Please retry, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadSupabaseRequests() {
  if (!currentUser || !currentProfile) {
    requests = [];
    return;
  }

  const { data, error } = await fetchRequestsDirect();

  if (error) {
    requests = [];
    setMode("Load error", error.message);
    return;
  }

  requests = data.map(fromSupabaseRow);
}

async function fetchRequestsDirect() {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken("No active Supabase session was found. Please sign in again.");
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      data: null,
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 7000);

  try {
    const url = `${config.url}/rest/v1/giu_requests?select=*&order=updated_at.desc`;
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: { message: body?.message || `Supabase returned ${response.status} while loading requests.` },
      };
    }

    return { data: body || [], error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to load requests. Please retry, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function finishAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const errorDescription = params.get("error_description");

  if (errorDescription) {
    setMode("Sign-in error", errorDescription);
    return;
  }

  if (!code) return;

  const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
  if (error) {
    setMode("Sign-in error", error.message);
    return;
  }

  window.history.replaceState({}, document.title, `${window.location.origin}${window.location.pathname}`);
}

function supabaseProjectRef() {
  const url = window.GIU_SUPABASE_CONFIG?.url || "";
  try {
    return new URL(url).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

function readStoredAccessToken() {
  const projectRef = supabaseProjectRef();
  const preferredKeys = projectRef ? [`sb-${projectRef}-auth-token`] : [];
  const checkedKeys = new Set();

  const readKey = (key) => {
    checkedKeys.add(key);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return parsed?.access_token
        || parsed?.currentSession?.access_token
        || parsed?.session?.access_token
        || "";
    } catch {
      return "";
    }
  };

  for (const key of preferredKeys) {
    const token = readKey(key);
    if (token) return token;
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || checkedKeys.has(key) || !key.includes("auth-token")) continue;
    const token = readKey(key);
    if (token) return token;
  }

  return "";
}

async function getAccessToken(message = "No active Supabase session was found. Please sign in again.") {
  const storedToken = currentSession?.access_token || cachedAccessToken || readStoredAccessToken();
  if (storedToken) {
    cachedAccessToken = storedToken;
    return { token: storedToken, error: null };
  }

  const sessionResult = await withTimeout(
    supabaseClient.auth.getSession(),
    2500,
    message
  );
  const session = sessionResult.data?.session || null;
  const token = session?.access_token || "";

  if (token) {
    currentSession = session;
    cachedAccessToken = token;
    currentUser = session.user || currentUser;
    return { token, error: null };
  }

  return {
    token: "",
    error: sessionResult.error || { message },
  };
}

function loadLocalRequests() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return sampleRequests;

  try {
    return JSON.parse(saved);
  } catch {
    return sampleRequests;
  }
}

function persistLocal() {
  localStorage.setItem(storageKey, JSON.stringify(requests));
}

function setMode(label, title = "") {
  els.syncBadge.textContent = label;
  els.syncBadge.title = title;
}

function updateSessionInfo() {
  if (!els.sessionInfo) return;

  const viewedText = previousLastViewed
    ? `Last viewed ${formatDateTime(previousLastViewed)}`
    : "First view in this browser";

  if (!currentUser) {
    els.sessionInfo.textContent = viewedText;
    return;
  }

  const loginText = currentUser.last_sign_in_at
    ? `Last login ${formatDateTime(currentUser.last_sign_in_at)}`
    : "Last login just now";
  els.sessionInfo.textContent = `${currentUser.email} | ${loginText} | ${viewedText}`;
}

function showToast(title, message = "", type = "info") {
  if (!els.toastRegion) return;

  els.toastRegion.innerHTML = "";
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type === "warning" || type === "signed-out" ? "!" : "+";
  toast.innerHTML = `
    <div class="toast-icon" aria-hidden="true">${icon}</div>
    <div class="toast-text">
      <strong>${escapeHtml(title)}</strong>
      ${message ? `<span>${escapeHtml(message)}</span>` : ""}
    </div>
  `;
  els.toastRegion.appendChild(toast);
  document.body.classList.add("has-toast");

  window.setTimeout(() => {
    toast.remove();
    if (!els.toastRegion.children.length) {
      document.body.classList.remove("has-toast");
    }
  }, 1150);
}

function canEditRequests() {
  return !supabaseClient || ["admin", "giu"].includes(currentProfile?.role);
}

function canDeleteRequests() {
  return !supabaseClient || currentProfile?.role === "admin";
}

function updateAccessControls() {
  const canEdit = canEditRequests();
  const showViewToggle = canEdit;

  if (!showViewToggle && activeView !== "queue") {
    activeView = "queue";
  }

  els.viewToggle.classList.toggle("hidden", !showViewToggle);
  els.queueView.classList.toggle("active", activeView === "queue");
  els.nrlView.classList.toggle("active", activeView === "nrl");
  els.newRequest.classList.toggle("hidden", !canEdit);
  els.resetData.classList.toggle("hidden", Boolean(supabaseClient));
  els.manageUsers.classList.toggle("hidden", currentProfile?.role !== "admin");
  els.adminNote.classList.toggle("hidden", currentProfile?.role !== "admin");
  els.patientInfoReminder?.classList.toggle("hidden", !canEdit);
  els.authButton.textContent = currentUser ? "Sign out" : "Sign in";
  els.authButton.classList.toggle("is-signed-in", Boolean(currentUser));
  els.authButton.classList.toggle("is-signed-out", !currentUser);
}

function render() {
  updateFilterOptions();
  updateAccessControls();
  updateSessionInfo();
  const filtered = getFilteredRequests();
  renderSummary();
  els.resultCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "request" : "requests"}`;

  if (activeView === "queue") {
    renderQueue(filtered);
  } else {
    renderNrlBoard(filtered);
  }
}

function updateFilterOptions() {
  const current = {
    lab: els.labFilter.value || "All",
    stage: els.stageFilter.value || "All",
    status: els.statusFilter.value || "All",
    priority: els.priorityFilter.value || "All",
  };

  fillSelect(els.labFilter, uniqueValues(requests.map((item) => item.lab)), "All");
  fillSelect(els.stageFilter, stages, "All");
  fillSelect(els.statusFilter, statuses, "All");
  fillSelect(els.priorityFilter, priorities, "All");

  els.labFilter.value = hasOption(els.labFilter, current.lab) ? current.lab : "All";
  els.stageFilter.value = current.stage;
  els.statusFilter.value = current.status;
  els.priorityFilter.value = current.priority;
}

function getFilteredRequests() {
  const query = els.searchInput.value.trim().toLowerCase();

  return requests.filter((item) => {
    const searchable = [item.displayId, item.lab, item.program, item.project, item.assignee, item.notes]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      matches(els.labFilter.value, item.lab) &&
      matches(els.stageFilter.value, item.stage) &&
      matches(els.statusFilter.value, item.status) &&
      matches(els.priorityFilter.value, item.priority)
    );
  });
}

function renderSummary() {
  const active = requests.filter((item) => item.status !== "Completed").length;
  const hold = requests.filter((item) => item.status === "On hold" || item.status === "Needs input").length;
  const done = requests.filter((item) => item.status === "Completed").length;
  const completedDurations = requests
    .filter((item) => item.status === "Completed")
    .map((item) => dayDiff(item.received, item.updated))
    .filter((value) => Number.isFinite(value));

  els.activeCount.textContent = active;
  els.holdCount.textContent = hold;
  els.doneCount.textContent = done;
  els.tatValue.textContent = completedDurations.length ? `${median(completedDurations)}d` : "N/A";
}

function renderQueue(items) {
  els.queueList.classList.remove("hidden");
  els.nrlBoard.classList.add("hidden");

  if (!currentUser && supabaseClient) {
    els.queueList.innerHTML = `<p class="empty-state">Sign in to view GIU request statuses.</p>`;
    return;
  }

  if (currentUser && !currentProfile && supabaseClient) {
    const detail = profileError ? ` ${escapeHtml(profileError)}` : "";
    els.queueList.innerHTML = `<p class="empty-state"><strong>Your account is signed in, but the profile setup did not finish.</strong><br />Please sign out, sign in again, or ask a GIU admin to press Refresh Users and approve your account.${detail}</p>`;
    return;
  }

  if (currentProfile?.role === "pending") {
    els.queueList.innerHTML = `<p class="empty-state"><strong>Account created. Pending GIU approval.</strong><br />Your profile is waiting for an admin to assign your role and laboratory access.</p>`;
    return;
  }

  if (!items.length) {
    els.queueList.innerHTML = `<p class="empty-state">No requests match the current filters.</p>`;
    return;
  }

  els.queueList.innerHTML = items.map(requestRowTemplate).join("");
  els.queueList.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openExistingRequest(button.dataset.edit));
  });
  els.queueList.querySelectorAll("[data-delete-row]").forEach((button) => {
    button.addEventListener("click", () => deleteRequestById(button.dataset.deleteRow));
  });
}

function renderNrlBoard(items) {
  els.queueList.classList.add("hidden");
  els.nrlBoard.classList.remove("hidden");

  if (!items.length) {
    els.nrlBoard.innerHTML = `<p class="empty-state">No NRL work items match the current filters.</p>`;
    return;
  }

  const grouped = items.reduce((acc, item) => {
    acc[item.lab] ||= [];
    acc[item.lab].push(item);
    return acc;
  }, {});

  els.nrlBoard.innerHTML = Object.entries(grouped)
    .map(([lab, labItems]) => {
      const active = labItems.filter((item) => item.status !== "Completed").length;
      const labClass = labClassName(lab);
      return `
        <article class="nrl-column ${labClass}">
          <div class="nrl-heading">
            <h2>${escapeHtml(lab)}</h2>
            <p class="meta">${active} active of ${labItems.length} total</p>
          </div>
          <div class="nrl-items">
            ${labItems.map(miniRequestTemplate).join("")}
          </div>
        </article>
      `;
    })
    .join("");

  els.nrlBoard.querySelectorAll("[data-edit]").forEach((item) => {
    item.addEventListener("click", () => openExistingRequest(item.dataset.edit));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExistingRequest(item.dataset.edit);
      }
    });
  });
}

function requestRowTemplate(item) {
  const progress = stageProgress(item.stage);
  const progressClass = stageProgressClass(item.stage);
  const due = dueState(item);
  const labClass = labClassName(item.lab);
  const requester = requesterMetaTemplate(item);
  const action = canEditRequests()
    ? `
      <button class="secondary edit-button" data-edit="${item.id}" type="button">Update</button>
      ${canDeleteRequests() ? `<button class="secondary danger delete-row-button" data-delete-row="${item.id}" type="button">Delete</button>` : ""}
    `
    : `<span class="view-only">View only</span>`;

  return `
    <article class="request-row ${due.rowClass} ${labClass}">
      <div class="request-title">
        <div class="ticket-meta">
          <span class="request-id">${escapeHtml(item.displayId)}</span>
          <span class="lab-name ${labClass}">${escapeHtml(item.lab)}</span>
        </div>
        <strong>${escapeHtml(item.project)}</strong>
        ${requester}
        <span class="notes">${escapeHtml(item.notes || "")}</span>
        <span class="next-step">Next: ${escapeHtml(item.nextStep || "No next step recorded")}</span>
      </div>
      <div>
        <span class="field-label">Program</span>
        <strong>${escapeHtml(item.program)}</strong>
        <p class="meta">${escapeHtml(item.assignee)}</p>
      </div>
      <div class="stage">
        <span class="field-label">GIU stage</span>
        <span class="meta">${escapeHtml(item.stage)}</span>
        <span class="progress-track ${progressClass}" aria-label="${progress}% complete">
          <span class="progress-bar" style="width: ${progress}%"></span>
        </span>
      </div>
      <div>
        <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
        <p class="date-line ${due.className}">${escapeHtml(due.label)}</p>
        <p class="date-line">Updated ${formatDate(item.updated)}</p>
        <p class="date-line ${priorityClass(item.priority)}">${escapeHtml(item.priority)} priority</p>
      </div>
      <div class="row-actions">${action}</div>
    </article>
  `;
}

function miniRequestTemplate(item) {
  const due = dueState(item);
  const labClass = labClassName(item.lab);
  const progress = stageProgress(item.stage);
  const progressClass = stageProgressClass(item.stage);
  const editable = canEditRequests();
  const requester = requesterMetaTemplate(item, "mini");
  return `
    <article
      class="mini-request ${due.rowClass} ${labClass} ${editable ? "is-clickable" : ""}"
      ${editable ? `data-edit="${item.id}" role="button" tabindex="0" aria-label="Update ${escapeHtml(item.project)}"` : ""}
    >
      <strong>${escapeHtml(item.project)}</strong>
      <span class="pill ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      <div class="mini-stage">
        <span class="meta">${escapeHtml(item.stage)} - ${escapeHtml(due.label)}</span>
        <span class="progress-track ${progressClass}" aria-label="${progress}% complete">
          <span class="progress-bar" style="width: ${progress}%"></span>
        </span>
      </div>
      <span class="notes">${escapeHtml(item.nextStep || "")}</span>
      ${requester}
    </article>
  `;
}

function requesterMetaTemplate(item, variant = "row") {
  const name = item.requisitionerName?.trim();
  const assistance = item.requiredAssistance?.trim();
  const section = item.requisitionerSection?.trim();
  if (!name && !assistance && !section) return "";

  const requestedBy = name || section || "Not specified";
  const details = [
    `Requested by: ${requestedBy}`,
    assistance ? `Assistance: ${assistance}` : "",
  ].filter(Boolean);

  return `<span class="requester-meta ${variant === "mini" ? "compact" : ""}">${details
    .map(escapeHtml)
    .join(" | ")}</span>`;
}

function switchView(view) {
  activeView = view;
  els.queueView.classList.toggle("active", view === "queue");
  els.nrlView.classList.toggle("active", view === "nrl");
  render();
}

async function openNewRequest() {
  if (!canEditRequests()) return;

  els.newRequest.disabled = true;
  try {
    els.dialogTitle.textContent = "New Request";
    els.deleteRequest.classList.add("hidden");
    els.form.reset();
    els.requestId.value = "";
    suggestedDisplayId = nextDisplayId();
    els.displayId.value = suggestedDisplayId;
    els.receivedDate.valueAsDate = new Date();
    els.targetDate.valueAsDate = addDays(new Date(), 14);
    updateStagePreview();
    els.dialog.showModal();
  } finally {
    els.newRequest.disabled = false;
  }
}

function openExistingRequest(id) {
  if (!canEditRequests()) return;
  const item = requests.find((request) => request.id === id);
  if (!item) return;

  suggestedDisplayId = "";
  els.dialogTitle.textContent = "Update Request";
  els.deleteRequest.classList.toggle("hidden", !canDeleteRequests());
  els.requestId.value = item.id;
  els.displayId.value = item.displayId;
  els.labName.value = item.lab;
  els.programName.value = item.program;
  els.projectName.value = item.project;
  els.requisitionerName.value = item.requisitionerName || "";
  setSelectValue(els.requisitionerSection, item.requisitionerSection || "");
  setSelectValue(els.requiredAssistance, item.requiredAssistance || "");
  els.stageName.value = item.stage;
  els.statusName.value = item.status;
  els.priorityName.value = item.priority;
  els.assigneeName.value = item.assignee;
  els.receivedDate.value = item.received;
  els.targetDate.value = item.target;
  els.notesText.value = item.notes || "";
  els.nextStepText.value = item.nextStep || "";
  updateStagePreview();
  els.dialog.showModal();
}

function updateStagePreview() {
  if (!els.stagePreview) return;
  const progress = stageProgress(els.stageName.value);
  const progressClass = stageProgressClass(els.stageName.value);
  els.stagePreview.innerHTML = `
    <span class="stage-preview-meta">${progress}% complete</span>
    <span class="progress-track ${progressClass}" aria-label="${progress}% complete">
      <span class="progress-bar" style="width: ${progress}%"></span>
    </span>
  `;
}

function closeRequestDialog() {
  suggestedDisplayId = "";
  els.form.reset();
  els.dialog.close();
}

async function openUserManager() {
  if (currentProfile?.role !== "admin") return;

  els.userMessage.textContent = "";
  const cachedUsers = readUserCache();
  if (cachedUsers.length) {
    renderUserManager(cachedUsers);
    els.userMessage.textContent = "Refreshing users...";
  } else {
    els.userList.innerHTML = `<p class="empty-state compact-state">Loading users...</p>`;
  }
  els.userDialog.showModal();
  loadUserManager();
}

function closeUserManager() {
  els.userMessage.textContent = "";
  els.userDialog.close();
}

async function loadUserManager() {
  if (!supabaseClient || currentProfile?.role !== "admin") return;

  let { data, error } = await fetchUserProfiles();

  if (error) {
    ({ data, error } = await fetchUserProfiles());
  }

  if (error) {
    const cachedUsers = readUserCache();
    if (cachedUsers.length) {
      renderUserManager(cachedUsers);
      els.userMessage.textContent = error.message;
    } else {
      els.userList.innerHTML = `<p class="empty-state compact-state">${escapeHtml(error.message)}</p>`;
    }
    return;
  }

  writeUserCache(data || []);
  els.userMessage.textContent = "";
  renderUserManager(data || []);
}

function fetchUserProfiles() {
  return fetchUserProfilesDirect();
}

async function fetchUserProfilesDirect() {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before opening Manage Users."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      data: null,
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const url = `${config.url}/rest/v1/profiles?select=id,full_name,lab,role,created_at&order=role.asc&order=created_at.desc`;
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: { message: body?.message || `Supabase returned ${response.status} while loading users.` },
      };
    }

    return { data: body || [], error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to load users. Click Refresh Users, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function renderUserManager(users) {
  if (!users.length) {
    els.userList.innerHTML = `<p class="empty-state compact-state">No user profiles found.</p>`;
    return;
  }

  els.userList.innerHTML = users.map(userRowTemplate).join("");

  els.userList.querySelectorAll("[data-save-user]").forEach((button) => {
    button.addEventListener("click", () => saveUserProfile(button.dataset.saveUser));
  });

  els.userList.querySelectorAll("[data-remove-user]").forEach((button) => {
    button.addEventListener("click", () => removeUserProfile(button.dataset.removeUser));
  });
}

async function approveAllReadyUsers() {
  const pendingRows = Array.from(els.userList.querySelectorAll(".user-row.is-pending-user"));
  const readyRows = pendingRows
    .map((row) => {
      const userId = row.dataset.userRow;
      const name = row.querySelector(`[data-user-name="${cssEscape(userId)}"]`)?.value.trim();
      const selectedRole = row.querySelector(`[data-user-role="${cssEscape(userId)}"]`)?.value || "pending";
      const selectedLab = row.querySelector(`[data-user-lab="${cssEscape(userId)}"]`)?.value || "Pending assignment";
      return {
        row,
        userId,
        updates: {
          full_name: name,
          role: selectedRole === "pending" ? "nrl" : selectedRole,
          lab: selectedLab,
        },
      };
    })
    .filter(({ updates }) => updates.full_name && updates.lab !== "Pending assignment");

  if (!pendingRows.length) {
    els.userMessage.textContent = "No pending accounts to approve.";
    showToast("No pending accounts", "There are no users ready for approval.", "warning");
    return;
  }

  if (!readyRows.length) {
    els.userMessage.textContent = "Choose a name and laboratory for each pending user before approving.";
    showToast("Approval paused", "Choose a name and laboratory for each pending user first.", "warning");
    return;
  }

  els.approveAllUsers.disabled = true;
  els.userMessage.textContent = `Approving ${readyRows.length} pending account${readyRows.length === 1 ? "" : "s"}...`;

  for (const item of readyRows) {
    const { error } = await updateUserProfileDirect(item.userId, item.updates);
    if (error) {
      els.userMessage.textContent = error.message;
      showToast("Approval failed", error.message, "warning");
      els.approveAllUsers.disabled = false;
      return;
    }
  }

  els.userMessage.textContent = `${readyRows.length} pending account${readyRows.length === 1 ? "" : "s"} approved.`;
  showToast("Users approved", `${readyRows.length} account${readyRows.length === 1 ? "" : "s"} updated.`, "success");
  await loadUserManager();
  els.approveAllUsers.disabled = false;
}

function readUserCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(userCacheKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUserCache(users) {
  localStorage.setItem(userCacheKey, JSON.stringify(users));
}

function userRowTemplate(user) {
  const safeId = escapeHtml(user.id);
  const role = user.role || "pending";
  const lab = displayLabName(user.lab || "Pending assignment");
  const name = user.full_name || "Unnamed user";
  const isPending = role === "pending";
  const summary = isPending ? "Waiting for GIU approval" : lab;

  return `
    <article class="user-row ${isPending ? "is-pending-user" : ""}" data-user-row="${safeId}">
      <div>
        <span class="pill role-pill ${roleClass(role)}">${escapeHtml(roleLabel(role))}</span>
        <strong data-user-display-name="${safeId}">${escapeHtml(name)}</strong>
        <p class="meta user-summary">${escapeHtml(summary)}</p>
      </div>
      <label>
        Name
        <input data-user-name="${safeId}" type="text" value="${escapeHtml(name)}" placeholder="Full name" />
      </label>
      <label>
        Role
        <select data-user-role="${safeId}">
          ${roleOptions(role)}
        </select>
      </label>
      <label>
        Laboratory
        <select data-user-lab="${safeId}">
          ${labOptions(lab)}
        </select>
      </label>
      <div class="user-row-actions">
        <button type="button" data-save-user="${safeId}">${isPending ? "Approve" : "Update"}</button>
        <button class="secondary danger" type="button" data-remove-user="${safeId}">Remove</button>
      </div>
    </article>
  `;
}

function roleOptions(selected) {
  return ["pending", "nrl", "giu", "admin"]
    .map((role) => `<option value="${role}" ${role === selected ? "selected" : ""}>${roleLabel(role)}</option>`)
    .join("");
}

function roleLabel(role) {
  const labels = {
    pending: "Pending",
    nrl: "NRL",
    giu: "GIU",
    admin: "Admin",
  };
  return labels[role] || "Pending";
}

function roleClass(role) {
  return `role-${role || "pending"}`;
}

function labOptions(selected) {
  const normalizedSelected = displayLabName(selected);
  const values = ["Pending assignment", giuLabName, ...laboratories];
  return values
    .map((lab) => `<option value="${escapeHtml(lab)}" ${lab === normalizedSelected ? "selected" : ""}>${escapeHtml(lab)}</option>`)
    .join("");
}

async function saveUserProfile(userId) {
  const row = els.userList.querySelector(`[data-user-row="${cssEscape(userId)}"]`);
  if (!row) return;

  const name = row.querySelector(`[data-user-name="${cssEscape(userId)}"]`).value.trim();
  const role = row.querySelector(`[data-user-role="${cssEscape(userId)}"]`).value;
  const lab = row.querySelector(`[data-user-lab="${cssEscape(userId)}"]`).value;
  const savedRole = role === "pending" && lab !== "Pending assignment" ? "nrl" : role;
  const button = row.querySelector(`[data-save-user="${cssEscape(userId)}"]`);

  if (!name) {
    els.userMessage.textContent = "Enter a name before saving this user.";
    showToast("Name needed", "Enter a name before saving this user.", "warning");
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Saving";
  }
  els.userMessage.textContent = "Saving user...";

  const { error } = await updateUserProfileDirect(userId, { full_name: name, role: savedRole, lab });

  if (error) {
    els.userMessage.textContent = error.message;
    showToast("User update failed", error.message, "warning");
    if (button) {
      button.disabled = false;
      button.textContent = role === "pending" ? "Approve" : "Update";
    }
    return;
  }

  els.userMessage.textContent = "User updated.";
  showToast(
    savedRole === "pending" ? "User saved" : "User updated",
    savedRole === "pending" ? `${name} remains pending.` : `${name} can now access the assigned role.`,
    "success"
  );
  const pill = row.querySelector(".pill");
  if (pill) {
    pill.textContent = roleLabel(savedRole);
    pill.className = `pill role-pill ${roleClass(savedRole)}`;
  }
  const summary = row.querySelector(".user-summary");
  if (summary) {
    summary.textContent = savedRole === "pending" ? "Waiting for GIU approval" : lab;
  }
  const displayName = row.querySelector(`[data-user-display-name="${cssEscape(userId)}"]`);
  if (displayName) {
    displayName.textContent = name;
  }
  row.classList.toggle("is-pending-user", savedRole === "pending");
  if (button) {
    button.disabled = false;
    button.textContent = savedRole === "pending" ? "Approve" : "Update";
  }
}

async function updateUserProfileDirect(userId, updates) {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before updating users."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${config.url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(updates),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: { message: body?.message || `Supabase returned ${response.status} while updating this user.` },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to update this user. Please retry once, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function removeUserProfile(userId) {
  const row = els.userList.querySelector(`[data-user-row="${cssEscape(userId)}"]`);
  if (!row) return;

  if (userId === currentUser?.id) {
    els.userMessage.textContent = "You cannot remove your own signed-in admin profile.";
    showToast("Remove blocked", "You cannot remove your own signed-in admin profile.", "warning");
    return;
  }

  const name = row.querySelector(`[data-user-name="${cssEscape(userId)}"]`)?.value?.trim() || "this user";
  const confirmed = window.confirm(`Remove ${name} from the GIU tracker? This removes their app access, but does not delete their Supabase Auth account.`);
  if (!confirmed) return;

  const buttons = row.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
  });
  els.userMessage.textContent = `Removing ${name}...`;

  const { error } = await deleteUserProfileDirect(userId);

  if (error) {
    els.userMessage.textContent = error.message;
    showToast("Remove failed", error.message, "warning");
    buttons.forEach((button) => {
      button.disabled = false;
    });
    return;
  }

  row.remove();
  els.userMessage.textContent = `${name} was removed from the tracker.`;
  showToast("User removed", `${name} no longer has tracker profile access.`, "success");
  if (!els.userList.querySelector(".user-row")) {
    els.userList.innerHTML = `<p class="empty-state compact-state">No user profiles found.</p>`;
  }
}

async function deleteUserProfileDirect(userId) {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before removing users."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${config.url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        Prefer: "return=minimal",
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: { message: body?.message || `Supabase returned ${response.status} while removing this user.` },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to remove this user. Please retry once, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function saveRequest() {
  if (!els.form.reportValidity()) return;

  const originalText = els.saveRequest.textContent;
  els.saveRequest.disabled = true;
  els.saveRequest.textContent = "Saving...";

  try {
    const id = els.requestId.value || crypto.randomUUID();
    const isExisting = Boolean(els.requestId.value);
    const record = {
      id,
      displayId: els.displayId.value.trim(),
      lab: els.labName.value.trim(),
      program: els.programName.value.trim(),
      project: els.projectName.value.trim(),
      requisitionerName: els.requisitionerName.value.trim(),
      requisitionerSection: els.requisitionerSection.value.trim(),
      requiredAssistance: els.requiredAssistance.value.trim(),
      stage: els.stageName.value,
      status: els.statusName.value,
      priority: els.priorityName.value,
      assignee: els.assigneeName.value.trim(),
      received: els.receivedDate.value,
      target: els.targetDate.value,
      updated: todayString(),
      notes: els.notesText.value.trim(),
      nextStep: els.nextStepText.value.trim(),
    };

    if (supabaseClient && !isExisting && record.displayId === suggestedDisplayId) {
      record.displayId = await reserveNextDisplayId();
      els.displayId.value = record.displayId;
    }

    if (hasDuplicateDisplayId(record.displayId, id)) {
      showToast(
        "Duplicate request ID",
        `${record.displayId} is already used. Use the suggested next request ID or choose a unique ID.`,
        "warning"
      );
      els.displayId.focus();
      return;
    }

    if (supabaseClient) {
      const saved = await saveSupabaseRequest(record, isExisting);
      if (!saved) return;
    } else {
      saveLocalRequest(record, id);
    }

    suggestedDisplayId = "";
    els.dialog.close();
    render();
  } finally {
    els.saveRequest.disabled = false;
    els.saveRequest.textContent = originalText;
  }
}

async function saveSupabaseRequest(record, isExisting) {
  const payload = toSupabaseRow(record);
  if (!isExisting && currentUser?.id) {
    payload.created_by = currentUser.id;
    payload.updated_by = currentUser.id;
  }

  const result = await saveSupabaseRequestDirect(payload, record.id, isExisting);

  if (result.error) {
    showToast("Save failed", result.error.message, "warning");
    return false;
  }

  upsertRequestInMemory(record);
  window.setTimeout(syncFromSupabase, 800);

  return true;
}

async function saveSupabaseRequestDirect(payload, requestId, isExisting) {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before saving."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  const url = isExisting
    ? `${config.url}/rest/v1/giu_requests?id=eq.${encodeURIComponent(requestId)}`
    : `${config.url}/rest/v1/giu_requests`;

  try {
    const response = await fetch(url, {
      method: isExisting ? "PATCH" : "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: { message: body?.message || `Supabase returned ${response.status} while saving this request.` },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to save this request. Please retry once, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function upsertRequestInMemory(record) {
  const index = requests.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    requests[index] = record;
  } else {
    requests.unshift(record);
  }
}

function saveLocalRequest(record, id) {
  upsertRequestInMemory(record);
  persistLocal();
}

async function deleteRequest() {
  await deleteRequestById(els.requestId.value);
}

async function deleteRequestById(id) {
  const item = requests.find((request) => request.id === id);
  if (!id || !item) return;
  if (!canDeleteRequests()) return;

  const confirmed = window.confirm(`Delete ${item.displayId} - ${item.project}? This removes the request from the work queue.`);
  if (!confirmed) return;

  if (supabaseClient) {
    const { error } = await deleteSupabaseRequestDirect(id);
    if (error) {
      showToast("Delete failed", error.message, "warning");
      return;
    }
    requests = requests.filter((request) => request.id !== id);
    window.setTimeout(syncFromSupabase, 800);
  } else {
    requests = requests.filter((item) => item.id !== id);
    persistLocal();
  }

  if (els.dialog.open) {
    els.dialog.close();
  }
  render();
}

async function deleteSupabaseRequestDirect(id) {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before deleting."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return {
      error: tokenResult.error || { message: "No active Supabase session was found. Please sign in again." },
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${config.url}/rest/v1/giu_requests?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        Prefer: "return=minimal",
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: { message: body?.message || `Supabase returned ${response.status} while deleting this request.` },
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to delete this request. Please retry once, or sign out and sign back in if the app was idle."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function resetData() {
  requests = sampleRequests.map((item) => ({ ...item, id: crypto.randomUUID() }));
  persistLocal();
  render();
}

async function handleAuthButton() {
  if (!supabaseClient) {
    showToast(
      "Supabase not configured",
      "Add your project URL and anon key in supabase-config.js.",
      "warning"
    );
    return;
  }

  if (currentUser) {
    els.authButton.disabled = true;
    const { error } = await withTimeout(
      supabaseClient.auth.signOut(),
      2500,
      "Supabase sign out took too long."
    );
    els.authButton.disabled = false;
    if (error) {
      showToast("Sign out issue", error.message, "warning");
    } else {
      showToast("Signed out", "Your session has ended.", "signed-out");
    }
    clearSignedInState();
    return;
  }

  els.authEmail.value = "";
  els.authPassword.value = "";
  els.authName.value = "";
  els.authMessage.textContent = "";
  setAuthMode("sign-in");
  els.authDialog.showModal();
}

function closeAuthDialog() {
  els.authForm.reset();
  els.authMessage.textContent = "";
  els.authDialog.close();
}

function setAuthMode(mode) {
  const isCreate = mode === "create";
  els.authTitle.textContent = isCreate ? "Create GIU Tracker Account" : "GIU Tracker Sign In";
  els.authCopy.textContent = isCreate
    ? "Create an account, then wait for GIU approval before request records are shown."
    : "Sign in with your registered email and password.";
  els.authModeSignIn.classList.toggle("active", !isCreate);
  els.authModeCreate.classList.toggle("active", isCreate);
  els.authNameLabel.classList.toggle("hidden", !isCreate);
  els.passwordSignIn.classList.toggle("hidden", isCreate);
  els.createAccount.classList.toggle("hidden", !isCreate);
  els.authPassword.autocomplete = isCreate ? "new-password" : "current-password";
  els.authMessage.textContent = "";
}

async function passwordSignIn() {
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;

  if (!email || !password) {
    els.authMessage.textContent = "Enter both email and password.";
    showToast("Sign in incomplete", "Enter both email and password.", "warning");
    return;
  }

  els.authMessage.textContent = "Signing in...";
  els.passwordSignIn.disabled = true;
  const { error } = await withTimeout(
    supabaseClient.auth.signInWithPassword({ email, password }),
    8000,
    "Supabase took too long to sign in. Please retry once."
  );
  els.passwordSignIn.disabled = false;

  if (error) {
    els.authMessage.textContent = error.message;
    showToast("Sign in failed", error.message, "warning");
    return;
  }

  await ensurePendingProfile();
  els.authDialog.close();
  showToast("Signed in", "Your GIU tracker session is active.", "signed-in");
}

async function createAccount() {
  const fullName = els.authName.value.trim();
  const email = els.authEmail.value.trim();
  const password = els.authPassword.value;

  if (!fullName) {
    els.authMessage.textContent = "Enter your full name so the GIU admin can identify your account.";
    showToast("Name needed", "Enter your full name so GIU can approve the correct account.", "warning");
    return;
  }

  if (!email) {
    els.authMessage.textContent = "Enter an email address first.";
    showToast("Email needed", "Enter an email address first.", "warning");
    return;
  }

  if (!password || password.length < 8) {
    els.authMessage.textContent = "Use a password with at least 8 characters.";
    showToast("Password too short", "Use a password with at least 8 characters.", "warning");
    return;
  }

  els.authMessage.textContent = "Creating account...";
  els.createAccount.disabled = true;
  const { data, error } = await withTimeout(
    supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        data: { full_name: fullName },
      },
    }),
    8000,
    "Supabase took too long to create this account. Please retry once."
  );
  els.createAccount.disabled = false;

  if (error) {
    els.authMessage.textContent = error.message;
    showToast("Account creation failed", error.message, "warning");
    return;
  }

  if (data.session) {
    await ensurePendingProfile();
    els.authDialog.close();
    showToast("Account created", "Your account is pending GIU approval.", "success");
  } else {
    els.authMessage.textContent = "Account created. Check your email to confirm, then sign in.";
    showToast("Account created", "Check your email to confirm, then sign in.", "success");
  }
}

async function ensurePendingProfile() {
  const { data } = await withTimeout(
    supabaseClient.auth.getUser(),
    4000,
    "Supabase took too long to check this user."
  );
  const user = data?.user;
  if (!user) return;

  const { data: existing } = await withTimeout(
    supabaseClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle(),
    5000,
    "Supabase took too long to check this profile."
  );

  if (existing) return;

  const nameFromForm = els.authName?.value?.trim();
  const nameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.name;

  await withTimeout(
    supabaseClient.from("profiles").insert({
      id: user.id,
      full_name: nameFromForm || nameFromMetadata || user.email,
      lab: "Pending assignment",
      role: "pending",
    }),
    5000,
    "Supabase took too long to create this profile."
  );
}

function fromSupabaseRow(row) {
  return {
    id: row.id,
    displayId: row.display_id,
    lab: row.lab,
    program: row.program,
    project: row.project,
    requisitionerName: row.requisitioner_name || "",
    requisitionerSection: row.requisitioner_section || "",
    requiredAssistance: row.required_assistance || "",
    stage: row.stage,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    received: row.received,
    target: row.target,
    updated: row.updated,
    notes: row.notes,
    nextStep: row.next_step,
  };
}

function toSupabaseRow(record) {
  return {
    id: record.id,
    display_id: record.displayId,
    lab: record.lab,
    program: record.program,
    project: record.project,
    requisitioner_name: record.requisitionerName,
    requisitioner_section: record.requisitionerSection,
    required_assistance: record.requiredAssistance,
    stage: record.stage,
    status: record.status,
    priority: record.priority,
    assignee: record.assignee,
    received: record.received,
    target: record.target,
    updated: record.updated,
    notes: record.notes,
    next_step: record.nextStep,
  };
}

function fillSelect(select, values, allLabel = null) {
  const options = allLabel ? [allLabel, ...values] : values;
  select.innerHTML = options.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function hasOption(select, value) {
  return [...select.options].some((option) => option.value === value);
}

function setSelectValue(select, value) {
  if (!select) return;
  const normalized = value || "";
  if (normalized && !hasOption(select, normalized)) {
    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHtml(normalized)}">${escapeHtml(normalized)}</option>`
    );
  }
  select.value = normalized;
}

function matches(filterValue, itemValue) {
  return !filterValue || filterValue === "All" || filterValue === itemValue;
}

function stageProgress(stage) {
  const index = stages.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / stages.length) * 100);
}

function nextDisplayId() {
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^GIU-${year}-(\\d+)$`);
  const highest = requests.reduce((max, item) => {
    const match = pattern.exec(item.displayId || "");
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `GIU-${year}-${String(highest + 1).padStart(3, "0")}`;
}

async function reserveNextDisplayId() {
  if (supabaseClient) {
    const reserved = await reserveDisplayIdDirect(new Date().getFullYear());
    if (reserved.data) return reserved.data;
  }

  return nextDisplayId();
}

async function reserveDisplayIdDirect(year) {
  const config = window.GIU_SUPABASE_CONFIG;
  const tokenResult = await getAccessToken(
    "No active Supabase session was found. Please sign in again before creating a request ID."
  );
  const token = tokenResult.token;
  if (!config?.url || !config?.anonKey || !token) {
    return { data: "", error: tokenResult.error || { message: "No active Supabase session was found." } };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/reserve_giu_display_id`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target_year: year }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: "",
        error: { message: body?.message || `Supabase returned ${response.status} while reserving a request ID.` },
      };
    }

    return { data: typeof body === "string" ? body : "", error: null };
  } catch (error) {
    return {
      data: "",
      error: {
        message: error.name === "AbortError"
          ? "Supabase took too long to reserve a request ID."
          : error.message,
      },
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function hasDuplicateDisplayId(displayId, currentId = "") {
  const normalized = displayId.trim().toLowerCase();
  return requests.some((item) => item.id !== currentId && item.displayId.toLowerCase() === normalized);
}

function stageProgressClass(stage) {
  const progress = stageProgress(stage);
  if (progress >= 100) return "progress-complete";
  if (progress >= 75) return "progress-high";
  if (progress >= 45) return "progress-mid";
  return "progress-low";
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function priorityClass(priority) {
  return `priority-${priority.toLowerCase()}`;
}

function labClassName(lab) {
  return labColorClassMap.get(lab) || "lab-default";
}

function dueState(item) {
  if (item.status === "Completed") {
    return {
      label: `Completed ${formatDate(item.updated)}`,
      className: "due-complete",
      rowClass: "is-complete",
    };
  }

  const days = dayDiff(todayString(), item.target);

  if (!Number.isFinite(days)) {
    return {
      label: "No target date",
      className: "due-neutral",
      rowClass: "",
    };
  }

  if (days < 0) {
    return {
      label: `${Math.abs(days)}d overdue`,
      className: "due-overdue",
      rowClass: "is-overdue",
    };
  }

  if (days <= 3) {
    return {
      label: `Due in ${days}d`,
      className: "due-soon",
      rowClass: "is-due-soon",
    };
  }

  return {
    label: `Target ${formatDate(item.target)}`,
    className: "due-ok",
    rowClass: "",
  };
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function dayDiff(start, end) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate - startDate) / 86400000);
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cssEscape(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/["\\]/g, "\\$&");
}

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => resolve({ error: { message } }), timeoutMs);
  });

  return Promise.race([promise, timeout])
    .catch((error) => ({ error: { message: error.message || message } }))
    .finally(() => window.clearTimeout(timeoutId));
}
