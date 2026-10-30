import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Login as operator
  await page.goto('http://localhost:5173/login');
  await page.fill('#username', 'operator');
  await page.fill('#password', 'operator123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Query APIs
  const data = await page.evaluate(async () => {
    const get = async (url) => {
      try {
        const r = await fetch(url);
        return await r.json();
      } catch (e) {
        return { error: e.message };
      }
    };
    return {
      customers: await get('/api/customers'),
      kegiatan: await get('/api/kegiatan'),
      penawaran: await get('/api/penawaran'),
      faktur: await get('/api/faktur'),
      pembayaran: await get('/api/pembayaran'),
      kwitansi: await get('/api/kwitansi'),
      deposits: await get('/api/deposits')
    };
  });

  console.log('Customer count:', data.customers?.data?.length || 0);
  console.log('Kegiatan count:', data.kegiatan?.data?.length || 0);
  console.log('Penawaran count:', data.penawaran?.data?.length || 0);
  console.log('Faktur count:', data.faktur?.data?.length || 0);
  console.log('Pembayaran count:', data.pembayaran?.data?.length || 0);
  console.log('Kwitansi count:', data.kwitansi?.data?.length || 0);
  console.log('First Customer ID:', data.customers?.data?.[0]?.id);
  console.log('First Kegiatan ID:', data.kegiatan?.data?.[0]?.id);
  console.log('First Penawaran ID:', data.penawaran?.data?.[0]?.id);
  console.log('First Faktur ID:', data.faktur?.data?.[0]?.id);
  console.log('First Pembayaran ID:', data.pembayaran?.data?.[0]?.id);
  console.log('First Kwitansi ID:', data.kwitansi?.data?.[0]?.id);

  await browser.close();
}

main().catch(console.error);

