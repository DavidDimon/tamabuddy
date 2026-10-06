import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const marker = 'TAMABUDDY_' + 'LIFE_LAB';
const outputDirectory = fileURLToPath(new URL('../dist/', import.meta.url));

async function bundledFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? bundledFiles(path) : [path];
    }),
  );
  return files
    .flat()
    .filter((path) => ['.js', '.css', '.html'].includes(extname(path)));
}

const files = await bundledFiles(outputDirectory);
const contaminated = [];
for (const file of files) {
  if ((await readFile(file, 'utf8')).includes(marker)) contaminated.push(file);
}

if (contaminated.length > 0) {
  throw new Error(
    `Life Lab marker found in production bundle:\n${contaminated.join('\n')}`,
  );
}

console.log(
  `Verified ${files.length} production bundle file(s): Life Lab excluded from ${relative(process.cwd(), outputDirectory)}.`,
);
