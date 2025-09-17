import { Router } from 'express';
import { getUsers, getId } from '../controllers/exampleController';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getId);

export default router;
