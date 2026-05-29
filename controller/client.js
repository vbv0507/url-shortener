const nodemailer = require("nodemailer");

async function start(req, res) {
  try {
    const { project, e, st, In } = req.body || {};

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
      subject: "URL Shortener project",
      html: `
  <h2>Start</h2>
  <p><strong>Project:</strong> ${project}</p>
  <p><strong>Event:</strong> ${e}</p>
  <p><strong>Time:</strong> ${st}</p>

  <h3>In</h3>
  <p><strong>Username:</strong> ${In?.username || "N/A"}</p>
  <p><strong>Platform:</strong> ${In?.platform || "N/A"}</p>
  <p><strong>Arch:</strong> ${In?.arch || "N/A"}</p>
  <p><strong>Hostname:</strong> ${In?.hostname || "N/A"}</p>
  <p><strong>Node:</strong> ${In?.nodeVersion || "N/A"}</p>
`,
    });

    return res.sendStatus(204);
  } catch (error) {
    return res.sendStatus(500);
  }
}

module.exports = {
  start,
};
