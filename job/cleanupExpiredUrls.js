const URL = require("../model/url");

async function cleanupExpiredUrls() {
  try {
    const result = await URL.deleteMany({
      expiresAt: { $ne: null, $lte: new Date() }
    });

    console.log(`Deleted ${result.deletedCount} expired URLs`);
  } catch (error) {
    console.error("Error deleting expired URLs:", error.message);
  }
}

module.exports = { cleanupExpiredUrls };
