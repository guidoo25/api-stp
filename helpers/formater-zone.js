import moment from 'moment-timezone';

export function isPickupTomorrow(booking) {
    const { pickup_date_time, pickup_date_time_zone } = booking;

    const now = moment.tz(pickup_date_time_zone);

    const tomorrowStart = now.clone().add(1, 'days').startOf('day');
    const tomorrowEnd = tomorrowStart.clone().endOf('day');

    const pickupDateTime = moment.tz(pickup_date_time, pickup_date_time_zone);

    return pickupDateTime.isBetween(tomorrowStart, tomorrowEnd, null, '[]');
}


export function ajustarFechas(bookings) {
  bookings.forEach(booking => {
    const { pickup_date_time, pickup_date_time_zone } = booking;
    const fechaOriginal = moment.utc(pickup_date_time).tz(pickup_date_time_zone);
    const fechaAjustada = fechaOriginal.format('dddd DD-MM-YYYY hh:mmA z');
    booking.formatted_pickup_date_time = fechaAjustada;
  });
  return bookings;
}

export function convertPickupDateTime(bookings) {
    return bookings.map(booking => {
        const { pickup_date_time, pickup_date_time_zone } = booking;
        
        // Convertir pickup_date_time a la zona horaria especificada
        const convertedDateTime = moment.tz(pickup_date_time, pickup_date_time_zone).format();
        
        return {
            ...booking,
            pickup_date_time: convertedDateTime
        };
    });
}

//prueba

