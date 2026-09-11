const fs = require('fs');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';

function deepAudit() {
    const lines = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(Boolean);
    
    console.log("=== SAMPEL ACAK (5 Data) ===");
    for(let i = 0; i < 5; i++) {
        const idx = Math.floor(Math.random() * lines.length);
        const data = JSON.parse(lines[idx]);
        console.log(`[Kode: ${data.metadata.error_code_pattern}]`);
        console.log(data.text.substring(0, 300) + "...\n");
    }

    console.log("=== PENCARIAN SISA BAHASA INGGRIS (Anomali) ===");
    
    const targets = [
        "\\bhalf\\b", "\\bforward\\b", "\\bbackward\\b", "\\bstage\\b", 
        "\\bhalt\\b", "\\bdrive motor\\b", "\\bfailure\\b", "\\berror\\b",
        "\\bsoil\\b"
    ];
    
    let anomalies = [];
    let count = 0;

    for(const line of lines) {
        const text = JSON.parse(line).text;
        
        for (const target of targets) {
            const regex = new RegExp(target, 'i');
            if (regex.test(text)) {
                count++;
                if (anomalies.length < 5) {
                    anomalies.push(`[${target}] -> ` + text.substring(0, 150).replace(/\n/g, ' '));
                }
                break;
            }
        }
    }
    
    console.log(`Total anomali yang masih tersisa: ${count}`);
    if (anomalies.length > 0) {
        console.log("Contoh kalimat yang masih mengandung anomali:");
        anomalies.forEach(a => console.log(a));
    }
}

deepAudit();
