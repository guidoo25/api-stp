import { BookingKey } from "../config/config.js";
import fetch from 'node-fetch';
import cron from 'node-cron';
import {pool} from '../db/db.js';
import {getRedisClient,setValue,getKeys,getValue} from '../db/redis.js'



async function connectRedis() {
  await getRedisClient();
}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
  export async function buscarPorKeyRedisRedis (req, res) {
    const { key } = req.params;
    try {
      const formatvalue = "booking:"+key;
      const value = await getValue(formatvalue);
      
      if (value) {
        res.json(JSON.parse(value));
      }
      else {
        res.status(404).json({ error: 'Key not found' });
      }
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      res.status(500).json({ error: 'Error getting value from Redis' });
    }
  }
    

  export async function fetchAndSaveBookings() {
    const url = 'https://dispatchapi.taxi.booking.com/v1/bookings?status=NEW';
    const token = await getToken();
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      for (const booking of data.bookings) {
        const bookingKey = `booking:${booking.bookingReference}`;
        const bookingValue = JSON.stringify(booking, getCircularReplacer());
        await setValue(bookingKey, bookingValue);
        console.log(`Saved booking ${booking.bookingReference} to Redis`);
      }
    } catch (error) {
      console.error('Error fetching or saving bookings:', error);
    }
  }
  export async function fetchAndSaveBookingsAR() {
    const url = 'https://dispatchapi.taxi.booking.com/v1/bookings?status=NEW&pickup.country=AR';
    const token = await getToken();
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      for (const booking of data.bookings) {
        const bookingKey = `bookingAR:${booking.bookingReference}`;
        const bookingValue = JSON.stringify(booking, getCircularReplacer());
        await setValue(bookingKey, bookingValue);
        console.log(`Saved booking ${booking.bookingReference} to Redis`);
      }
    } catch (error) {
      console.error('Error fetching or saving bookings:', error);
    }
  }


  async function clearBookings() {
    // Opción 1: Eliminar claves específicas una por una
    const bookingKeys = await getKeys('booking:*');
    for (const key of bookingKeys) {
      await deleteBooking(key); 
    }
  
  }


  export async function listSavedBookings(req, res) {
    const country = req.query.country;
    try {
        const bookingKeys = await getKeys('booking:*');
        if (bookingKeys.length === 0) {
            return res.status(404).json({ error: 'No bookings found' });
        }

        let bookings = [];
        for (const key of bookingKeys) {
            const bookingValue = await getValue(key);
            const booking = JSON.parse(bookingValue);
            // Filtra por país en el campo de recogida
            if (booking.pickup && booking.pickup.country === country) {
                bookings.push(booking);
            }
        }

        if (bookings.length === 0) {
            // Si después de filtrar no hay reservas, devuelve un mensaje adecuado
            return res.status(404).json({ error: 'No bookings found for the specified country' });
        }

        res.json(bookings);
        console.log(JSON.stringify(bookings, null, 2)); // Imprime el arreglo de reservas filtradas como JSON formateado
    } catch (error) {
        console.error('Error listing bookings from Redis:', error);
    }
}
  

  export async function deleteBooking(req, res) {
    const { bookingKey } = req.params; 
    try {
        const result = await deleteKey(bookingKey);
        if (result) {
            return res.status(200).json({ message: 'Booking deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Booking not found or could not be deleted' });
        }
    } catch (error) {
        console.error('Error deleting booking from Redis:', error);
        return res.status(500).json({ error: 'Error deleting booking from Redis' });
    }
}
  
  
  export async function getToken() {
      try {
        const [rows] = await pool.query(`CALL macrologistic.ObtenerAccessToken()`);
        if (rows.length > 0 && rows[0].length > 0) {
          return rows[0][0].access_token; 
        } else {
          throw new Error('No token found');
        }
      } catch (error) {
        console.error(error);
        throw new Error(`Error fetching token: ${error.message}`);
      }
    }

  export const getbookings = async (req, res) => {
   const  url = 'https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings';
    const token = await getToken();
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Success:', data);
      res.status(200).json(data);

    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: error.message });
    }

  }

  export const eventpickup1 = async (req, res) => {
    const { bookingReference, customerReference,id_reserva } = req.body;

    const query = `CALL InsertarReservaDevents(?, 7, 7)`;
    const query1 = `CALL actualizarEstadoDriverReserva(?, 7)`;

  

    if (!bookingReference || !customerReference) {
      console.error('Evento Perido');
      return res.status(400).json({ error: 'No se encontro la data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_DEPARTED_TO_PICKUP",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };

  
    const url = `https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
    try {
      const token = await getToken();
      console.log('token ', token);
      //console.log('url ', url);
      console.log('eventDetails ', JSON.stringify(eventDetails, getCircularReplacer()));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(eventDetails)
      });
  
      // if (!response.ok) {
      //   const errorDetails = await response.json();

      //   console.error('Error details:', errorDetails);
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
  
      const data = await response.json();
      console.log('Success:', data);
      await pool.query(query, [id_reserva]);
      await pool.query(query1, [id_reserva]);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const eventPickupArrived = async (req, res) => {
    const { bookingReference, customerReference,id_reserva } = req.body;
    const query = `CALL InsertarReservaDevents(?, 8, 8)`;
    const query1 = `CALL actualizarEstadoDriverReserva(?, 8)`;

  
    if (!bookingReference || !customerReference) {
      console.error('Missing required event data');
      return res.status(400).json({ error: 'Missing required event data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_ARRIVED_AT_PICKUP",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
  
    const url = `https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
    try {
      const token = await getToken();
      console.log('url ', url);
      console.log('eventDetails ', JSON.stringify(eventDetails, getCircularReplacer()));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(eventDetails) 
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success:', data);
      res.status(200).json(data);
      await pool.query(query, [id_reserva]);
      await pool.query(query1, [id_reserva]);

    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const eventDropoff = async (req, res) => {
    const { bookingReference, customerReference,id_reserva } = req.body;
    const query1 = `CALL InsertarReservaDevents(?, 10, 10)`;
    const query = `CALL actualizarEstadoDriverReserva(?, 10)`;
  
    if (!bookingReference || !customerReference) {
      console.error('Missing required event data');
      return res.status(400).json({ error: 'Missing required event data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_DEPARTED_TO_DROPOFF",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
  
    const url = `https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
    try {
      const token = await getToken();
      console.log('url ', url);
      console.log('eventDetails ', JSON.stringify(eventDetails, getCircularReplacer()));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventDetails)
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error details:', errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success:', data);
      res.status(200).json(data);
      await pool.query(query, [id_reserva]);
      await pool.query(query1, [id_reserva]);
    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const eventDropoffArrive = async (req, res) => {
    const { bookingReference, customerReference ,id_reserva} = req.body;
    const query = `CALL actualizarEstadoDriverReserva(?, 11)`;
    const query1 = `CALL InsertarReservaDevents(?, 11, 11)`;
    
  
    if (!bookingReference || !customerReference) {
      console.error('Missing required event data');
      return res.status(400).json({ error: 'Missing required event data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_ARRIVED_AT_DROPOFF",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
  
    const url = `https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
    try {

        const token = await getToken();
      console.log('url ', url);
      console.log('eventDetails ', JSON.stringify(eventDetails, getCircularReplacer()));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(eventDetails)
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        
        console.error('Error details:', errorDetails);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success:', data);
      res.status(200).json(data);
      await pool.query(query, [id_reserva]);
      await pool.query(query1,[id_reserva])
    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

