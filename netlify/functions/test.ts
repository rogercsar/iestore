import type { Handler } from '@netlify/functions';
import { Pool } from 'pg';

// Database configuration (prefers DATABASE_URL when provided, supports Supabase SSL)
const connectionString = process.env.DATABASE_URL;

const dbConfig = {
  host: process.env.DB_HOST || 'iestore-iestore.b.aivencloud.com',
  port: parseInt(process.env.DB_PORT || '15158'),
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 300,
    })
  : new Pool({
      ...dbConfig,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 300,
    });

const handler: Handler = async (event) => {
  try {
    console.log('Test function called with:', event);
    
    // Test database connection
    const client = await pool.connect();
    
    try {
      // Test basic query
      const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
      const dbInfo = result.rows[0];
      
      // Get table counts
      const tablesResult = await client.query(`
        SELECT 
          'products' as table_name, COUNT(*) as count FROM products
        UNION ALL
        SELECT 
          'customers' as table_name, COUNT(*) as count FROM customers
        UNION ALL
        SELECT 
          'sales' as table_name, COUNT(*) as count FROM sales
      `);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
        body: JSON.stringify({
          message: 'Netlify functions with PostgreSQL are working!',
          timestamp: new Date().toISOString(),
          method: event.httpMethod,
          path: event.path,
          query: event.queryStringParameters,
          database: {
            connected: true,
            currentTime: dbInfo.current_time,
            version: dbInfo.postgres_version,
            tables: tablesResult.rows
          }
        }),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Test function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }),
    };
  }
};

export { handler };