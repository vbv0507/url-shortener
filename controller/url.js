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
  if (!entry) {
    return res.status(404).send("Short URL not found for redirecting");
  }

  res.redirect(entry.redirectURL);
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

module.exports = { generateNewshortUrl, redirecturl, getanalytics , databaseclear};
