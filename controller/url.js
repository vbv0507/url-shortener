const { nanoid } = require("nanoid");
const URL = require("../model/url");

async function generateNewshortUrl(req, res) {
  try {
    const body = req.body || {};
    const rawUrl = body.url || req.query.url;
    const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

    if (!url) {
      return res.status(400).json({ error: "url is required" });
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
      await URL.create({
        shortId: shortid,
        redirectURL: url,
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

        await URL.create({
          shortId: shortid,
          redirectURL: url,
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

async function redirecturl(req, res) {
  const shortId = req.params.shortId;

  const entry = await URL.findOne({ shortId });

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

  const result = await URL.findOne({ shortId });

  
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

async function databaseclear(req,res){
  try{
    const result=await URL.deleteMany({});
    return res.json({
      success:true,
      message: "Database cleared successfully",
      deletedCount: result.deletedCount
    });
  }
    catch(error){
      return res.status(500).json({
      success: false,
      message: "Error clearing database",
      error: error.message
    });
  }
}

async function getMyLinks(req,res){
  try{
    const userid=req.user._id;
    const links=await URL.find({createdBy:userid}).sort({createdAt:-1});
    res.json(links)
  }
  catch(error){
    console.error(error);
    res.status(500).json({error:"failed to fetch links"})
  }
}

module.exports = { generateNewshortUrl, redirecturl, getanalytics , databaseclear,getMyLinks};
