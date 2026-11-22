<?php
$sample = sampleCv();
?>
<?php if ($path === '/'): ?>
<main class="wrap home-main">
  <section class="intro">
    <p class="eyebrow"><span aria-hidden="true">✳</span> Un CV bun deschide uși</p>
    <h1>CV-ul tău.<br>Următorul <em>capitol.</em></h1>
    <p>Tu aduci povestea. Noi îi dăm forma potrivită.<br class="desktop-break"> Un document profesionist, fără complicații.</p>
    <div class="intro-proof"><span>✓ Simplu, pas cu pas</span><span>✓ Fără abonament</span></div>
    <span class="intro-stamp" aria-hidden="true">✳</span>
  </section>
  <form action="/cv/editor" method="get">
    <div class="section-heading"><h2>Alege cum te prezinți.</h2><p>Trei forme. Aceeași poveste: a ta.</p></div>
    <?= html('format-options', ['selectedFormat'=>'modern']) ?>
    <div class="start-band">
      <label><span>Limba documentului</span><select name="language"><?php foreach (CV_LANGUAGES as $id => $name): ?><option value="<?= e($id) ?>"><?= e($name) ?></option><?php endforeach; ?></select></label>
      <button class="button">Începe CV-ul meu →</button>
    </div>
  </form>
  <section class="guides" aria-label="Modele și ghiduri de CV"><?php foreach ($guides as $url=>$guide): ?><a href="<?= e('/cv' . $url) ?>"><?= e($guide[0]) ?> ↗</a><?php endforeach; ?></section>
</main>
<?php else: ?>
<main class="wrap prose">
  <p class="eyebrow">GHID CV-UL.RO</p><h1><?= e($guides[$path][0]) ?></h1><p class="lead"><?= e($guides[$path][1]) ?></p>
  <a class="button" href="/cv/editor">Creează CV-ul</a>
  <?php if ($path === '/model-cv-europass'): ?><h2>Exemplu completat</h2><div class="sheet"><?= resume($sample) ?></div>
  <?php elseif ($path === '/cv-fara-experienta'): ?>
    <h2>Exemplu de proiect școlar</h2><p>„Într-o echipă de patru colegi, am centralizat răspunsurile la un chestionar și am prezentat concluziile clasei.”</p>
    <h2>Exemplu de practică</h2><p>„Am aranjat produsele pe raft și am verificat etichetele de preț sub îndrumarea tutorului.”</p>
  <?php else: ?>
    <h2>Lucrător comercial</h2><p>„Am verificat recepția mărfii și am ajutat clienții să găsească produsele.”</p>
    <h2>Operator</h2><p>„Am urmărit parametrii liniei de producție și am înregistrat abaterile în fișa de tură.”</p>
    <h2>Asistent administrativ</h2><p>„Am programat întâlniri și am organizat documentele pentru semnare și arhivare.”</p>
  <?php endif; ?>
  <div class="guides"><?php foreach ($guides as $url=>$guide): if ($url === $path) continue; ?><a href="<?= e('/cv' . $url) ?>"><?= e($guide[0]) ?></a><?php endforeach; ?></div>
</main>
<?php endif; ?>
