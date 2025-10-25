import Router from 'express';
import { createOwner, getAllOwners } from '../controllers/ownerController';
const router = Router();

router.get('/all', getAllOwners);
router.post('/', createOwner);

export default router;
