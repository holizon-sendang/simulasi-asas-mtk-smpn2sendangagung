/* Simulasi ASAS Matematika Kelas 7 — script.js
   Vanilla JS, tanpa framework.
   Bank soal Kelas 7 dimuat dari assets/data/questions-7.json:
   80 soal, indikator 1-40 masing-masing 2 varian (A/B).
   Tiap sesi: 1 varian acak per indikator (40 soal), urutan diacak
   hanya di dalam tiap jenis soal (PG 1-20, Benar-Salah 21-25,
   Menjodohkan 26-30, Isian Singkat 31-35, Uraian 36-40), urutan
   pilihan PG diacak, dan pilihan Menjodohkan tiap soal adalah
   kelima jawaban dari soal-soal Menjodohkan pada sesi itu.
   Alur: layar mulai -> ujian 120 menit (timer) -> kumpul ->
   hasil akhir -> kirim ke Google Sheets (opsional).
   Penilaian: nilai = round(benar_otomatis / 30 * 100); yang dinilai
   otomatis hanya PG + Benar-Salah + Menjodohkan (30 soal).
   Isian Singkat dan Uraian dicek mandiri, tidak masuk nilai.
   localStorage: mpi-simulasi-asas-k7-draft, mpi-simulasi-asas-k7-history,
   mpi-simulasi-asas-k7-sheet-url, mpi-simulasi-asas-k7-pending. */
(function () {
  'use strict';

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
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var LETTERS = ['A', 'B', 'C', 'D', 'E'];
  var TYPE_ORDER = ['PG', 'Benar-Salah', 'Menjodohkan', 'Isian Singkat', 'Uraian'];
  var AUTO_TYPES = ['PG', 'Benar-Salah', 'Menjodohkan'];
  var DURATION_SEC = 7200; /* 120 menit */
  var KKM = 70;
  var KEY_DRAFT = 'mpi-simulasi-asas-k7-draft';
  var KEY_HISTORY = 'mpi-simulasi-asas-k7-history';
  var KEY_SHEET = 'mpi-simulasi-asas-k7-sheet-url';
  var KEY_PENDING = 'mpi-simulasi-asas-k7-pending';

  /* ---------- Bank soal (dimuat dari JSON) ---------- */
  var BANK = null;
  var bankLoaded = false;

  function buildSession(bank) {
    var byIndikator = {};
    bank.forEach(function (q) {
      (byIndikator[q.indikator] = byIndikator[q.indikator] || []).push(q);
    });
    var picked = [];
    Object.keys(byIndikator).sort(function (a, b) { return a - b; }).forEach(function (key) {
      var variants = byIndikator[key];
      var chosen = variants[Math.floor(Math.random() * variants.length)];
      var copy = Object.assign({}, chosen);
      if (copy.tipe === 'PG' && copy.pilihan) copy._options = shuffle(copy.pilihan);
      picked.push(copy);
    });
    /* Menjodohkan: pilihan tiap soal adalah kelima jawaban dari
       soal-soal Menjodohkan pada sesi ini (diacak). */
    var matchingPool = picked.filter(function (q) { return q.tipe === 'Menjodohkan'; }).map(function (q) { return q.jawaban; });
    picked.forEach(function (q) {
      if (q.tipe === 'Menjodohkan') q._options = shuffle(matchingPool);
    });
    /* Urutkan per jenis soal; acak hanya di dalam tiap jenis soal. */
    var session = [];
    TYPE_ORDER.forEach(function (t) {
      session = session.concat(shuffle(picked.filter(function (q) { return q.tipe === t; })));
    });
    return session;
  }
  function sessionByType(type) {
    if (!draft.session) return [];
    return draft.session.map(function (q, i) { return { q: q, idx: i }; })
      .filter(function (o) { return o.q.tipe === type; });
  }
  function isAuto(q) { return AUTO_TYPES.indexOf(q.tipe) !== -1; }
  function imgHtml(q) {
    if (!q.gambar) return '';
    return '<img class="question-image" src="' + esc(q.gambar) + '" alt="Gambar soal ' + esc(q.id || '') + '" />';
  }

  /* ---------- State ---------- */
  function blankAnswers() { return []; }
  function blankDraft() {
    return { nama: '', kelas: '', startedAt: 0, status: 'baru', session: [], answers: blankAnswers(),
      auto: null, total: null, submittedAt: 0, finishedAt: 0,
      durationMin: 0, sent: false, sentAt: 0 };
  }
  var draft = blankDraft();
  try {
    var d0 = JSON.parse(read(KEY_DRAFT, 'null'));
    /* Draft lama (format sebelum bank acak) tidak punya session 40 soal:
       abaikan dan mulai dari kosong. */
    if (d0 && Array.isArray(d0.session) && d0.session.length === 40 && Array.isArray(d0.answers)) draft = d0;
  } catch (e) { /* abaikan */ }
  if (!Array.isArray(draft.answers)) draft.answers = [];
  var timerId = null;
  var submitting = false;

  function saveDraft() { store(KEY_DRAFT, JSON.stringify(draft)); }
  function loadHistory() { try { var h = JSON.parse(read(KEY_HISTORY, '[]')); return Array.isArray(h) ? h : []; } catch (e) { return []; } }
  function saveHistoryList(h) { store(KEY_HISTORY, JSON.stringify(h.slice(0, 20))); }

  /* ---------- Layar ---------- */
  function showScreen(name) {
    ['layarMulai', 'layarUjian', 'layarHasil'].forEach(function (id) {
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
    sessionByType('PG').forEach(function (o) {
      var item = o.q, idx = o.idx;
      var div = document.createElement('div'); div.className = 'soal'; div.id = 'pg-' + idx;
      var html = '<p class="soal-q">' + (idx + 1) + '. ' + esc(item.soal) + '</p>' + imgHtml(item) +
        '<div class="pg-opts" role="group" aria-label="Pilihan jawaban soal ' + (idx + 1) + '">';
      (item._options || item.pilihan || []).forEach(function (opt, oi) {
        html += '<button type="button" class="opt-btn" data-i="' + idx + '" data-opt="' + esc(opt) + '"' +
          (draft.answers[idx] === opt ? ' aria-pressed="true"' : ' aria-pressed="false"') + '><span class="letter">' + LETTERS[oi] + '</span><span>' + esc(opt) + '</span></button>';
      });
      html += '</div>';
      div.innerHTML = html; box.appendChild(div);
    });
    box.querySelectorAll('.opt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (draft.status !== 'berjalan') return;
        var i = Number(btn.getAttribute('data-i'));
        draft.answers[i] = btn.getAttribute('data-opt'); saveDraft();
        var row = $('pg-' + i);
        row.querySelectorAll('.opt-btn').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        updateAnswered();
      });
    });
  }
  function renderBS() {
    var box = $('bsBox'); if (!box) return; box.innerHTML = '';
    sessionByType('Benar-Salah').forEach(function (o) {
      var item = o.q, idx = o.idx;
      var div = document.createElement('div'); div.className = 'soal'; div.id = 'bs-' + idx;
      var picked = draft.answers[idx];
      div.innerHTML = '<p class="soal-q">' + (idx + 1) + '. ' + esc(item.soal) + '</p>' + imgHtml(item) +
        '<div class="bs-opts" role="group" aria-label="Pilih BENAR atau SALAH soal ' + (idx + 1) + '">' +
        '<button type="button" class="btn btn-ghost" data-i="' + idx + '" data-val="Benar"' + (picked === 'Benar' ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>BENAR</button>' +
        '<button type="button" class="btn btn-ghost" data-i="' + idx + '" data-val="Salah"' + (picked === 'Salah' ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>SALAH</button></div>';
      box.appendChild(div);
    });
    box.querySelectorAll('.bs-opts .btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (draft.status !== 'berjalan') return;
        var i = Number(btn.getAttribute('data-i'));
        draft.answers[i] = btn.getAttribute('data-val'); saveDraft();
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
    /* Kolom B sesi ini: kelima jawaban Menjodohkan pada sesi ini. */
    var poolBox = $('matchPool');
    var pool = sessionByType('Menjodohkan').length ? (sessionByType('Menjodohkan')[0].q._options || []) : [];
    if (poolBox) {
      poolBox.innerHTML = pool.length
        ? '<p class="muted small">Pilihan jawaban untuk tiap soal adalah kelima jawaban berikut (diacak tiap soal):</p><p><strong>' + pool.map(esc).join(' &nbsp;·&nbsp; ') + '</strong></p>'
        : '';
    }
    sessionByType('Menjodohkan').forEach(function (o) {
      var item = o.q, idx = o.idx;
      var div = document.createElement('div'); div.className = 'soal match-row'; div.id = 'match-' + idx;
      var opts = '<option value="">— Pilih jawaban —</option>';
      (item._options || []).forEach(function (t) {
        opts += '<option value="' + esc(t) + '"' + (draft.answers[idx] === t ? ' selected' : '') + '>' + esc(t) + '</option>';
      });
      div.innerHTML = '<p class="soal-q">' + (idx + 1) + '. ' + esc(item.soal) + '</p>' + imgHtml(item) +
        '<select aria-label="Jawaban menjodohkan soal ' + (idx + 1) + '">' + opts + '</select>';
      box.appendChild(div);
    });
    box.querySelectorAll('select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        if (draft.status !== 'berjalan') return;
        var row = sel.closest('.soal'); if (!row) return;
        var i = Number(row.id.replace('match-', ''));
        draft.answers[i] = sel.value || null; saveDraft(); updateAnswered();
      });
    });
  }
  function renderIsian() {
    var box = $('isianBox'); if (!box) return; box.innerHTML = '';
    sessionByType('Isian Singkat').forEach(function (o) {
      var item = o.q, idx = o.idx;
      var div = document.createElement('div'); div.className = 'soal isian-row'; div.id = 'isian-' + idx;
      var val = draft.answers[idx] !== undefined && draft.answers[idx] !== null ? draft.answers[idx] : '';
      div.innerHTML = '<p class="soal-q">' + (idx + 1) + '. ' + esc(item.soal) + '</p>' + imgHtml(item) +
        '<input type="text" inputmode="decimal" aria-label="Jawaban isian soal ' + (idx + 1) + '" value="' + esc(val) + '" placeholder="Tulis angka saja, tanpa satuan" />';
      box.appendChild(div);
    });
    box.querySelectorAll('input').forEach(function (inp) {
      inp.addEventListener('input', function () {
        if (draft.status !== 'berjalan') return;
        var row = inp.closest('.soal'); if (!row) return;
        var i = Number(row.id.replace('isian-', ''));
        draft.answers[i] = inp.value.trim() === '' ? null : inp.value.trim(); saveDraft(); updateAnswered();
      });
    });
  }
  function renderUraianExam() {
    var box = $('uraianBox'); if (!box) return; box.innerHTML = '';
    sessionByType('Uraian').forEach(function (o) {
      var item = o.q, idx = o.idx;
      var div = document.createElement('div'); div.className = 'soal'; div.id = 'uraian-' + idx;
      var txt = draft.answers[idx] || '';
      div.innerHTML = '<p class="soal-q">' + (idx + 1) + '. ' + esc(item.soal) + '</p>' + imgHtml(item) +
        '<div class="uraian-jawab"><label class="f-label" for="ur-txt-' + idx + '">Jawabanmu (tulis langkah-langkahnya):</label>' +
        '<textarea id="ur-txt-' + idx + '" placeholder="Tulis langkah penyelesaian lengkap di sini...">' + esc(txt) + '</textarea></div>' +
        '<p class="muted small">Soal ini dicek mandiri setelah selesai — tidak masuk nilai.</p>';
      box.appendChild(div);
    });
    box.querySelectorAll('textarea').forEach(function (ta) {
      ta.addEventListener('input', function () {
        if (draft.status !== 'berjalan') return;
        var row = ta.closest('.soal'); if (!row) return;
        var i = Number(row.id.replace('uraian-', ''));
        draft.answers[i] = ta.value.trim() === '' ? null : ta.value.trim(); saveDraft(); updateAnswered();
      });
    });
  }
  function renderExam() {
    if (!draft.session || draft.session.length !== 40) return;
    renderPG(); renderBS(); renderMatch(); renderIsian(); renderUraianExam(); updateAnswered();
  }

  /* ---------- Progres dijawab ---------- */
  function countAnswered() {
    var n = 0;
    (draft.answers || []).forEach(function (a) { if (a !== null && a !== undefined && String(a).trim() !== '') n++; });
    return n;
  }
  function updateAnswered() {
    var n = countAnswered();
    var t = $('answeredText'); if (t) t.textContent = n + ' dari 40 soal dijawab';
    var f = $('answeredFill'); if (f) f.style.width = Math.round(n / 40 * 100) + '%';
  }

  /* ---------- Penilaian otomatis (30 soal) ---------- */
  function sameText(a, b) { return String(a === null || a === undefined ? '' : a).trim() === String(b).trim(); }
  function computeAuto() {
    var pg = 0, bs = 0, match = 0;
    (draft.session || []).forEach(function (q, i) {
      var a = draft.answers[i];
      if (a === null || a === undefined || String(a).trim() === '') return;
      if (!sameText(a, q.jawaban)) return;
      if (q.tipe === 'PG') pg++;
      else if (q.tipe === 'Benar-Salah') bs++;
      else if (q.tipe === 'Menjodohkan') match++;
    });
    var totalBenar = pg + bs + match;
    return { pg: pg, bs: bs, match: match, totalBenar: totalBenar, nilai: Math.round(totalBenar / 30 * 100) };
  }
  function countAnsweredType(type) {
    var n = 0;
    (draft.session || []).forEach(function (q, i) {
      if (q.tipe !== type) return;
      var a = draft.answers[i];
      if (a !== null && a !== undefined && String(a).trim() !== '') n++;
    });
    return n;
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
    draft.total = draft.auto.nilai;
    draft.submittedAt = Date.now();
    draft.finishedAt = Date.now();
    draft.durationMin = Math.max(1, Math.round((draft.finishedAt - draft.startedAt) / 60000));
    draft.status = 'selesai';
    saveDraft();
    disableExam();
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
    submitting = false;
  }

  /* ---------- Hasil akhir + review ---------- */
  function renderResult() {
    var a = draft.auto || computeAuto();
    var isianDijawab = countAnsweredType('Isian Singkat');
    var uraianDijawab = countAnsweredType('Uraian');
    function cell(id, v) { var el = $(id); if (el) el.textContent = v; }
    cell('tPg', a.pg + ' / 20'); cell('tBs', a.bs + ' / 5'); cell('tMatch', a.match + ' / 5');
    cell('tIsian', isianDijawab + ' / 5'); cell('tUraian', uraianDijawab + ' / 5');
    cell('tTotalBenar', a.totalBenar + ' / 30');
    cell('tTotal', a.nilai + ' / 100');
    var ht = $('hasilTotal'); if (ht) ht.textContent = a.nilai + '/100';
    var ring = $('hasilRing'); if (ring) ring.style.setProperty('--p', a.nilai + '%');
    var msg = $('hasilMsg');
    if (msg) msg.textContent = a.nilai >= KKM
      ? 'TUNTAS — nilai ' + a.nilai + '/100 (KKM 70). Jawaban benar: ' + a.totalBenar + ' dari 30 soal yang dinilai otomatis.'
      : 'BELUM TUNTAS — nilai ' + a.nilai + '/100 (KKM 70). Jawaban benar: ' + a.totalBenar + ' dari 30 soal yang dinilai otomatis. Pelajari pembahasan tiap soal di bawah ini, lalu ulangi simulasinya.';
    var who = $('hasilSiapa'); if (who) who.textContent = draft.nama + ' · ' + draft.kelas + ' · ' + fmtWaktu(draft.finishedAt || Date.now()) + ' · ' + draft.durationMin + ' menit';
    renderReview();
    renderHistory();
    renderSendStatus();
  }
  function renderReview() {
    var box = $('reviewBox'); if (!box) return;
    var html = '';
    var groups = [
      ['Bagian I — Pilihan Ganda', 'PG'],
      ['Bagian II — Benar / Salah', 'Benar-Salah'],
      ['Bagian III — Menjodohkan', 'Menjodohkan'],
      ['Bagian IV — Isian Singkat', 'Isian Singkat'],
      ['Bagian V — Uraian', 'Uraian']
    ];
    groups.forEach(function (g) {
      html += '<h3>' + g[0] + '</h3><div class="stack">';
      sessionByType(g[1]).forEach(function (o) {
        var q = o.q, idx = o.idx;
        var ans = draft.answers[idx];
        var dijawab = ans !== null && ans !== undefined && String(ans).trim() !== '';
        var ok = isAuto(q) ? (dijawab && sameText(ans, q.jawaban)) : null;
        var verdict, verdictCls;
        if (!isAuto(q)) { verdict = 'Cek Mandiri — tidak masuk skor otomatis'; verdictCls = 'verdict-self'; }
        else if (!dijawab) { verdict = 'Tidak dijawab'; verdictCls = 'verdict-empty'; }
        else if (ok) { verdict = 'Benar'; verdictCls = 'verdict-correct'; }
        else { verdict = 'Salah'; verdictCls = 'verdict-wrong'; }
        html += '<div class="soal ' + (ok === null ? '' : (ok ? 'ok' : 'no')) + '">' +
          '<p class="soal-q">' + (idx + 1) + '. ' + esc(q.soal) + ' <span class="muted small">(' + esc(q.materi) + ')</span></p>' +
          imgHtml(q) +
          '<p class="muted small"><strong>' + verdict + '</strong></p>' +
          '<p><strong>Jawabanmu:</strong> ' + (dijawab ? esc(ans) : '— (tidak dijawab)') + '</p>';
        if (isAuto(q)) {
          html += '<p class="kunci show">Jawaban benar: ' + esc(q.jawaban) + '</p>';
        } else {
          html += '<p class="kunci show">Kunci jawaban (cek mandiri): ' + esc(q.jawaban) + '</p>';
        }
        html += '<p class="pembahasan show">Pembahasan: ' + esc(q.pembahasan || '') + '</p></div>';
      });
      html += '</div>';
    });
    box.innerHTML = html;
  }

  /* ---------- Google Sheets: kirim ---------- */
  function buildPayload() {
    var a = draft.auto || computeAuto();
    return {
      'Waktu': fmtWaktu(draft.finishedAt || Date.now()),
      'Nama': draft.nama, 'Kelas': draft.kelas,
      'PG Benar': a.pg, 'Benar-Salah Benar': a.bs, 'Menjodohkan Benar': a.match,
      'Total Benar Otomatis': a.totalBenar,
      'Nilai': a.nilai,
      'Durasi (menit)': draft.durationMin,
      'Status': a.nilai >= KKM ? 'Tuntas' : 'Belum Tuntas',
      'Isian Dijawab': countAnsweredType('Isian Singkat'),
      'Uraian Dijawab': countAnsweredType('Uraian')
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

  /* ---------- Pilih Kelas (hanya Kelas 7 yang aktif; 8 dan 9 segera hadir) ---------- */
  var KELAS_INFO = {
    '7': 'Kelas 7: Bilangan Bulat, Bilangan Rasional, Aritmetika Sosial, dan Rasio.'
  };
  var kelasTerpilih = '7';
  function renderKelasPicker() {
    var info = $('kelasInfo');
    if (info) info.textContent = KELAS_INFO[kelasTerpilih] || KELAS_INFO['7'];
    document.querySelectorAll('.kelas-card[data-kelas]').forEach(function (btn) {
      var on = btn.getAttribute('data-kelas') === kelasTerpilih;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.kelas-card[data-kelas]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      kelasTerpilih = btn.getAttribute('data-kelas');
      renderKelasPicker();
    });
  });

  /* ---------- Mulai / lanjutkan / ulangi ---------- */
  function mulaiBaru() {
    if (!bankLoaded) {
      var err0 = $('startError');
      if (err0) { err0.textContent = 'Bank soal belum dimuat. Periksa koneksi internet lalu muat ulang halaman.'; err0.classList.add('show'); }
      return;
    }
    var nama = ($('namaSiswa').value || '').trim();
    var kelas = ($('kelasSiswa').value || '').trim();
    var err = $('startError');
    if (!nama || !kelas) { if (err) { err.textContent = 'Isi dulu nama lengkap dan kelas (contoh: VII-A).'; err.classList.add('show'); } return; }
    if (draft.status === 'berjalan' && !window.confirm('Ada simulasi yang sedang berjalan. Hapus draft lama dan mulai sesi baru (soal baru)?')) return;
    draft = blankDraft();
    draft.nama = nama; draft.kelas = kelas;
    draft.session = buildSession(BANK);
    draft.answers = draft.session.map(function () { return null; });
    draft.startedAt = Date.now(); draft.status = 'berjalan';
    saveDraft();
    renderExam();
    showScreen('layarUjian');
    startTimer();
  }
  function lanjutkan() {
    if (draft.status !== 'berjalan' || !draft.session || draft.session.length !== 40) return;
    renderExam();
    showScreen('layarUjian');
    startTimer();
  }
  function ulangi() {
    if (!window.confirm('Hapus draft simulasi ini dan mulai dari awal dengan soal baru? Riwayat skor yang sudah tersimpan tidak ikut terhapus.')) return;
    stopTimer();
    try { localStorage.removeItem(KEY_DRAFT); localStorage.removeItem(KEY_PENDING); } catch (e) { /* abaikan */ }
    window.location.reload();
  }

  /* ---------- Init: muat bank soal, lalu pulihkan draft ---------- */
  var bMulai = $('btnMulai');
  if (bMulai) bMulai.disabled = true;
  renderHistory();
  renderSheetSetting();
  renderKelasPicker();

  function restoreDraftState() {
    var namaInp = $('namaSiswa'), kelasInp = $('kelasSiswa');
    if (draft.nama && namaInp) namaInp.value = draft.nama;
    if (draft.kelas && kelasInp) kelasInp.value = draft.kelas;
    var btnLanjut = $('btnLanjut');
    if (draft.status === 'berjalan' && draft.session && draft.session.length === 40) {
      if (btnLanjut) {
        btnLanjut.hidden = false;
        btnLanjut.textContent = 'Lanjutkan Simulasi (' + draft.nama + ' · ' + draft.kelas + ' · sisa ' + fmtTimer(remainingSec()) + ')';
      }
      showScreen('layarMulai');
    } else if (draft.status === 'selesai' && draft.session && draft.session.length === 40 && draft.auto) {
      renderResult(); showScreen('layarHasil');
    } else {
      draft = blankDraft(); saveDraft();
      if (btnLanjut) btnLanjut.hidden = true;
      showScreen('layarMulai');
    }
  }

  fetch('assets/data/questions-7.json')
    .then(function (r) { if (!r.ok) throw new Error('Gagal memuat bank soal (' + r.status + ')'); return r.json(); })
    .then(function (data) {
      if (!Array.isArray(data) || data.length !== 80) throw new Error('Bank soal tidak lengkap (harus 80 soal).');
      BANK = data; bankLoaded = true;
      if (bMulai) bMulai.disabled = false;
      restoreDraftState();
    })
    .catch(function (err) {
      var e = $('startError');
      if (e) { e.textContent = 'Bank soal tidak bisa dimuat: ' + err.message + ' Pastikan file assets/data/questions-7.json ada dan buka situs ini lewat server lokal atau GitHub Pages, bukan langsung dari file.'; e.classList.add('show'); }
      showScreen('layarMulai');
    });

  if (bMulai) bMulai.addEventListener('click', mulaiBaru);
  var btnLanjut = $('btnLanjut');
  if (btnLanjut) btnLanjut.addEventListener('click', lanjutkan);
  var bKumpul = $('btnKumpul'); if (bKumpul) bKumpul.addEventListener('click', function () { kumpulkan(false); });
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
