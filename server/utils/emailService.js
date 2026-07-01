const nodemailer = require('nodemailer');

let transporter;

async function initTransporter() {
    if (transporter) return;
    
    // Create a test account for local development
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
        console.log("Ethereal Email transporter initialized.");
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
