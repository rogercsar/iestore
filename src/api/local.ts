import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Sale, SaleItem, MultiSale, DashboardSummary } from '@types';

const KEY_PRODUCTS = 'iestore_products_v1';
const KEY_SALES = 'iestore_sales_v1';

function parseBRNumber(input: string | number): number {
  if (typeof input === 'number') return input;
  const trimmed = input.trim().replace(/\s+/g, '');
  if (!trimmed) return 0;
  // Handle formats like "49,90", "7 (capinha) + 3,50 (pelicula)"
  const parts = trimmed
    .split('+')
    .map((p) => p.replace(/[^0-9,.-]/g, '').replace(/,(\d{2})$/, '.$1'))
    .filter(Boolean)
    .map((p) => Number(p));
  return parts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export const LocalData = {
  async seedAllIfEmpty(): Promise<void> {
    // Seed products
    const productsExisting = await AsyncStorage.getItem(KEY_PRODUCTS);
    if (!productsExisting) {
      try {
        const res = await fetch('/data/products.json');
        if (res.ok) {
          const items = await res.json();
          await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(items));
        }
      } catch {}
    }

    // Seed sales
    const salesExisting = await AsyncStorage.getItem(KEY_SALES);
    if (!salesExisting) {
      try {
        const res = await fetch('/data/sales.json');
        if (res.ok) {
          const rows = await res.json();
          await AsyncStorage.setItem(KEY_SALES, JSON.stringify(rows));
        } else {
          await AsyncStorage.setItem(KEY_SALES, JSON.stringify([]));
        }
      } catch {
        await AsyncStorage.setItem(KEY_SALES, JSON.stringify([]));
      }
    }

    // Seed customers
    const customersExisting = await AsyncStorage.getItem('customers');
    if (!customersExisting) {
      try {
        const res = await fetch('/data/customers.json');
        if (res.ok) {
          const list = await res.json();
          await AsyncStorage.setItem('customers', JSON.stringify(list));
        } else {
          await AsyncStorage.setItem('customers', JSON.stringify([]));
        }
      } catch {
        await AsyncStorage.setItem('customers', JSON.stringify([]));
      }
    }
  },

  async syncFromSheets(): Promise<void> {
    try {
      // Pull products
      const prodRes = await fetch('/.netlify/functions/sheets?table=products');
      if (prodRes.ok) {
        const products = await prodRes.json();
        if (Array.isArray(products)) {
          await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
        }
      }
      // Pull customers
      const custRes = await fetch('/.netlify/functions/sheets?table=customers');
      if (custRes.ok) {
        const customers = await custRes.json();
        if (Array.isArray(customers)) {
          await AsyncStorage.setItem('customers', JSON.stringify(customers));
        }
      }
      // Pull sales
      const salesRes = await fetch('/.netlify/functions/sheets?table=sales');
      if (salesRes.ok) {
        const sales = await salesRes.json();
        if (Array.isArray(sales)) {
          await AsyncStorage.setItem(KEY_SALES, JSON.stringify(sales));
        }
      }
    } catch (e) {
      console.warn('syncFromSheets failed:', e);
    }
  },

  // CSV helpers
  async exportSalesCSV(): Promise<string> {
    const sales = await LocalData.salesHistory();
    const headers = [
      'type', // sale | multi
      'dateISO',
      'product',
      'quantity',
      'totalValue',
      'totalCost',
      'profitOrTotalProfit',
      'customerName',
      'customerPhone',
      'paymentMethod',
      'status'
    ];
    const escape = (v: any) => {
      if (v === undefined || v === null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const rows: string[] = [headers.join(',')];
    for (const s of sales) {
      if ('items' in s) {
        // MultiSale: output one row per item to preserve detail
        for (const item of s.items) {
          rows.push([
            'multi',
            s.dateISO,
            item.product,
            item.quantity,
            item.totalValue,
            item.totalCost,
            s.totalProfit,
            s.customerName ?? '',
            s.customerPhone ?? '',
            s.paymentMethod ?? '',
            s.status ?? ''
          ].map(escape).join(','));
        }
      } else {
        rows.push([
          'sale',
          s.dateISO,
          s.product,
          s.quantity,
          s.totalValue,
          s.totalCost,
          s.profit,
          s.customerName ?? '',
          s.customerPhone ?? '',
          s.paymentMethod ?? '',
          s.status ?? ''
        ].map(escape).join(','));
      }
    }
    return rows.join('\n');
  },

  async exportCustomersCSV(): Promise<string> {
    const customers = await LocalData.listCustomers();
    const headers = [
      'id','name','phone','email','address','totalPurchases','totalValue','pendingAmount','lastPurchase','notes'
    ];
    const escape = (v: any) => {
      if (v === undefined || v === null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const rows: string[] = [headers.join(',')];
    for (const c of customers) {
      rows.push([
        c.id,
        c.name,
        c.phone ?? '',
        c.email ?? '',
        c.address ?? '',
        c.totalPurchases ?? 0,
        c.totalValue ?? 0,
        c.pendingAmount ?? 0,
        c.lastPurchase ?? '',
        c.notes ?? ''
      ].map(escape).join(','));
    }
    return rows.join('\n');
  },

  async exportProductsCSV(): Promise<string> {
    const products = await LocalData.listProducts();
    const headers = ['name','quantity','cost','unitPrice'];
    const escape = (v: any) => {
      if (v === undefined || v === null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const rows: string[] = [headers.join(',')];
    for (const p of products) {
      rows.push([
        p.name,
        p.quantity,
        p.cost,
        p.unitPrice
      ].map(escape).join(','));
    }
    return rows.join('\n');
  },

  async importProductsCSV(csv: string): Promise<void> {
    const parse = (text: string): string[][] => {
      const rows: string[][] = [];
      let i = 0, field = '', row: string[] = [], inQuotes = false;
      const pushField = () => { row.push(field); field = ''; };
      const pushRow = () => { rows.push(row); row = []; };
      while (i < text.length) {
        const ch = text[i++];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i] === '"') { field += '"'; i++; }
            else inQuotes = false;
          } else field += ch;
        } else {
          if (ch === '"') inQuotes = true;
          else if (ch === ',') pushField();
          else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i] === '\n') i++; pushField(); pushRow(); }
          else field += ch;
        }
      }
      if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }
      return rows.filter(r => r.length > 0 && r.some(c => c.trim() !== ''));
    };
    const rows = parse(csv);
    if (!rows.length) return;
    const header = rows.shift()!;
    const idx = (name: string) => header.indexOf(name);
    const products = rows.map(r => ({
      name: r[idx('name')],
      quantity: Number(r[idx('quantity')] || 0),
      cost: Number(r[idx('cost')] || 0),
      unitPrice: Number(r[idx('unitPrice')] || 0)
    }));
    await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));
    // Push products overwrite to Google Sheets
    try {
      const rows = products.map((p: any) => ({
        name: p.name,
        quantity: p.quantity,
        cost: p.cost,
        unitPrice: p.unitPrice,
        photo: p.photo || ''
      }));
      await fetch('/.netlify/functions/sheets?table=products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'overwrite', rows })
      });
    } catch {}
  },

  async importSalesCSV(csv: string): Promise<void> {
    const parse = (text: string): string[][] => {
      const rows: string[][] = [];
      let i = 0, field = '', row: string[] = [], inQuotes = false;
      const pushField = () => { row.push(field); field = ''; };
      const pushRow = () => { rows.push(row); row = []; };
      while (i < text.length) {
        const ch = text[i++];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i] === '"') { field += '"'; i++; }
            else inQuotes = false;
          } else {
            field += ch;
          }
        } else {
          if (ch === '"') inQuotes = true;
          else if (ch === ',') pushField();
          else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i] === '\n') i++;
            pushField(); pushRow();
          } else field += ch;
        }
      }
      // last field/row
      if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }
      return rows.filter(r => r.length > 0 && r.some(c => c.trim() !== ''));
    };
    const rows = parse(csv);
    if (!rows.length) return;
    const header = rows.shift()!;
    // Expect our headers
    const idx = (name: string) => header.indexOf(name);
    const out: any[] = [];
    for (const r of rows) {
      const type = r[idx('type')] || 'sale';
      const common = {
        dateISO: r[idx('dateISO')],
        customerName: r[idx('customerName')] || undefined,
        customerPhone: r[idx('customerPhone')] || undefined,
        paymentMethod: r[idx('paymentMethod')] || undefined,
        status: r[idx('status')] || undefined
      } as any;
      if (type === 'multi') {
        const item = {
          product: r[idx('product')],
          quantity: Number(r[idx('quantity')] || 0),
          totalCost: Number(r[idx('totalCost')] || 0),
          totalValue: Number(r[idx('totalValue')] || 0)
        };
        const existing = out[out.length - 1];
        if (existing && 'items' in existing && existing.dateISO === common.dateISO && existing.customerName === common.customerName) {
          existing.items.push(item);
          existing.totalValue += item.totalValue;
          existing.totalCost += item.totalCost;
        } else {
          out.push({
            ...common,
            items: [item],
            totalValue: item.totalValue,
            totalCost: item.totalCost,
            totalProfit: Number(r[idx('profitOrTotalProfit')] || (item.totalValue - item.totalCost))
          });
        }
      } else {
        out.push({
          ...common,
          product: r[idx('product')],
          quantity: Number(r[idx('quantity')] || 0),
          totalValue: Number(r[idx('totalValue')] || 0),
          totalCost: Number(r[idx('totalCost')] || 0),
          profit: Number(r[idx('profitOrTotalProfit')] || 0)
        });
      }
    }
    await AsyncStorage.setItem(KEY_SALES, JSON.stringify(out));
  },

  async importCustomersCSV(csv: string): Promise<void> {
    const parse = (text: string): string[][] => {
      const rows: string[][] = [];
      let i = 0, field = '', row: string[] = [], inQuotes = false;
      const pushField = () => { row.push(field); field = ''; };
      const pushRow = () => { rows.push(row); row = []; };
      while (i < text.length) {
        const ch = text[i++];
        if (inQuotes) {
          if (ch === '"') {
            if (text[i] === '"') { field += '"'; i++; }
            else inQuotes = false;
          } else field += ch;
        } else {
          if (ch === '"') inQuotes = true;
          else if (ch === ',') pushField();
          else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i] === '\n') i++; pushField(); pushRow(); }
          else field += ch;
        }
      }
      if (field.length > 0 || row.length > 0) { pushField(); pushRow(); }
      return rows.filter(r => r.length > 0 && r.some(c => c.trim() !== ''));
    };
    const rows = parse(csv);
    if (!rows.length) return;
    const header = rows.shift()!;
    const idx = (name: string) => header.indexOf(name);
    const out = rows.map(r => ({
      id: r[idx('id')] || String(Date.now() + Math.random()),
      name: r[idx('name')],
      phone: r[idx('phone')] || '',
      email: r[idx('email')] || '',
      address: r[idx('address')] || '',
      totalPurchases: Number(r[idx('totalPurchases')] || 0),
      totalValue: Number(r[idx('totalValue')] || 0),
      pendingAmount: Number(r[idx('pendingAmount')] || 0),
      lastPurchase: r[idx('lastPurchase')] || undefined,
      notes: r[idx('notes')] || ''
    }));
    await AsyncStorage.setItem('customers', JSON.stringify(out));
  },
  async seedProductsIfEmpty(seed: Product[]): Promise<void> {
    const existing = await AsyncStorage.getItem(KEY_PRODUCTS);
    if (!existing) {
      // Try fetch from static seed hosted by Vite/Netlify first
      try {
        const res = await fetch('/data/products.json');
        if (res.ok) {
          const webSeed: Product[] = await res.json();
          if (Array.isArray(webSeed) && webSeed.length > 0) {
            await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(webSeed));
          } else {
            await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(seed));
          }
        } else {
          await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(seed));
        }
      } catch {
        await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(seed));
      }
    }
    const sales = await AsyncStorage.getItem(KEY_SALES);
    if (!sales) await AsyncStorage.setItem(KEY_SALES, JSON.stringify([]));
  },

  async listProducts(): Promise<Product[]> {
    const raw = (await AsyncStorage.getItem(KEY_PRODUCTS)) ?? '[]';
    const parsed: Product[] = JSON.parse(raw);
    return parsed;
  },

  async recordSale(input: { product: string; quantity: number; customerName?: string; customerPhone?: string; paymentMethod?: string; installments?: any[]; status?: string; dateISO?: string; totalValue?: number; totalCost?: number; profit?: number }): Promise<{ newQuantity: number; sale: Sale }> {
    const products = await LocalData.listProducts();
    const idx = products.findIndex((p) => p.name === input.product);
    if (idx === -1) throw new Error('Produto não encontrado');
    const product = products[idx];
    if (input.quantity > product.quantity) throw new Error('Estoque insuficiente');

    const newQty = product.quantity - input.quantity;
    products[idx] = { ...product, quantity: newQty };
    await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(products));

    const totalValue = product.unitPrice * input.quantity;
    const totalCost = product.cost * input.quantity;
    const profit = totalValue - totalCost;
    const sale: Sale = {
      dateISO: input.dateISO || new Date().toISOString(),
      product: product.name,
      quantity: input.quantity,
      totalValue: input.totalValue || totalValue,
      totalCost: input.totalCost || totalCost,
      profit: input.profit || profit,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      paymentMethod: input.paymentMethod,
      installments: input.installments,
      status: input.status || 'paid'
    };
    const salesRaw = (await AsyncStorage.getItem(KEY_SALES)) ?? '[]';
    const sales: Sale[] = JSON.parse(salesRaw);
    sales.unshift(sale);
    await AsyncStorage.setItem(KEY_SALES, JSON.stringify(sales));
    // Best-effort push to Google Sheets
    try {
      await fetch('/.netlify/functions/sheets?table=sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'append',
          rows: [
            {
              dateISO: sale.dateISO,
              type: 'sale',
              product: sale.product,
              quantity: sale.quantity,
              totalValue: sale.totalValue,
              totalCost: sale.totalCost,
              profitOrTotalProfit: sale.profit,
              customerName: sale.customerName,
              customerPhone: sale.customerPhone,
              paymentMethod: sale.paymentMethod,
              status: sale.status
            }
          ]
        })
      });
      if (sale.installments && sale.installments.length) {
        const instRows = (sale.installments as any[]).map((inst) => ({
          saleDateISO: sale.dateISO,
          installmentId: inst.id,
          number: inst.number,
          value: inst.value,
          dueDate: inst.dueDate,
          status: inst.status,
          paidDate: inst.paidDate || ''
        }));
        await fetch('/.netlify/functions/sheets?table=installments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'append', rows: instRows })
        });
      }
    } catch {}
    
    // Update customer stats if customer information is provided
    if (input.customerName && input.customerPhone) {
      try {
        const customers = await LocalData.listCustomers();
        const customer = customers.find(c => 
          c.name === input.customerName && c.phone === input.customerPhone
        );
        if (customer) {
          const isPaid = sale.status === 'paid';
          await LocalData.updateCustomerStats(customer.id, sale.totalValue, isPaid);
        }
      } catch (error) {
        console.error('Failed to update customer stats:', error);
      }
    }
    
    return { newQuantity: newQty, sale };
  },

  async recordMultiSale(input: { items: SaleItem[]; customerName?: string; customerPhone?: string; paymentMethod?: string; installments?: any[]; status?: string; dateISO?: string; totalValue?: number; totalCost?: number; totalProfit?: number }): Promise<{ updatedProducts: Product[]; sale: MultiSale }> {
    const products = await LocalData.listProducts();
    const updatedProducts = [...products];
    
    // Validate stock for all items
    for (const item of input.items) {
      const productIdx = updatedProducts.findIndex((p) => p.name === item.product);
      if (productIdx === -1) throw new Error(`Produto ${item.product} não encontrado`);
      if (item.quantity > updatedProducts[productIdx].quantity) {
        throw new Error(`Estoque insuficiente para ${item.product}`);
      }
    }

    // Update stock
    for (const item of input.items) {
      const productIdx = updatedProducts.findIndex((p) => p.name === item.product);
      updatedProducts[productIdx] = {
        ...updatedProducts[productIdx],
        quantity: updatedProducts[productIdx].quantity - item.quantity
      };
    }

    await AsyncStorage.setItem(KEY_PRODUCTS, JSON.stringify(updatedProducts));
    // Push products overwrite to Google Sheets
    try {
      const rows = updatedProducts.map((p: any) => ({
        name: p.name,
        quantity: p.quantity,
        cost: p.cost,
        unitPrice: p.unitPrice,
        photo: p.photo || ''
      }));
      await fetch('/.netlify/functions/sheets?table=products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'overwrite', rows })
      });
    } catch {}

    const totalValue = input.items.reduce((sum, item) => sum + item.totalValue, 0);
    const totalCost = input.items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalProfit = totalValue - totalCost;

    const sale: MultiSale = {
      dateISO: input.dateISO || new Date().toISOString(),
      items: input.items,
      totalValue: input.totalValue || totalValue,
      totalCost: input.totalCost || totalCost,
      totalProfit: input.totalProfit || totalProfit,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      paymentMethod: input.paymentMethod,
      installments: input.installments,
      status: input.status || 'paid'
    };

    const salesRaw = (await AsyncStorage.getItem(KEY_SALES)) ?? '[]';
    const sales: any[] = JSON.parse(salesRaw);
    sales.unshift(sale);
    await AsyncStorage.setItem(KEY_SALES, JSON.stringify(sales));
    // Best-effort push to Google Sheets
    try {
      await fetch('/.netlify/functions/sheets?table=sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'append',
          rows: [
            {
              dateISO: sale.dateISO,
              type: 'multi',
              product: `${sale.items.length} itens`,
              quantity: sale.items.reduce((s, it) => s + it.quantity, 0),
              totalValue: sale.totalValue,
              totalCost: sale.totalCost,
              profitOrTotalProfit: sale.totalProfit,
              customerName: sale.customerName,
              customerPhone: sale.customerPhone,
              paymentMethod: sale.paymentMethod,
              status: sale.status
            }
          ]
        })
      });
    } catch {}
    
    // Update customer stats if customer information is provided
    if (input.customerName && input.customerPhone) {
      try {
        const customers = await LocalData.listCustomers();
        const customer = customers.find(c => 
          c.name === input.customerName && c.phone === input.customerPhone
        );
        if (customer) {
          const isPaid = sale.status === 'paid';
          await LocalData.updateCustomerStats(customer.id, sale.totalValue, isPaid);
        }
      } catch (error) {
        console.error('Failed to update customer stats:', error);
      }
    }
    
    return { updatedProducts, sale };
  },

  async salesHistory(): Promise<(Sale | MultiSale)[]> {
    const raw = (await AsyncStorage.getItem(KEY_SALES)) ?? '[]';
    return JSON.parse(raw);
  },

  async seedSalesIfEmpty(sales: (Sale | MultiSale)[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed to seed sales:', e);
      throw e;
    }
  },

  async migrateSalesData(): Promise<void> {
    try {
      const sales = await LocalData.salesHistory();
      let needsMigration = false;
      
      const migratedSales = sales.map(sale => {
        // Check if sale needs migration (missing installments/status for "À Prazo" sales)
        if (sale.paymentMethod === 'À Prazo' && (!sale.installments || !sale.status)) {
          needsMigration = true;
          
          // Generate installments for existing "À Prazo" sales
          const installments = [];
          const totalValue = sale.totalValue || 0;
          const numInstallments = 3; // Default to 3 installments
          const installmentValue = totalValue / numInstallments;
          
          for (let i = 1; i <= numInstallments; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i);
            
            installments.push({
              id: `${Date.now()}-${i}-${Math.random()}`,
              number: i,
              value: Math.round(installmentValue * 100) / 100,
              dueDate: dueDate.toISOString(),
              status: 'pending' as const
            });
          }
          
          return {
            ...sale,
            installments,
            status: 'pending' as const
          };
        }
        
        return sale;
      });
      
      if (needsMigration) {
        await AsyncStorage.setItem(KEY_SALES, JSON.stringify(migratedSales));
        console.log('Sales data migrated successfully');
      }
    } catch (e) {
      console.error('Failed to migrate sales data:', e);
    }
  },

  async summary(period: 'weekly' | 'monthly' = 'weekly'): Promise<DashboardSummary> {
    const sales = await LocalData.salesHistory();
    const buckets = new Map<string, number>();
    for (const s of sales) {
      const d = new Date(s.dateISO);
      let key: string;
      if (period === 'monthly') key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      else key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + s.totalValue);
    }
    const labels = Array.from(buckets.keys()).sort();
    return {
      totalSalesValue: sales.reduce((a, s) => a + s.totalValue, 0),
      totalProfit: sales.reduce((a, s) => a + ('totalProfit' in s ? s.totalProfit : s.profit), 0),
      series: labels.map((l) => ({ label: l, value: buckets.get(l) ?? 0 }))
    };
  },

  // Customer management
  async listCustomers(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem('customers');
      const parsed: any[] = data ? JSON.parse(data) : [];
      // Ensure every customer has a stable id
      let mutated = false;
      const withIds = parsed.map((c) => {
        if (!c.id) {
          mutated = true;
          return {
            ...c,
            id: `${(c.name || 'cliente')}-${(c.phone || '').replace(/\D/g, '')}-${Math.random().toString(36).slice(2, 8)}`
          };
        }
        return c;
      });
      if (mutated) {
        await AsyncStorage.setItem('customers', JSON.stringify(withIds));
      }
      return withIds as Customer[];
    } catch (e) {
      console.error('Failed to list customers:', e);
      return [];
    }
  },

  async saveCustomer(customer: Customer): Promise<void> {
    try {
      const customers = await LocalData.listCustomers();
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        customers[existingIndex] = customer;
      } else {
        customers.push(customer);
      }
      
      await AsyncStorage.setItem('customers', JSON.stringify(customers));
      // Push to Google Sheets (append or overwrite row set)
      try {
        const rows = customers.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          totalPurchases: c.totalPurchases || 0,
          totalValue: c.totalValue || 0,
          pendingAmount: c.pendingAmount || 0,
          lastPurchase: c.lastPurchase || '',
          notes: c.notes || ''
        }));
        await fetch('/.netlify/functions/sheets?table=customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'overwrite', rows })
        });
      } catch {}
    } catch (e) {
      console.error('Failed to save customer:', e);
      throw e;
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      const customers = await LocalData.listCustomers();
      const updatedCustomers = customers.filter(c => c.id !== id);
      await AsyncStorage.setItem('customers', JSON.stringify(updatedCustomers));
      try {
        const rows = updatedCustomers.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          totalPurchases: c.totalPurchases || 0,
          totalValue: c.totalValue || 0,
          pendingAmount: c.pendingAmount || 0,
          lastPurchase: c.lastPurchase || '',
          notes: c.notes || ''
        }));
        await fetch('/.netlify/functions/sheets?table=customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'overwrite', rows })
        });
      } catch {}
    } catch (e) {
      console.error('Failed to delete customer:', e);
      throw e;
    }
  },

  async updateCustomerStats(customerId: string, purchaseValue: number, isPaid: boolean): Promise<void> {
    try {
      const customers = await LocalData.listCustomers();
      const customerIndex = customers.findIndex(c => c.id === customerId);
      
      if (customerIndex >= 0) {
        const customer = customers[customerIndex];
        customer.totalPurchases += 1;
        customer.totalValue += purchaseValue;
        customer.lastPurchase = new Date().toISOString();
        
        if (!isPaid) {
          customer.pendingAmount += purchaseValue;
        }
        
        customers[customerIndex] = customer;
        await AsyncStorage.setItem('customers', JSON.stringify(customers));
      }
    } catch (e) {
      console.error('Failed to update customer stats:', e);
    }
  },

  async recalculateCustomerStats(): Promise<void> {
    try {
      const customers = await LocalData.listCustomers();
      const sales = await LocalData.salesHistory();
      
      // Reset all customer stats
      const updatedCustomers = customers.map(customer => ({
        ...customer,
        totalPurchases: 0,
        totalValue: 0,
        pendingAmount: 0,
        lastPurchase: undefined
      }));
      
      // Recalculate stats from sales history
      sales.forEach(sale => {
        if (sale.customerName && sale.customerPhone) {
          const customerIndex = updatedCustomers.findIndex(c => 
            c.name === sale.customerName && c.phone === sale.customerPhone
          );
          
          if (customerIndex >= 0) {
            const customer = updatedCustomers[customerIndex];
            customer.totalPurchases += 1;
            customer.totalValue += sale.totalValue;
            
            // Update last purchase date
            const saleDate = new Date(sale.dateISO);
            const currentLastPurchase = customer.lastPurchase ? new Date(customer.lastPurchase) : null;
            if (!currentLastPurchase || saleDate > currentLastPurchase) {
              customer.lastPurchase = sale.dateISO;
            }
            
            // Calculate pending amount from installments
            if (sale.installments && sale.installments.length > 0) {
              const unpaidInstallments = sale.installments.filter(inst => 
                inst.status === 'pending' || inst.status === 'overdue'
              );
              customer.pendingAmount += unpaidInstallments.reduce((sum, inst) => sum + inst.value, 0);
            } else if (sale.status === 'pending') {
              customer.pendingAmount += sale.totalValue;
            }
            
            updatedCustomers[customerIndex] = customer;
          }
        }
      });
      
      // Save updated customers
      await AsyncStorage.setItem('customers', JSON.stringify(updatedCustomers));
    } catch (e) {
      console.error('Failed to recalculate customer stats:', e);
    }
  },

  // Settings functions
  async getSettings(): Promise<any> {
  try {
    const data = await AsyncStorage.getItem('app_settings');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to get settings:', e);
    return null;
  }
},

async saveSettings(settings: any): Promise<void> {
  try {
    await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
    throw e;
  }
},

async exportAllData(): Promise<any> {
  try {
    const products = await LocalData.listProducts();
    const sales = await LocalData.salesHistory();
    const customers = await LocalData.listCustomers();
    const settings = await LocalData.getSettings();
    
    return {
      products,
      sales,
      customers,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (e) {
    console.error('Failed to export data:', e);
    throw e;
  }
},

async clearCache(): Promise<void> {
  try {
    // Keep essential data, clear only cache
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_') || key.startsWith('temp_'));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (e) {
    console.error('Failed to clear cache:', e);
    throw e;
  }
},

// Debug function to check all stored data
async debugStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value ? JSON.parse(value) : null);
    }
  } catch (e) {
    console.error('Failed to debug storage:', e);
  }
}
};

export function mapSeedRowToProduct(row: {
  name: string;
  quantity: string | number;
  costBR: string | number;
  unitPriceBR: string | number;
}): Product {
  return {
    name: row.name,
    quantity: Number(row.quantity) || 0,
    cost: parseBRNumber(String(row.costBR)),
    unitPrice: parseBRNumber(String(row.unitPriceBR))
  };
}

