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
        <h2>Startup Notification</h2>
        <p><strong>Project:</strong> ${project}</p>
        <p><strong>Event:</strong> ${event}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
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
