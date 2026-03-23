import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.join(__dirname, 'public', 'Asset');
const SRC_DIR = path.join(__dirname, 'src');

async function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }

  return arrayOfFiles;
}

async function convertImages() {
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  const files = await getAllFiles(ASSET_DIR);
  
  const imagesToConvert = files.filter(f => 
    imageExtensions.includes(path.extname(f).toLowerCase())
  );
  
  console.log(`Found ${imagesToConvert.length} images to convert.`);
  
  const report = [];

  for (const imgPath of imagesToConvert) {
    const ext = path.extname(imgPath);
    const webpPath = imgPath.replace(new RegExp(`${ext}$`), '.webp');
    
    try {
      await sharp(imgPath)
        .toFormat('webp', { quality: 80 })
        .toFile(webpPath);
      
      console.log(`Converted: ${path.basename(imgPath)} -> ${path.basename(webpPath)}`);
      report.push({ old: path.basename(imgPath), new: path.basename(webpPath) });
    } catch (err) {
      console.error(`Error converting ${imgPath}:`, err.message);
    }
  }
  
  return report;
}

async function updateReferences(report) {
  const fileExtensions = ['.astro', '.css', '.js', '.html'];
  const allSrcFiles = await getAllFiles(SRC_DIR);
  const allPublicFiles = await getAllFiles(path.join(__dirname, 'public'));
  
  const filesToUpdate = [...allSrcFiles, ...allPublicFiles].filter(f => 
    fileExtensions.includes(path.extname(f).toLowerCase()) &&
    !f.includes('node_modules')
  );

  console.log(`Updating references in ${filesToUpdate.length} files...`);

  for (const file of filesToUpdate) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const { old, new: nw } of report) {
      // Use a safer regex to only replace exactly the extension
      // For instance, if old is 'image.png', we replace it with 'image.webp'
      // This helps avoid replacing substrings if there's overlap
      const baseName = old.replace(/\.(png|jpg|jpeg)$/i, '');
      const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      const regex = new RegExp(`${escapeRegExp(baseName)}\\.(png|jpg|jpeg)`, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, `${baseName}.webp`);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${path.relative(__dirname, file)}`);
    }
  }
}

async function main() {
  console.log('--- Starting Asset Conversion & Code Update ---');
  const report = await convertImages();
  await updateReferences(report);
  console.log('--- Finished! ---');
  console.log('Note: Original images were NOT deleted so you can verify the results.');
}

main().catch(console.error);
