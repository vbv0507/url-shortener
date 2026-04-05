const shortenForm = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const shortenStatus = document.getElementById("shorten-status");
const shortenResult = document.getElementById("shorten-result");
const shortLink = document.getElementById("short-link");
const originalUrl = document.getElementById("original-url");
const openLink = document.getElementById("open-link");
const copyLink = document.getElementById("copy-link");
const useForAnalytics = document.getElementById("use-for-analytics");

const analyticsForm = document.getElementById("analytics-form");
const analyticsInput = document.getElementById("analytics-input");
const analyticsStatus = document.getElementById("analytics-status");
const analyticsResult = document.getElementById("analytics-result");
const analyticsPath = document.getElementById("analytics-path");
const analyticsClicks = document.getElementById("analytics-clicks");
const analyticsJson = document.getElementById("analytics-json");
const analyticsHistory = document.getElementById("analytics-history");
const analyticsEmpty = document.getElementById("analytics-empty");

let latestShortId = "";

function setStatus(element, message, state) {
  element.textContent = message;
  element.className = state ? `status ${state}` : "status";
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

function renderAnalytics(shortId, data) {
  const history = Array.isArray(data.analytics) ? data.analytics.slice().reverse() : [];

  analyticsPath.textContent = `/url/${shortId}`;
  analyticsClicks.textContent = String(data.totalClicks || 0);
  analyticsJson.href = `/url/analytics/${shortId}`;
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
}

async function loadAnalytics(shortId) {
  setStatus(analyticsStatus, "Fetching analytics...", "");

  const response = await fetch(`/url/analytics/${shortId}`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to fetch analytics right now.");
  }

  renderAnalytics(shortId, data);
  setStatus(analyticsStatus, "Analytics loaded successfully.", "success");
}

shortenForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!shortenForm.reportValidity()) {
    setStatus(shortenStatus, "Enter a valid URL before submitting.", "error");
    return;
  }

  const longUrl = urlInput.value.trim();
  setStatus(shortenStatus, "Generating short URL...", "");

  try {
    const response = await fetch("/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: longUrl })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Unable to shorten this URL right now.");
    }

    latestShortId = data.id;
    const createdUrl = `${window.location.origin}/url/${data.id}`;

    shortLink.href = createdUrl;
    shortLink.textContent = createdUrl;
    openLink.href = createdUrl;
    originalUrl.textContent = `Original: ${longUrl}`;
    analyticsInput.value = createdUrl;
    shortenResult.hidden = false;
    setStatus(shortenStatus, "Short URL created successfully.", "success");
  } catch (error) {
    setStatus(shortenStatus, error.message || "Something went wrong while creating the short URL.", "error");
  }
});

analyticsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const shortId = getShortId(analyticsInput.value);

  if (!shortId) {
    setStatus(analyticsStatus, "Please enter a valid short id or short URL.", "error");
    return;
  }

  try {
    await loadAnalytics(shortId);
  } catch (error) {
    setStatus(analyticsStatus, error.message || "Unable to fetch analytics right now.", "error");
  }
});

copyLink.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shortLink.href);
    setStatus(shortenStatus, "Short URL copied to clipboard.", "success");
  } catch (error) {
    setStatus(shortenStatus, "Could not copy automatically. You can still copy the link manually.", "error");
  }
});

useForAnalytics.addEventListener("click", async () => {
  if (!latestShortId) {
    setStatus(analyticsStatus, "Create a short URL first.", "error");
    return;
  }

  analyticsInput.value = `${window.location.origin}/url/${latestShortId}`;

  try {
    await loadAnalytics(latestShortId);
  } catch (error) {
    setStatus(analyticsStatus, error.message || "Unable to fetch analytics right now.", "error");
  }
});
