const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateProTemplate = ({ title, message, ctaUrl, ctaText }) => {
  return `
  <div style="background-color:#f4f4f4; padding:40px 0; font-family:'Segoe UI',sans-serif;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
      <div style="background:#004aad; padding:20px; color:white; text-align:center;">
        <h1 style="margin:0;">ApproAuto</h1>
        <p style="margin:0; font-size:14px;">Système intelligent d'approbation</p>
      </div>
      <div style="padding:30px;">
        <h2 style="color:#333;">${title}</h2>
        <p style="font-size:15px; color:#444;">${message}</p>
        ${
          ctaUrl
            ? `<div style="text-align:center; margin-top:30px;">
                <a href="${ctaUrl}" target="_blank" style="background:#004aad; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
                  ${ctaText || "Voir la demande"}
                </a>
              </div>`
            : ""
        }
      </div>
      <div style="background:#f0f0f0; padding:20px; text-align:center; font-size:13px; color:#888;">
        Cet email a été généré automatiquement.<br>Merci de ne pas y répondre directement.<br><br>
        &copy; ${new Date().getFullYear()} ApproAuto - Tous droits réservés.
      </div>
    </div>
  </div>
  `;
};

const sendApprovalEmail = async (fromEmail, to, subject, title, message, ctaUrl, ctaText) => {
  try {
    const html = generateProTemplate({ title, message, ctaUrl, ctaText });

    const info = await transporter.sendMail({
      from: `"ApproAuto" <${process.env.EMAIL_USER}>`,
      replyTo: fromEmail,
      to,
      subject,
      html,
    });

    console.log(`✅ Email pro envoyé à ${to}`);
  } catch (error) {
    console.error("❌ Erreur d'envoi :", error);
  }
};

module.exports = { sendApprovalEmail };
