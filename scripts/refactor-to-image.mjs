import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_PATH = path.join(__dirname, 'src', 'assets');
const PAGES_DIR = path.join(__dirname, 'src', 'pages');

const imageExtensions = ['.webp', '.png', '.jpg', '.jpeg'];

// Helper to find all files recursively
function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

// 1. Map all local assets
const allAssets = getFiles(ASSETS_PATH);
const assetsMap = {}; // { 'About-us.webp': 'img_About_us_webp' }

allAssets.forEach(assetPath => {
    const relPath = path.relative(ASSETS_PATH, assetPath).replace(/\\/g, '/');
    const varName = 'asset_' + relPath.replace(/[^a-zA-Z0-9]/g, '_');
    assetsMap[relPath] = varName;
});

// 2. Scan and refactor Astro pages
const astroFiles = getFiles(PAGES_DIR).filter(f => f.endsWith('.astro'));

astroFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has any /Asset/ references
    if (!content.includes('/Asset/')) return;
    
    let importsSet = new Set();
    let foundAssets = [];
    
    // Replace /Asset/ path in src attribute
    // pattern matches src="/Asset/path/to/img.webp"
    for (const [relPath, varName] of Object.entries(assetsMap)) {
        const pathVariants = [
            `src="/Asset/${relPath}"`,
            `src='/Asset/${relPath}'`,
            `src={/Asset/${relPath}}`
        ];
        
        let foundThisAsset = false;
        pathVariants.forEach(variant => {
            if (content.includes(variant)) {
                content = content.split(variant).join(`src={${varName}}`);
                foundThisAsset = true;
            }
        });
        
        if (foundThisAsset) {
            foundAssets.push({ relPath, varName });
        }
    }
    
    if (foundAssets.length > 0) {
        // Prepare imports
        const relativePathToAssets = path.relative(path.dirname(filePath), ASSETS_PATH).replace(/\\/g, '/');
        
        foundAssets.forEach(asset => {
            importsSet.add(`import ${asset.varName} from '${relativePathToAssets}/${asset.relPath}';`);
        });
        
        const astroImageImport = `import { Image } from 'astro:assets';`;
        
        // Inject imports into frontmatter
        const frontmatterRegex = /^---([\s\S]*?)---/;
        if (frontmatterRegex.test(content)) {
            content = content.replace(frontmatterRegex, (match, p1) => {
                let newBody = p1;
                if (!p1.includes('astro:assets')) {
                    newBody = `\n${astroImageImport}\n` + newBody;
                }
                const importsStr = Array.from(importsSet).join('\n');
                return `---\n${importsStr}\n${newBody}---`;
            });
        }
        
        // Convert <img> tags to <Image /> for the ones we touched
        foundAssets.forEach(asset => {
            const imgRegex = new RegExp(`<img([^>]+src=\\{${asset.varName}\\}[^>]*)\\/?>`, 'g');
            content = content.replace(imgRegex, `<Image$1 />`);
        });
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refactored to <Image />: ${path.relative(__dirname, filePath)}`);
    }
});
