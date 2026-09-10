const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const inputPath = path.join(rootDir, 'data', 'error_codes_learning_id_final1.jsonl');
const outputPath = path.join(rootDir, 'data', 'error_codes_learning_id_final2.jsonl');

const replacements = [
  [/\bProgram logical kesalahan\b/g, 'program mengalami kesalahan logika'],
  [/\blogical kesalahan\b/g, 'kesalahan logika'],
  [/\bMain controller kerusakan perangkat keras\b/g, 'Kerusakan perangkat keras pada pengendali utama'],
  [/\bMain controller\b/g, 'pengendali utama'],
  [/\bPerangkat lunak kontrol kesalahan\./g, 'Kesalahan kontrol perangkat lunak.'],
  [/\bIOMC perintah format kesalahan\(([^)]+)\)/g, 'Kesalahan format perintah IOMC ($1)'],
  [/\bIOMC perintah timeout\b/g, 'Timeout perintah IOMC'],
  [/\bIOMC kesalahan perangkat keras\b/g, 'Kesalahan perangkat keras IOMC'],
  [/\bRange kesalahan\(([^)]+)\)/g, 'Kesalahan range ($1)'],
  [/\bErase kesalahan\(([^)]+)\)/g, 'Kesalahan erase ($1)'],
  [/\bRegistration\b/g, 'registrasi'],
  [/\bDeletion\b/g, 'penghapusan'],
  [/\bCash modul gangguan\b/g, 'Gangguan modul cash'],
  [/\bUR kesalahan program\b/g, 'Kesalahan program UR'],
  [/\bBV kesalahan program\b/g, 'Kesalahan program BV'],
  [/\bATM-PC kesalahan program\b/g, 'Kesalahan program ATM-PC'],
  [/\bPengoperasian mistake\b/g, 'Kesalahan pengoperasian'],
  [/\bWrong directive untuk pengoperasian\b/g, 'Instruksi pengoperasian salah'],
  [/\bdaya gangguan pendeteksian flag kontrol\b/g, 'kontrol flag deteksi gangguan daya'],
  [/\bdi use Lamp kontrol\b/g, 'kontrol lampu in-use'],
  [/\bWide use I\/O output\b/g, 'output I/O wide-use'],
  [/\bFixed key Input specification\b/g, 'spesifikasi input fixed key'],

  [/\bPemindahan Jam\b/g, 'Uang kertas tersangkut di jalur pemindahan'],
  [/\buang kertas yang tersangkut at atas pemindahan\/bawah pemindahan\b/g, 'uang kertas yang tersangkut dari jalur pemindahan atas/bawah'],
  [/\batas pemindahan\/bawah pemindahan\b/g, 'jalur pemindahan atas/bawah'],
  [/\bat atas pemindahan\/bawah pemindahan\b/g, 'dari jalur pemindahan atas/bawah'],
  [/\bTransportation periksa kesalahan total number pada uang kertas fed dari ([A-Za-z0-9 /-]+?) tidak agree dengan that pada uang kertas stacked untuk ([A-Za-z0-9 /-]+?)\./g, 'Kesalahan pemeriksaan jalur pemindahan. Jumlah uang kertas yang dikirim dari $1 tidak sesuai dengan jumlah uang kertas yang tertumpuk pada $2.'],
  [/\bTransportation periksa kesalahan total number pada uang kertas fed dari ([A-Za-z0-9 /-]+?) tidak agree dengan that pada uang kertas stacked\./g, 'Kesalahan pemeriksaan jalur pemindahan. Jumlah uang kertas yang dikirim dari $1 tidak sesuai dengan jumlah uang kertas yang tertumpuk.'],
  [/\bTransportation periksa kesalahan Passing unknown denomination Note terdeteksi by BV dan it directed untuk transportation untuk CS but there no note di CS\./g, 'Kesalahan pemeriksaan jalur pemindahan. BV mendeteksi uang kertas dengan denominasi tidak dikenal dan diarahkan ke CS, tetapi tidak ada uang kertas di CS.'],
  [/\bTransportation periksa kesalahan\b/g, 'Kesalahan pemeriksaan jalur pemindahan'],
  [/\bNo uang kertas exist di CS setidaknya salah satu dari S113, S114 dan S115 mendeteksi terhalang dengan checking them setelah normal completion pada pengumpanan action di Cash Count, so "proses setelah pengumpanan" di CS implemented setelah Trasnsportation Motor OFF dan then, all following sensor mendeteksi lampu setelah checking if there are uang kertas di CS atau not\./g, 'Tidak ada uang kertas di CS. Setidaknya salah satu sensor S113, S114, atau S115 mendeteksi kondisi terhalang setelah proses pengumpanan Cash Count selesai normal. Setelah motor pemindahan berhenti, proses setelah pengumpanan di CS dijalankan dan sensor berikutnya diperiksa.'],
  [/\bNo uang kertas exist di CS ([A-Z0-9, ]+)\./g, 'Tidak ada uang kertas di CS: $1.'],
  [/\bDisagreement di number pada uang kertas order pada uang kertas transported by Cash Count perintah inconsistent dengan that pada uang kertas transported by Stor Money perintah\./g, 'Jumlah urutan uang kertas pada perintah Cash Count tidak sesuai dengan jumlah uang kertas pada perintah Store Money.'],
  [/\bDisagreement di number pada uang kertas Although pengoperasian untuk Dispense successfully completed selama executing "Dispense" perintah, total number pada Dispense uang kertas specified by ATM-PC tidak agree dengan that pada uang kertas stacked untuk CS\./g, 'Jumlah uang kertas tidak sesuai. Walaupun proses dispense selesai, jumlah uang kertas dispense yang ditentukan ATM-PC tidak sesuai dengan jumlah uang kertas yang tertumpuk pada CS.'],
  [/\bNumber pada deposit uang kertas counted disagrees untuk that pada deposit uang kertas stored\./g, 'Jumlah uang kertas deposit yang dihitung tidak sesuai dengan jumlah uang kertas deposit yang tersimpan.'],
  [/\bNumber pada fed uang kertas\./g, 'Jumlah uang kertas yang dikirim.'],
  [/\bNumber pada stacked uang kertas\./g, 'Jumlah uang kertas yang tertumpuk.'],
  [/\bWithout Reject uang kertas\b/g, 'Tanpa uang kertas reject'],
  [/\bdengan Reject uang kertas\b/g, 'dengan uang kertas reject'],
  [/\bDefective uang kertas \(Holes, Folded, Tears\)/g, 'Uang kertas rusak (berlubang, terlipat, sobek)'],
  [/\bDefective uang kertas \(Holes, Tears\)/g, 'Uang kertas rusak (berlubang atau sobek)'],
  [/\bDefective uang kertas \(Folded, Tears\)/g, 'Uang kertas rusak (terlipat atau sobek)'],
  [/\bDefective uang kertas \(Holes, Folded\)/g, 'Uang kertas rusak (berlubang atau terlipat)'],
  [/\bDefective uang kertas\b/g, 'Uang kertas rusak'],
  [/\bHoles\b/g, 'berlubang'],
  [/\bFolded\b/g, 'terlipat'],
  [/\bTears\b/g, 'sobek'],
  [/\bSoiled sensor\/benda asing\(Paper dust, Paper money band\)/g, 'Sensor kotor atau ada benda asing (debu kertas, pita uang kertas)'],
  [/\bSoiled sensor\/benda asing\b/g, 'Sensor kotor atau ada benda asing'],
  [/\bUnexpected transportation\./g, 'Pemindahan uang kertas tidak terduga.'],
  [/\bUnexpected transportation\b/g, 'Pemindahan uang kertas tidak terduga'],
  [/\bon transportation path\b/g, 'di jalur pemindahan'],
  [/\bthere no note di CS\b/g, 'tidak ada uang kertas di CS'],
  [/\bUang kertas might be stacked di kaset ([0-9]+)\./g, 'Uang kertas mungkin tertumpuk di kaset $1.'],
  [/\bUang kertas might be stacked di ([A-Za-z0-9 /-]+)\./g, 'Uang kertas mungkin tertumpuk di $1.'],
  [/\bTransportation belt unfastened\/broken\./g, 'Sabuk pemindahan kendur atau putus.'],
  [/\bTransportation belt\b/g, 'sabuk pemindahan'],
  [/\bunfastened\b/g, 'kendur'],
  [/\bbroken\b/g, 'putus'],
  [/\binterfusion\b/g, 'masuk'],
  [/\bBenda asing masuk\b/g, 'Ada benda asing masuk'],
  [/\bpresence sensor\b/g, 'sensor keberadaan'],
  [/\bwaiting terhalang\b/g, 'menunggu kondisi terhalang'],
  [/\bat CS tahap sensor\b/g, 'pada sensor tahap CS'],
  [/\bdi proses untuk pengiriman back\b/g, 'pada proses pengiriman balik'],
  [/\bGate rol's tahap\b/g, 'tahap gate rol'],
  [/\bDriving gear untuk pengumpan rol\b/g, 'gear penggerak pengumpan rol'],
  [/\bDriving gear untuk ([^".]+)\b/g, 'gear penggerak $1'],
  [/\bdriving gear\b/gi, 'gear penggerak'],
  [/\bMaladjustment\b/g, 'kesalahan penyetelan'],
  [/\bSoiling\b/g, 'kotor'],

  [/\bPIN sensor, alien substance pendeteksian\b/g, 'Sensor PIN mendeteksi benda asing'],
  [/\bAlien substance pendeteksian\b/g, 'Deteksi benda asing'],
  [/\bTake out an alien substance, dan Atur ulang \(reset\) it\./g, 'Singkirkan benda asing, lalu reset perangkat.'],

  [/\bPasswoed input type not supported\./g, 'Tipe input password tidak didukung.'],
  [/\bPassword input type not supported\./g, 'Tipe input password tidak didukung.'],
  [/\bSelect correct password type\./g, 'Pilih tipe password yang benar.'],
  [/\bnot supported\b/g, 'tidak didukung'],
  [/\bnot support\b/g, 'tidak didukung'],
  [/\bNo response ketika ([a-zA-Z-]+)\./g, 'Tidak ada respons saat proses $1.'],
  [/\bReceive Non-([a-zA-Z-]+) response ketika ([a-zA-Z-]+)\./g, 'Menerima respons non-$1 saat proses $2.'],
  [/\bReceive Non-([a-zA-Z-]+) response\b/g, 'Menerima respons non-$1'],
  [/\bEnvironment gangguan\b/g, 'gangguan environment'],
  [/\bCoin Unit perangkat gangguan\b/g, 'Gangguan perangkat Coin Unit'],
  [/\bCoin Unit gangguan environment\b/g, 'Gangguan environment Coin Unit'],
  [/\bCoin unit tidak didukung\./gi, 'Coin unit tidak didukung.'],
  [/\bAPI DLL load kesalahan\./g, 'Kesalahan saat memuat API DLL.'],
  [/\bFunction address pada API DLL load kesalahan\./g, 'Kesalahan alamat fungsi saat memuat API DLL.'],
  [/\bPath pada API DLL kesalahan\./g, 'Kesalahan path pada API DLL.'],
  [/\bNon-Volatile file kesalahan\./g, 'Kesalahan file non-volatile.'],
  [/\bDaya off\/on gangguan\./g, 'Gangguan saat power off/on.'],

  [/\bData abnormal\. Data out pada specification terdeteksi\./g, 'Data abnormal. Terdeteksi data di luar spesifikasi.'],
  [/\bHidupkan kembali perangkat\.If there still a problem, Hubungi serviceman\./g, 'Hidupkan kembali perangkat. Jika masalah masih terjadi, hubungi petugas pemeliharaan.'],
  [/\bIf there still a problem, please call a pemeliharaan petugas\./g, 'Jika masalah masih terjadi, hubungi petugas pemeliharaan.'],
  [/\bIf there still a problem, Hubungi serviceman\./g, 'Jika masalah masih terjadi, hubungi petugas pemeliharaan.'],
  [/\bCall a pemeliharaan petugas\./g, 'Hubungi petugas pemeliharaan.'],
  [/\bcall a pemeliharaan petugas\b/gi, 'hubungi petugas pemeliharaan'],
  [/\bMenerima a perintah untuk activate mechanism saat receiving print data\./g, 'Menerima perintah untuk mengaktifkan mekanisme saat menerima data cetak.'],
  [/\bMenerima a perintah other than CR \+ LF atau CR \+ multiple line pengumpan\./g, 'Menerima perintah selain CR + LF atau CR + beberapa line feed.'],
  [/\bMenerima a perintah ketika printer can not accept any commands\./g, 'Menerima perintah saat printer tidak dapat menerima perintah.'],
  [/\bMenerima a perintah\b/g, 'Menerima perintah'],
  [/\bmenerima a perintah\b/g, 'menerima perintah'],
  [/\bPeriksa that USB connecting USB konektor on RX906\./g, 'Periksa koneksi USB pada konektor USB RX906.'],
  [/\bPeriksa that ([A-Z0-9]+) konektor on RX906 correctly connected\./g, 'Periksa apakah konektor $1 pada RX906 terpasang dengan benar.'],
  [/\bPeriksa that\b/g, 'Periksa apakah'],
  [/\bExtract antarmuka konektor dan plug di kembali\./g, 'Lepas konektor antarmuka, lalu pasang kembali.'],
  [/\bExtract ([A-Z0-9]+) konektor once dan plug di kembali\./g, 'Lepas konektor $1 sekali, lalu pasang kembali.'],
  [/\bplug di kembali\b/g, 'pasang kembali'],
  [/\bConnect ([A-Z0-9]+) konektor on RX906\./g, 'Sambungkan konektor $1 pada RX906.'],
  [/\bClean magnetic head\./g, 'Bersihkan magnetic head.'],
  [/\bClean print head home posisi sensor\./g, 'Bersihkan sensor posisi home print head.'],
  [/\bReadjust carrier belt tension\./g, 'Setel ulang tegangan carrier belt.'],
  [/\bPeriksa dan readjust parallelism pada support rail\./g, 'Periksa dan setel ulang kesejajaran support rail.'],
  [/\bPeriksa untuk no damage on support rail\./g, 'Periksa apakah support rail tidak rusak.'],
  [/\bPR head motor gagal untuk work\. PR head motor out pada order\./g, 'Motor PR head gagal bekerja. Motor PR head bermasalah.'],
  [/\bMS read\/write function gagal untuk work\. MS read\/write kesalahan\./g, 'Fungsi baca/tulis MS gagal bekerja. Terjadi kesalahan baca/tulis MS.'],
  [/\bData read dari magnetic stripe are 15 bit long atau less\./g, 'Data yang dibaca dari magnetic stripe memiliki panjang 15 bit atau kurang.'],
  [/\bData read dari magnetic stripe 15 bit long atau less di read-setelah-write periksa\./g, 'Data yang dibaca dari magnetic stripe memiliki panjang 15 bit atau kurang pada pemeriksaan baca-setelah-tulis.'],
  [/\bInsert proper medium di correct direction dan operate machine kembali\./g, 'Masukkan media yang sesuai dengan arah yang benar, lalu operasikan mesin kembali.'],
  [/\bSakelar off ATM daya\./g, 'Matikan daya ATM.'],
  [/\bSakelar on ATM daya\./g, 'Hidupkan daya ATM.'],
  [/\bgagal untuk work\b/g, 'gagal bekerja'],
  [/\bout pada order\b/g, 'bermasalah'],
  [/\bout pada adjustment\b/g, 'perlu penyetelan'],
  [/\bproperly\.See instruksi on\b/g, 'dengan benar. Lihat instruksi di'],
  [/\bA passbook gagal untuk pemindahan dengan benar\b/g, 'Passbook gagal dipindahkan dengan benar'],
  [/\bKeluarkan a passbook dan try untuk re-mulai, still persists an kesalahan, please hubungi petugas pemeliharaan\b/g, 'Keluarkan passbook lalu coba mulai ulang. Jika kesalahan masih terjadi, hubungi petugas pemeliharaan'],
  [/\bPaper ejection kesalahan\b/g, 'Kesalahan pengeluaran kertas'],
  [/\bPaper yang tertinggal kesalahan setelah prescribed ejection\b/g, 'Kesalahan kertas tertinggal setelah proses pengeluaran yang ditentukan'],
  [/\bRe-adjust ([A-Z0-9]+) dan ([A-Z0-9]+) sensor\./g, 'Setel ulang sensor $1 dan $2.'],
  [/\bClean ([A-Z0-9]+) atau ([A-Z0-9]+) sensor\./g, 'Bersihkan sensor $1 atau $2.'],
  [/\bClean page turning rollers\./g, 'Bersihkan roller page turning.'],
  [/\bAdjust page turning rol gap\./g, 'Setel celah rol page turning.'],
  [/\bAdjust page turning posisi\./g, 'Setel posisi page turning.'],
  [/\bIf sensor are wrong themselves, ganti them\./g, 'Jika sensor bermasalah, ganti sensor tersebut.'],
  [/\bTurning-over height could not be terdeteksi rightly di page turning-over pengoperasian\./g, 'Ketinggian pembalikan halaman tidak terdeteksi dengan benar saat operasi page turning.'],
  [/\bS([0-9]+) signal tidak come OFF although page turn motor di home posisi\./g, 'Sinyal S$1 tidak OFF walaupun motor page turn berada di posisi home.'],
  [/\bS([0-9]+) atau S([0-9]+) found passbook\./g, 'Sensor S$1 atau S$2 mendeteksi passbook.'],
  [/\bSensor gagal bekerja\. sensor bermasalah\./g, 'Sensor gagal bekerja. Sensor bermasalah.'],
  [/\bpendeteksian sensor terhalang periksa kesalahan selama powering up atau initializing\b/g, 'kesalahan pemeriksaan sensor terhalang saat power up atau inisialisasi'],
  [/\bperintah dengan an unspecified urutan proses\b/g, 'perintah dengan urutan proses yang tidak ditentukan'],
  [/\bwhich cannot be diterima without normal completion pada Reset perintah\b/g, 'yang tidak dapat diterima sebelum perintah Reset selesai normal'],
  [/\bwhich improper untuk status pada UR\b/g, 'yang tidak sesuai dengan status UR'],
  [/\bhigh-order byte di diterima perintah code this waktu\b/g, 'byte high-order dari kode perintah yang diterima saat ini'],
  [/\bhigh-order one byte di last diterima perintah code\b/g, 'satu byte high-order dari kode perintah terakhir yang diterima'],
  [/\bmeans initial status\b/g, 'berarti status awal'],
  [/\bmeans kesalahan status\b/g, 'berarti status kesalahan'],

  [/\bLoad kesalahan\b/g, 'kesalahan load'],
  [/\bFunction address\b/g, 'alamat fungsi'],
  [/\bCommunication port\b/g, 'port komunikasi'],
  [/\bSequence kesalahan\b/g, 'kesalahan urutan proses'],
  [/\bperangkat gangguan\b/g, 'gangguan perangkat'],
  [/\bPapan kontrol\b/g, 'papan kontrol'],
  [/\bSensor dan papan kontrol\b/g, 'sensor dan papan kontrol'],
  [/\bSensor dan Papan kontrol\b/g, 'sensor dan papan kontrol'],
  [/\bMotor dan Papan kontrol\b/g, 'motor dan papan kontrol'],
  [/\bCE papan kontrol\b/g, 'papan kontrol CE'],
  [/\bDE papan kontrol\b/g, 'papan kontrol DE'],
  [/\bTRAY antarmuka papan kontrol\b/g, 'papan kontrol antarmuka TRAY'],
  [/\bKaset papan kontrol\b/g, 'papan kontrol kaset'],
  [/\bCS papan kontrol\b/g, 'papan kontrol CS'],
  [/\bCassette([0-9]+) unit\b/g, 'unit kaset $1'],
  [/\bKaset unit\b/g, 'unit kaset'],
  [/\bUnit CS\b/g, 'unit CS'],
  [/\bUTR unit\b/g, 'unit UTR'],
  [/\bESC unit\b/g, 'unit ESC'],
  [/\bUTF unit\b/g, 'unit UTF'],
  [/\bLT unit\b/g, 'unit LT'],
  [/\bJK unit\b/g, 'unit JK'],
  [/\bI\/F kabel assembly\b/g, 'rakitan kabel I/F'],
];

function normalizeText(text) {
  let value = String(text || '');

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  return value
    .replace(/\bkotor \/ benda asing \/\./g, 'kotor atau ada benda asing.')
    .replace(/\bkotor \/ benda asing \/ /g, 'kotor atau ada benda asing ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .replace(/ {2,}/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/\bMasalah: program/g, 'Masalah: Program')
    .replace(/\bDiagnosis teknisi: program/g, 'Diagnosis teknisi: Program')
    .trim();
}

const content = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
const output = [];
let changed = 0;
let invalidRows = 0;

content.split(/\r?\n/).forEach((line, index) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const entry = JSON.parse(trimmed);
    const before = entry.text;
    entry.text = normalizeText(entry.text);
    if (entry.text !== before) changed += 1;
    output.push(JSON.stringify(entry));
  } catch (error) {
    invalidRows += 1;
    throw new Error(`Invalid JSONL row ${index + 1}: ${error.message}`);
  }
});

fs.writeFileSync(outputPath, `${output.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  input: path.relative(rootDir, inputPath),
  output: path.relative(rootDir, outputPath),
  records: output.length,
  changed,
  invalidRows
}, null, 2));
