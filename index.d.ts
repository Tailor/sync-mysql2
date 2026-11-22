// Type definitions for sync-mysql2
//
// The package is CommonJS (`module.exports = Connection`), so these use
// `export =`. Each of these then type-checks and runs:
//
//   import Connection = require('sync-mysql2');      // any TypeScript setup
//   import Connection from 'sync-mysql2';             // with esModuleInterop
//   const Connection = require('sync-mysql2');        // JavaScript with checkJs

declare namespace Connection {
  /**
   * A value that can replace a `?` placeholder or be passed to a procedure.
   * The library refuses anything else with a TypeError.
   */
  type Value = string | number | boolean | null;

  /** A row as mysql2 returns it: column name to value. */
  type Row = Record<string, any>;

  /**
   * Connection options, passed on to mysql2 (`connectionLimit` is always 1).
   * Options not listed here are passed through too.
   */
  interface ConnectionOptions {
    /** The hostname of the database you are connecting to. (Default: localhost) */
    host?: string;
    /** The port number to connect to. (Default: 3306) */
    port?: number;
    /** The path to a unix domain socket to connect to. When used, host and port are ignored. */
    socketPath?: string;
    /** The MySQL user to authenticate as */
    user?: string;
    /** The password of that MySQL user */
    password?: string;
    /** Name of the database to use for this connection */
    database?: string;
    /** The charset for the connection */
    charset?: string;
    /** The timezone configured on the MySQL server */
    timezone?: string;
    /** The milliseconds before a timeout occurs during the initial connection to the MySQL server */
    connectTimeout?: number;
    /** Allow connecting to MySQL instances that ask for the old (insecure) authentication method */
    insecureAuth?: boolean;
    /** Determines if column values should be converted to native JavaScript types */
    typeCast?: boolean | ((field: any, next: () => any) => any);
    /** A custom query format function */
    queryFormat?: (query: string, values: any) => string;
    /** When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option */
    supportBigNumbers?: boolean;
    /** Enabling both supportBigNumbers and bigNumberStrings forces big numbers to be returned as strings */
    bigNumberStrings?: boolean;
    /** Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather than inflated into JavaScript Date objects */
    dateStrings?: boolean | Array<'TIMESTAMP' | 'DATETIME' | 'DATE'>;
    /** This will print all incoming and outgoing packets on stdout */
    debug?: boolean | string[];
    /** Generates stack traces on Error to include call site of library entrance */
    trace?: boolean;
    /** Allow multiple mysql statements per query */
    multipleStatements?: boolean;
    /** Connection flags */
    flags?: string | string[];
    /** Connection SSL options: a profile name, or mysql2's SSL options */
    ssl?: string | Record<string, any>;
    [option: string]: any;
  }
}

/**
 * A synchronous MySQL connection that allows you to make blocking database queries
 */
declare class Connection {
  /**
   * Create a new synchronous MySQL connection
   * @param config Connection configuration options
   */
  constructor(config: Connection.ConnectionOptions);

  /**
   * Execute a SQL query synchronously and return the results
   * @param str SQL query string (can contain ? placeholders)
   * @param values Values for the ? placeholders (default: none)
   * @returns Array of result objects
   */
  query<T = Connection.Row>(str: string, values?: Connection.Value[]): T[];

  /**
   * Call a database stored procedure synchronously
   * @param name Name of the stored procedure
   * @param args Arguments to pass to the procedure
   * @returns Array of objects, or array of arrays if multiple result sets
   */
  call<T = any>(name: string, args: Connection.Value[]): T[] | T[][];

  /**
   * Queue a query to run in parallel with other queued queries
   * @param str SQL query string (can contain ? placeholders)
   * @param values Values for the ? placeholders (default: none)
   * @returns Function that when called will synchronously wait for and return the results
   */
  queueQuery<T = Connection.Row>(str: string, values?: Connection.Value[]): () => T[];

  /**
   * Queue a stored procedure call to run in parallel with other queued calls
   * @param name Name of the stored procedure
   * @param args Arguments to pass to the procedure
   * @returns Function that when called will synchronously wait for and return the results
   */
  queueCall<T = any>(name: string, args: Connection.Value[]): () => T[] | T[][];

  /**
   * Wait for all queued queries and calls to complete
   */
  finishAll(): void;

  /**
   * Execute a SQL update/insert/delete query synchronously
   * Alias for query()
   * @param str SQL query string (can contain ? placeholders)
   * @param values Values for the ? placeholders (default: none)
   * @returns Array of result objects
   */
  update<T = Connection.Row>(str: string, values?: Connection.Value[]): T[];

  /**
   * Queue an update/insert/delete query to run in parallel
   * Alias for queueQuery()
   * @param str SQL query string (can contain ? placeholders)
   * @param values Values for the ? placeholders (default: none)
   * @returns Function that when called will synchronously wait for and return the results
   */
  queueUpdate<T = Connection.Row>(str: string, values?: Connection.Value[]): () => T[];

  /**
   * Get a single record from a table by its id (the table needs an `id` column)
   * @param table Name of the table
   * @param id The id of the record to retrieve
   * @returns The record object or undefined if not found
   */
  getRecord<T = Connection.Row>(table: string, id: string | number): T | undefined;

  /**
   * Close the database connection
   */
  dispose(): void;
}

export = Connection;
