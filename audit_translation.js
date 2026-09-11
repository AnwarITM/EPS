const fs = require('fs');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';

function audit() {
    const lines = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(Boolean);
    
    console.log("=== SAMPEL ACAK (5 Data) ===");
    for(let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * lines.length);
        const data = JSON.parse(lines[idx]);
        console.log(`[Kode: ${data.metadata.error_code_pattern}]`);
        console.log(data.text.substring(0, 300) + "...\n");
    }

    console.log("=== PENGECEKAN ISTILAH (Jumlah Ditemukan) ===");
    let folded = 0, actionHalt = 0, stutter = 0, englishWords = 0;
    
    for(const line of lines) {
        const text = JSON.parse(line).text;
        if(text.includes('folded uang')) folded++;
        if(text.includes('action halt')) actionHalt++;
        if(text.includes('berhenti pelat penekan berhenti')) stutter++;
        if(text.match(/\b(half|forward|backward|stage)\b/i)) englishWords++;
    }
    
    console.log(`- 'folded uang kertas di half' : ${folded}`);
    console.log(`- 'action halt' : ${actionHalt}`);
    console.log(`- Redundansi 'berhenti pelat penekan berhenti' : ${stutter}`);
    console.log(`- Sisa kata 'half/forward/backward/stage' : ${englishWords}`);
}

audit();
