const nodemailer = require('nodemailer');

let transporter;

async function initTransporter() {
    if (transporter) return;
    
    // Use real SMTP if configured (e.g., SendGrid, Gmail, AWS SES)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log(`SMTP transporter initialized using ${process.env.SMTP_HOST}`);
        return;
    }

    // Fallback: Create a test account for local development
    try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, 
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("Ethereal Email transporter initialized (Fallback).");
    } catch (error) {
        console.error("Failed to create Ethereal test account:", error);
    }
}

async function sendAlertEmail(to, subject, text) {
    if (!transporter) await initTransporter();
    
    try {
        const info = await transporter.sendMail({
            from: '"ByteSynq Alerts" <alerts@bytesynq.io>',
            to: to,
            subject: subject,
            text: text,
        });
        console.log(`[Alert] Email sent to ${to}. Subject: ${subject}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        return true;
    } catch (error) {
        console.error("Failed to send alert email:", error);
        return false;
    }
}

module.exports = { sendAlertEmail };
