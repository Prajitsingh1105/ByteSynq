const nodemailer = require('nodemailer');
const axios = require('axios');

let transporter;

async function initTransporter() {
    if (transporter) return;
    
    // Use real SMTP if configured (e.g., SendGrid, Gmail, AWS SES)
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

async function sendAlertEmail(to, subject, text, html = null) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'alerts@bytesynq.io';

    // 1. Resend HTTP API (Bypasses Render SMTP Block)
    if (process.env.RESEND_API_KEY) {
        try {
            const payload = {
                from: fromAddress,
                to: [to],
                subject: subject,
                text: text
            };
            if (html) payload.html = html;

            await axios.post('https://api.resend.com/emails', payload, {
                headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` }
            });
            console.log(`[Resend HTTP] Email sent to ${to}. Subject: ${subject}`);
            return true;
        } catch (err) {
            console.error("[Resend HTTP] Failed to send email:", err.response?.data || err.message);
            return false;
        }
    }

    // 2. SendGrid HTTP API (Bypasses Render SMTP Block)
    if (process.env.SENDGRID_API_KEY) {
        try {
            const cleanFrom = fromAddress.replace(/.*<(.+)>/, '$1').trim();
            const content = [{ type: 'text/plain', value: text }];
            if (html) content.push({ type: 'text/html', value: html });

            await axios.post('https://api.sendgrid.com/v3/mail/send', {
                personalizations: [{ to: [{ email: to }] }],
                from: { email: cleanFrom, name: 'ByteSynq Alerts' },
                subject: subject,
                content: content
            }, {
                headers: { 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}` }
            });
            console.log(`[SendGrid HTTP] Email sent to ${to}. Subject: ${subject}`);
            return true;
        } catch (err) {
            console.error("[SendGrid HTTP] Failed to send email:", err.response?.data || err.message);
            return false;
        }
    }

    // 3. Brevo (formerly Sendinblue) HTTP API (Bypasses Render SMTP Block)
    if (process.env.BREVO_API_KEY) {
        try {
            const cleanFrom = fromAddress.replace(/.*<(.+)>/, '$1').trim();
            const payload = {
                sender: { email: cleanFrom, name: 'ByteSynq Alerts' },
                to: [{ email: to }],
                subject: subject,
                textContent: text
            };
            if (html) payload.htmlContent = html;

            await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
                headers: { 
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`[Brevo HTTP] Email sent to ${to}. Subject: ${subject}`);
            return true;
        } catch (err) {
            console.error("[Brevo HTTP] Failed to send email:", err.response?.data || err.message);
            return false;
        }
    }

    // 4. Fallback to Nodemailer (SMTP or Ethereal)
    if (!transporter) await initTransporter();
    
    try {
        const mailOptions = {
            from: fromAddress,
            to: to,
            subject: subject,
            text: text,
        };
        if (html) mailOptions.html = html;

        const info = await transporter.sendMail(mailOptions);
        console.log(`[SMTP Alert] Email sent to ${to}. Subject: ${subject}`);
        if (info.messageId && info.messageId.includes('ethereal')) {
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return true;
    } catch (error) {
        console.error("Failed to send alert email:", error);
        return false;
    }
}

module.exports = { sendAlertEmail };
