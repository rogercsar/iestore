const { Pool } = require('pg');

// Database configuration for Aiven PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'iestore-iestore.b.aivencloud.com',
  port: parseInt(process.env.DB_PORT || '15158'),
  database: process.env.DB_NAME || 'defaultdb',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

async function checkCustomersData() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔍 Verificando dados de clientes...\n');
    
    const client = await pool.connect();
    
    // Check customers table structure
    console.log('1. Estrutura da tabela customers:');
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas da tabela customers:');
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check customers data
    console.log('\n2. Dados na tabela customers:');
    const customersResult = await client.query('SELECT * FROM customers ORDER BY name');
    
    console.log(`Total de clientes: ${customersResult.rows.length}`);
    
    if (customersResult.rows.length > 0) {
      console.log('\nClientes encontrados:');
      customersResult.rows.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.name} (${customer.phone || 'sem telefone'})`);
        console.log(`     ID: ${customer.id}`);
        console.log(`     Email: ${customer.email || 'sem email'}`);
        console.log(`     Total compras: ${customer.total_purchases || 0}`);
        console.log(`     Valor total: R$ ${customer.total_value || 0}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhum cliente encontrado na tabela!');
    }
    
    // Check sales data
    console.log('\n3. Dados na tabela sales:');
    const salesResult = await client.query('SELECT * FROM sales ORDER BY date_iso DESC LIMIT 5');
    
    console.log(`Total de vendas: ${salesResult.rows.length}`);
    
    if (salesResult.rows.length > 0) {
      console.log('\nÚltimas vendas:');
      salesResult.rows.forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.product} - ${sale.customer_name || 'Cliente não informado'}`);
        console.log(`     Data: ${sale.date_iso}`);
        console.log(`     Valor: R$ ${sale.total_value}`);
        console.log(`     Status: ${sale.status}`);
        console.log('');
      });
    } else {
      console.log('❌ Nenhuma venda encontrada na tabela!');
    }
    
    // Check if there are any issues with customer_id references
    console.log('\n4. Verificando referências de clientes nas vendas:');
    const customerRefsResult = await client.query(`
      SELECT DISTINCT customer_name, customer_phone 
      FROM sales 
      WHERE customer_name IS NOT NULL 
      ORDER BY customer_name
    `);
    
    console.log(`Clientes referenciados nas vendas: ${customerRefsResult.rows.length}`);
    customerRefsResult.rows.forEach((ref, index) => {
      console.log(`  ${index + 1}. ${ref.customer_name} (${ref.customer_phone || 'sem telefone'})`);
    });
    
    client.release();
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
checkCustomersData().catch(console.error);
