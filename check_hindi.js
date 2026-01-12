
const fs = require('fs');

const content = fs.readFileSync('src/ai/flows/translate-page-content.ts', 'utf8');

// Extract the tamil object using regex to avoid compiling the whole TS file
const tamilMatch = content.match(/tamil:\s*{([\s\S]*?)\n\s*}/);

if (!tamilMatch) {
    console.log('Could not find tamil section');
    process.exit(1);
}

const tamilSection = tamilMatch[1];
const lines = tamilSection.split('\n');

console.log('Checking Tamil section for Hindi characters...');

const devanagariRegex = /[\u0900-\u097F]/;

let found = false;
lines.forEach((line, index) => {
    if (devanagariRegex.test(line)) {
        console.log(`Found Hindi at line ${index + 1} of Tamil section: ${line.trim()}`);
        found = true;
    }
});

if (!found) {
    console.log('No Hindi characters found in Tamil section.');
}
