import { Router } from "express";
import { eventpickup1,eventPickupArrived,eventDropoff,buscarPorKeyRedisRedis
    ,eventDropoffArrive,listSavedBookings,deleteBooking,fetchAndSaveBookings,getTokenBooking,
    listSavedBookingsFomater,
    listSavedBookingszonaHoraria,
    fetchAndSaveAceptados,
    listSavedBookingsAceptado,
    listSavedBookingsAceptadohoy} from "../controllers/driver-events.js";
import pkg from 'node-cron';
import {cambiarPassword} from '../controllers/entity-controllers.js';
const { schedule } = pkg;

const router = Router();

router.post('/eventpickup1',eventpickup1);
router.post('/eventpickup2',eventPickupArrived);
router.post('/eventdropoff1',eventDropoff);
router.post('/eventdropoff2',eventDropoffArrive);
router.get('/bookings',listSavedBookingszonaHoraria);
router.get('/buscar/:key',buscarPorKeyRedisRedis);
router.delete('/bookings/:bookingKey',deleteBooking);
router.get('/listarbookings',listSavedBookingsFomater);
router.get('/listbookingzone',listSavedBookingszonaHoraria);
router.get('/aceptados-tomorrow',listSavedBookingsAceptado);
router.get('/aceptados-hoy',listSavedBookingsAceptadohoy);

router.post('/updateconductor', async (req, res) => {
  const { urusario, passwordNueva } = req.body;

  try {
      await cambiarPassword(correo, passwordNueva);
      const response = {
          status: true,
          msg: 'Actualizado Correctamente',
          title: 'Correcto',
          icon: 'success'
      };
      res.json(response);
  } catch (error) {
      const response = {
          status: false,
          msg: error.message,
          title: 'Error',
          icon: 'error'
      };
      res.json(response);
  }
});



schedule('*/128 * * * *', () => {
    console.log('llenando redis  cada 128 minutes');
    fetchAndSaveBookings();
    //fetchAndSaveBookingsprueba();
});

schedule('*/80 * * * *', () => {
    console.log('llenando redis aceptados cada 80 minutes');
    fetchAndSaveAceptados();
});
schedule('*/30 * * * *', () => {
    console.log('llenando token  cada 20 minutes');
    getTokenBooking();
});

export default router;