import { BookingKey ,api_url_booking,api_url_prueba} from "../config/config.js";
import fetch from 'node-fetch';
import cron from 'node-cron';
import {pool} from '../db/db.js';
import { client_api,client_pass } from '../config/config.js';
import {getRedisClient,setValue,getKeys,getValue,deleteValue} from '../db/redis.js'
import moment from 'moment'; 
import {ajustarFechas, convertPickupDateTime} from '../helpers/formater-zone.js'

async function connectRedis() {
  await getRedisClient();
}



export async function getTokenBooking() {

  // Define las credenciales del cliente
  const clientId = client_api;
  const clientSecret = client_pass;

  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  // Configura las opciones de la solicitud
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  };

  try {

    const response = await fetch('https://auth.dispatchapi.taxi.booking.com/oauth2/token', options);
    const data = await response.json();

    if (data.access_token) {
      await guardarToken(data.access_token, Date.now() + 3600000); // El token expira en 1 hora

      return data.access_token;
    } else {
      console.error("No se pudo obtener el Access Token.");
      return null;
    }
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
}
function guardarToken(token,expiration) {
  // Convert timestamp from milliseconds to a MySQL datetime string
  const expirationDate = new Date(parseInt(expiration)).toISOString().slice(0, 19).replace('T', ' ');

  const sql = "UPDATE tb_tokens SET user_id = 80, access_token = ?, token_expiry = ? WHERE id = 1";
  
  pool.query(sql, [token, expirationDate], (error, results) => {
    if (error) {
      return console.error('Error al guardar el token:', error);
    }
    console.log('Token actualizado con éxito:', results);
  });
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
  export async function buscarPorKeyRedisRedis(req, res) {
    const { key } = req.params;
    try {
      const formatvalue = "booking:" + key;
      let value = await getValue(formatvalue);
  
      if (!value) {
        const acceptedFormatValue = "bookingAceptados:" + key;
        value = await getValue(acceptedFormatValue);
      }
  
      if (value) {
        res.json(JSON.parse(value));
      } else {
        res.status(404).json({ error: 'Key not found' });
      }
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      res.status(500).json({ error: 'Error getting value from Redis' });
    }
  }

// router.delete('/deleteBooking', async (req, res) => {
//   const { key } = req.body;
//   if (!key) {
//       return res.status(400).json({ error: 'Key is required' });
//   }

//   try {
//       await deleteValue(key);
//       res.json({ message: `Booking with key ${key} deleted successfully` });
//   } catch (error) {
//       console.error('Error deleting booking from Redis:', error);
//       res.status(500).json({ error: 'Error deleting booking' });
//   }
// });
    

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
  
  export async function fetchAndSaveAceptados() {
    const url = 'https://dispatchapi.taxi.booking.com/v1/bookings?status=ACCEPTED';
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
        const bookingKey = `bookingAceptados:${booking.bookingReference}`;
        const bookingValue = JSON.stringify(booking, getCircularReplacer());
        await setValue(bookingKey, bookingValue);
        console.log(`Saved booking ${booking.bookingReference} to Redis`);
      }
    } catch (error) {
      console.error('Error fetching or saving bookings:', error);
    }
  }





  export async function listSavedBookings(req, res) {
    const country = req.query.country;
    const vehicleType = req.query.vehicle_type;


    try {
        const bookingKeys = await getKeys('booking:*');
        if (bookingKeys.length === 0) {
            return res.status(404).json({ error: 'No bookings found' });
        }

        const bookingValues = await Promise.all(bookingKeys.map(key => getValue(key)));
        let bookings = bookingValues.map(value => JSON.parse(value))
            .filter(booking => booking.pickup && booking.pickup.country === country);

        if (vehicleType && vehicleType !== '0') {
            bookings = bookings.filter(booking => booking.vehicle_type === vehicleType);
        }

        if (bookings.length === 0) {
            return res.status(404).json({ error: 'No bookings found for the specified country and vehicle type' });
        }

        res.json({ bookings });

        console.log(JSON.stringify(bookings, null, 2)); 
    } catch (error) {
        console.error('Error listing bookings from Redis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export async function listSavedBookingszonaHoraria(req, res) {
  const country = req.query.country;
  const vehicleType = req.query.vehicle_type;

  try {
    const bookingKeys = await getKeys('booking:*');
    if (bookingKeys.length === 0) {
      return res.status(404).json({ error: 'No bookings found' });
    }

    const bookingValues = await Promise.all(bookingKeys.map(key => getValue(key)));
    let bookings = bookingValues.map(value => JSON.parse(value))
      .filter(booking => booking.pickup && booking.pickup.country === country);

    if (vehicleType && vehicleType !== '0') {
      bookings = bookings.filter(booking => booking.vehicle_type === vehicleType);
    }

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'No bookings found for the specified country and vehicle type' });
    }

    // Ajustar las fechas y horas según la zona horaria especificada
    bookings = ajustarFechas(bookings);

    res.json({ bookings });

    console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error('Error listing bookings from Redis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listSavedBookingsAceptado(req, res) {
  const country = req.query.country;
  const vehicleType = req.query.vehicle_type;

  try {
      const bookingKeys = await getKeys('bookingAceptados:*');
      if (bookingKeys.length === 0) {
          return res.status(404).json({ error: 'No bookings found' });
      }

      const bookingValues = await Promise.all(bookingKeys.map(key => getValue(key)));
      let bookings = bookingValues.map(value => JSON.parse(value))
          .filter(booking => booking.pickup && booking.pickup.country === country);

      if (vehicleType && vehicleType !== '0') {
          bookings = bookings.filter(booking => booking.vehicle_type === vehicleType);
      }

      // Filtro para verificar si el pickup_date_time está dentro de las próximas 20 horas
      const now = moment();
      const inTwentyHours = moment().add(20, 'hours');
      bookings = bookings.filter(booking => {
          const pickupDateTime = moment(booking.pickup_date_time);
          return pickupDateTime.isBetween(now, inTwentyHours);
      });

      if (bookings.length === 0) {
          return res.status(404).json({ error: 'No bookings found for the specified criteria' });
      }

      bookings = await ajustarFechas(bookings);

      res.json({ bookings });

      console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
      console.error('Error listing bookings from Redis:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listSavedBookingsAceptadohoy(req, res) {
  const country = req.query.country;
  const vehicleType = req.query.vehicle_type;

  try {
      const bookingKeys = await getKeys('bookingAceptados:*');
      if (bookingKeys.length === 0) {
          return res.status(404).json({ error: 'No bookings found' });
      }

      const bookingValues = await Promise.all(bookingKeys.map(key => getValue(key)));
      let bookings = bookingValues.map(value => JSON.parse(value))
          .filter(booking => booking.pickup && booking.pickup.country === country);

      if (vehicleType && vehicleType !== '0') {
          bookings = bookings.filter(booking => booking.vehicle_type === vehicleType);
      }

      // Filtro para verificar si el pickup_date_time es hoy
      const startOfToday = moment().startOf('day');
      const endOfToday = moment().endOf('day');
      bookings = bookings.filter(booking => {
          const pickupDateTime = moment(booking.pickup_date_time);
          return pickupDateTime.isBetween(startOfToday, endOfToday);
      });

      if (bookings.length === 0) {
          return res.status(404).json({ error: 'No bookings found for the specified criteria' });
      }

      bookings = await ajustarFechas(bookings);

      res.json({ bookings });

      console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
      console.error('Error listing bookings from Redis:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}


export async function listSavedBookingsFomater(req, res) {
  const country = req.query.country;
  const vehicleType = req.query.vehicle_type;

  try {
      const bookingKeys = await getKeys('booking:*');
      if (bookingKeys.length === 0) {
          return res.status(404).json({ error: 'No bookings found' });
      }

      const bookingValues = await Promise.all(bookingKeys.map(key => getValue(key)));
      let bookings = bookingValues.map(value => JSON.parse(value))
          .filter(booking => booking.pickup && booking.pickup.country === country);

      if (vehicleType && vehicleType !== '0') {
          bookings = bookings.filter(booking => booking.vehicle_type === vehicleType);
      }

      // Filtro para verificar si el pickup_date_time es mañana
      const tomorrow = moment().add(1, 'days').startOf('day');
      bookings = bookings.filter(booking => {
          const pickupDateTime = moment(booking.pickup_date_time);
          return pickupDateTime.isSame(tomorrow, 'day');
      });

      if (bookings.length === 0) {
          return res.status(404).json({ error: 'No bookings found for the specified criteria' });
      }
      bookings = await  convertPickupDateTime(bookings);

      res.json({ bookings });

      console.log(JSON.stringify(bookings, null, 2));
  } catch (error) {
      console.error('Error listing bookings from Redis:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}



  

  export async function deleteBooking(req, res) {
    const { bookingKey } = req.params; 
    try {
        const result = await deleteValue(bookingKey);
        if (result) {
            return res.status(200).json({ message: 'Booking Borrado sastifactoriamente' });
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
   const  url = 'https://dispatchapi.taxi.booking.com/v1/bookings';
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
    const { bookingReference, customerReference,id_reserva ,longitud,latitud} = req.body;

    const query = `CALL InsertarReservaDevents(?, 7, 7,${longitud},${latitud})`;
    const query1 = `CALL actualizarEstadoDriverReserva(?, 7)`;

  

    if (!bookingReference || !customerReference) {
      console.error('Evento Perido');
      return res.status(400).json({ error: 'No se encontro la data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_DEPARTED_TO_PICKUP",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };

  
    const url = `https://dispatchapi.taxi.booking.com/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
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
      //await pool.query(query1, [id_reserva]);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const eventPickupArrived = async (req, res) => {
    const { bookingReference, customerReference,id_reserva ,longitud,latitud} = req.body;
    const query = `CALL InsertarReservaDevents(?, 8, 8,${longitud},${latitud})`;
    const query1 = `CALL actualizarEstadoDriverReserva(?, 8)`;

  
    if (!bookingReference || !customerReference) {
      console.error('Missing required event data');
      return res.status(400).json({ error: 'Missing required event data' });
    }
  
    const eventDetails = {
      "event_type": "DRIVER_ARRIVED_AT_PICKUP",
      "occurred_at": new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    };
  
    const url = `https://dispatchapi.taxi.booking.com/v1/bookings/${customerReference}/${bookingReference}/driver/events`;
  
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
      //await pool.query(query1, [id_reserva]);

    } catch (error) {
      console.error('Error sending event:', error);
      res.status(500).json({ error: error.message });
    }
  };

  export const eventDropoff = async (req, res) => {
    const { bookingReference, customerReference,id_reserva,longitud,latitud} = req.body;
    const query1 = `CALL InsertarReservaDevents(?, 10, 10,${longitud},${latitud})`;
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
    const { bookingReference, customerReference ,id_reserva,longitud,latitud} = req.body;
    const query = `CALL actualizarEstadoDriverReserva(?, 11,${longitud},${latitud})`;
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

