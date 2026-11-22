'use strict';

const printButton = document.querySelector('[data-print]');
if (printButton) {
  printButton.addEventListener('click', () => window.print());
  window.addEventListener('load', () => window.print(), {once:true});
}

const editor = document.querySelector('#editor');
if (editor) initializeEditor();

function initializeEditor() {
  const select = (selector) => editor.querySelector(selector);
  const record = JSON.parse(select('#initial').textContent);
  const labels = JSON.parse(select('#cv-labels').textContent);
  const languageTasks = {en:'english',fr:'french',it:'italian',es:'spanish',de:'german'};
  const wizardKey = 'cv-ul-wizard-v2';
  let restored = {};
  try { restored = JSON.parse(sessionStorage.getItem(wizardKey) || '{}') || {}; } catch {}
  let furthest = 0;
  let delivery = '';
  let paid = editor.dataset.paid === '1';
  let stream = null;
  let cameraRequest = 0;
  const panels = [...editor.querySelectorAll('[data-step]')];
  const tabs = [...select('#steps').querySelectorAll('button')];
  const status = select('#status');
  const preview = select('#preview');
  let step = 0;
  let saveTimer;
  let pending = Promise.resolve();
  let picture = null;
  let previewPhoto = '';

  function message(text) { status.textContent = text; }

  async function api(action, body) {
    const response = await fetch('/cv/api/' + action, {
      method:'POST',
      headers:{'Content-Type':'application/json','X-CSRF-Token':editor.dataset.csrf},
      body:JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Acțiunea nu a putut fi terminată.');
    return result;
  }

  function save() {
    clearTimeout(saveTimer);
    const snapshot = JSON.parse(JSON.stringify(record));
    pending = pending.catch(() => {}).then(() => api('salveaza', snapshot));
    return pending;
  }

  function update() {
    draw();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save().catch(error => message(error.message)), 450);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function draw() {
    const translation = labels[record.language] || labels.ro;
    const cv = element('article','resume format-' + record.format);
    cv.lang = record.language;
    const heading = element('header','cv-head');
    const intro = element('div');
    if (record.format === 'europass') intro.append(element('p','cv-label','✦ europass'));
    intro.append(element('h1','',record.name || translation.name));
    if (record.role) intro.append(element('p','cv-role',record.role));
    const contact = [record.email,record.phone,record.city].filter(Boolean).join('\n');
    heading.append(intro);
    const displayedPhoto = previewPhoto || record.photo;
    if (displayedPhoto) {
      heading.classList.add('has-photo');
      const photo = element('img','cv-photo');
      photo.src = displayedPhoto;
      photo.alt = translation.photo;
      heading.append(photo);
    }
    cv.append(heading);
    const columns = element('div','cv-columns');
    const main = element('div','cv-main');
    const aside = element('div','cv-aside');
    for (const key of ['summary','work','education','contact','skills','languages','driving']) {
      const value = key === 'contact' ? contact : record[key];
      const items = Array.isArray(value) ? value.filter(row => Object.values(row).some(Boolean)) : null;
      if (items ? !items.length : !value) continue;
      const section = element('section');
      section.append(element('h2','',translation[key]));
      if (items) {
        for (const row of items) {
          const entry = element('div','cv-entry');
          const details = element('div');
          if (row.title) details.append(element('h3','',row.title));
          if (row.org) details.append(element('p','cv-org',row.org));
          if (row.period) details.append(element('p','cv-date',row.period));
          if (row.details) details.append(element('p','',row.details));
          entry.append(details);
          section.append(entry);
        }
      } else section.append(element('p','',value));
      (['summary','work','education'].includes(key) ? main : aside).append(section);
    }
    columns.append(main,aside);
    cv.append(columns);
    preview.replaceChildren(cv);
  }

  function remember() {
    try { sessionStorage.setItem(wizardKey, JSON.stringify({step,furthest,delivery})); } catch {}
  }

  function showStep(index, focus = true) {
    if (index < 0 || index >= panels.length || index > furthest) return;
    if (panels[index].dataset.step !== 'photo') {
      stopCamera();
      if (!crop.hidden) closeCrop(false);
    }
    step = index;
    panels.forEach((panel,i) => { panel.hidden = i !== index; });
    tabs.forEach((tab,i) => {
      tab.disabled = i > furthest;
      if (i === index) tab.setAttribute('aria-current','step');
      else tab.removeAttribute('aria-current');
    });
    select('#step-count').textContent = 'Pasul ' + (index + 1) + ' din ' + panels.length;
    select('#step-progress').value = index + 1;
    select('#back').disabled = index === 0;
    select('#next').hidden = index === panels.length - 1;
    select('#next').textContent = panels[index].dataset.step === 'photo' && !record.photo
      ? 'Continuă fără poză'
      : index === panels.length - 2 ? 'Vezi CV-ul' : 'Continuă';
    editor.classList.toggle('review-mode', index === panels.length - 1);
    editor.classList.toggle('photo-mode', panels[index].dataset.step === 'photo');
    select('#translate-summary').hidden = !languageTasks[record.language];
    message('');
    remember();
    if (focus) panels[index].querySelector('h2').focus();
  }

  function validateStep(index) {
    if (panels[index].dataset.step === 'photo' && !crop.hidden) {
      message('Aplică fotografia sau anulează modificările înainte de a continua.');
      select('#crop-save').focus();
      return false;
    }
    if (panels[index].dataset.step !== 'contact') return true;
    if (!record.name.trim()) {
      message('Completează numele pentru a continua.');
      select('[data-field="name"]').focus();
      return false;
    }
    return select('[data-field="email"]').reportValidity();
  }

  tabs.forEach((tab,index) => tab.addEventListener('click', () => {
    if (index <= step || validateStep(step)) showStep(index);
  }));
  select('#back').addEventListener('click', () => showStep(step - 1));
  select('#next').addEventListener('click', () => {
    if (!validateStep(step)) return;
    const next = step + 1;
    furthest = Math.max(furthest, next);
    showStep(next);
    save().catch(error => message(error.message));
  });
  editor.querySelectorAll('input[name="format"],input[name="language"]').forEach(input => {
    input.checked = record[input.name] === input.value;
    input.addEventListener('change', () => {
      record[input.name] = input.value;
      update();
    });
  });
  editor.querySelectorAll('[data-field]').forEach(input => {
    const key = input.dataset.field;
    input.value = record[key];
    input.addEventListener('input', () => { record[key] = input.value; update(); });
  });

  function add(section, initial = {}) {
    if (record[section].length >= 15) { message('Poți adăuga cel mult 15 intrări în secțiune.'); return; }
    record[section].push({title:'',org:'',period:'',details:'',...initial});
    renderRows(section);
    update();
  }

  function searchSchools(input, results, row) {
    let timer;
    let version = 0;
    input.addEventListener('input', () => {
      const current = ++version;
      clearTimeout(timer);
      results.hidden = true;
      if (input.value.trim().length < 2) return;
      timer = setTimeout(async () => {
        try {
          const response = await fetch('/cv/api/institutii?q=' + encodeURIComponent(input.value));
          if (!response.ok) throw new Error();
          const {results:matches} = await response.json();
          if (current !== version) return;
          results.replaceChildren();
          results.hidden = false;
          for (const school of matches) {
            const item = element('li');
            const button = element('button','',school.name);
            button.type = 'button';
            button.append(element('small','',[school.city,school.county,school.type].filter(Boolean).join(' · ')));
            button.addEventListener('click', () => {
              ++version;
              row.org = school.name;
              input.value = school.name;
              results.hidden = true;
              input.focus();
              update();
            });
            item.append(button);
            results.append(item);
          }
          if (matches.length === 0) results.append(element('li','',' Nu am găsit rezultate. Poți păstra textul introdus.'));
        } catch {
          if (current === version) message('Catalogul nu răspunde. Poți introduce instituția manual.');
        }
      }, 230);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') { ++version; results.hidden = true; }
      if (event.key === 'ArrowDown' && !results.hidden && results.querySelector('button')) {
        event.preventDefault();
        results.querySelector('button').focus();
      }
    });
  }

  function renderRows(section) {
    const wrapper = select('#' + section);
    wrapper.replaceChildren();
    const isWork = section === 'work';
    record[section].forEach((row,index) => {
      const card = element('div','repeat');
      const heading = element('div','repeat-head');
      const remove = element('button','','Elimină');
      remove.type = 'button';
      remove.setAttribute('aria-label',(isWork ? 'Elimină experiența ' : 'Elimină studiile ') + (index + 1));
      remove.addEventListener('click', () => { record[section].splice(index,1); renderRows(section); update(); });
      heading.append(element('strong','',(isWork ? 'Experiență ' : 'Studii ') + (index + 1)),remove);
      card.append(heading);
      const fields = {
        org:isWork?'Angajator':'Caută instituția de învățământ',
        title:isWork?'Post':'Calificare, facultate sau specializare',
        period:'Perioadă',
        details:isWork?'Responsabilități și rezultate':'Detalii',
      };
      for (const [key,title] of Object.entries(fields)) {
        const label = element('label','',title);
        const input = element(key === 'details' ? 'textarea' : 'input');
        if (key === 'details') input.rows = 3;
        if (key === 'period') input.placeholder = 'Ex. 2018 – 2021';
        input.maxLength = key === 'details' ? 1800 : 240;
        input.value = row[key];
        input.addEventListener('input', () => { row[key] = input.value; update(); });
        label.append(input);
        card.append(label);
        if (!isWork && key === 'org') {
          input.placeholder = 'Ex. carabella targoviste';
          input.autocomplete = 'off';
          const results = element('ul','results');
          results.hidden = true;
          card.append(results);
          searchSchools(input,results,row);
        }
        if (isWork && key === 'details') {
          const rewrite = element('button','secondary','Reformulează cu AI');
          rewrite.type = 'button';
          rewrite.addEventListener('click', () => run(rewrite, async () => {
            const response = await api('ai',{task:'rewrite',text:row.details});
            suggestion(response.text, () => { row.details = response.text; renderRows(section); update(); });
          }));
          card.append(rewrite);
        }
      }
      wrapper.append(card);
    });
  }

  if (!record.education.length) record.education.push({title:'',org:'',period:'',details:''});
  for (const key of ['work','education']) {
    renderRows(key);
    select('[data-add="' + key + '"]').addEventListener('click', () => add(key));
  }

  const crop = select('#crop');
  const cropCanvas = select('#crop-preview');
  const zoomInput = select('#crop-zoom');
  const photoActions = select('#photo-actions');
  const photoImage = select('#selected-photo');
  const video = select('#selfie-video');
  const cameraActions = select('#camera-actions');
  const capture = select('#take-selfie');
  const cropFrame = {angle:0, zoom:1, x:0, y:0};
  let savedPicture = null;
  let savedFrame = null;
  let drag = null;
  let raf = 0;
  let photoRequest = 0;

  function stopCamera() {
    ++cameraRequest;
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    video.hidden = true;
    renderPhoto();
    cameraActions.hidden = true;
  }
  window.addEventListener('pagehide',stopCamera);
  select('#camera-cancel').addEventListener('click',stopCamera);

  function renderPhoto() {
    const editing = !crop.hidden;
    photoActions.hidden = !record.photo || editing;
    select('#photo-start').hidden = editing || !video.hidden;
    select('#next').disabled = editing || !video.hidden;
    select('#photo-placeholder').hidden = !!record.photo;
    select('#replace-example').hidden = !record.photo && !editing;
    if (record.photo) photoImage.src = record.photo;
    else photoImage.removeAttribute('src');
    if (panels[step].dataset.step === 'photo') select('#next').textContent = record.photo ? 'Continuă' : 'Continuă fără poză';
  }

  function photoGeometry() {
    const sideways = cropFrame.angle % 2 !== 0;
    const width = sideways ? picture.naturalHeight : picture.naturalWidth;
    const height = sideways ? picture.naturalWidth : picture.naturalHeight;
    const scale = Math.max(320 / width,400 / height) * cropFrame.zoom;
    return {scale, maxX: Math.max(0,(width * scale - 320) / 2), maxY: Math.max(0,(height * scale - 400) / 2)};
  }

  function paintPhoto(canvas, ratio = canvas.width / 320) {
    const {scale,maxX,maxY} = photoGeometry();
    cropFrame.x = Math.max(-maxX, Math.min(maxX,cropFrame.x));
    cropFrame.y = Math.max(-maxY, Math.min(maxY,cropFrame.y));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.translate(canvas.width / 2,canvas.height / 2);
    ctx.scale(ratio,ratio);
    ctx.translate(cropFrame.x,cropFrame.y);
    ctx.rotate(cropFrame.angle * Math.PI / 2);
    const width = picture.naturalWidth * scale;
    const height = picture.naturalHeight * scale;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(picture,-width / 2,-height / 2,width,height);
  }

  function refreshCrop() {
    select('#crop-zoom-value').value = zoomInput.value + '%';
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (crop.hidden) return;
      paintPhoto(cropCanvas);
      const surround = select('#crop-surround');
      const scale = Math.min(2, window.devicePixelRatio || 1);
      surround.width = Math.round(surround.clientWidth * scale);
      surround.height = Math.round(surround.clientHeight * scale);
      paintPhoto(surround,cropCanvas.clientWidth * scale / 320);
      previewPhoto = cropCanvas.toDataURL('image/jpeg',0.78);
      const thumbnail = preview.querySelector('.cv-photo');
      if (thumbnail) thumbnail.src = previewPhoto;
      else draw();
    });
  }

  new ResizeObserver(() => { if (!crop.hidden) refreshCrop(); }).observe(cropCanvas);

  function resetCrop() {
    Object.assign(cropFrame,{angle:0,zoom:1,x:0,y:0});
    zoomInput.value = '100';
    refreshCrop();
  }

  function openCrop(frame) {
    crop.hidden = false;
    if (frame) {
      Object.assign(cropFrame,frame);
      zoomInput.value = Math.round(frame.zoom * 100);
      refreshCrop();
    } else resetCrop();
    renderPhoto();
    cropCanvas.focus();
  }

  function closeCrop(focus = true) {
    ++photoRequest;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previewPhoto = '';
    drag = null;
    crop.hidden = true;
    renderPhoto();
    draw();
    if (focus) select(record.photo ? '#crop-toggle' : '[data-photo="photo"]').focus();
  }

  async function loadPicture(source, request) {
    const img = new Image();
    img.src = source;
    await img.decode();
    if (request !== photoRequest || panels[step].dataset.step !== 'photo') return;
    picture = img;
    openCrop(null);
  }

  editor.querySelectorAll('[data-example-photo]').forEach(button => button.addEventListener('click', async () => {
    stopCamera();
    const request = ++photoRequest;
    try { await loadPicture('/cv/assets/cv-portrait.png',request); }
    catch { if (request === photoRequest) message('Portretul fictiv nu s-a încărcat.'); }
  }));

  for (const id of ['photo','selfie']) {
    select('#' + id).addEventListener('change', async event => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      const request = ++photoRequest;
      if (file.size > 12 * 1024 * 1024) { message('Alege o imagine de cel mult 12 MB.'); return; }
      try {
        const source = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await loadPicture(source,request);
      } catch {
        if (request === photoRequest) message('Fotografia nu poate fi citită. Încearcă o imagine JPG sau PNG.');
      }
    });
  }
  select('[data-photo="photo"]').addEventListener('click', () => { stopCamera(); select('#photo').click(); });
  select('[data-photo="selfie"]').addEventListener('click', async () => {
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia || matchMedia('(pointer: coarse)').matches) {
      select('#selfie').click();
      return;
    }
    const request = ++cameraRequest;
    try {
      const camera = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
      if (request !== cameraRequest) { camera.getTracks().forEach(track => track.stop()); return; }
      stream = camera;
      video.srcObject = stream;
      video.hidden = false;
      renderPhoto();
      cameraActions.hidden = false;
      video.scrollIntoView({block:'nearest'});
    } catch {
      if (request === cameraRequest) message('Camera nu este disponibilă. Poți încărca o fotografie.');
    }
  });
  capture.addEventListener('click', async () => {
    if (!video.videoWidth || !video.videoHeight) return;
    const frame = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    frame.width = Math.round(video.videoWidth * scale);
    frame.height = Math.round(video.videoHeight * scale);
    frame.getContext('2d').drawImage(video,0,0,frame.width,frame.height);
    stopCamera();
    const request = ++photoRequest;
    try { await loadPicture(frame.toDataURL('image/jpeg',0.94),request); }
    catch { if (request === photoRequest) message('Fotografia nu a putut fi capturată.'); }
  });

  zoomInput.addEventListener('input', () => {
    const zoom = Number(zoomInput.value) / 100;
    cropFrame.x *= zoom / cropFrame.zoom;
    cropFrame.y *= zoom / cropFrame.zoom;
    cropFrame.zoom = zoom;
    refreshCrop();
  });
  editor.querySelectorAll('[data-rotate]').forEach(button => button.addEventListener('click', () => {
    const direction = Number(button.dataset.rotate);
    [cropFrame.x,cropFrame.y] = [-direction * cropFrame.y,direction * cropFrame.x];
    cropFrame.angle = (cropFrame.angle + direction + 4) % 4;
    refreshCrop();
  }));
  select('#crop-reset').addEventListener('click',resetCrop);
  select('#crop-cancel').addEventListener('click',() => closeCrop());
  cropCanvas.addEventListener('pointerdown',event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    cropCanvas.setPointerCapture(event.pointerId);
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY};
  });
  cropCanvas.addEventListener('pointermove',event => {
    if (drag?.id !== event.pointerId) return;
    const ratio = 320 / cropCanvas.getBoundingClientRect().width;
    cropFrame.x += (event.clientX - drag.x) * ratio;
    cropFrame.y += (event.clientY - drag.y) * ratio;
    drag.x = event.clientX;
    drag.y = event.clientY;
    refreshCrop();
  });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) {
    cropCanvas.addEventListener(type,event => { if (drag?.id === event.pointerId) drag = null; });
  }
  cropCanvas.addEventListener('keydown',event => {
    const offsets = {ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    cropFrame.x += offset[0];
    cropFrame.y += offset[1];
    refreshCrop();
  });

  select('#crop-toggle').addEventListener('click',async () => {
    if (savedPicture) { picture = savedPicture; openCrop(savedFrame); return; }
    const request = ++photoRequest;
    try { await loadPicture(record.photo,request); }
    catch { if (request === photoRequest) message('Alege o fotografie nouă pentru a o edita.'); }
  });
  select('#crop-save').addEventListener('click',() => {
    if (crop.hidden || !picture) return;
    const output = document.createElement('canvas');
    output.width = 640;
    output.height = 800;
    paintPhoto(output);
    let photo = output.toDataURL('image/jpeg',0.92);
    if (photo.length >= 440000) photo = output.toDataURL('image/jpeg',0.8);
    if (photo.length >= 440000) photo = output.toDataURL('image/jpeg',0.65);
    if (photo.length >= 440000) { message('Imaginea este prea mare. Încearcă o altă fotografie.'); return; }
    record.photo = photo;
    savedPicture = picture;
    savedFrame = {...cropFrame};
    closeCrop();
    update();
  });
  select('#remove-photo').addEventListener('click', () => {
    stopCamera();
    picture = savedPicture = savedFrame = null;
    record.photo = '';
    closeCrop();
    update();
  });
  renderPhoto();

  async function run(button, callback) {
    button.disabled = true;
    message('Se procesează…');
    try { await callback(); if (status.textContent === 'Se procesează…') message(''); }
    catch (error) { message(error.message); }
    finally { button.disabled = false; }
  }

  const dialog = select('#suggestion');
  const apply = select('#suggestion-apply');
  function suggestion(text, action) {
    select('#suggestion-text').textContent = text;
    apply.hidden = !action;
    apply.onclick = () => { action(); dialog.close(); };
    dialog.showModal();
  }
  select('#suggestion-close').addEventListener('click', () => dialog.close());
  editor.querySelectorAll('[data-rewrite]').forEach(button => button.addEventListener('click', () => run(button, async () => {
    const key = button.dataset.rewrite;
    const response = await api('ai',{task:'rewrite',text:record[key]});
    suggestion(response.text, () => { record[key] = response.text; select('[data-field="' + key + '"]').value = response.text; update(); });
  })));
  select('#translate-summary').addEventListener('click', event => run(event.currentTarget, async () => {
    const result = await api('ai',{task:languageTasks[record.language],text:record.summary});
    suggestion(result.text, () => { record.summary = result.text; select('[data-field="summary"]').value = result.text; update(); });
  }));
  select('#compare-job').addEventListener('click', event => run(event.currentTarget, async () => {
    const source = {...record,photo:undefined,email:undefined,phone:undefined,name:undefined};
    const response = await api('ai',{task:'job',text:JSON.stringify(source),job:select('#job').value});
    suggestion(response.text);
  }));
  const interview = select('#work-interview');
  const interviewQuestion = select('#interview-question');
  const interviewProgress = select('#interview-count');
  const interviewPrompt = select('#interview-prompt');
  const interviewAnswer = select('#interview-answer');
  const interviewReview = select('#interview-review');
  const interviewStatus = select('#interview-status');
  const listen = select('#interview-listen');
  const speak = select('#interview-speak');
  const interviewBack = select('#interview-back');
  const interviewNext = select('#interview-next');
  const questions = [
    {field:'org',title:'Unde ai lucrat?',hint:'Poate fi o companie, un proiect sau un loc în care ai făcut voluntariat.',max:240,required:true},
    {field:'title',title:'Ce post ai avut?',hint:'Cum se numea rolul tău? Spune-l în cuvintele tale.',max:240,required:true},
    {field:'period',title:'În ce perioadă ai lucrat acolo?',hint:'De exemplu, martie 2021 – iunie 2024 sau 2022 – prezent.',max:240},
    {field:'details',title:'Ce responsabilități aveai?',hint:'Povestește ce făceai de obicei. Poți enumera 2–3 lucruri.',max:1200},
    {field:'results',title:'Ce rezultat ai obținut?',hint:'Adaugă o realizare concretă dacă îți amintești una. Poți sări peste întrebare.',max:550},
  ];
  let answers = {};
  let currentQuestion = 0;
  const demoAnswers = ['Studio Nord, București','Specialist marketing','Martie 2022 – prezent',
    'Am coordonat campaniile de comunicare și am gestionat conținutul pentru rețelele sociale.',
    'Am crescut comunitatea online cu 35% într-un an.'];
  let recognition = null;
  let reading = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function stopReading() {
    if (reading) {
      reading = null;
      window.speechSynthesis.cancel();
    }
  }

  function stopDictation() {
    const active = recognition;
    recognition = null;
    speak.textContent = 'Răspunde la microfon';
    if (active) {
      try { active.abort(); } catch {}
    }
  }

  function updateInterviewNext() {
    const question = questions[currentQuestion];
    interviewNext.disabled = Boolean(question?.required && !interviewAnswer.value.trim());
  }

  function renderInterview() {
    stopReading();
    stopDictation();
    const question = questions[currentQuestion];
    interviewStatus.textContent = '';
    interviewPrompt.hidden = !question;
    interviewReview.hidden = Boolean(question);
    interviewBack.disabled = currentQuestion === 0;
    listen.hidden = !question || !window.speechSynthesis || !window.SpeechSynthesisUtterance;
    select('#interview-avatar').textContent = question ? '✱' : '✓';
    interview.querySelectorAll('.interview-progress span').forEach((bar,index) => bar.classList.toggle('done',index <= currentQuestion));
    if (question) {
      interviewQuestion.textContent = question.title;
      interviewProgress.textContent = (currentQuestion + 1) + ' / ' + questions.length;
      select('#interview-example').textContent = question.hint;
      interviewAnswer.value = answers[question.field] || '';
      interviewAnswer.maxLength = question.max;
      interviewNext.textContent = currentQuestion === questions.length - 1 ? 'Verifică răspunsurile →' : 'Continuă →';
    } else {
      interviewQuestion.textContent = 'Sună ca tine?';
      select('#interview-example').textContent = 'Verifică și corectează răspunsurile înainte să le adaugi în CV.';
      interviewProgress.textContent = 'VERIFICARE';
      interviewNext.textContent = 'Adaugă în CV →';
      interviewReview.replaceChildren();
      questions.forEach(({field,title,max,required}) => {
        const item = element('label','review-answer');
        const input = element('textarea');
        input.rows = max > 240 ? 3 : 2;
        input.maxLength = max;
        input.required = Boolean(required);
        input.value = answers[field] || '';
        input.addEventListener('input', () => { answers[field] = input.value; });
        item.append(element('span','',title),input);
        interviewReview.append(item);
      });
    }
    updateInterviewNext();
    interviewQuestion.focus();
  }

  listen.hidden = !window.speechSynthesis || !window.SpeechSynthesisUtterance;
  if (!SpeechRecognition) speak.hidden = true;

  select('#interview-start').addEventListener('click', () => {
    if (record.work.length >= 15) { message('Poți adăuga cel mult 15 intrări în secțiune.'); return; }
    interview.showModal();
    renderInterview();
    if (!SpeechRecognition) interviewStatus.textContent = 'Poți scrie sau folosi microfonul tastaturii.';
  });
  select('#interview-close').addEventListener('click', () => interview.close());
  interview.addEventListener('close', () => { stopReading(); stopDictation(); });
  window.addEventListener('pagehide', () => { stopReading(); stopDictation(); });
  interviewAnswer.addEventListener('input', () => {
    const question = questions[currentQuestion];
    if (question) answers[question.field] = interviewAnswer.value;
    updateInterviewNext();
  });
  select('#interview-demo').addEventListener('click', () => {
    stopDictation();
    interviewAnswer.value = demoAnswers[currentQuestion];
    answers[questions[currentQuestion].field] = interviewAnswer.value;
    updateInterviewNext();
    interviewStatus.textContent = 'Răspuns fictiv. Îl poți modifica.';
  });
  listen.addEventListener('click', () => {
    const question = questions[currentQuestion];
    if (!question || listen.hidden) return;
    stopDictation();
    stopReading();
    const speech = new SpeechSynthesisUtterance(question.title);
    speech.lang = 'ro-RO';
    speech.onend = () => { if (reading === speech) reading = null; };
    speech.onerror = () => {
      if (reading !== speech) return;
      reading = null;
      interviewStatus.textContent = 'Întrebarea nu a putut fi citită cu voce.';
    };
    reading = speech;
    window.speechSynthesis.speak(speech);
  });

  speak.addEventListener('click', () => {
    const question = questions[currentQuestion];
    if (!SpeechRecognition || !question) return;
    if (recognition) {
      try { recognition.stop(); } catch { stopDictation(); }
      return;
    }
    stopReading();
    const session = new SpeechRecognition();
    recognition = session;
    session.lang = 'ro-RO';
    session.interimResults = false;
    session.onresult = event => {
      if (recognition !== session) return;
      const transcript = Array.from(event.results).map(result => result[0].transcript.trim()).filter(Boolean).join(' ');
      interviewAnswer.value = [interviewAnswer.value.trim(),transcript].filter(Boolean).join(' ').slice(0,question.max);
      answers[question.field] = interviewAnswer.value;
      updateInterviewNext();
      interviewStatus.textContent = 'Verifică textul, apoi apasă Continuă.';
    };
    session.onerror = () => {
      if (recognition !== session) return;
      stopDictation();
      interviewStatus.textContent = 'Dictarea nu este disponibilă. Poți scrie sau folosi microfonul tastaturii.';
    };
    session.onend = () => {
      if (recognition !== session) return;
      recognition = null;
      speak.textContent = 'Răspunde la microfon';
      if (interviewStatus.textContent === 'Te ascult…') interviewStatus.textContent = 'Poți încerca din nou sau răspunde în scris.';
    };
    try {
      speak.textContent = 'Oprește microfonul';
      interviewStatus.textContent = 'Te ascult…';
      session.start();
    } catch {
      stopDictation();
      interviewStatus.textContent = 'Dictarea nu a putut porni.';
    }
  });
  interviewBack.addEventListener('click', () => {
    currentQuestion = Math.max(0,currentQuestion - 1);
    renderInterview();
  });
  interviewNext.addEventListener('click', () => {
    const question = questions[currentQuestion];
    if (question) {
      const answer = interviewAnswer.value.trim();
      if (question.required && !answer) {
        interviewStatus.textContent = 'Scrie sau dictează un răspuns înainte de a continua.';
        interviewAnswer.focus();
        return;
      }
      answers[question.field] = answer;
      currentQuestion += 1;
      renderInterview();
      return;
    }
    if (record.work.length >= 15) { interviewStatus.textContent = 'Ai atins limita de 15 experiențe.'; return; }
    const invalid = [...interviewReview.querySelectorAll('textarea[required]')].find(input => !input.value.trim());
    if (invalid) { interviewStatus.textContent = 'Completează locul de muncă și postul.'; invalid.focus(); return; }
    const {org,title,period,details,results} = Object.fromEntries(Object.entries(answers).map(([key,value]) => [key,value.trim()]));
    add('work',{org,title,period,details:[details,results].filter(Boolean).join('\n')});
    answers = {};
    currentQuestion = 0;
    interview.close();
    message('Experiența a fost adăugată în CV.');
  });

  const documentPhoto = select('#document-photo');
  const documentReview = select('#document-review');
  const documentStatus = select('#document-status');
  const documentFields = select('#document-fields');
  const documentApply = select('#document-apply');
  const documentInputs = [['name',select('#document-name')],['driving',select('#document-driving')]];
  let scanType = '';
  let scanController = null;
  editor.querySelectorAll('[data-document]').forEach(button => button.addEventListener('click', () => {
    scanType = button.dataset.document;
    documentPhoto.click();
  }));
  documentPhoto.addEventListener('change', async () => {
    const file = documentPhoto.files[0];
    documentPhoto.value = '';
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) { message('Alege o imagine de cel mult 12 MB.'); return; }
    const controller = new AbortController();
    scanController?.abort();
    scanController = controller;
    documentFields.hidden = true;
    documentApply.hidden = true;
    for (const [,input] of documentInputs) { input.value = ''; input.parentElement.hidden = true; }
    documentStatus.textContent = 'Se pregătește citirea fotografiei…';
    documentReview.showModal();
    try {
      const {readDocument} = await import('/cv/assets/document-ocr.js?v=1');
      const result = await readDocument(file,scanType,percent => {
        documentStatus.textContent = percent === null ? 'Se pregătește citirea fotografiei…' : 'Se citește fotografia · ' + percent + '%';
      },controller.signal);
      if (controller.signal.aborted) return;
      for (const [key,input] of documentInputs) {
        input.value = result[key] || '';
        input.parentElement.hidden = !result[key];
      }
      const recognized = Object.keys(result).length > 0;
      documentStatus.textContent = recognized ? 'Corectează dacă este cazul, apoi confirmă.'
        : 'Nu am găsit câmpuri clare. Fotografiază din nou fața documentului sau completează manual.';
      documentFields.hidden = !recognized;
      documentApply.hidden = !recognized;
    } catch {
      if (!controller.signal.aborted) documentStatus.textContent = 'Fotografia nu a putut fi citită. Încearcă din nou cu un JPG sau PNG clar ori completează manual.';
    }
  });
  documentReview.addEventListener('close', () => {
    scanController?.abort();
    scanController = null;
    for (const [,input] of documentInputs) input.value = '';
  });
  select('#document-cancel').addEventListener('click', () => documentReview.close());
  documentApply.addEventListener('click', () => {
    for (const [key,input] of documentInputs) {
      if (input.parentElement.hidden || !input.value.trim()) continue;
      const target = select('[data-field="' + key + '"]');
      target.value = input.value.trim();
      record[key] = target.value;
    }
    documentReview.close();
    update();
    message('Am completat datele confirmate.');
  });

  const payment = select('#payment');
  const paymentStatus = select('#payment-status');
  const checkout = select('#checkout');
  const mail = select('#email-form');

  async function exportCv(action) {
    if (action === 'mail') {
      mail.hidden = false;
      select('#recipient').focus();
      return;
    }
    await save();
    location.assign(action === 'print' ? '/cv/print' : '/cv/pdf');
  }

  const paymentMessage = {
    pdf:'Pentru a descărca PDF-ul, trebuie achitați 5 lei.',
    print:'Pentru a tipări CV-ul, trebuie achitați 5 lei.',
    mail:'Pentru a trimite CV-ul pe e-mail, trebuie achitați 5 lei.',
  };

  editor.querySelectorAll('[data-delivery]').forEach(button => button.addEventListener('click', () => {
    if (!record.name.trim()) {
      showStep(panels.findIndex(panel => panel.dataset.step === 'contact'));
      validateStep(step);
      return;
    }
    delivery = button.dataset.delivery;
    remember();
    if (paid) { run(button, () => exportCv(delivery)); return; }
    select('#payment-copy').textContent = paymentMessage[delivery];
    paymentStatus.textContent = '';
    payment.showModal();
  }));

  select('#payment-cancel').addEventListener('click', () => payment.close());
  checkout.addEventListener('click', async () => {
    checkout.disabled = true;
    paymentStatus.textContent = 'Se procesează…';
    try {
      await save();
      const response = await api('checkout',{});
      if (response.url === '/cv/editor') {
        paid = true;
        payment.close();
        message('Exportul este deblocat.');
        await exportCv(delivery);
      } else location.assign(response.url);
    } catch (error) {
      if (payment.open) paymentStatus.textContent = error.message;
      else message(error.message);
    } finally { checkout.disabled = false; }
  });

  const retry = select('#retry-payment');
  if (retry) retry.addEventListener('click', () => run(retry, async () => {
    const response = await api('reia-plata',{});
    location.assign(response.url);
  }));
  mail.addEventListener('submit', event => {
    event.preventDefault();
    run(mail.querySelector('button'), async () => {
      await save();
      const result = await api('mail',{email:select('#recipient').value});
      message(result.message);
    });
  });
  select('#view-cv').addEventListener('click', event => {
    event.preventDefault();
    select('#cv-preview').focus();
  });
  if (record.name.trim()) {
    furthest = Math.min(panels.length - 1, Math.max(0, Number(restored.furthest) || 0));
  } else {
    furthest = Math.min(3, Math.max(0, Number(restored.furthest) || 0));
  }
  delivery = Object.hasOwn(paymentMessage, restored.delivery) ? restored.delivery : '';
  if (paid && record.name.trim()) furthest = panels.length - 1;
  const initialStep = paid && record.name.trim() ? panels.length - 1
    : Math.min(furthest, Math.max(0, Number(restored.step) || 0));
  showStep(initialStep,false);
  const preferences = new URLSearchParams(location.search);
  let selectedFromHome = false;
  for (const key of ['format','language']) {
    const choice = [...editor.querySelectorAll('input[name="' + key + '"]')].find(input => input.value === preferences.get(key));
    if (!choice) continue;
    choice.checked = true;
    choice.dispatchEvent(new Event('change'));
    selectedFromHome = true;
  }
  if (selectedFromHome) history.replaceState(history.state,'',location.pathname);
  if (paid && delivery === 'mail' && initialStep === panels.length - 1) mail.hidden = false;
  draw();
}
