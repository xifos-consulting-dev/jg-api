import Router from 'express';
import { logIn } from '../controllers/logInController';
const router = Router();

router.post('/', logIn);

export default router;
