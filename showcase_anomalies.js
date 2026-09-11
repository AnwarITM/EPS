const fs = require('fs');

const inputFile = 'f:\\EPS\\data\\error_codes.jsonl';

function finalShowcase() {
    const lines = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(Boolean);
    
    const targets = ["\\bhalf\\b"];
    let anomalies = [];

    for(const line of lines) {
        const text = JSON.parse(line).text;
        for (const target of targets) {
            const regex = new RegExp(target, 'i');
            if (regex.test(text)) {
                anomalies.push(text.substring(0, 150).replace(/\n/g, ' '));
                break;
            }
        }
    }
    
    console.log("=== SISA ANOMALI YANG DISENGAJA (19 Data) ===");
    anomalies.slice(0, 5).forEach(a => console.log(a));
    console.log("...");
}

finalShowcase();
