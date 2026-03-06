#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

function slugify(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function r50(n) { return Math.round(n / 50) * 50; }
function r100(n) { return Math.round(n / 100) * 100; }

// ── DOMENII (20) ──
const domenii = [
  { id:'it-comunicatii', nume:'IT & Comunicații', slug:'it-comunicatii', descriere:'Domeniul IT & Comunicații acoperă dezvoltarea software, administrarea rețelelor, securitate cibernetică, analiză de date și telecomunicații. Salariile sunt printre cele mai mari din economie, iar cererea de specialiști depășește constant oferta.', icon:'monitor', metaTitle:'Meserii în IT & Comunicații - Cariere, Salarii și Competențe', metaDescription:'Meseriile din IT & Comunicații în România: salarii, competențe necesare, cerere pe piața muncii și trasee de carieră pentru fiecare rol.' },
  { id:'constructii', nume:'Construcții', slug:'constructii', descriere:'Domeniul construcțiilor cuprinde activități de edificare, renovare și întreținere a clădirilor rezidențiale, comerciale și industriale. Include meserii tradiționale și specializări moderne în materiale și tehnologii de construcție.', icon:'building', metaTitle:'Meserii în Construcții - Cariere, Salarii și Competențe', metaDescription:'Meseriile din construcții în România: salarii pe orașe, calificări necesare, condiții de muncă și cerere pe piață pentru fiecare meserie.' },
  { id:'sanatate', nume:'Sănătate', slug:'sanatate', descriere:'Domeniul sănătății include profesii medicale, paramedicale și de asistență sanitară. De la medici specialiști la asistenți medicali și tehnicieni, sectorul oferă locuri de muncă stabile și deficit cronic de personal.', icon:'heart-pulse', metaTitle:'Meserii în Sănătate - Cariere Medicale, Salarii și Competențe', metaDescription:'Cariere medicale în România: salarii actualizate, studii necesare, competențe cerute și cerere pe piața muncii pentru fiecare profesie.' },
  { id:'educatie', nume:'Educație', slug:'educatie', descriere:'Domeniul educației cuprinde profesii legate de predare, formare profesională și dezvoltare a competențelor. Include cadre didactice din învățământul preuniversitar și universitar, formatori și specialiști în dezvoltare curriculară.', icon:'graduation-cap', metaTitle:'Meserii în Educație - Cariere Didactice, Salarii și Competențe', metaDescription:'Cariere didactice în România: salarii profesori, competențe pedagogice, cerințe de studii și grade, evoluție profesională.' },
  { id:'industrie-productie', nume:'Industrie & Producție', slug:'industrie-productie', descriere:'Domeniul industriei și producției acoperă fabricarea, asamblarea și prelucrarea bunurilor materiale. Include meserii din industria auto, alimentară, chimică, metalurgică și electronică.', icon:'factory', metaTitle:'Meserii în Industrie & Producție - Cariere, Salarii și Competențe', metaDescription:'Meseriile din industrie și producție în România: salarii pe orașe, calificări necesare, condiții de muncă și cerere de personal.' },
  { id:'transport-logistica', nume:'Transport & Logistică', slug:'transport-logistica', descriere:'Transportul și logistica asigură deplasarea mărfurilor și persoanelor pe cale rutieră, feroviară, navală și aeriană. Sectorul include șoferi profesioniști, logisticieni, piloți și operatori de depozit.', icon:'truck', metaTitle:'Meserii în Transport & Logistică - Cariere, Salarii și Competențe', metaDescription:'Meseriile din transport și logistică în România: salarii șoferi, logisticieni, piloți, cerințe și condiții de muncă.' },
  { id:'agricultura', nume:'Agricultură & Silvicultură', slug:'agricultura', descriere:'Agricultura și silvicultura cuprind cultivarea plantelor, creșterea animalelor și exploatarea durabilă a pădurilor. Sectorul se modernizează rapid cu tehnologii de precizie și practici sustenabile.', icon:'leaf', metaTitle:'Meserii în Agricultură - Cariere, Salarii și Competențe', metaDescription:'Meseriile din agricultură și silvicultură în România: salarii, calificări, condiții de muncă și cerere pe piața forței de muncă.' },
  { id:'horeca', nume:'HoReCa', slug:'horeca', descriere:'Sectorul HoReCa (hoteluri, restaurante, catering) oferă servicii de cazare, alimentație publică și organizare de evenimente. Este un angajator major, cu cerere sezonieră ridicată și posibilități de avansare rapidă.', icon:'utensils', metaTitle:'Meserii în HoReCa - Cariere, Salarii și Competențe', metaDescription:'Meseriile din HoReCa în România: salarii bucătari, ospătari, barmani, manageri hotel, cerințe și trasee de carieră.' },
  { id:'comert-vanzari', nume:'Comerț & Vânzări', slug:'comert-vanzari', descriere:'Comerțul și vânzările acoperă activități de distribuție, retail și business-to-business. Include roluri de la casier și vânzător la key account manager și director comercial.', icon:'shopping-bag', metaTitle:'Meserii în Comerț & Vânzări - Cariere, Salarii și Competențe', metaDescription:'Meseriile din comerț și vânzări în România: salarii, competențe de vânzare, cerere pe piață și trasee de carieră.' },
  { id:'finante-banci', nume:'Finanțe & Bănci', slug:'finante-banci', descriere:'Sectorul financiar-bancar include contabilitate, audit, analiză financiară, servicii bancare și asigurări. Oferă stabilitate, salarii competitive și oportunități de dezvoltare profesională prin certificări internaționale.', icon:'banknote', metaTitle:'Meserii în Finanțe & Bănci - Cariere, Salarii și Competențe', metaDescription:'Meseriile din finanțe și bănci în România: salarii contabili, auditori, analiști, cerințe de studii și certificări profesionale.' },
  { id:'juridic', nume:'Juridic & Consultanță', slug:'juridic', descriere:'Domeniul juridic și de consultanță cuprinde profesii liberale și de consiliere: avocatură, notariat, consultanță în management și resurse umane. Necesită pregătire solidă și, adesea, examene de admitere în profesie.', icon:'scale', metaTitle:'Meserii în Juridic & Consultanță - Cariere, Salarii și Competențe', metaDescription:'Meseriile din juridic și consultanță în România: salarii avocați, notari, consultanți, cerințe de studii și acces în profesie.' },
  { id:'administratie-publica', nume:'Administrație Publică', slug:'administratie-publica', descriere:'Administrația publică include funcționari, inspectori, polițiști, pompieri și alți angajați ai statului. Oferă stabilitate, beneficii sociale și posibilități de avansare pe grade profesionale.', icon:'landmark', metaTitle:'Meserii în Administrație Publică - Cariere, Salarii și Competențe', metaDescription:'Meseriile din administrația publică în România: salarii funcționari, polițiști, pompieri, condiții de angajare și avansare.' },
  { id:'arte-cultura', nume:'Arte & Cultură', slug:'arte-cultura', descriere:'Domeniul artelor și culturii reunește creatori, performeri și specialiști în patrimoniu. Include actorie, regie, arte vizuale, design și conservare-restaurare, cu venituri variabile și satisfacție profesională ridicată.', icon:'palette', metaTitle:'Meserii în Arte & Cultură - Cariere, Salarii și Competențe', metaDescription:'Meseriile din arte și cultură în România: salarii artiști, designeri, fotografi, cerințe de formare și oportunități profesionale.' },
  { id:'media-comunicare', nume:'Media & Comunicare', slug:'media-comunicare', descriere:'Media și comunicarea acoperă jurnalism, relații publice, marketing digital și producție media. Sectorul se transformă rapid prin digitalizare, creând roluri noi în social media, SEO și content marketing.', icon:'megaphone', metaTitle:'Meserii în Media & Comunicare - Cariere, Salarii și Competențe', metaDescription:'Meseriile din media și comunicare în România: salarii jurnaliști, specialiști marketing, PR, cerințe și trasee de carieră.' },
  { id:'energie-utilitati', nume:'Energie & Utilități', slug:'energie-utilitati', descriere:'Sectorul energiei și utilităților include producerea, transportul și distribuția energiei electrice, gazelor naturale și apei. Tranziția energetică creează cerere pentru specialiști în surse regenerabile.', icon:'zap', metaTitle:'Meserii în Energie & Utilități - Cariere, Salarii și Competențe', metaDescription:'Meseriile din energie și utilități în România: salarii ingineri, tehnicieni, operatori, cerințe de studii și oportunități în energie verde.' },
  { id:'imobiliare', nume:'Imobiliare', slug:'imobiliare', descriere:'Domeniul imobiliar cuprinde tranzacții, evaluări, administrare proprietăți, arhitectură și urbanism. Piața imobiliară din România oferă oportunități variate, de la agenți la dezvoltatori și consultanți.', icon:'home', metaTitle:'Meserii în Imobiliare - Cariere, Salarii și Competențe', metaDescription:'Meseriile din imobiliare în România: salarii agenți, evaluatori, arhitecți, cerințe profesionale și oportunități pe piață.' },
  { id:'auto-reparatii', nume:'Auto & Reparații', slug:'auto-reparatii', descriere:'Sectorul auto și reparații include diagnosticarea, repararea și întreținerea vehiculelor. Odată cu electrificarea și digitalizarea automobilelor, crește cererea pentru tehnicieni cu competențe moderne.', icon:'wrench', metaTitle:'Meserii în Auto & Reparații - Cariere, Salarii și Competențe', metaDescription:'Meseriile din auto și reparații în România: salarii mecanici, electricieni auto, cerințe de calificare și oportunități profesionale.' },
  { id:'securitate', nume:'Securitate & Pază', slug:'securitate', descriere:'Securitatea și paza asigură protecția persoanelor, bunurilor și informațiilor. Include agenți de pază, specialiști SSM, consultanți securitate și tehnicieni de sisteme de alarmă și supraveghere.', icon:'shield', metaTitle:'Meserii în Securitate & Pază - Cariere, Salarii și Competențe', metaDescription:'Meseriile din securitate și pază în România: salarii agenți, specialiști SSM, cerințe de atestare și condiții de muncă.' },
  { id:'curatenie-mentenanta', nume:'Curățenie & Mentenanță', slug:'curatenie-mentenanta', descriere:'Curățenia și mentenanța asigură funcționarea și igiena clădirilor, echipamentelor și spațiilor verzi. Sectorul oferă locuri de muncă accesibile, cu cerere constantă în mediul urban.', icon:'sparkles', metaTitle:'Meserii în Curățenie & Mentenanță - Cariere, Salarii și Competențe', metaDescription:'Meseriile din curățenie și mentenanță în România: salarii, cerințe de calificare, condiții de muncă și oportunități de angajare.' },
  { id:'sport-fitness', nume:'Sport & Fitness', slug:'sport-fitness', descriere:'Domeniul sport și fitness include antrenori, instructori, kinetoterapeuți sportivi și manageri de facilități sportive. Piața crește odată cu interesul populației pentru un stil de viață sănătos.', icon:'dumbbell', metaTitle:'Meserii în Sport & Fitness - Cariere, Salarii și Competențe', metaDescription:'Meseriile din sport și fitness în România: salarii antrenori, instructori, cerințe de certificare și oportunități profesionale.' },
];

// ── ORAȘE (41) ──
const orase = [
  { id:'bucuresti', nume:'București', populatie:1794590, regiune:'Muntenia', coef:1.25 },
  { id:'cluj-napoca', nume:'Cluj-Napoca', populatie:324576, regiune:'Transilvania', coef:1.15 },
  { id:'timisoara', nume:'Timișoara', populatie:319279, regiune:'Banat', coef:1.10 },
  { id:'iasi', nume:'Iași', populatie:290422, regiune:'Moldova', coef:1.05 },
  { id:'brasov', nume:'Brașov', populatie:253200, regiune:'Transilvania', coef:1.05 },
  { id:'constanta', nume:'Constanța', populatie:283872, regiune:'Dobrogea', coef:1.05 },
  { id:'craiova', nume:'Craiova', populatie:269506, regiune:'Oltenia', coef:1.00 },
  { id:'galati', nume:'Galați', populatie:249432, regiune:'Moldova', coef:0.95 },
  { id:'oradea', nume:'Oradea', populatie:196367, regiune:'Crișana', coef:1.00 },
  { id:'sibiu', nume:'Sibiu', populatie:169611, regiune:'Transilvania', coef:1.05 },
  { id:'ploiesti', nume:'Ploiești', populatie:209945, regiune:'Muntenia', coef:1.00 },
  { id:'arad', nume:'Arad', populatie:159074, regiune:'Crișana', coef:1.00 },
  { id:'pitesti', nume:'Pitești', populatie:155383, regiune:'Muntenia', coef:1.00 },
  { id:'baia-mare', nume:'Baia Mare', populatie:123738, regiune:'Maramureș', coef:0.95 },
  { id:'buzau', nume:'Buzău', populatie:115494, regiune:'Muntenia', coef:0.90 },
  { id:'satu-mare', nume:'Satu Mare', populatie:102411, regiune:'Maramureș', coef:0.90 },
  { id:'botosani', nume:'Botoșani', populatie:106847, regiune:'Moldova', coef:0.85 },
  { id:'suceava', nume:'Suceava', populatie:92121, regiune:'Bucovina', coef:0.90 },
  { id:'ramnicu-valcea', nume:'Râmnicu Vâlcea', populatie:98776, regiune:'Oltenia', coef:0.90 },
  { id:'drobeta-turnu-severin', nume:'Drobeta-Turnu Severin', populatie:92617, regiune:'Oltenia', coef:0.85 },
  { id:'targu-mures', nume:'Târgu Mureș', populatie:134290, regiune:'Transilvania', coef:1.00 },
  { id:'bistrita', nume:'Bistrița', populatie:75076, regiune:'Transilvania', coef:0.90 },
  { id:'focsani', nume:'Focșani', populatie:73868, regiune:'Moldova', coef:0.85 },
  { id:'resita', nume:'Reșița', populatie:73282, regiune:'Banat', coef:0.85 },
  { id:'tulcea', nume:'Tulcea', populatie:63399, regiune:'Dobrogea', coef:0.85 },
  { id:'slatina', nume:'Slatina', populatie:70293, regiune:'Oltenia', coef:0.90 },
  { id:'calarasi', nume:'Călărași', populatie:65181, regiune:'Muntenia', coef:0.85 },
  { id:'giurgiu', nume:'Giurgiu', populatie:61353, regiune:'Muntenia', coef:0.85 },
  { id:'zalau', nume:'Zalău', populatie:56202, regiune:'Crișana', coef:0.85 },
  { id:'deva', nume:'Deva', populatie:61123, regiune:'Transilvania', coef:0.90 },
  { id:'alba-iulia', nume:'Alba Iulia', populatie:63536, regiune:'Transilvania', coef:0.90 },
  { id:'sfantu-gheorghe', nume:'Sfântu Gheorghe', populatie:56006, regiune:'Transilvania', coef:0.90 },
  { id:'vaslui', nume:'Vaslui', populatie:55407, regiune:'Moldova', coef:0.85 },
  { id:'targoviste', nume:'Târgoviște', populatie:79610, regiune:'Muntenia', coef:0.90 },
  { id:'miercurea-ciuc', nume:'Miercurea Ciuc', populatie:37980, regiune:'Transilvania', coef:0.85 },
  { id:'piatra-neamt', nume:'Piatra Neamț', populatie:85055, regiune:'Moldova', coef:0.90 },
  { id:'slobozia', nume:'Slobozia', populatie:45891, regiune:'Muntenia', coef:0.85 },
  { id:'alexandria', nume:'Alexandria', populatie:45434, regiune:'Muntenia', coef:0.85 },
  { id:'hunedoara', nume:'Hunedoara', populatie:60525, regiune:'Transilvania', coef:0.90 },
  { id:'medias', nume:'Mediaș', populatie:46006, regiune:'Transilvania', coef:0.90 },
  { id:'petrosani', nume:'Petroșani', populatie:34331, regiune:'Transilvania', coef:0.85 },
];

// ── COMPETENȚE (35) ──
const competenteBase = [
  { id:'programare', slug:'programare', nume:'Programare', descriere:'Abilitatea de a scrie, testa și menține cod sursă în diverse limbaje de programare. Include înțelegerea algoritmilor, structurilor de date și paradigmelor de programare.', categorie:'tehnice', metaTitle:'Competența: Programare - Meserii care necesită programare în România', metaDescription:'Meseriile care necesită competențe de programare în România: limbaje cerute, salarii pe nivel de experiență și trasee de carieră.' },
  { id:'managementul-proiectelor', slug:'managementul-proiectelor', nume:'Managementul Proiectelor', descriere:'Capacitatea de a planifica, organiza, coordona și controla resursele și activitățile necesare atingerii obiectivelor unui proiect în timp, buget și la calitatea stabilită.', categorie:'manageriale', metaTitle:'Competența: Managementul Proiectelor - Meserii și Cariere', metaDescription:'Meseriile care necesită management de proiect în România: roluri, certificări cerute, salarii și trasee profesionale.' },
  { id:'comunicare', slug:'comunicare', nume:'Comunicare', descriere:'Abilitatea de a transmite informații clar și eficient, atât verbal cât și în scris. Include ascultarea activă, prezentarea și adaptarea mesajului la audiență.', categorie:'soft-skills', metaTitle:'Competența: Comunicare - Meserii și Importanță Profesională', metaDescription:'Meseriile unde comunicarea este critică: roluri, salarii și ce presupune concret această competență în fiecare profesie.' },
  { id:'analiza-datelor', slug:'analiza-datelor', nume:'Analiza Datelor', descriere:'Capacitatea de a colecta, procesa, interpreta și vizualiza date pentru a extrage informații utile în luarea deciziilor. Include cunoștințe de statistică și instrumente de analiză.', categorie:'tehnice', metaTitle:'Competența: Analiza Datelor - Meserii și Cariere în România', metaDescription:'Meseriile care cer analiză de date în România: instrumente folosite, salarii pe rol și ce implică concret această competență.' },
  { id:'lucru-echipa', slug:'lucru-echipa', nume:'Lucru în Echipă', descriere:'Capacitatea de a colabora eficient cu alți profesioniști pentru atingerea obiectivelor comune. Include empatie, flexibilitate și gestionarea conflictelor.', categorie:'soft-skills', metaTitle:'Competența: Lucru în Echipă - Importanță și Meserii Relevante', metaDescription:'Meseriile care cer lucru în echipă în România: ce presupune concret, cum se evaluează și ce salarii oferă aceste roluri.' },
  { id:'rezolvarea-problemelor', slug:'rezolvarea-problemelor', nume:'Rezolvarea Problemelor', descriere:'Abilitatea de a identifica, analiza și rezolva probleme complexe folosind gândire critică și creativitate. Cerută explicit în majoritatea posturilor tehnice și de inginerie.', categorie:'soft-skills', metaTitle:'Competența: Rezolvarea Problemelor - Meserii și Dezvoltare', metaDescription:'Meseriile care cer rezolvarea problemelor: roluri tehnice și de inginerie, salarii, ce presupune concret și cum se evaluează.' },
  { id:'citirea-planurilor', slug:'citirea-planurilor', nume:'Citirea Planurilor Tehnice', descriere:'Capacitatea de a interpreta planuri, schițe și desene tehnice utilizate în construcții, instalații și proiectare industrială.', categorie:'tehnice', metaTitle:'Competența: Citirea Planurilor Tehnice - Meserii și Cerințe', metaDescription:'Meseriile care cer citirea planurilor tehnice: calificări, cursuri de specializare și salarii în construcții și industrie.' },
  { id:'ingrijirea-pacientilor', slug:'ingrijirea-pacientilor', nume:'Îngrijirea Pacienților', descriere:'Ansamblul de cunoștințe și abilități necesare pentru monitorizarea, tratarea și îngrijirea pacienților în mediul medical.', categorie:'tehnice', metaTitle:'Competența: Îngrijirea Pacienților - Meserii Medicale', metaDescription:'Meseriile medicale care cer îngrijirea pacienților: studii, calificări obligatorii, salarii și condiții de muncă în România.' },
  { id:'predare-educatie', slug:'predare-educatie', nume:'Predare și Pedagogie', descriere:'Abilitatea de a transmite cunoștințe, de a elabora materiale didactice și de a adapta metodele de predare la nevoile elevilor.', categorie:'tehnice', metaTitle:'Competența: Predare și Pedagogie - Cariere în Educație', metaDescription:'Carierele didactice în România: ce presupun competențele pedagogice, studii necesare, grade și salarii pe nivel.' },
  { id:'operare-utilaje', slug:'operare-utilaje', nume:'Operare Utilaje Industriale', descriere:'Capacitatea de a opera, monitoriza și menține utilaje și echipamente industriale în condiții de siguranță și eficiență.', categorie:'tehnice', metaTitle:'Competența: Operare Utilaje - Meserii Industriale și Cariere', metaDescription:'Meseriile care cer operarea utilajelor industriale: calificări, certificări, salarii și condiții de muncă în producție.' },
  { id:'administrare-sisteme', slug:'administrare-sisteme', nume:'Administrare Sisteme IT', descriere:'Gestionarea serverelor, rețelelor și infrastructurii IT pentru funcționarea optimă a sistemelor informatice ale unei organizații.', categorie:'tehnice', metaTitle:'Competența: Administrare Sisteme IT - Meserii și Cariere', metaDescription:'Meseriile care cer administrare de sisteme IT: roluri, certificări, salarii și ce presupune concret.' },
  { id:'securitate-cibernetica', slug:'securitate-cibernetica', nume:'Securitate Cibernetică', descriere:'Protejarea sistemelor informatice, rețelelor și datelor împotriva atacurilor cibernetice, accesului neautorizat și pierderilor de informații.', categorie:'tehnice', metaTitle:'Competența: Securitate Cibernetică - Meserii și Cariere', metaDescription:'Meseriile care cer securitate cibernetică: roluri, certificări CISSP/CEH, salarii și perspective de carieră.' },
  { id:'design-grafic', slug:'design-grafic', nume:'Design Grafic', descriere:'Crearea de conținut vizual prin combinarea imaginilor, tipografiei și culorilor pentru a comunica mesaje și a crea experiențe estetice.', categorie:'tehnice', metaTitle:'Competența: Design Grafic - Meserii Creative și Cariere', metaDescription:'Meseriile care cer design grafic: instrumente, salarii, portfolio necesar și trasee de carieră în design.' },
  { id:'contabilitate-finante', slug:'contabilitate-finante', nume:'Contabilitate și Finanțe', descriere:'Înregistrarea, clasificarea și interpretarea tranzacțiilor financiare, elaborarea situațiilor financiare și respectarea legislației fiscale.', categorie:'tehnice', metaTitle:'Competența: Contabilitate și Finanțe - Meserii și Cariere', metaDescription:'Meseriile care cer competențe de contabilitate: cerințe CECCAR, salarii și trasee profesionale în finanțe.' },
  { id:'legislatie-juridica', slug:'legislatie-juridica', nume:'Legislație și Drept', descriere:'Cunoașterea și aplicarea cadrului legislativ, a procedurilor juridice și a normelor de drept în activitatea profesională.', categorie:'tehnice', metaTitle:'Competența: Legislație și Drept - Meserii Juridice', metaDescription:'Meseriile care cer cunoștințe juridice: studii de drept, baroul, salarii și acces în profesiile juridice.' },
  { id:'conducere-vehicule', slug:'conducere-vehicule', nume:'Conducere Vehicule', descriere:'Operarea în siguranță a autovehiculelor, de la autoturisme la vehicule grele, în conformitate cu legislația rutieră și normele de transport.', categorie:'tehnice', metaTitle:'Competența: Conducere Vehicule - Meserii în Transport', metaDescription:'Meseriile care cer conducere vehicule: categorii permis, atestate profesionale, salarii și condiții de muncă.' },
  { id:'pregatire-culinara', slug:'pregatire-culinara', nume:'Pregătire Culinară', descriere:'Tehnici de gătit, cunoștințe de ingrediente, igienă alimentară și prezentare a preparatelor în conformitate cu standardele gastronomice.', categorie:'tehnice', metaTitle:'Competența: Pregătire Culinară - Meserii în HoReCa', metaDescription:'Meseriile care cer pregătire culinară: calificări, salarii bucătari și cofetari, cerințe igienice și trasee de carieră.' },
  { id:'vanzare-negociere', slug:'vanzare-negociere', nume:'Vânzare și Negociere', descriere:'Abilitatea de a prezenta produse, de a negocia condiții comerciale și de a închide tranzacții în avantajul ambelor părți.', categorie:'soft-skills', metaTitle:'Competența: Vânzare și Negociere - Meserii Comerciale', metaDescription:'Meseriile care cer vânzare și negociere: roluri comerciale, salarii, comisioane și trasee de carieră în vânzări.' },
  { id:'leadership', slug:'leadership', nume:'Leadership', descriere:'Capacitatea de a inspira, motiva și ghida echipe spre atingerea obiectivelor organizaționale, gestionând resurse umane și situații complexe.', categorie:'manageriale', metaTitle:'Competența: Leadership - Meserii de Conducere și Cariere', metaDescription:'Meseriile care cer leadership: roluri de management, salarii, competențe complementare și trasee de carieră.' },
  { id:'planificare-organizare', slug:'planificare-organizare', nume:'Planificare și Organizare', descriere:'Structurarea activităților, stabilirea priorităților și alocarea eficientă a timpului și resurselor pentru atingerea obiectivelor.', categorie:'manageriale', metaTitle:'Competența: Planificare și Organizare - Meserii și Cariere', metaDescription:'Meseriile care cer planificare și organizare: roluri, salarii și ce presupune concret această competență profesională.' },
  { id:'atentie-detalii', slug:'atentie-detalii', nume:'Atenție la Detalii', descriere:'Capacitatea de a observa și verifica elementele fine ale unei lucrări, prevenind erori și asigurând calitatea rezultatului final.', categorie:'soft-skills', metaTitle:'Competența: Atenție la Detalii - Meserii și Importanță', metaDescription:'Meseriile care cer atenție la detalii: roluri de precizie, salarii și de ce contează această competență profesională.' },
  { id:'protectia-muncii', slug:'protectia-muncii', nume:'Protecția Muncii (SSM)', descriere:'Cunoașterea și aplicarea normelor de securitate și sănătate în muncă pentru prevenirea accidentelor și bolilor profesionale.', categorie:'tehnice', metaTitle:'Competența: Protecția Muncii - Meserii și Cerințe SSM', metaDescription:'Meseriile care cer cunoștințe SSM: norme, certificări, salarii specialiști SSM și importanța în fiecare sector.' },
  { id:'limbi-straine', slug:'limbi-straine', nume:'Limbi Străine', descriere:'Cunoașterea uneia sau mai multor limbi străine la nivel profesional, permițând comunicarea cu parteneri și clienți internaționali.', categorie:'soft-skills', metaTitle:'Competența: Limbi Străine - Meserii și Avantaje Salariale', metaDescription:'Meseriile care cer limbi străine: ce limbă aduce cel mai mare salariu, roluri internaționale și cerințe de nivel.' },
  { id:'marketing-digital', slug:'marketing-digital', nume:'Marketing Digital', descriere:'Promovarea produselor și serviciilor prin canale digitale: SEO, social media, email marketing, PPC și content marketing.', categorie:'tehnice', metaTitle:'Competența: Marketing Digital - Meserii și Cariere', metaDescription:'Meseriile care cer marketing digital: roluri, instrumente, salarii și certificări cerute pe piața din România.' },
  { id:'sudura', slug:'sudura', nume:'Sudură', descriere:'Tehnici de îmbinare a metalelor prin topire sau presiune, utilizând echipamente specializate în conformitate cu standardele de calitate.', categorie:'tehnice', metaTitle:'Competența: Sudură - Meserii și Calificări', metaDescription:'Meseriile care cer sudură: tipuri de sudură, certificări, salarii sudori și condiții de muncă în România.' },
  { id:'electricitate', slug:'electricitate', nume:'Electricitate și Instalații Electrice', descriere:'Cunoștințe de circuite electrice, instalații de joasă și medie tensiune, depanare și mentenanță a echipamentelor electrice.', categorie:'tehnice', metaTitle:'Competența: Electricitate - Meserii și Autorizări ANRE', metaDescription:'Meseriile care cer competențe electrice: autorizări ANRE, salarii electricieni, tipuri de instalații și cerințe.' },
  { id:'mecanica-auto', slug:'mecanica-auto', nume:'Mecanică Auto', descriere:'Diagnosticarea, repararea și întreținerea sistemelor mecanice, electrice și electronice ale autovehiculelor.', categorie:'tehnice', metaTitle:'Competența: Mecanică Auto - Meserii și Calificări', metaDescription:'Meseriile care cer mecanică auto: calificări, salarii, echipamente de diagnoză și cerințe pe piața din România.' },
  { id:'agricultura-zootehnie', slug:'agricultura-zootehnie', nume:'Agricultură și Zootehnie', descriere:'Cunoștințe de cultivare a plantelor, creștere a animalelor, utilizare a îngrășămintelor și pesticidelor, și gestionare a fermelor.', categorie:'tehnice', metaTitle:'Competența: Agricultură și Zootehnie - Meserii Agricole', metaDescription:'Meseriile care cer competențe agricole: calificări, salarii, subvenții disponibile și condiții de muncă în fermă.' },
  { id:'prim-ajutor', slug:'prim-ajutor', nume:'Prim Ajutor', descriere:'Cunoștințe și abilități de acordare a primului ajutor în situații de urgență medicală, până la sosirea echipajelor specializate.', categorie:'tehnice', metaTitle:'Competența: Prim Ajutor - Meserii și Certificări', metaDescription:'Meseriile care cer prim ajutor: certificări, cursuri obligatorii și meserii unde această competență este critică.' },
  { id:'gestionare-stocuri', slug:'gestionare-stocuri', nume:'Gestionare Stocuri', descriere:'Administrarea inventarului, optimizarea nivelurilor de stoc, recepția și expedierea mărfurilor în depozite și magazine.', categorie:'tehnice', metaTitle:'Competența: Gestionare Stocuri - Meserii în Logistică', metaDescription:'Meseriile care cer gestionare stocuri: roluri în logistică și retail, salarii, instrumente WMS și cerințe.' },
  { id:'relatii-clienti', slug:'relatii-clienti', nume:'Relații cu Clienții', descriere:'Gestionarea interacțiunilor cu clienții, rezolvarea reclamațiilor, fidelizarea și crearea unei experiențe pozitive la fiecare contact.', categorie:'soft-skills', metaTitle:'Competența: Relații cu Clienții - Meserii și Cariere', metaDescription:'Meseriile care cer relații cu clienții: roluri în vânzări, HoReCa și servicii, salarii și tehnici de fidelizare.' },
  { id:'editare-media', slug:'editare-media', nume:'Editare Video și Foto', descriere:'Procesarea și editarea conținutului vizual utilizând software specializat pentru a produce materiale media de calitate profesională.', categorie:'tehnice', metaTitle:'Competența: Editare Video și Foto - Meserii Media', metaDescription:'Meseriile care cer editare video și foto: software folosit, salarii, echipamente necesare și trasee de carieră.' },
  { id:'fitness-antrenament', slug:'fitness-antrenament', nume:'Fitness și Antrenament', descriere:'Cunoștințe de anatomie funcțională, fiziologia efortului și tehnici de antrenament pentru îmbunătățirea performanței fizice.', categorie:'tehnice', metaTitle:'Competența: Fitness și Antrenament - Meserii în Sport', metaDescription:'Meseriile care cer fitness și antrenament: certificări, salarii antrenori, cerințe de formare și specializări.' },
  { id:'administrare-proprietati', slug:'administrare-proprietati', nume:'Administrare Proprietăți', descriere:'Gestionarea imobilelor, coordonarea mentenanței, administrarea contractelor de închiriere și relația cu proprietarii și chiriașii.', categorie:'tehnice', metaTitle:'Competența: Administrare Proprietăți - Meserii Imobiliare', metaDescription:'Meseriile care cer administrare proprietăți: roluri, atestări, salarii și responsabilități în sector imobiliar.' },
  { id:'managementul-calitatii', slug:'managementul-calitatii', nume:'Managementul Calității', descriere:'Implementarea și monitorizarea sistemelor de management al calității (ISO, Six Sigma) pentru asigurarea standardelor de produs și proces.', categorie:'manageriale', metaTitle:'Competența: Managementul Calității - Meserii și Certificări', metaDescription:'Meseriile care cer managementul calității: certificări ISO, Six Sigma, salarii și roluri în producție și servicii.' },
];

// Import meserii data from separate file
import { meseriiByDomain } from './meserii-data.mjs';

// ── TEXT GENERATION ──
const descPatterns = [
  (n,d) => `${n} este responsabil cu activități de specialitate în sectorul ${d}. Rolul presupune cunoștințe solide, experiență practică și capacitatea de a livra rezultate conforme standardelor profesionale.`,
  (n,d) => `Specializat în ${d.toLowerCase()}, ${n.toLowerCase()} planifică și execută lucrări specifice meseriei sale. Activitatea necesită respectarea normelor tehnice, colaborare cu alți profesioniști și actualizare permanentă a competențelor.`,
  (n,d) => `${n} aplică cunoștințe de specialitate pentru a rezolva provocări concrete din ${d.toLowerCase()}. Profesionistul combină pregătirea teoretică cu experiența practică pentru rezultate de calitate.`,
  (n,d) => `Profesia de ${n.toLowerCase()} implică activități specifice din ${d.toLowerCase()}, de la planificare la execuție și control. Necesită pregătire profesională, atenție la detalii și responsabilitate.`,
  (n,d) => `${n} contribuie la buna funcționare a sectorului ${d.toLowerCase()} prin activitatea sa zilnică. Rolul combină competențe tehnice cu abilități de comunicare și lucru în echipă.`,
  (n,d) => `În calitate de ${n.toLowerCase()}, profesionistul gestionează activități esențiale din ${d.toLowerCase()}. Munca presupune atât lucru independent, cât și coordonare cu echipe multidisciplinare.`,
  (n,d) => `${n} ocupă un rol important în ${d.toLowerCase()}, asigurând desfășurarea corectă a proceselor specifice. Profesia cere competențe dovedite și adaptare continuă la cerințele pieței.`,
];

const facePatterns = [
  (n,d) => `Realizează activități zilnice specifice meseriei de ${n.toLowerCase()}: planifică sarcinile, execută lucrări de specialitate, verifică calitatea rezultatelor și documentează activitatea. Colaborează cu colegii și superiorii pentru respectarea termenelor.`,
  (n,d) => `Își începe ziua cu evaluarea priorităților și planificarea activităților. Execută lucrări specifice domeniului ${d.toLowerCase()}, monitorizează progresul și raportează rezultatele. Participă la ședințe de echipă și respectă procedurile interne.`,
  (n,d) => `Lucrează zilnic pe sarcini practice din ${d.toLowerCase()}: pregătește materiale și echipamente, execută operațiuni specifice, controlează calitatea și finalizează documentația. Comunică permanent cu echipa și beneficiarii.`,
  (n,d) => `Ca ${n.toLowerCase()}, gestionează un volum variat de sarcini: de la analiza cerințelor la execuția propriu-zisă și predarea rezultatelor. Aplică standarde profesionale și propune îmbunătățiri ale proceselor.`,
  (n,d) => `Activitatea zilnică presupune lucrul direct în ${d.toLowerCase()}: evaluează situații, aplică soluții tehnice, verifică conformitatea lucrărilor și menține evidența activităților desfășurate.`,
];

const respPools = {
  'it-comunicatii': ['Dezvoltarea și mentenanța aplicațiilor software','Administrarea infrastructurii IT și a rețelelor','Analiza cerințelor tehnice și de business','Testarea și asigurarea calității produselor','Documentarea soluțiilor tehnice implementate','Colaborarea cu echipele de dezvoltare și management','Monitorizarea performanței sistemelor informatice','Implementarea măsurilor de securitate cibernetică','Participarea la code review și sesiuni de planificare','Optimizarea proceselor și automatizarea sarcinilor repetitive','Gestionarea bazelor de date și a fluxurilor de date','Suport tehnic pentru utilizatori și echipe interne','Configurarea și actualizarea mediilor de dezvoltare','Raportarea progresului și a problemelor identificate','Respectarea standardelor și bunelor practici din industrie'],
  'constructii': ['Executarea lucrărilor de construcție conform proiectelor tehnice','Citirea și interpretarea planurilor de execuție','Verificarea calității materialelor de construcție','Respectarea normelor de securitate pe șantier','Montajul și asamblarea structurilor și instalațiilor','Efectuarea măsurătorilor și trasarea lucrărilor','Prepararea materialelor și pregătirea zonei de lucru','Colaborarea cu ceilalți meseriași de pe șantier','Raportarea progresului lucrărilor către conducerea șantierului','Întreținerea uneltelor și echipamentelor de lucru','Remedierea defectelor constatate la recepție','Respectarea termenelor de execuție stabilite','Participarea la instruirile periodice de protecția muncii','Gestionarea deșeurilor de construcție conform normelor','Documentarea lucrărilor executate și a materialelor folosite'],
  'sanatate': ['Evaluarea stării de sănătate a pacienților','Aplicarea protocoalelor medicale și terapeutice','Administrarea tratamentelor prescrise','Monitorizarea evoluției pacienților','Completarea și actualizarea documentației medicale','Comunicarea cu pacienții și familiile acestora','Respectarea normelor de igienă și sterilizare','Colaborarea cu echipa medicală multidisciplinară','Participarea la programele de formare continuă','Gestionarea situațiilor de urgență medicală','Pregătirea echipamentelor și materialelor medicale','Respectarea confidențialității datelor pacienților','Raportarea evenimentelor adverse','Educarea pacienților privind prevenția și tratamentul','Menținerea la zi a cunoștințelor medicale'],
  'educatie': ['Predarea conținutului curricular la standardele cerute','Elaborarea planificărilor și a materialelor didactice','Evaluarea și notarea elevilor/cursanților','Adaptarea metodelor de predare la nevoile grupului','Consilierea elevilor și comunicarea cu părinții','Participarea la activitățile extracurriculare','Completarea documentelor școlare obligatorii','Colaborarea cu ceilalți cadre didactice','Participarea la programele de formare continuă','Organizarea activităților practice și de laborator','Monitorizarea progresului fiecărui elev','Implementarea metodelor moderne de predare','Respectarea regulamentelor instituției de învățământ','Gestionarea clasei și menținerea disciplinei','Pregătirea elevilor pentru evaluări și examene'],
  'industrie-productie': ['Operarea utilajelor și echipamentelor de producție','Controlul calității produselor fabricate','Respectarea parametrilor tehnici de fabricație','Efectuarea reglajelor și a setărilor de mașini','Mentenanța preventivă a echipamentelor','Completarea fișelor de producție și a rapoartelor','Respectarea normelor de protecția muncii','Gestionarea materiilor prime și a consumabilelor','Identificarea și raportarea defectelor','Participarea la procesele de îmbunătățire continuă','Colaborarea cu echipa de producție','Curățarea și întreținerea zonei de lucru','Respectarea programului de producție','Efectuarea testelor și măsurătorilor de calitate','Aplicarea procedurilor de lucru standardizate'],
};

// Generic resp pool for domains without specific ones
const genericResp = ['Executarea activităților specifice meseriei conform standardelor','Planificarea și organizarea sarcinilor zilnice','Respectarea normelor de securitate și sănătate în muncă','Colaborarea cu echipa și comunicarea cu superiorii','Completarea documentației și raportarea activității','Menținerea curățeniei și ordinii la locul de muncă','Participarea la programele de formare profesională','Verificarea calității lucrărilor executate','Gestionarea materialelor și echipamentelor de lucru','Respectarea termenelor și a procedurilor interne','Identificarea și raportarea problemelor întâmpinate','Propunerea de îmbunătățiri ale proceselor de lucru','Adaptarea la cerințele specifice ale fiecărei sarcini','Comunicarea eficientă cu beneficiarii și partenerii','Respectarea codului de etică profesională'];

function getResp(domeniuId) { return respPools[domeniuId] || genericResp; }

const studiiByDomain = {
  'it-comunicatii': ['Studii superioare în Informatică, Calculatoare sau domenii conexe. Sunt acceptate și calificări alternative precum bootcamp-uri sau portofoliu demonstrabil.','Studii superioare tehnice sau certificări profesionale relevante (AWS, Azure, Cisco, etc.). Experiența practică este foarte valoroasă.','Licență în IT, Matematică-Informatică sau domenii STEM. Masterul este un avantaj pentru pozițiile senior.'],
  'constructii': ['Calificare profesională în meseria respectivă, obținută prin școală profesională sau cursuri autorizate.','Studii medii tehnice de specialitate sau calificare profesională nivel 3-4.','Studii superioare de inginerie pentru pozițiile tehnice și de management pe șantier.'],
  'sanatate': ['Studii superioare medicale (medicină, farmacie) cu drept de liberă practică.','Studii postliceale sau universitare în domeniul medical/sanitar cu certificat de membru al ordinului profesional.','Calificare profesională în domeniul medical, obținută prin școli sanitare sau postliceale.'],
  'educatie': ['Studii superioare de licență în specialitatea predată, cu modul psihopedagogic obligatoriu.','Studii universitare cu pregătire pedagogică. Gradele didactice (definitiv, II, I) aduc majorări salariale.','Studii medii sau superioare cu pregătire pedagogică, în funcție de nivelul de învățământ.'],
  'industrie-productie': ['Calificare profesională în meseria respectivă, nivel 2-4, obținută prin școală profesională sau cursuri.','Studii medii tehnice de specialitate. Autorizațiile specifice (ISCIR, ANRE) sunt un avantaj.','Studii superioare tehnice pentru pozițiile de inginerie și management producție.'],
};
const defaultStudii = ['Studii de specialitate sau calificare profesională relevantă pentru domeniu.','Pregătire profesională în domeniu, obținută prin studii formale sau experiență practică.','Studii medii sau superioare relevante, completate cu cursuri de specializare.'];

const conditiiByDomain = {
  'it-comunicatii': ['Predominant birou sau remote. Program flexibil în majoritatea companiilor. Mediu confortabil.','Lucru la calculator 8 ore pe zi, birou modern sau home office. Uneori ore suplimentare la deadline.','Mediu de birou sau hibrid. Necesită concentrare prelungită și actualizare permanentă a cunoștințelor.'],
  'constructii': ['Lucru pe șantier, expunere la intemperii. Program de zi, uneori și sâmbăta. Efort fizic ridicat.','Teren sau atelier, condiții variabile în funcție de anotimp. Echipament de protecție obligatoriu.','Combinație de birou și teren. Deplasări frecvente pe șantiere.'],
  'sanatate': ['Spital, clinică sau cabinet medical. Program în ture (12/24 sau 8 ore). Mediu steril.','Mediu medical cu norme stricte de igienă. Posibil program de gardă sau ture de noapte.','Cabinet sau laborator medical. Program standard sau în ture, în funcție de unitate.'],
  'educatie': ['Instituție de învățământ, program de dimineață. Vacanțe școlare. Pregătire suplimentară acasă.','Sală de clasă sau laborator didactic. Program fix în timpul anului școlar.','Mediu educațional, interacțiune directă cu elevii/cursanții. Program stabil.'],
  'industrie-productie': ['Hală de producție sau atelier, posibil în schimburi (muncă în 3 schimburi). Echipament de protecție.','Fabrică sau atelier, mediu industrial. Program regulat sau în schimburi. Zgomot și efort fizic moderat.','Mediu industrial, necesită respectarea strictă a normelor de siguranță.'],
};
const defaultConditii = ['Condiții specifice domeniului, cu respectarea normelor de securitate și sănătate în muncă.','Mediu profesional adecvat, cu program standard sau adaptat cerințelor activității.','Condiții variate, în funcție de specificul activității și locul de muncă.'];

const evolutiiByDomain = {
  'it-comunicatii': ['Pornești ca Junior, avansezi la Mid-level, apoi Senior. De acolo: Tech Lead, Architect sau management. Consultanța și antreprenoriatul sunt opțiuni frecvente.','Traseul tipic: specialist junior, apoi senior, apoi lead sau manager. Certificările și proiectele complexe accelerează avansarea.','Debutul ca specialist, avansare pe verticală (lead, director tehnic) sau pe orizontală (consultanță, produs, antreprenoriat).'],
  'constructii': ['Începi ca muncitor calificat, avansezi la șef de echipă, apoi maistru sau diriginte de șantier. Experiența și autorizațiile aduc creșteri salariale.','De la ucenic la meseriaș confirmat, apoi șef de echipă sau antreprenor în construcții. Specializarea aduce proiecte mai bine plătite.','Progresie de la executant la coordonator de lucrări. Cu studii superioare: inginer de șantier, director tehnic.'],
  'sanatate': ['Avansare prin grade profesionale și specializări. Medicii: rezidențiat, specialist, primar. Asistenții: gradul II, gradul I, asistent șef.','Specializare progresivă și acumulare de experiență. Posibilitate de conducere secție, cabinet propriu sau carieră academică.','De la debut la specialist confirmat, cu opțiuni de conducere, cercetare sau practică privată.'],
  'educatie': ['Obținerea gradelor didactice: definitivat, gradul II, gradul I. Fiecare grad aduce majorare salarială. Opțiuni: director, inspector, formator.','Progresie prin grade didactice și experiență. Alternativ: funcții de conducere, inspectorat sau formare profesională.','De la debutant la profesor cu gradul I. Oportunități în management educațional sau formare continuă.'],
  'industrie-productie': ['De la operator la maistru, apoi șef de atelier sau inginer producție. Specializarea pe utilaje complexe aduce salarii mai mari.','Avansare de la executant la coordonator de echipă, apoi supervisor sau manager producție. Certificările tehnice sunt esențiale.','Începi ca operator, avansezi prin experiență și calificări suplimentare. Roluri de conducere: maistru, inginer, director producție.'],
};
const defaultEvolutii = ['Avansare progresivă prin experiență, calificări suplimentare și rezultate demonstrate. Posibilități de specializare sau de acces la funcții de coordonare.','De la nivel entry la specialist confirmat, apoi coordonator de echipă sau expert. Formarea continuă deschide oportunități suplimentare.','Progresie naturală prin acumularea de experiență și competențe. Opțiuni de avansare pe verticală (management) sau pe orizontală (specializare).'];

function getStudii(did, i) { return (studiiByDomain[did] || defaultStudii)[i % (studiiByDomain[did] || defaultStudii).length]; }
function getConditii(did, i) { return (conditiiByDomain[did] || defaultConditii)[i % (conditiiByDomain[did] || defaultConditii).length]; }
function getEvolutie(did, i) { return (evolutiiByDomain[did] || defaultEvolutii)[i % (evolutiiByDomain[did] || defaultEvolutii).length]; }

function generateFAQ(name, med, min, max) {
  const nl = name.toLowerCase();
  const fmed = med.toLocaleString('ro-RO') + ' lei';
  const fmin = min.toLocaleString('ro-RO') + ' lei';
  const fmax = max.toLocaleString('ro-RO') + ' lei';
  return [
    { intrebare: `Cât câștigă un ${nl} în România?`, raspuns: `Salariul mediu net al unui ${nl} este de ${fmed} pe lună. Intervalul variază între ${fmin} și ${fmax}, în funcție de experiență, angajator și oraș.` },
    { intrebare: `Ce studii trebuie pentru a deveni ${nl}?`, raspuns: `Pentru a lucra ca ${nl} ai nevoie de pregătire de specialitate în domeniu. Cerințele exacte variază de la studii superioare la calificări profesionale, în funcție de complexitatea postului.` },
    { intrebare: `Este meseria de ${nl} căutată pe piața muncii?`, raspuns: `Da, meseria de ${nl} are cerere pe piața muncii din România. Numărul de posturi disponibile variază în funcție de oraș și de evoluția sectorului economic.` },
  ];
}

function expandMeserie(raw, domeniuId, index, allRaws) {
  const [name, cor, sal, cer, comps] = raw;
  const slug = slugify(name);
  const bMin = r100(sal * 0.55);
  const bMax = r100(sal * 2.0);
  const domeniu = domenii.find(d => d.id === domeniuId);
  const dName = domeniu?.nume || '';

  // Similar: 2-3 from same domain, excluding self
  const similar = allRaws
    .filter((_, i) => i !== index)
    .sort((a, b) => Math.abs(a[2] - sal) - Math.abs(b[2] - sal))
    .slice(0, 3)
    .map(m => slugify(m[0]));

  // City salaries
  const salpiuOrase = {};
  for (const o of orase) {
    salpiuOrase[o.id] = { min: r50(bMin * o.coef), mediu: r50(sal * o.coef), max: r50(bMax * o.coef) };
  }

  const pool = getResp(domeniuId);
  const start = (index * 5) % pool.length;
  const resp = [];
  for (let i = 0; i < 6; i++) resp.push(pool[(start + i) % pool.length]);

  return {
    id: slug, slug, nume: name, codCOR: cor, dompiuId: domeniuId,
    descriere: descPatterns[index % descPatterns.length](name, dName),
    ceFaceConcret: facePatterns[index % facePatterns.length](name, dName),
    responsabilitati: resp,
    competente: comps,
    studiiNecesare: getStudii(domeniuId, index),
    conditiiMunca: getConditii(domeniuId, index),
    evolutieCariera: getEvolutie(domeniuId, index),
    nivelCerere: cer,
    salpiuNational: { min: bMin, mediu: sal, max: bMax },
    salpiuOrase,
    meseriiSimilare: similar,
    fpiIntrebari: generateFAQ(name, sal, bMin, bMax),
    metaTitle: `${name} - Descriere, Salariu și Competențe | Meserii.ro`,
    metaDescription: `Ce face un ${name.toLowerCase()}, cât câștigă, ce studii trebuie. Salariu mediu: ${sal.toLocaleString('ro-RO')} lei/lună.`,
  };
}

// ── MAIN ──
function generate() {
  const allMeserii = [];
  for (const [did, raws] of Object.entries(meseriiByDomain)) {
    raws.forEach((raw, idx) => allMeserii.push(expandMeserie(raw, did, idx, raws)));
  }

  // Compute competente.meseriiRelevante
  const competenteFinal = competenteBase.map(c => ({
    ...c,
    meseriiRelevante: allMeserii.filter(m => m.competente.includes(c.id)).map(m => m.id),
  }));

  // Compute domenii.meseriiCount
  const domeniiFinal = domenii.map(d => ({
    id: d.id, nume: d.nume, slug: d.slug, descriere: d.descriere,
    icon: d.icon, meseriiCount: allMeserii.filter(m => m.dompiuId === d.id).length,
    metaTitle: d.metaTitle, metaDescription: d.metaDescription,
  }));

  // Orase without coef
  const oraseFinal = orase.map(({ coef, ...rest }) => rest);

  writeFileSync(join(DATA_DIR, 'meserii.json'), JSON.stringify(allMeserii, null, 2));
  writeFileSync(join(DATA_DIR, 'domenii.json'), JSON.stringify(domeniiFinal, null, 2));
  writeFileSync(join(DATA_DIR, 'competente.json'), JSON.stringify(competenteFinal, null, 2));
  writeFileSync(join(DATA_DIR, 'orase.json'), JSON.stringify(oraseFinal, null, 2));

  console.log(`✓ ${allMeserii.length} meserii`);
  console.log(`✓ ${domeniiFinal.length} domenii`);
  console.log(`✓ ${competenteFinal.length} competente`);
  console.log(`✓ ${oraseFinal.length} orase`);
  console.log(`→ Estimated pages: ${allMeserii.length} meserii + ${allMeserii.length} salariu + ${allMeserii.length * orase.length} salariu/oras + ${domeniiFinal.length} domenii + ${competenteFinal.length} competente + ${oraseFinal.length} orase + 6 index = ${allMeserii.length + allMeserii.length + allMeserii.length * orase.length + domeniiFinal.length + competenteFinal.length + oraseFinal.length + 6}`);
}

generate();
