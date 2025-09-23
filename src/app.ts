import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import userRoutes from './routes/exampleRoute';
import loginRoutes from './routes/loginRoute';
import { errorHandler } from 'middlewares/errorHandler';
import sendEmail from '../src/middlewares/emailSender';
//import { verifyToken } from './services/LoginService';
import { HttpException } from './utils/HttpError';

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
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new HttpException(401, 'Missing authorization token');
    }

    //  const token = authHeader.substring('Bearer '.length).trim();
    //   verifyToken(token);

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

// Error handling (last middleware)
app.use(errorHandler);
app.use('/api/login', loginRoutes);

export default app;
