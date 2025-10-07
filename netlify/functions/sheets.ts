import type { Handler } from '@netlify/functions';
import { google } from 'googleapis';

function getSheetsClient() {
  const credsRaw = process.env.GCP_SHEETS_SERVICE_ACCOUNT;
  const sheetId = process.env.SHEET_ID as string;
  if (!credsRaw || !sheetId) {
    throw new Error('Missing GCP_SHEETS_SERVICE_ACCOUNT or SHEET_ID');
  }

  const creds = JSON.parse(credsRaw);
  const jwt = new google.auth.JWT(
    creds.client_email,
    undefined,
    creds.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  const sheets = google.sheets({ version: 'v4', auth: jwt });
  return { sheets, sheetId };
}

const handler: Handler = async (event) => {
  try {
    const { sheets, sheetId } = getSheetsClient();
    const table = (event.queryStringParameters?.table || 'products').toLowerCase();
    const rangeMap: Record<string, string> = {
      products: 'products!A:Z',
      customers: 'customers!A:Z',
      sales: 'sales!A:Z',
      installments: 'installments!A:Z',
      users: 'users!A:Z',
    };
    const range = rangeMap[table] || rangeMap.products;

    switch (event.httpMethod) {
      case 'GET': {
        const resp = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        const values = resp.data.values || [];
        if (values.length === 0) return { statusCode: 200, body: JSON.stringify([]) };
        const [header, ...rows] = values;
        const list = rows.map((r) => {
          const obj: Record<string, any> = {};
          header.forEach((h, idx) => { obj[h] = r[idx]; });
          return obj;
        });
        return { statusCode: 200, body: JSON.stringify(list) };
      }
      case 'POST': {
        if (!event.body) return { statusCode: 400, body: 'Missing body' };
        const body = JSON.parse(event.body);
        const mode = body.mode || 'append'; // append | overwrite
        const rows: any[] = body.rows || [];
        if (!Array.isArray(rows) || rows.length === 0) {
          return { statusCode: 400, body: 'rows required' };
        }
        // Fetch header to map fields order
        const current = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
        const header = (current.data.values || [])[0] || [];
        const values = rows.map((obj) => header.map((h: string) => obj[h] ?? ''));
        if (mode === 'append') {
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
          });
        } else if (mode === 'overwrite') {
          // Write header + values back
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [header, ...values] }
          });
        }
        return { statusCode: 200, body: JSON.stringify({ ok: true }) };
      }
      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || 'Internal Error' }) };
  }
};

export { handler };


