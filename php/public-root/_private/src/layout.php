<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<?php if (isset($description)): ?><meta name="description" content="<?= e($description) ?>"><?php endif; ?>
<?php if (isset($canonical)): ?><link rel="canonical" href="<?= e($canonical) ?>"><?php endif; ?>
<link rel="stylesheet" href="/cv/assets/site.css?v=4">
<link rel="stylesheet" href="/cv/assets/resume.css?v=2">
<script defer src="/cv/assets/editor.js?v=5"></script>
</head>
<body>
<?php if (empty($bare)): ?>
<header class="site-head"><div class="wrap top">
  <a class="brand" href="/cv/" aria-label="CV-ul.ro, prima pagină"><span class="brand-mark">cv.</span> CV-ul<span>.ro</span></a>
  <nav aria-label="Navigare principală"><a class="nav-link" href="/cv/model-cv-europass">Model de CV</a><a class="button small" href="/cv/editor">Deschide editorul</a></nav>
</div></header>
<?php endif; ?>
<?= $content ?>
<?php if (empty($bare)): ?>
<footer class="wrap footer"><a class="brand" href="/cv/">CV-ul<span>.ro</span></a><p>Creator independent de CV-uri</p></footer>
<?php endif; ?>
</body></html>
