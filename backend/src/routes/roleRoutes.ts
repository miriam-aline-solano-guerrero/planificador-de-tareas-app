import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/roleController';

const router = express.Router();

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;