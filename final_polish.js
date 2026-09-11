const fs = require('fs');
const readline = require('readline');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';
const outputFile = 'f:\\EPS\\data\\error_codes_fixed3.jsonl';

function finalPolish(text) {
    if (!text) return text;
    
    // 1. Sisa kata Bahasa Inggris yang mengganggu (hybrid phrases)
    text = text.replace(/folded uang kertas di half/g, 'uang kertas terlipat menjadi dua');
    text = text.replace(/action halt/g, 'berhenti beroperasi');
    
    // 2. Redundansi susunan kalimat
    text = text.replace(/berhenti pelat penekan berhenti/g, 'pelat penekan berhenti');
    text = text.replace(/berhenti motor penggerak berhenti/g, 'motor penggerak berhenti');
    
    // 3. Sisa kosa kata navigasi & teknis dasar
    text = text.replace(/\bforward\b/gi, 'maju');
    text = text.replace(/\bbackward\b/gi, 'mundur');
    text = text.replace(/\bstage\b/gi, 'tahap');
    
    // 4. Memperbaiki sisa "Kesalahan Kode" jika masih ada yang terlewat
    text = text.replace(/Kesalahan Kode/g, 'Kode kesalahan');
    
    // 5. Kesalahan format yang tidak natural
    text = text.replace(/CAMERA Kesalahan Unit/gi, 'Kesalahan Unit KAMERA');
    
    return text;
}

async function processFile() {
    const fileStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let processed = 0;
    for await (const line of rl) {
        if (!line.trim()) continue;
        const data = JSON.parse(line);
        if (data.text) {
            data.text = finalPolish(data.text);
        }
        writeStream.write(JSON.stringify(data) + '\n');
        processed++;
    }
    
    writeStream.end();
}

processFile().then(() => console.log('Final polish done!')).catch(console.error);
