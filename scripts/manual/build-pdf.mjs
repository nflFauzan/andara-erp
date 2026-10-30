import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildPdf() {
  const rootDir = path.resolve(__dirname, '../../');
  const templatePath = path.join(rootDir, 'docs/manual/template/manual-template.html');
  const outputPath = path.join(rootDir, 'docs/Buku_Panduan_Pengguna_CV_ANDARA.pdf');

  console.log('========================================================');
  console.log('      KOMPILASI BUKU PANDUAN PENGGUNA CV. ANDARA');
  console.log('========================================================');
  console.log('Template HTML :', templatePath);
  console.log('Output PDF    :', outputPath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`File template tidak ditemukan di: ${templatePath}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n[1/3] Membuka file template di Playwright Chromium...');
  const fileUrl = 'file:///' + templatePath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log('[2/3] Memastikan seluruh gambar screenshot termuat sempurna...');
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  });

  // Tunggu 1 detik ekstra untuk stabilitas layout
  await page.waitForTimeout(1000);

  console.log('[3/3] Merender dokumen PDF standar A4 cetak (High-Resolution)...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log('\n========================================================');
  console.log('  KOMPILASI PDF BERHASIL!');
  console.log(`  Berkas: ${outputPath}`);
  console.log(`  Ukuran: ${sizeMb} MB (${stats.size} bytes)`);
  console.log('========================================================\n');
}

buildPdf().catch(err => {
  console.error('\n[ERROR] Kompilasi PDF gagal:', err);
  process.exit(1);
});

