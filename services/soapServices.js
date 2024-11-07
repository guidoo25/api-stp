import soap from 'soap';

export class SoapService {
  constructor(url) {
    this.url = url;
    this.client = null;
    this.lastRequest = null; // Add a property to store the last request
  }

  async initializeClient() {
    if (!this.client) {
      try {
        this.client = await soap.createClientAsync(this.url);
        console.log('SOAP client initialized successfully.');
      } catch (error) {
        console.error('Error initializing SOAP client:', error);
        throw error;
      }
    }
  }

  async registraOrden(orden) {
    await this.initializeClient();
    const args = { ordenPago: orden.toSoapFormat().ordenPago };
    console.log('SOAP request arguments:', args);

    try {
      const [result] = await this.client.registraOrdenAsync(args);
      this.lastRequest = this.client.lastRequest; // Capture the last request
      console.log('SOAP request:', this.lastRequest);
      console.log('SOAP response:', result);
      return result;
    } catch (error) {
      console.error('Error in SOAP request:', error);
      throw error;
    }
  }
}