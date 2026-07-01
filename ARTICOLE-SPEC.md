# Standard de producție articole — meseriile.ro/articole/

Sursa unică de adevăr pentru orice articol. Un articol nu se publică dacă nu bifează tot.

## 1. Intenție și scop
- Fiecare articol răspunde perfect unei intenții reale de căutare (mai ales salariu/carieră) și ajută concret cititorul.
- Bazat pe DATE reale din director (salarii, orașe, competențe). Fără afirmații inventate (ex. „a crescut cu X%" fără serie istorică).

## 2. Titlu (bun pt SEO + Discover, fără capcana clonelor)
- Ancoră SEO în față (fraza căutată) + cârlig concret după (cifră reală, an, loc).
- ROTEȘTE unghiul între articole, NU repeta „Cât câștigă un X" × 400. Unghiuri: salariu / fără facultate / autorizări / oraș / comparație / cum devii.
- Fără „:", fără clișee AI (ghid, complet, tot ce trebuie să știi, secretele, pas cu pas).
- Ex. bun: „Cât câștigă un sudor în România și cum ajunge la 10.000 de lei".

## 2b. Anti-template (CRITIC la scară)
Google penalizează tiparul repetat. Variază STRUCTURA, nu doar numele meseriei:
- **Descrierea meta**: NU același șablon „Un X câștigă în medie Y lei, între A și B...". Rotește: unele conduse de interval, altele de cerere, de „fără facultate", de comparație, de o întrebare.
- **Primul paragraf (intro)**: NU același opener „Un X câștigă în România un salariu mediu net de Y". Variază: unele încep cu intervalul, altele cu un contrast (început vs senior), altele cu contextul/cererea, altele cu o comparație.
- **Charturi + structură secțiuni**: diferite per articol (vezi 4).
- Test: pune 2 articole alături — dacă descrierile/intro-urile par turnate din același șablon, rescrie.

## 3. Corp
- 1500-3000 cuvinte după nevoia subiectului. Răspuns direct în primul paragraf (featured snippet).
- ZERO clișee AI, ZERO em/en-dash (— –). Verifică cu `npm run lint` (trebuie 0 HARD).
- Structură: intro cu răspuns → secțiuni pe subîntrebări reale → FAQ (4-5 Q&A) la final.
- Interlinking: spre `/salariu/<slug>/` (money pages) prin `relatedMeserii` + în text spre meserii înrudite.

## 4. Charturi
- SVG inline generat din date reale: `node scripts/gen-chart.mjs <slug>` → inserezi SVG-ul în `<figure>` cu `<figcaption>` (sursă).
- 0 fișiere, responsive, brand. Tipic: salariu pe experiență + salariu pe orașe.

## 5. Imagini
- Găzduite pe `img.meseriile.ro` (project `meseriile-img`), NU în directorul principal.
- Path: `articole/<categorie>/<slug>/<nume-keyword>.webp`.
- NUME FIȘIER = keywords cu cratimă (ex. `salariu-sudor-mig-mag-atelier.webp`), NU `hero.webp` — pt ranking în Google Images.
- Hero 16:9 (1600×900) în frontmatter `heroImage` + `heroAlt`. Inline 3:2 (1200×800) ca `<figure><img ...></figure>` cu URL absolut img.meseriile.ro (ca să intre în image sitemap).
- `alt` descriptiv cu keyword. Fotorealist/editorial, fără text/logo/watermark.
- TOATE cardurile de listare (similare, index /articole/, hub-uri categorii) au THUMBNAIL (hero-ul articolului, aspect-video). Fallback gradient dacă lipsește heroImage.
- Pipeline: user pune în `/sites/meseriile-img-work/_incoming/` (folder permanent, NU-l șterge) → eu comprim WebP (hero q80, inline q78) → upload `meseriile-img`.

### Prompturi imagini (7 straturi + anti-eroare)
Format bogat, ca GPT să facă imagini realiste fără greșeli evidente:
1. Tip cadru + medium foto (ex. „Photorealistic editorial photograph, 50mm, f/2.8, natural light")
2. Subiect cu anatomie corectă (descrie mâinile/poziția explicit)
3. Echipament corect și specific (tipul real de unealtă)
4. Context/setare reală
5. Lumină + depth of field
6. Aspect ratio (hero 16:9, inline 3:2)
7. Constrângeri negative (boilerplate mai jos)

Boilerplate anti-eroare la finalul fiecărui prompt:
`Realistic human anatomy, correct hands with five fingers, correctly shaped tools and equipment, physically plausible sparks and reflections. No text, no letters, no logos, no watermarks. No extra fingers, no fused or distorted hands, no floating or melted tools, no duplicated limbs, no warped machinery, no gibberish text.`

## 6. Frontmatter
```yaml
title: "..."                 # regula 2
description: "..."           # ~155 caractere, fără clișee, fără ":"
pubDate: YYYY-MM-DD
relatedMeserii: ["slug", ...] # slug-uri REALE din director
heroImage: "categorie/slug/nume-keyword.webp"
heroAlt: "descriere cu keyword"
```
Categoria = FOLDER: `src/content/articole/<categorie>/<slug>.md`. Categorii = 20 domenii + salarizare/cariera/piata-muncii.

## 7. Anti-duplicare
- Apărarea reală = conținut unic prin date (cifre, orașe, autorizări diferite per meserie), nu doar titlu.
- NU publica 400 articole identice cu numele schimbat. Mix de unghiuri per cluster.

## 8. Verificare înainte de publicare
1. `npm run lint` → 0 HARD.
2. `npm run build` → fără erori; articolul + hub + sitemap ok.
3. Imagini live pe img.meseriile.ro (200).
4. Preview vizual.
