require("dotenv").config();

const mongoose = require("mongoose");
const connectdb = require("../connection");
const { cleanupExpiredUrls } = require("../job/cleanupExpiredUrls");

async function main() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing");
  }

  await connectdb(process.env.MONGO_URL);
  console.log("MongoDB connected for cleanup");

  await cleanupExpiredUrls();

  await mongoose.disconnect();
  console.log("MongoDB disconnected after cleanup");
}

main()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Cleanup job failed:", error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Disconnect failed:", disconnectError);
    }

    process.exit(1);
  });
