import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const VI_PATH = path.join(ROOT, 'src/i18n/locales/config.vi.json');
const EN_PATH = path.join(ROOT, 'src/i18n/locales/config.en.json');

/**
 * i18n Auto-Translate & Sync Utility (Nested Version)
 */
const translateAndSync = async () => {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Nested Auto-Translation Sync...');
    
    try {
        const vi = JSON.parse(fs.readFileSync(VI_PATH, 'utf-8'));
        const en = fs.existsSync(EN_PATH) ? JSON.parse(fs.readFileSync(EN_PATH, 'utf-8')) : {};

        // Helper to find missing keys in nested objects
        const getMissing = (source, target) => {
            const missing = {};
            let count = 0;
            for (const key in source) {
                if (typeof source[key] === 'object' && source[key] !== null) {
                    const [subMissing, subCount] = getMissing(source[key], target[key] || {});
                    if (subCount > 0) {
                        missing[key] = subMissing;
                        count += subCount;
                    }
                } else if (!target[key]) {
                    missing[key] = source[key];
                    count++;
                }
            }
            return [missing, count];
        };

        const [toTranslate, missingCount] = getMissing(vi, en);

        if (missingCount === 0) {
            console.log('\x1b[32m%s\x1b[0m', '✅ All Vietnamese content is already translated.');
            return;
        }

        console.log('\x1b[35m%s\x1b[0m', `✨ Found ${missingCount} new strings to translate.`);

        const tempViFile = path.join(ROOT, 'scripts/temp_to_translate.json');
        const tempEnFile = path.join(ROOT, 'scripts/temp_translated.json');

        fs.writeFileSync(tempViFile, JSON.stringify(toTranslate, null, 2));

        console.log('⏳ Calling translation engine (Google Translate)...');
        
        try {
            execSync(`npx -y @parvineyvazov/json-translator --file ${tempViFile} --from vi --to en --output ${tempEnFile} --module google-translate`, { stdio: 'inherit' });
            
            const translated = JSON.parse(fs.readFileSync(tempEnFile, 'utf-8'));
            
            // Deep merge helper
            const deepMerge = (target, source) => {
                for (const key in source) {
                    if (typeof source[key] === 'object' && source[key] !== null) {
                        target[key] = deepMerge(target[key] || {}, source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
                return target;
            };

            const finalEn = deepMerge(en, translated);

            fs.writeFileSync(EN_PATH, JSON.stringify(finalEn, null, 2), 'utf-8');
            console.log('\x1b[32m%s\x1b[0m', `\n✅ Successfully translated and synced ${missingCount} items!`);
            
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', '❌ Translation engine failed. Check your internet connection.');
        } finally {
            if (fs.existsSync(tempViFile)) fs.unlinkSync(tempViFile);
            if (fs.existsSync(tempEnFile)) fs.unlinkSync(tempEnFile);
        }
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Fatal Error:', error.message);
    }
};

translateAndSync();
