import express from 'express';
import { OrdenController } from '../controllers/ordenController.js';
import {  TransactionController } from '../controllers/abonoController.js';

const router = express.Router();
const ordenController = new OrdenController();
const controller = new TransactionController();



router.post('/registraOrden', (req, res) => ordenController.registraOrden(req, res));
router.post('/transacciones', controller.processTransaction.bind(controller));


export default router;