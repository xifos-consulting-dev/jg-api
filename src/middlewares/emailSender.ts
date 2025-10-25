import nodemailer from 'nodemailer';
import htmlTemplate from '../utils/htmlTemplate';
import { EmailData } from '../utils/types/AvailabiltyForm';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'madewithkonsept@gmail.com', // your email
    pass: 'ckpmwxolbqepaupk', // the app password you generated, paste without spaces
  },
  secure: true,
  port: 465,
});

const fromEmail = 'madewithkonsept@gmail.com';

const sendEmail = async (to: string, subject: string, userData: EmailData) => {
  console.log('Sending email...');
  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    html: htmlTemplate(userData), // I like sending my email as html, you can send \
    // emails as html or as plain text
  });
};

const sendPasswordResetEmail = async (to: string, subject: string, link: string) => {
  console.log('Sending password reset email...');
  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`, // Simple HTML email
  });
};

export { sendPasswordResetEmail };

export default sendEmail;
