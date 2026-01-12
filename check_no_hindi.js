
const fs = require('fs');
const path = require('path');

const devanagariRegex = /[\u0900-\u097F]/;
const srcDir = 'src';

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDirectory(filePath);
        } else {
            if (['.ts', '.tsx', '.json'].includes(path.extname(file))) {
                // Exclude the translation file
                if (file === 'translate-page-content.ts') return;

                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (devanagariRegex.test(line)) {
                        console.log(`Found Hindi in ${filePath}:${index + 1}: ${line.trim().substring(0, 50)}...`);
                    }
                });
            }
        }
    });
}

console.log('Scanning src (excluding translate-page-content.ts) for Hindi characters...');
scanDirectory(srcDir);
