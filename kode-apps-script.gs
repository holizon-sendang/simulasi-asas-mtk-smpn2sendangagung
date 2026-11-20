/**
 * Simulasi ASAS Matematika Kelas 7 — Kode Google Apps Script
 * ============================================================
 * CARA PAKAI (ringkas, panduan lengkap di PANDUAN-GOOGLE-SHEETS.md):
 *  1. Buat Google Sheet baru, tulis header di baris 1 (lihat HEADERS di bawah).
 *  2. Di Sheet itu: Extensions > Apps Script, hapus kode lama, tempel file ini.
 *  3. Deploy > New deployment > Web app, Execute as: Me,
 *     Who has access: Anyone. Salin URL .../exec yang muncul.
 *  4. Tempel URL itu di halaman Simulasi ASAS (bagian "Pengiriman Nilai
 *     ke Google Sheets"), tekan Simpan URL.
 *  5. Uji dengan satu simulasi sampai selesai, periksa baris masuk di Sheet.
 *
 * CATATAN:
 *  - Jangan bagikan URL Web App ke publik secara sembarangan: siapa pun
 *    yang punya URL bisa mengirim baris ke Sheet ini.
 *  - Nilai hanya terkirim bila ada internet saat hasil akhir tampil.
 *    Bila gagal, halaman simulasi menyimpan datanya dan menyediakan
 *    tombol "Kirim Ulang ke Google Sheets".
 */

// Header kolom — HARUS sama persis dengan baris 1 di Sheet.
// Nilai = round(Total Benar Otomatis / 30 * 100). Isian dan Uraian
// dicek mandiri dan tidak masuk Nilai; kolom Isian/Uraian Dijawab
// hanya mencatat berapa soal yang diisi siswa.
var HEADERS = [
  'Waktu', 'Nama', 'Kelas',
  'PG Benar', 'Benar-Salah Benar', 'Menjodohkan Benar', 'Total Benar Otomatis',
  'Nilai', 'Durasi (menit)', 'Status', 'Isian Dijawab', 'Uraian Dijawab'
];

// doPost: dipanggil halaman simulasi setiap kali hasil akhir tampil.
// Body dikirim sebagai text/plain (JSON) agar tidak kena preflight CORS.
function doPost(e) {
  try {
    // 1. Baca body JSON yang dikirim halaman simulasi.
    var data = JSON.parse(e.postData.contents);

    // 2. Ambil sheet pertama (aktif) di spreadsheet ini.
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 3. Kalau baris 1 masih kosong, tulis header dulu.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    // 4. Tambahkan satu baris: satu siswa = satu baris.
    sheet.appendRow([
      data['Waktu'] || '',
      data['Nama'] || '',
      data['Kelas'] || '',
      data['PG Benar'] ?? '',
      data['Benar-Salah Benar'] ?? '',
      data['Menjodohkan Benar'] ?? '',
      data['Total Benar Otomatis'] ?? '',
      data['Nilai'] ?? '',
      data['Durasi (menit)'] ?? '',
      data['Status'] || '',
      data['Isian Dijawab'] ?? '',
      data['Uraian Dijawab'] ?? ''
    ]);

    // 5. Balas JSON sukses ke halaman simulasi.
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // Kalau ada kesalahan, balas JSON gagal supaya halaman tahu.
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet: untuk uji cepat — buka URL Web App di browser.
// Kalau muncul {"ok":true,"message":"..."}, deployment sudah benar.
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: 'Simulasi ASAS Kelas 7 — Web App aktif. Kirim data dengan POST JSON.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
