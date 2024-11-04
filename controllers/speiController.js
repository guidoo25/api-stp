import CuentaPersonaFisica from "../models/CuentaPersonaFisica.js";

class SpeiController {
  constructor(soapService) {
    this.soapService = soapService;
  }

  async handleAltaCuentaPersonaFisica(req, res) {
    try {
      const soapArgs = this.convertToSoapArgs(req.body);
      const result = await this.soapService.callMethod('altaCuentaPersonaFisica', soapArgs);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  convertToSoapArgs(jsonData) {
    const cuentaPersonaFisica = new CuentaPersonaFisica(jsonData);  
    CuentaPersonaFisica.validate(jsonData); 
    return {
      requestCuentaPersonaFisica: cuentaPersonaFisica 
    };
  }

  
  async registraOrden(req, res) {
    try {
      const ordenPago = new OrdenPago(req.body.ordenPago);
      const token = req.body.token;

      const [result] = await this.soapService.registraOrden(ordenPago, token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
}

export default SpeiController;

