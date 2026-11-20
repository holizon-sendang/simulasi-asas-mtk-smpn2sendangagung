/* Simulasi ASAS Matematika Kelas 7 — script.js
   Vanilla JS, tanpa framework. Bank soal (PG, BS, MATCH_OPTS, MATCH,
   ISIAN, URAIAN) disalin VERBATIM dari ../latihan-asas/script.js
   (soal ASAS MGMP Lampung Tengah TP 2025/2026, sudah terverifikasi)
   dengan script ekstraksi — bukan diketik ulang — supaya soal, kunci,
   dan pembahasan tidak berubah.
   Alur: layar mulai -> ujian 120 menit (timer) -> kumpul -> nilai
   otomatis 35 soal (maks 70) -> penilaian mandiri uraian 0-6/soal
   (maks 30) -> hasil akhir /100 -> kirim ke Google Sheets (opsional).
   localStorage (khusus simulasi, TIDAK campur dengan mpi-asas-*):
   mpi-simulasi-asas-k7-draft, mpi-simulasi-asas-k7-history,
   mpi-simulasi-asas-k7-sheet-url, mpi-simulasi-asas-k7-pending. */
(function () {
  'use strict';

  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var PG = [
    { q: 'Perhatikan urutan bilangan pada garis bilangan berikut: -8, -5, -2, ..., 4, 7. Bilangan yang tepat untuk mengisi titik-titik tersebut adalah...',
      options: ['-1', '0', '1', '2'], answer: 2,
      why: 'Selisih antar bilangan +3, jadi -2 + 3 = 1.' },
    { q: 'Diberikan kelompok bilangan bulat acak: -12, 8, -5, 0, 15, -3. Urutan bilangan dari yang terbesar ke yang terkecil adalah...',
      options: ['15, 8, 0, -3, -5, -12', '15, 8, 0, -12, -5, -3', '-12, -5, -3, 0, 8, 15', '-3, -5, -12, 0, 8, 15'], answer: 0,
      why: 'Urutkan dari terbesar: 15, 8, 0, -3, -5, -12.' },
    { q: 'Sebuah anak panah pada garis bilangan dimulai dari titik 0 bergerak ke kiri sejauh 5 satuan, kemudian dilanjutkan bergerak ke kanan sejauh 8 satuan. Operasi hitung yang sesuai adalah...',
      options: ['-5 - 8 = -13', '-5 + 8 = 3', '5 + (-8) = -3', '5 - 8 = -3'], answer: 1,
      why: 'Ke kiri 5 dari 0 adalah -5, lalu ke kanan 8: -5 + 8 = 3.' },
    { q: 'Hasil dari operasi hitung campuran 24 + (-36) ÷ 6 - (-10) adalah...',
      options: ['28', '18', '-8', '-18'], answer: 0,
      why: '(-36) ÷ 6 = -6, lalu 24 - 6 - (-10) = 24 - 6 + 10 = 28.' },
    { q: 'Di antara kelompok bilangan berikut, manakah yang bukan merupakan bilangan rasional?',
      options: ['75%', '0,333...', '√2 = 1,41421356...', '-5/8'], answer: 2,
      why: '√2 adalah bilangan irasional (desimalnya tidak berulang dan tidak berakhir); yang lain bilangan rasional.' },
    { q: 'Sebuah bilangan pecahan yang nilainya terletak di antara 1/3 dan 1/2 adalah...',
      options: ['1/4', '5/12', '2/3', '7/12'], answer: 1,
      why: '1/3 ≈ 0,333 dan 1/2 = 0,5; 5/12 ≈ 0,417 ada di antaranya.' },
    { q: 'Bentuk persen (%) dari pecahan biasa 3/8 adalah...',
      options: ['37,5%', '35,0%', '32,5%', '30,0%'], answer: 0,
      why: '3/8 = 0,375 = 37,5%.' },
    { q: 'Perhatikan kesetaraan berikut: (i) 3/5 = 0,6 (ii) 45% = 9/20 (iii) 0,25 = 1/5 (iv) 4/25 = 16%. Hubungan yang tidak senilai ditunjukkan oleh...',
      options: ['(i)', '(ii)', '(iii)', '(iv)'], answer: 2,
      why: '(iii) salah: 0,25 = 1/4, bukan 1/5. Yang lain senilai.' },
    { q: 'Urutan bilangan rasional 0,65; 5/8; 60%; 2/3 dari yang terkecil adalah...',
      options: ['60%; 5/8; 0,65; 2/3', '5/8; 60%; 0,65; 2/3', '60%; 0,65; 5/8; 2/3', '2/3; 0,65; 5/8; 60%'], answer: 0,
      why: '60% = 0,6; 5/8 = 0,625; 0,65; 2/3 ≈ 0,667.' },
    { q: 'Hasil dari operasi hitung campuran (3/4) × 0,8 ÷ 20% adalah...',
      options: ['1,5', '2,0', '3,0', '4,5'], answer: 2,
      why: '(3/4) = 0,75; 0,75 × 0,8 = 0,6; 20% = 0,2; 0,6 ÷ 0,2 = 3.' },
    { q: 'Nilai persentase 15% dari uang sebesar Rp240.000,00 adalah...',
      options: ['Rp32.000', 'Rp36.000', 'Rp40.000', 'Rp48.000'], answer: 1,
      why: '15% × 240.000 = 36.000.' },
    { q: 'Ibu membeli 2 ½ kg tepung terigu. Kemudian Ibu membeli lagi tepung terigu sebanyak 1,75 kg. Jumlah seluruh tepung terigu yang dibeli Ibu adalah...',
      options: ['3,75 kg', '4,15 kg', '4,25 kg', '4,50 kg'], answer: 2,
      why: '2 ½ kg = 2,5 kg; 2,5 + 1,75 = 4,25 kg.' },
    { q: 'Pak Budi membeli motor bekas seharga Rp5.000.000,00. Setelah diperbaiki dengan biaya Rp500.000,00, motor dijual kembali seharga Rp5.200.000,00. Pernyataan yang benar adalah...',
      options: ['Pak Budi untung Rp300.000,00', 'Pak Budi rugi Rp300.000,00', 'Pak Budi untung Rp200.000,00', 'Pak Budi rugi Rp200.000,00'], answer: 1,
      why: 'Modal = 5.000.000 + 500.000 = 5.500.000; dijual 5.200.000, jadi rugi 300.000.' },
    { q: 'Seorang pedagang membeli sekeranjang buah seharga Rp200.000,00. Jika pedagang menginginkan keuntungan sebesar 15%, maka harga penjualan seluruh buah tersebut adalah...',
      options: ['Rp215.000', 'Rp225.000', 'Rp230.000', 'Rp240.000'], answer: 2,
      why: 'Harga jual = 200.000 × (1 + 15%) = 200.000 × 1,15 = 230.000.' },
    { q: 'Jarak Kota A dan Kota B pada peta adalah 4 cm, sedangkan jarak sebenarnya adalah 80 km. Skala pada peta tersebut adalah...',
      options: ['1 : 200.000', '1 : 500.000', '1 : 2.000.000', '1 : 5.000.000'], answer: 2,
      why: '80 km = 8.000.000 cm; 4 : 8.000.000 = 1 : 2.000.000.' },
    { q: 'Skala peta adalah 1 : 500.000. Jika jarak dua tempat pada peta 6 cm, maka jarak sebenarnya adalah...',
      options: ['3 km', '30 km', '300 km', '3.000 km'], answer: 1,
      why: '6 × 500.000 = 3.000.000 cm = 30 km.' },
    { q: 'Jarak sebenarnya dua kecamatan adalah 15 km. Digambar pada peta skala 1 : 300.000. Jarak pada peta adalah...',
      options: ['3 cm', '5 cm', '6 cm', '10 cm'], answer: 1,
      why: '15 km = 1.500.000 cm; 1.500.000 ÷ 300.000 = 5 cm.' },
    { q: 'Rasio kelereng Andi dan Budi adalah 3 : 5. Jika jumlah kelereng mereka berdua 40 butir, banyak kelereng Budi adalah...',
      options: ['15 butir', '20 butir', '25 butir', '30 butir'], answer: 2,
      why: 'Budi = 5/(3 + 5) × 40 = 5/8 × 40 = 25 butir.' },
    { q: 'Di kelas terdapat 18 siswa laki-laki dan 12 siswa perempuan. Rasio paling sederhana antara siswa perempuan dan seluruh siswa adalah...',
      options: ['2 : 3', '2 : 5', '3 : 2', '3 : 5'], answer: 1,
      why: 'Perempuan : seluruh siswa = 12 : 30 = 2 : 5.' },
    { q: 'Harga 3 kg beras adalah Rp36.000,00. Harga 7 kg beras sejenis adalah...',
      options: ['Rp72.000', 'Rp81.000', 'Rp84.000', 'Rp96.000'], answer: 2,
      why: '1 kg = 36.000 ÷ 3 = 12.000; 7 kg = 7 × 12.000 = 84.000.' }
  ];
  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var BS = [
    { q: 'Bilangan Bulat: a × (b + c) = (a × b) + (a × c) merupakan penerapan sifat distributif perkalian terhadap penjumlahan.',
      answer: true, why: 'Itulah bunyi sifat distributif perkalian terhadap penjumlahan.' },
    { q: 'Bilangan Bulat: Daftar seluruh faktor positif dari bilangan 18 adalah 1, 2, 3, 6, dan 18.',
      answer: false, why: 'Faktor positif 18 yang benar: 1, 2, 3, 6, 9, 18 — angka 9 tertinggal.' },
    { q: 'Bilangan Rasional: Nilai pecahan 3/7 lebih kecil daripada pecahan 4/9.',
      answer: true, why: '3/7 = 27/63 dan 4/9 = 28/63; 27/63 < 28/63.' },
    { q: 'Aritmetika Sosial: Tabungan bunga tunggal 6%/tahun. Setelah 1 tahun menjadi Rp2.120.000,00, maka modal awalnya Rp2.000.000,00.',
      answer: true, why: '2.000.000 + 6% × 2.000.000 = 2.000.000 + 120.000 = 2.120.000.' },
    { q: 'Rasio: Mobil butuh 4 liter bensin untuk 48 km. Jika diisi 7 liter bensin, jarak yang ditempuh adalah 80 km.',
      answer: false, why: '1 liter = 48 ÷ 4 = 12 km; 7 liter = 7 × 12 = 84 km, bukan 80 km.' }
  ];
  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var MATCH_OPTS = [
    { l: 'A', t: '8' }, { l: 'B', t: '32' }, { l: 'C', t: '4 ¼' },
    { l: 'D', t: '25%' }, { l: 'E', t: '480 gram' },
    { l: 'F', t: '-8' }, { l: 'G', t: '20%' }
  ];
  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var MATCH = [
    { q: 'Hasil dari -15 - (-23) adalah ...', answer: 'A',
      why: '-15 - (-23) = -15 + 23 = 8.' },
    { q: 'Hasil operasi hitung (-48) ÷ 6 × (-4) adalah ...', answer: 'B',
      why: '(-48) ÷ 6 = -8; -8 × (-4) = 32.' },
    { q: 'Hasil penjumlahan pecahan 1 ¾ + 2 ½ adalah ...', answer: 'C',
      why: '1 ¾ + 2 ½ = 7/4 + 5/2 = 7/4 + 10/4 = 17/4 = 4 ¼.' },
    { q: 'Beli barang Rp80.000,00, jual Rp100.000,00. Persentase untung = ...', answer: 'D',
      why: 'Untung = 100.000 - 80.000 = 20.000; 20.000 ÷ 80.000 = 25%.' },
    { q: '5 porsi kue butuh 200 g gula. Gula untuk 12 porsi kue = ...', answer: 'E',
      why: '1 porsi = 200 ÷ 5 = 40 g; 12 porsi = 12 × 40 = 480 gram.' }
  ];
  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var ISIAN = [
    { q: 'Suhu awal dalam freezer adalah -4°C. Saat listrik padam, suhu naik 3°C setiap 20 menit. Suhu freezer setelah listrik padam selama 1 jam (60 menit) adalah ... °C.',
      accepted: ['5'], why: '60 ÷ 20 = 3 kali kenaikan; 3 × 3°C = 9°C; -4 + 9 = 5°C.' },
    { q: 'Panitia membagikan bantuan 36 kg beras, 48 bungkus mie, dan 60 kaleng susu secara merata kepada keluarga penerima. Banyak keluarga terbanyak yang menerima bantuan adalah ... keluarga.',
      accepted: ['12'], why: 'FPB dari 36, 48, dan 60 adalah 12.' },
    { q: 'Hasil dari operasi hitung campuran pecahan dan desimal (3/5) + 1,2 ÷ 0,4 adalah ...',
      accepted: ['3,6', '3.6', '3 3/5', '3⅗', '3,60', '3.60'], why: '1,2 ÷ 0,4 = 3; 3/5 = 0,6; 0,6 + 3 = 3,6 (atau 3 ⅗).' },
    { q: 'Ayah menabung Rp4.000.000,00. Setelah 1 tahun, jumlah tabungannya menjadi Rp4.320.000,00. Persentase bunga tunggal per tahun dari bank tersebut adalah ... %.',
      accepted: ['8'], why: 'Bunga = 4.320.000 - 4.000.000 = 320.000; 320.000 ÷ 4.000.000 = 8%.' },
    { q: 'Pembangunan gedung selesai dalam 20 hari oleh 12 pekerja. Jika ingin selesai dalam waktu 15 hari, maka banyak pekerja yang dibutuhkan adalah ... orang.',
      accepted: ['16'], why: 'Total beban = 20 × 12 = 240 hari-pekerja; 240 ÷ 15 = 16 orang.' }
  ];
  /* ---------- Bank soal (verbatim dari latihan-asas) ---------- */
  var URAIAN = [
    { q: 'Sistem Skor Kompetisi (Bilangan Bulat): Aturan penskoran: Jawaban benar = +4, Salah = -2, Tidak dijawab = -1. Dari 50 soal, Ahmad menjawab benar 38 soal, tidak menjawab 5 soal, dan sisanya salah. a. Hitunglah total skor yang diperoleh Ahmad! b. Jika syarat minimum lulus adalah skor 130, apakah Ahmad dinyatakan lulus? Berikan alasannya!',
      why: 'Salah = 50 − (38 + 5) = 7 soal. Skor benar = 38 × 4 = 152; skor salah = 7 × (−2) = −14; skor kosong = 5 × (−1) = −5. Total = 152 − 14 − 5 = 133. LULUS, karena 133 ≥ 130.' },
    { q: 'Jadwal Latihan Bersama (KPK Bilangan Bulat): Ridho latihan renang setiap 4 hari sekali, Dani setiap 6 hari sekali, dan Hendra setiap 8 hari sekali. Jika pada hari Sabtu, 5 Oktober 2024 mereka berenang bersama untuk pertama kalinya, pada hari dan tanggal berapakah mereka akan berenang bersama untuk kedua kalinya?',
      why: 'Faktorisasi: 4 = 2², 6 = 2 × 3, 8 = 2³ → KPK = 2³ × 3 = 24 hari. Tanggal: 5 Oktober + 24 hari = 29 Oktober 2024. Hari: 24 ÷ 7 = 3 sisa 3 hari; 3 hari setelah Sabtu adalah Selasa. Jawaban: Selasa, 29 Oktober 2024.' },
    { q: 'Pembagian Tanah Warisan (Bilangan Rasional): Pak Hasan memiliki tanah seluas 1.200 m². Tanah dibagikan: Anak I mendapat 1/3 bagian, Anak II mendapat 25% bagian, Anak III mendapat 0,2 bagian, dan sisanya dibuat taman. a. Tentukan luas tanah yang diterima masing-masing anak! b. Tentukan luas tanah yang digunakan untuk taman!',
      why: 'Anak I = ⅓ × 1.200 = 400 m²; Anak II = 25% × 1.200 = 300 m²; Anak III = 0,2 × 1.200 = 240 m². Total anak = 400 + 300 + 240 = 940 m²; taman = 1.200 − 940 = 260 m².' },
    { q: 'Perhitungan Diskon Toko (Aritmetika Sosial): Nadia membeli baju seharga Rp150.000,00 (diskon 20%) dan sepatu seharga Rp250.000,00 (diskon 30%). Hitunglah total uang yang harus dibayarkan oleh Nadia!',
      why: 'Baju: diskon 20% × 150.000 = 30.000 → bayar Rp120.000,00. Sepatu: diskon 30% × 250.000 = 75.000 → bayar Rp175.000,00. Total bayar = 120.000 + 175.000 = Rp295.000,00.' },
    { q: 'Proyek Pembangunan (Perbandingan Berbalik Nilai): Pemborong memperkirakan proyek jembatan selesai 30 hari dengan 12 pekerja. Setelah bekerja 10 hari, proyek terhenti 4 hari karena hujan lebat. Agar jembatan selesai tepat waktu sesuai jadwal semula, berapa banyak tambahan pekerja yang dibutuhkan?',
      why: 'Total beban = 30 hari × 12 pekerja = 360 hari-pekerja. Selesai (10 hari) = 10 × 12 = 120 → sisa beban = 360 − 120 = 240 hari-pekerja. Sisa waktu = (30 − 10) − 4 hari libur = 16 hari → pekerja butuh = 240 ÷ 16 = 15 orang. Tambahan pekerja = 15 − 12 = 3 orang pekerja.' }
  ];
  /* Kunci PG (huruf): C A B A C B A C A C B C B C C B B C B C */

/* ---------- Util ---------- */
function $(id) { return document.getElementById(id); }
function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* abaikan */ } }
function read(key, fallback) { try { var v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; } }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtWaktu(ms) {
  var d = new Date(ms);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtTimer(sec) {
  sec = Math.max(0, Math.ceil(sec));
  var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return p(h) + ':' + p(m) + ':' + p(s);
}

var LETTERS = ['A', 'B', 'C', 'D'];
var MAX = { pg: 40, bs: 10, match: 10, isian: 10, uraian: 30 };
var DURATION_SEC = 7200; /* 120 menit */
var KKM = 70;
var KEY_DRAFT = 'mpi-simulasi-asas-k7-draft';
var KEY_HISTORY = 'mpi-simulasi-asas-k7-history';
var KEY_SHEET = 'mpi-simulasi-asas-k7-sheet-url';
var KEY_PENDING = 'mpi-simulasi-asas-k7-pending';

/* ---------- State ---------- */
function blankAnswers() { return { pg: {}, bs: {}, match: {}, isian: {}, uraianText: {} }; }
function blankDraft() {
  return { nama: '', kelas: '', startedAt: 0, status: 'baru', answers: blankAnswers(),
    uraianScore: {}, auto: null, total: null, submittedAt: 0, finishedAt: 0,
    durationMin: 0, sent: false, sentAt: 0 };
}
var draft = blankDraft();
try { var d0 = JSON.parse(read(KEY_DRAFT, 'null')); if (d0 && d0.answers) draft = d0; } catch (e) { /* abaikan */ }
if (!draft.answers) draft.answers = blankAnswers();
if (!draft.uraianScore) draft.uraianScore = {};
var timerId = null;
var submitting = false;

function saveDraft() { store(KEY_DRAFT, JSON.stringify(draft)); }
function loadHistory() { try { var h = JSON.parse(read(KEY_HISTORY, '[]')); return Array.isArray(h) ? h : []; } catch (e) { return []; } }
function saveHistoryList(h) { store(KEY_HISTORY, JSON.stringify(h.slice(0, 20))); }

/* ---------- Layar ---------- */
function showScreen(name) {
  ['layarMulai', 'layarUjian', 'layarUraian', 'layarHasil'].forEach(function (id) {
    var el = $(id); if (el) el.hidden = (id !== name);
  });
  window.scrollTo(0, 0);
}

/* ---------- Riwayat ---------- */
function renderHistory() {
  var h = loadHistory();
  [['historyListStart', 'historyEmptyStart'], ['historyListHasil', 'historyEmptyHasil']].forEach(function (pair) {
    var list = $(pair[0]), empty = $(pair[1]);
    if (!list) return;
    if (!h.length) { list.innerHTML = ''; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    list.innerHTML = h.map(function (e) {
      var lulus = e.total >= KKM;
      return '<li><span><strong>' + esc(e.nama) + '</strong> · ' + esc(e.kelas) +
        '<br><span class="muted small">' + esc(e.waktu) + ' · ' + e.durasi + ' menit · ' + esc(e.status) + '</span></span>' +
        '<strong class="' + (lulus ? 'ok-text' : 'no-text') + '">' + e.total + '/100</strong></li>';
    }).join('');
  });
}

/* ---------- Google Sheets: URL ---------- */
function renderSheetSetting() {
  var url = read(KEY_SHEET, '');
  var inp = $('sheetUrlInput'); if (inp && !inp.value) inp.value = url;
  var st = $('sheetStatus');
  if (st) st.textContent = url ? 'Tersimpan. Nilai akan otomatis terkirim ke Google Sheets saat hasil akhir tampil.' : 'Belum diatur — nilai hanya tersimpan di perangkat ini.';
}

/* ---------- Timer ---------- */
function remainingSec() {
  if (!draft.startedAt) return DURATION_SEC;
  return DURATION_SEC - (Date.now() - draft.startedAt) / 1000;
}
function tickTimer() {
  var rem = remainingSec();
  var txt = $('timerText'), fill = $('timerFill'), bar = $('timerBar');
  if (txt) txt.textContent = fmtTimer(rem);
  if (fill) fill.style.width = Math.max(0, Math.min(100, rem / DURATION_SEC * 100)) + '%';
  if (bar) {
    bar.classList.toggle('warn', rem <= 600 && rem > 300);
    bar.classList.toggle('danger', rem <= 300);
  }
  if (rem <= 0) { stopTimer(); kumpulkan(true); }
}
function startTimer() { stopTimer(); tickTimer(); timerId = setInterval(tickTimer, 1000); }
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

/* ---------- Render soal ujian ---------- */
function renderPG() {
  var box = $('pgBox'); if (!box) return; box.innerHTML = '';
  PG.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal'; div.id = 'pg-' + i;
    var html = '<p class="soal-q">' + (i + 1) + '. ' + esc(item.q) + '</p><div class="pg-opts" role="group" aria-label="Pilihan jawaban soal ' + (i + 1) + '">';
    item.options.forEach(function (opt, idx) {
      html += '<button type="button" class="opt-btn" data-i="' + i + '" data-opt="' + idx + '"' +
        (draft.answers.pg[i] === idx ? ' aria-pressed="true"' : ' aria-pressed="false"') + '><span class="letter">' + LETTERS[idx] + '</span><span>' + esc(opt) + '</span></button>';
    });
    html += '</div>';
    div.innerHTML = html; box.appendChild(div);
  });
  box.querySelectorAll('.opt-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (draft.status !== 'berjalan') return;
      var i = Number(btn.getAttribute('data-i')), idx = Number(btn.getAttribute('data-opt'));
      draft.answers.pg[i] = idx; saveDraft();
      var row = $('pg-' + i);
      row.querySelectorAll('.opt-btn').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      updateAnswered();
    });
  });
}
function renderBS() {
  var box = $('bsBox'); if (!box) return; box.innerHTML = '';
  BS.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal'; div.id = 'bs-' + i;
    var picked = draft.answers.bs[i];
    div.innerHTML = '<p class="soal-q">' + (21 + i) + '. ' + esc(item.q) + '</p>' +
      '<div class="bs-opts" role="group" aria-label="Pilih BENAR atau SALAH soal ' + (21 + i) + '">' +
      '<button type="button" class="btn btn-ghost" data-i="' + i + '" data-val="true"' + (picked === true ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>BENAR</button>' +
      '<button type="button" class="btn btn-ghost" data-i="' + i + '" data-val="false"' + (picked === false ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>SALAH</button></div>';
    box.appendChild(div);
  });
  box.querySelectorAll('.bs-opts .btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (draft.status !== 'berjalan') return;
      var i = Number(btn.getAttribute('data-i'));
      draft.answers.bs[i] = btn.getAttribute('data-val') === 'true'; saveDraft();
      var row = $('bs-' + i);
      row.querySelectorAll('.bs-opts .btn').forEach(function (b) {
        var on = b === btn; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('picked-benarsalah', on);
      });
      updateAnswered();
    });
  });
}
function renderMatch() {
  var box = $('matchBox'); if (!box) return; box.innerHTML = '';
  MATCH.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal match-row'; div.id = 'match-' + i;
    var opts = '<option value="">— Pilih huruf —</option>';
    MATCH_OPTS.forEach(function (o) { opts += '<option value="' + o.l + '"' + (draft.answers.match[i] === o.l ? ' selected' : '') + '>' + o.l + ' — ' + o.t + '</option>'; });
    div.innerHTML = '<p class="soal-q">' + (26 + i) + '. ' + esc(item.q) + '</p><select aria-label="Jawaban menjodohkan soal ' + (26 + i) + '">' + opts + '</select>';
    box.appendChild(div);
  });
  box.querySelectorAll('select').forEach(function (sel, i) {
    sel.addEventListener('change', function () { if (draft.status !== 'berjalan') return; draft.answers.match[i] = sel.value || null; saveDraft(); updateAnswered(); });
  });
}
function renderIsian() {
  var box = $('isianBox'); if (!box) return; box.innerHTML = '';
  ISIAN.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal isian-row'; div.id = 'isian-' + i;
    var val = draft.answers.isian[i] !== undefined && draft.answers.isian[i] !== null ? draft.answers.isian[i] : '';
    div.innerHTML = '<p class="soal-q">' + (31 + i) + '. ' + esc(item.q) + '</p><input type="text" inputmode="decimal" aria-label="Jawaban isian soal ' + (31 + i) + '" value="' + esc(val) + '" placeholder="Tulis jawaban singkat" />';
    box.appendChild(div);
  });
  box.querySelectorAll('input').forEach(function (inp, i) {
    inp.addEventListener('input', function () { if (draft.status !== 'berjalan') return; draft.answers.isian[i] = inp.value; saveDraft(); updateAnswered(); });
  });
}
function renderUraianExam() {
  var box = $('uraianBox'); if (!box) return; box.innerHTML = '';
  URAIAN.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal'; div.id = 'uraian-' + i;
    var txt = draft.answers.uraianText[i] || '';
    div.innerHTML = '<p class="soal-q">' + (36 + i) + '. ' + esc(item.q) + '</p>' +
      '<div class="uraian-jawab"><label class="f-label" for="ur-txt-' + i + '">Jawabanmu (tulis langkah-langkahnya):</label>' +
      '<textarea id="ur-txt-' + i + '" placeholder="Tulis langkah penyelesaian lengkap di sini...">' + esc(txt) + '</textarea></div>';
    box.appendChild(div);
  });
  box.querySelectorAll('textarea').forEach(function (ta, i) {
    ta.addEventListener('input', function () { if (draft.status !== 'berjalan') return; draft.answers.uraianText[i] = ta.value; saveDraft(); updateAnswered(); });
  });
}
function renderExam() { renderPG(); renderBS(); renderMatch(); renderIsian(); renderUraianExam(); updateAnswered(); }

/* ---------- Progres dijawab ---------- */
function countAnswered() {
  var n = 0;
  PG.forEach(function (_, i) { if (draft.answers.pg[i] !== undefined && draft.answers.pg[i] !== null) n++; });
  BS.forEach(function (_, i) { if (draft.answers.bs[i] === true || draft.answers.bs[i] === false) n++; });
  MATCH.forEach(function (_, i) { if (draft.answers.match[i]) n++; });
  ISIAN.forEach(function (_, i) { var v = draft.answers.isian[i]; if (v !== undefined && v !== null && String(v).trim() !== '') n++; });
  URAIAN.forEach(function (_, i) { var v = draft.answers.uraianText[i]; if (v !== undefined && v !== null && String(v).trim() !== '') n++; });
  return n;
}
function updateAnswered() {
  var n = countAnswered();
  var t = $('answeredText'); if (t) t.textContent = n + ' dari 40 soal dijawab';
  var f = $('answeredFill'); if (f) f.style.width = Math.round(n / 40 * 100) + '%';
}

/* ---------- Penilaian otomatis ---------- */
function normIsian(s) {
  if (s === null || s === undefined) return '';
  var t = String(s).toLowerCase().trim().replace(/\s+/g, ' ');
  t = t.replace(/°c/g, '').replace(/%/g, '');
  t = t.replace(/\s*c$/, '');
  return t.trim();
}
function computeAuto() {
  var pg = 0, bs = 0, match = 0, isian = 0;
  PG.forEach(function (item, i) { if (draft.answers.pg[i] === item.answer) pg += 2; });
  BS.forEach(function (item, i) { if (draft.answers.bs[i] === item.answer) bs += 2; });
  MATCH.forEach(function (item, i) { if (draft.answers.match[i] === item.answer) match += 2; });
  ISIAN.forEach(function (item, i) {
    var norm = normIsian(draft.answers.isian[i]);
    if (item.accepted.some(function (a) { return normIsian(a) === norm; })) isian += 2;
  });
  return { pg: pg, bs: bs, match: match, isian: isian };
}
function disableExam() {
  var ex = $('layarUjian'); if (!ex) return;
  ex.querySelectorAll('button, input, select, textarea').forEach(function (el) {
    if (el.id !== 'btnKumpul') el.disabled = true;
  });
}

/* ---------- Kumpulkan ---------- */
function kumpulkan(otomatis) {
  if (draft.status !== 'berjalan' || submitting) return;
  var kosong = 40 - countAnswered();
  if (!otomatis && kosong > 0) {
    if (!window.confirm('Masih ada ' + kosong + ' soal yang belum dijawab. Tetap kumpulkan jawaban sekarang?')) return;
  }
  submitting = true;
  stopTimer();
  draft.auto = computeAuto();
  draft.submittedAt = Date.now();
  draft.status = 'dikumpulkan';
  saveDraft();
  disableExam();
  renderUraianPanel();
  showScreen('layarUraian');
  submitting = false;
}

/* ---------- Panel penilaian mandiri uraian ---------- */
function renderUraianPanel() {
  var box = $('uraianPanelBox'); if (!box) return; box.innerHTML = '';
  var autoTotal = draft.auto ? (draft.auto.pg + draft.auto.bs + draft.auto.match + draft.auto.isian) : 0;
  var info = $('uraianAutoInfo');
  if (info) info.textContent = 'Skor otomatis (35 soal): PG ' + (draft.auto ? draft.auto.pg : 0) + ' + Benar/Salah ' + (draft.auto ? draft.auto.bs : 0) + ' + Menjodohkan ' + (draft.auto ? draft.auto.match : 0) + ' + Isian ' + (draft.auto ? draft.auto.isian : 0) + ' = ' + autoTotal + ' / 70.';
  URAIAN.forEach(function (item, i) {
    var div = document.createElement('div'); div.className = 'soal'; div.id = 'ur-panel-' + i;
    var txt = draft.answers.uraianText[i];
    var sc = draft.uraianScore[i];
    div.innerHTML = '<p class="soal-q">' + (36 + i) + '. ' + esc(item.q) + '</p>' +
      '<p><strong>Jawabanmu:</strong></p><p class="jawaban-siswa">' + (txt && String(txt).trim() !== '' ? esc(txt) : '<span class="muted">— tidak dijawab —</span>') + '</p>' +
      '<div class="pembahasan-box show"><p><strong>Pembahasan &amp; rubrik:</strong></p><p>' + esc(item.why) + '</p>' +
      '<p class="muted small">Rubrik: 6 = langkah lengkap dan jawaban benar; 4–5 = langkah hampir lengkap, ada kekeliruan kecil; 2–3 = sebagian langkah benar; 0–1 = jawaban salah atau kosong.</p></div>' +
      '<div class="uraian-skor"><label for="ur-skor-panel-' + i + '">Skor saya (0–6):</label>' +
      '<input type="number" id="ur-skor-panel-' + i + '" min="0" max="6" step="1" value="' + (sc === undefined || sc === null ? '' : sc) + '" placeholder="0–6" /></div>';
    box.appendChild(div);
  });
  box.querySelectorAll('input[type="number"]').forEach(function (inp, i) {
    inp.addEventListener('input', function () {
      var v = Number(inp.value);
      if (inp.value === '') { draft.uraianScore[i] = null; }
      else if (Number.isFinite(v)) { draft.uraianScore[i] = Math.max(0, Math.min(6, Math.round(v))); }
      saveDraft();
    });
  });
}
function simpanUraian() {
  var totalUraian = 0;
  URAIAN.forEach(function (_, i) {
    var inp = $('ur-skor-panel-' + i);
    var v = inp ? Number(inp.value) : NaN;
    if (inp && inp.value !== '' && Number.isFinite(v)) { v = Math.max(0, Math.min(6, Math.round(v))); inp.value = String(v); draft.uraianScore[i] = v; totalUraian += v; }
    else { draft.uraianScore[i] = 0; }
  });
  var autoTotal = draft.auto.pg + draft.auto.bs + draft.auto.match + draft.auto.isian;
  draft.total = autoTotal + totalUraian;
  draft.finishedAt = Date.now();
  draft.durationMin = Math.max(1, Math.round((draft.finishedAt - draft.startedAt) / 60000));
  draft.status = 'selesai';
  saveDraft();
  /* Riwayat: simpan sekali per percobaan (id = startedAt) */
  var h = loadHistory();
  var id = String(draft.startedAt);
  if (!h.some(function (e) { return String(e.id) === id; })) {
    h.unshift({ id: id, waktu: fmtWaktu(draft.finishedAt), nama: draft.nama, kelas: draft.kelas,
      total: draft.total, durasi: draft.durationMin, status: draft.total >= KKM ? 'Tuntas' : 'Belum Tuntas' });
    saveHistoryList(h);
  }
  renderResult();
  showScreen('layarHasil');
  kirimKeSheet(false);
}

/* ---------- Hasil akhir + review ---------- */
function renderResult() {
  var a = draft.auto || { pg: 0, bs: 0, match: 0, isian: 0 };
  var u = 0; URAIAN.forEach(function (_, i) { u += (draft.uraianScore[i] || 0); });
  var total = draft.total !== null && draft.total !== undefined ? draft.total : (a.pg + a.bs + a.match + a.isian + u);
  function cell(id, v, max) { var el = $(id); if (el) el.textContent = v + ' / ' + max; }
  cell('tPg', a.pg, 40); cell('tBs', a.bs, 10); cell('tMatch', a.match, 10); cell('tIsian', a.isian, 10); cell('tUraian', u, 30);
  var tt = $('tTotal'); if (tt) tt.textContent = String(total);
  var ht = $('hasilTotal'); if (ht) ht.textContent = total + '/100';
  var ring = $('hasilRing'); if (ring) ring.style.setProperty('--p', total + '%');
  var msg = $('hasilMsg');
  if (msg) msg.textContent = total >= KKM
    ? 'TUNTAS — skor ' + total + '/100 (KKM 70). Pertahankan, dan ulangi soal yang masih salah di bawah ini.'
    : 'BELUM TUNTAS — skor ' + total + '/100 (KKM 70). Pelajari pembahasan tiap soal di bawah ini, lalu ulangi simulasinya.';
  var who = $('hasilSiapa'); if (who) who.textContent = draft.nama + ' · ' + draft.kelas + ' · ' + fmtWaktu(draft.finishedAt || Date.now()) + ' · ' + draft.durationMin + ' menit';
  renderReview();
  renderHistory();
  renderSendStatus();
}
function reviewItem(no, q, kunciHtml, bahas, ok, skorText) {
  return '<div class="soal ' + (ok === null ? '' : (ok ? 'ok' : 'no')) + '"><p class="soal-q">' + no + '. ' + esc(q) + '</p>' +
    (skorText ? '<p class="muted small">' + esc(skorText) + '</p>' : '') +
    '<p class="kunci show">' + kunciHtml + '</p><p class="pembahasan show">Pembahasan: ' + esc(bahas) + '</p></div>';
}
function renderReview() {
  var box = $('reviewBox'); if (!box) return;
  var html = '<h3>Bagian I — Pilihan Ganda</h3><div class="stack">';
  PG.forEach(function (item, i) {
    var ok = draft.answers.pg[i] === item.answer;
    html += reviewItem(i + 1, item.q, 'Kunci: ' + LETTERS[item.answer] + ' — ' + esc(item.options[item.answer]) + (draft.answers.pg[i] === undefined ? ' · Kamu: — tidak dijawab —' : ' · Kamu: ' + LETTERS[draft.answers.pg[i]]), item.why, ok, ok ? 'Benar · 2 poin' : 'Salah · 0 poin');
  });
  html += '</div><h3>Bagian II — Benar / Salah</h3><div class="stack">';
  BS.forEach(function (item, i) {
    var ok = draft.answers.bs[i] === item.answer;
    var kamu = draft.answers.bs[i] === true ? 'BENAR' : (draft.answers.bs[i] === false ? 'SALAH' : '— tidak dijawab —');
    html += reviewItem(21 + i, item.q, 'Kunci: ' + (item.answer ? 'BENAR' : 'SALAH') + ' · Kamu: ' + kamu, item.why, ok, ok ? 'Benar · 2 poin' : 'Salah · 0 poin');
  });
  html += '</div><h3>Bagian III — Menjodohkan</h3><div class="stack">';
  MATCH.forEach(function (item, i) {
    var ok = draft.answers.match[i] === item.answer;
    var ansText = ''; MATCH_OPTS.forEach(function (o) { if (o.l === item.answer) ansText = o.t; });
    html += reviewItem(26 + i, item.q, 'Kunci: ' + item.answer + ' (' + esc(ansText) + ') · Kamu: ' + (draft.answers.match[i] || '— tidak dijawab —'), item.why, ok, ok ? 'Benar · 2 poin' : 'Salah · 0 poin');
  });
  html += '</div><h3>Bagian IV — Isian Singkat</h3><div class="stack">';
  ISIAN.forEach(function (item, i) {
    var norm = normIsian(draft.answers.isian[i]);
    var ok = item.accepted.some(function (a) { return normIsian(a) === norm; });
    html += reviewItem(31 + i, item.q, 'Kunci: ' + esc(item.accepted[0]) + ' · Kamu: ' + esc(draft.answers.isian[i] || '— tidak dijawab —'), item.why, ok, ok ? 'Benar · 2 poin' : 'Salah · 0 poin');
  });
  html += '</div><h3>Bagian V — Uraian (dinilai mandiri)</h3><div class="stack">';
  URAIAN.forEach(function (item, i) {
    var sc = draft.uraianScore[i] || 0;
    html += '<div class="soal"><p class="soal-q">' + (36 + i) + '. ' + esc(item.q) + '</p>' +
      '<p><strong>Jawabanmu:</strong></p><p class="jawaban-siswa">' + (draft.answers.uraianText[i] && String(draft.answers.uraianText[i]).trim() !== '' ? esc(draft.answers.uraianText[i]) : '<span class="muted">— tidak dijawab —</span>') + '</p>' +
      '<p class="kunci show">Skor mandiri: ' + sc + ' / 6</p><p class="pembahasan show">Pembahasan: ' + esc(item.why) + '</p></div>';
  });
  html += '</div>';
  box.innerHTML = html;
}

/* ---------- Google Sheets: kirim ---------- */
function buildPayload() {
  var a = draft.auto || { pg: 0, bs: 0, match: 0, isian: 0 };
  var u = 0; URAIAN.forEach(function (_, i) { u += (draft.uraianScore[i] || 0); });
  return {
    'Waktu': fmtWaktu(draft.finishedAt || Date.now()),
    'Nama': draft.nama, 'Kelas': draft.kelas,
    'Skor PG': a.pg, 'Skor Benar-Salah': a.bs, 'Skor Menjodohkan': a.match,
    'Skor Isian': a.isian, 'Skor Uraian': u,
    'Total': draft.total, 'Nilai': draft.total,
    'Durasi (menit)': draft.durationMin,
    'Status': draft.total >= KKM ? 'Tuntas' : 'Belum Tuntas'
  };
}
function renderSendStatus() {
  var el = $('sendStatus'); if (!el) return;
  var url = read(KEY_SHEET, '');
  if (!url) { el.textContent = 'Belum diatur — nilai hanya tersimpan di perangkat ini.'; el.className = 'feedback show'; return; }
  if (draft.sent) { el.textContent = 'Terkirim ke Google Sheets ✓ (' + fmtWaktu(draft.sentAt || Date.now()) + ')'; el.className = 'feedback ok show'; return; }
  var pend = read(KEY_PENDING, null);
  el.textContent = pend ? 'Gagal terkirim — tersimpan, tekan Kirim Ulang.' : 'Siap dikirim ke Google Sheets…';
  el.className = 'feedback show';
}
function kirimKeSheet(isRetry) {
  var url = read(KEY_SHEET, '');
  if (!url) { renderSendStatus(); return; }
  if (draft.sent && !isRetry) { renderSendStatus(); return; }
  var payload = buildPayload();
  var el = $('sendStatus');
  if (el) { el.textContent = 'Mengirim ke Google Sheets…'; el.className = 'feedback show'; }
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
    .then(function (res) { return res.text().then(function (t) { return { ok: res.ok, text: t }; }); })
    .then(function (r) {
      var parsed = null; try { parsed = JSON.parse(r.text); } catch (e) { /* abaikan */ }
      if (r.ok && (!parsed || parsed.ok !== false)) {
        draft.sent = true; draft.sentAt = Date.now(); saveDraft();
        try { localStorage.removeItem(KEY_PENDING); } catch (e) { /* abaikan */ }
        renderSendStatus();
      } else { throw new Error('Server menolak: ' + r.text); }
    })
    .catch(function (err) {
      store(KEY_PENDING, JSON.stringify(payload));
      renderSendStatus();
      if (el) el.textContent = 'Gagal terkirim — tersimpan, tekan Kirim Ulang. (' + (err && err.message ? err.message : 'periksa koneksi internet') + ')';
    });
}

/* ---------- Mulai / lanjutkan / ulangi ---------- */
function mulaiBaru() {
  var nama = ($('namaSiswa').value || '').trim();
  var kelas = ($('kelasSiswa').value || '').trim();
  var err = $('startError');
  if (!nama || !kelas) { if (err) { err.textContent = 'Isi dulu nama lengkap dan kelas (contoh: VII-A).'; err.classList.add('show'); } return; }
  if (draft.status === 'berjalan' && !window.confirm('Ada simulasi yang sedang berjalan. Hapus draft lama dan mulai baru?')) return;
  draft = blankDraft();
  draft.nama = nama; draft.kelas = kelas;
  draft.startedAt = Date.now(); draft.status = 'berjalan';
  saveDraft();
  renderExam();
  showScreen('layarUjian');
  startTimer();
}
function lanjutkan() {
  if (draft.status !== 'berjalan') return;
  renderExam();
  showScreen('layarUjian');
  startTimer();
}
function ulangi() {
  if (!window.confirm('Hapus draft simulasi ini dan mulai dari awal? Riwayat skor yang sudah tersimpan tidak ikut terhapus.')) return;
  stopTimer();
  try { localStorage.removeItem(KEY_DRAFT); localStorage.removeItem(KEY_PENDING); } catch (e) { /* abaikan */ }
  window.location.reload();
}

/* ---------- Init ---------- */
renderExam();
renderHistory();
renderSheetSetting();
var namaInp = $('namaSiswa'), kelasInp = $('kelasSiswa');
if (draft.nama && namaInp) namaInp.value = draft.nama;
if (draft.kelas && kelasInp) kelasInp.value = draft.kelas;
var btnLanjut = $('btnLanjut');
if (btnLanjut) {
  if (draft.status === 'berjalan') {
    btnLanjut.hidden = false;
    btnLanjut.textContent = 'Lanjutkan Simulasi (' + draft.nama + ' · ' + draft.kelas + ' · sisa ' + fmtTimer(remainingSec()) + ')';
  } else { btnLanjut.hidden = true; }
}
if (draft.status === 'berjalan') { /* tetap di layar mulai; siswa menekan Lanjutkan */ }
else if (draft.status === 'dikumpulkan') { renderUraianPanel(); showScreen('layarUraian'); }
else if (draft.status === 'selesai') { renderResult(); showScreen('layarHasil'); }
else { showScreen('layarMulai'); }

var bMulai = $('btnMulai'); if (bMulai) bMulai.addEventListener('click', mulaiBaru);
if (btnLanjut) btnLanjut.addEventListener('click', lanjutkan);
var bKumpul = $('btnKumpul'); if (bKumpul) bKumpul.addEventListener('click', function () { kumpulkan(false); });
var bSimpanUr = $('btnSimpanUraian'); if (bSimpanUr) bSimpanUr.addEventListener('click', simpanUraian);
var bUlangi = $('btnUlangi'); if (bUlangi) bUlangi.addEventListener('click', ulangi);
var bSimpanSheet = $('btnSimpanSheet');
if (bSimpanSheet) bSimpanSheet.addEventListener('click', function () {
  var u = ($('sheetUrlInput').value || '').trim();
  if (u && u.indexOf('https://script.google.com/') !== 0 && u.indexOf('https://script.googleusercontent.com/') !== 0) {
    if (!window.confirm('URL ini bukan URL Web App Google Apps Script yang biasa (script.google.com). Tetap simpan?')) return;
  }
  store(KEY_SHEET, u); renderSheetSetting(); renderSendStatus();
});
var bKirim = $('btnKirimUlang'); if (bKirim) bKirim.addEventListener('click', function () { kirimKeSheet(true); });

})();
