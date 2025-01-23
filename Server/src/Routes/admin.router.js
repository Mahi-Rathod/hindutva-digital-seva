import { Router } from 'express';
import { getDashboardData } from '../Controllers/admin.controller.js';
import { verifyJWT, verifyAdmin } from '../Middlewares/auth.middlewares.js';

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);

router.get("/dashboard", getDashboardData);

export default router;
