# Container v průmyslové automatizaci

Slidev deck pro B&R sales a pre-sales. Dvanáct slidů vysvětluje, kdy mají containery smysl pro služby kolem PLC, jak se liší image, container a runtime, a co je potřeba ověřit před nasazením.

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

## Export

```powershell
npm run export
```

Export vyžaduje dostupný Playwright Chromium browser.

## Obsah decku

- Slide 02 odděluje PLC řízení stroje od služeb kolem PLC.
- Slide 03 ukazuje build, image a deploy containeru; kódový blok je ilustrační interní ukázka.
- Slide 06 je interaktivní simulace příkazové řádky s obecným příkladem `nginx`.
- Slide 08 je označený interní produkční příklad mappDatabase / BR service, MariaDB, Podmanu a persistentních dat. Není to univerzální reference ani garance úspor.
- Slide 09 obsahuje interaktivní use-cases včetně orchestrace / multi-site.
- Slide 10 slouží jako kvalifikační a rozhodovací rámec pro technické posouzení.
- Slide 11 připomíná kontrolu licencí runtime, image, závislostí a provozní odpovědnosti.

`slides.md` je zdroj pravdy pro pořadí, texty, presenter notes a click states. `style.css` obsahuje vizuální systém decku a `public/` jeho diagramy a obrázky.

## Ověření před použitím

- spustit produkční build přes `npm run build`;
- projít click states slidu 03 a interaktivní karty slidu 09;
- ověřit konkrétní runtime, image tagy, persistentní storage, zálohy, licence a odpovědnost podle cílového projektu;
- nepředstavovat interní case study nebo obecný Docker příklad jako schválenou B&R referenci.