declare module 'sync-mysql2' {
  /**
   * MySQL connection configuration options
   */
  export interface ConnectionOptions {
    /** The hostname of the database you are connecting to. (Default: localhost) */
    host?: string;
    /** The port number to connect to. (Default: 3306) */
    port?: number;
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
    typeCast?: boolean;
    /** A custom query format function */
    queryFormat?: (query: string, values: any) => string;
    /** When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option */
    supportBigNumbers?: boolean;
    /** Enabling both supportBigNumbers and bigNumberStrings forces big numbers to be returned as strings */
    bigNumberStrings?: boolean;
    /** Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather than inflated into JavaScript Date objects */
    dateStrings?: boolean | string[];
    /** This will print all incoming and outgoing packets on stdout */
    debug?: boolean | string[];
    /** Generates stack traces on Error to include call site of library entrance */
    trace?: boolean;
    /** Allow multiple mysql statements per query */
    multipleStatements?: boolean;
    /** Connection flags */
    flags?: string | string[];
    /** Connection SSL options */
    ssl?: any;
  }

  /**
   * A synchronous MySQL connection that allows you to make blocking database queries
   */
  export default class Connection {
    /**
     * Create a new synchronous MySQL connection
     * @param config Connection configuration options
     */
    constructor(config: ConnectionOptions);

    /**
     * Execute a SQL query synchronously and return the results
     * @param str SQL query string (can contain ? placeholders)
     * @param values Optional array of values to replace ? placeholders
     * @returns Array of result objects
     */
    query<T = any>(str: string, values?: any[]): T[];

    /**
     * Call a database stored procedure synchronously
     * @param name Name of the stored procedure
     * @param args Array of arguments to pass to the procedure
     * @returns Array of objects, or array of arrays if multiple result sets
     */
    call<T = any>(name: string, args: any[]): T[] | T[][];

    /**
     * Queue a query to run in parallel with other queued queries
     * @param str SQL query string (can contain ? placeholders)
     * @param values Optional array of values to replace ? placeholders
     * @returns Function that when called will synchronously wait for and return the results
     */
    queueQuery<T = any>(str: string, values?: any[]): () => T[];

    /**
     * Queue a stored procedure call to run in parallel with other queued calls
     * @param name Name of the stored procedure
     * @param args Array of arguments to pass to the procedure
     * @returns Function that when called will synchronously wait for and return the results
     */
    queueCall<T = any>(name: string, args: any[]): () => T[] | T[][];

    /**
     * Wait for all queued queries and calls to complete
     */
    finishAll(): void;

    /**
     * Execute a SQL update/insert/delete query synchronously
     * Alias for query()
     * @param str SQL query string (can contain ? placeholders)
     * @param values Optional array of values to replace ? placeholders
     * @returns Array of result objects
     */
    update<T = any>(str: string, values?: any[]): T[];

    /**
     * Queue an update/insert/delete query to run in parallel
     * Alias for queueQuery()
     * @param str SQL query string (can contain ? placeholders)
     * @param values Optional array of values to replace ? placeholders
     * @returns Function that when called will synchronously wait for and return the results
     */
    queueUpdate<T = any>(str: string, values?: any[]): () => T[];

    /**
     * Get a single record from a table by its id
     * @param table Name of the table
     * @param id The id of the record to retrieve
     * @returns The record object or undefined if not found
     */
    getRecord<T = any>(table: string, id: string | number): T | undefined;

    /**
     * Close the database connection
     */
    dispose(): void;
  }
}
