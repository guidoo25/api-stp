import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs/promises';

class STPClient {
  constructor(config) {
    this.config = config;
    this.baseURL = 'https://demo.stpmex.com:7024/speiws/rest';
  }

  async loadPrivateKey() {
    if (!this.privateKey) {
      this.privateKey = await fs.readFile(this.config.privateKeyPath, 'utf8');
    }
    return this.privateKey;
  }

  async generateSignature(data) {
    const privateKey = await this.loadPrivateKey();
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(this.generateOriginalString(data));
    return sign.sign({ key: privateKey, passphrase: this.config.privateKeyPassphrase }, 'base64');
  }

  generateOriginalString(data) {
    const fields = [
      '', '', data.institucionContraparte, data.empresa, data.fechaOperacion,
      '', data.claveRastreo, data.institucionOperante, data.monto,
      data.tipoPago, data.tipoCuentaOrdenante, data.nombreOrdenante,
      data.cuentaOrdenante, data.rfcCurpOrdenante, data.tipoCuentaBeneficiario,
      data.nombreBeneficiario, data.cuentaBeneficiario, data.rfcCurpBeneficiario,
      data.emailBeneficiario, '', '', '', '', data.conceptoPago, '',
      '', '', '', '', data.referenciaNumerica, '', data.topologia,
      '', data.medioEntrega, data.prioridad, '', '', ''
    ];
    return `||${fields.join('|')}||`;
  }

  async registraOrden(ordenData) {
    const data = {
      ...ordenData,
      empresa: this.config.empresa,
      fechaOperacion: new Date().toISOString().split('T')[0].replace(/-/g, ''),
    };

    data.firma = await this.generateSignature(data);

    try {
      const response = await axios.put(
        `${this.baseURL}/ordenPago/registra`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'stpmex-node/1.0.0',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al registrar la orden:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

export default STPClient;