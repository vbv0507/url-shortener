const authView = document.getElementById("auth-view");
const dashboardView = document.getElementById("dashboard-view");
const welcomeUser = document.getElementById("welcome-user");
const logoutButton = document.getElementById("logout-button");

const signupTab = document.getElementById("signup-tab");
const loginTab = document.getElementById("login-tab");
const panelWrap = document.querySelector(".panel-wrap");
const signupPanel = document.getElementById("signup-panel");
const loginPanel = document.getElementById("login-panel");

const signupForm = document.getElementById("signup-form");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupUserId = document.getElementById("signup-userid");
const signupPassword = document.getElementById("signup-password");
const signupStatus = document.getElementById("signup-status");

const loginForm = document.getElementById("login-form");
const loginIdentifier = document.getElementById("login-identifier");
const loginPassword = document.getElementById("login-password");
const loginStatus = document.getElementById("login-status");

const shortenForm = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const aliasInput = document.getElementById("alias-input");
const expiryInput = document.getElementById("expiry-input");
const expirySummary = document.getElementById("expiry-summary");
const expiryOptionButtons = document.querySelectorAll("[data-expiry-option]");
const shortenStatus = document.getElementById("shorten-status");
const shortenResult = document.getElementById("shorten-result");
const shortLink = document.getElementById("short-link");
const originalUrl = document.getElementById("original-url");
const shortIdOutput = document.getElementById("short-id-output");
const expiryOutput = document.getElementById("expiry-output");
const openLink = document.getElementById("open-link");
const copyLink = document.getElementById("copy-link");
const useForAnalytics = document.getElementById("use-for-analytics");
const totalLinksStat = document.getElementById("total-links-stat");
const totalClicksStat = document.getElementById("total-clicks-stat");
const popularLinkStat = document.getElementById("popular-link-stat");
const savedLinksEmpty = document.getElementById("saved-links-empty");
const savedLinksList = document.getElementById("saved-links-list");

const analyticsForm = document.getElementById("analytics-form");
const analyticsInput = document.getElementById("analytics-input");
const analyticsStatus = document.getElementById("analytics-status");
const analyticsResult = document.getElementById("analytics-result");
const analyticsPath = document.getElementById("analytics-path");
const analyticsClicks = document.getElementById("analytics-clicks");
const analyticsOpenLink = document.getElementById("analytics-open-link");
const analyticsCopyLink = document.getElementById("analytics-copy-link");
const analyticsJson = document.getElementById("analytics-json");
const analyticsHistory = document.getElementById("analytics-history");
const analyticsEmpty = document.getElementById("analytics-empty");

let createdLinks = readStoredList("portal_created_links");
let linkClicks = readStoredMap("portal_link_clicks");
let createdLinkRecords = readStoredList("portal_created_link_records");
let latestShortId =
  createdLinks[createdLinks.length - 1] ||
  createdLinkRecords[createdLinkRecords.length - 1]?.shortId ||
  "";

function setStatus(element, message, state) {
  element.textContent = message;
  element.className = state ? `status ${state}` : "status";
}

function activatePanel(panelName) {
  const showSignup = panelName === "signup";

  signupTab.classList.toggle("active", showSignup);
  signupTab.setAttribute("aria-selected", String(showSignup));
  signupPanel.classList.toggle("active", showSignup);

  loginTab.classList.toggle("active", !showSignup);
  loginTab.setAttribute("aria-selected", String(!showSignup));
  loginPanel.classList.toggle("active", !showSignup);

  syncPanelHeight();
}

function showView(viewName) {
  const showDashboard = viewName === "dashboard";

  authView.hidden = showDashboard;
  dashboardView.hidden = !showDashboard;

  sessionStorage.setItem("portal_view", showDashboard ? "dashboard" : "auth");

  if (showDashboard) {
    const savedUser = sessionStorage.getItem("portal_user") || "User";
    welcomeUser.textContent = savedUser;
    renderDashboardStats();
    renderSavedLinks();
  }
}

function isRedirectTarget(response, routeName) {
  try {
    const url = new URL(response.url);
    return response.redirected && url.pathname === routeName;
  } catch (error) {
    return false;
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

function readStoredList(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function readStoredMap(key) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveDashboardState() {
  sessionStorage.setItem("portal_created_links", JSON.stringify(createdLinks));
  sessionStorage.setItem("portal_link_clicks", JSON.stringify(linkClicks));
  sessionStorage.setItem("portal_created_link_records", JSON.stringify(createdLinkRecords));
}

function getExpiryText(expiresAt) {
  if (!expiresAt) {
    return "No expiry";
  }

  const expiryDate = new Date(expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    return "";
  }

  return `Expires ${expiryDate.toLocaleString()}`;
}

function normalizeAlias(value) {
  return value.toLowerCase().trim().replace(/\s+/g, "-");
}

function getPresetExpiry(option) {
  if (option === "never") {
    return null;
  }

  const expiryDate = new Date();

  if (option === "1d") {
    expiryDate.setDate(expiryDate.getDate() + 1);
  }

  if (option === "7d") {
    expiryDate.setDate(expiryDate.getDate() + 7);
  }

  if (option === "30d") {
    expiryDate.setDate(expiryDate.getDate() + 30);
  }

  return expiryDate;
}

function selectExpiryOption(selectedButton) {
  expiryOptionButtons.forEach((button) => {
    const isActive = button === selectedButton;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const expiryDate = getPresetExpiry(selectedButton.dataset.expiryOption);

  if (!expiryDate) {
    expiryInput.value = "";
    expirySummary.textContent = "Permanent";
    return;
  }

  expiryInput.value = expiryDate.toISOString();
  expirySummary.textContent = expiryDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function setShortenBusy(isBusy) {
  const submitButton = shortenForm.querySelector(".submit-button");
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? "Generating..." : "Generate Short URL";
}

function syncPanelHeight() {
  panelWrap.style.height = "auto";
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

function getShortId(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const segments = parsed.pathname.split("/").filter(Boolean);
      return segments[segments.length - 1] || "";
    } catch (error) {
      return "";
    }
  }

  const segments = trimmed.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
}

function getShortUrl(shortId) {
  return `${window.location.origin}/${shortId}`;
}

function getShortDisplayUrl(shortId) {
  return `${window.location.host}/${shortId}`;
}

function formatDateLabel(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMostPopularShortId() {
  if (createdLinks.length === 0) {
    return "";
  }

  let bestShortId = createdLinks[createdLinks.length - 1];
  let bestClicks = Number(linkClicks[bestShortId]) || 0;

  createdLinks.forEach((shortId) => {
    const clicks = Number(linkClicks[shortId]) || 0;
    if (clicks > bestClicks) {
      bestShortId = shortId;
      bestClicks = clicks;
    }
  });

  return bestShortId;
}

function renderDashboardStats() {
  const totalClicks = Object.values(linkClicks).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const popularShortId = getMostPopularShortId();

  totalLinksStat.textContent = String(createdLinks.length);
  totalClicksStat.textContent = String(totalClicks);

  if (popularShortId) {
    popularLinkStat.textContent = getShortDisplayUrl(popularShortId);
    popularLinkStat.title = getShortUrl(popularShortId);
  } else {
    popularLinkStat.textContent = "No data yet";
    popularLinkStat.removeAttribute("title");
  }
}

function upsertCreatedLinkRecord(record) {
  if (!record || !record.shortId) {
    return;
  }

  const nextRecord = {
    shortId: record.shortId,
    shortUrl: record.shortUrl || getShortUrl(record.shortId),
    originalUrl: record.originalUrl || "",
    expiresAt: record.expiresAt || null,
    createdAt: record.createdAt || new Date().toISOString(),
  };

  const existingIndex = createdLinkRecords.findIndex((item) => item.shortId === nextRecord.shortId);

  if (existingIndex >= 0) {
    createdLinkRecords[existingIndex] = {
      ...createdLinkRecords[existingIndex],
      ...nextRecord,
    };
    return;
  }

  createdLinkRecords.push(nextRecord);
}

function syncCreatedLinkRecords() {
  let changed = false;

  createdLinks.forEach((shortId) => {
    const exists = createdLinkRecords.some((record) => record.shortId === shortId);

    if (!exists) {
      upsertCreatedLinkRecord({
        shortId,
        shortUrl: getShortUrl(shortId),
      });
      changed = true;
    }
  });

  if (changed) {
    saveDashboardState();
  }
}

function rememberCreatedLink(shortId, details = {}) {
  if (!shortId) {
    return;
  }

  latestShortId = shortId;

  if (!createdLinks.includes(shortId)) {
    createdLinks.push(shortId);
  }

  upsertCreatedLinkRecord({
    shortId,
    shortUrl: details.shortUrl,
    originalUrl: details.originalUrl,
    expiresAt: details.expiresAt,
    createdAt: details.createdAt,
  });

  saveDashboardState();
  renderDashboardStats();
  renderSavedLinks();
}

function rememberAnalytics(shortId, totalClicks) {
  if (!shortId) {
    return;
  }

  if (!createdLinks.includes(shortId)) {
    createdLinks.push(shortId);
  }

  linkClicks[shortId] = Number(totalClicks) || 0;
  saveDashboardState();
  renderDashboardStats();
}

function createSavedLinkItem(record) {
  const item = document.createElement("article");
  item.className = "saved-link-item";

  const createdLabel = formatDateLabel(record.createdAt);
  const expiryLabel = getExpiryText(record.expiresAt);

  const top = document.createElement("div");
  top.className = "saved-link-top";

  const idBadge = document.createElement("span");
  idBadge.className = "saved-link-id";
  idBadge.textContent = `/${record.shortId}`;

  const time = document.createElement("span");
  time.className = "saved-link-time";
  time.textContent = createdLabel ? `Created ${createdLabel}` : "Saved link";

  top.append(idBadge, time);

  const shortLinkNode = document.createElement("a");
  shortLinkNode.className = "saved-link-short";
  shortLinkNode.href = record.shortUrl;
  shortLinkNode.target = "_blank";
  shortLinkNode.rel = "noreferrer";
  shortLinkNode.textContent = record.shortUrl;

  const original = document.createElement("p");
  original.className = "saved-link-original";
  original.textContent = record.originalUrl
    ? `Original: ${record.originalUrl}`
    : "Original URL unavailable";

  const meta = document.createElement("div");
  meta.className = "saved-link-meta";

  const expiryChip = document.createElement("span");
  expiryChip.className = "meta-chip";
  expiryChip.textContent = expiryLabel;
  meta.appendChild(expiryChip);

  const actions = document.createElement("div");
  actions.className = "actions saved-link-actions";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "secondary-button";
  copyButton.dataset.linkAction = "copy";
  copyButton.dataset.linkUrl = record.shortUrl;
  copyButton.textContent = "Copy Link";

  const openButton = document.createElement("a");
  openButton.className = "button-link";
  openButton.href = record.shortUrl;
  openButton.target = "_blank";
  openButton.rel = "noreferrer";
  openButton.textContent = "Open";

  const analyticsButton = document.createElement("button");
  analyticsButton.type = "button";
  analyticsButton.className = "secondary-button";
  analyticsButton.dataset.linkAction = "analytics";
  analyticsButton.dataset.shortId = record.shortId;
  analyticsButton.textContent = "Analytics";

  actions.append(copyButton, openButton, analyticsButton);
  item.append(top, shortLinkNode, original, meta, actions);

  return item;
}

function renderSavedLinks() {
  syncCreatedLinkRecords();
  const records = createdLinkRecords.slice().reverse();

  savedLinksList.innerHTML = "";

  if (records.length === 0) {
    savedLinksEmpty.hidden = false;
    savedLinksList.hidden = true;
    return;
  }

  savedLinksEmpty.hidden = true;
  savedLinksList.hidden = false;

  records.forEach((record) => {
    savedLinksList.appendChild(createSavedLinkItem(record));
  });
}

function renderAnalytics(shortId, data) {
  const history = Array.isArray(data.analytics) ? data.analytics.slice().reverse() : [];
  const shortUrl = getShortUrl(shortId);

  analyticsPath.textContent = getShortDisplayUrl(shortId);
  analyticsClicks.textContent = String(data.totalClicks || 0);
  analyticsOpenLink.href = shortUrl;
  analyticsJson.href = `/api/url/analytics/${shortId}`;
  analyticsHistory.innerHTML = "";

  if (history.length === 0) {
    analyticsEmpty.hidden = false;
  } else {
    analyticsEmpty.hidden = true;
    history.forEach((entry) => {
      const item = document.createElement("li");
      item.textContent = entry.timestamp;
      analyticsHistory.appendChild(item);
    });
  }

  analyticsResult.hidden = false;
  rememberAnalytics(shortId, data.totalClicks || 0);
}

async function loadAnalytics(shortId) {
  setStatus(analyticsStatus, "Loading analytics...", "");

  const response = await fetch(`/api/url/analytics/${shortId}`);
  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Unable to fetch analytics right now.");
  }

  renderAnalytics(shortId, data);
  setStatus(analyticsStatus, "Analytics loaded.", "success");
}

signupTab.addEventListener("click", () => {
  activatePanel("signup");
  signupName.focus();
});

loginTab.addEventListener("click", () => {
  activatePanel("login");
  loginIdentifier.focus();
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!signupForm.reportValidity()) {
    setStatus(signupStatus, "Please complete all required fields.", "error");
    return;
  }

  setStatus(signupStatus, "Creating account...", "");

  try {
    const payload = {
      name: signupName.value.trim(),
      email: signupEmail.value.trim(),
      user_id: signupUserId.value.trim(),
      password: signupPassword.value,
    };

    const response = await fetch("/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await readJson(response);
    const signupSucceeded =
      response.ok ||
      isRedirectTarget(response, "/login") ||
      data.message === "User created";

    if (!signupSucceeded) {
      throw new Error(data.message || "Unable to complete signup right now.");
    }

    setStatus(signupStatus, "Account created. Please sign in.", "success");
    loginIdentifier.value = payload.email || payload.user_id;
    loginPassword.value = "";
    activatePanel("login");
    loginIdentifier.focus();
  } catch (error) {
    setStatus(signupStatus, error.message || "Unable to create account.", "error");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!loginForm.reportValidity()) {
    setStatus(loginStatus, "Please enter your credentials.", "error");
    return;
  }

  setStatus(loginStatus, "Signing in...", "");

  try {
    const identifier = loginIdentifier.value.trim();

    const response = await fetch("/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: identifier,
        user_id: identifier,
        password: loginPassword.value,
      })
    });

    const data = await readJson(response);
    const loginSucceeded =
      response.ok ||
      isRedirectTarget(response, "/home") ||
      data.message === "Login successful";

    if (!loginSucceeded) {
      throw new Error(data.message || "Unable to log in right now.");
    }

    sessionStorage.setItem("portal_view", "dashboard");
    sessionStorage.setItem("portal_user", identifier);
    setStatus(loginStatus, "Signed in successfully.", "success");
    window.location.href = "/";
  } catch (error) {
    setStatus(loginStatus, error.message || "Unable to sign in.", "error");
  }
});

aliasInput.addEventListener("input", () => {
  const normalizedAlias = normalizeAlias(aliasInput.value);

  if (aliasInput.value !== normalizedAlias) {
    aliasInput.value = normalizedAlias;
  }
});

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!shortenForm.reportValidity()) {
    setStatus(shortenStatus, "Enter a valid URL.", "error");
    return;
  }

  const longUrl = urlInput.value.trim();
  const alias = normalizeAlias(aliasInput.value);
  const expiryValue = expiryInput.value;
  setStatus(shortenStatus, "Creating short URL...", "");
  setShortenBusy(true);

  try {
    const payload = { url: longUrl };

    if (alias) {
      payload.alias = alias;
    }

    if (expiryValue) {
      payload.expiresAt = expiryValue;
    }

    const response = await fetch("/api/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data.error || "Unable to shorten this URL right now.");
    }

    latestShortId = data.id;
    const createdUrl = data.shortUrl || `${window.location.origin}/${data.id}`;

    rememberCreatedLink(data.id, {
      shortUrl: createdUrl,
      originalUrl: longUrl,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    });
    shortLink.href = createdUrl;
    shortLink.textContent = createdUrl;
    openLink.href = createdUrl;
    originalUrl.textContent = `Destination: ${longUrl}`;
    shortIdOutput.textContent = `Short ID: ${data.id}`;
    expiryOutput.textContent = getExpiryText(data.expiresAt);
    analyticsInput.value = createdUrl;
    shortenResult.hidden = false;
    setStatus(shortenStatus, "Short URL created.", "success");
  } catch (error) {
    setStatus(shortenStatus, error.message || "Unable to create short URL.", "error");
  } finally {
    setShortenBusy(false);
  }
});

expiryOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectExpiryOption(button);
  });
});

savedLinksList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-link-action]");

  if (!actionButton) {
    return;
  }

  if (actionButton.dataset.linkAction === "copy") {
    try {
      await copyText(actionButton.dataset.linkUrl || "");
      setStatus(shortenStatus, "Short URL copied.", "success");
    } catch (error) {
      setStatus(shortenStatus, "Unable to copy link automatically.", "error");
    }
    return;
  }

  if (actionButton.dataset.linkAction === "analytics") {
    const shortId = actionButton.dataset.shortId || "";

    analyticsInput.value = getShortUrl(shortId);

    try {
      await loadAnalytics(shortId);
    } catch (error) {
      setStatus(analyticsStatus, error.message || "Unable to load analytics.", "error");
    }
  }
});

analyticsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const shortId = getShortId(analyticsInput.value);

  if (!shortId) {
    setStatus(analyticsStatus, "Enter a valid short ID or short URL.", "error");
    return;
  }

  try {
    await loadAnalytics(shortId);
  } catch (error) {
    setStatus(analyticsStatus, error.message || "Unable to load analytics.", "error");
  }
});

copyLink.addEventListener("click", async () => {
  try {
    await copyText(shortLink.href);
    setStatus(shortenStatus, "Short URL copied.", "success");
  } catch (error) {
    setStatus(shortenStatus, "Unable to copy link automatically.", "error");
  }
});

analyticsCopyLink.addEventListener("click", async () => {
  try {
    await copyText(analyticsOpenLink.href);
    setStatus(analyticsStatus, "Short URL copied.", "success");
  } catch (error) {
    setStatus(analyticsStatus, "Unable to copy link automatically.", "error");
  }
});

useForAnalytics.addEventListener("click", async () => {
  if (!latestShortId) {
    setStatus(analyticsStatus, "Create a short URL first.", "error");
    return;
  }

  analyticsInput.value = `${window.location.origin}/${latestShortId}`;

  try {
    await loadAnalytics(latestShortId);
  } catch (error) {
    setStatus(analyticsStatus, error.message || "Unable to load analytics.", "error");
  }
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("portal_view");
  sessionStorage.removeItem("portal_user");
  window.location.href = "/user/logout";
});

if (sessionStorage.getItem("portal_view") === "dashboard") {
  showView("dashboard");
} else {
  showView("auth");
  activatePanel("signup");
}

renderSavedLinks();
syncPanelHeight();
window.addEventListener("load", syncPanelHeight);
window.addEventListener("resize", syncPanelHeight);
