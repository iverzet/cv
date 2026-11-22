<?php $labels = cvLabels($cv['language']); ?>
<article class="resume format-<?= e($cv['format']) ?>" lang="<?= e($cv['language']) ?>">
  <header class="cv-head">
    <div><p class="cv-label">Curriculum vitae</p><h1><?= e($cv['name'] ?: $labels['name']) ?></h1>
      <?php if ($cv['role']): ?><p class="cv-role"><?= e($cv['role']) ?></p><?php endif; ?>
      <?php if ($contact = implode(' · ', array_filter([$cv['city'],$cv['phone'],$cv['email']]))): ?><p class="cv-contact"><?= e($contact) ?></p><?php endif; ?>
    </div>
    <?php if ($cv['photo']): ?><img class="cv-photo" src="<?= e($cv['photo']) ?>" alt="<?= e($labels['photo']) ?>"><?php endif; ?>
  </header>
  <?php if ($cv['summary']): ?><section><h2><?= e($labels['summary']) ?></h2><p><?= e($cv['summary']) ?></p></section><?php endif; ?>
  <?php foreach (['work','education'] as $key): ?>
    <?php if ($cv[$key]): ?><section><h2><?= e($labels[$key]) ?></h2>
      <?php foreach ($cv[$key] as $row): ?><div class="cv-entry">
        <div class="cv-date"><?= e($row['period']) ?></div>
        <div><?php if ($row['title']): ?><h3><?= e($row['title']) ?></h3><?php endif; ?>
          <?php if ($row['org']): ?><p class="cv-org"><?= e($row['org']) ?></p><?php endif; ?>
          <?php if ($row['details']): ?><p><?= e($row['details']) ?></p><?php endif; ?>
        </div>
      </div><?php endforeach; ?>
    </section><?php endif; ?>
  <?php endforeach; ?>
  <?php foreach (['skills','languages','driving'] as $key): ?>
    <?php if ($cv[$key]): ?><section><h2><?= e($labels[$key]) ?></h2><p><?= e($cv[$key]) ?></p></section><?php endif; ?>
  <?php endforeach; ?>
</article>
