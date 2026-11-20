# Panduan Google Sheets — Simulasi ASAS Matematika Kelas 7

Panduan ini untuk guru. Tujuannya: **semua nilai siswa yang menyelesaikan Simulasi ASAS Kelas 7 masuk otomatis ke satu Google Sheet**, satu siswa satu baris. Tidak perlu server, tidak perlu bayar.

Kalau langkah ini belum dilakukan, simulasi tetap bisa dipakai — nilai hanya tersimpan di perangkat siswa masing-masing (riwayat skor di halaman).

> **Catatan 2026-11-20:** URL Web App sudah tertanam langsung di `script.js` situs ini, jadi nilai otomatis terkirim dari semua perangkat siswa tanpa perlu menempel URL. Langkah 4 di bawah hanya diperlukan bila URL Web App diganti (misalnya Sheet baru).

---

## Yang dibutuhkan

- Akun Google (akun yang biasa dipakai untuk Google Drive/Sheets).
- File `kode-apps-script.gs` di folder repo ini (root, sejajar dengan `index.html`).
- Waktu sekitar 10 menit.

---

## Langkah 1 — Buat Google Sheet baru

1. Buka [sheets.google.com](https://sheets.google.com) dan buat spreadsheet baru (Spreadsheet kosong).
2. Beri nama, misalnya **Nilai Simulasi ASAS Matematika Kelas 7**.
3. Di baris 1, tulis header berikut, satu kolom satu judul, urut dari kolom A sampai L:

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Waktu | Nama | Kelas | PG Benar | Benar-Salah Benar | Menjodohkan Benar | Total Benar Otomatis | Nilai | Durasi (menit) | Status | Isian Dijawab | Uraian Dijawab |

Tips: salin baris di bawah ini, lalu tempel di sel A1 (Google Sheets akan membaginya ke kolom-kolom):

```
Waktu	Nama	Kelas	PG Benar	Benar-Salah Benar	Menjodohkan Benar	Total Benar Otomatis	Nilai	Durasi (menit)	Status	Isian Dijawab	Uraian Dijawab
```

## Langkah 2 — Tempel kode Apps Script

1. Di Sheet yang baru dibuat, klik menu **Extensions → Apps Script**. Tab baru terbuka.
2. Hapus semua kode contoh yang ada di editor (biasanya `function myFunction() {...}`).
3. Buka file `kode-apps-script.gs` (di folder simulasi ini), salin **seluruh isinya**, tempel ke editor Apps Script.
4. Klik ikon **Save** (disket), beri nama proyek misalnya `Simulasi ASAS Kelas 7` bila diminta.

## Langkah 3 — Deploy sebagai Web App

1. Di Apps Script, klik **Deploy → New deployment**.
2. Klik ikon roda gigi di samping "Select type", pilih **Web app**.
3. Isi seperti ini:
   - **Description:** `Simulasi ASAS Kelas 7` (bebas)
   - **Execute as:** **Me** (akun Anda)
   - **Who has access:** **Anyone** (penting — supaya perangkat siswa bisa mengirim tanpa login Google)
4. Klik **Deploy**.
5. Bila Google meminta izin, klik **Authorize access**, pilih akun Anda, lalu **Advanced → Go to … (unsafe)** → **Allow**. Ini normal untuk script buatan sendiri.
6. Setelah selesai, muncul alamat URL yang diakhiri **`/exec`**. Contoh:
   `https://script.google.com/macros/s/AKfyc.../exec`
7. Klik **Copy** / salin URL itu. Simpan baik-baik.

> Catatan: kalau nanti kode diubah, ulangi Deploy → pilih deployment yang sama → **New version** → Deploy, supaya URL tetap sama.

## Langkah 4 — Tempel URL di halaman Simulasi ASAS (hanya bila URL diganti)

**Sejak 2026-11-20, langkah ini TIDAK lagi wajib untuk tiap perangkat** — URL Web App dari Langkah 3 sudah tertanam di situs, jadi nilai siswa otomatis terkirim dari semua perangkat tanpa ditempel manual.

Langkah ini hanya diperlukan bila URL Web App diganti (misalnya Sheet baru):

1. Buka halaman **Simulasi ASAS — Matematika Kelas 7** di repo ini.
2. Di layar mulai, cari bagian **"Pengiriman Nilai ke Google Sheets (untuk Guru)"**.
3. Tempel URL `/exec` yang baru ke kolomnya, tekan **Simpan URL**.
4. Status berubah menjadi "Tersimpan (URL guru). Nilai akan otomatis terkirim…". URL pengganti ini tersimpan di perangkat (browser) tempat menempel dan mengalahkan URL tertanam di perangkat itu saja. Untuk kembali ke URL tertanam, kosongkan kolomnya lalu tekan **Simpan URL**.

> Kalau URL diganti untuk semua siswa (bukan hanya satu perangkat), minta URL baru itu ditanam ke `script.js` situs ini — sama seperti URL pertama ditanam pada 2026-11-20.

## Langkah 5 — Uji dengan satu simulasi

1. Kerjakan satu simulasi sampai selesai (isi nama, jawab beberapa soal, kumpulkan, lihat hasil akhir).
2. Di halaman hasil, status pengiriman harus tertulis **"Terkirim ke Google Sheets ✓"**.
3. Buka Google Sheet — harus ada satu baris baru berisi nama, kelas, jumlah benar per tipe otomatis, Total Benar Otomatis, Nilai /100, durasi, status Tuntas/Belum Tuntas (KKM 70), dan jumlah Isian/Uraian yang dijawab.
4. Kalau status tertulis **"Gagal terkirim"**, periksa koneksi internet lalu tekan **"Kirim Ulang ke Google Sheets"**. Data yang gagal tersimpan di perangkat dan bisa dikirim ulang.

## Langkah 6 — Memakai hasilnya

- Setiap siswa yang selesai = satu baris baru di Sheet, lengkap dengan waktu pengerjaan.
- Di Sheet, guru bisa memakai **Data → Sort / Filter** untuk mengurutkan per kelas atau per nilai, dan **File → Download** bila ingin diolah di Excel.
- Kolom **Nilai** berisi skor /100, dihitung dari jawaban benar otomatis: Nilai = Total Benar Otomatis / 30 × 100; **Status** berisi `Tuntas` bila Nilai ≥ 70, `Belum Tuntas` bila di bawah itu. Kolom **Isian Dijawab** dan **Uraian Dijawab** hanya mencatat berapa soal yang diisi — isian dan uraian dicek mandiri dan tidak masuk Nilai.

---

## Hal-hal penting

- **Jangan bagikan URL Web App ke publik secara sembarangan.** Siapa pun yang punya URL itu bisa mengirim baris ke Sheet Anda. Cukup dibagikan ke siswa lewat halaman simulasi / perangkat kelas.
- **Nilai hanya terkirim bila ada internet** saat hasil akhir tampil. Bila offline saat mengumpulkan, halaman menyimpan datanya dan menyediakan tombol Kirim Ulang.
- **Isian Singkat dan Uraian dicek mandiri** di halaman hasil (kunci + pembahasan ditampilkan) dan tidak masuk Nilai. Jawaban isian/uraian tidak dikirim ke Sheet, hanya jumlah soal yang dijawab.
- **Riwayat di perangkat siswa tetap ada** walaupun Sheet sudah diatur: riwayat skor di halaman memakai penyimpanan perangkat, sedangkan Sheet adalah rekap pusat untuk guru.
- Bila URL Web App diganti (misalnya Sheet baru), ulangi Langkah 4 dengan URL baru.
