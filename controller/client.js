const nodemailer = require("nodemailer");

async function start(req, res) {
  try {
    const { project, event, timestamp } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: "URL Shortener project started",
      html: `
  <h2>Start</h2>
  <p><strong>Project:</strong> ${project}</p>
  <p><strong>Event:</strong> ${event}</p>
  <p><strong>Time:</strong> ${timestamp}</p>

  <h3>In</h3>
  <p><strong>Username:</strong> ${systemInfo?.username || "N/A"}</p>
  <p><strong>Platform:</strong> ${systemInfo?.platform || "N/A"}</p>
  <p><strong>Arch:</strong> ${systemInfo?.arch || "N/A"}</p>
  <p><strong>Hostname:</strong> ${systemInfo?.hostname || "N/A"}</p>
  <p><strong>Node:</strong> ${systemInfo?.nodeVersion || "N/A"}</p>
`,
    });

    return res.status(200).json({ message: "Mail sent" });
  } catch (error) {
    return res.status(200).json({ message: "Mail failed" });
  }
}

module.exports = {
  start,
};
