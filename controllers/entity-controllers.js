import crypto from 'crypto';
import { pool } from '../db/db.js'; // Asegúrate de importar correctamente tu pool de conexión a la base de datos

class RijndaelOpenSSL {
    constructor() {
      this.iterations = 100;
      this.pbkdfBase = '';
      this.pbkdfExtra = '';
      this.pbkdfExtracount = 0;
      this.pbkdfHashno = 0;
      this.pbkdfState = 0;
    }
  
    reset() {
      this.pbkdfBase = '';
      this.pbkdfExtra = '';
      this.pbkdfExtracount = 0;
      this.pbkdfHashno = 0;
      this.pbkdfState = 0;
    }
  
    pbkdf1(pass, salt, countBytes) {
      if (this.pbkdfState === 0) {
        this.pbkdfHashno = 0;
        this.pbkdfState = 1;
        let key = pass + salt;
        this.pbkdfBase = crypto.createHash('sha1').update(key).digest();
        for (let i = 2; i < this.iterations; i++) {
          this.pbkdfBase = crypto.createHash('sha1').update(this.pbkdfBase).digest();
        }
      }
      let result = '';
      if (this.pbkdfExtracount > 0) {
        let rlen = this.pbkdfExtra.length - this.pbkdfExtracount;
        if (rlen >= countBytes) {
          result = this.pbkdfExtra.slice(this.pbkdfExtracount, this.pbkdfExtracount + countBytes);
          if (rlen > countBytes) {
            this.pbkdfExtracount += countBytes;
          } else {
            this.pbkdfExtra = null;
            this.pbkdfExtracount = 0;
          }
          return result;
        }
        result = this.pbkdfExtra.slice(rlen, rlen + rlen);
      }
      let current = '';
      let clen = 0;
      let remain = countBytes - result.length;
      while (remain > clen) {
        if (this.pbkdfHashno === 0) {
          current = crypto.createHash('sha1').update(this.pbkdfBase).digest();
        } else if (this.pbkdfHashno < 1000) {
          let num = this.pbkdfHashno.toString();
          let tmp = num + this.pbkdfBase;
          current += crypto.createHash('sha1').update(tmp).digest();
        }
        this.pbkdfHashno++;
        clen = current.length;
      }
      result += current.slice(0, remain);
      if (clen > remain) {
        this.pbkdfExtra = current;
        this.pbkdfExtracount = remain;
      }
      return result;
    }
  
    encrypt(inputText, password) {
      this.reset();
      let salt = password.length.toString();
      let key = this.pbkdf1(password, salt, 32);
      let iv = this.pbkdf1(password, salt, 16);
      console.log('Generated IV Length:', iv.length); // Debugging IV length
      let textUTF = Buffer.from(inputText, 'utf16le');
      let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = Buffer.concat([cipher.update(textUTF), cipher.final()]);
      return encrypted.toString('base64');
    }
  }
  
  export async function cambiarPassword(usuario, passwordNueva) {
    try {
      const rijndael = new RijndaelOpenSSL();
      const encryptedPassword = rijndael.encrypt(passwordNueva, "F@R_pa$$");
      const [rows] = await pool.execute('CALL cambiar_password_conductor(?, ?)', [encryptedPassword, usuario]);
  
      return rows;
    } catch (error) {
      throw new Error('Error al cambiar la contraseña: ' + error.message);
    }
  }