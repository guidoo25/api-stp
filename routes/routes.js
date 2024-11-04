import express from 'express';
import { OrdenController } from '../controllers/ordenController.js';
import { AbonoController } from '../controllers/abonoController.js';

const router = express.Router();
const ordenController = new OrdenController();
const abonoController = new AbonoController();


router.post('/registraOrden', (req, res) => ordenController.registraOrden(req, res));
router.post('/sendAbono', (req, res) => abonoController.sendAbono(req, res));


export default router;