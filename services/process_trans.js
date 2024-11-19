import { Transaction, Estado, EventType, Event } from '../models/sendPago.js';
import { DatabaseService } from './procesar.js';
import * as Sentry from '@sentry/node';

class TransactionService {
  constructor() {
    this.CLABES_BLOCKED = process.env.CLABES_BLOCKED?.split(',') || [];
    this.dbService = new DatabaseService();
  }

  async processIncomingTransaction(incomingTransaction, eventType) {
    let transaction;

    try {
      // Validate and transform the transaction
      transaction = {
        ...incomingTransaction,
        fechaOperacion: new Date(incomingTransaction.fechaOperacion),
        estado: Estado.Succeeded
      };

      // Check blocked CLABEs
      if (
        this.CLABES_BLOCKED.includes(transaction.cuentaBeneficiario) ||
        this.CLABES_BLOCKED.includes(transaction.cuentaOrdenante)
      ) {
        Sentry.captureMessage('Transacción retenida');
        throw new Error('CLABE bloqueada');
      }

      // Validate account (implement your own logic here)
      if (!this.isValidAccount(transaction)) {
        transaction.estado = Estado.Rejected;
      }

      // Process the transaction (implement your own logic here)
      const result = await this.dbService.saveTransaction(transaction);
      return result;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  isValidAccount(transaction) {
    // Implement your account validation logic here
    return true;
  }
}

export { TransactionService };