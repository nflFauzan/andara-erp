/**
 * Engine Generator Excel Multi-Sheet Berstandar XML Spreadsheet 2003 (SpreadsheetML)
 * 
 * Keunggulan:
 * 1. Mendukung Multi-Sheet asli (Sheet 1: Ringkasan Eksekutif, Sheet 2: Data Transaksi Detail).
 * 2. Tipe data murni (Numeric, Currency, Date, Text) dengan formatting Excel resmi (#,##0 dan "Rp "#,##0).
 * 3. 100% Client-side tanpa library pihak ketiga yang membengkakkan bundle.
 * 4. Kompatibel penuh dengan Microsoft Excel, LibreOffice Calc, Apple Numbers, dan Google Sheets.
 */

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number; // Lebar kolom dalam karakter / poin
  type?: 'text' | 'number' | 'currency' | 'date' | 'percent';
  align?: 'left' | 'center' | 'right';
  formatter?: (val: any, row?: any) => string | number;
}

export interface ExcelFilterMeta {
  label: string;
  value: string;
}

export interface ExcelKpi {
  label: string;
  value: string | number;
  isCurrency?: boolean;
}

export interface ExcelExportConfig {
  fileName: string;
  reportTitle: string;
  reportSubtitle?: string;
  filters: ExcelFilterMeta[];
  kpis?: ExcelKpi[];
  columns: ExcelColumn[];
  data: Record<string, any>[];
  totalLabel?: string;
  totals?: Record<string, number>;
}

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateAndDownloadExcel(config: ExcelExportConfig): void {
  const {
    fileName,
    reportTitle,
    reportSubtitle = 'Sistem Manajemen Operasional & Transaksi CV. ANDARA',
    filters,
    kpis = [],
    columns,
    data,
    totalLabel = 'GRAND TOTAL',
    totals,
  } = config;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  // 1. SpreadsheetML Styles
  const stylesXml = `
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>

    <!-- Header & Titles -->
    <Style ss:ID="CompanyTitle">
      <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1e3a8a"/>
    </Style>
    <Style ss:ID="ReportTitle">
      <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#0f172a"/>
    </Style>
    <Style ss:ID="ReportSubtitle">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#64748b"/>
    </Style>

    <!-- Section Headers -->
    <Style ss:ID="SectionHeader">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#334155" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center" ss:Indent="1"/>
    </Style>

    <!-- Metadata Styles -->
    <Style ss:ID="MetaLabel">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#475569"/>
      <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="MetaValue">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Interior ss:Color="#ffffff" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>

    <!-- KPI Cards -->
    <Style ss:ID="KpiLabel">
      <Font ss:FontName="Calibri" ss:Size="9" ss:Bold="1" ss:Color="#64748b"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiValue">
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#0f172a"/>
      <Interior ss:Color="#ffffff" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="KpiValueCurrency">
      <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#1e3a8a"/>
      <Interior ss:Color="#ffffff" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>

    <!-- Table Header Style -->
    <Style ss:ID="TH">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#ffffff"/>
      <Interior ss:Color="#1e293b" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94a3b8"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94a3b8"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94a3b8"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94a3b8"/>
      </Borders>
    </Style>

    <!-- Table Data Cell Styles -->
    <Style ss:ID="TDText">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="TDTextCenter">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="TDDate">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="TDNumber">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="TDCurrency">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>
    <Style ss:ID="TDPercent">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="0.0%"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#e2e8f0"/>
      </Borders>
    </Style>

    <!-- Table Footer Styles -->
    <Style ss:ID="TFTotalLabel">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#475569"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="TFTotalCurrency">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1e3a8a"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="&quot;Rp &quot;#,##0"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#475569"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
    <Style ss:ID="TFTotalNumber">
      <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
      <Interior ss:Color="#f1f5f9" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <NumberFormat ss:Format="#,##0"/>
      <Borders>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#475569"/>
        <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#475569"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#cbd5e1"/>
      </Borders>
    </Style>
  </Styles>
  `;

  // 2. Worksheet 1: Ringkasan Eksekutif
  let sheet1Xml = `
  <Worksheet ss:Name="Ringkasan Eksekutif">
    <Table ss:DefaultColumnWidth="140">
      <Column ss:Width="160"/>
      <Column ss:Width="260"/>
      <Column ss:Width="160"/>
      <Column ss:Width="200"/>

      <Row ss:Height="24">
        <Cell ss:MergeAcross="3" ss:StyleID="CompanyTitle">
          <Data ss:Type="String">CV. ANDARA</Data>
        </Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="3" ss:StyleID="ReportTitle">
          <Data ss:Type="String">${escapeXml(reportTitle)}</Data>
        </Cell>
      </Row>
      <Row ss:Height="16">
        <Cell ss:MergeAcross="3" ss:StyleID="ReportSubtitle">
          <Data ss:Type="String">${escapeXml(reportSubtitle)} | Diekspor pada: ${dateStr} ${timeStr}</Data>
        </Cell>
      </Row>

      <Row ss:Height="10"/>

      <!-- Filter Section -->
      <Row ss:Height="20">
        <Cell ss:MergeAcross="3" ss:StyleID="SectionHeader">
          <Data ss:Type="String">PARAMETER FILTER LAPORAN AKTIF</Data>
        </Cell>
      </Row>
  `;

  filters.forEach((f) => {
    sheet1Xml += `
      <Row ss:Height="18">
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">${escapeXml(f.label)}</Data></Cell>
        <Cell ss:MergeAcross="2" ss:StyleID="MetaValue"><Data ss:Type="String">${escapeXml(f.value)}</Data></Cell>
      </Row>
    `;
  });

  sheet1Xml += `
      <Row ss:Height="18">
        <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Tanggal &amp; Waktu Unduh</Data></Cell>
        <Cell ss:MergeAcross="2" ss:StyleID="MetaValue"><Data ss:Type="String">${dateStr} ${timeStr}</Data></Cell>
      </Row>
  `;

  if (kpis.length > 0) {
    sheet1Xml += `
      <Row ss:Height="14"/>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="3" ss:StyleID="SectionHeader">
          <Data ss:Type="String">INDIKATOR KINERJA UTAMA (EXECUTIVE KPI SUMMARY)</Data>
        </Cell>
      </Row>
    `;

    // Render KPI pairs
    for (let i = 0; i < kpis.length; i += 2) {
      const kpi1 = kpis[i];
      const kpi2 = kpis[i + 1];

      sheet1Xml += `
      <Row ss:Height="16">
        <Cell ss:MergeAcross="1" ss:StyleID="KpiLabel"><Data ss:Type="String">${escapeXml(kpi1.label)}</Data></Cell>
        ${
          kpi2
            ? `<Cell ss:MergeAcross="1" ss:StyleID="KpiLabel"><Data ss:Type="String">${escapeXml(kpi2.label)}</Data></Cell>`
            : `<Cell ss:MergeAcross="1"/>`
        }
      </Row>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="1" ss:StyleID="${kpi1.isCurrency ? 'KpiValueCurrency' : 'KpiValue'}">
          <Data ss:Type="${typeof kpi1.value === 'number' ? 'Number' : 'String'}">${escapeXml(kpi1.value)}</Data>
        </Cell>
        ${
          kpi2
            ? `<Cell ss:MergeAcross="1" ss:StyleID="${kpi2.isCurrency ? 'KpiValueCurrency' : 'KpiValue'}">
                 <Data ss:Type="${typeof kpi2.value === 'number' ? 'Number' : 'String'}">${escapeXml(kpi2.value)}</Data>
               </Cell>`
            : `<Cell ss:MergeAcross="1"/>`
        }
      </Row>
      `;
    }
  }

  sheet1Xml += `
      <Row ss:Height="20"/>
      <Row ss:Height="16">
        <Cell ss:MergeAcross="3" ss:StyleID="ReportSubtitle">
          <Data ss:Type="String">Catatan: Buka sheet "Data Transaksi" di bawah untuk melihat rincian tabel per baris.</Data>
        </Cell>
      </Row>
    </Table>
  </Worksheet>
  `;

  // 3. Worksheet 2: Data Transaksi Detail
  let sheet2Xml = `
  <Worksheet ss:Name="Data Transaksi">
    <Table ss:DefaultColumnWidth="110">
      <Column ss:Width="35"/> <!-- No -->
  `;

  columns.forEach((c) => {
    const colWidth = c.width || (c.type === 'currency' ? 120 : c.type === 'date' ? 85 : 130);
    sheet2Xml += `<Column ss:Width="${colWidth}"/>\n`;
  });

  // Table Title Header on sheet 2
  sheet2Xml += `
      <Row ss:Height="22">
        <Cell ss:MergeAcross="${columns.length}" ss:StyleID="ReportTitle">
          <Data ss:Type="String">${escapeXml(reportTitle)} - Data Rincian</Data>
        </Cell>
      </Row>
      <Row ss:Height="14">
        <Cell ss:MergeAcross="${columns.length}" ss:StyleID="ReportSubtitle">
          <Data ss:Type="String">Filter: ${escapeXml(filters.map((f) => `${f.label}: ${f.value}`).join(' | '))}</Data>
        </Cell>
      </Row>
      <Row ss:Height="8"/>

      <!-- Table Column Headers -->
      <Row ss:Height="24">
        <Cell ss:StyleID="TH"><Data ss:Type="String">No</Data></Cell>
  `;

  columns.forEach((c) => {
    sheet2Xml += `<Cell ss:StyleID="TH"><Data ss:Type="String">${escapeXml(c.header)}</Data></Cell>\n`;
  });
  sheet2Xml += `</Row>\n`;

  // Data Rows
  data.forEach((row, idx) => {
    sheet2Xml += `<Row ss:Height="19">\n`;
    sheet2Xml += `<Cell ss:StyleID="TDTextCenter"><Data ss:Type="Number">${idx + 1}</Data></Cell>\n`;

    columns.forEach((c) => {
      let rawVal = row[c.key];
      if (c.formatter) {
        rawVal = c.formatter(rawVal, row);
      }

      if (c.type === 'currency' || c.type === 'number') {
        const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal) || 0;
        const styleId = c.type === 'currency' ? 'TDCurrency' : 'TDNumber';
        sheet2Xml += `<Cell ss:StyleID="${styleId}"><Data ss:Type="Number">${numVal}</Data></Cell>\n`;
      } else if (c.type === 'date') {
        sheet2Xml += `<Cell ss:StyleID="TDDate"><Data ss:Type="String">${escapeXml(rawVal || '-')}</Data></Cell>\n`;
      } else if (c.type === 'percent') {
        const numVal = typeof rawVal === 'number' ? rawVal / 100 : (Number(rawVal) || 0) / 100;
        sheet2Xml += `<Cell ss:StyleID="TDPercent"><Data ss:Type="Number">${numVal}</Data></Cell>\n`;
      } else {
        const styleId = c.align === 'center' ? 'TDTextCenter' : 'TDText';
        sheet2Xml += `<Cell ss:StyleID="${styleId}"><Data ss:Type="String">${escapeXml(rawVal || '-')}</Data></Cell>\n`;
      }
    });

    sheet2Xml += `</Row>\n`;
  });

  // Grand Total Row if provided
  if (totals && Object.keys(totals).length > 0) {
    sheet2Xml += `
      <Row ss:Height="22">
        <Cell ss:StyleID="TFTotalLabel"><Data ss:Type="String"></Data></Cell>
        <Cell ss:StyleID="TFTotalLabel"><Data ss:Type="String">${escapeXml(totalLabel)}</Data></Cell>
    `;

    // columns (starting after the first column which holds the label)
    for (let ci = 1; ci < columns.length; ci++) {
      const col = columns[ci];
      if (totals[col.key] !== undefined) {
        const styleId = col.type === 'currency' ? 'TFTotalCurrency' : 'TFTotalNumber';
        sheet2Xml += `<Cell ss:StyleID="${styleId}"><Data ss:Type="Number">${totals[col.key]}</Data></Cell>\n`;
      } else {
        sheet2Xml += `<Cell ss:StyleID="TFTotalLabel"><Data ss:Type="String"></Data></Cell>\n`;
      }
    }
    sheet2Xml += `</Row>\n`;
  }

  sheet2Xml += `
    </Table>
  </Worksheet>
  `;

  // 4. Assemble Full Workbook
  const fullWorkbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>CV. ANDARA</Author>
    <LastAuthor>CV. ANDARA</LastAuthor>
    <Created>${now.toISOString()}</Created>
    <Company>CV. ANDARA</Company>
  </DocumentProperties>
  ${stylesXml}
  ${sheet1Xml}
  ${sheet2Xml}
</Workbook>`;

  // 5. Trigger Browser Download as .xls
  const blob = new Blob([fullWorkbookXml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const cleanName = fileName.endsWith('.xls') ? fileName : `${fileName}.xls`;
  link.download = cleanName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper terpadu untuk mengekspor data rekap sesuai tab aktif, filter, dan data terisi
 */
export function exportRekapTabToExcel(options: {
  tab: string;
  tabLabel: string;
  data: any;
  filters: {
    preset: string;
    startDate: string;
    endDate: string;
    customerId: string;
    status: string;
    search: string;
  };
  customerName?: string;
}): void {
  const { tab, tabLabel, data, filters, customerName } = options;
  const dateStr = new Date().toISOString().split('T')[0];

  const filterMeta: ExcelFilterMeta[] = [
    { label: 'Modul Laporan', value: tabLabel },
    { label: 'Preset Periode', value: filters.preset || 'Semua Waktu' },
    {
      label: 'Rentang Tanggal',
      value:
        filters.startDate && filters.endDate
          ? `${filters.startDate} s/d ${filters.endDate}`
          : 'Semua Periode Transaksi',
    },
    { label: 'Customer', value: customerName || 'Semua Customer' },
    { label: 'Status Filter', value: filters.status || 'Semua Status' },
    { label: 'Kata Kunci Pencarian', value: filters.search || '(Tanpa Pencarian)' },
  ];

  const safeCustomerSlug = (customerName || 'SemuaCustomer')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 20);

  const baseFileName = `Rekap_${tab}_${safeCustomerSlug}_${filters.preset || 'AllTime'}_${dateStr}`;

  switch (tab) {
    case 'CUSTOMERS': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN REKAPITULASI DATA & KEUANGAN CUSTOMER',
        filters: filterMeta,
        kpis: [
          { label: 'Total Customer Terdaftar', value: summary?.totalCustomers || list.length },
          { label: 'Grand Total Nilai Faktur', value: summary?.grandTotalInvoiceAmount || 0, isCurrency: true },
          { label: 'Grand Total Terbayar', value: summary?.grandTotalPaidAmount || 0, isCurrency: true },
          { label: 'Grand Total Sisa Piutang', value: summary?.grandTotalOutstanding || 0, isCurrency: true },
          { label: 'Total Saldo Deposit Klien', value: summary?.grandTotalDepositBalance || 0, isCurrency: true },
        ],
        columns: [
          { header: 'Kode', key: 'customerCode', width: 90, align: 'center' },
          { header: 'Nama Customer', key: 'customerName', width: 180 },
          { header: 'Perusahaan / Instansi', key: 'companyName', width: 180 },
          { header: 'Telepon', key: 'phone', width: 110, align: 'center' },
          { header: 'Jml Kegiatan', key: 'totalKegiatan', width: 90, type: 'number' },
          { header: 'Jml Faktur', key: 'totalInvoices', width: 85, type: 'number' },
          { header: 'Total Faktur (Rp)', key: 'totalInvoiceAmount', width: 130, type: 'currency' },
          { header: 'Total Terbayar (Rp)', key: 'totalPaidAmount', width: 130, type: 'currency' },
          { header: 'Sisa Piutang (Rp)', key: 'totalOutstanding', width: 130, type: 'currency' },
          { header: 'Saldo Deposit (Rp)', key: 'depositBalance', width: 130, type: 'currency' },
        ],
        data: list,
        totals: {
          totalInvoiceAmount: summary?.grandTotalInvoiceAmount || 0,
          totalPaidAmount: summary?.grandTotalPaidAmount || 0,
          totalOutstanding: summary?.grandTotalOutstanding || 0,
          depositBalance: summary?.grandTotalDepositBalance || 0,
        },
      });
      break;
    }

    case 'KEGIATAN': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN REKAPITULASI PROYEK & KEGIATAN OPERASIONAL',
        filters: filterMeta,
        kpis: [
          { label: 'Total Kegiatan Terdata', value: summary?.totalKegiatan || list.length },
          { label: 'Grand Total Nilai Proyek', value: summary?.grandTotalValue || 0, isCurrency: true },
        ],
        columns: [
          { header: 'Kode Kegiatan', key: 'code', width: 100, align: 'center' },
          { header: 'Nama Kegiatan Proyek', key: 'name', width: 220 },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Perusahaan', key: 'companyName', width: 160 },
          { header: 'Lokasi Proyek', key: 'location', width: 150 },
          { header: 'Status', key: 'status', width: 90, align: 'center' },
          { header: 'Jml Item', key: 'itemCount', width: 80, type: 'number' },
          { header: 'SPH', key: 'penawaranCount', width: 65, type: 'number' },
          { header: 'Faktur', key: 'invoiceCount', width: 65, type: 'number' },
          { header: 'Nilai Total (Rp)', key: 'totalValue', width: 140, type: 'currency' },
        ],
        data: list,
        totals: {
          totalValue: summary?.grandTotalValue || 0,
        },
      });
      break;
    }

    case 'SPH': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN REKAPITULASI SURAT PENAWARAN HARGA (SPH)',
        filters: filterMeta,
        kpis: [
          { label: 'Total SPH', value: summary?.totalPenawaran || list.length },
          { label: 'Total Nilai SPH', value: summary?.grandTotalAmount || 0, isCurrency: true },
          { label: 'SPH Disetujui (Approved)', value: summary?.approvedTotalAmount || 0, isCurrency: true },
          { label: 'Nilai Telah Difakturkan', value: summary?.grandTotalInvoicedAmount || 0, isCurrency: true },
          { label: 'Sisa Belum Ditagih', value: summary?.grandTotalUnbilledAmount || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. SPH', key: 'number', width: 130, align: 'center' },
          { header: 'Tanggal SPH', key: 'date', width: 95, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Kegiatan Proyek', key: 'kegiatanSummary', width: 200 },
          { header: 'Status', key: 'status', width: 100, align: 'center' },
          { header: 'Nilai SPH (Rp)', key: 'totalAmount', width: 130, type: 'currency' },
          { header: 'Jml Faktur', key: 'invoiceCount', width: 80, type: 'number' },
          { header: 'Telah Difakturkan (Rp)', key: 'invoicedAmount', width: 135, type: 'currency' },
          { header: 'Sisa Belum Ditagih (Rp)', key: 'unbilledAmount', width: 135, type: 'currency' },
        ],
        data: list,
        totals: {
          totalAmount: summary?.grandTotalAmount || 0,
          invoicedAmount: summary?.grandTotalInvoicedAmount || 0,
          unbilledAmount: summary?.grandTotalUnbilledAmount || 0,
        },
      });
      break;
    }

    case 'INVOICES': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN REKAPITULASI FAKTUR PENJUALAN',
        filters: filterMeta,
        kpis: [
          { label: 'Total Faktur Terbit', value: summary?.totalInvoices || list.length },
          { label: 'Grand Total Nilai Faktur', value: summary?.grandTotalAmount || 0, isCurrency: true },
          { label: 'Grand Total Terbayar', value: summary?.grandTotalPaidAmount || 0, isCurrency: true },
          { label: 'Grand Total Sisa Piutang', value: summary?.grandTotalOutstanding || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. Faktur', key: 'number', width: 130, align: 'center' },
          { header: 'Tanggal Faktur', key: 'date', width: 95, type: 'date' },
          { header: 'Jatuh Tempo', key: 'dueDate', width: 95, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Perusahaan', key: 'companyName', width: 160 },
          { header: 'Nilai Faktur (Rp)', key: 'totalAmount', width: 135, type: 'currency' },
          { header: 'Telah Dibayar (Rp)', key: 'paidAmount', width: 135, type: 'currency' },
          { header: 'Sisa Piutang (Rp)', key: 'outstanding', width: 135, type: 'currency' },
          { header: 'Status Pembayaran', key: 'paymentStatus', width: 120, align: 'center' },
        ],
        data: list,
        totals: {
          totalAmount: summary?.grandTotalAmount || 0,
          paidAmount: summary?.grandTotalPaidAmount || 0,
          outstanding: summary?.grandTotalOutstanding || 0,
        },
      });
      break;
    }

    case 'PIUTANG': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN AGING SCHEDULE & KONTROL PIUTANG USAHA',
        filters: filterMeta,
        kpis: [
          { label: 'Total Faktur Berpiutang', value: summary?.totalInvoicesWithOutstanding || list.length },
          { label: 'Grand Total Sisa Piutang', value: summary?.grandTotalOutstanding || 0, isCurrency: true },
          { label: 'Lancar (Belum JT)', value: summary?.currentAmount || 0, isCurrency: true },
          { label: 'Tunggakan 1 - 30 Hari', value: summary?.bucket1To30Amount || 0, isCurrency: true },
          { label: 'Tunggakan 31 - 60 Hari', value: summary?.bucket31To60Amount || 0, isCurrency: true },
          { label: 'Tunggakan 61 - 90 Hari', value: summary?.bucket61To90Amount || 0, isCurrency: true },
          { label: 'Macet (> 90 Hari)', value: summary?.bucketOver90Amount || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. Faktur', key: 'invoiceNumber', width: 130, align: 'center' },
          { header: 'Tgl Faktur', key: 'invoiceDate', width: 90, type: 'date' },
          { header: 'Jatuh Tempo', key: 'dueDate', width: 90, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Aging Bucket', key: 'agingBucket', width: 110, align: 'center' },
          { header: 'Overdue (Hari)', key: 'daysOverdue', width: 90, type: 'number' },
          { header: 'Nilai Faktur (Rp)', key: 'totalAmount', width: 130, type: 'currency' },
          { header: 'Telah Dibayar (Rp)', key: 'paidAmount', width: 130, type: 'currency' },
          { header: 'Sisa Piutang (Rp)', key: 'outstanding', width: 135, type: 'currency' },
          { header: 'Status Pembayaran', key: 'paymentStatus', width: 120, align: 'center' },
        ],
        data: list,
        totals: {
          totalAmount: list.reduce((acc: number, r: any) => acc + (r.totalAmount || 0), 0),
          paidAmount: list.reduce((acc: number, r: any) => acc + (r.paidAmount || 0), 0),
          outstanding: summary?.grandTotalOutstanding || 0,
        },
      });
      break;
    }

    case 'PAYMENTS': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN REKAPITULASI PENERIMAAN KAS MASUK',
        filters: filterMeta,
        kpis: [
          { label: 'Total Transaksi Kas Masuk', value: summary?.totalPayments || list.length },
          { label: 'Grand Total Kas Diterima', value: summary?.grandTotalAmount || 0, isCurrency: true },
          { label: 'Dialokasikan ke Faktur', value: summary?.grandTotalAllocatedAmount || 0, isCurrency: true },
          { label: 'Masuk ke Saldo Deposit', value: summary?.grandTotalExcessDeposit || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. Bukti Kas', key: 'number', width: 130, align: 'center' },
          { header: 'Tanggal Kas', key: 'date', width: 95, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Perusahaan', key: 'companyName', width: 160 },
          { header: 'Nominal Kas (Rp)', key: 'amount', width: 135, type: 'currency' },
          { header: 'Alokasi Faktur (Rp)', key: 'allocatedAmount', width: 135, type: 'currency' },
          { header: 'Sisa Deposit (Rp)', key: 'excessDeposit', width: 130, type: 'currency' },
          { header: 'Metode', key: 'paymentMethod', width: 95, align: 'center' },
          { header: 'Rekening Tujuan', key: 'destinationAccount', width: 180 },
          { header: 'Status Bukti', key: 'status', width: 100, align: 'center' },
        ],
        data: list,
        totals: {
          amount: summary?.grandTotalAmount || 0,
          allocatedAmount: summary?.grandTotalAllocatedAmount || 0,
          excessDeposit: summary?.grandTotalExcessDeposit || 0,
        },
      });
      break;
    }

    case 'UNBILLED': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN ANALISIS SILANG SPH VS FAKTUR (UNBILLED TRACKING)',
        filters: filterMeta,
        kpis: [
          { label: 'Total SPH Disetujui', value: summary?.totalSph || list.length },
          { label: 'Total Nilai SPH Disetujui', value: summary?.totalSphAmount || 0, isCurrency: true },
          { label: 'Telah Diterbitkan Faktur', value: summary?.totalInvoicedAmount || 0, isCurrency: true },
          { label: 'Sisa Belum Ditagih (Leakage)', value: summary?.totalUnbilledAmount || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. SPH', key: 'number', width: 130, align: 'center' },
          { header: 'Tanggal SPH', key: 'date', width: 95, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 180 },
          { header: 'Nilai SPH (Rp)', key: 'totalAmount', width: 135, type: 'currency' },
          { header: 'Telah Difakturkan (Rp)', key: 'invoicedAmount', width: 135, type: 'currency' },
          { header: 'Sisa Belum Ditagih (Rp)', key: 'unbilledAmount', width: 140, type: 'currency' },
          { header: 'Status Penagihan', key: 'billingStatus', width: 130, align: 'center' },
          {
            header: 'Daftar No Faktur Terbit',
            key: 'invoices',
            width: 220,
            formatter: (invs: any[]) => (invs && invs.length > 0 ? invs.map((i) => i.number).join(', ') : '-'),
          },
        ],
        data: list,
        totals: {
          totalAmount: summary?.totalSphAmount || 0,
          invoicedAmount: summary?.totalInvoicedAmount || 0,
          unbilledAmount: summary?.totalUnbilledAmount || 0,
        },
      });
      break;
    }

    case 'SETTLEMENTS': {
      const summary = data;
      const list = summary?.page?.content || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: 'LAPORAN SUBLEDGER PELUNASAN FAKTUR & ALOKASI KAS',
        filters: filterMeta,
        kpis: [
          { label: 'Total Faktur Terbit', value: summary?.totalInvoices || list.length },
          { label: 'Grand Total Nilai Faktur', value: summary?.grandTotalAmount || 0, isCurrency: true },
          { label: 'Total Kas Masuk Terbayar', value: summary?.grandTotalPaidAmount || 0, isCurrency: true },
          { label: 'Total Sisa Piutang Berjalan', value: summary?.grandTotalOutstanding || 0, isCurrency: true },
        ],
        columns: [
          { header: 'No. Faktur', key: 'invoiceNumber', width: 130, align: 'center' },
          { header: 'Tanggal Faktur', key: 'invoiceDate', width: 95, type: 'date' },
          { header: 'Jatuh Tempo', key: 'dueDate', width: 95, type: 'date' },
          { header: 'Customer', key: 'customerName', width: 170 },
          { header: 'Nilai Faktur (Rp)', key: 'totalAmount', width: 135, type: 'currency' },
          { header: 'Telah Terbayar (Rp)', key: 'paidAmount', width: 135, type: 'currency' },
          { header: 'Sisa Piutang (Rp)', key: 'outstanding', width: 135, type: 'currency' },
          { header: 'Status', key: 'paymentStatus', width: 110, align: 'center' },
          {
            header: 'Rincian Alokasi Kas (Bukti / Tgl / Nilai)',
            key: 'allocations',
            width: 320,
            formatter: (allocs: any[]) =>
              allocs && allocs.length > 0
                ? allocs
                    .map(
                      (a) =>
                        `${a.paymentNumber} (${a.paymentDate}): Rp ${Number(a.allocatedAmount).toLocaleString('id-ID')}`
                    )
                    .join('; ')
                : 'Belum Ada Alokasi Kas',
          },
        ],
        data: list,
        totals: {
          totalAmount: summary?.grandTotalAmount || 0,
          paidAmount: summary?.grandTotalPaidAmount || 0,
          outstanding: summary?.grandTotalOutstanding || 0,
        },
      });
      break;
    }

    case 'TREND': {
      const summary = data;
      const list = summary?.months || [];
      generateAndDownloadExcel({
        fileName: baseFileName,
        reportTitle: `LAPORAN TREN WAKTU BULANAN & PERTUMBUHAN MOM TAHUN ${summary?.year || new Date().getFullYear()}`,
        filters: filterMeta,
        kpis: [
          { label: 'Total Omzet Faktur Tahunan', value: summary?.totalInvoicedAmount || 0, isCurrency: true },
          { label: 'Total Realisasi Kas Masuk', value: summary?.totalPaymentAmount || 0, isCurrency: true },
          { label: 'Rerata Collection Rate', value: `${Number(summary?.averageCollectionRate || 0).toFixed(1)}%` },
          { label: 'Total Sisa Piutang Tahun Ini', value: summary?.totalOutstandingAmount || 0, isCurrency: true },
        ],
        columns: [
          { header: 'Bulan', key: 'monthName', width: 110, align: 'center' },
          { header: 'Jml SPH', key: 'sphCount', width: 80, type: 'number' },
          { header: 'Nilai SPH (Rp)', key: 'sphAmount', width: 135, type: 'currency' },
          { header: 'Jml Faktur', key: 'invoicedCount', width: 85, type: 'number' },
          { header: 'Faktur Terbit (Rp)', key: 'invoicedAmount', width: 140, type: 'currency' },
          {
            header: 'MoM Growth',
            key: 'momRevenueGrowth',
            width: 100,
            formatter: (val: any) => (val !== null && val !== undefined ? `${Number(val).toFixed(1)}%` : 'Base'),
          },
          { header: 'Jml Kas Masuk', key: 'paymentCount', width: 95, type: 'number' },
          { header: 'Realisasi Kas (Rp)', key: 'paymentAmount', width: 140, type: 'currency' },
          { header: 'Sisa Piutang (Rp)', key: 'outstandingAmount', width: 135, type: 'currency' },
          {
            header: 'Collection Rate',
            key: 'collectionRate',
            width: 110,
            formatter: (val: any) => `${Number(val || 0).toFixed(1)}%`,
          },
        ],
        data: list,
        totals: {
          sphAmount: summary?.totalSphAmount || 0,
          invoicedAmount: summary?.totalInvoicedAmount || 0,
          paymentAmount: summary?.totalPaymentAmount || 0,
          outstandingAmount: summary?.totalOutstandingAmount || 0,
        },
      });
      break;
    }

    default:
      console.warn('Unknown tab for export:', tab);
  }
}

/**
 * Export Customer Statement (Buku Besar Kronologis) ke Multi-Sheet Excel
 */
export function exportCustomerStatementToExcel(statement: any): void {
  if (!statement) return;
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = (statement.customerName || 'Customer')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 20);

  const filterMeta: ExcelFilterMeta[] = [
    { label: 'Nama Dokumen', value: 'Buku Besar & Riwayat Finansial Pelanggan (Customer Statement)' },
    { label: 'Kode Customer', value: statement.customerCode || '-' },
    { label: 'Nama Customer', value: statement.customerName || '-' },
    { label: 'Perusahaan / Instansi', value: statement.company || '-' },
    { label: 'Telepon / HP', value: statement.phone || '-' },
    { label: 'Email', value: statement.email || '-' },
    { label: 'Alamat', value: statement.address || '-' },
    { label: 'Tanggal Unduh', value: dateStr },
  ];

  const kpis: ExcelKpi[] = [
    { label: 'Saldo Deposit Klien', value: statement.depositBalance || 0, isCurrency: true },
    { label: 'Total Sisa Piutang Berjalan', value: statement.totalOutstandingAmount || 0, isCurrency: true },
    { label: 'Total Tagihan Faktur', value: statement.totalInvoiceAmount || 0, isCurrency: true },
    { label: 'Total Pembayaran Kas Diterima', value: statement.totalPaidAmount || 0, isCurrency: true },
    { label: 'Total Nilai Penawaran (SPH)', value: statement.totalPenawaranAmount || 0, isCurrency: true },
    { label: 'Total Nilai Proyek (Kegiatan)', value: statement.totalKegiatanAmount || 0, isCurrency: true },
  ];

  const columns: ExcelColumn[] = [
    { header: 'Tanggal', key: 'date', width: 95, type: 'date' },
    { header: 'Jenis Transaksi', key: 'type', width: 110, align: 'center' },
    { header: 'No. Referensi', key: 'referenceNo', width: 135, align: 'center' },
    { header: 'Keterangan Transaksi', key: 'description', width: 260 },
    { header: 'Status', key: 'status', width: 110, align: 'center' },
    { header: 'Debit / Tagihan (Rp)', key: 'debit', width: 135, type: 'currency' },
    { header: 'Kredit / Kas (Rp)', key: 'credit', width: 135, type: 'currency' },
    { header: 'Saldo Berjalan (Rp)', key: 'runningBalance', width: 140, type: 'currency' },
    { header: 'Catatan / Rekening', key: 'notes', width: 200 },
  ];

  const items = statement.items || [];

  generateAndDownloadExcel({
    fileName: `BukuBesar_${statement.customerCode || 'CUST'}_${safeName}_${dateStr}`,
    reportTitle: `BUKU BESAR & RIWAYAT FINANSIAL: ${statement.customerName?.toUpperCase() || ''}`,
    reportSubtitle: `Kode: ${statement.customerCode || '-'} | Perusahaan: ${statement.company || '-'}`,
    filters: filterMeta,
    kpis,
    columns,
    data: items,
    totalLabel: 'TOTAL MUTASI',
    totals: {
      debit: items.reduce((acc: number, item: any) => acc + (item.debit || 0), 0),
      credit: items.reduce((acc: number, item: any) => acc + (item.credit || 0), 0),
      runningBalance: statement.totalOutstandingAmount || 0,
    },
  });
}


