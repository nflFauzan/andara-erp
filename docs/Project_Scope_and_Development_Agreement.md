# **PROJECT SCOPE & DEVELOPMENT AGREEMENT** 

Sistem Manajemen Operasional Bisnis 

## **CV. ANDARA** 

Version: 1.0 

**Status: Final for Approval** 

**Client** 

M Dafa Fakhrika 

**Developer** 

M Naufal Fauzan 

##### **Date** 

_[Diisi pada saat penandatanganan]_ 

_CONFIDENTIAL — Dokumen ini bersifat rahasia dan hanya digunakan untuk keperluan internal antara Client dan Developer._ 

**INFORMASI DOKUMEN** 

|**Nama Dokumen**|Project Scope & Development Agreement — Sistem Manajemen Operasional<br>Bisnis CV. ANDARA|
|---|---|
|**Client**|M Dafa Fakhrika (Penanggung Jawab Proyek)|
|**Developer / Tim**<br>**Pengembang**|M Naufal Fauzan|
|**Jenis Sistem**|Web-based Business Management System|
|**Versi Dokumen**|1.0|
|**Status**|Final for Approval|
|**Dokumen Terkait**|Technical & Infrastructure Baseline v1.0 (referensi teknis internal Developer)|
|**Tanggal Penyusunan**|17 September 2026|
|**Tanggal Efektif /**<br>**Persetujuan**|[Diisi pada saat kedua pihak menandatangani dokumen ini]|



_Dokumen ini menjadi acuan utama (source of truth) bagi Client dan Developer selama pengembangan sistem berlangsung. Nilai project dan ketentuan pembayaran yang berlaku adalah yang tercantum pada Bab 34 Agreement ini. Detail arsitektur teknis internal didokumentasikan secara terpisah pada Technical & Infrastructure Baseline._ 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 2 dari 27 

### **DAFTAR ISI** 

#### **PART A — PROJECT SCOPE** 

1. Project Overview 

2. Business Context 

3. Project Objectives 

4. Fokus dan Prinsip Sistem 

5. Ruang Lingkup 

6. System Overview 

7. Master Data (Customer, Kegiatan, Item) 

8. Penawaran 

9. Penawaran ke Faktur Penjualan 

10. Faktur Penjualan 11. Pembayaran 12. Customer Deposit / Saldo 13. Kwitansi 14. Rekap 15. Dashboard 16. Pengaturan Penomoran 17. Desain Cetakan (Tidak Termasuk) 18. Tracking Transaksi 19. Business Rules & Perhitungan 20. Business Flow 21. Tahap Pengerjaan 22. Phase 2 (Tidak Berlaku) 23. Out of Scope 24. Asumsi & Ketergantungan 

#### **PART B — DEVELOPMENT AGREEMENT** 

25. Deliverables 26. Timeline & Dependencies 27. Client Responsibilities 28. Developer Responsibilities 29. Review & Acceptance 30. Bug, Warranty & Post-Launch Support 31. Change Request 32. Infrastructure & Data Ownership 33. Backup & Data Protection 34. Commercial Terms 35. Project Completion 36. Final Terms & Signature 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 3 dari 27 

# **PART A PROJECT SCOPE** 

_Menjelaskan apa yang akan dibangun, mengapa dibutuhkan, dan bagaimana sistem bekerja secara detail._ 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 4 dari 27 

### **1. PROJECT OVERVIEW** 

CV. ANDARA membutuhkan sebuah sistem berbasis web untuk membantu operasional pencatatan dan monitoring transaksi bisnis sehari-hari — mulai dari data customer, kegiatan/pekerjaan, penawaran, faktur penjualan, pembayaran, kwitansi, hingga saldo deposit customer. Saat ini proses tersebut masih banyak dilakukan secara manual sehingga rawan salah hitung, sulit ditelusuri, dan memakan waktu untuk membuat rekap. 

Sistem yang akan dibangun difokuskan sebagai alat bantu operasional dan pencatatan transaksi, bukan sebagai sistem akuntansi atau ERP yang lengkap. Sistem ini hanya digunakan oleh satu role, yaitu Admin, tanpa pengaturan multi-user atau hak akses bertingkat. 

Dokumen ini adalah Project Scope & Development Agreement: dokumen gabungan yang menjelaskan ruang lingkup sistem secara rinci (Part A — Project Scope) sekaligus kesepakatan kerja sama pengembangannya (Part B — Development Agreement), antara: 

- Client: M Dafa Fakhrika, penanggung jawab proyek untuk kebutuhan operasional CV. ANDARA. 

- Developer / Tim Pengembang: M Naufal Fauzan. 

Secara garis besar, dokumen ini merangkum: 

- Apa saja yang bisa dilakukan oleh sistem (ruang lingkup fitur), dijelaskan modul per modul. 

- Bagaimana proses bisnis utama berjalan, termasuk alur Penawaran ke Faktur, Faktur ke Pembayaran, dan pengelolaan Deposit Customer. 

- Apa yang termasuk dan tidak termasuk dalam project ini. 

- Tahapan pengerjaan sistem sampai dapat digunakan untuk operasional. 

- Ketentuan kerja sama pengembangan: tanggung jawab, komersial, acceptance, dan mekanisme perubahan scope. 

Dokumen ini menjadi acuan utama (source of truth) bagi kedua pihak selama pengembangan berlangsung, Client menerima dokumen ini sebagai dasar kesepakatan kerja sama, tanpa perlu membaca dokumen teknis internal (FSD atau spesifikasi teknis) yang menjadi acuan kerja Developer. 

Dengan menandatangani dokumen ini, Client dan Developer menyatakan telah membaca, memahami, dan menyetujui seluruh ruang lingkup serta ketentuan kerja sama yang dijabarkan di dalamnya. 

### **2. BUSINESS CONTEXT** 

CV. ANDARA menjalankan operasional bisnis yang melibatkan banyak transaksi dengan customer — mulai dari penawaran pekerjaan, penerbitan faktur, penerimaan pembayaran, hingga penerbitan kwitansi. Prosesproses ini saat ini masih memerlukan rekap manual untuk mengetahui status tagihan, riwayat pembayaran, maupun saldo lebih bayar (deposit) dari masing-masing customer. 

Kondisi ini menimbulkan beberapa tantangan operasional: 

- Risiko kesalahan perhitungan pada pencatatan manual. 

- Kesulitan menelusuri hubungan antar transaksi — misalnya faktur mana saja yang berasal dari penawaran yang mana. 

- Waktu tambahan yang dibutuhkan untuk menyusun rekap dan laporan monitoring. 

Atas dasar kebutuhan tersebut, Client mengajukan pengembangan sebuah sistem berbasis web yang dapat mendigitalisasi proses pencatatan transaksi tersebut secara terstruktur dan saling terhubung. 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 5 dari 27 

### **3. PROJECT OBJECTIVES** 

Sistem dibangun untuk membantu operasional pencatatan dan monitoring transaksi bisnis, dengan cakupan utama pada data dan transaksi berikut: 

- Customer 

- Kegiatan / pekerjaan 

- Item pekerjaan 

- Penawaran 

- Faktur Penjualan 

- Pembayaran 

- Kwitansi 

- Deposit / saldo customer 

- Rekap transaksi 

- Dashboard monitoring 

- Penomoran transaksi otomatis 

Secara khusus, sistem ini bertujuan untuk: 

- Mengurangi rekap manual yang selama ini dilakukan. 

- Mengurangi risiko kesalahan perhitungan pada transaksi. 

- Memudahkan tracking/penelusuran setiap transaksi. 

- Memudahkan monitoring tagihan dan status pembayaran customer. 

- Membuat hubungan antar transaksi (Penawaran, Faktur, Pembayaran, Kwitansi) menjadi lebih jelas dan tertelusuri. 

### **4. FOKUS DAN PRINSIP SISTEM** 

Sistem ini dirancang dengan prinsip fokus dan secukupnya, mengikuti kebutuhan operasional CV. ANDARA yang sebenarnya, bukan mengikuti pola umum software akuntansi atau ERP pada umumnya. 

#### **4.1 Fokus Utama** 

- Pencatatan transaksi penjualan dari tahap penawaran hingga pembayaran lunas. 

- Kejelasan hubungan antar dokumen transaksi (Penawaran — Faktur — Pembayaran — Kwitansi). 

- Kemudahan monitoring tagihan, status pembayaran, dan saldo deposit customer. 

- Penomoran dokumen transaksi secara otomatis dan konsisten. 

#### **4.2 Batasan Prinsip** 

Project ini TIDAK dikembangkan menjadi ERP atau software akuntansi lengkap. Modul yang dibangun hanya mencakup pencatatan transaksi penjualan dan monitoring terkait, sebagaimana dijabarkan dalam Ruang Lingkup pada Bab 5. 

### **5. RUANG LINGKUP** 

#### **5.1 Role Pengguna** 

Sistem ini hanya memiliki satu role pengguna, yaitu: 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 6 dari 27 

- ADMIN — satu-satunya role yang dapat mengoperasikan seluruh modul sistem. 

Modul-modul berikut secara eksplisit tidak termasuk dalam ruang lingkup: 

- Role management / manajemen peran pengguna 

- User management / manajemen banyak akun pengguna 

- Permission management / hak akses bertingkat 

- Multi-level approval 

- Daftar pengguna 

_Modul-modul di atas hanya disebutkan sebagai kemungkinan pengembangan di masa depan (future development) dan dengan tegas tidak masuk dalam ruang lingkup project ini._ 

#### **5.2 Cakupan Fungsional** 

Ruang lingkup fungsional project ini mencakup 5 (lima) kelompok modul utama, yang dijabarkan lebih lanjut pada Bab 6 — System Overview, dan dijelaskan detail requirement-nya pada Bab 7 sampai dengan Bab 18. 

### **6. SYSTEM OVERVIEW** 

Struktur menu utama sistem terbagi menjadi 5 (lima) kelompok besar: 

|**Kelompok Menu**|**Sub-Menu**|
|---|---|
|DASHBOARD|—|
|MASTER DATA|Customer, Kegiatan / Pekerjaan, Item|
|TRANSAKSI|Penawaran, Faktur Penjualan, Pembayaran, Kwitansi|
|KEUANGAN / REKAP|Deposit / Saldo Customer, Rekap|
|PENGATURAN|Penomoran|



_Detail requirement masing-masing menu dijelaskan pada bab-bab berikutnya, mengikuti urutan: Master Data (Bab 7), Penawaran (Bab 8-9), Faktur Penjualan (Bab 10), Pembayaran (Bab 11), Deposit (Bab 12), Kwitansi (Bab 13), Rekap (Bab 14), Dashboard (Bab 15), dan Pengaturan Penomoran (Bab 16)._ 

#### **Alur Utama Sistem** 

Diagram berikut menunjukkan bagaimana sebuah transaksi mengalir dari data Customer hingga tercermin pada Rekap dan Dashboard, termasuk bagaimana status pembayaran dan Deposit Customer ditentukan: 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 7 dari 27 



<!-- Start of picture text -->
Kegiatan / Pekerjaan<br>Faktur Penjualan -----------4<br>i<br>i<br>Pembayaran diterbitkanKwitansi IH|<br>I<br>|<br>i<br>|<br>I<br>Total Pembayaran i<br>dibandingkan Total Faktur \<br>kurang esUET lebih ;<br>SEBAGIANDIBAYAR CUSTOMERDEPOSIT I|I<br>I<br>|<br>melunas!Dapat digunakanFaktur berikutnyauntuk |. ___yyI<br>REKAP / DASHBOARD<br>diperbarui otomatis<br><!-- End of picture text -->

_Diagram 1 — Alur Umum Sistem_ 

### **7. MASTER DATA** 

#### **7.1 Customer** 

Satu Customer dapat memiliki banyak kegiatan, banyak penawaran, banyak faktur, dan banyak pembayaran. Sistem harus dapat menampilkan riwayat transaksi dari masing-masing customer. 

Informasi monitoring pada data Customer minimal mencakup: 

- Total transaksi 

- Total faktur 

- Total pembayaran 

- Sisa tagihan 

- Saldo / deposit customer 

#### **7.2 Kegiatan / Pekerjaan** 

Satu Customer dapat memiliki banyak Kegiatan/Pekerjaan, dan satu Kegiatan dapat memiliki banyak Item, dengan struktur sebagai berikut: 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 8 dari 27 

|**Struktur Data**|**Keterangan**|
|---|---|
|Customer|Induk data, dapat memiliki banyak Kegiatan|
|└ Kegiatan|Terhubung ke satu Customer, dapat memiliki banyak Item|
|└ Item|Rincian pekerjaan/barang yang membentuk nilai Kegiatan|



Informasi Kegiatan dapat mencakup: 

- Nama kegiatan 

- Customer terkait 

- Lokasi pekerjaan 

- Keterangan 

- Daftar item 

- Nilai kegiatan (akumulasi dari item) 

- Status kegiatan, jika memang diperlukan 

Modul Kegiatan tidak mencakup workflow manajemen proyek seperti task management, kanban, timesheet, employee assignment, atau Gantt chart, karena hal tersebut tidak termasuk dalam requirement. 

#### **7.3 Item** 

Setiap Item minimal memiliki data: 

- Nama item 

- Volume 

- Satuan 

- Harga satuan 

- Total 

- Keterangan (bila diperlukan) 

Perhitungan pada Item mengikuti rumus berikut: 

|**Perhitungan**|**Rumus**|
|---|---|
|Total Item|Volume × Harga Satuan|
|Total Kegiatan|Akumulasi (penjumlahan) seluruh Total Item pada kegiatan tersebut|



### **8. PENAWARAN** 

Satu Penawaran dapat memiliki beberapa Kegiatan, dan setiap Kegiatan dapat memiliki beberapa Item, dengan struktur akumulasi nilai sebagai berikut: 

|**Struktur Penawaran**|**Keterangan**|
|---|---|
|Penawaran|Dapat memiliki beberapa Kegiatan (Kegiatan A, B, C, dst.)|
|└ Kegiatan A / B / C|Masing-masing dapat memiliki beberapa Item|
|└ Item 1, 2, 3, dst.|Total Item berjenjang ke Total Kegiatan, lalu ke Total Penawaran|



Project Scope & Development Agreement — CV. ANDARA   |   Halaman 9 dari 27 

Penawaran harus dapat memuat informasi berikut: 

- Nomor penawaran 

- Tanggal 

- Customer 

- Daftar kegiatan 

- Daftar item per kegiatan 

- Volume, satuan, dan harga satuan per item 

- Total per item, per kegiatan, dan total keseluruhan penawaran 

- Catatan / keterangan 

_Dokumen penawaran asli dari Client akan menjadi referensi final untuk format cetak. Field yang belum tercantum di sini tidak ditambahkan secara sepihak; format final akan disesuaikan berdasarkan dokumen/contoh transaksi asli dari Client._ 

### **9. PENAWARAN KE FAKTUR PENJUALAN** 

Bagian ini merupakan salah satu bagian terpenting dalam sistem. Faktur Penjualan dapat dibuat berdasarkan Penawaran, namun sistem tidak memaksakan aturan 1 kegiatan = 1 invoice, karena Client membutuhkan fleksibilitas penagihan. 

Faktur dapat dibuat dengan beberapa cara berikut: 

- Berdasarkan satu kegiatan 

- Berdasarkan beberapa kegiatan sekaligus 

- Berdasarkan item tertentu saja 

- Berdasarkan sebagian pekerjaan / sebagian nilai 

- Dibuat secara custom / manual (tanpa dasar penawaran) 

Dengan demikian, satu Penawaran dapat menghasilkan beberapa Faktur. Sistem menyimpan 

hubungan/referensi antara Faktur dan Penawaran apabila faktur tersebut dibuat berdasarkan penawaran, serta memeriksa potensi penagihan ganda atas bagian pekerjaan yang sama sebelum Faktur disimpan. 

Tidak ada asumsi bahwa seluruh nilai penawaran harus selalu berubah menjadi satu faktur secara utuh. Fleksibilitas ini adalah salah satu kebutuhan inti dari Client. 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 10 dari 27 



<!-- Start of picture text -->
Penawaran tersimpan<br>(berisi Kegiatan dan Item)<br>Admin memilih dasar<br>pembuatan Faktur<br>Faktur dari Faktur dari<br>1 Kegiatan penuh beberapa Kegiatan Fakturnial daritertentuitem/ tanpaFakturdasar dibuatPenawaran manual<br>Sistem menyimpan referensi ke Penawaran<br>Sistem memeriksa<br>potensi penagihan ganda<br>tumpang si<br>Sistem memberi belumtain pernah<br>eringatan ke Admin<br>Faktur Penjualan<br>tersimpan<br><!-- End of picture text -->

_Diagram 2 — Alur Penawaran ke Faktur Penjualan, termasuk pengecekan penagihan ganda_ 

### **10. FAKTUR PENJUALAN** 

Faktur Penjualan dapat dibuat dengan dua cara: (1) dibuat dari Penawaran, atau (2) dibuat secara manual/custom. 

Informasi minimal pada Faktur Penjualan: 

- Nomor faktur 

- Tanggal 

- Customer 

- Kegiatan / referensi pekerjaan 

- Detail tagihan 

- Jumlah dan harga 

- Total 

- Keterangan 

- Referensi penawaran (jika faktur berasal dari penawaran) 

#### **10.1 Status Pembayaran Faktur** 

Status pembayaran dihitung secara otomatis oleh sistem berdasarkan aturan berikut: 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 11 dari 27 

|**Kondisi**|**Status Faktur**|
|---|---|
|Total pembayaran = 0|BELUM BAYAR|
|Total pembayaran > 0, namun masih kurang dari total faktur|SEBAGIAN DIBAYAR|
|Total pembayaran memenuhi/melebihi total faktur|LUNAS|



_“DP” (uang muka) tidak dijadikan sebagai status invoice. DP atau pembayaran sebagian adalah kondisi dari transaksi pembayaran, bukan status resmi dari faktur. Status faktur hanya mengenal 3 (tiga) kondisi: Belum Bayar, Sebagian Dibayar, dan Lunas._ 

### **11. PEMBAYARAN** 

Pembayaran dicatat secara manual oleh Admin. Tidak ada payment gateway dalam ruang lingkup project ini. 

Metode pembayaran dapat berupa: 

- Transfer 

- Tunai 

- Metode lain yang memang dibutuhkan Client 

Nominal pembayaran bersifat fleksibel dan dapat dilakukan bertahap. Contoh ilustrasi: 

|**Keterangan**|**Nominal**|
|---|---|
|Total Faktur|Rp50.000.000|
|Pembayaran Tahap 1|Rp20.000.000|
|Sisa Tagihan|Rp30.000.000|



Customer dapat melakukan pembayaran berikutnya untuk melunasi sisa tagihan tersebut. Setiap pembayaran harus memiliki riwayat yang jelas dan dapat ditelusuri. Apabila diperlukan berdasarkan dokumen Client, sistem dapat menyediakan referensi/bukti pembayaran pada masing-masing catatan pembayaran. 

### **12. CUSTOMER DEPOSIT / SALDO** 

Ini adalah salah satu requirement penting dalam sistem ini. Sistem harus mendukung kondisi kelebihan pembayaran (deposit) dari customer. 

#### **12.1 Ilustrasi Konsep** 

Contoh 1 — Kelebihan pembayaran menjadi deposit: 

|**Keterangan**|**Nominal**|
|---|---|
|Faktur A|Rp50.000.000|
|Pembayaran Customer|Rp60.000.000|
|Dialokasikan ke Faktur A|Rp50.000.000|
|Masuk ke Deposit Customer|Rp10.000.000|



Project Scope & Development Agreement — CV. ANDARA   |   Halaman 12 dari 27 

Contoh 2 — Deposit digunakan untuk faktur berikutnya: 

|**Keterangan**|**Nominal**|
|---|---|
|Faktur B|Rp20.000.000|
|Pembayaran Baru dari Customer|Rp10.000.000|
|Deposit yang Digunakan|Rp10.000.000|
|Status Faktur B|LUNAS|
|Saldo Deposit Customer Setelahnya|Rp0|



#### **12.2 Rekomendasi Implementasi** 

- Pembayaran dapat dialokasikan ke faktur tertentu. 

- Kelebihan pembayaran otomatis menjadi deposit customer. 

- Deposit dapat digunakan untuk pembayaran faktur berikutnya. 

- Admin dapat menyesuaikan alokasi pembayaran apabila diperlukan. 

- Setiap pergerakan deposit (masuk maupun keluar) harus dapat ditelusuri riwayatnya. 

#### **12.3 Rumus Saldo Deposit** 

|**Perhitungan**|**Rumus**|
|---|---|
|Saldo Deposit|Deposit Masuk − Deposit Digunakan|



_Deposit tidak boleh menjadi angka yang dapat diedit sembarangan tanpa histori transaksi. Setiap perubahan saldo deposit harus berasal dari transaksi yang tercatat (kelebihan pembayaran atau pemakaian deposit)._ 

### **13. KWITANSI** 

Kwitansi merupakan dokumen yang dihasilkan berdasarkan transaksi pembayaran yang sudah tercatat. 

Kwitansi BUKAN transaksi pembayaran baru. Kwitansi adalah dokumen bukti yang mereferensikan pembayaran yang sudah ada. 

Kwitansi dapat memuat: 

- Nomor kwitansi 

- Tanggal 

- Customer 

- Nominal 

- Terbilang 

- Keterangan 

- Referensi pembayaran / faktur 

- Informasi perusahaan 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 13 dari 27 

**14. REKAP** 

Sistem menyediakan fitur rekap transaksi untuk menggantikan proses rekap manual yang selama ini dilakukan. Rekap minimal dapat ditelusuri berdasarkan: 

- Customer 

- Kegiatan 

- Faktur 

- Pembayaran 

- Periode (rentang tanggal) 

_Rekap pada sistem ini tidak mencakup laporan akuntansi seperti neraca, laba rugi, jurnal umum, buku besar, atau arus kas akuntansi, karena hal tersebut berada di luar ruang lingkup, kecuali ditemukan requirement eksplisit dari Client di kemudian hari._ 

### **15. DASHBOARD** 

Dashboard menjadi pusat monitoring kondisi transaksi bagi Admin. Informasi yang relevan untuk ditampilkan meliputi: 

- Total penawaran 

- Total faktur 

- Total nilai transaksi 

- Total pembayaran 

- Total tagihan belum lunas 

- Total deposit customer 

- Jumlah faktur belum bayar 

- Jumlah faktur sebagian dibayar 

- Jumlah faktur lunas 

- Pembayaran terbaru 

- Customer dengan tagihan 

- Ringkasan kegiatan 

_Dashboard dirancang secukupnya untuk membantu Admin memonitor kondisi transaksi, bukan dibuat penuh widget hanya agar terlihat ramai. Prioritas diberikan pada informasi yang benar-benar membantu monitoring operasional._ 

### **16. PENGATURAN PENOMORAN** 

Client menginginkan fitur penomoran transaksi yang fleksibel dan familiar dengan konsep yang digunakan pada software Accurate, berdasarkan referensi screenshot yang diberikan. Bagian ini disusun dengan memisahkan secara jelas antara pola yang menjadi referensi, requirement Client, dan adaptasi yang direkomendasikan khusus untuk sistem ini. 

#### **16.1 Referensi Pola Konfigurasi Penomoran** 

- Konfigurasi penomoran memiliki Nama Penomoran dan Tipe Transaksi, dan satu tipe transaksi dapat memiliki lebih dari satu format penomoran (misalnya berbeda per cabang). 

- Tipe Penomoran (aturan reset) memiliki 4 pilihan: Tidak Reset, Reset Setiap Hari, Reset Setiap Bulan, dan Reset Setiap Tahun (default: Reset Setiap Bulan). 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 14 dari 27 

- Jumlah Digit Counter dapat ditentukan sesuai volume transaksi bisnis. 

- Komponen Penomoran terdiri dari: Tahun, Tahun (Singkat), Bulan, Bulan (Romawi), Hari, Counter, dan Teks/Pemisah, yang disusun bebas menggunakan tombol tambah komponen. 

- Hasil format yang disusun dapat langsung dilihat pratinjaunya sebelum disimpan. 

- Tersedia juga pembatasan format penomoran tertentu hanya untuk pengguna/cabang tertentu — kemampuan ini bersifat spesifik untuk kebutuhan multi-user/multi-cabang. 

#### **16.2 Requirement Client** 

- Fitur penomoran yang fleksibel dan familiar dengan pola Accurate. 

- Minimal transaksi yang perlu dipertimbangkan untuk penomoran: Penawaran, Faktur Penjualan, Pembayaran, dan Kwitansi. 

- Sistem harus mendukung reset counter berdasarkan periode yang dikonfigurasi. 

#### **16.3 Adaptasi untuk Sistem Ini** 

Mengikuti prinsip kehati-hatian terhadap penambahan fitur di luar dasar yang jelas, tidak seluruh daftar tipe transaksi pada software referensi (seperti Harga Pemasok, Hasil Stok Opname, Jurnal Umum, Karyawan, Pemasok, dan lain-lain) dimasukkan ke dalam sistem ini karena tidak relevan dengan ruang lingkup project. Adaptasi yang direkomendasikan: 

- Tipe transaksi yang tersedia untuk konfigurasi penomoran dibatasi pada: Penawaran, Faktur Penjualan, Pembayaran, dan Kwitansi — sesuai modul yang ada pada sistem ini. 

- Komponen penomoran (Tahun, Tahun Singkat, Bulan, Hari, Counter, Teks/Pemisah) diadaptasi sesuai kebutuhan, mengikuti pola dasar di atas. 

- Pilihan reset counter (Tidak Reset / Harian / Bulanan / Tahunan) diadaptasi mengikuti pola yang sama. 

- Fitur pembatasan format berdasarkan user/cabang tidak diadaptasi ke sistem ini, karena sistem hanya memiliki satu role (Admin) sebagaimana dijelaskan pada Bab 5. 

#### **16.4 Field Konfigurasi Penomoran** 

|**Field**|**Keterangan**|
|---|---|
|Nama Konfigurasi|Nama bebas untuk mengenali format penomoran|
|Tipe Transaksi|Penawaran / Faktur Penjualan / Pembayaran / Kwitansi|
|Prefix / Suffix|Teks tetap di awal/akhir nomor, misal “INV-”|
|Komponen Tahun / Bulan|Tahun penuh, tahun singkat, bulan angka, dan sejenisnya|
|Counter|Angka urut otomatis|
|Jumlah Digit Counter|Menentukan panjang angka urut, misal 4 digit → 0001|
|Periode Reset|Tidak Reset / Setiap Hari / Setiap Bulan / Setiap Tahun|
|Contoh Hasil Penomoran|Pratinjau hasil akhir format nomor yang disusun|



#### **16.5 Contoh Format Penomoran** 

Sebagai ilustrasi, format berikut: 

- INV-[TAHUN SINGKAT][BULAN][COUNTER] 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 15 dari 27 

dengan pengaturan 4 digit counter, akan menghasilkan contoh nomor: 

- INV-26090001 (transaksi ke-1 pada bulan September 2026) 

_Tujuan fitur ini adalah memberikan pengalaman dan kemampuan konfigurasi yang sesuai kebutuhan Client dan familiar dengan pola Accurate — bukan replikasi identik 100% dari seluruh kemampuannya._ 

### **17. DESAIN CETAKAN — TIDAK TERMASUK** 

###### **Fitur ini TIDAK termasuk dalam ruang lingkup dan nilai project.** 

Berdasarkan hasil kesepakatan terbaru antara Client dan Developer, fitur Desain Cetakan / Custom Print Design dikeluarkan dari ruang lingkup project ini dan tidak menjadi bagian dari deliverable yang akan dikerjakan. 

Bab ini sengaja dipertahankan agar penomoran bab pada dokumen tetap konsisten, sekaligus menegaskan bahwa fitur Desain Cetakan tidak lagi termasuk dalam project. 

#### **17.1 Yang Tidak Dikerjakan** 

Hal-hal berikut tidak termasuk dalam project ini: 

- Visual designer untuk mengatur tampilan cetak dokumen transaksi. 

- Pembuatan atau penyesuaian template cetakan untuk Penawaran, Faktur Penjualan, Pembayaran, maupun Kwitansi. 

- Pengaturan ukuran kertas, orientasi, margin, band tata letak, dan elemen desain cetakan. 

#### **17.2 Yang Tetap Termasuk** 

Pengaturan Penomoran Transaksi sebagaimana dijelaskan pada Bab 16 TETAP termasuk dalam ruang lingkup project dan tidak terpengaruh oleh perubahan ini. 

_Apabila di kemudian hari Client membutuhkan fitur Desain Cetakan, hal tersebut diperlakukan sebagai penambahan ruang lingkup dan diproses melalui mekanisme Change Request pada Bab 31, dengan penilaian biaya dan waktu tersendiri._ 

### **18. TRACKING TRANSAKSI** 

Salah satu tujuan utama sistem ini adalah membuat hubungan antar transaksi menjadi jelas dan mudah ditelusuri. Setiap Customer dapat ditelusuri riwayat lengkapnya, mencakup seluruh Kegiatan, Penawaran, Faktur, Pembayaran, Deposit, dan Kwitansi yang terkait dengannya. 

Beberapa hubungan penelusuran (referensi) antar dokumen yang didukung sistem: 

- Faktur dapat ditelusuri referensinya ke Penawaran asal (jika dibuat dari penawaran). 

- Pembayaran dapat ditelusuri riwayatnya ke Faktur terkait. 

- Pemakaian atau penambahan Deposit dapat ditelusuri ke Pembayaran yang menjadi sumbernya. 

- Kwitansi dapat ditelusuri referensinya ke Pembayaran dan Faktur terkait. 

Hubungan antar-modul ini ditunjukkan secara visual pada Diagram 3 di Bab 20 — Business Flow. 

### **19. BUSINESS RULES & PERHITUNGAN** 

Bab ini merangkum seluruh aturan bisnis dan rumus perhitungan yang telah dijelaskan pada bab-bab sebelumnya, sebagai satu referensi ringkas. 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 16 dari 27 

#### **19.1 Perhitungan Item dan Kegiatan** 

|**Perhitungan**|**Rumus**|
|---|---|
|Total Item|Volume × Harga Satuan|
|Total Kegiatan|Akumulasi seluruh Total Item pada kegiatan tersebut|
|Total Penawaran|Akumulasi seluruh Total Kegiatan pada penawaran tersebut|



#### **19.2 Status Faktur** 

|**Kondisi**|**Status Faktur**|
|---|---|
|Total pembayaran = 0|BELUM BAYAR|
|0 < Total pembayaran < Total Faktur|SEBAGIAN DIBAYAR|
|Total pembayaran ≥ Total Faktur|LUNAS|



#### **19.3 Alokasi Pembayaran dan Deposit** 

- Jika pembayaran ≤ sisa tagihan faktur → seluruh pembayaran dialokasikan ke faktur tersebut. 

- Jika pembayaran > sisa tagihan faktur → kelebihan pembayaran otomatis menjadi Deposit Customer. 

- Jika Deposit digunakan untuk faktur berikutnya → saldo deposit berkurang sesuai nilai yang digunakan. 

|**Perhitungan**|**Rumus**|
|---|---|
|Saldo Deposit|Deposit Masuk − Deposit Digunakan|



_Integritas Data Finansial: data yang telah digunakan dalam transaksi finansial (Faktur, Pembayaran, Deposit, Kwitansi) tidak diubah secara langsung tanpa mekanisme revisi/koreksi yang menjaga jejak histori transaksi. Perubahan pada metadata non-finansial (misalnya catatan atau keterangan) dapat dilakukan tanpa memengaruhi histori tersebut._ 

### **20. BUSINESS FLOW** 

Secara umum, alur penggunaan sistem oleh Admin mengikuti tahapan berikut: Admin mencatat data Customer, kemudian membuat Kegiatan/Pekerjaan beserta Item di dalamnya, lalu menyusun Penawaran untuk customer tersebut. Penawaran yang disetujui dapat diterbitkan menjadi satu atau beberapa Faktur Penjualan sesuai kebutuhan penagihan (lihat Bab 9). Pembayaran yang diterima dicatat oleh Admin, yang kemudian menentukan status faktur secara otomatis dan dapat menghasilkan Kwitansi sebagai bukti pembayaran. Seluruh transaksi ini secara otomatis memperbarui Dashboard dan Rekap sebagai pusat monitoring. Alur lengkap beserta penentuan status pembayaran dan Deposit ditunjukkan pada Diagram 1 di Bab 6. 

Diagram berikut melengkapi gambaran alur di atas dengan menunjukkan bagaimana modul-modul saling terhubung dan dapat ditelusuri satu sama lain (lihat juga Bab 18 — Tracking Transaksi): 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 17 dari 27 



<!-- Start of picture text -->
Customer<br>. Faktur. Deposit<br>REKAP/DASHBOARD<br><!-- End of picture text -->

_Diagram 3 — Hubungan dan Penelusuran antar Modul_ 

### **21. TAHAP PENGERJAAN** 



<!-- Start of picture text -->
PENGERJAAN SISTEM LIVE<br>Core Operational System<br>+1 bulan - seluruh modul operasional inti Sie openconar<br><!-- End of picture text -->

_Diagram 4 — Tahap pengerjaan sampai sistem dapat digunakan_ 

Project ini dikerjakan dalam satu tahap pengerjaan sampai sistem dapat digunakan untuk operasional (Live). 

|**Keterangan**|**Detail**|
|---|---|
|Estimasi Durasi|±1 (satu) bulan|
|Target|Aplikasi web utama sudah dapat digunakan untuk operasional setelah<br>tahap ini selesai|



Pengerjaan mencakup modul-modul berikut: 

- Dashboard 

- Customer 

- Kegiatan / Pekerjaan 

- Item 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 18 dari 27 

- Penawaran 

- Faktur Penjualan 

- Pembayaran 

- Deposit / Saldo Customer 

- Kwitansi 

- Rekap 

- Penomoran 

- Fitur inti lainnya yang telah masuk ruang lingkup utama sebagaimana dijelaskan pada Bab 7 sampai Bab 19 

_Fitur Desain Cetakan Transaksi tidak termasuk dalam ruang lingkup project ini (lihat Bab 17 dan Bab 23)._ 

#### **Definisi “Live”** 

Sistem dianggap Live apabila: 

- seluruh scope pengerjaan selesai sesuai Agreement ini; 

- pengujian utama atas alur bisnis inti telah dilakukan; 

- sistem telah dideploy ke environment production; 

- alur bisnis utama yang termasuk dalam scope dapat digunakan/dijalankan sesuai ketentuan yang disepakati. 

Definisi “Live” di atas menjadi acuan objektif atas selesainya pekerjaan pengembangan, sebagaimana dirujuk pada Bab 35 – Project Completion. 

### **22. PHASE 2 — TIDAK BERLAKU** 

**Project ini tidak lagi dibagi menjadi dua phase.** 

Pada versi dokumen sebelumnya, Phase 2 berisi pengerjaan fitur Desain Cetakan Transaksi. Karena fitur tersebut dikeluarkan dari ruang lingkup berdasarkan kesepakatan terbaru, Phase 2 tidak berlaku dan seluruh pekerjaan berada pada satu tahap pengerjaan sebagaimana dijelaskan pada Bab 21. 

Bab ini dipertahankan agar penomoran bab pada dokumen tetap konsisten. 

### **23. OUT OF SCOPE** 

Hal-hal berikut secara eksplisit tidak termasuk dalam ruang lingkup project ini, kecuali di kemudian hari ditemukan requirement eksplisit dari Client yang dibahas melalui Change Request (Bab 31): 

- Desain Cetakan / Custom Print Design (lihat Bab 17) 

- Payment gateway 

- Mobile native app 

- Inventory / manajemen stok penuh 

- Purchase management penuh 

- Supplier management penuh 

- Payroll 

- General ledger 

- Accounting lengkap (neraca, laba rugi, jurnal umum, buku besar) 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 19 dari 27 

- Tax system yang kompleks 

- Marketplace integration 

- Banking integration 

- Multi-role / multi-user permission management 

- Approval workflow yang kompleks 

_Daftar ini bertujuan mencegah scope creep dan menjaga kejelasan batas project bagi kedua pihak._ 

### **24. ASUMSI & KETERGANTUNGAN** 

Penyusunan dokumen ini memiliki beberapa asumsi dan ketergantungan terhadap data/dokumen yang akan disediakan oleh Client: 

- Client akan memberikan dokumen transaksi asli (penawaran, faktur, kwitansi, dan lainnya) sebagai referensi data dan istilah yang digunakan pada sistem. 

- Field dan aturan bisnis yang belum tercantum secara eksplisit pada dokumen ini akan dikonfirmasikan terlebih dahulu ke Client sebelum diimplementasikan, bukan ditambahkan berdasarkan asumsi. 

- Sistem hanya digunakan oleh satu Admin role, sebagaimana dijelaskan pada Bab 5. 

- Server dan domain untuk periode awal sudah termasuk dalam nilai project (lihat Bab 34). Harga perpanjangan pihak ketiga setelah periode tersebut dapat berubah mengikuti kebijakan provider. 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 20 dari 27 

# **PART B DEVELOPMENT AGREEMENT** 

_Menjelaskan ketentuan kerja sama, tanggung jawab, dan syarat komersial antara Client dan Developer._ 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 21 dari 27 

### **25. DELIVERABLES** 

Bab ini merangkum hasil kerja yang akan diserahkan kepada Client, sebagai turunan langsung dari ruang lingkup pada Part A. Deliverable yang akan diterima Client dari project ini: 

- A. Software — aplikasi web Sistem Manajemen Operasional Bisnis CV. ANDARA sesuai ruang lingkup yang disepakati pada Agreement ini. 

- B. Production deployment — aplikasi telah dideploy dan dapat diakses pada environment production melalui domain dan HTTPS. 

- C. Database/application setup — setup awal database, konfigurasi aplikasi, serta konfigurasi dan pengujian backup database (restore test) sebelum peluncuran. 

- D. Documentation/handover — dokumentasi dan konfigurasi teknis yang relevan (lihat Bab 32). 

- E. Infrastructure setup — setup infrastruktur production (termasuk server dan domain yang sudah tercakup dalam nilai project) sesuai baseline pada Bab 32 dan Bab 33. 

_Sesi training, masa dukungan pasca-launching, dan cakupan garansi di luar perbaikan bug sesuai scope mengikuti ketentuan pada Bab 30._ 

### **26. TIMELINE & DEPENDENCIES** 

|**Fase**|**Cakupan**|**Estimasi Durasi**|
|---|---|---|
|Pengerjaan<br>Sistem|Aplikasi web utama (Dashboard, Master Data, Transaksi,<br>Keuangan/Rekap, Penomoran)|±1 bulan|



Timeline mengikuti estimasi pada tabel di atas, dan dapat disesuaikan apabila terdapat keterlambatan penyediaan data, keputusan, approval, feedback, aset, atau akses yang menjadi tanggung jawab Client (lihat Bab 27). 

### **27. CLIENT RESPONSIBILITIES** 

Kelancaran project ini turut bergantung pada keterlibatan Client, khususnya dalam penyediaan data dan keputusan yang tidak dapat diasumsikan sepihak oleh Developer. Client bertanggung jawab menyediakan: 

- Data bisnis yang diperlukan untuk pengembangan sistem. 

- Contoh dokumen transaksi asli (penawaran, faktur, kwitansi, dan lainnya) sebagai referensi data dan istilah yang digunakan pada sistem. 

- Informasi bank/rekening pembayaran yang diperlukan untuk dokumen transaksi. 

- Logo dan aset visual lainnya jika diperlukan. 

- Keputusan atas requirement/field/aturan bisnis yang belum jelas atau belum tercantum secara eksplisit pada Agreement ini. 

- Feedback dan review secara tepat waktu. 

- Akses/informasi infrastruktur yang diperlukan, mengingat akun infrastruktur berada di bawah kendali CV. ANDARA (lihat Bab 32). 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 22 dari 27 

### **28. DEVELOPER RESPONSIBILITIES** 

Sebagai pasangan dari Bab 27, bagian ini menjelaskan kewajiban yang menjadi tanggung jawab Developer selama pelaksanaan project. Developer bertanggung jawab untuk: 

- Mengembangkan sistem sesuai ruang lingkup yang disepakati pada Agreement ini. 

- Melakukan testing atas alur bisnis utama sesuai scope. 

- Melakukan deployment ke environment production. 

- Melakukan setup infrastruktur sesuai baseline pada Bab 32 dan Bab 33. 

- Melakukan handover sesuai deliverable pada Bab 25 dan Bab 32. 

- Memperbaiki bug yang termasuk dalam scope/warranty sesuai cakupan yang disepakati (lihat Bab 30). 

_Ketentuan dukungan pasca-launch mengikuti cakupan warranty/support yang disepakati oleh kedua pihak, sebagaimana dijelaskan pada Bab 30._ 

### **29. REVIEW & ACCEPTANCE** 

Client dapat melakukan review terhadap hasil pekerjaan berdasarkan ruang lingkup yang disepakati, khususnya pada saat sistem dinyatakan Live dan pada saat Final Completion. 

|**Kondisi**|**Penanganan**|
|---|---|
|Bug/ketidaksesuaian terhadap scope<br>yang disepakati|Diperbaiki Developer sesuai scope, tanpa biaya tambahan|
|Request baru/perubahan requirement<br>di luar scope|Diproses melalui Change Request (Bab 31)|
|Perubahan preferensi visual setelah<br>desain disetujui Client|Mengikuti batas revisi yang disepakati; perubahan signifikan di luar<br>batas tersebut diperlakukan sebagai Change Request|



### **30. BUG, WARRANTY & POST-LAUNCH SUPPORT** 

Bab ini membedakan antara perbaikan yang menjadi kewajiban Developer tanpa biaya tambahan, dan permintaan yang berada di luar cakupan tersebut. Definisi yang digunakan pada Agreement ini: 

- Bug — ketidaksesuaian antara hasil sistem dan ruang lingkup yang telah disepakati. 

- Improvement — penyempurnaan terhadap fitur yang sudah berjalan sesuai scope, namun bukan perbaikan atas ketidaksesuaian. 

- New feature — kemampuan baru yang belum tercakup dalam ruang lingkup Agreement ini. 

- Change request — permintaan perubahan/penambahan di luar scope yang disepakati (lihat Bab 31). 

Perbaikan bug yang merupakan ketidaksesuaian terhadap scope yang disepakati menjadi tanggung jawab Developer sebagai bagian dari pekerjaan yang sudah tercakup dalam nilai development, tanpa biaya tambahan. 

**<mark>Yang perlu disepakat</mark> i** **<mark>bersama sebelum sistem dinyatakan Live:</mark>** 

● Durasi dan cakupan warranty/post-launch support setelah sistem Live dan setelah Final Completion (lihat Bab 36). 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 23 dari 27 

### **31. CHANGE REQUEST** 

Perubahan scope bukan otomatis berarti tambahan biaya. Namun, apabila suatu perubahan: 

- menambah modul atau fitur; 

- mengubah business logic; 

- menambah integration atau infrastructure; 

- mengubah requirement yang sudah disetujui; atau 

- menambah workload secara material, 

maka perubahan tersebut diproses melalui persetujuan tertulis, mengikuti mekanisme berikut: 

**Request → Impact Review → Scope/Time/Cost Assessment → Client Approval → Implementation** 

Pekerjaan tambahan di luar scope yang disepakati diproses melalui alur di atas, dan tidak dianggap disetujui hanya karena dibicarakan secara informal (misalnya melalui chat atau percakapan lisan) tanpa persetujuan tertulis. 

### **32. INFRASTRUCTURE & DATA OWNERSHIP** 

Akun infrastruktur (domain, Cloudflare, VPS, penyimpanan file) berada di bawah kendali CV. ANDARA, dengan Developer memperoleh akses teknis yang diperlukan untuk development dan deployment. Data bisnis production — database transaksi, data customer, serta file/attachment transaksi — merupakan data operasional milik CV. ANDARA. 

|**Aset / Akun**|**Owner**|**Akses Developer**|
|---|---|---|
|Domain .com|CV. ANDARA|Sesuai kebutuhan|
|Cloudflare|CV. ANDARA|Akses teknis sesuai kebutuhan|
|VPS|CV. ANDARA|SSH/admin sesuai kebutuhan|
|Penyimpanan file (object storage)|CV. ANDARA|Access key terbatas|
|Production Database|CV. ANDARA|Akses teknis terbatas|
|Source Code Repository|Akan disepakati bersama (lihat Bab<br>36)|Development access|



#### **Fondasi Teknologi** 

Sistem dibangun di atas teknologi web modern yang umum digunakan untuk aplikasi bisnis skala kecilmenengah: frontend React + TypeScript, backend Java Spring Boot, dan database PostgreSQL, dengan hosting pada VPS yang dilindungi Cloudflare (DNS/SSL). Production menggunakan HTTPS, dan akses infrastruktur dikelola secara terbatas sesuai kebutuhan pengerjaan. 

_Detail arsitektur teknis lengkap didokumentasikan secara terpisah pada Technical & Infrastructure Baseline (dokumen referensi internal Developer)._ 

#### **Handover** 

Pada Final Completion, Developer menyerahkan akses aplikasi production, konfigurasi infrastruktur, serta dokumentasi teknis yang relevan kepada Client, sesuai kendali kepemilikan pada tabel di atas. 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 24 dari 27 

### **33. BACKUP & DATA PROTECTION** 

Database dibackup otomatis minimal 1 (satu) kali sehari, dikompresi, dan disimpan pada penyimpanan cadangan terpisah dari VPS tempat database berjalan. 

|**Jenis**|**Retention Baseline**|
|---|---|
|Daily|7 backup terakhir|
|Weekly|4 backup terakhir|
|Monthly|3 backup terakhir|



Sebelum peluncuran production, dilakukan minimal satu kali restore test terhadap backup untuk memastikan data customer, penawaran, faktur, pembayaran, deposit, dan alokasi pembayaran dapat dipulihkan dengan benar. 

_Backup bukan jaminan tidak ada data loss dalam seluruh kondisi. Retensi di atas berlaku sebagai baseline dan dapat disesuaikan atas permintaan tertulis Client._ 

### **34. COMMERCIAL TERMS** 

Bab ini menuangkan nilai project dan ketentuan pembayaran yang disepakati antara Client dan Developer. 

#### **34.1 Nilai Project** 

|**Keterangan**|**Nilai**|
|---|---|
|TOTAL NILAI PROJECT|Rp9.400.000|



Nilai Rp9.400.000 sudah mencakup: 

- Development sistem sesuai ruang lingkup yang disepakati pada Agreement ini (Bab 5 sampai Bab 21); 

- Server untuk menjalankan aplikasi pada environment production; 

- Domain yang digunakan untuk mengakses aplikasi. 

###### **Tidak termasuk dalam nilai project** 

Fitur Desain Cetakan / Custom Print Design tidak termasuk dalam ruang lingkup maupun nilai project ini (lihat Bab 17 dan Bab 23), serta seluruh item lain yang tercantum pada Bab 23 – Out of Scope. 

#### **34.2 Skema Pembayaran** 

Pembayaran dilakukan dalam 7 (tujuh) termin. Termin 1 dibayarkan pada saat kesepakatan kerja sama disetujui dan pengerjaan dimulai. Sisa nilai project sebesar Rp6.400.000 dibayarkan dalam 6 (enam) bulan berikutnya, masing-masing satu termin per bulan. 

|**Termin**|**Waktu Pembayaran**|**Nilai**|
|---|---|---|
|Termin 1|Saat kesepakatan disetujui dan pengerjaan dimulai|Rp3.000.000|
|Termin 2|Bulan ke-1 setelah Termin 1|Rp1.066.666|
|Termin 3|Bulan ke-2 setelah Termin 1|Rp1.066.666|



Project Scope & Development Agreement — CV. ANDARA   |   Halaman 25 dari 27 

|**Termin**|**Waktu Pembayaran**|**Nilai**|
|---|---|---|
|Termin 4|Bulan ke-3 setelah Termin 1|Rp1.066.666|
|Termin 5|Bulan ke-4 setelah Termin 1|Rp1.066.666|
|Termin 6|Bulan ke-5 setelah Termin 1|Rp1.066.666|
|Termin 7|Bulan ke-6 setelah Termin 1|Rp1.066.670|
|TOTAL||Rp9.400.000|



_Nilai Termin 7 sebesar Rp1.066.670 sedikit berbeda dari termin bulanan lainnya sebagai pembulatan agar total seluruh termin tepat berjumlah Rp9.400.000._ 

#### **34.3 Server dan Domain** 

Biaya server dan domain untuk periode awal penggunaan sudah termasuk dalam nilai project Rp9.400.000 dan tidak ditagihkan secara terpisah kepada Client. 

Akun server dan domain tetap berada di bawah kendali serta atas nama CV. ANDARA sebagaimana dijelaskan pada Bab 32 – Infrastructure & Data Ownership. 

###### **Perlu dikonfirmasi sebelum penandatanganan** 

Lama periode server dan domain yang sudah termasuk dalam nilai project (misalnya tahun pertama) belum ditetapkan secara tertulis, demikian pula pihak yang menanggung biaya perpanjangan setelah periode tersebut berakhir. Kedua hal ini perlu disepakati dan dicantumkan sebelum dokumen ditandatangani. 

### **35. PROJECT COMPLETION** 

Pekerjaan pengembangan dianggap selesai apabila kondisi “Live” pada Bab 21 terpenuhi. 

Project secara keseluruhan dianggap selesai (Final Completion) apabila: 

- seluruh scope pengerjaan yang termasuk dalam project telah selesai; 

- seluruh deliverable pada Bab 25 telah diserahkan; 

- proses acceptance sesuai Bab 29 telah dilakukan; 

- kewajiban pembayaran sesuai milestone pada Bab 34 telah dipenuhi. 

### **36. FINAL TERMS & SIGNATURE** 

Dokumen yang menjadi acuan project ini adalah Agreement ini beserta persetujuan perubahan/adendum tertulis yang disepakati kemudian. Agreement ini merupakan dokumen client-facing utama yang mengonsolidasikan ruang lingkup, nilai project, dan ketentuan pembayaran yang telah disepakati. Apabila terdapat dokumen penawaran atau rincian biaya versi sebelumnya yang bertentangan dengan Agreement ini, yang berlaku adalah ketentuan pada Agreement ini. Apabila terjadi perbedaan pemahaman antara Client dan Developer, dokumen ini menjadi acuan penyelesaian. 

#### **Hal yang Perlu Disepakati** 

Untuk menjaga dokumen ini tetap jelas dan siap ditandatangani, hal-hal yang belum terkunci dikelompokkan berdasarkan tingkat urgensinya sebagai berikut. 

##### **A. Wajib Disepakati Sebelum Signature** 

Project Scope & Development Agreement — CV. ANDARA   |   Halaman 26 dari 27 

|**Item**|**Keterangan**|
|---|---|
|Periode server dan domain yang<br>termasuk dalam nilai project|Ditetapkan lama periodenya (misalnya tahun pertama) dan pihak<br>yang menanggung biaya perpanjangan setelahnya (lihat Bab 34.3)|
|Kepemilikan (ownership) source code|Disepakati tertulis antara Client dan Developer sebagai bagian dari<br>penandatanganan Agreement ini|
|Durasi dan cakupan warranty / post-<br>launch support|Disepakati tertulis sebelum sistem dinyatakan Live|



##### **B. Dapat Dikunci Saat Development** 

|**Item**|**Keterangan**|
|---|---|
|Detail teknis aktivasi dan penamaan<br>server/domain|Disepakati sebelum setup infrastruktur production (biayanya sudah<br>termasuk dalam nilai project — lihat Bab 34.3)|
|Kebutuhan staging environment terpisah|Dikonfirmasi Client sebelum deployment production|



##### **C. Baseline yang Sudah Berlaku** 

|**Item**|**Keterangan**|
|---|---|
|Retensi backup|7 harian / 4 mingguan / 3 bulanan berlaku sebagai baseline (lihat<br>Bab 33), dan dapat disesuaikan atas permintaan tertulis Client|



Dengan menandatangani Agreement ini, Client dan Developer menyatakan telah membaca, memahami, dan menyetujui seluruh ruang lingkup, ketentuan komersial, serta mekanisme kerja sama yang dijabarkan dalam dokumen ini sebagai dasar pelaksanaan project. 

|**Disetujui oleh Client**|**Disusun oleh Developer / Tim Pengembang**|
|---|---|
|_Nama & Tanda Tangan_|_Nama & Tanda Tangan_|
|M Dafa Fakhrika|M Naufal Fauzan|
|Tanggal: ________________________|Tanggal: ________________________|



Project Scope & Development Agreement — CV. ANDARA   |   Halaman 27 dari 27 

