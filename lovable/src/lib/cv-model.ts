export const EXPORT_PRICE = 5;
export const EXPORT_PAYMENT = 'one-time';
export const languages = ['Română', 'Engleză', 'Franceză', 'Italiană', 'Spaniolă', 'Germană'] as const;
export type Language = typeof languages[number];
export type Format = 'Europass' | 'Modern' | 'Clasic';
export const labels: Record<Language, {experience:string; education:string; skills:string; languages:string; profile:string; contact:string}> = {
 Română: {experience:'Experiență profesională', education:'Educație', skills:'Competențe', languages:'Limbi străine',profile:'Profil',contact:'Contact'},
 Engleză: {experience:'Work experience',education:'Education',skills:'Skills',languages:'Languages',profile:'Profile',contact:'Contact'},
 Franceză: {experience:'Expérience professionnelle',education:'Formation',skills:'Compétences',languages:'Langues',profile:'Profil',contact:'Contact'},
 Italiană: {experience:'Esperienza professionale',education:'Istruzione',skills:'Competenze',languages:'Lingue',profile:'Profilo',contact:'Contatti'},
 Spaniolă: {experience:'Experiencia profesional',education:'Educación',skills:'Competencias',languages:'Idiomas',profile:'Perfil',contact:'Contacto'},
 Germană: {experience:'Berufserfahrung',education:'Ausbildung',skills:'Fähigkeiten',languages:'Sprachen',profile:'Profil',contact:'Kontakt'},
};
export const questions = ['Unde ai lucrat?', 'Ce post ai avut?', 'În ce perioadă?', 'Ce responsabilități aveai?', 'Ce rezultat ai obținut?'];
export const demoAnswers = ['Studio Nord, București', 'Specialist marketing', 'Martie 2022 – prezent', 'Am coordonat campaniile de comunicare și am gestionat conținutul pentru rețelele sociale.', 'Am crescut comunitatea online cu 35% într-un an.'];
export interface Experience { company:string; role:string; period:string; responsibilities:string; result:string }
export interface Education { school:string; degree:string; period:string }
export interface CVData { name:string; role:string; email:string; phone:string; city:string; profile:string; photo:string; experiences:Experience[]; education:Education[]; skills:string[]; foreignLanguages:string[] }
export const initialCV:CVData = {name:'Andreea Popescu',role:'Specialist marketing',email:'andreea@example.com',phone:'0722 000 123',city:'București, România',profile:'Îmi place să transform ideile în proiecte cu impact. Sunt o persoană organizată, creativă și atentă la detalii.',photo:'',experiences:[{company:'Studio Nord, București',role:'Specialist marketing',period:'Martie 2022 – prezent',responsibilities:'Coordonarea campaniilor de comunicare și gestionarea conținutului pentru rețelele sociale.',result:'Creșterea comunității online cu 35% într-un an.'}],education:[{school:'Academia de Studii Economice, București',degree:'Licență în Marketing',period:'2018 – 2021'}],skills:['Comunicare','Marketing digital','Microsoft Office','Lucru în echipă'],foreignLanguages:['Română · Nativ','Engleză · B2']};
