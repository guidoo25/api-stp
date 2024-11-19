import { pool } from '../db/db.js';

export class DatabaseService {
  constructor() {
    this.pool = pool;
  }

  async insertTransaction(transaction) {
    const [result] = await this.pool.execute(
      'INSERT INTO transactions SET ?',
      transaction
    );
    return result;
  }

  async insertEvent(event) {
    const [result] = await this.pool.execute(
      'INSERT INTO events SET ?',
      event
    );
    return result;
  }

  async getTransactionById(id) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async updateTransactionState(id, estado) {
    const [result] = await this.pool.execute(
      'UPDATE transactions SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result;
  }
}