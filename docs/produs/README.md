# CV-ul.ro — direcția mobilă aprobată

## Prototip

Descarcă [prototipul mobil](prototip-mobil.html) și deschide-l în browser. Rulează local cu date fictive. Autentificarea, importul, analiza, plata și exportul sunt simulate. Traseele interactive au fost verificate în Chromium la 320, 390 și 736 px.

## Fluxul aprobat

1. Intrare cu Google sau cu număr de telefon și SMS. După configurarea unei chei de acces, revenire cu amprenta sau Face ID, când dispozitivul permite.
2. Pe ecranul de start se aleg **CV nou** sau **Adaptează CV-ul pentru un job**.
3. CV nou pornește cu numele și rolul, apoi oferă completare ghidată sau manuală.
4. Adaptarea pornește de la un CV existent și o ofertă ca text, PDF sau captură. Utilizatorul verifică textul extras înainte de analiză.
5. În revizuire se văd cerința, pasajul de origine din CV și formularea propusă. Utilizatorul acceptă, editează sau păstrează originalul. Cerințele nedovedite pot deschide o întrebare scurtă.
6. Versiunea pentru job este separată de CV-ul de bază. Previzualizarea este disponibilă înainte de export. Ipoteza de pilot este 5 lei o singură dată pentru PDF, print și e-mail pentru acea versiune.

Implementarea rămâne în PHP sub /cv. Designul PHP anterior, capturile desktop și mobil și PDF-urile fictive sunt în [docs/preview](../preview). Noul flux este aprobat ca direcție de produs. Prototipul este separat de aplicația PHP.

## Cercetare de produs

| Reper | Fapt sau funcție observată | Decizia pentru CV-ul.ro |
|---|---|---|
| [CVDesignR](https://www.cvdesignr.com/fr/adapter-cv-offre-emploi) | Propuneri pentru profil, competențe și experiențe, pornind de la ofertă | Leagă fiecare propunere de cerință și pasajul de origine |
| [Kickresume](https://www.kickresume.com/en/resume-tailoring/) | Intensități de adaptare și raport cu modificări | Arată justificările în ecranul de revizuire |
| [Enhancv](https://enhancv.com/uk/features/cv-mcp/) | Copie de CV pe ofertă | Păstrează versiuni independente pe candidatură |
| [Lebenslauf.de](https://www.lebenslauf.de/ratgeber/lebenslauf/aufbau-und-gestaltung/aktive-gestaltung/) | Asistență punctuală în editor | Pune reformularea în dreptul pasajului editat |
| [InfoJobs](https://orientacion-laboral.infojobs.net/actualiza-tu-perfil-directamente-desde-la-oferta-de-empleo/) | Completarea profilului în contextul unei oferte | Cere clarificări doar când sunt necesare |
| [Europass](https://europass.europa.eu/en/faq?page=2&title=) | Mai multe CV-uri din profil și export local | Separă profilul și limba documentului de candidatură |
| [LolCV](https://lolcv.com/tailor-cv-to-job) · [JobTailor](https://www.jobtailor.app/) | Captură sau PDF pentru anunț și revizuirea propunerilor în instrumente separate | Prioritizează importul din galerie și verificarea sugestiilor pe telefon |
| [HiringCV](https://hiringcv.ro/adapteaza-cv-pentru-job) · [CVExpert](https://cvexpert.ro/) · [CVhub](https://cvhub.ro/) · [CVmotive](https://www.cvmotive.com/ro/adaptare-cv-la-anunt) | Adaptarea la o ofertă și analiza potrivirii apar deja în produse în română | Testează cât de repede se corectează captura și cât de ușor se verifică propunerile |

Cercetarea a folosit pagini publice, documentație și verificări ale interfețelor accesibile. Calitatea rescrierilor competitorilor necesită un test comparativ cu aceleași intrări. [Greenhouse](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse) și [Lever](https://help.lever.co/s/article/Understanding-Resume-Parsing) documentează limite ale extragerii. Exportul trebuie verificat pentru text selectabil, diacritice și ordine de citire.

## Economie și pilot

La 5 lei, [Stripe România](https://stripe.com/en-ro/pricing) afișează 1,5% + 1 leu pentru carduri standard SEE, aproximativ 1,08 lei pe tranzacție. La un cost estimat de 0,05 lei pe analiză și 10% conversie, contribuția înainte de găzduire, promovare, rambursări și impozite este de aproximativ 3,42 lei per CV vândut, respectiv 2,55 lei dacă prețul include TVA de 21% aplicabil.

În testul local, trei perechi fictive CV–anunț au avut 262, 590 și 1.465 tokeni de intrare. Cu bugete de 650, 900 și 1.500 tokeni la ieșire și [tariful GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), costurile estimate au fost 1,5, 2,2 și 3,8 bani. Costul facturat al fluxului complet și conversia reală nu au fost măsurate. Pilotul are nevoie de acces API cu buget plafonat, de trafic real și de plăți confirmate. Măsurăm costul total AI al cohortei, inclusiv reîncercările, și îl repartizăm la numărul de CV-uri plătite.
