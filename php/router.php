<?php
// Router for local development. Apache uses the .htaccess files in dist/cv.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!is_string($path) || ($path !== '/cv' && !str_starts_with($path, '/cv/'))) {
    http_response_code(404);
    exit;
}
if (preg_match('~^/cv/assets/(?:editor\.js|document-ocr\.js|site\.css|resume\.css|ocr/(?:tesseract\.min\.js|worker\.min\.js|tesseract-core-lstm\.wasm\.js|tesseract-core-lstm\.wasm|ron\.traineddata\.gz))$~D', $path)
    && is_file(__DIR__ . '/dist' . $path)) {
    if (str_ends_with($path, '/worker.min.js')) {
        header("Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'");
    }
    return false;
}
require __DIR__ . '/dist/cv/index.php';
