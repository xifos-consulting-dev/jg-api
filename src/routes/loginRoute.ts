import Router from 'express';
import { logIn, checkLogin } from '../controllers/logInController';
const router = Router();

router.post('/', logIn);
router.get('/check', checkLogin);

export default router;
