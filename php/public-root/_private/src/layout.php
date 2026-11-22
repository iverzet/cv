<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?></title>
<?php if (isset($description)): ?><meta name="description" content="<?= e($description) ?>"><?php endif; ?>
<?php if (isset($canonical)): ?><link rel="canonical" href="<?= e($canonical) ?>"><?php endif; ?>
<link rel="stylesheet" href="/cv/assets/fonts.css?v=1">
<link rel="stylesheet" href="/cv/assets/site.css?v=5">
<link rel="stylesheet" href="/cv/assets/resume.css?v=3">
<script defer src="/cv/assets/editor.js?v=6"></script>
</head>
<body>
<?php if (empty($bare)): ?>
<header class="site-head"><div class="wrap top">
  <a class="brand" href="/cv/" aria-label="CV-ul.ro, prima pagină"><span class="brand-mark" aria-hidden="true">✱</span> CV-ul<span>.ro</span></a>
  <p class="header-note">Un pas înainte. În felul tău.</p>
  <nav aria-label="Navigare principală"><a class="secondary small" href="/cv/editor">CV-ul meu ↗</a></nav>
</div></header>
<?php endif; ?>
<?= $content ?>
<?php if (empty($bare)): ?>
<footer class="wrap footer"><a class="brand" href="/cv/">CV-ul<span>.ro</span></a><p>Creator independent de CV-uri</p></footer>
<?php endif; ?>
</body></html>
