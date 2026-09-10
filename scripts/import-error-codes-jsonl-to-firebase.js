const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'https://catatan-troubleshoot-atm-2b5a4-default-rtdb.asia-southeast1.firebasedatabase.app';
const rootDir = path.join(__dirname, '..');
const inputArgIndex = process.argv.indexOf('--input');
const defaultInputPath = path.join(rootDir, 'data', 'error_codes.jsonl');
const inputPath = inputArgIndex === -1 ? defaultInputPath : path.resolve(rootDir, process.argv[inputArgIndex + 1]);
const shouldWrite = process.argv.includes('--write');
const shouldPatch = process.argv.includes('--patch');
const allowSmallReplace = process.argv.includes('--allow-small-replace');
const SAMPLE_KEYS = ['error_code_1', 'error_code_17', 'error_code_314', 'error_code_344', 'error_code_531', 'error_code_1566'];

const NORMALIZATION_RULES = [
  [/\bPlease initialize PIN\./gi, 'Inisialisasi PIN.'],
  [/\bPlease initialize a barcode\./gi, 'Inisialisasi barcode.'],
  [/\bPlease restart MCU\./gi, 'Restart MCU.'],
  [/\bTake out an alien substance, and please reset it\./gi, 'Bersihkan benda asing, lalu reset perangkat.'],
  [/\bTake out an alien substance, and reset perangkat\./gi, 'Bersihkan benda asing, lalu reset perangkat.'],
  [/\bPlease remove it if something to shield light exists\./gi, 'Singkirkan benda yang menghalangi sensor cahaya.'],
  [/\bPlease reset it\./gi, 'Reset perangkat.'],
  [/\bTurn the power off and turn the power on again\b/gi, 'Matikan lalu hidupkan daya kembali'],
  [/\bMain controller\b/gi, 'controller utama'],
  [/\bMain Control Unit\b/g, 'unit kontrol utama'],
  [/\bMain Power Supply\b/g, 'power supply utama'],
  [/\bPINPAD Unit\b/g, 'Unit PINPAD'],
  [/\bBarCode Unit\b/g, 'Unit barcode'],
  [/\bTTU Unit\b/g, 'Unit TTU'],
  [/\bContactless IC Card unit\b/gi, 'Unit contactless IC card'],
  [/\bUncompleted initial setting\b/gi, 'pengaturan awal belum selesai'],
  [/\bInitial settings\b/gi, 'pengaturan awal'],
  [/\bInitial setting\b/gi, 'pengaturan awal'],
  [/\binitial setting\b/gi, 'pengaturan awal'],
  [/\bHardware defect\b/gi, 'kerusakan hardware'],
  [/\bFile defect\b/gi, 'kerusakan file'],
  [/\bProgram kesalahan\b/gi, 'kesalahan program'],
  [/\bHardware kesalahan\b/gi, 'kesalahan hardware'],
  [/\bFile kesalahan\b/gi, 'kesalahan file'],
  [/\bUser operation kesalahan\b/gi, 'kesalahan operasi user'],
  [/\bAcceptance status kesalahan\b/gi, 'kesalahan status penerimaan'],
  [/\bTarget kesalahan\b/gi, 'kesalahan target'],
  [/\bOther kesalahan\b/gi, 'kesalahan lain'],
  [/\bIllegal interface\b/gi, 'interface tidak valid'],
  [/\bAlien substance detection\b/gi, 'terdeteksi benda asing'],
  [/\bPIN sensor, alien substance detection\b/gi, 'sensor PIN mendeteksi benda asing'],
  [/\bPIN sensor, terdeteksi benda asing\b/gi, 'sensor PIN mendeteksi benda asing'],
  [/\bAnti Removal Detection\b/gi, 'deteksi anti removal'],
  [/\bTamper Detection\b/gi, 'deteksi tamper'],
  [/\bDetect on PINPAD anti removal\b/gi, 'PINPAD mendeteksi anti removal'],
  [/\bDetect on PINPAD tamper\b/gi, 'PINPAD mendeteksi tamper'],
  [/\bDetect on multi touch\b/gi, 'terdeteksi multi-touch'],
  [/\bMemory acquisition failed\b/gi, 'gagal mengambil data memory'],
  [/\bAcquisition of INI file path failed\b/gi, 'gagal mengambil path file INI'],
  [/\bDLL startup failed\b/gi, 'startup DLL gagal'],
  [/\bDLL loading\b/gi, 'loading DLL'],
  [/\bfunction address retrieving\b/gi, 'pengambilan alamat fungsi'],
  [/\bStatus acquisition\b/gi, 'pengambilan status'],
  [/\bAccess log file creation gangguan\b/gi, 'gangguan pembuatan file access log'],
  [/\bAccess log file Write kesalahan\b/gi, 'kesalahan penulisan file access log'],
  [/\bNonvolatile Reading gangguan\b/gi, 'gangguan pembacaan nonvolatile'],
  [/\bIOMC command timeout\b/gi, 'timeout perintah IOMC'],
  [/\bIOMC command kesalahan\b/gi, 'kesalahan perintah IOMC'],
  [/\bIOMC with abnormal end\b/gi, 'IOMC berakhir abnormal'],
  [/\bPDL retry exceeded\b/gi, 'retry PDL melebihi batas'],
  [/\bNo PDL file\b/gi, 'file PDL tidak ada'],
  [/\bnote jam\b/gi, 'uang tersangkut'],
  [/\bnotes jam\b/gi, 'uang tersangkut'],
  [/\bbanknote jam\b/gi, 'uang tersangkut'],
  [/\bcash jam\b/gi, 'uang tersangkut'],
  [/\bEnd user Detection\b/g, 'deteksi end user'],
  [/\bIn use Lamp Control\b/g, 'kontrol lampu in-use'],
  [/\bFlicker Control\b/g, 'kontrol flicker'],
  [/\bFixed key Input specification\b/g, 'spesifikasi input fixed key'],
  [/\bStatus display Lamp Control\b/g, 'kontrol lampu tampilan status'],
  [/\bBacklight Control\b/g, 'kontrol backlight'],
  [/\bData Read\b/g, 'baca data'],
  [/\bDatawrite\b/g, 'tulis data'],
  [/\bLog Get\b/g, 'ambil log'],
  [/\bPower gangguan detection flag Control\b/gi, 'kontrol flag deteksi gangguan power'],
  [/\bTimer watch information Acquisition\b/g, 'ambil informasi timer watch'],
  [/\bTimer watch information Setting\b/g, 'atur informasi timer watch'],
  [/\bTemperature sensor Read\b/g, 'baca sensor suhu'],
  [/\bEnvironment sensor Read\b/g, 'baca sensor lingkungan'],
  [/\bOPL\/SPL Status Acquisition\b/g, 'ambil status OPL/SPL'],
  [/\bUSB VBUS ON\/OFF Control\b/g, 'kontrol ON/OFF USB VBUS'],
  [/\bperangkat Reset Control\b/g, 'kontrol reset perangkat'],
  [/\bperangkat Power ON\/OFF Control\b/g, 'kontrol power ON/OFF perangkat'],
  [/\bFan Control\b/g, 'kontrol fan'],
  [/\bFan Rotational speed Acquisition\b/g, 'ambil kecepatan putar fan'],
  [/\bSerial No\. Write\b/g, 'tulis serial number'],
  [/\bSerial No\. Read\b/g, 'baca serial number'],
  [/\bFlash ROM Write\b/g, 'tulis Flash ROM'],
  [/\bFlash ROM Clear\b/g, 'hapus Flash ROM'],
  [/\bFlash ROM Read\b/g, 'baca Flash ROM'],
  [/\bBoot up completed Notification\b/g, 'notifikasi boot selesai'],
  [/\bShut down start Notification\b/g, 'notifikasi mulai shutdown'],
  [/\bRe-boot start Notification\b/g, 'notifikasi mulai reboot'],
  [/\bWatch time-out flag Acquisition\b/g, 'ambil flag timeout watch'],
  [/\bAlive watch Refreshing\b/g, 'refresh alive watch'],
  [/\bPS information Acquisition\b/g, 'ambil informasi PS'],
  [/\bJournal data Acquisition\b/g, 'ambil data journal'],
  [/\bOperation Panel\b/g, 'panel operasi'],
  [/\boperation kesalahan\b/gi, 'kesalahan operasi'],
  [/\bWrite kesalahan\b/gi, 'kesalahan penulisan'],
  [/\bReading gangguan\b/gi, 'gangguan pembacaan'],
  [/\bRead\b/g, 'baca'],
  [/\bWrite\b/g, 'tulis'],
  [/\bSetting\b/g, 'pengaturan'],
  [/\bAcquisition\b/g, 'pengambilan'],
  [/\bNotification\b/g, 'notifikasi'],
  [/\bDetection\b/g, 'deteksi'],
  [/\bControl\b/g, 'kontrol'],
  [/\bReset\b/g, 'reset'],
  [/\bpower kabel\b/gi, 'kabel power'],
  [/\bUSB connectors and kabel\b/gi, 'konektor dan kabel USB'],
  [/\bConnectors and kabel\b/gi, 'konektor dan kabel'],
  [/\bmodul control board\b/gi, 'modul control board'],
  [/\bfirmware of contactless IC Card DLL\b/gi, 'firmware pada contactless IC Card DLL'],
  [/\bof contactless IC Card DLL\b/gi, 'pada contactless IC Card DLL'],
  [/\bGangguan of VHUSB\b/gi, 'gangguan VHUSB']
];

function normalizeTechnicalText(value) {
  let text = String(value || '').replace(/[ \t]+/g, ' ').trim();

  NORMALIZATION_RULES.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });

  return text
    .replace(/\bcontroller utama\b/g, 'Controller utama')
    .replace(/^IOMC kesalahan format perintah\((.+)\)$/i, 'Kesalahan format perintah IOMC ($1)')
    .replace(/^IOMC kesalahan prosedur penerbitan perintah\((.+)\)$/i, 'Kesalahan prosedur penerbitan perintah IOMC ($1)')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+/g, '(')
    .replace(/ +\n/g, '\n')
    .replace(/^([a-z])/, (match) => match.toUpperCase())
    .trim();
}

function normalizeHumanText(value) {
  return String(value || '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
}

function compactCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9X]/g, '');
}

function staticPrefix(value) {
  return String(value || '').replace(/X+$/i, '').toUpperCase();
}

function firebaseKey(value, fallback) {
  const key = String(value || fallback).replace(/[.#$/[\]]/g, '_');
  return key || String(fallback);
}

function parseRecordText(text) {
  const fields = {};
  const labels = {
    'error code': 'error_code',
    'kode kesalahan': 'error_code',
    'operator cause': 'operator_cause',
    'masalah': 'operator_cause',
    'operator recovery': 'operator_recovery',
    'tindakan operator': 'operator_recovery',
    'service cause': 'service_cause',
    'diagnosis teknisi': 'service_cause',
    'service recovery': 'service_recovery',
    'pemeriksaan awal teknisi': 'service_recovery',
    'all service recovery': 'service_recovery_all',
    'urutan pemeriksaan teknisi': 'service_recovery_all'
  };
  let currentKey = '';

  String(text || '').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    const label = match ? match[1].trim().toLowerCase() : '';
    const key = labels[label];

    if (key) {
      currentKey = key;
      fields[key] = match[2].trim();
      return;
    }

    if (currentKey && line.trim()) {
      fields[currentKey] = `${fields[currentKey]}\n${line.trim()}`;
    }
  });

  return fields;
}

function jsonlEntryToRecord(entry, index) {
  const metadata = entry.metadata || {};
  const fields = parseRecordText(entry.text);
  const usesHumanLabels = /(?:^|\n)(Masalah|Tindakan operator|Diagnosis teknisi|Pemeriksaan awal teknisi):/i.test(String(entry.text || ''));
  const cleanText = usesHumanLabels ? normalizeHumanText : normalizeTechnicalText;
  const code = String(metadata.error_code_pattern || fields.error_code || '').toUpperCase();
  const prefix = String(metadata.pattern_static_prefix || staticPrefix(code)).toUpperCase();
  const recordId = metadata.record_id ?? index;

  return {
    record_id: recordId,
    source_record_id: entry.id || recordId,
    error_code_pattern: code,
    is_pattern: metadata.is_pattern ?? code.includes('X'),
    pattern_static_prefix: prefix,
    prefix_length: metadata.prefix_length ?? compactCode(prefix).length,
    service_recovery_count: metadata.service_recovery_count ?? 0,
    errguid_record_ids: metadata.errguid_record_ids || '',
        operator_cause: cleanText(fields.operator_cause),
        operator_recovery: cleanText(fields.operator_recovery),
        service_cause: cleanText(fields.service_cause),
        service_recovery: cleanText(fields.service_recovery),
        service_recovery_all: cleanText(fields.service_recovery_all || fields.service_recovery)
  };
}

function buildPayload() {
  const content = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
  const payload = {};
  let invalidRows = 0;

  content.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      const entry = JSON.parse(trimmed);
      const record = jsonlEntryToRecord(entry, index);
      if (record.error_code_pattern) {
        payload[firebaseKey(entry.id, `error_code_${index}`)] = record;
      }
    } catch (error) {
      invalidRows += 1;
      console.warn(`Skipped invalid JSONL row ${index + 1}: ${error.message}`);
    }
  });

  return { payload, invalidRows };
}

async function main() {
  const { payload, invalidRows } = buildPayload();
  const records = Object.values(payload);
  const exactCount = records.filter((record) => !record.is_pattern).length;
  const patternCount = records.length - exactCount;

  console.log(JSON.stringify({
    input: path.relative(rootDir, inputPath),
    records: records.length,
    exactCount,
    patternCount,
    invalidRows,
    target: `${DATABASE_URL}/error_codes`,
    mode: shouldWrite ? (shouldPatch ? 'patch' : 'replace') : (shouldPatch ? 'dry-run patch' : 'dry-run replace')
  }, null, 2));

  console.log(JSON.stringify({
    samples: SAMPLE_KEYS
      .filter((key) => payload[key])
      .map((key) => ({
        key,
        code: payload[key].error_code_pattern,
        operator_cause: payload[key].operator_cause,
        operator_recovery: payload[key].operator_recovery,
        service_cause: payload[key].service_cause
      }))
  }, null, 2));

  if (!records.length) {
    throw new Error('Tidak ada record valid untuk diimport.');
  }

  if (!shouldWrite) {
    console.log(`Dry-run selesai. Jalankan lagi dengan --write${shouldPatch ? ' --patch' : ''} untuk menulis database.`);
    return;
  }

  if (!shouldPatch && records.length < 1000 && !allowSmallReplace) {
    throw new Error('Dataset kecil terdeteksi. Gunakan --patch untuk update sebagian, atau --allow-small-replace jika memang ingin replace penuh.');
  }

  const response = await fetch(`${DATABASE_URL}/error_codes.json`, {
    method: shouldPatch ? 'PATCH' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firebase write failed: ${response.status} ${body}`);
  }

  console.log(`Firebase error_codes berhasil ${shouldPatch ? 'diupdate sebagian' : 'direplace'}.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
