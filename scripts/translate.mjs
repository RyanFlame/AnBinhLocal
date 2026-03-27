import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const VI_PATH = path.join(ROOT, 'src/i18n/locales/vi.json');
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en.json');

/**
 * i18n Auto-Translate & Sync Utility
 * 
 * This script:
 * 1. Finds missing keys in en.json compared to vi.json.
 * 2. Automatically translates them using a free Google Translate API (via npx).
 * 3. Maintains key order and saves results.
 */
const translateAndSync = async () => {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Auto-Translation Sync...');
    
    try {
        const vi = JSON.parse(fs.readFileSync(VI_PATH, 'utf-8'));
        const en = fs.existsSync(EN_PATH) ? JSON.parse(fs.readFileSync(EN_PATH, 'utf-8')) : {};

        const viKeys = Object.keys(vi);
        const missingInEn = viKeys.filter(k => !en[k]);

        if (missingInEn.length === 0) {
            console.log('\x1b[32m%s\x1b[0m', '✅ All Vietnamese keys already have English translations.');
            return;
        }

        console.log('\x1b[35m%s\x1b[0m', `✨ Found ${missingInEn.length} new keys to translate.`);

        // We use 'translate-shell-json' or similar via npx for zero-config translation
        // For this implementation, we'll use a reliable fetch-based approach to a free endpoint
        // or a dedicated package if the user allows npm installs.
        
        const tempViFile = path.join(ROOT, 'scripts/temp_to_translate.json');
        const tempEnFile = path.join(ROOT, 'scripts/temp_translated.json');

        const toTranslate = {};
        missingInEn.forEach(k => toTranslate[k] = vi[k]);
        fs.writeFileSync(tempViFile, JSON.stringify(toTranslate, null, 2));

        console.log('⏳ Calling translation engine (Google Translate)...');
        
        try {
            // Using npx @parvineyvazov/json-translator as it's the most robust free JSON translator
            execSync(`npx -y @parvineyvazov/json-translator --file ${tempViFile} --from vi --to en --output ${tempEnFile} --module google-translate`, { stdio: 'inherit' });
            
            const translated = JSON.parse(fs.readFileSync(tempEnFile, 'utf-8'));
            
            // Merge results
            const finalEn = {};
            viKeys.forEach(key => {
                finalEn[key] = en[key] || translated[key] || `[FAIL]: ${vi[key]}`;
            });

            fs.writeFileSync(EN_PATH, JSON.stringify(finalEn, null, 2), 'utf-8');
            console.log('\x1b[32m%s\x1b[0m', `\n✅ Successfully translated and synced ${missingInEn.length} keys!`);
            
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', '❌ Translation engine failed. Falling back to stubs.');
            const stubEn = { ...en };
            missingInEn.forEach(k => stubEn[k] = `[PENDING]: ${vi[k]}`);
            fs.writeFileSync(EN_PATH, JSON.stringify(stubEn, null, 2), 'utf-8');
        } finally {
            if (fs.existsSync(tempViFile)) fs.unlinkSync(tempViFile);
            if (fs.existsSync(tempEnFile)) fs.unlinkSync(tempEnFile);
        }
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Fatal Error:', error.message);
    }
};

translateAndSync();
