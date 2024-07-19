import { Router } from "express";
import { eventpickup1,eventPickupArrived,eventDropoff,buscarPorKeyRedisRedis
    ,eventDropoffArrive,listSavedBookings,deleteBooking,fetchAndSaveBookings,getTokenBooking} from "../controllers/driver-events.js";
import pkg from 'node-cron';
import {crearEmpresa} from '../controllers/entity-controllers.js';
const { schedule } = pkg;

const router = Router();

router.post('/eventpickup1',eventpickup1);
router.post('/eventpickup2',eventPickupArrived);
router.post('/eventdropoff1',eventDropoff);
router.post('/eventdropoff2',eventDropoffArrive);
router.get('/bookings',listSavedBookings);
router.get('/buscar/:key',buscarPorKeyRedisRedis);
router.delete('/bookings/:bookingKey',deleteBooking);

router.post('/crearEmpresa', async (req, res) => {
    try {
      const datosEmpresa = req.body;
      const resultado = await crearEmpresa(datosEmpresa);
      res.json({ success: true, resultado });
    } catch (error) {
      console.error('Error al crear empresa:', error.message);
      res.status(500).json({ success: false, message: 'Error al crear empresa' });
    }
  });

schedule('*/128 * * * *', () => {
    console.log('llenando redis  cada 128 minutes');
    fetchAndSaveBookings();
});
schedule('*/30 * * * *', () => {
    console.log('llenando token  cada 20 minutes');
    getTokenBooking();
});

export default router;