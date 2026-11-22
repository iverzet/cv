<?php
$steps = ['Format','Limbă','Fotografie','Date personale','Experiență','Educație','Competențe','Previzualizare'];
$translations = [];
foreach (array_keys(CV_LANGUAGES) as $language) $translations[$language] = cvLabels($language);
$jsonFlags = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE;
?>
<main class="wrap editor" id="editor" data-paid="<?= $paid ? '1' : '0' ?>" data-csrf="<?= e($csrf) ?>">
<h1>Creează CV-ul</h1>
<?php if ($message): ?><p class="notice" role="status"><?= e($message) ?></p><?php endif; ?>
<script type="application/json" id="initial"><?= json_encode($cv, $jsonFlags) ?></script>
<script type="application/json" id="cv-labels"><?= json_encode($translations, $jsonFlags) ?></script>

<div class="editor-grid wizard">
  <div class="panel wizard-panel">
    <div class="wizard-progress"><span id="step-count">Pasul 1 din <?= count($steps) ?></span><progress id="step-progress" value="1" max="<?= count($steps) ?>" aria-label="Progresul CV-ului"></progress></div>
    <nav class="steps" id="steps" aria-label="Pașii CV-ului">
      <?php foreach ($steps as $index=>$step): ?><button type="button" data-step-name="<?= e($step) ?>" aria-label="<?= e(($index + 1) . '. ' . $step) ?>" <?= $index === 0 ? 'aria-current="step"' : 'disabled' ?>><span><?= $index + 1 ?></span><span class="step-name"><?= e($step) ?></span></button><?php endforeach; ?>
    </nav>

    <section data-step="format">
      <h2 tabindex="-1">Alege formatul CV-ului</h2>
      <div class="format-options">
        <?php foreach (CV_FORMATS as $id => [$title, $description]): ?>
          <label class="format-option"><input type="radio" name="format" value="<?= e($id) ?>"><span class="format-sample example-<?= e($id) ?>" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><strong><?= e($title) ?></strong><small><?= e($description) ?></small></span></label>
        <?php endforeach; ?>
      </div>
    </section>

    <section data-step="language" hidden>
      <h2 tabindex="-1">În ce limbă vrei CV-ul?</h2>
      <p class="muted">Titlurile secțiunilor vor apărea în această limbă. Completează experiența și studiile în limba aleasă.</p>
      <div class="language-options">
        <?php foreach (CV_LANGUAGES as $id=>$label): ?>
          <label><input type="radio" name="language" value="<?= e($id) ?>"><span><?= e($label) ?></span></label>
        <?php endforeach; ?>
      </div>
    </section>

    <section data-step="photo" hidden>
      <h2 tabindex="-1">Fotografie</h2>
      <input type="file" id="selfie" accept="image/*" capture="user" hidden>
      <input type="file" id="photo" accept="image/*" hidden>
      <div class="photo-start" id="photo-start">
        <div class="photo-placeholder" id="photo-placeholder" aria-hidden="true"><span>4:5</span></div>
        <div class="photo-start-copy">
          <p class="muted">Încarcă o poză, fă un selfie sau continuă fără fotografie.</p>
          <div class="actions"><button type="button" class="secondary" data-photo="photo">Încarcă o poză</button><button type="button" class="secondary" data-photo="selfie">Fă un selfie</button></div>
        </div>
      </div>
      <div class="photo-selection" id="photo-actions" hidden>
        <img id="selected-photo" alt="Fotografia aleasă pentru CV">
        <div><p>Fotografia pentru CV</p><div class="actions"><button type="button" class="secondary" id="crop-toggle">Editează încadrarea</button><button type="button" class="secondary" id="remove-photo">Elimină</button></div></div>
      </div>
      <div id="crop" hidden>
        <div class="photo-stage">
          <div class="crop-window">
            <canvas id="crop-preview" width="320" height="400" tabindex="0" aria-label="Încadrarea fotografiei" aria-describedby="crop-help"></canvas>
            <div class="crop-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
        <p class="muted crop-help" id="crop-help">Trage fotografia pentru a o poziționa. Poți folosi și tastele săgeți.</p>
        <div class="crop-tools">
          <label for="crop-zoom">Zoom <output id="crop-zoom-value" for="crop-zoom">100%</output><input id="crop-zoom" type="range" min="100" max="300" step="1" value="100"></label>
          <div class="actions"><button type="button" class="secondary" data-rotate="-1" aria-label="Rotește la stânga">↶</button><button type="button" class="secondary" data-rotate="1" aria-label="Rotește la dreapta">↷</button><button type="button" class="secondary" id="crop-reset">Resetează</button></div>
        </div>
        <div class="actions crop-actions"><button type="button" class="secondary" id="crop-cancel">Anulează</button><button type="button" class="button" id="crop-save">Aplică fotografia</button></div>
      </div>
      <video id="selfie-video" autoplay muted playsinline hidden></video>
      <div class="actions" id="camera-actions" hidden><button type="button" class="secondary" id="camera-cancel">Închide camera</button><button type="button" class="button" id="take-selfie">Capturează fotografia</button></div>
    </section>

    <section data-step="contact" hidden>
      <h2 tabindex="-1">Date personale</h2>
      <details class="assist">
        <summary>Completează din buletin sau permis</summary>
        <p class="muted">Fotografia este citită pe dispozitiv. Verifică numele și, de pe permis, categoriile înainte de a le adăuga.</p>
        <div class="actions"><button type="button" class="secondary" data-document="identity">Fotografiază buletinul</button><button type="button" class="secondary" data-document="licence">Fotografiază permisul</button></div>
        <input type="file" id="document-photo" accept="image/*" capture="environment" hidden>
      </details>
      <div class="fields">
        <label>Nume complet<input data-field="name" required autocomplete="name" maxlength="120"></label>
        <label>Titlu profesional<input data-field="role" placeholder="Ex. Coordonator operațiuni"></label>
        <label>E-mail<input data-field="email" type="email" autocomplete="email"></label>
        <label>Telefon<input data-field="phone" type="tel" autocomplete="tel"></label>
        <label>Localitate<input data-field="city" autocomplete="address-level2"></label>
        <label>Categorii permis (opțional)<input data-field="driving" maxlength="65" placeholder="Ex. B, BE"></label>
      </div>
      <label>Despre mine<textarea data-field="summary" rows="4" placeholder="Ce fel de rol cauți și ce experiență ai?"></textarea></label>
      <div class="actions"><button type="button" class="secondary" data-rewrite="summary">Reformulează cu AI</button><button type="button" class="secondary" id="translate-summary" hidden>Tradu descrierea în limba CV-ului</button></div>
    </section>

    <section data-step="work" hidden>
      <h2 tabindex="-1">Experiență profesională</h2>
      <p class="muted">Adaugă locurile de muncă, stagiile sau voluntariatul relevante. Dacă e primul tău CV, poți continua fără experiență.</p>
      <div class="actions">
        <button type="button" class="button" id="interview-start">Răspunde la întrebări</button>
        <button type="button" class="secondary" data-add="work">Completează manual</button>
      </div>
      <div id="work"></div>
    </section>
    <section data-step="education" hidden>
      <h2 tabindex="-1">Educație și formare</h2><p class="muted">Caută școala după nume și localitate sau scrie denumirea manual.</p>
      <div id="education"></div><button type="button" class="secondary" data-add="education">Adaugă studii</button>
    </section>
    <section data-step="skills" hidden>
      <h2 tabindex="-1">Competențe și limbi străine</h2>
      <label>Competențe<textarea data-field="skills" rows="4" placeholder="Ex. Excel, organizarea stocurilor"></textarea></label>
      <label>Limbi străine și nivel<textarea data-field="languages" rows="3" placeholder="Ex. Engleză — B2"></textarea></label>
      <button type="button" class="secondary" data-rewrite="skills">Reformulează competențele cu AI</button>
    </section>
    <section data-step="review" hidden>
      <h2 tabindex="-1">CV-ul este gata de verificat</h2>
      <p class="muted">Verifică numele, datele de contact și perioadele înainte să trimiți CV-ul.</p>
      <a class="text-link" id="view-cv" href="#cv-preview">Vezi CV-ul complet</a>
      <div class="actions export-actions">
        <button type="button" class="button" data-delivery="pdf">Descarcă PDF</button>
        <button type="button" class="secondary" data-delivery="print">Printează</button>
        <button type="button" class="secondary" data-delivery="mail">Trimite pe e-mail</button>
      </div>
      <form id="email-form" hidden><label>Adresa destinatarului<input id="recipient" type="email" required></label><button class="button">Trimite PDF-ul</button></form>
      <?php if (!empty($_SESSION['checkout']) && !$paid): ?><button type="button" class="secondary" id="retry-payment">Verifică plata</button><?php endif; ?>
      <details class="assist"><summary>Verifică potrivirea cu un anunț</summary>
        <label>Textul anunțului<textarea id="job" rows="5"></textarea></label>
        <button type="button" class="secondary" id="compare-job">Analizează cu AI</button>
      </details>
    </section>
    <p id="status" class="status" role="status" aria-live="polite"></p>
    <div class="step-actions"><button type="button" class="secondary" id="back">Înapoi</button><button type="button" class="button" id="next">Continuă</button></div>
  </div>
  <aside class="preview" id="cv-preview" tabindex="-1"><div class="preview-head"><h2>Previzualizare</h2><span>A4</span></div><div class="sheet" id="preview"><?= resume($cv) ?></div></aside>
</div>
<dialog id="work-interview" class="interview" aria-labelledby="interview-question">
  <div class="interview-top">
    <p id="interview-count" class="muted"></p>
    <button type="button" class="secondary" id="interview-close">Închide</button>
  </div>
  <h2 id="interview-question" tabindex="-1">Unde ai lucrat?</h2>
  <div id="interview-prompt">
    <p class="muted" id="interview-example"></p>
    <div class="actions">
      <button type="button" class="secondary" id="interview-listen">Ascultă întrebarea</button>
      <button type="button" class="secondary" id="interview-speak">Răspunde la microfon</button>
    </div>
    <label>Răspunsul tău<textarea id="interview-answer" rows="3"></textarea></label>
  </div>
  <dl class="interview-review" id="interview-review" hidden></dl>
  <p id="interview-status" class="status" role="status"></p>
  <div class="step-actions">
    <button type="button" class="secondary" id="interview-back" hidden>Înapoi</button>
    <button type="button" class="button" id="interview-next">Continuă</button>
  </div>
</dialog>
<dialog id="document-review" aria-labelledby="document-title">
  <h2 id="document-title">Verifică datele din document</h2>
  <p id="document-status" class="status" role="status"></p>
  <div id="document-fields" hidden>
    <label id="document-name-row" hidden>Nume complet<input id="document-name" maxlength="120"></label>
    <label id="document-driving-row" hidden>Categorii permis<input id="document-driving" maxlength="65"></label>
  </div>
  <div class="actions"><button type="button" class="secondary" id="document-cancel">Închide</button><button type="button" class="button" id="document-apply" hidden>Folosește datele</button></div>
</dialog>
<dialog id="payment" aria-labelledby="payment-title">
  <h2 id="payment-title">Deblochează CV-ul pentru 5 lei</h2>
  <p id="payment-copy"></p>
  <p>Plătești o singură dată pentru PDF, tipărire și trimitere pe e-mail.</p>
  <?php if (demo()): ?><p class="notice">Mod demo. Plata și trimiterea prin e-mail sunt simulate.</p><?php endif; ?>
  <p id="payment-status" class="status" role="status"></p>
  <div class="actions"><button type="button" class="secondary" id="payment-cancel">Înapoi la CV</button><button type="button" class="button" id="checkout"><?= demo() ? 'Simulează plata de 5 lei' : 'Achită 5 lei' ?></button></div>
</dialog>
<dialog id="suggestion"><h2>Sugestie AI</h2><p class="muted">Verifică datele înainte de a aplica textul.</p><pre id="suggestion-text"></pre><div class="actions"><button type="button" class="secondary" id="suggestion-close">Închide</button><button type="button" class="button" id="suggestion-apply">Aplică</button></div></dialog>
</main>
