import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = fileURLToPath(new URL('./', import.meta.url));
const destination = join(app, 'dist', 'cv');
const scratch = await mkdtemp(join(tmpdir(), 'botez-cv-'));
async function download(name, url, expectedChecksum) {
  const file = join(scratch, name);
  execFileSync('curl', ['-fLsS', '--retry', '2', '--max-time', '90', '-o', file, url], { stdio: 'inherit' });
  const checksum = createHash('sha256').update(await readFile(file)).digest('hex');
  if (checksum !== expectedChecksum) throw new Error(name + ' checksum does not match');
  return file;
}

try {
  const archive = await download('dompdf.zip',
    'https://github.com/dompdf/dompdf/releases/download/v3.1.5/dompdf-3.1.5.zip',
    '51a24faa8ed258cff2405228b151e54caefcbe9a6e6dbb8ac3e0ba024945ba9c');
  await cp(join(app, 'public-root'), destination, { recursive: true });
  const vendor = join(destination, '_private', 'vendor');
  await mkdir(vendor, {recursive: true});
  execFileSync('unzip', ['-oq', archive, '-d', vendor], { stdio: 'inherit' });
  await rm(join(vendor, 'dompdf', 'vendor', 'dompdf', 'dompdf', 'lib', 'fonts', 'mustRead.html'));

  const ocr = join(destination, 'assets', 'ocr');
  await mkdir(ocr, {recursive:true});
  const engine = await download('tesseract.js.tgz',
    'https://registry.npmjs.org/tesseract.js/-/tesseract.js-6.0.1.tgz',
    '4a208f2560a527ea9fc339ba2fdf125c13bca6638c194a149379601a1418d0ed');
  const core = await download('tesseract.js-core.tgz',
    'https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-6.0.0.tgz',
    '197b53b6bc42b7270c99b079e438992096d71a2b9b8237c6349491bd22fbd5a0');
  const romanian = await download('ron.traineddata.gz',
    'https://cdn.jsdelivr.net/npm/@tesseract.js-data/ron@1.0.0/4.0.0_best_int/ron.traineddata.gz',
    '3c2f550b6369f43254adf637cfe1088c7b6faff3d0382555219315112a24582a');
  execFileSync('tar', ['-xzf', engine, '-C', ocr, '--strip-components=2', 'package/dist/tesseract.min.js', 'package/dist/worker.min.js']);
  execFileSync('tar', ['-xzf', core, '-C', ocr, '--strip-components=1', 'package/tesseract-core-lstm.wasm.js', 'package/tesseract-core-lstm.wasm']);
  await cp(romanian, join(ocr, 'ron.traineddata.gz'));
} finally {
  await rm(scratch, { recursive: true, force: true });
}
