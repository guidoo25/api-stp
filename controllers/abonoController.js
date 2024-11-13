import { SoapService } from '../services/soapServices.js';
import { SOAP_URL } from '../config/config.js';

export class AbonoController {
  constructor() {
    this.soapService = new SoapService(SOAP_URL);
  }

  async sendAbono(req, res) {
    try {
      const abonoData = req.body;
      
      // Validate required fields
      const requiredFields = [
        'fechaOperacion', 'institucionOrdenante', 'institucionBeneficiaria',
        'claveRastreo', 'monto', 'nombreOrdenante', 'tipoCuentaOrdenante',
        'cuentaOrdenante', 'rfcCurpOrdenante', 'nombreBeneficiario',
        'tipoCuentaBeneficiario', 'cuentaBeneficiario', 'rfcCurpBeneficiario',
        'conceptoPago', 'referenciaNumerica', 'empresa', 'tipoPago'
      ];

      for (const field of requiredFields) {
        if (!abonoData[field]) {
          return res.status(400).json({ error: `El campo ${field} es requerido` });
        }
      }

      const result = await this.soapService.sendAbono(abonoData);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error en sendAbono:', error);
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }
}