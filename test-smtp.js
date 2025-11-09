// Quick SMTP verification script for local use
// Usage (example):
// EMAIL_ADDRESS=youremail@gmail.com EMAIL_PASSWORD=your_app_password node test-smtp.js

const nodemailer = require('nodemailer');

(async function main(){
  const smtpServer = process.env.SMTP_SERVER || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.EMAIL_ADDRESS ? process.env.EMAIL_ADDRESS.trim() : undefined;
  const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim() : undefined;

  if (!user || !pass) {
    console.error('Please set EMAIL_ADDRESS and EMAIL_PASSWORD as environment variables.');
    process.exit(1);
  }

  console.log('Testing SMTP connection to', smtpServer + ':' + smtpPort);

  const transporter = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    console.log('SMTP verify: OK — credentials accepted');
  } catch (err) {
    console.error('SMTP verify failed:');
    console.error(err);
    process.exit(2);
  }
})();
