<?php $labels = cvLabels($cv['language']); ?>
<article class="resume format-<?= e($cv['format']) ?>" lang="<?= e($cv['language']) ?>">
  <header class="cv-head<?= $cv['photo'] ? ' has-photo' : '' ?>">
    <div><?php if ($cv['format'] === 'europass'): ?><p class="cv-label">✦ europass</p><?php endif; ?><h1><?= e($cv['name'] ?: $labels['name']) ?></h1>
      <?php if ($cv['role']): ?><p class="cv-role"><?= e($cv['role']) ?></p><?php endif; ?>
    </div>
    <?php if ($cv['photo']): ?><img class="cv-photo" src="<?= e($cv['photo']) ?>" alt="<?= e($labels['photo']) ?>"><?php endif; ?>
  </header>
  <div class="cv-columns">
  <div class="cv-main">
  <?php if ($cv['summary']): ?><section><h2><?= e($labels['summary']) ?></h2><p><?= e($cv['summary']) ?></p></section><?php endif; ?>
  <?php foreach (['work','education'] as $key): ?>
    <?php if ($cv[$key]): ?><section><h2><?= e($labels[$key]) ?></h2>
      <?php foreach ($cv[$key] as $row): ?><div class="cv-entry">
        <div><?php if ($row['title']): ?><h3><?= e($row['title']) ?></h3><?php endif; ?>
          <?php if ($row['org']): ?><p class="cv-org"><?= e($row['org']) ?></p><?php endif; ?>
          <?php if ($row['period']): ?><p class="cv-date"><?= e($row['period']) ?></p><?php endif; ?>
          <?php if ($row['details']): ?><p><?= e($row['details']) ?></p><?php endif; ?>
        </div>
      </div><?php endforeach; ?>
    </section><?php endif; ?>
  <?php endforeach; ?>
  </div>
  <div class="cv-aside">
  <?php if ($contact = array_filter([$cv['email'],$cv['phone'],$cv['city']])): ?>
    <section><h2><?= e($labels['contact']) ?></h2><p><?= e(implode("
", $contact)) ?></p></section>
  <?php endif; ?>
  <?php foreach (['skills','languages','driving'] as $key): ?>
    <?php if ($cv[$key]): ?><section><h2><?= e($labels[$key]) ?></h2><p><?= e($cv[$key]) ?></p></section><?php endif; ?>
  <?php endforeach; ?>
  </div>
  </div>
</article>
