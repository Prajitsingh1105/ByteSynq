const nodemailer = require('nodemailer');

let transporter;

async function initTransporter() {
    if (transporter) return;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = parseInt(process.env.SMTP_PORT) || 587;
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000, // Fail fast after 10 seconds
            greetingTimeout: 10000,
            socketTimeout: 10000,
            logger: true, // Log to console for debugging on Render
            debug: true
        });
        console.log(`SMTP transporter initialized using ${process.env.SMTP_HOST}:${port}`);
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
        const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || '"ByteSynq Alerts" <alerts@bytesynq.io>';
        const info = await transporter.sendMail({
            from: fromAddress,
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
