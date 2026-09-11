const fs = require('fs');
const readline = require('readline');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';
const outputFile = 'f:\\EPS\\data\\error_codes_fixed.jsonl';

function fixText(text) {
    if (!text) return text;
    
    // 1. Kata sambung / preposisi Inggris
    text = text.replace(/\bby\b/g, 'oleh');
    text = text.replace(/\banother\s+([A-Za-z0-9_]+)/g, '$1 yang lain');
    text = text.replace(/\bwaiting\b/g, 'menunggu');
    text = text.replace(/\bnot\b/g, 'tidak');
    text = text.replace(/different dari/g, 'berbeda dari');
    text = text.replace(/Dispense only/g, 'Hanya Dispense');
    text = text.replace(/Deposit only/g, 'Hanya Deposit');
    
    // 2. Susunan kata terbalik (Hukum DM)
    // [Kata] kesalahan -> Kesalahan [Kata] (misal: Data kesalahan, CAM kesalahan, Image kesalahan)
    text = text.replace(/\b([A-Za-z0-9]+)\s+kesalahan\b/gi, 'Kesalahan $1');
    text = text.replace(/Pulse motor Kesalahan/gi, 'Kesalahan Pulse motor');
    text = text.replace(/halt Kesalahan/gi, 'Kesalahan halt');
    text = text.replace(/tahap Kesalahan/gi, 'Kesalahan tahap');
    
    // [Kata] motor penggerak -> motor penggerak [Kata]
    text = text.replace(/\b([A-Za-z0-9_-]+)\s+motor penggerak\b/g, 'motor penggerak $1');
    
    // [Kata] sensor fault -> gangguan sensor [Kata]
    text = text.replace(/\b([A-Za-z0-9_-]+)\s+sensor fault\b/g, 'gangguan sensor $1');
    text = text.replace(/\b([A-Za-z0-9_-]+)\s+sensor\s+fault\b/g, 'gangguan sensor $1');
    
    // 3. Konteks Medis/Teknis yang salah
    text = text.replace(/mendeteksi lampu/g, 'mendeteksi cahaya');
    text = text.replace(/di front pada/g, 'di depan');
    text = text.replace(/waktu-out/g, 'waktu habis');
    text = text.replace(/waktu- out/g, 'waktu habis');
    
    // Menghapus 's (kepemilikan) yang terbalik, misal: rol's tahap -> tahap rol
    text = text.replace(/\b([A-Za-z0-9_]+)'s\s+([A-Za-z0-9_]+)\b/g, '$2 $1');
    
    // 4. Istilah Teknis yang belum konsisten
    text = text.replace(/pressure plate/g, 'pelat penekan');
    text = text.replace(/pelat pendorong/g, 'pelat penekan');
    text = text.replace(/Transportation path/g, 'jalur pemindahan');
    text = text.replace(/\bfault\b/g, 'gangguan');
    
    // Perbaikan posisi
    text = text.replace(/Dispensing posisi/g, 'posisi Dispensing');
    text = text.replace(/Deposit posisi/g, 'posisi Deposit');
    
    // Perbaikan rol
    text = text.replace(/pengumpan rol/g, 'rol pengumpan');
    text = text.replace(/pengumpanan rol/g, 'rol pengumpan');
    text = text.replace(/Pick up rol/g, 'rol penarik');
    
    return text;
}

async function processFile() {
    console.log("Memulai proses perbaikan terjemahan...");
    
    const fileStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let processed = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;
        
        try {
            const data = JSON.parse(line);
            if (data.text) {
                data.text = fixText(data.text);
            }
            writeStream.write(JSON.stringify(data) + '\n');
            processed++;
        } catch (err) {
            console.error("Error parsing JSON at line:", processed + 1, err);
        }
    }
    
    writeStream.end();
    console.log(`Selesai! ${processed} baris telah diperbaiki dan disimpan ke ${outputFile}`);
}

processFile().catch(console.error);
