import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  try {
    console.log('Test function called with:', event);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        message: 'Test function is working!',
        timestamp: new Date().toISOString(),
        method: event.httpMethod,
        path: event.path,
        query: event.queryStringParameters,
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
      }),
    };
  }
};

export { handler };
