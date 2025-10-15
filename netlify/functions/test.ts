import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const handler: Handler = async (event) => {
  try {
    console.log('Test function called with:', event);
    if (!supabase) {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
    }

    // Test basic queries using Supabase API
    const tables: any[] = [];
    const now = new Date().toISOString();

    const countFor = async (table: string) => {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.warn(`Count error for ${table}:`, error.message);
        return { table_name: table, count: 0, error: error.message };
      }
      return { table_name: table, count: count || 0 };
    };

    tables.push(await countFor('products'));
    tables.push(await countFor('customers'));
    tables.push(await countFor('sales'));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        message: 'Netlify functions with Supabase API are working!',
        timestamp: now,
        method: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters,
        database: {
          connected: true,
          currentTime: now,
          tables
        }
      }),
    };
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