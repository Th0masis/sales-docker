# Container v průmyslové automatizaci

Slidev deck pro B&R sales a pre-sales. Aktuální zdrojová prezentace má 14 slidů a zaměřuje se na obchodní rozpoznání, kdy má kontejner v OT smysl, a kdy je potřeba přizvat technického specialistu.

## Spuštění

```powershell
npm install
npm run dev
```

Prezentace běží na `http://localhost:3030`. Klávesa `P` otevře presenter mode a `O` přehled slidů.

## Build

```powershell
npm run build
```

Statický výstup se zapisuje do `dist/`.

## Automatické kontroly

```powershell
npm run test:content
npm run build
npm run start
# v druhém terminálu
npm run test:smoke
```

GitHub Actions spouští stejné kontroly při změně prezentace nebo workflow. Smoke test ověřuje načtení vybraných slidů a interaktivní menu na slide 12.

## Obsah decku

- Slide 01: titul a hlavní teze.
- Slide 02: kontext a obchodní otázka: kdy je služba vedle PLC a kdy patří do PLC runtime.
- Slide 03: základní definice containeru: build → image → deploy.
- Slide 04: slovník image, container, runtime a volume.
- Slide 05: standardní instalace vs. container.
- Slide 06: vrstvy containeru vs. VM.
- Slide 07: rozhodovací kritéria containeru vs. VM.
- Slide 08: lifecycle a command demonstrator pro obecný Docker princip.
- Slide 09: Docker Compose pro lokální nebo edge stack více služeb.
- Slide 10: kde dává container v OT smysl a kvalifikační otázky.
- Slide 11: interní produkční příklad mappDatabase / MariaDB / BR services.
- Slide 12: potenciální use-cases a hranice relevancy.
- Slide 13: technické limity, licence a rozhodovací rámec.
- Slide 14: závěrečné shrnutí a obchodní zkratka.

`slides.md` je zdroj pravdy pro pořadí, texty, presenter notes a click states. `style.css` obsahuje vizuální systém decku a `public/` jeho diagramy a obrázky.

## Ověření před použitím

- spustit produkční build přes `npm run build`;
- ověřit hlavní business story a vztah PLC vs. služby kolem PLC;
- ověřit click states na slidech 04, 07, 08, 09, 10 a 13;
- ověřit, že obecný Docker příklad není prezentován jako oficiální B&R reference;
- ověřit interní case study a limity před použitím v konkrétním projektu.