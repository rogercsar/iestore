import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase client configuration for serverless functions
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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

    if (!supabase) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY' }),
      };
    }
    switch (table) {
      case 'auth':
        return await handleAuth(event, headers);
      case 'products':
        return await handleProducts(event, headers, action);
      case 'customers':
        return await handleCustomers(event, headers, action);
      case 'sales':
        return await handleSales(event, headers, action);
      case 'users':
        if (process.env.ENABLE_ADMIN_SEED === 'true') {
          await ensureAdminUser();
        }
        return await handleUsers(event, headers);
      case 'promotions':
        return await handlePromotions(event, headers);
      case 'campaigns':
        return await handleCampaigns(event, headers);
      case 'dashboard':
        return await handleDashboard(event, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Unknown table: ${table}` }),
        };
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

async function ensureProductsTable(client: any) {
  // Primeiro, verificar se a tabela existe e se tem o campo id
  const tableExists = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'products'
    )
  `);
  
  if (tableExists.rows[0].exists) {
    // Verificar se a tabela tem o campo id
    const hasIdColumn = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'id'
      )
    `);
    
    if (!hasIdColumn.rows[0].exists) {
      console.log('🔄 Adicionando coluna id à tabela products...');
      // Adicionar coluna id
      await client.query(`
        ALTER TABLE products ADD COLUMN id TEXT
      `);
      
      // Atualizar registros existentes com IDs únicos
      const existingProducts = await client.query('SELECT name FROM products WHERE id IS NULL');
      for (let i = 0; i < existingProducts.rows.length; i++) {
        const productName = existingProducts.rows[i].name;
        const newId = `product_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 6)}`;
        await client.query(`
          UPDATE products SET id = $1 WHERE name = $2
        `, [newId, productName]);
      }
      
      // Tornar id PRIMARY KEY
      await client.query(`
        ALTER TABLE products ADD PRIMARY KEY (id)
      `);
      
      console.log('✅ Coluna id adicionada com sucesso!');
    }
  } else {
    // Criar tabela nova com campo id
    await client.query(`
      CREATE TABLE products (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        quantity INTEGER DEFAULT 0,
        cost DECIMAL(10,2) DEFAULT 0,
        unit_price DECIMAL(10,2) DEFAULT 0,
        photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}

async function handleProducts(event: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('products')
      .select('id, name, quantity, cost, unit_price, photo')
      .order('name', { ascending: true });
    if (error) throw error;
    const out = (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      quantity: Number(r.quantity || 0),
      cost: Number(r.cost || 0),
      unitPrice: Number(r.unit_price || 0),
      photo: r.photo || null,
    }));
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    const toProductRow = (p: any) => ({
      id: p.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: p.name,
      quantity: p.quantity || 0,
      cost: p.cost || 0,
      unit_price: p.unitPrice ?? p.unit_price ?? 0,
      photo: p.photo || null,
    });
    if (mode === 'append' && rows && rows.length > 0) {
      const product = toProductRow(rows[0]);
      const { error } = await supabase!.from('products').upsert([product], { onConflict: 'name' });
      if (error) throw error;
    } else if (mode === 'overwrite' && rows) {
      const { error: delError } = await supabase!.from('products').delete().not('id', 'is', null);
      if (delError) throw delError;
      const payload = (rows || []).map(toProductRow);
      const { error: upError } = await supabase!.from('products').upsert(payload, { onConflict: 'name' });
      if (upError) throw upError;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
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
      phone text,
      photo text,
      role text NOT NULL DEFAULT 'user',
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  // add columns if missing (idempotent)
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username text UNIQUE`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password text`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text`);
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo text`);
}

async function handlePromotions(event: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('promotions')
      .select('id, name, discountPercent, startAt, endAt, products')
      .order('startAt', { ascending: false });
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data || []) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const p = rows[0];
      const { error } = await supabase!
        .from('promotions')
        .insert([{ name: p.name, discountPercent: p.discountPercent, startAt: p.startAt, endAt: p.endAt, products: p.products || [] }]);
      if (error) throw error;
    } else if (mode === 'overwrite' && rows) {
      const { error: delError } = await supabase!.from('promotions').delete().not('id', 'is', null);
      if (delError) throw delError;
      const payload = (rows || []).map((p: any) => ({ name: p.name, discountPercent: p.discountPercent, startAt: p.startAt, endAt: p.endAt, products: p.products || [] }));
      const { error: insError } = await supabase!.from('promotions').insert(payload);
      if (insError) throw insError;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleCampaigns(event: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('campaigns')
      .select('id, name, promotionIds, audience, channel, publicId, createdAt')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    const out = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      promotionIds: c.promotionIds || [],
      audience: c.audience || 'todos',
      channel: c.channel,
      publicId: c.publicId || null,
    }));
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const c = rows[0];
      const payload = [{
        name: c.name,
        promotionIds: c.promotionIds || [],
        audience: c.audience || 'todos',
        channel: c.channel || 'whatsapp',
        publicId: c.publicId || null,
      }];
      const { error } = await supabase!.from('campaigns').upsert(payload, { onConflict: 'publicId' });
      if (error) throw error;
    } else if (mode === 'overwrite' && rows) {
      const { error: delError } = await supabase!.from('campaigns').delete().not('id', 'is', null);
      if (delError) throw delError;
      const payload = (rows || []).map((c: any) => ({
        name: c.name,
        promotionIds: c.promotionIds || [],
        audience: c.audience || 'todos',
        channel: c.channel || 'whatsapp',
        publicId: c.publicId || null,
      }));
      const { error: insError } = await supabase!.from('campaigns').insert(payload);
      if (insError) throw insError;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleUsers(event: any, headers: any) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('users')
      .select('id, name, email, username, phone, photo, role, status, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { statusCode: 200, headers, body: JSON.stringify(data || []) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const action = body.action || body.mode;
    const data = body.data || body.rows;
    if (action === 'append' && Array.isArray(data) && data.length > 0) {
      const u = data[0];
      const payload = [{
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username ?? null,
        password: u.password ?? null,
        phone: u.phone ?? null,
        photo: u.photo ?? null,
        role: u.role ?? 'user',
        status: u.status ?? 'active',
      }];
      const { error } = await supabase!.from('users').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    if (action === 'overwrite' && body.id) {
      const id = body.id;
      const patch = data || {};
      const update: any = {};
      if (typeof patch.name === 'string') update.name = patch.name;
      if (typeof patch.email === 'string') update.email = patch.email;
      if (typeof patch.username === 'string') update.username = patch.username;
      if (typeof patch.password === 'string') update.password = patch.password;
      if (typeof patch.phone === 'string') update.phone = patch.phone;
      if (typeof patch.photo === 'string') update.photo = patch.photo;
      if (typeof patch.role === 'string') update.role = patch.role;
      if (typeof patch.status === 'string') update.status = patch.status;
      if (Object.keys(update).length > 0) {
        const { error } = await supabase!.from('users').update(update).eq('id', id);
        if (error) throw error;
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    if (action === 'delete' && body.id) {
      const { error } = await supabase!.from('users').delete().eq('id', body.id);
      if (error) throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid users action' }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

function generateToken(payload: Record<string, any>): string {
  const secret = process.env.JWT_SECRET || 'iestore-dev-secret';
  // Minimal JWT-like token (header.payload.signature)
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64url = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(toSign).digest('base64url');
  return `${toSign}.${signature}`;
}

async function handleAuth(event: any, headers: any) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: any = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { username, password } = body;
  if (!username || !password) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'username and password are required' }) };
  }

  // Find user by username
  const { data: user, error } = await supabase!
    .from('users')
    .select('id, name, email, username, password, role, status')
    .eq('username', username)
    .limit(1)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // treat not found below

  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Usuário ou senha incorretos' }) };
  }
  if (user.status !== 'active') {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Usuário inativo' }) };
  }

  // Plain-text password check (consider hashing in production)
  if (String(user.password || '') !== String(password)) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Usuário ou senha incorretos' }) };
  }

  const now = Math.floor(Date.now() / 1000);
  const token = generateToken({ sub: user.id, username: user.username, role: user.role, iat: now, exp: now + 60 * 60 * 24 });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    }),
  };
}

async function ensureAdminUser() {
  const username = 'adiestore';
  const password = 'Admin@iestore1';
  const { data, error } = await supabase!
    .from('users')
    .select('id')
    .eq('username', username)
    .limit(1);
  if (error) throw error;
  if (data && data.length > 0) return;
  const { error: upError } = await supabase!.from('users').upsert([
    {
      id: 'user_admin_adistore',
      name: 'Admin IEStore',
      email: 'admin@iestore.local',
      username,
      password,
      role: 'admin',
      status: 'active',
    },
  ], { onConflict: 'id' });
  if (upError) throw upError;
}

async function handleCustomers(event: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('customers')
      .select('id, name, phone, email, address, total_purchases, total_value, pending_amount, last_purchase, notes')
      .order('name', { ascending: true });
    if (error) throw error;
    const out = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || null,
      email: c.email || null,
      address: c.address || null,
      totalPurchases: Number(c.total_purchases || 0),
      totalValue: Number(c.total_value || 0),
      pendingAmount: Number(c.pending_amount || 0),
      lastPurchase: c.last_purchase || null,
      notes: c.notes || null,
      status: 'active',
    }));
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const customer = rows[0];
      const payload = [{
        id: customer.id || `customer_${Date.now()}`,
        name: customer.name,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
        total_purchases: customer.totalPurchases || 0,
        total_value: customer.totalValue || 0,
        pending_amount: customer.pendingAmount || 0,
        last_purchase: customer.lastPurchase || null,
        notes: customer.notes || null,
      }];
      const { error } = await supabase!.from('customers').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } else if (mode === 'overwrite' && rows) {
      const { error: delError } = await supabase!.from('customers').delete().not('id', 'is', null);
      if (delError) throw delError;
      const payload = (rows || []).map((customer: any) => ({
        id: customer.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: customer.name,
        phone: customer.phone || null,
        email: customer.email || null,
        address: customer.address || null,
        total_purchases: customer.totalPurchases || 0,
        total_value: customer.totalValue || 0,
        pending_amount: customer.pendingAmount || 0,
        last_purchase: customer.lastPurchase || null,
        notes: customer.notes || null,
      }));
      const { error: insError } = await supabase!.from('customers').insert(payload);
      if (insError) throw insError;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleSales(event: any, headers: any, action: string) {
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase!
      .from('sales')
      .select('id, date_iso, product, quantity, total_value, total_cost, profit, customer_name, customer_phone, payment_method, status, sale_type')
      .order('date_iso', { ascending: false });
    if (error) throw error;
    const out = (data || []).map((s: any) => ({
      id: s.id,
      dateISO: s.date_iso,
      product: s.product,
      quantity: Number(s.quantity || 0),
      totalValue: Number(s.total_value || 0),
      totalCost: Number(s.total_cost || 0),
      profit: Number(s.profit || 0),
      customerName: s.customer_name || null,
      customerPhone: s.customer_phone || null,
      paymentMethod: s.payment_method || null,
      status: s.status,
      saleType: s.sale_type,
    }));
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } else if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { mode, rows } = body;
    if (mode === 'append' && rows && rows.length > 0) {
      const sale = rows[0];
      const payload = [{
        date_iso: sale.dateISO || new Date().toISOString(),
        product: sale.product,
        quantity: sale.quantity,
        total_value: sale.totalValue,
        total_cost: sale.totalCost,
        profit: sale.profit,
        customer_name: sale.customerName || null,
        customer_phone: sale.customerPhone || null,
        payment_method: sale.paymentMethod || null,
        status: sale.status || 'paid',
        sale_type: 'sale',
      }];
      const { data: inserted, error } = await supabase!.from('sales').insert(payload).select('id').limit(1);
      if (error) throw error;
      const id = inserted && inserted.length > 0 ? inserted[0].id : null;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }
  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}

async function handleDashboard(event: any, headers: any) {
  const { count: totalProducts, error: prodErr } = await supabase!
    .from('products')
    .select('id', { count: 'exact', head: true });
  if (prodErr) throw prodErr;

  const { data: salesAll, error: salesErr } = await supabase!
    .from('sales')
    .select('total_value, profit');
  if (salesErr) throw salesErr;
  const totalSalesValue = (salesAll || []).reduce((sum: number, s: any) => sum + Number(s.total_value || 0), 0);
  const totalProfit = (salesAll || []).reduce((sum: number, s: any) => sum + Number(s.profit || 0), 0);

  const { count: totalCustomers, error: custErr } = await supabase!
    .from('customers')
    .select('id', { count: 'exact', head: true });
  if (custErr) throw custErr;

  const { data: recentSalesRaw, error: recentErr } = await supabase!
    .from('sales')
    .select('id, date_iso, product, quantity, total_value, total_cost, profit, customer_name, customer_phone, payment_method, status')
    .order('date_iso', { ascending: false })
    .limit(5);
  if (recentErr) throw recentErr;
  const recentSales = (recentSalesRaw || []).map((s: any) => ({
    id: s.id,
    dateISO: s.date_iso,
    product: s.product,
    quantity: Number(s.quantity || 0),
    totalValue: Number(s.total_value || 0),
    totalCost: Number(s.total_cost || 0),
    profit: Number(s.profit || 0),
    customerName: s.customer_name || null,
    customerPhone: s.customer_phone || null,
    paymentMethod: s.payment_method || null,
    status: s.status,
  }));

  const { data: lowStockRaw, error: lowErr } = await supabase!
    .from('products')
    .select('name, quantity')
    .lt('quantity', 10)
    .order('quantity', { ascending: true })
    .limit(5);
  if (lowErr) throw lowErr;
  const topProducts = (lowStockRaw || []).map((p: any) => ({ name: p.name, quantity: Number(p.quantity || 0) }));

  const dashboardData = {
    totalSalesValue,
    totalProfit,
    totalProducts: Number(totalProducts || 0),
    totalCustomers: Number(totalCustomers || 0),
    lowStockProducts: (lowStockRaw || []).length,
    recentSales,
    topProducts,
  };

  return { statusCode: 200, headers, body: JSON.stringify(dashboardData) };
}
