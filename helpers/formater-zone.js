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

export async function fetchAndSaveBookingsprueba() {
    const url = "https://dispatch-api-sandbox.qa.someonedrive.me/v1/bookings";
    const token = "eyJraWQiOiJVRFcwVzJwRUFrNCtxakdhRVUxOFA0ZStjSlNiQjRmQnA2dlJjR2hSUXRnPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1aXNjcm5uamNuYXU4c2U1dTY0YmFkZXNjNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiZGlzcGF0Y2hhcGlzYW5kYm94XC9ib29raW5nczpyZWFkIGRpc3BhdGNoYXBpc2FuZGJveFwvYm9va2luZ3M6d3JpdGUgZGlzcGF0Y2hhcGlzYW5kYm94XC9kcml2ZXJldmVudHM6d3JpdGUiLCJhdXRoX3RpbWUiOjE3MjIyODQwNjksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX1VFV2NzaVpQdyIsImV4cCI6MTcyMjI4NzY2OSwiaWF0IjoxNzIyMjg0MDY5LCJ2ZXJzaW9uIjoyLCJqdGkiOiIxNTI3MzVhYS01ZWQ1LTQwMTQtOTczNy04NDg5YmNjZTk2MzIiLCJjbGllbnRfaWQiOiI1aXNjcm5uamNuYXU4c2U1dTY0YmFkZXNjNSJ9.W-uKFD_r6iAPobRv6FXGiU-QfXBizeYcZ55F9OAYNNczjXLY1QV8nJVWnyt9tu0sgXI9ZBik8wTFalwDChdD3FTjQRjDFOctskzsKLl4Mu-IWK6niOIj7TuLVEW-IBiZ7UlRHZ2anWeD7XYys1dwcjikQae3Av2LeGihN1bdwIECHwIPT2Hub3bqW9BnFPBjm3Y6yJc7tKz9tffeD23dd1FQmDFVo1HcIEBm4uqBC4Ha-bRa5hcslyIeBSjMbn5MxBOMZPQRTDrIgpfSiF8ZuduaTIEWJyj5yqARY0Y72Z85Lbb_wBXLux47AkMuMurEIGLb2Q3L0FZEahDwESPNtQ";
  
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