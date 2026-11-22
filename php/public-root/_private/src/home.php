<?php
$sample = cvData([
    'name'=>'Ioana Dobre', 'role'=>'Coordonator operațiuni', 'city'=>'Târgoviște', 'email'=>'ioana@example.com',
    'summary'=>'Coordonez activitatea echipelor și urmăresc termenele de livrare. Îmi place să organizez procesele astfel încât echipa să știe ce are de făcut în fiecare zi.',
    'work'=>[['period'=>'2022 – prezent','title'=>'Coordonator operațiuni','org'=>'Nord Logistic','details'=>'Planific turele echipei și urmăresc comenzile până la livrare.']],
    'education'=>[['period'=>'2018 – 2021','title'=>'Licență în management','org'=>'Universitatea Valahia din Târgoviște']],
    'languages'=>'Română — limbă maternă · Engleză — B2',
]);
?>
<?php if ($path === '/'): ?>
<main>
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <p class="eyebrow">CREATOR DE CV-URI ÎN ROMÂNĂ</p>
      <h1>CV-ul tău,<br><em>gata de trimis.</em></h1>
      <p class="lead">Alege formatul și limba, adaugă o fotografie și completează CV-ul pas cu pas. La final îl vezi exact cum va arăta pe hârtie.</p>
      <div class="hero-actions"><a class="button" href="/cv/editor">Creează CV-ul</a><a class="text-link" href="/cv/model-cv-europass">Vezi modelul</a></div>
      <p class="muted">Previzualizare gratuită · PDF, tipărire și e-mail</p>
      <?php if (demo()): ?><p class="muted">Versiune demonstrativă. Plata este simulată.</p><?php endif; ?>
    </div>
    <div class="stage"><span class="stage-label">PREVIZUALIZARE MODEL</span><div class="sheet"><?= resume($sample) ?></div></div>
  </div></section>
  <section class="wrap benefits" aria-label="Cum funcționează">
    <article><h2>Scrii sau dictezi</h2><p>Transformi experiența în formulări clare și verifici sugestiile înainte de a le folosi.</p></article>
    <article><h2>Îți găsești școala</h2><p>Cauți după nume și localitate. Poți adăuga manual orice instituție.</p></article>
    <article><h2>Trimiți CV-ul</h2><p>Verifici documentul complet, apoi alegi să îl descarci, să îl tipărești sau să îl trimiți pe e-mail.</p></article>
  </section>
  <section class="wrap guides"><h2>Modele și ghiduri de CV</h2><?php foreach ($guides as $url=>$guide): ?><a href="<?= e('/cv' . $url) ?>"><?= e($guide[0]) ?></a><?php endforeach; ?></section>
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
