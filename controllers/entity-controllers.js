
import {pool} from '../db/db.js';

export async function cambiarPassword(correo, passwordNueva) {
  const connection = await mysql.createConnection(dbConfig);

  try {
      const encryptedPassword = crypto.AES.encrypt(passwordNueva, "F@R_pa$$").toString();
      const [rows] = await pool.execute('CALL cambiar_password_conductor(?, ?)', [encryptedPassword, usuario]);

      return rows;
  } catch (error) {
      throw new Error('Error al cambiar la contraseña: ' + error.message);
  } finally {
      await connection.end();
  }
}

  
