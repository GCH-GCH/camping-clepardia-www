import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const rootDir = process.cwd();
const rawDir = join(rootDir, 'public', 'raw');
const outputDir = join(rootDir, 'public', 'images', 'converted');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);
const quality = 82;

const toKebabCase = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';

const collectImages = (dir) => {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectImages(fullPath);
    }

    const ext = extname(entry.name).toLowerCase();
    return supportedExtensions.has(ext) ? [fullPath] : [];
  });
};

const uniqueOutputPath = (sourcePath) => {
  const rel = relative(rawDir, sourcePath);
  const withoutExt = rel.slice(0, -extname(rel).length);
  const baseName = toKebabCase(withoutExt);
  return join(outputDir, `${baseName}.webp`);
};

if (!existsSync(rawDir)) {
  mkdirSync(rawDir, { recursive: true });
  console.log('Utworzono public/raw. Wrzuć tam pliki JPG/PNG do konwersji.');
}

mkdirSync(outputDir, { recursive: true });

const images = collectImages(rawDir);

if (images.length === 0) {
  console.log('Brak plików JPG/PNG w public/raw. Nic nie przekonwertowano.');
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const sourcePath of images) {
  const targetPath = uniqueOutputPath(sourcePath);

  if (existsSync(targetPath)) {
    skipped += 1;
    console.log(`SKIP: ${basename(sourcePath)} -> ${relative(rootDir, targetPath)} już istnieje`);
    continue;
  }

  await sharp(sourcePath)
    .rotate()
    .webp({ quality })
    .toFile(targetPath);

  converted += 1;
  console.log(`OK: ${relative(rootDir, sourcePath)} -> ${relative(rootDir, targetPath)}`);
}

console.log(`Zakończono konwersję. Nowe pliki: ${converted}. Pominięte: ${skipped}.`);
