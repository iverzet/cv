const assets = '/cv/assets/ocr/';
const categories = ['AM','A1','A2','A','B1','B','BE','C1','C1E','C','CE','D1','D1E','D','DE','TR','TR1','TB','TV'];
let engine;

function validName(raw) {
  const name = raw.replace(/^[\s:;.\-]+/, '').trim().replace(/\s+/g, ' ');
  if (!/^[\p{L}\p{M}][\p{L}\p{M} '.\-]{1,69}$/u.test(name)) return '';
  if (/\b(?:ROMÂNIA|ROMANIA|PERMIS|REPUBLICA|IDENTITY|IDENTITATE|DOMICILIU|CETĂȚENIE|NATIONALIT|CETATENIE|GIVEN|SURNAME|PRENUME|NAISSANCE|NATIONALITY)\b/iu.test(name)) return '';
  return name;
}

function labelledName(lines, label, number = '') {
  for (let i = 0; i < lines.length; i++) {
    const tagged = number && lines[i].match(new RegExp('^' + number + '\\s*[.):-]\\s*(.*)$'));
    const named = lines[i].match(label);
    if (!tagged && !named) continue;
    const tail = (tagged || named)[1] || '';
    const value = tail.trim() ? validName(tail) : validName(lines[i + 1] || '');
    if (value) return value;
  }
  return '';
}

export function parseDocument(text, type) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const family = labelledName(lines, /^nume(?:le)?(?:\s*\/\s*(?:nom|surname))*\b\s*[:.]?\s*(.*)$/iu, type === 'licence' ? '1' : '');
  const given = labelledName(lines, /^prenume(?:le)?(?:\s*\/\s*(?:pr[ée]nom|given names?))*\b\s*[:.]?\s*(.*)$/iu, type === 'licence' ? '2' : '');
  let name = given && family ? validName(given + ' ' + family) : '';
  if (!name && type === 'identity') {
    const mrz = lines.map(line => line.replace(/\s/g, ''));
    const document = mrz.findIndex(line => /^I[A-Z<]ROU[A-Z0-9<]{12,}$/.test(line));
    if (document !== -1) {
      const line = mrz[document];
      const candidate = (line.length === 30 && mrz[document + 2]) || line.slice(5);
      const match = candidate.match(/^([A-Z]+(?:<[A-Z]+)*)<<([A-Z]+(?:<[A-Z]+)*)(?:<*)$/);
      if (match) name = validName((match[2] + '<' + match[1]).replace(/</g, ' '));
    }
  }
  const output = {};
  if (name) output.name = name;
  if (type === 'licence') {
    const frontCategory = lines.map(line => line.match(/^9\s*[.):-]\s*([\p{L}\d,;/ .+-]+)$/u)).find(Boolean);
    if (frontCategory) {
      const tokens = frontCategory[1].toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
      if (tokens.length && tokens.every(token => categories.includes(token))) {
        output.driving = [...new Set(tokens)].join(', ');
      }
    }
  }
  return output;
}

function loadEngine() {
  engine ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = assets + 'tesseract.min.js';
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error('Recunoașterea documentelor nu s-a putut încărca.'));
    document.head.append(script);
  }).catch(error => { engine = null; throw error; });
  return engine;
}

async function fitPhoto(file) {
  const uri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const photo = new Image();
  photo.src = uri;
  await photo.decode();
  const scale = Math.min(1, 1900 / Math.max(photo.naturalWidth, photo.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(photo.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(photo.naturalHeight * scale));
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(photo,0,0,canvas.width,canvas.height);
  return canvas;
}

export async function readDocument(file, type, progress, signal) {
  const photo = await fitPhoto(file);
  signal.throwIfAborted();
  const tesseract = await loadEngine();
  signal.throwIfAborted();
  let rejectScan;
  let worker;
  const interrupted = new Promise((_, reject) => { rejectScan = reject; });
  const onAbort = () => rejectScan(signal.reason);
  signal.addEventListener('abort', onAbort, {once:true});
  const timeout = setTimeout(() => rejectScan(new Error('Citirea a durat prea mult.')), 55000);
  const startup = tesseract.createWorker('ron', 1, {
    workerPath: assets + 'worker.min.js',
    corePath: assets + 'tesseract-core-lstm.wasm.js',
    langPath: assets,
    workerBlobURL: false,
    cacheMethod: 'none',
    errorHandler: () => rejectScan(new Error('Motorul de recunoaștere nu a răspuns.')),
    logger: item => {
      if (!signal.aborted) progress(item.status === 'recognizing text' ? Math.round(item.progress * 100) : null);
    },
  });
  try {
    worker = await Promise.race([startup, interrupted]);
    const {data} = await Promise.race([worker.recognize(photo), interrupted]);
    return parseDocument(data.text, type);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', onAbort);
    if (worker) await worker.terminate();
    else startup.then(late => late.terminate()).catch(() => {});
  }
}
