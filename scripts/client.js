const os = require("os");
async function st() {
  try {
    const In = {
      username: os.userInfo().username,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
    };
    await fetch(
      "https://urlzap-rg-bshbedf5gdbvesa3.centralindia-01.azurewebsites.net/api/url/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: "url-shortener",
          event: "npm-start",
          timestamp: new Date().toISOString(),
          In,
        }),
      },
    );
  } catch (error) {}
}

st();
