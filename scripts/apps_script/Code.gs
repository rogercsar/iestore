// Google Apps Script backend for Sheets-based CRM
// Deploy as Web App (Execute as: Me, Access: Anyone with the link)

const SHEET_PRODUCTS = 'Produtos';
const SHEET_SALES = 'Vendas';

function doGet(e) {
  const path = (e?.parameter?.path || e?.pathInfo || '').toString();
  const period = (e?.parameter?.period || 'weekly').toString();
  if (path === 'products') return respondOk(listProducts());
  if (path === 'sales') return respondOk(listSales());
  if (path === 'summary') return respondOk(summary(period));
  return respondError('Not found', 404);
}

function doPost(e) {
  try {
    const path = (e?.parameter?.path || '').toString();
    if (path === 'sales') {
      const body = JSON.parse(e.postData.contents);
      const result = recordSale(body.product, Number(body.quantity));
      return respondOk(result);
    }
    return respondError('Not found', 404);
  } catch (err) {
    return respondError(err?.message || 'Server error', 500);
  }
}

function getSheet(name) {
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function listProducts() {
  const sheet = getSheet(SHEET_PRODUCTS);
  const values = sheet.getDataRange().getValues();
  const header = values.shift();
  const idx = {
    produto: header.indexOf('Produto'),
    quantidade: header.indexOf('Quantidade'),
    custo: header.indexOf('Custo'),
    venda: header.indexOf('Venda Unitária')
  };
  return values.filter(r => r[idx.produto]).map(r => ({
    name: r[idx.produto],
    quantity: Number(r[idx.quantidade] || 0),
    cost: Number(r[idx.custo] || 0),
    unitPrice: Number(r[idx.venda] || 0)
  }));
}

function listSales() {
  const sheet = getSheet(SHEET_SALES);
  const values = sheet.getDataRange().getValues();
  const header = values.shift();
  const idx = {
    data: header.indexOf('Data'),
    produto: header.indexOf('Produto'),
    quantidade: header.indexOf('Quantidade Vendida'),
    valor: header.indexOf('Valor Total'),
    custo: header.indexOf('Custo Total'),
    lucro: header.indexOf('Lucro')
  };
  return values.filter(r => r[idx.data]).map(r => ({
    dateISO: new Date(r[idx.data]).toISOString(),
    product: r[idx.produto],
    quantity: Number(r[idx.quantidade] || 0),
    totalValue: Number(r[idx.valor] || 0),
    totalCost: Number(r[idx.custo] || 0),
    profit: Number(r[idx.lucro] || 0)
  }));
}

function recordSale(productName, quantity) {
  if (!productName || !quantity || quantity <= 0) throw new Error('Invalid input');
  const productsSheet = getSheet(SHEET_PRODUCTS);
  const salesSheet = getSheet(SHEET_SALES);

  const pRange = productsSheet.getDataRange();
  const values = pRange.getValues();
  const header = values.shift();
  const idx = {
    produto: header.indexOf('Produto'),
    quantidade: header.indexOf('Quantidade'),
    custo: header.indexOf('Custo'),
    venda: header.indexOf('Venda Unitária')
  };
  let rowFound = -1, productRow, currentQty = 0, cost = 0, price = 0;
  for (var i = 0; i < values.length; i++) {
    if (values[i][idx.produto] === productName) {
      rowFound = i + 2; // account for header row
      productRow = values[i];
      currentQty = Number(productRow[idx.quantidade] || 0);
      cost = Number(productRow[idx.custo] || 0);
      price = Number(productRow[idx.venda] || 0);
      break;
    }
  }
  if (rowFound === -1) throw new Error('Produto não encontrado');
  if (quantity > currentQty) throw new Error('Estoque insuficiente');

  const newQty = currentQty - quantity;
  productsSheet.getRange(rowFound, idx.quantidade + 1).setValue(newQty);

  const totalValue = price * quantity;
  const totalCost = cost * quantity;
  const profit = totalValue - totalCost;

  salesSheet.appendRow([
    new Date(),
    productName,
    quantity,
    totalValue,
    totalCost,
    profit
  ]);

  return {
    newQuantity: newQty,
    sale: {
      dateISO: new Date().toISOString(),
      product: productName,
      quantity: quantity,
      totalValue: totalValue,
      totalCost: totalCost,
      profit: profit
    }
  };
}

function summary(period) {
  const items = listSales();
  var buckets = {};
  items.forEach(function (s) {
    var d = new Date(s.dateISO);
    var key;
    if (period === 'monthly') {
      key = (d.getMonth() + 1) + '/' + d.getFullYear();
    } else {
      var day = new Date(d);
      day.setHours(0,0,0,0);
      key = day.toISOString().slice(0,10);
    }
    if (!buckets[key]) buckets[key] = 0;
    buckets[key] += s.totalValue;
  });
  var labels = Object.keys(buckets).sort();
  var series = labels.map(function(k){ return { label: k, value: buckets[k] }; });
  var totalSalesValue = items.reduce(function(a, s){ return a + s.totalValue; }, 0);
  var totalProfit = items.reduce(function(a, s){ return a + s.profit; }, 0);
  return { totalSalesValue: totalSalesValue, totalProfit: totalProfit, series: series };
}

function respondOk(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function respondError(message, code) {
  const payload = { error: message, code: code };
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}










