import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
/**
 * i18n Auto-Translate & Sync Utility (Multi-file Version)
 */
const translateAndSync = async () => {
    console.log('\x1b[36m%s\x1b[0m', '🚀 Starting Multi-file Auto-Translation Sync...');
    
    const VI_DIR = path.join(ROOT, 'src/i18n/locales/vi');
    const EN_DIR = path.join(ROOT, 'src/i18n/locales/en');

    if (!fs.existsSync(EN_DIR)) fs.mkdirSync(EN_DIR, { recursive: true });

    const files = fs.readdirSync(VI_DIR).filter(f => f.endsWith('.json'));

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

    for (const file of files) {
        const viPath = path.join(VI_DIR, file);
        const enPath = path.join(EN_DIR, file);

        try {
            const vi = JSON.parse(fs.readFileSync(viPath, 'utf-8'));
            const en = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf-8')) : {};

            const [toTranslate, missingCount] = getMissing(vi, en);

            if (missingCount === 0) {
                console.log('\x1b[32m%s\x1b[0m', `✅ [${file}] All strings already translated.`);
                continue;
            }

            console.log('\x1b[35m%s\x1b[0m', `✨ [${file}] Found ${missingCount} new strings.`);

            const tempViFile = path.join(ROOT, `scripts/temp_vi_${file}`);
            const tempEnFile = path.join(ROOT, `scripts/temp_en_${file}`);

            fs.writeFileSync(tempViFile, JSON.stringify(toTranslate, null, 2));

            console.log(`⏳ Translating ${file}...`);
            
            try {
                execSync(`npx -y @parvineyvazov/json-translator --file ${tempViFile} --from vi --to en --output ${tempEnFile} --module google-translate`, { stdio: 'inherit' });
                
                const translated = JSON.parse(fs.readFileSync(tempEnFile, 'utf-8'));
                const finalEn = deepMerge(en, translated);

                fs.writeFileSync(enPath, JSON.stringify(finalEn, null, 2), 'utf-8');
                console.log('\x1b[32m%s\x1b[0m', `✅ [${file}] Successfully synced!`);
                
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', `❌ [${file}] Translation engine failed.`);
            } finally {
                if (fs.existsSync(tempViFile)) fs.unlinkSync(tempViFile);
                if (fs.existsSync(tempEnFile)) fs.unlinkSync(tempEnFile);
            }
        } catch (error) {
            console.error('\x1b[31m%s\x1b[0m', `❌ [${file}] Error:`, error.message);
        }
    }
    console.log('\x1b[36m%s\x1b[0m', '🏁 Finished sync.');
};

translateAndSync();
