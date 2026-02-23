/**
 * Database Client
 *
 * Thin wrapper around `pg.Pool` providing:
 * - Connection pool lifecycle (connect / close)
 * - Transaction helper (`withTransaction`)
 * - Raw query execution
 *
 * @module fhir-persistence/db
 */

import pg from 'pg';
import type { DatabaseConfig } from './config.js';

const { Pool } = pg;
type PoolClient = pg.PoolClient;

export class DatabaseClient {
  private pool: pg.Pool;
  private _closed = false;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  /**
   * Execute a SQL query against the pool.
   */
  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(text, values);
  }

  /**
   * Execute a callback within a database transaction.
   *
   * - Automatically calls `BEGIN` before and `COMMIT` after.
   * - Calls `ROLLBACK` if the callback throws.
   * - Returns the callback's return value.
   */
  async withTransaction<T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple SQL statements sequentially (e.g. DDL).
   *
   * Each statement is executed individually. Errors are collected
   * and returned; execution continues on failure.
   */
  async executeStatements(
    statements: string[],
    options?: { stopOnError?: boolean },
  ): Promise<{ executed: number; errors: Array<{ index: number; sql: string; error: string }> }> {
    const errors: Array<{ index: number; sql: string; error: string }> = [];
    let executed = 0;

    for (let i = 0; i < statements.length; i++) {
      try {
        await this.pool.query(statements[i]);
        executed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ index: i, sql: statements[i].slice(0, 200), error: message });
        if (options?.stopOnError) {
          break;
        }
      }
    }

    return { executed, errors };
  }

  /**
   * Check if the database connection is alive.
   */
  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close the connection pool.
   */
  async close(): Promise<void> {
    if (!this._closed) {
      this._closed = true;
      await this.pool.end();
    }
  }

  get isClosed(): boolean {
    return this._closed;
  }
}
