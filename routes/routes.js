import { Router } from "express";
import { eventpickup1,eventPickupArrived,eventDropoff,eventDropoffArrive,listSavedBookings,deleteBooking,fetchAndSaveBookings} from "../controllers/driver-events.js";
import pkg from 'node-cron';

const { schedule } = pkg;

const router = Router();

router.post('/eventpickup1',eventpickup1);
router.post('/eventpickup2',eventPickupArrived);
router.post('/eventdropoff1',eventDropoff);
router.post('/eventdropoff2',eventDropoffArrive);
router.get('/bookings',listSavedBookings);
router.delete('/bookings/:bookingKey',deleteBooking);

schedule('*/35 * * * *', () => {
    console.log('llenando redis  cada 35 minutes');
    fetchAndSaveBookings();
});

export default router;