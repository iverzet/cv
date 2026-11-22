<?php
declare(strict_types=1);

const CV_LANGUAGES = ['ro'=>'Română', 'en'=>'Engleză', 'fr'=>'Franceză', 'it'=>'Italiană', 'es'=>'Spaniolă', 'de'=>'Germană'];
const CV_FORMATS = [
    'europass'=>['Europass', 'Structură europeană, cu datele și perioadele ușor de urmărit.'],
    'modern'=>['Modern', 'Antet colorat și secțiuni bine delimitate.'],
    'classic'=>['Clasic', 'Aspect sobru, potrivit pentru imprimare alb-negru.'],
];

function cvLabels(string $language): array {
    $translations = [
        'ro'=>['Numele tău', 'Despre mine', 'Experiență profesională', 'Educație și formare', 'Competențe', 'Limbi străine', 'Fotografie candidat', 'Permis de conducere', 'Contact'],
        'en'=>['Your name', 'About me', 'Work experience', 'Education and training', 'Skills', 'Languages', 'Candidate photo', 'Driving licence', 'Contact'],
        'fr'=>['Votre nom', 'À propos', 'Expérience professionnelle', 'Formation et études', 'Compétences', 'Langues', 'Photo du candidat', 'Permis de conduire', 'Coordonnées'],
        'it'=>['Il tuo nome', 'Profilo personale', 'Esperienza professionale', 'Istruzione e formazione', 'Competenze', 'Lingue', 'Foto del candidato', 'Patente di guida', 'Contatti'],
        'es'=>['Tu nombre', 'Sobre mí', 'Experiencia profesional', 'Educación y formación', 'Competencias', 'Idiomas', 'Foto del candidato', 'Permiso de conducir', 'Contacto'],
        'de'=>['Dein Name', 'Über mich', 'Berufserfahrung', 'Bildung und Ausbildung', 'Fähigkeiten', 'Sprachkenntnisse', 'Bewerbungsfoto', 'Führerschein', 'Kontakt'],
    ];
    return array_combine(['name','summary','work','education','skills','languages','photo','driving','contact'], $translations[$language] ?? $translations['ro']);
}
