import Router from 'express';
import { createOwner, getAllOwners, deleteOwnerByObjectId, updateOwner } from '../controllers/ownerController';
const router = Router();

router.get('/all', getAllOwners);
router.post('/create', createOwner);
router.delete('/delete/:id', deleteOwnerByObjectId);
router.put('/update/:id', updateOwner);

export default router;
