import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { UserCredentialModel as User } from '../models/user';
import Token from '../models/token';
import { sendPasswordResetEmail } from '../middlewares/emailSender';

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

    const baseUrl = process.env.BASE_URL ?? '';
    const link = `${baseUrl}/password-reset/${user._id}/${token.token}`;

    await sendPasswordResetEmail(user.email, 'Password reset', link);

    return res.send('Password reset link sent to your email account.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred.');
  }
});

router.post('/:userId/:token', async (req: Request<{ userId: string; token: string }, unknown, ResetConfirmBody>, res: Response) => {
  try {
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

    // NOTE: Hash the password before saving in production!
    user.password = password;
    await user.save();

    // delete token after use
    await tokenDoc.deleteOne();

    return res.send('Password reset successfully.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('An error occurred.');
  }
});

export default router;
