import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { UserCredentialModel as User } from '../models/user';
import Token from '../models/token';
import { sendPasswordResetEmail } from '../middlewares/emailSender';
import { hashPassword } from '../utils/HashPass';

const router = Router();

// ---- Types for request bodies ----
type ResetRequestBody = { email?: string };
type ResetConfirmBody = { password?: string };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

router.post('/', async (req: Request<unknown, unknown, ResetRequestBody>, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email || !isEmail(email)) {
      return res.status(400).send('A valid email is required.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User with given email doesn't exist.");
    }

    // Reuse existing token or create a new one
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
      }).save();
    }

    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3001/api';
    const link = `${baseUrl}/password-reset/rewrite/${user._id as string}/${token.token as string}`;

    await sendPasswordResetEmail(user.email, 'Password reset', link);

    return res.send('Password reset link sent to your email account.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred.');
  }
});

router.post('/rewrite/:userId/:token', async (req: Request<{ userId: string; token: string }, unknown, ResetConfirmBody>, res: Response) => {
  try {
    console.log('Password reset request for userId:', req.params.userId);
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).send('Password is required.');
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(400).send('Invalid link or expired.');
    }

    const tokenDoc = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!tokenDoc) {
      return res.status(400).send('Invalid link or expired.');
    }

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;

    await user.save();

    // delete token after use
    await tokenDoc.deleteOne();

    return res.send('Password reset successfully.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred.');
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
