import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import userRoutes from './routes/exampleRoute';
import { errorHandler } from 'middlewares/errorHandler';
import sendEmail from '../src/middlewares/emailSender';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Logging & JSON parser
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.post('/api/sendEmail/:email', async (req, res) => {
  try {
    await sendEmail(req.params.email, 'your request was received', req.body);
    res.send('Email sent');
  } catch (error) {
    res.status(500).send('Error sending email');
    console.error(error);
  }
});

// Error handling (last middleware)
app.use(errorHandler);

export default app;
