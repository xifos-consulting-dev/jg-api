import Router from 'express';
import { createOwner, getAllOwners, deleteOwnerByObjectId } from '../controllers/ownerController';
const router = Router();

router.get('/all', getAllOwners);
router.post('/create', createOwner);
router.delete('/delete/:id', deleteOwnerByObjectId);

export default router;
