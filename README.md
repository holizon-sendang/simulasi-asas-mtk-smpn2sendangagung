# Simulasi ASAS — Matematika SMP Kelas 7

Simulasi Asesmen Sumatif Akhir Semester (ASAS) Matematika Kelas 7, SMP Negeri 2 Sendang Agung.
Situs ini khusus untuk simulasi ASAS — bukan bagian dari MPI.

**Coba langsung:** https://holizon-sendang.github.io/simulasi-asas-mtk-smpn2sendangagung/

## Isi simulasi

- Bank soal Kelas 7: 80 soal, indikator 1–40 masing-masing 2 varian (A/B)
- Tiap sesi: 40 soal yang diacak — 1 varian untuk tiap indikator, urutan diacak di dalam tiap jenis soal, urutan pilihan Pilihan Ganda diacak
- Tipe soal per sesi: 20 Pilihan Ganda, 5 Benar-Salah, 5 Menjodohkan, 5 Isian Singkat, 5 Uraian
- Materi per sesi: Bilangan Bulat 12, Bilangan Rasional 12, Aritmetika Sosial 6, Rasio 10
- Timer 120 menit, jawaban otomatis dikumpulkan saat waktu habis (lanjut setelah refresh)
- Penilaian: Nilai = jawaban benar otomatis / 30 × 100 (hanya Pilihan Ganda, Benar-Salah, dan Menjodohkan yang dinilai otomatis). Isian Singkat dan Uraian dicek mandiri dengan kunci dan pembahasan — tidak masuk Nilai. KKM 70.
- Riwayat skor tersimpan di perangkat siswa
- Pengiriman nilai ke Google Sheets (satu baris per siswa) — URL Web App sudah tertanam di situs sejak 2026-11-20, jadi tidak perlu ditempel di tiap perangkat; lihat `PANDUAN-GOOGLE-SHEETS.md`

## File

- `index.html`, `style.css`, `script.js` — halaman simulasi
- `assets/data/questions-7.json` — bank soal Kelas 7 (80 soal)
- `assets/img/*.svg` — gambar soal (8 file)
- `assets/css/main.css`, `assets/js/main.js` — gaya dan skrip dasar (palet Biru Samudra)
- `kode-apps-script.gs` — kode Apps Script untuk pengiriman nilai ke Google Sheets
- `PANDUAN-GOOGLE-SHEETS.md` — panduan guru: membuat Sheet, deploy Web App, menempel URL
