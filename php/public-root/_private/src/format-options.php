<?php
$sample = sampleCv();
?>
    <div class="format-grid">
      <?php foreach (CV_FORMATS as $id => [$name, $description]): ?>
        <div class="format-card">
          <input type="radio" name="format" aria-label="<?= e($name) ?>" value="<?= e($id) ?>" <?= $id === $selectedFormat ? 'checked' : '' ?>>
          <div class="format-art">
            <span class="format-tag"><?= e(['europass'=>'Standard european','modern'=>'Alegerea noastră','classic'=>'Atemporal'][$id]) ?></span>
            <div class="mini-sheet" aria-hidden="true"><?= resume(array_replace($sample,['format'=>$id,'photo'=>'/cv/assets/cv-portrait.png'])) ?></div>
            <span class="select-check" aria-hidden="true"></span>
          </div>
          <strong><?= e($name) ?></strong><small><?= e($description) ?></small>
        </div>
      <?php endforeach; ?>
    </div>
