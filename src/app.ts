import express from 'express';
import loginRoutes from './routes/loginRoute';
// import { errorHandler } from './middlewares/errorHandler';
import sendEmail from './middlewares/emailSender';
import ownerRoutes from './routes/ownerRouter';
//import { verifyToken } from './services/LoginService';
import { HttpException } from './utils/HttpError';
import reseter from './routes/password-reset';
//import { db } from 'middlewares/db';
import helmet from 'helmet';
import cors from 'cors';
import venueRoutes from './routes/venueRouter';

import morgan from 'morgan';
const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Logging & JSON parser
app.use(morgan('dev'));
app.use(express.json());

// function CheckToken(authHeader: string) {
//   if (!authHeader?.startsWith('Bearer ')) {
//     throw new HttpException(401, 'Missing authorization token');
//   }

//   const token = authHeader.substring('Bearer '.length).trim();
//   verifyToken(token);
//   return true;
// }

// Security middlewares

// Routes
// Health check
app.get('/', async (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/sendEmailBooking/:email', async (req, res) => {
  try {
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    //   throw new HttpException(401, 'Missing authorization header');
    // }

    // const validtoken = await CheckToken(authHeader);
    // if (!validtoken) {
    //   throw new HttpException(403, 'Invalid token');
    // }
    console.log('Request body:', req.body);

    await sendEmail(req.params.email, 'your request was received', req.body);
    res.send('Email sent');
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
      return;
    }

    res.status(500).send('Error sending email');
    console.error(error);
  }
});

app.use('/api/login', loginRoutes);
app.use('/api/password-reset', reseter);
app.use('/api/venues', venueRoutes);
app.use('/api/owners', ownerRoutes);

// Error handling (last middleware)
// app.use(errorHandler);

export default app;
