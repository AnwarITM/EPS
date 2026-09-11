const fs = require('fs');
const readline = require('readline');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';
const outputFile = 'f:\\EPS\\data\\error_codes_fixed4.jsonl';

function ultraPolish(text) {
    if (!text) return text;
    
    // 1. Kondisi error & fault
    text = text.replace(/kondisi error/gi, 'kondisi gangguan');
    text = text.replace(/dalam kondisi error/gi, 'dalam kondisi gangguan');
    text = text.replace(/\berror\b/gi, 'kesalahan');
    
    // 2. Bad conditioned & Half note
    text = text.replace(/Bad conditioned uang kertas/gi, 'Uang kertas dalam kondisi buruk');
    text = text.replace(/Bad conditioned/gi, 'Kondisi buruk');
    text = text.replace(/Half note/gi, 'Uang kertas sobek separuh');
    text = text.replace(/folded uang kertas di half/gi, 'uang kertas terlipat menjadi dua'); // Just in case
    
    // 3. Kata sisa halt, drive motor, soil
    text = text.replace(/\bhalt\b/gi, 'berhenti tiba-tiba');
    text = text.replace(/\bdrive motor\b/gi, 'motor penggerak');
    text = text.replace(/\bfailure\b/gi, 'kegagalan');
    text = text.replace(/\bsoil\b/gi, 'kotor');
    
    // Perbaikan kata depan yang berantakan karena terjemahan
    text = text.replace(/Kesalahan Kesalahan/g, 'Kesalahan');
    text = text.replace(/kesalahan Kesalahan/g, 'kesalahan');
    
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
            data.text = ultraPolish(data.text);
        }
        writeStream.write(JSON.stringify(data) + '\n');
        processed++;
    }
    
    writeStream.end();
}

processFile().then(() => console.log('Ultra polish done!')).catch(console.error);
