import { OrdenPago } from '../models/ordenPago.js';
import { SoapService } from '../services/soapServices.js';
import axios from 'axios';
import https from 'https';

export class OrdenController {
  constructor() {
    this.apiUrl = 'https://demo.stpmex.com:7024/speiws/rest/ordenPago/registra';
  }

  async registraOrden(req, res) {
    try {
      const camposObligatorios = [
        'empresa', 'monto', 'claveRastreo', 'conceptoPago', 'cuentaBeneficiario',
        'institucionContraparte', 'institucionOperante', 'nombreBeneficiario',
        'referenciaNumerica', 'tipoCuentaBeneficiario', 'cuentaOrdenante',
        'rfcCurpBeneficiario', 'tipoPago', 'topologia', 'fechaOperacion'
      ];

      const camposFaltantes = camposObligatorios.filter(campo => !req.body[campo]);

      if (camposFaltantes.length > 0) {
        return res.status(400).json({ error: `Campos obligatorios faltantes: ${camposFaltantes.join(', ')}` });
      }

      const ordenPago = new OrdenPago(req.body);
      await ordenPago.generarFirma();

      const response = await axios.put(this.apiUrl, ordenPago, {
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false
        })
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error en registraOrden:', error);
      res.status(500).json({ error: error.response?.data || error.message });
    }
  }
}