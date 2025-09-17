import nodemailer from 'nodemailer';
import htmlTemplate from '../utils/htmlTemplate';
import { EmailData } from '../utils/types/AvailabiltyForm';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'kendall24gb@gmail.com', // your email
    pass: 'zjaulskniunzuygz', // the app password you generated, paste without spaces
  },
  secure: true,
  port: 465,
});

const sendEmail = async (to: string, subject: string, userData: EmailData) => {
  console.log('Sending email...');
  await transporter.sendMail({
    from: 'kendall24gb@gmail.com', // your email
    to, // the email address you want to send an email to
    subject, // The title or subject of the email
    html: htmlTemplate(userData), // I like sending my email as html, you can send \
    // emails as html or as plain text
  });
};

export default sendEmail;
