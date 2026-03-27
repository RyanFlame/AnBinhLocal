import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const VI_PATH = path.join(ROOT, 'src/i18n/locales/vi.json');
const EN_PATH = path.join(ROOT, 'src/i18n/locales/en.json');

/**
 * i18n Sync Utility
 * 
 * This script ensures that en.json is always in sync with vi.json.
 * 1. It finds keys that exist in Vietnamese but are missing in English.
 * 2. It adds them to en.json with a placeholder.
 * 3. it maintains the same key order as vi.json for easier comparison.
 * 
 * Usage: node scripts/translate.mjs
 */
const syncTranslations = async () => {
    console.log('\x1b[36m%s\x1b[0m', '🔍 i18n Sync: Checking translation files...');
    
    try {
        const vi = JSON.parse(fs.readFileSync(VI_PATH, 'utf-8'));
        const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));

        const viKeys = Object.keys(vi);
        const enKeys = Object.keys(en);

        const missingInEn = viKeys.filter(k => !enKeys.includes(k));
        const extraInEn = enKeys.filter(k => !viKeys.includes(k));

        if (missingInEn.length === 0 && extraInEn.length === 0) {
            console.log('\x1b[32m%s\x1b[0m', '✅ en.json is perfectly in sync with vi.json.');
            return;
        }

        if (extraInEn.length > 0) {
            console.log('\x1b[33m%s\x1b[0m', `⚠️ Found ${extraInEn.length} deprecated keys in English (not in vi.json):`);
            extraInEn.forEach(k => console.log(`  - ${k}`));
        }

        if (missingInEn.length > 0) {
            console.log('\x1b[35m%s\x1b[0m', `✨ Found ${missingInEn.length} new keys in vi.json:`);
            
            // Re-order and fill missing
            const syncedEn = {};
            viKeys.forEach(key => {
                if (en[key]) {
                    syncedEn[key] = en[key];
                } else {
                    console.log(`  + ${key}: "${vi[key].substring(0, 40)}${vi[key].length > 40 ? '...' : ''}"`);
                    syncedEn[key] = `[MISSING]: ${vi[key]}`;
                }
            });

            fs.writeFileSync(EN_PATH, JSON.stringify(syncedEn, null, 2), 'utf-8');
            console.log('\x1b[32m%s\x1b[0m', `\n💾 Successfully updated en.json!`);
            console.log('💡 TIP: Search for "[MISSING]" in en.json to complete the translations.');
        } else if (extraInEn.length > 0) {
            // If only extra keys, we might want to prune them
            const syncedEn = {};
            viKeys.forEach(key => {
                syncedEn[key] = en[key];
            });
            fs.writeFileSync(EN_PATH, JSON.stringify(syncedEn, null, 2), 'utf-8');
            console.log('\x1b[32m%s\x1b[0m', `\n💾 Pruned deprecated keys from en.json.`);
        }
        
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Error syncing translations:', error.message);
    }
};

syncTranslations();
