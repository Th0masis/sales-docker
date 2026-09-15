# Container v průmyslové automatizaci

Slidev deck pro B&R sales a pre-sales. Aktuální zdrojová prezentace má 11 slidů a zaměřuje se na obchodní rozpoznání, kdy má kontejner v OT smysl, a kdy je potřeba přizvat technického specialistu.

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

## Obsah decku

- Slide 01: titul a hlavní teze.
- Slide 02: kontext a obchodní otázka: kdy je služba vedle PLC a kdy patří do PLC runtime.
- Slide 03: základní definice containeru: build → image → deploy.
- Slide 04: standardní instalace vs. container.
- Slide 05: container vs. VM.
- Slide 06: command demonstrator pro obecný Docker princip.
- Slide 07: kde dává container v OT smysl.
- Slide 08: interní produkční příklad mappDatabase / MariaDB / BR services.
- Slide 09: potenciální use-cases a hranice relevancy.
- Slide 10: technické limity a rozhodovací rámec.
- Slide 11: závěrečné shrnutí a obchodní zkratka.

`slides.md` je zdroj pravdy pro pořadí, texty, presenter notes a click states. `style.css` obsahuje vizuální systém decku a `public/` jeho diagramy a obrázky.

## Ověření před použitím

- spustit produkční build přes `npm run build`;
- ověřit hlavní business story a vztah PLC vs. služby kolem PLC;
- ověřit, že obecný Docker příklad není prezentován jako oficiální B&R reference;
- ověřit interní case study a limity před použitím v konkrétním projektu.