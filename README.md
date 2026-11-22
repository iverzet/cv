# CV-ul.ro

Punct de plecare pentru Codex. Proiectul are două aplicații:

| Director | Ce conține |
| --- | --- |
| `php/` | Aplicația funcțională publicată sub `/cv`, inclusiv editorul, sesiunea, PDF/print, catalogul și OCR în browser. Sursa: `iverzet/nunta-mea-botezul-meu@435be9d`. |
| `lovable/` | Prototipul premium din „Screenshot Exact Match”, cu editor foto și interviu separat în `src/routes/interviu.tsx`. Sursa: [Lovable](https://lovable.dev/projects/a6aacffb-8602-4cdd-a746-d0bf008c997e), commit `9970fce96b1e4271e09340948261f6550fa511d2`. Portretul demonstrativ este inclus local. |

## Rulare locală

**Lovable** (Node.js 22+ și Bun):

```sh
cd lovable
bun install --frozen-lockfile
bun run dev
bun run test
```

**PHP** (Node.js 22+, PHP 8.2+ cu DOM și mbstring, curl, unzip, tar):

```sh
cd php
node stage.mjs
php -S localhost:8000 -t dist router.php
```

Deschide `http://localhost:8000/cv/editor`. Buildul pregătește local dependențele Dompdf și OCR, verificate prin SHA-256. Adresele canonice și revenirea după plata reală păstrează domeniul de producție. În configurarea implicită, plata și e-mailul sunt simulate. Catalogul preuniversitar provine din [rețeaua școlară 2025–2026](https://data.gov.ro/dataset/retea-scolara-2025-2026) (CC BY 4.0). Universitățile provin din anexele HG 191/2026.

## Continuarea în Codex

Folosește prototipul Lovable ca referință vizuală și aplicația PHP drept bază funcțională. Primul pas este să compari cele două interviuri și să transpui în PHP aspectul și comportamentul aprobat din prototip. Integrarea designului Lovable peste PHP este o etapă separată. Rulează verificările înainte de a schimba orice publicare a site-ului existent.
