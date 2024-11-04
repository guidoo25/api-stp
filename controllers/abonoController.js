import { SOAP_URL } from '../config/config.js';
import { Abono } from '../models/sendPago.js';
import { SoapService } from '../services/soapServices.js';

export class AbonoController {
  constructor() {
    this.soapService = new SoapService(SOAP_URL);
  }

  async sendAbono(req, res) {
    try {
      const camposObligatorios = [
        'empresa', 'fechaOperacion', 'folioOrigen', 'claveRastreo', 'institucionOperante',
        'monto', 'tipoPago', 'tipoCuentaBeneficiario', 'nombreBeneficiario', 'cuentaBeneficiario',
        'rfcCurpBeneficiario', 'conceptoPago', 'referenciaNumerica', 'topologia', 'usuario',
        'medioEntrega', 'prioridad'
      ];

      const camposFaltantes = camposObligatorios.filter(campo => !req.body[campo]);

      if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}` });
      }

      const abono = new Abono(req.body);
      const [result] = await this.soapService.sendAbono(abono);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}