import { Handler } from '@netlify/functions';
import { Pool } from 'pg';

// Database configuration for Aiven PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'iestore-iestore.b.aivencloud.com',
  port: parseInt(process.env.DB_PORT || '15158'),
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(dbConfig);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { table, action = 'list' } = event.queryStringParameters || {};
    
    if (!table) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Table parameter is required' }),
      };
    }

    const client = await pool.connect();

    try {
      switch (table) {
        case 'products':
          return await handleProducts(event, client, headers, action);
        case 'customers':
          return await handleCustomers(event, client, headers, action);
        case 'sales':
          return await handleSales(event, client, headers, action);
        case 'users':
          await ensureUsersTable(client);
          await ensureAdminUser(client);
          return await handleUsers(event, client, headers);
        case 'promotions':
          await ensurePromotionsTable(client);
          return await handlePromotions(event, client, headers);
        case 'campaigns':
          await ensureCampaignsTable(client);
          return await handleCampaigns(event, client, headers);
        case 'dashboard':
          return await handleDashboard(event, client, headers);
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Unknown table: ${table}` }),
          };
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Database error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};

async function handleProducts(event: any, client: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    // List products
    const result = await client.query(`
      SELECT name, quantity, cost, unit_price as "unitPrice", photo
      FROM products 
      ORDER BY name
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows),
    };
  } else if (event.httpMethod === 'POST') {
    // Create or update product
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    
    if (mode === 'append' && rows && rows.length > 0) {
      const product = rows[0];
      await client.query(`
        INSERT INTO products (name, quantity, cost, unit_price, photo)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) 
        DO UPDATE SET 
          quantity = EXCLUDED.quantity,
          cost = EXCLUDED.cost,
          unit_price = EXCLUDED.unit_price,
          photo = EXCLUDED.photo,
          updated_at = CURRENT_TIMESTAMP
      `, [product.name, product.quantity, product.cost, product.unitPrice, product.photo || null]);
    } else if (mode === 'overwrite' && rows) {
      // Clear existing products and insert new ones
      await client.query('DELETE FROM products');
      for (const product of rows) {
        await client.query(`
          INSERT INTO products (name, quantity, cost, unit_price, photo)
          VALUES ($1, $2, $3, $4, $5)
        `, [product.name, product.quantity, product.cost, product.unitPrice, product.photo || null]);
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }
  
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function ensurePromotionsTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS promotions (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "discountPercent" numeric NOT NULL,
      "startAt" timestamptz NOT NULL,
      "endAt" timestamptz NOT NULL,
      "products" jsonb NOT NULL DEFAULT '[]',
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function ensureCampaignsTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "promotionIds" jsonb NOT NULL DEFAULT '[]',
      "audience" text NOT NULL DEFAULT 'todos',
      "channel" text NOT NULL,
      "publicId" text UNIQUE,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function ensureUsersTable(client: any) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      username text UNIQUE,
      password text,
      role text NOT NULL DEFAULT 'user',
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  // add columns if missing (idempotent)
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password text`);
}

async function handlePromotions(event: any, client: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const result = await client.query(`
      SELECT 
        "id", 
        "name", 
        "discountPercent", 
        "startAt", 
        "endAt", 
        "products"
      FROM promotions
      ORDER BY "startAt" DESC
    `);
    return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const p = rows[0];
      await client.query(`
        INSERT INTO promotions ("name","discountPercent","startAt","endAt","products")
        VALUES ($1,$2,$3,$4,$5)
      `, [p.name, p.discountPercent, p.startAt, p.endAt, JSON.stringify(p.products || [])]);
    } else if (mode === 'overwrite' && rows) {
      await client.query('DELETE FROM promotions');
      for (const p of rows) {
        await client.query(`
          INSERT INTO promotions ("name","discountPercent","startAt","endAt","products")
          VALUES ($1,$2,$3,$4,$5)
        `, [p.name, p.discountPercent, p.startAt, p.endAt, JSON.stringify(p.products || [])]);
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleCampaigns(event: any, client: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const result = await client.query(`
      SELECT 
        "id",
        "name",
        "promotionIds",
        "audience",
        "channel",
        "publicId"
      FROM campaigns
      ORDER BY "createdAt" DESC
    `);
    return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const c = rows[0];
      await client.query(`
        INSERT INTO campaigns ("name","promotionIds","audience","channel","publicId")
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT ("publicId") DO NOTHING
      `, [c.name, JSON.stringify(c.promotionIds || []), c.audience || 'todos', c.channel || 'whatsapp', c.publicId || null]);
    } else if (mode === 'overwrite' && rows) {
      await client.query('DELETE FROM campaigns');
      for (const c of rows) {
        await client.query(`
          INSERT INTO campaigns ("name","promotionIds","audience","channel","publicId")
          VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT ("publicId") DO NOTHING
        `, [c.name, JSON.stringify(c.promotionIds || []), c.audience || 'todos', c.channel || 'whatsapp', c.publicId || null]);
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleUsers(event: any, client: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const result = await client.query(`
      SELECT id, name, email, username, role, status
      FROM users
      ORDER BY created_at DESC
    `);
    return { statusCode: 200, headers, body: JSON.stringify(result.rows) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    // Accept both { action, data } and { mode, rows }
    const action = body.action || body.mode;
    const data = body.data || body.rows;
    if (action === 'append' && Array.isArray(data) && data.length > 0) {
      const u = data[0];
      await client.query(
        `INSERT INTO users (id, name, email, username, password, role, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           username = COALESCE(EXCLUDED.username, users.username),
           password = COALESCE(EXCLUDED.password, users.password),
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           updated_at = CURRENT_TIMESTAMP`,
        [u.id, u.name, u.email, u.username || null, u.password || null, u.role || 'user', u.status || 'active']
      );
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    if (action === 'overwrite' && body.id) {
      // Partial update by id
      const id = body.id;
      const patch = data || {};
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;
      if (typeof patch.name === 'string') { fields.push(`name = $${++idx}`); values.push(patch.name); }
      if (typeof patch.email === 'string') { fields.push(`email = $${++idx}`); values.push(patch.email); }
      if (typeof patch.username === 'string') { fields.push(`username = $${++idx}`); values.push(patch.username); }
      if (typeof patch.password === 'string') { fields.push(`password = $${++idx}`); values.push(patch.password); }
      if (typeof patch.role === 'string') { fields.push(`role = $${++idx}`); values.push(patch.role); }
      if (typeof patch.status === 'string') { fields.push(`status = $${++idx}`); values.push(patch.status); }
      if (fields.length > 0) {
        await client.query(
          `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [id, ...values]
        );
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    if (action === 'delete' && body.id) {
      await client.query(`DELETE FROM users WHERE id = $1`, [body.id]);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid users action' }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function ensureAdminUser(client: any) {
  // Seed admin user if username not present
  const username = 'adiestore';
  const password = 'Admin@iestore1';
  const check = await client.query(`SELECT 1 FROM users WHERE username = $1 LIMIT 1`, [username]);
  if (check.rowCount && check.rowCount > 0) return;
  await client.query(
    `INSERT INTO users (id, name, email, username, password, role, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO NOTHING`,
    [
      'user_admin_adistore',
      'Admin IEStore',
      'admin@iestore.local',
      username,
      password,
      'admin',
      'active'
    ]
  );
}

async function handleCustomers(event: any, client: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    // List customers
    const result = await client.query(`
      SELECT 
        id, name, phone, email, address, total_purchases as "totalPurchases",
        total_value as "totalValue", pending_amount as "pendingAmount",
        last_purchase as "lastPurchase", notes,
        'active' as status
      FROM customers 
      ORDER BY name
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows),
    };
  } else if (event.httpMethod === 'POST') {
    // Create or update customer
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    
    if (mode === 'append' && rows && rows.length > 0) {
      const customer = rows[0];
      await client.query(`
        INSERT INTO customers (
          id, name, phone, email, address, total_purchases, total_value,
          pending_amount, last_purchase, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          address = EXCLUDED.address,
          total_purchases = EXCLUDED.total_purchases,
          total_value = EXCLUDED.total_value,
          pending_amount = EXCLUDED.pending_amount,
          last_purchase = EXCLUDED.last_purchase,
          notes = EXCLUDED.notes,
          updated_at = CURRENT_TIMESTAMP
      `, [
        customer.id || `customer_${Date.now()}`,
        customer.name,
        customer.phone || null,
        customer.email || null,
        customer.address || null,
        customer.totalPurchases || 0,
        customer.totalValue || 0,
        customer.pendingAmount || 0,
        customer.lastPurchase || null,
        customer.notes || null
      ]);
    } else if (mode === 'overwrite' && rows) {
      // Clear existing customers and insert new ones
      await client.query('DELETE FROM customers');
      for (const customer of rows) {
        await client.query(`
          INSERT INTO customers (
            id, name, phone, email, address, total_purchases, total_value,
            pending_amount, last_purchase, notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          customer.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customer.name,
          customer.phone || null,
          customer.email || null,
          customer.address || null,
          customer.totalPurchases || 0,
          customer.totalValue || 0,
          customer.pendingAmount || 0,
          customer.lastPurchase || null,
          customer.notes || null
        ]);
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }
  
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function handleSales(event: any, client: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    // List sales
    const result = await client.query(`
      SELECT 
        s.id,
        s.date_iso as "dateISO",
        s.product,
        s.quantity,
        s.total_value as "totalValue",
        s.total_cost as "totalCost",
        s.profit,
        s.customer_name as "customerName",
        s.customer_phone as "customerPhone",
        s.payment_method as "paymentMethod",
        s.status,
        s.sale_type as "saleType"
      FROM sales s
      ORDER BY s.date_iso DESC
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows),
    };
  } else if (event.httpMethod === 'POST') {
    // Create sale
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    
    if (mode === 'append' && rows && rows.length > 0) {
      const sale = rows[0];
      const result = await client.query(`
        INSERT INTO sales (
          date_iso, product, quantity, total_value, total_cost, profit,
          customer_name, customer_phone, payment_method, status, sale_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'sale')
        RETURNING id
      `, [
        sale.dateISO || new Date().toISOString(),
        sale.product,
        sale.quantity,
        sale.totalValue,
        sale.totalCost,
        sale.profit,
        sale.customerName || null,
        sale.customerPhone || null,
        sale.paymentMethod || null,
        sale.status || 'paid'
      ]);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: result.rows[0].id }),
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  }
  
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function handleDashboard(event: any, client: any, headers: any) {
  // Get dashboard summary
  const [productsResult, salesResult, customersResult] = await Promise.all([
    client.query('SELECT COUNT(*) as count FROM products'),
    client.query('SELECT COUNT(*) as count, SUM(total_value) as total_value, SUM(profit) as total_profit FROM sales'),
    client.query('SELECT COUNT(*) as count FROM customers')
  ]);
  
  const products = productsResult.rows[0];
  const sales = salesResult.rows[0];
  const customers = customersResult.rows[0];
  
  // Get recent sales
  const recentSalesResult = await client.query(`
    SELECT 
      s.id,
      s.date_iso as "dateISO",
      s.product,
      s.quantity,
      s.total_value as "totalValue",
      s.total_cost as "totalCost",
      s.profit,
      s.customer_name as "customerName",
      s.customer_phone as "customerPhone",
      s.payment_method as "paymentMethod",
      s.status
    FROM sales s
    ORDER BY s.date_iso DESC
    LIMIT 5
  `);
  
  // Get low stock products
  const lowStockResult = await client.query(`
    SELECT name, quantity 
    FROM products 
    WHERE quantity < 10 
    ORDER BY quantity ASC
    LIMIT 5
  `);
  
  const dashboardData = {
    totalSalesValue: parseFloat(sales.total_value || '0'),
    totalProfit: parseFloat(sales.total_profit || '0'),
    totalProducts: parseInt(products.count),
    totalCustomers: parseInt(customers.count),
    lowStockProducts: lowStockResult.rows.length,
    recentSales: recentSalesResult.rows,
    topProducts: lowStockResult.rows.map(p => ({ name: p.name, quantity: p.quantity }))
  };
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(dashboardData),
  };
}
