import { EventType } from '../models/sendPago.js';
import { TransactionService } from '../services/process_trans.js';

class TransactionController {
  constructor() {
    this.transactionService = new TransactionService();
  }

  async processTransaction(req, res) {
    try {
      const result = await this.transactionService.processIncomingTransaction(
        req.body,
        EventType.Created
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error processing transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export { TransactionController };