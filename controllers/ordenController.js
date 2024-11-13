import { SoapService } from '../services/soapServices.js';
import { SOAP_URL } from '../config/config.js';
import { OrdenPago } from '../models/ordenPago.js';


export class OrdenController {
  constructor() {
    this.soapService = new SoapService(SOAP_URL);
  }

  async registraOrden(req, res) {
    try {
      const ordenData = req.body;
      
      const camposRequeridos = [
        'claveRastreo',
        'conceptoPago',
        'cuentaBeneficiario',
        'cuentaOrdenante',
        'institucionContraparte',
        'institucionOperante',
        'monto',
        'nombreBeneficiario',
        'referenciaNumerica',
        'tipoCuentaBeneficiario',
        'tipoCuentaOrdenante',
        'tipoPago'
      ];
      
      for (const campo of camposRequeridos) {
        if (!ordenData[campo]) {
          return res.status(400).json({ error: `El campo ${campo} es requerido` });
        }
      }

      const orden = new OrdenPago(ordenData);
      await orden.generarFirma();

      console.log('Datos de la orden:', JSON.stringify(orden, null, 2));

      const resultado = await this.soapService.registraOrden(orden);

      console.log('SOAP Request:', this.soapService.lastRequest);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('Error en registraOrden:', error);
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }
}