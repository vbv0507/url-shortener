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
const shortenStatus = document.getElementById("shorten-status");
const shortenResult = document.getElementById("shorten-result");
const shortLink = document.getElementById("short-link");
const originalUrl = document.getElementById("original-url");
const openLink = document.getElementById("open-link");
const copyLink = document.getElementById("copy-link");
const useForAnalytics = document.getElementById("use-for-analytics");
const totalLinksStat = document.getElementById("total-links-stat");
const totalClicksStat = document.getElementById("total-clicks-stat");
const popularLinkStat = document.getElementById("popular-link-stat");

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
let latestShortId = createdLinks[createdLinks.length - 1] || "";

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

function rememberCreatedLink(shortId) {
  if (!shortId) {
    return;
  }

  latestShortId = shortId;

  if (!createdLinks.includes(shortId)) {
    createdLinks.push(shortId);
  }

  saveDashboardState();
  renderDashboardStats();
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

function renderAnalytics(shortId, data) {
  const history = Array.isArray(data.analytics) ? data.analytics.slice().reverse() : [];
  const shortUrl = getShortUrl(shortId);

  analyticsPath.textContent = getShortDisplayUrl(shortId);
  analyticsClicks.textContent = String(data.totalClicks || 0);
  analyticsOpenLink.href = shortUrl;
  analyticsJson.href = `/analytics/${shortId}`;
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

  const response = await fetch(`/analytics/${shortId}`);
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

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!shortenForm.reportValidity()) {
    setStatus(shortenStatus, "Enter a valid URL.", "error");
    return;
  }

  const longUrl = urlInput.value.trim();
  setStatus(shortenStatus, "Creating short URL...", "");

  try {
    const response = await fetch("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: longUrl })
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data.error || "Unable to shorten this URL right now.");
    }

    latestShortId = data.id;
    const createdUrl = `${window.location.origin}/${data.id}`;

    shortLink.href = createdUrl;
    shortLink.textContent = createdUrl;
    openLink.href = createdUrl;
    originalUrl.textContent = `Original: ${longUrl}`;
    analyticsInput.value = createdUrl;
    shortenResult.hidden = false;
    setStatus(shortenStatus, "Short URL created.", "success");
  } catch (error) {
    setStatus(shortenStatus, error.message || "Unable to create short URL.", "error");
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

syncPanelHeight();
window.addEventListener("load", syncPanelHeight);
window.addEventListener("resize", syncPanelHeight);
