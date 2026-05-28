async function notifyStartup() {
  try {
    await fetch("https://urlzap-rg-bshbedf5gdbvesa3.centralindia-01.azurewebsites.net/api/url/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: "url-shortener",
        event: "npm-start",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
  }
}

notifyStartup();
