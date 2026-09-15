---
theme: default
title: Container v průmyslové automatizaci
titleTemplate: '%s | B&R Industrial Automation'
author: B&R Industrial Automation
colorSchema: light
aspectRatio: 16/9
canvasWidth: 1280
transition: slide-left
duration: 30min
timer: countdown
drawings:
  enabled: true
  persist: false
fonts:
  sans: IBM Plex Sans
  serif: Barlow Condensed
  mono: IBM Plex Mono
  provider: google
exportFilename: Kontejnery_v_OT
defaults:
  layout: default
layout: cover
---
<img class="cover-logo" src="/br-logo.svg" alt="B&amp;R Industrial Automation">
<div class="eyebrow">B&amp;R INDUSTRIAL AUTOMATION · SALES BRIEFING</div>
<div class="cover-event"><span>OT · CONTAINERS</span><span>14. 9. 2026</span></div>

# Kontejnerizace<br><span class="accent">v automatizaci</span>
<p class="cover-sub">PLC řídí stroj. Containery provozují služby okolo PLC.</p>
<div class="ot-cover-rule"><span>JAK POZNAT, KDY MÁ KONTEJNER V OT SMYSL</span></div>
<div class="slide-id">01</div>
<!--
Hlavní myšlenka je jednoduchá: PLC dál řídí stroj. Container přichází do hry u služeb, které běží vedle PLC.
Na dalších slidech ukážeme, co container přináší, kde může pomoci a kde už jeho použití musí posoudit technický specialista.
Nejde tedy o volbu „PLC nebo container“, ale o rozdělení odpovědností mezi řízení stroje a služby kolem něj.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">KONTEXT · PROČ TO ŘEŠÍME</div>

# Kolem PLC přibývají služby s jiným<br><span class="accent">životním cyklem</span>
<div class="ot-harness-layout" v-click="1"><div class="ot-harness-core"><span>CORE · ŘÍZENÍ STROJE</span><strong>PLC</strong><small>deterministické řízení<br>reálný čas · I/O · safety hranice</small></div><div class="ot-harness-bridge"><i></i><i></i><i></i><i></i></div><div class="ot-harness-services"><article><span>01</span><strong>DATA</strong><small>sběr · historie</small></article><article><span>02</span><strong>DATABÁZE</strong><small>persistentní uložení</small></article><article><span>03</span><strong>INTEGRACE</strong><small>IT · cloud · reporting</small></article><article><span>04</span><strong>DIAGNOSTIKA</strong><small>monitoring · test</small></article></div></div>
<div class="ot-context-strip" v-click="2"><section><span>DNES</span><strong>PLC + strojové řízení</strong></section><section class="is-active"><span>PŘIBÝVÁ</span><strong>Data · databáze · reporting · IT</strong></section><section><span>NAPĚTÍ</span><strong>Více verzí a životních cyklů</strong></section></div>
<div class="ot-question" v-click="3"><span>OTÁZKA PRO OBCHODNÍKA</span><strong>Je to stále součást řídicí aplikace, nebo už samostatná služba kolem PLC?</strong></div><div class="ot-bottom-callout" v-click="4">Jak tyto služby provozovat samostatně, opakovatelně a bez zásahu do PLC runtime?</div><div class="slide-id">02</div>

<!--
[CLICK]
Na začátku si oddělme dvě role: PLC řídí stroj deterministicky, zatímco databáze, dashboard nebo integrační služba řeší jiný typ práce.  
[CLICK]
Kolem PLC ale přibývají služby s vlastním životním cyklem: data, historie, reporting, IT integrace a diagnostika.    
[CLICK]
Tady je dobrá kvalifikační otázka: je to ještě součást řídicí aplikace, nebo už samostatná služba kolem PLC?  
[CLICK]
Odpověď nás vede k tématu containerů. Ne jako náhrady PLC, ale jako způsobu, jak doprovodné služby oddělit a provozovat opakovatelně.
-->

---
layout: default
class: dark-slide ot-slide
---

<script setup>
import { ref } from 'vue'

const buildPart = ref('application')
</script>

<div class="kicker">ZÁKLAD · CO JE CONTAINER</div>
<div class="status-badge verify">INTERNÍ UKÁZKA</div>

# Co je container?<br><span class="accent">Aplikace + závislosti v přenositelném balíčku.</span>
<div class="ot-lifecycle ot-lifecycle-clicks">
  <div class="ot-lifecycle-stage is-build"><span>01 · SESTAVÍM</span><b>BUILD</b><small>vyber část služby</small><div class="ot-build-tabs"><button class="ot-build-tab" :class="{ active: buildPart === 'application' }" @click="buildPart = 'application'"><strong>APLIKACE</strong><small>zdrojový kód</small></button><button class="ot-build-tab" :class="{ active: buildPart === 'dependencies' }" @click="buildPart = 'dependencies'"><strong>ZÁVISLOSTI</strong><small>knihovny · runtime</small></button><button class="ot-build-tab" :class="{ active: buildPart === 'configuration' }" @click="buildPart = 'configuration'"><strong>KONFIGURACE</strong><small>nastavení · příkazy</small></button></div><div class="ot-build-code" v-if="buildPart === 'application'"><span>APLIKACE · mappDatabase</span><code>WORKDIR /app<br>COPY ./app/mappdatabaseconnector_6_4.py /app</code></div><div class="ot-build-code" v-else-if="buildPart === 'dependencies'"><span>ZÁVISLOSTI · mappDatabase</span><code>RUN pip install --prefix=/install \\<br>    mysql-connector-python==8.0.33</code></div><div class="ot-build-code" v-else><span>KONFIGURACE · mappDatabase</span><code>ENV APP_PORT=85<br>CMD ["sh", "-c", "python -u /app/..."]</code></div></div>
   <!-- Duplicate BUILD stage removed -->
  <i class="ot-lifecycle-link"></i>
  <div class="ot-lifecycle-stage is-image" v-click="1"><span>02 · ZABALÍM A OZNAČÍM VERZÍ</span><b>IMAGE</b><small>verzovaný přenositelný<br>balíček služby</small><div class="ot-image-tags"><div><strong>service:1.2</strong><small>starší verze</small></div><div class="is-current"><strong>service:1.4</strong><small>aktuální tag</small></div><div><strong>service:2.0</strong><small>nová verze</small></div></div></div>
  <i class="registry ot-lifecycle-link" v-click="1"><small>registry<br>Docker Hub</small></i>
  <div class="ot-lifecycle-stage is-deploy" v-click="2"><span>03 · SPUSTÍM</span><b>DEPLOY</b><div class="ot-deploy-buttons"><div><span>PULL</span></div><div><span>RUN</span></div></div><div class="ot-daemon-rail" v-click="3"><span>ŘÍDICÍ TOK</span><strong>CLI → API → daemon / Engine</strong><small>přijímá požadavky a spravuje objekty Dockeru</small></div><div class="ot-deploy-animation"><div class="ot-deploy-source"><span>IMAGE</span><strong>service:1.4</strong></div><i></i><div class="ot-deploy-target"><span>RUNNING</span><strong>container</strong></div></div></div>
</div>
<div class="ot-architecture-foot" v-click="3"><div class="ot-definition"><strong>Image není běžící container.</strong><span>Image je balíček. Container je její spuštěná instance. Stejný běh vyžaduje kompatibilní hostitelský OS a CPU architekturu.</span></div><blockquote class="ot-source-quote"><p>“Docker containers wrap up a piece of software in a complete filesystem that contains everything it needs to run: code, runtime, system tools, system libraries — anything you can install on a server. This guarantees that it will always run the same, regardless of the environment it is running in.”</p><cite>Zdrojový princip z Docker training PDF · přenositelnost platí v kompatibilním prostředí.</cite></blockquote></div><div class="slide-id">03</div>

<!--
Výchozí obraz ukazuje build: aplikace, závislosti a konfigurace se připravují jako jeden balíček.
[CLICK]
Po sestavení se objeví image, tedy verzovaný balíček služby uložený v registry.
[CLICK]
Z image se při deployi spouští běžící container, konkrétní instance služby.
[CLICK]
CLI neposílá požadavek přímo do containeru. Přes API ho přijímá Docker daemon / Engine, který spravuje images, containers, networks a volumes. Registry image ukládá a distribuuje; samo container nespouští.
Citace shrnuje princip balení závislostí. Pro obchodní rozhovor je důležitá její hranice: přenositelnost znamená kompatibilní prostředí a architekturu CPU, ne libovolný operační systém.
-->

---
layout: default
class: ot-slide
---
<div class="kicker">SROVNÁNÍ · PROVOZNÍ DRIFT</div>

# Container snižuje rozdíly mezi<br><span class="accent">prostředími</span>
<div class="ot-compare-layout"><div class="ot-compare"><section class="ot-compare-card manual" v-click="1"><div class="ot-card-label">STANDARDNÍ INSTALACE</div><div class="ot-flow"><b>aplikace</b><i>+</i><b>hostitel</b><i>+</i><b>ruční konfigurace</b></div><ul><li>jiné verze knihoven</li><li>jiné nastavení stroje</li><li>ruční update a opravy</li></ul><strong>Výsledek: drift prostředí</strong></section><section class="ot-compare-card packaged" v-click="2"><div class="ot-card-label">CONTAINER</div><div class="ot-flow"><b>image</b><i>→</i><b>runtime</b><i>→</i><b>stejná služba</b></div><ul><li>balíček se závislostmi</li><li>verze je označená</li><li>nasazení lze opakovat</li></ul><strong>Výsledek: méně ručních zásahů</strong></section></div><figure class="ot-compare-visual" v-click="3"><img src="/automated_orchestration_b04ac97bfc.png" alt="Ruční úkoly oproti automatizované orchestraci"><figcaption><span>RUČNÍ INSTALACE</span><i>→</i><span>OPAKOVATELNÝ PROVOZ SLUŽEB</span></figcaption></figure></div>
<div class="ot-quote" v-click="4">Container snižuje počet ručních zásahů a pomáhá provozovat stejnou službu opakovatelně v kompatibilním prostředí.</div><div class="slide-id">04</div>
<!--
[CLICK]
Na levé straně vidíme klasickou instalaci: verze knihoven, nastavení a aktualizace se mohou mezi stroji lišit.
[CLICK]
Na pravé straně je image, runtime a stejná služba. Balíček má své závislosti a označenou verzi.
[CLICK]
Obrazový příklad pod tím propojuje oba přístupy: cílem není automatizace všeho, ale méně ručních zásahů a menší drift prostředí.
[CLICK]
Container tedy není lepší obecně. Dává smysl tam, kde chceme stejnou službu opakovatelně provozovat v kompatibilním prostředí.
-->

---
layout: default
class: dark-slide ot-slide
---
<script setup>
import { ref } from 'vue'

const stackView = ref('layers')
</script>

<div class="kicker">VRSTVY · CONTAINER VS VM</div>

# VM virtualizuje celé prostředí.<br><span class="accent">Container izoluje proces.</span>
<div class="ot-stack-tabs" role="tablist" aria-label="Pohled na srovnání VM a containeru"><button type="button" role="tab" :aria-selected="stackView === 'layers'" :class="{ active: stackView === 'layers' }" @click="stackView = 'layers'">VRSTVY</button><button type="button" role="tab" :aria-selected="stackView === 'decision'" :class="{ active: stackView === 'decision' }" @click="stackView = 'decision'">ROZHODNUTÍ</button></div>
<div v-if="stackView === 'layers'" class="ot-stack-panel"><div class="ot-stack-diagrams" v-click="1"><figure><figcaption>VM · VLASTNÍ GUEST OS</figcaption><img src="/virtual-machine-diagram.svg" alt="Vrstvy virtuálního stroje"></figure><figure><figcaption>CONTAINER · SDÍLENÝ HOST OS</figcaption><img src="/container-diagram.svg" alt="Vrstvy containeru"></figure></div><div class="ot-stack-callout" v-click="2"><b>Klíčový rozdíl:</b> container nemá vlastní Guest OS ani vlastní kernel. Sdílí kernel hostitelského systému.<br><small>VM virtualizuje celé prostředí; container izoluje proces a jeho závislosti. Schéma VM je zjednodušené, umístění hypervizoru závisí na jeho typu.</small></div><div class="ot-stack-axes" v-click="3"><span><b>IZOLACE</b><strong>VM: vyšší</strong><small>Container: cílená na službu</small></span><span><b>STARTUP</b><strong>VM: delší</strong><small>Container: obvykle rychlejší</small></span><span><b>ZDROJE</b><strong>VM: vyšší overhead</strong><small>Container: menší overhead</small></span></div></div><div v-else class="ot-stack-panel ot-stack-decision" v-click="1"><div class="ot-stack-decision-grid"><section><span>IZOLACE</span><strong>VM: vyšší</strong><small>Container: cílená na proces a jeho závislosti</small></section><section><span>STARTUP</span><strong>VM: delší</strong><small>Container: obvykle rychlejší</small></section><section><span>PROSTŘEDÍ</span><strong>VM: jiný Guest OS</strong><small>Container: kompatibilní host OS a kernel</small></section><section><span>REŽIE</span><strong>VM: vyšší</strong><small>Container: menší overhead, ne nulové nároky</small></section></div><div class="ot-stack-decision-boundary" v-click="2"><b>OT hranice:</b> ani VM ani container samy o sobě negarantují deterministický real-time, safety ani vysokou dostupnost. Volba závisí na potřebné izolaci a kompatibilitě cílové platformy.</div></div><div class="slide-id">05</div>

<!--
Výchozí pohled je nastavený na vrstvy. Záložka Rozhodnutí převede stejnou techniku do rychlého obchodního srovnání.
[CLICK]
Stacky ukážou hlavní rozdíl: VM má vlastní Guest OS, container ho nemá a sdílí kernel hostitelského systému.
[CLICK]
Doplňující panel převede vrstvy do praktického rozhodnutí: VM přináší silnější izolaci, container menší overhead pro samostatnou službu.
[CLICK]
Spodní osy připomenou, že volba závisí na potřebné izolaci, startu a zdrojích. Nejde o univerzální vítězství jedné technologie. V záložce Rozhodnutí je navíc vidět hranice pro real-time, safety a dostupnost.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">COMMAND DEMONSTRATOR · IMAGE → CONTAINER</div><div class="status-badge demonstrator">DEMONSTRATOR</div>

# Jak se z image stane<br><span class="accent">běžící container</span>
<div class="ot-command-demo">
  <aside class="ot-command-steps">
    <div v-click="1"><b>01</b><strong>BUILD</strong><small>Dockerfile → image</small></div>
    <div v-click="2"><b>02</b><strong>TEST</strong><small>ověřím chování image</small></div>
    <div v-click="3"><b>03</b><strong>PACKAGE</strong><small>tag → registry</small></div>
    <div v-click="4"><b>04</b><strong>PULL</strong><small>na cílový hostitel</small></div>
    <div v-click="5"><b>05</b><strong>RUN</strong><small>container + port</small></div>
    <div v-click="6"><b>06</b><strong>OBSERVE</strong><small>stav · logy · health</small></div>
    <div v-click="7"><b>07</b><strong>UPDATE</strong><small>stop · replace · verify</small></div>
  </aside>
  <div class="ot-command-terminal">
    <header><i></i><i></i><i></i><span>COMMAND PROMPT · LIFECYCLE / NGINX</span></header>
    <div class="ot-command-log">
      <div class="ot-command-row" v-click="1"><small>$</small><div class="ot-command-cell"><code>docker build -t demo-web:1.0 .</code><strong>IMAGE · demo-web:1.0 · BUILD COMPLETE</strong></div></div>
      <div class="ot-command-row" v-click="2"><small>$</small><div class="ot-command-cell"><code>docker run --rm demo-web:1.0 nginx -t</code><strong>TEST · image passes configuration check</strong></div></div>
      <div class="ot-command-row" v-click="3"><small>$</small><div class="ot-command-cell"><code>docker image ls; docker tag demo-web:1.0 registry.example/demo-web:1.0</code><strong>PACKAGE · traceable tag ready for registry</strong></div></div>
      <div class="ot-command-row is-pulling" v-click="4"><small>$</small><div class="ot-command-cell"><code>docker pull registry.example/demo-web:1.0</code><div class="ot-download-progress" aria-label="Downloading image"><span class="ot-download-hash">####################################################################################################</span><span class="ot-download-value">100%</span></div><strong>PULL · pinned tag on target host</strong></div></div>
      <div class="ot-command-row" v-click="5"><small>$</small><div class="ot-command-cell"><code>docker run -d --name demo-web -p 8080:80 registry.example/demo-web:1.0</code><strong>RUN · host :8080 → container :80</strong></div></div>
      <div class="ot-command-row" v-click="6"><small>$</small><div class="ot-command-cell"><code>docker ps; docker logs demo-web</code><strong>OBSERVE · running · responding · logs available</strong></div></div>
      <div class="ot-command-row" v-click="7"><small>$</small><div class="ot-command-cell"><code>docker stop demo-web; docker run -d --name demo-web -p 8080:80 registry.example/demo-web:1.1</code><strong>UPDATE · replace, then verify again</strong></div></div>
    </div>
    <footer>GENERAL EXAMPLE · IMAGE LIFECYCLE + CONTAINER OPERATIONS</footer>
  </div>
</div>
<div class="ot-command-reference" v-click="7"><span>DOCKER HUB</span><a href="https://hub.docker.com/_/nginx" target="_blank">hub.docker.com/_/nginx</a><small>image = balíček · container = běžící instance</small></div><div class="slide-id">06</div>

<!--
Na slidu je obecný Docker příklad, ne B&R produkční image. Nginx zde slouží jako snadno čitelná ukázková služba.
[CLICK]
Nejdřív sestavíme image z Dockerfile. Image je artefakt, který se dá testovat a verzovat nezávisle na běžícím containeru.
[CLICK]
Testovací běh ověří očekávané chování image dřív, než ji pošleme dál.
[CLICK]
Tag a registry vytvoří dohledatelný artefakt pro deployment. Tady se odděluje lifecycle image od lifecycle containeru.
[CLICK]
Na cílovém hostiteli stáhneme konkrétní tag `registry.example/demo-web:1.0`. `latest` není deployment plán.
[CLICK]
Příkaz `run` vytvoří běžící container a publikuje službu na portu `8080` hostitele. Přepínač `-d` znamená běh na pozadí.
[CLICK]
`docker ps` ukáže stav instance a `docker logs` provozní stopu. Monitoring a health nejsou kosmetický výpis, ale součást provozu.
[CLICK]
Update znamená řízenou výměnu instance: zastavit starou verzi, spustit novou a znovu ověřit stav. Odkaz pod terminálem vede na obecnou nginx image v Docker Hubu.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">OT · KDE TO DÁVÁ SMYSL</div>

# Služby kolem PLC lze nasazovat<br><span class="accent">rychleji a opakovaně</span>
<div class="ot-before-after" v-click="1"><section><span>DŘÍVE</span><strong>8 ručních instalací</strong><div class="ot-install-row"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><small>každý stroj trochu jiný</small></section><mdi-arrow-right /><section class="is-good"><span>S CONTAINEREM</span><strong>1 balíček, opakovaně nasazený</strong><div class="ot-package">IMAGE<br><small>verze 1.4</small></div><small>rychlejší rozjezd · samostatný update mimo PLC · opakovatelnost</small></section></div><div class="ot-benefit-grid" v-click="2"><div><b>01</b><strong>Rychlejší rozjezd</strong><small>doplňkové služby</small></div><div><b>02</b><strong>Update mimo PLC</strong><small>oddělený životní cyklus</small></div><div><b>03</b><strong>Stejné řešení</strong><small>další stroj nebo závod</small></div></div><div class="ot-disclaimer" v-click="3">Přínos vždy závisí na rozsahu a implementaci.</div><div class="slide-id">07</div>

<!--
Výchozí srovnání ukazuje známý problém: při ruční instalaci se každý stroj může časem lišit.
[CLICK]
Po odhalení pravé strany je vidět jeden verzovaný balíček a stejný deployment pro další místo.
[CLICK]
Spodní karty doplní tři praktické hodnoty: rychlejší přípravu služby, update mimo PLC a opakovatelnost.
Přínos není automatická úspora. Závisí na rozsahu projektu a na tom, jak je deployment připravený.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">B&amp;R PŘÍKLAD · VÁNAD / PÁLÍCÍ STROJE</div><div class="status-badge illustrative">INTERNÍ PŘÍKLAD</div>

# CSV do PLC vs. MariaDB + BR services:<br><span class="accent">oddělené role, menší projekt a robustnější data</span>
<div class="ot-db-compare" v-click="1"><section><span>PŘED</span><div class="ot-db-flow tangled"><b>CSV</b><i>→</i><b>parsování při startu</b><i>→</i><b>struktury v PLC</b></div><small>watchdog · velké struktury · růst dat v PLC</small></section><section class="is-good"><span>PO</span><div class="ot-db-flow"><b>pálicí plán</b><i>→</i><b>BR service</b><i>→</i><b>MariaDB + volume</b></div><small>role oddělené · data persistentní · nasazení opakovatelné</small></section></div><div class="ot-db-bottom" v-click="2"><div><strong>Problém</strong><span>velké CSV, parsing při startu a velké PLC struktury</span></div><div><strong>Přechod</strong><span>mappDatabase / BR service odděleně · MariaDB jako vlastní role</span></div><div class="warning"><strong>Takeaway</strong><span>deployment zjednodušený · data přehlednější · dopad závisí na implementaci</span></div></div><div class="ot-db-bottom" v-click="3"><div><strong>RUNTIME</strong><span>Podman v produkčním nasazení tohoto příkladu</span></div><div><strong>PERSISTENCE</strong><span>MariaDB na persistentním volume · zálohy a obnova</span></div><div class="warning"><strong>VERZE</strong><span>konkrétní image tag, ne latest</span></div></div><div class="slide-id">08</div>

<!--
Tohle je označený interní produkční příklad z prostředí pálicích strojů. Nejde o univerzální benchmark ani o hotovou referenci pro každý projekt.
[CLICK]
Horní srovnání ukazuje změnu: data se přesouvají z velkých CSV a struktur v PLC do oddělené BR service a databázové role.
[CLICK]
Spodní řádky doplňují provozní podmínky tohoto příkladu: Podman, persistentní MariaDB data se zálohami a konkrétní image tagy.
Pointa je oddělení rolí a opakovatelnost. Přesný přínos se musí posoudit podle konkrétní implementace.
-->

---
layout: default
class: dark-slide ot-slide
---
<script setup>
import { ref } from 'vue'

const selectedUseCase = ref(null)

const useCases = {
  commissioning: {
    number: '01',
    title: 'DevOps a commissioning',
    summary: 'Simulované protistrany, testování HMI a zrychlený FAT.',
    detail: 'Container může dodat dočasnou nebo opakovatelnou protistranu, která simuluje databázi, API, zařízení nebo další službu potřebnou při testu.',
    value: 'Rychlejší příprava testovacího prostředí bez ruční instalace každé závislosti.',
    boundary: 'Neřeší bezpečnostní validaci ani nenahrazuje test na reálném zařízení, pokud je pro něj potřeba.'
  },
  central: {
    number: '02',
    title: 'Centrální služba',
    summary: 'Data, reporting nebo dispečink pro více zákazníků.',
    detail: 'Systémový integrátor nebo OEM může provozovat stejnou datovou či reportingovou službu pro více strojů a lokalit.',
    value: 'Jednotný deployment, verzování a aktualizace služby napříč instalacemi.',
    boundary: 'Je potřeba vyřešit izolaci zákazníků, přístupy, síť, monitoring a odpovědnost za provoz.'
  },
  scale: {
    number: '03',
    title: 'Škálování',
    summary: 'Stejný stack pro další stroj, zákazníka nebo lokalitu.',
    detail: 'Image a konfigurace tvoří opakovatelný deployment artefakt. Další instalace nemusí začínat ručním skládáním prostředí.',
    value: 'Méně driftu mezi stroji a snazší rollout stejné služby.',
    boundary: 'Cílová platforma, CPU architektura, storage a síť musí být kompatibilní.'
  },
  edge: {
    number: '04',
    title: 'Edge service',
    summary: 'Propojení IT/OT, B&R IIoT Connector nebo vlastní řešení.',
    detail: 'Container může hostovat doprovodnou službu mezi PLC a IT světem: gateway, konektor, lokální API nebo předzpracování dat.',
    value: 'Oddělení integrační vrstvy od PLC runtime a možnost samostatného update.',
    boundary: 'Nutné je posoudit síťové hranice, bezpečnost, dostupnost a latenci konkrétní komunikace.'
  },
  predictive: {
    number: '05',
    title: 'Prediktivní údržba',
    summary: 'Sběr dat, dashboardy a analytika kolem PLC.',
    detail: 'Samostatná služba může sbírat provozní data, připravovat je pro dashboard nebo spouštět analytický model mimo řídicí cyklus.',
    value: 'Analytiku lze měnit a aktualizovat bez zásahu do primárního řízení.',
    boundary: 'Data potřebují persistentní uložení, zálohování a jasně definovanou odpovědnost za výsledek analýzy.'
  },
  orchestration: {
    number: '06',
    title: 'Orchestrace / multi-site',
    summary: 'Více služeb nebo lokalit s řízeným deploymentem.',
    detail: 'Další provozní vrstva může řídit nasazení, routing, škálování, monitoring a obnovu více containerů nebo lokalit.',
    value: 'Jednotnější správa většího počtu instancí a lepší přehled o jejich stavu.',
    boundary: 'Orchestrace není automatická vlastnost containeru. Dává smysl až podle počtu služeb, lokalit, dostupnosti a odpovědnosti za provoz.'
  }
}
</script>

<div class="kicker">POTENCIÁL · DALŠÍ SITUACE</div>

# Kde se ještě container<br><span class="accent">hodí v OT?</span>
<div v-if="!selectedUseCase" class="ot-use-grid"><button class="ot-use-card" v-for="(useCase, key) in useCases" :key="key" @click="selectedUseCase = key"><span>{{ useCase.number }}</span><h2>{{ useCase.title }}</h2><p>{{ useCase.summary }}</p><b>OTEVŘÍT DETAIL · →</b></button></div>
<div v-else class="ot-use-detail"><button class="ot-use-close" @click="selectedUseCase = null">← PŘEHLED MOŽNOSTÍ</button><div class="ot-use-detail-head"><span>{{ useCases[selectedUseCase].number }}</span><div><h2>{{ useCases[selectedUseCase].title }}</h2><p>{{ useCases[selectedUseCase].summary }}</p></div></div><div class="ot-use-detail-grid"><section><span>CO TO ZNAMENÁ</span><p>{{ useCases[selectedUseCase].detail }}</p></section><section><span>OBCHODNÍ HODNOTA</span><p>{{ useCases[selectedUseCase].value }}</p></section><section class="boundary"><span>NA CO POZOR</span><p>{{ useCases[selectedUseCase].boundary }}</p></section></div></div><div v-if="!selectedUseCase" class="ot-use-footer">Potenciální využití, nikoli automaticky hotové řešení. Orchestrace je další provozní vrstva.</div><div class="slide-id">09</div>
<!--
Tento slide funguje jako menu potenciálních scénářů, ne jako katalog hotových B&R řešení.
Kliknutím na kartu otevřeme detail: co služba dělá, jakou hodnotu může přinést a na co si dát pozor.
Karta orchestrace bude samostatná hranice pro větší počet služeb a lokalit: deployment, síťování, monitoring, failover a škálování.
Po návratu do přehledu můžeme s obchodníkem vybrat jen ty scénáře, které odpovídají jeho zákazníkovi.
-->

---
layout: default
class: ot-slide
---
<div class="kicker">KVALIFIKACE · ROZHODOVACÍ RÁMEC</div>

# Kdy otevřít téma<br><span class="accent">containeru?</span>
<div class="ot-limit-grid" v-click="1"><article><span>01 · AKTUALIZACE</span><strong>Jak se služba aktualizuje?</strong></article><article><span>02 · NASAZENÍ</span><strong>Kolikrát se nasazuje a kde?</strong></article><article><span>03 · DOPLŇKOVÁ SLUŽBA</span><strong>Přibývá databáze, dashboard nebo integrace?</strong></article><article class="warning"><span>04 · PROVOZ</span><strong>Kdo odpovídá za monitoring, zálohy a obnovu?</strong></article></div><div class="ot-yes-no" v-click="2"><div><span>ANO</span><b>služba kolem PLC s vlastním životním cyklem</b></div><div><span>ZÁVISÍ</span><b>GUI · platforma · síť · storage · dostupnost</b></div><div class="no"><span>NE</span><b>real-time řízení · safety · primární I/O</b></div></div><div class="ot-specialist" v-click="3"><mdi-account-hard-hat-outline /><strong>Další krok: technické posouzení.</strong><span>Ověřit container runtime, hostitelský OS a kernel, hardware, síť, bezpečnost, persistence a provozní odpovědnost.</span></div><div class="slide-id">10</div>
<!--
Než řešíme konkrétní platformu, zjistíme, zda má služba vlastní životní cyklus a opakuje se její provoz.
[CLICK]
Tyto čtyři otázky rychle ukážou, zda řešíme samostatnou službu: způsob aktualizace, počet nasazení, databázi nebo integraci a vlastníka provozu.
[CLICK]
Odpověď pak není automatické ano. Container dává smysl pro služby kolem PLC; u platformy, sítě, storage nebo dostupnosti záleží na konkrétním prostředí. Pro real-time, safety a primární I/O je hranice jasná.
[CLICK]
Dalším krokem je technické posouzení: ověřit container runtime, hostitelský OS a kernel, hardware, síť, bezpečnost, persistence a odpovědnost za provoz.
-->

---
layout: default
class: dark-slide ot-slide
---
<div class="kicker">LICENCE · PROVOZNÍ RÁMEC</div><div class="status-badge verify">OVĚŘIT PŘED NASAZENÍM</div>

# Container není jen image:<br><span class="accent">ověřte i licence kolem ní</span>
<div class="ot-limit-grid ot-license-grid" v-click="1"><article><span>RUNTIME</span><strong>Docker Desktop, Docker Engine nebo Podman</strong><p>Podmínky se liší podle produktu, organizace a způsobu použití. Komerční nasazení ověřit v aktuálních podmínkách.</p></article><article><span>IMAGE + ZÁVISLOSTI</span><strong>Base image, balíčky a zdrojový kód</strong><p>Jedna image může obsahovat více licencí. Open source neznamená bez povinností.</p></article><article class="warning"><span>CO PŘEDÁVÁME</span><strong>Inventář, notices a odpovědnost</strong><p>Uchovat zdroje, licenční texty, změny image a vlastníka aktualizací.</p></article></div><div class="ot-yes-no ot-license-checks" v-click="2"><div><span>OTÁZKA 01</span><b>Jaký runtime se instaluje a kdo ověřil jeho podmínky pro komerční provoz?</b></div><div><span>OTÁZKA 02</span><b>Jaké licence mají base image, knihovny a dodané služby?</b></div><div class="no"><span>OTÁZKA 03</span><b>Kdo schvaluje aktualizace, notices a případné licenční změny?</b></div></div><div class="ot-specialist" v-click="3"><mdi-account-hard-hat-outline /><strong>Licence je součást technického posouzení.</strong><span>Sales signál: před předáním zapojit vlastníka řešení, security nebo právní podporu.</span></div><div class="slide-id">11</div>
<!--
Licence runtime, image a jednotlivých závislostí nejsou jedna otázka. Docker Desktop, Docker Engine, Podman i konkrétní image mohou mít jiné podmínky.
[CLICK]
Nejprve projdeme tři oblasti kontroly: runtime, base image se závislostmi a to, co předáváme spolu s image.
[CLICK]
Potom položíme tři provozní otázky: kdo ověřuje podmínky runtime, jaké licence mají závislosti a kdo schvaluje aktualizace nebo změny notices.
[CLICK]
Licence je součást technického posouzení. Před předáním zapojíme vlastníka řešení, security nebo právní podporu podle konkrétního projektu.
-->

---

# Container je vhodný, když chcete službu<br><span class="accent">provozovat odděleně od PLC</span>
<div class="ot-takeaway-grid" v-click="1"><div><mdi-vector-link /><strong>Oddělení</strong><span>vlastní životní cyklus</span></div><div><mdi-update /><strong>Update</strong><span>mimo řídicí aplikaci</span></div><div><mdi-content-copy /><strong>Opakovatelnost</strong><span>stejný balíček znovu</span></div><div><mdi-shield-check-outline /><strong>Stabilita</strong><span>méně driftu prostředí</span></div></div><div class="ot-final-line" v-click="2"><span>PLC</span><b>řídí stroj</b><i>+</i><span>CONTAINER</span><b>provozuje služby okolo PLC</b></div><div class="ot-final-question" v-click="3">Pokud služba nepatří do reálného řídicího cyklu, může být container vhodná cesta.</div><div class="slide-id">12</div>
<!--
Závěrem si držme jednoduché rozdělení: PLC řídí stroj, container provozuje službu kolem něj.
[CLICK]
Čtyři body shrnují hodnotu: vlastní životní cyklus, samostatný update, opakovatelné nasazení a menší drift prostředí.
[CLICK]
Rovnice na středu slidu vrací pozornost k odpovědnostem: container doplňuje PLC, nenahrazuje ho.
[CLICK]
Další krok je technické posouzení konkrétní platformy, bezpečnosti, sítě, licencí a provozního modelu.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">TECHNICKÝ ZOOM · VOLITELNÝ APPENDIX</div><div class="status-badge verify">PRO TECHNICKOU DISKUZI</div>

# Container není nový server<br><span class="accent">je to izolovaný proces</span>
<div class="ot-anatomy" v-click="1"><section class="ot-anatomy-node host"><span>HOSTITEL</span><strong>Hardware<br>+ host OS</strong><small>kernel je sdílený základ</small></section><i class="ot-anatomy-arrow"></i><section class="ot-anatomy-node runtime"><span>RUNTIME</span><strong>Docker Engine<br>nebo Podman</strong><small>izoluje proces, síť a souborový systém</small></section><i class="ot-anatomy-arrow"></i><section class="ot-anatomy-node container"><span>BĚŽÍCÍ CONTAINER</span><div class="ot-anatomy-layers"><div><b>APP</b><small>služba</small></div><div><b>LIBS</b><small>závislosti</small></div><div><b>BASE</b><small>image vrstvy</small></div></div></section></div>
<div class="ot-anatomy-support" v-click="2"><article><span>IMAGE</span><strong>Read-only vrstvy</strong><small>base image · knihovny · aplikace</small></article><article><span>NETWORK</span><strong>Explicitní spojení</strong><small>porty a sítě se nastavují</small></article><article><span>VOLUME</span><strong>Data mimo container</strong><small>databáze · konfigurace · zálohy</small></article></div>
<div class="ot-anatomy-note" v-click="3"><strong>MENTÁLNÍ ZKRATKA</strong><span>Image je balíček. Runtime ho spustí. Container je běžící proces.</span></div><div class="slide-id">13</div>

<!--
Volitelný technický zoom překládá architekturu do jedné věty: container není malý virtuální server, ale izolovaný proces řízený runtime.
[CLICK]
Hostitel poskytuje hardware a OS, runtime připraví izolaci a image dodá aplikaci s jejími závislostmi.
[CLICK]
Image je znovu použitelný balíček. Síť se nastavuje explicitně a persistentní data patří do volume nebo externí databáze, ne do pomíjivé vrstvy containeru.
Na Docker Desktopu je tato architektura uvnitř Linux VM; to nemění rozdíl mezi image, runtime a běžícím containerem.
-->
