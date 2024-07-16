
import {pool} from '../db/db.js';


export async function crearEmpresa(datosEmpresa) {
    try {
      const connection = await pool.getConnection();
      const result = await connection.query('CALL crear_empresa(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
        datosEmpresa.txt_empresa,
        datosEmpresa.txt_usuario,
        datosEmpresa.txt_correo,
        datosEmpresa.txt_password,
        datosEmpresa.txt_nombres,
        datosEmpresa.txt_apellidos,
        datosEmpresa.txt_tipo_identificacion,
        datosEmpresa.txt_documento,
        datosEmpresa.txt_celular,
        datosEmpresa.txt_telefono,
        datosEmpresa.txt_direccion,
        datosEmpresa.txt_foto,
        datosEmpresa.txt_sangre,
        datosEmpresa.txt_genero,
        datosEmpresa.txt_estado_civil,
        datosEmpresa.txt_tipo_licencia,
        datosEmpresa.txt_num_licencia,
        datosEmpresa.txt_fecha_caducidad_licencia,
        datosEmpresa.txt_id_padre,
        datosEmpresa.txt_id_rol,
        datosEmpresa.txt_id_ubicacion,
        datosEmpresa.txt_tipo_ubicacion,
        datosEmpresa.txt_idpais,
        datosEmpresa.txt_idzona,
        datosEmpresa.txt_idciudad,
        datosEmpresa.idMotorBusqueda
      ]);
      connection.release();
      return result[0];
    } catch (error) {
      throw error;
    }
  }