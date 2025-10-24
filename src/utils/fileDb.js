import fs from 'fs/promises';
import path from 'path';

export async function readJson(filePath, fallback = []) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Si no existe, crear con el fallback
      await ensureDir(path.dirname(filePath));
      await writeJson(filePath, fallback);
      return fallback;
    }
    throw err;
  }
}

export async function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, json, 'utf-8');
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // si ya existe o no se puede crear, dejamos que lance error más adelante en writeFile
  }
}