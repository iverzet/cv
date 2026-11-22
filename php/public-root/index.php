<?php
declare(strict_types=1);
require __DIR__ . '/_private/src/app.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/cv/';
if ($uri !== '/cv' && !str_starts_with($uri, '/cv/')) { http_response_code(404); exit; }
$path = substr($uri, 3) ?: '/';
$base = 'https://botezul-meu.ro/cv';
$guides = [
    '/model-cv-europass'=>['Model CV Europass cu poză','Completează în ordine invers cronologică experiența și studiile. Pentru fiecare rol, scrie ce ai făcut, cu cine ai lucrat și ce rezultate poți confirma.'],
    '/cv-fara-experienta'=>['CV fără experiență','Începe cu studiile și proiectele relevante. Menționează practica, voluntariatul și responsabilitățile pe care le-ai avut.'],
    '/exemple-cv'=>['Exemple de CV pe meserii','Vezi exemple de responsabilități pe care le poți adapta la experiența ta ca lucrător comercial, operator sau asistent administrativ.'],
];
$pages = ['/', ...array_keys($guides)];
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Security-Policy: default-src \'self\'; img-src \'self\' data: blob:; style-src \'self\'; frame-ancestors \'none\'; base-uri \'none\'; form-action \'self\'');

if ($path === '/robots.txt') {
    header('Content-Type: text/plain; charset=UTF-8');
    echo "User-agent: *\nAllow: /\nSitemap: $base/sitemap.xml\n";
    exit;
}
if ($path === '/sitemap.xml') {
    header('Content-Type: application/xml; charset=UTF-8');
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($pages as $page) echo '<url><loc>' . e($base . $page) . '</loc></url>';
    echo '</urlset>';
    exit;
}
if (in_array($path, $pages, true)) {
    echo html('layout', [
        'title'=>($guides[$path][0] ?? 'Creator de CV online în română') . ' | CV-ul.ro',
        'description'=>$guides[$path][1] ?? 'Creează un CV în română, cu structură Europass, fotografie și asistent AI. Alege formatul, limba și fotografia, apoi completează CV-ul pas cu pas.',
        'canonical'=>$base . $path,
        'content'=>html('home', ['path'=>$path,'guides'=>$guides]),
    ]);
    exit;
}

header('X-Robots-Tag: noindex, nofollow');
if ($path === '/_private' || str_starts_with($path, '/_private/')) { http_response_code(403); exit; }
header('Cache-Control: private, no-store');
header('Referrer-Policy: no-referrer');
ini_set('session.use_strict_mode', '1');
session_name('CVULSID');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Lax','path'=>'/cv']);
session_start();
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$_SESSION['draft'] ??= bin2hex(random_bytes(16));
$_SESSION['cv'] ??= cvData([]);
$cv = cvData($_SESSION['cv']);

function respond(array $result, int $status=200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function throttle(string $bucket, int $limit): void {
    $window = (int) floor(time() / 3600);
    $dir = sys_get_temp_dir() . '/cv-ul-rate-' . substr(hash('sha256', __DIR__), 0, 16);
    if (!is_dir($dir) && !@mkdir($dir, 0700) && !is_dir($dir)) throw new RuntimeException('Acțiunea nu este disponibilă temporar.');
    $file = $dir . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'local') . '|' . $bucket);
    $handle = fopen($file, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) throw new RuntimeException('Acțiunea nu este disponibilă temporar.');
    try {
        [$last, $count] = array_pad(explode(':', (string)stream_get_contents($handle), 2), 2, 0);
        $count = (int)$last === $window ? (int)$count : 0;
        if ($count >= $limit) throw new RuntimeException('Ai atins limita temporară. Încearcă mai târziu.');
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, $window . ':' . ($count + 1));
    } finally { fclose($handle); }
}

try {
    if ($path === '/api/institutii' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        respond(['results'=>catalog(clean($_GET['q'] ?? ''), clean($_GET['judet'] ?? ''), clean($_GET['tip'] ?? ''))]);
    }
    if ($path === '/editor') {
        echo html('layout', ['title'=>'Editor CV | CV-ul.ro','content'=>html('editor', [
            'cv'=>$cv,'csrf'=>$_SESSION['csrf'],'paid'=>!empty($_SESSION['paid']),
            'message'=>$_SESSION['message'] ?? '',
        ])]);
        unset($_SESSION['message']);
        exit;
    }
    if ($path === '/plata' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $id = clean($_GET['session_id'] ?? '');
        if ($id !== '' && $id === ($_SESSION['checkout'] ?? '')) {
            $checkout = stripe($id);
            if (($checkout['client_reference_id'] ?? '') === $_SESSION['draft']
                && ($checkout['payment_status'] ?? '') === 'paid'
                && ($checkout['currency'] ?? '') === 'ron' && ($checkout['amount_total'] ?? 0) === 500) {
                $_SESSION['paid'] = true;
                $_SESSION['message'] = 'Plata a fost confirmată. Poți exporta CV-ul.';
            } else {
                $_SESSION['message'] = 'Plata nu este confirmată încă. Poți reîncărca pagina de confirmare.';
            }
        }
        header('Location: /cv/editor', true, 303);
        exit;
    }
    if ($path === '/pdf' || $path === '/print') {
        if (empty($_SESSION['paid'])) { http_response_code(403); exit('Exportul se deblochează după plată.'); }
        session_write_close();
        if ($path === '/print') {
            echo html('layout', ['title'=>'Tipărește CV-ul','bare'=>true,'content'=>'<button class="print-now button" data-print>Tipărește</button>' . resume($cv)]);
        } else {
            throttle('pdf', 25);
            $document = pdf($cv);
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="CV.pdf"');
            echo $document;
        }
        exit;
    }
    if (str_starts_with($path, '/api/') && $_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) respond(['error'=>'Reîncarcă editorul și încearcă din nou.'], 403);
        $body = file_get_contents('php://input', false, null, 0, 700001);
        if (!is_string($body) || strlen($body) > 700000) respond(['error'=>'Datele depășesc limita.'], 413);
        $input = json_decode($body, true);
        if (!is_array($input)) respond(['error'=>'Date invalide.'], 400);
        if ($path === '/api/salveaza') {
            $_SESSION['cv'] = cvData($input);
            respond(['ok'=>true]);
        }
        if ($path === '/api/checkout') {
            if ($cv['name'] === '') throw new InvalidArgumentException('Completează numele înainte de export.');
            if (!empty($_SESSION['paid'])) respond(['url'=>'/cv/editor']);
            if (demo()) { $_SESSION['paid'] = true; respond(['url'=>'/cv/editor']); }
            throttle('checkout', 12);
            $checkout = stripe();
            $_SESSION['checkout'] = $checkout['id'];
            respond(['url'=>$checkout['url']]);
        }
        if ($path === '/api/reia-plata') {
            $id = $_SESSION['checkout'] ?? '';
            if ($id === '') throw new InvalidArgumentException('Nu există o plată începută.');
            respond(['url'=>'/cv/plata?session_id=' . rawurlencode($id)]);
        }
        if ($path === '/api/ai') {
            $task = clean($input['task'] ?? '');
            $source = clean($input['text'] ?? '', 11000);
            $job = clean($input['job'] ?? '', 5500);
            if ($source === '' || ($task === 'job' && $job === '')) throw new InvalidArgumentException('Completează textul necesar pentru sugestie.');
            session_write_close();
            throttle('ai', 12);
            respond(ai($task, $source, $job));
        }
        if ($path === '/api/mail') {
            if (empty($_SESSION['paid'])) respond(['error'=>'Deblochează mai întâi exportul.'], 403);
            $recipient = clean($input['email'] ?? '');
            if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Verifică adresa de e-mail.');
            if (demo()) respond(['message'=>'Trimiterea a fost simulată. Nu s-a expediat un e-mail.']);
            $from = env('CV_MAIL_FROM');
            if (!filter_var($from, FILTER_VALIDATE_EMAIL)) throw new RuntimeException('Serviciul de e-mail necesită configurare.');
            session_write_close();
            throttle('mail', 5);
            $boundary = 'cv_' . bin2hex(random_bytes(16));
            $message = "--$boundary\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nGăsești CV-ul în atașament.\r\n"
                . "--$boundary\r\nContent-Type: application/pdf; name=CV.pdf\r\nContent-Disposition: attachment; filename=CV.pdf\r\n"
                . "Content-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode(pdf($cv))) . "--$boundary--\r\n";
            $headers = ['From'=>$from,'MIME-Version'=>'1.0','Content-Type'=>"multipart/mixed; boundary=$boundary"];
            if (!mail($recipient, 'CV de la CV-ul.ro', $message, $headers)) throw new RuntimeException('Mesajul nu a putut fi predat serviciului de e-mail.');
            respond(['message'=>'CV-ul a fost predat serviciului de e-mail.']);
        }
    }
} catch (InvalidArgumentException | RuntimeException $error) {
    if (str_starts_with($path, '/api/')) respond(['error'=>$error->getMessage()], 422);
    http_response_code(422);
    echo e($error->getMessage()) . ' <a href="/cv/editor">Înapoi la editor</a>';
    exit;
}
http_response_code(404);
echo html('layout', ['title'=>'Pagină negăsită | CV-ul.ro','content'=>'<main class="wrap prose"><h1>Pagină negăsită</h1><a href="/cv/">Înapoi la prima pagină</a></main>']);
