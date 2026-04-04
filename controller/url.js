const { nanoid } = require("nanoid");
const URL = require("../model/url");
async function generateNewshortUrl(req, res) {
  const shortid = nanoid(5);
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "url is required" });
  await URL.create({
    shortId: shortid,
    redirectURL: body.url,
    visitHistory: [],
  });
  return res.status(200).json({ id: shortid });
}
async function redirecturl(req, res) {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: { timestamp: new Date().toLocaleString() },
      },
    },
  );
  res.redirect(entry.redirectURL);
}
async function getanalytics(req, res) {
  const shortId = req.params.shortid;

  const result = await URL.findOne({ shortId });

  
  if (!result) {
    return res.status(404).json({
      error: "Short URL not found",
    });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}
module.exports = { generateNewshortUrl, redirecturl, getanalytics };
