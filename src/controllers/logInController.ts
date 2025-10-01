import type { Request, Response } from 'express';
import { HttpException } from '../utils/HttpError';
import { loginService } from '../services/LoginService';

export const logIn = async (req: Request, res: Response) => {
  try {
    const { user, password } = req.body;
    console.log(user, ' | password >', password);
    const token = await loginService.LoginVerification(user, password);

    res.status(200).json({ token });
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const checkLogin = (_req: Request, res: Response) => {
  console.log('checkLogin called');
  res.status(200).json({ message: 'Login route is working' });
};
