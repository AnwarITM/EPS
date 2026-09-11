const fs = require('fs');
const readline = require('readline');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';
const outputFile = 'f:\\EPS\\data\\error_codes_fixed2.jsonl';

function fixRegression(text) {
    if (!text) return text;
    // Fix over-replacements from previous script
    text = text.replace(/Kesalahan Kode/g, 'Kode kesalahan');
    text = text.replace(/Kesalahan mendeteksi/g, 'mendeteksi kesalahan');
    text = text.replace(/Kesalahan halt/gi, 'kesalahan halt'); // Usually part of a bigger sentence
    return text;
}

async function processFile() {
    const fileStream = fs.createReadStream(inputFile, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (!line.trim()) continue;
        const data = JSON.parse(line);
        if (data.text) {
            data.text = fixRegression(data.text);
        }
        writeStream.write(JSON.stringify(data) + '\n');
    }
    
    writeStream.end();
}

processFile().catch(console.error);
