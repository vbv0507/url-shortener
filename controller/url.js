const { nanoid } = require("nanoid");
const { URL: NodeURL } = require("node:url");
const ShortUrl = require("../model/url");
const QRCode = require("qrcode");

const MAX_REDIRECT_URL_LENGTH = 4096;

function isPrivateIpv4(hostname) {
  const parts = hostname.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const numbers = parts.map((part) => Number(part));

  if (numbers.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  if (numbers[0] === 10) {
    return true;
  }

  if (numbers[0] === 0) {
    return true;
  }

  if (numbers[0] === 127) {
    return true;
  }

  if (numbers[0] === 169 && numbers[1] === 254) {
    return true;
  }

  if (numbers[0] === 172 && numbers[1] >= 16 && numbers[1] <= 31) {
    return true;
  }

  if (numbers[0] === 192 && numbers[1] === 168) {
    return true;
  }

  return false;
}

function isPrivateHostname(hostname) {
  const normalizedHostname = hostname.toLowerCase();

  if (normalizedHostname === "localhost" || normalizedHostname === "::1") {
    return true;
  }

  if (
    normalizedHostname.includes(":") &&
    (
      normalizedHostname.startsWith("fc") ||
      normalizedHostname.startsWith("fd") ||
      normalizedHostname.startsWith("fe80:")
    )
  ) {
    return true;
  }

  return isPrivateIpv4(normalizedHostname);
}

function normalizeRedirectUrl(rawUrl) {
  const trimmedUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";

  if (!trimmedUrl) {
    return { error: "url is required" };
  }

  if (trimmedUrl.length > MAX_REDIRECT_URL_LENGTH) {
    return { error: "URL is too long" };
  }

  if (/[\u0000-\u001F\u007F]/.test(trimmedUrl)) {
    return { error: "URL contains invalid characters" };
  }

  let parsedUrl;

  try {
    parsedUrl = new NodeURL(trimmedUrl);
  } catch (error) {
    return { error: "Invalid URL. Include http:// or https://" };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return { error: "Only http and https URLs are allowed" };
  }

  if (parsedUrl.username || parsedUrl.password) {
    return { error: "URLs with embedded credentials are not allowed" };
  }

  if (!parsedUrl.hostname) {
    return { error: "Invalid URL hostname" };
  }

  parsedUrl.hostname = parsedUrl.hostname.toLowerCase();

  if (isPrivateHostname(parsedUrl.hostname)) {
    return { error: "Local or private network URLs are not allowed" };
  }

  if (
    (parsedUrl.protocol === "http:" && parsedUrl.port === "80") ||
    (parsedUrl.protocol === "https:" && parsedUrl.port === "443")
  ) {
    parsedUrl.port = "";
  }

  return { normalizedUrl: parsedUrl.toString() };
}


async function generateNewshortUrl(req, res) {
  try {
    const body = req.body || {};
    const rawUrl = body.url || req.query.url;
    const { normalizedUrl, error: urlError } = normalizeRedirectUrl(rawUrl);

    if (urlError) {
      return res.status(400).json({ error: urlError });
    }

    const rawAlias = body.alias;
    const alias =
      typeof rawAlias === "string" ? rawAlias.trim().toLowerCase() : "";

    const reservedAliases = [
      "api",
      "user",
      "home",
      "login",
      "logout",
      "analytics",
      "cleardata",
      "about",
      "features",
      "how-it-works",
      "js",
      "css",
    ];

    const aliasLengthOk = alias.length >= 3 && alias.length <= 30;

    const aliasHasOnlyAllowedCharacters = alias.split("").every((char) => {
      return (
        (char >= "a" && char <= "z") ||
        (char >= "0" && char <= "9") ||
        char === "-"
      );
    });

    if (alias && (!aliasLengthOk || !aliasHasOnlyAllowedCharacters)) {
      return res.status(400).json({
        error:
          "Alias must be 3-30 characters and only use lowercase letters, numbers, and hyphens",
      });
    }

    if (alias && reservedAliases.includes(alias)) {
      return res.status(400).json({
        error: "This alias is reserved. Please choose another one.",
      });
    }
    const rawExpiresAt = body.expiresAt;
    let expiresAt = null;

    if (rawExpiresAt) {
      expiresAt = new Date(rawExpiresAt);

      if (Number.isNaN(expiresAt.getTime())) {
        return res.status(400).json({
          error: "Invalid expiry date",
        });
      }

      if (expiresAt <= new Date()) {
        return res.status(400).json({
          error: "Expiry date must be in the future",
        });
      }
    }

    let shortid = alias || nanoid(5);

    try {
      await ShortUrl.create({
        shortId: shortid,
        redirectURL: normalizedUrl,
        expiresAt: expiresAt,
        visitHistory: [],
        createdBy: req.user._id
      });

      const baseUrl = req.protocol + "://" + req.get("host");
      const shortUrl = baseUrl + "/" + shortid;

      return res.status(200).json({
        id: shortid,
        shortUrl: shortUrl,
        expiresAt: expiresAt,
      });
    } catch (createError) {
      if (createError && createError.code === 11000) {
        if (alias) {
          return res.status(409).json({
            error: "This alias is already taken. Please choose another one.",
          });
        }

        shortid = nanoid(6);

        await ShortUrl.create({
          shortId: shortid,
          redirectURL: normalizedUrl,
          expiresAt: expiresAt,
          visitHistory: [],
          createdBy: req.user._id
        });

        const baseUrl = req.protocol + "://" + req.get("host");
        const shortUrl = baseUrl + "/" + shortid;

        return res.status(200).json({
          id: shortid,
          shortUrl: shortUrl,
          expiresAt: expiresAt,
        });
      }

      throw createError;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to create short URL" });
  }
}

async function getQrCode(req, res) {
  try {
    const shortId = req.params.shortId;
    const entry = await ShortUrl.findOne({ shortId });

    if (!entry) {
      return res.status(404).json({
        error: "Short URL not found for QR generation",
      });
    }

    if (entry.expiresAt && entry.expiresAt <= new Date()) {
      return res.status(410).json({
        error: "This short URL has expired",
      });
    }

    const shortUrl = req.protocol + "://" + req.get("host") + "/" + shortId;

    const qrSvg = await QRCode.toString(shortUrl, {
      type: "svg",
      width: 220,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#182028",
        light: "#FFFaf5",
      },
    });

    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(qrSvg);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Unable to generate QR code",
    });
  }
}


async function redirecturl(req, res) {
  const shortId = req.params.shortId;

  const entry = await ShortUrl.findOne({ shortId });

  if (!entry) {
    return res.status(404).send("Short URL not found for redirecting");
  }

  if (entry.expiresAt && entry.expiresAt <= new Date()) {
    return res.status(410).send("This short URL has expired");
  }

  entry.visitHistory.push({
    timestamp: new Date().toLocaleString(),
  });

  await entry.save();

  return res.redirect(entry.redirectURL);
}

async function getanalytics(req, res) {
  const shortId = req.params.shortid;

  const result = await ShortUrl.findOne({ shortId });

  
  if (!result) {
    return res.status(404).json({
      error: "Short URL not found for geting analytics",
    });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}


async function getMyLinks(req,res){
  try{
    const userid=req.user._id;
    const links=await ShortUrl.find({createdBy:userid}).sort({createdAt:-1});
    res.json(links)
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:"failed to fetch links"})
  }
}

module.exports = { generateNewshortUrl, redirecturl, getanalytics , getMyLinks,getQrCode};
