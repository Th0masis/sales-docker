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
defaults:
  layout: default
layout: cover
---
<img class="cover-logo" src="/br-logo.svg" alt="B&amp;R Industrial Automation">
<div class="eyebrow">B&amp;R INDUSTRIAL AUTOMATION · SALES BRIEFING</div>
<div class="cover-event"><span>OT · CONTAINERS</span><span>PRVNÍ VERZE</span></div>

# Kontejnerizace<br><span class="accent">v automatizaci</span>
<p class="cover-sub">PLC řídí stroj. Containery provozují služby okolo PLC.</p>
<div class="ot-cover-rule"><span>JAK POZNAT, KDY MÁ KONTEJNER V OT SMYSL</span></div>
<div class="slide-id">01</div>
<!--
[CLICK]
Hlavní myšlenka: PLC dál řídí stroj. Container přichází do hry u služeb, které běží vedle PLC.  
[CLICK]
První obrazový signál: levá strana je řízení stroje, vpravo se objevují doprovodné služby.  
[CLICK]
Tím se vytváří základní rámec celé prezentace: PLC zůstává rozhodující, container je pro služby kolem něj.  
[CLICK]
Na konci by divák měl vědět, že otázka není „PLC nebo container“, ale „kdy je container vhodný pro služby vedle PLC“.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">KONTEXT · PROČ TO ŘEŠÍME</div>

# Kolem PLC přibývají služby s jiným<br><span class="accent">životním cyklem</span>
<div class="ot-harness-layout" v-click="1"><div class="ot-harness-core"><span>CORE · ŘÍZENÍ STROJE</span><strong>PLC</strong><small>deterministické řízení<br>reálný čas · I/O · safety hranice</small></div><div class="ot-harness-bridge"><i></i><i></i><i></i><i></i></div><div class="ot-harness-services"><article><span>01</span><strong>DATA</strong><small>sběr · historie</small></article><article><span>02</span><strong>DATABÁZE</strong><small>persistentní uložení</small></article><article><span>03</span><strong>INTEGRACE</strong><small>IT · cloud · reporting</small></article><article><span>04</span><strong>DIAGNOSTIKA</strong><small>monitoring · test</small></article></div></div>
<div class="ot-context-strip" v-click="2"><section><span>DNES</span><strong>PLC + strojové řízení</strong></section><section class="is-active"><span>PŘIBÝVÁ</span><strong>Data · databáze · reporting · IT</strong></section><section><span>NAPĚTÍ</span><strong>Více verzí a životních cyklů</strong></section></div>
<div class="ot-question" v-click="3"><span>OTÁZKA PRO OBCHODNÍKA</span><strong>Je to stále součást řídicí aplikace, nebo už samostatná služba, kterou máme provozovat vedle PLC?</strong></div><div class="ot-bottom-callout" v-click="4">Pokud služba nepatří do reálného řídicího cyklu, otevírá se prostor pro samostatné nasazení a údržbu.</div><div class="slide-id">02</div>

<!--
[CLICK]
První krok: PLC má jiný úkol než databáze, dashboard nebo integrační služba. Jeho práce je deterministické řízení stroje.  
[CLICK]
Druhý krok: kolem PLC přibývají služby s jiným životním cyklem: data, historie, reporting, IT integrace, diagnostika.  
[CLICK]
Třetí krok: vchází do hry otázka, zda je to stále součást řídicí aplikace nebo už samostatná služba kolem PLC.  
[CLICK]
Závěr: container zde není náhrada PLC, ale nástroj pro oddělení a opakované provozování doprovodných služeb.
-->

---
layout: default
class: dark-slide ot-slide
---
<script setup>
import { ref } from 'vue'

const selectedBuildFile = ref('app')

const buildFiles = {
  app: { name: 'app.py', code: 'from service import app\napp.start()' },
  dependencies: { name: 'requirements.txt', code: 'fastapi==0.115.0\nuvicorn==0.30.6' },
  config: { name: 'config.yml', code: 'port: 8080\nlog_level: info' }
}
</script>

<div class="kicker">ZÁKLAD · CO JE CONTAINER</div>

# Co je container?<br><span class="accent">Služba zabalená se svými závislostmi.</span>
<div class="ot-lifecycle ot-lifecycle-clicks">
  <div class="ot-lifecycle-stage is-build" v-click="1"><span>01 · VYTVÁŘÍM</span><b>BUILD</b><small>aplikace + závislosti + konfigurace</small><div class="ot-build-mini"><div role="tablist" aria-label="Soubory služby"><button v-for="(file, key) in buildFiles" :key="key" type="button" :class="{ 'is-active': selectedBuildFile === key }" :aria-selected="selectedBuildFile === key" :title="`Zobrazit ${file.name}`" @click.stop="selectedBuildFile = key"><code>{{ file.name }}</code></button></div><pre><code>{{ buildFiles[selectedBuildFile].code }}</code></pre></div></div>
  <i class="ot-lifecycle-link" v-click="1"></i>
  <div class="ot-lifecycle-stage is-image" v-click="2"><span>02 · ZABALÍM A OZNAČÍM VERZÍ</span><b>IMAGE</b><small>verzovaný balíček služby</small><div class="ot-image-tags"><div><strong>service:1.2</strong><small>starší verze</small></div><div class="is-current"><strong>service:1.4</strong><small>aktuální tag</small></div><div><strong>service:2.0</strong><small>nová verze</small></div></div></div>
  <i class="registry ot-lifecycle-link" v-click="2"><small>registry<br>Docker Hub</small></i>
  <div class="ot-lifecycle-stage is-deploy" v-click="3"><span>03 · SPUSTÍM</span><b>DEPLOY</b><small>image se spustí jako běžící container</small><div class="ot-deploy-animation"><div class="ot-deploy-column"><div class="ot-deploy-action"><span>PULL</span></div><div class="ot-deploy-source"><span>IMAGE</span><strong>service:1.4</strong></div></div><i></i><div class="ot-deploy-column"><div class="ot-deploy-action"><span>RUN</span></div><div class="ot-deploy-target"><span>RUNNING</span><strong>container</strong></div></div></div></div>
</div>
<div class="ot-definition" v-click="4"><strong>Image není běžící container.</strong><span>Image je balíček. Container je její spuštěná instance.</span></div>
<div class="ot-note-row" v-click="4"><span>STEJNÝ BĚH</span><b>v kompatibilním prostředí</b><i></i><span>PŘENOSITELNOST ≠ LIBOVOLNÝ OS</span></div><div class="slide-id">03</div>

<!--
[CLICK]
První krok: container je aplikace se svými závislostmi a konfigurací v jednom balíčku.  
[CLICK]
Druhý krok: build vytváří image, tedy verzovaný balíček služby.  
[CLICK]
Třetí krok: z image se spustí běžící container, tedy konkrétní instance služby.  
[CLICK]
Shrnutí: přenositelnost neznamená „na jakýkoli OS“, ale „do kompatibilního prostředí a kompatibilní architektury CPU“.[CLICK]
Poznámka pro sales: tento slide je obecný princip; konkrétní B&R deployment, runtime a platformu posoudí technický specialista.-->

---
layout: default
class: ot-slide
---

<div class="kicker">SLOVNÍK · ČTYŘI POJMY</div>

# Co přesně se v container řešení<br><span class="accent">buildí, spouští a ukládá?</span>
<div class="ot-semantic-grid"><section v-click="1"><span>IMAGE</span><strong>Verzovaný balíček</strong><p>Obsahuje aplikaci, závislosti a konfiguraci potřebnou pro běh.</p></section><section v-click="2"><span>CONTAINER</span><strong>Běžící instance</strong><p>Je spuštěná z konkrétní image a má vlastní životní cyklus.</p></section><section v-click="3"><span>RUNTIME</span><strong>Prostředí pro běh</strong><p>Hostitel a jeho runtime vytváří, spouští a spravuje containery.</p></section><section v-click="4"><span>VOLUME</span><strong>Persistentní data</strong><p>Odděluje data služby od dočasného filesystemu containeru.</p></section></div>
<div class="ot-definition" v-click="5"><strong>Praktická zkratka:</strong><span>image se vytváří a distribuuje; container se spouští a nahrazuje; volume se zálohuje a obnovuje.</span></div><div class="slide-id">04</div>

<!--
[CLICK]
Image je verzovaný balíček. Máme vědět, kterou konkrétní verzi služby chceme provozovat.
[CLICK]
Container je běžící instance image. Jeho restart nebo nahrazení samo o sobě nemění image.
[CLICK]
Runtime je prostředí na hostiteli, které běh spravuje. Proto je součástí technického posouzení cílová platforma, síť a odpovědnost za provoz.
[CLICK]
Volume řeší persistentní data. Databáze nebo důležitá konfigurace nesmí záviset jen na dočasném filesystemu containeru.
[CLICK]
Toto rozdělení vede k praktické otázce: kdo vlastní image, kdo provoz containeru a kdo ověřuje zálohu a obnovu dat.
-->

---
layout: default
class: ot-slide
---
<div class="kicker">SROVNÁNÍ · PROVOZNÍ DRIFT</div>

# Container snižuje rozdíly mezi<br><span class="accent">prostředími</span>
<div class="ot-compare-layout"><div class="ot-compare"><section class="ot-compare-card manual" v-click="1"><div class="ot-card-label">STANDARDNÍ INSTALACE</div><div class="ot-flow"><b>aplikace</b><i>+</i><b>hostitel</b><i>+</i><b>ruční konfigurace</b></div><ul><li>jiné verze knihoven</li><li>jiné nastavení stroje</li><li>ruční update a opravy</li></ul><strong>Výsledek: drift prostředí</strong></section><section class="ot-compare-card packaged" v-click="2"><div class="ot-card-label">CONTAINER</div><div class="ot-flow"><b>image</b><i>→</i><b>runtime</b><i>→</i><b>stejná služba</b></div><ul><li>balíček se závislostmi</li><li>verze je označená</li><li>nasazení lze opakovat</li></ul><strong>Výsledek: méně ručních zásahů</strong></section></div><figure class="ot-compare-visual" v-click="3"><img src="/automated_orchestration_b04ac97bfc.png" alt="Ruční úkoly oproti automatizované orchestraci"><figcaption><span>RUČNÍ INSTALACE</span><i>→</i><span>OPAKOVATELNÝ PROVOZ SLUŽEB</span></figcaption></figure></div>
<div class="ot-quote" v-click="4">Container snižuje počet ručních zásahů a pomáhá provozovat stejnou službu opakovatelně v kompatibilním prostředí.</div><div class="slide-id">05</div>
<!--
[CLICK]
První krok: standardní instalace na hostitelském systému vytváří rozdílné verze knihoven, nastavení a update na každém stroji.  
[CLICK]
Druhý krok: s containerem se služba balí jako jeden artefakt se svými závislostmi a verzí.  
[CLICK]
Třetí krok: výsledek je menší drift prostředí a méně ručních zásahů při nasazení nebo úpravách.  
[CLICK]
Závěr: nejde o to, že je container „lepší obecně“, ale že zjednodušuje opakovatelnost běhu služby ve srovnatelném prostředí.  
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">VRSTVY · CONTAINER VS VM</div>

# Kterou vrstvu skutečně<br><span class="accent">potřebujeme izolovat?</span>
<div class="ot-stack-diagrams" v-click="1"><section class="ot-stack-diagram"><h2>VM · VLASTNÍ GUEST OS</h2><div class="ot-stack-lanes"><div>APLIKACE</div><div>APLIKACE</div><div>APLIKACE</div></div><div class="ot-stack-lanes"><div>KNIHOVNY</div><div>KNIHOVNY</div><div>KNIHOVNY</div></div><div class="ot-stack-lanes ot-stack-guest"><div>GUEST OS</div><div>GUEST OS</div><div>GUEST OS</div></div><b>HYPERVIZOR</b><strong>HOSTITELSKÝ OS</strong></section><section class="ot-stack-diagram"><h2>CONTAINER · SDÍLENÝ HOST OS</h2><div class="ot-stack-lanes"><div>APLIKACE</div><div>APLIKACE</div><div>APLIKACE</div></div><div class="ot-stack-lanes"><div>KNIHOVNY</div><div>KNIHOVNY</div><div>KNIHOVNY</div></div><b>CONTAINER ENGINE</b><strong>HOSTITELSKÝ OS</strong></section></div><div class="ot-stack-callout" v-click="2"><b>Klíčový rozdíl:</b> container nemá vlastní Guest OS ani vlastní kernel. Sdílí kernel hostitelského systému.<br><small>VM virtualizuje celé prostředí; container izoluje proces, filesystem a závislosti.</small></div><div class="ot-stack-axes" v-click="3"><span>IZOLACE PROSTŘEDÍ</span><span>STARTUP</span><span>NÁROKY NA ZDROJE</span></div><div class="slide-id">06</div>

<!--
[CLICK]
První krok: VM virtualizuje celé prostředí s vlastním Guest OS, proto má větší izolaci, ale vyšší nároky na zdroje a pomalejší start. Schéma vychází z lokálního podkladu `docs/sources/docker-220721080017-eb0483d6.pdf`: VM přidává Guest OS pro každou instanci, zatímco containery sdílejí hostitelský OS a container engine.  
[CLICK]
Druhý krok: container izoluje službu a její závislosti, zatímco sdílí kernel hostitelského OS. Pro obchodníka je důležité si pamatovat rozdíl mezi image, runtime a běžícím containerem; konkrétní runtime a platformu vždy posoudí technický specialista.  
[CLICK]
Třetí krok: otázka není „co je lepší“, ale „kterou vrstvu chceme oddělit a jakou úroveň izolace skutečně potřebujeme“.  
[CLICK]
Závěr: container je vhodný tam, kde chceme oddělit službu, ne celé prostředí.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">ROZHODNUTÍ · VM NEBO CONTAINER</div>

# Nejde o to, co je lepší.<br><span class="accent">Rozhoduje potřebná izolace.</span>
<div class="ot-vm-decision"><section v-click="1"><span>VIRTUÁLNÍ STROJ</span><strong>Odděluje celé prostředí</strong><ul><li>vlastní Guest OS</li><li>vyšší izolace prostředí</li><li>vyšší režie a delší start</li><li>vhodný, když potřebujeme jiný OS nebo úplnější oddělení</li></ul></section><section v-click="2"><span>CONTAINER</span><strong>Odděluje službu</strong><ul><li>sdílí kernel hostitele</li><li>nižší režie a rychlejší start</li><li>samostatný lifecycle služby</li><li>vhodný pro přenosné služby v kompatibilním prostředí</li></ul></section></div>
<div class="ot-specialist" v-click="3"><mdi-account-hard-hat-outline /><strong>OT hranice platí pro obě možnosti.</strong><span>VM ani container samy o sobě negarantují deterministický real-time, safety, dostupnost nebo failover.</span></div><div class="slide-id">07</div>

<!--
[CLICK]
Virtuální stroj je vhodný, když potřebujeme izolovat celé prostředí včetně vlastního Guest OS. Přináší ale větší provozní režii.
[CLICK]
Container je vhodný, když chceme samostatně provozovat konkrétní službu se závislostmi v kompatibilním hostitelském prostředí.
[CLICK]
V OT nevybíráme podle zkratky „rychlejší“ nebo „modernější“. Technický specialista ověří determinismus, safety, dostupnost, síť a odpovědnost za provoz.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">COMMAND DEMONSTRATOR · IMAGE → CONTAINER</div><div class="status-badge demonstrator">OBECNÝ PŘÍKLAD</div>

# Jak se z image stane<br><span class="accent">běžící container</span>
<div class="ot-disclaimer" v-click="1">Nejde o B&R referenci. Jedná se o princip, jak image vznikne a jak z ní běží container.</div>
<div class="ot-runtime-lifecycle" aria-label="Životní cyklus služby v containeru"><span v-click="1"><b>01</b>BUILD</span><i v-click="2"></i><span v-click="2"><b>02</b>TEST</span><i v-click="3"></i><span v-click="3"><b>03</b>PACKAGE</span><i v-click="4"></i><span v-click="4"><b>04</b>PULL</span><i v-click="5"></i><span v-click="5"><b>05</b>RUN</span><i v-click="6"></i><span v-click="6"><b>06</b>OBSERVE</span><i v-click="7"></i><span v-click="7"><b>07</b>UPDATE</span></div>
<div class="ot-command-demo"><aside class="ot-command-steps"><div v-click="1"><b>01</b><strong>FIND IMAGE</strong><small>najdu image na Docker Hubu</small></div><div v-click="2"><b>02</b><strong>PULL IMAGE</strong><small>stáhnu konkrétní tag</small></div><div v-click="3"><b>03</b><strong>RUN</strong><small>spustím container z image</small></div><div v-click="4"><b>04</b><strong>OBSERVE</strong><small>ověřím stav přes docker ps</small></div></aside><div class="ot-command-terminal"><header><i></i><i></i><i></i><span>COMMAND PROMPT · DOCKER HUB</span></header><div class="ot-command-log"><div class="ot-command-row" v-click="1"><small>$</small><div class="ot-command-cell"><code>docker search nginx</code><strong>NAME · nginx · OFFICIAL IMAGE</strong><strong>DESCRIPTION · official web server image</strong></div></div><div class="ot-command-row is-pulling" v-click="2"><small>$</small><div class="ot-command-cell"><code>docker pull nginx:alpine</code><div class="ot-download-progress" aria-label="Downloading image"><span class="ot-download-bar" style="width: 72%"></span><span class="ot-download-hash">##########</span><span class="ot-download-value">72%</span></div><strong>STATUS · Downloading · nginx:alpine</strong><strong>RESULT · Downloaded newer image for nginx:alpine</strong></div></div><div class="ot-command-row" v-click="3"><small>$</small><div class="ot-command-cell"><code>docker run -d -p 8080:80 --name demo-web nginx:alpine</code><strong>RESULT · container created successfully</strong><strong>PORT MAPPING · 0.0.0.0:8080 → 80/tcp</strong></div></div><div class="ot-command-row" v-click="4"><small>$</small><div class="ot-command-cell"><code>docker ps</code><strong>STATUS · Up 3 seconds</strong><strong>NAMES · demo-web · IMAGE · nginx:alpine · PORTS · 0.0.0.0:8080->80/tcp</strong></div></div></div><footer>COMMAND DEMONSTRATOR · ACTION + OBSERVATION</footer></div></div><div class="ot-command-reference" v-click="4"><span>DOCKER HUB</span><a href="https://hub.docker.com/_/nginx" target="_blank">hub.docker.com/_/nginx</a><small>image = balíček · container = běžící instance</small></div><div class="slide-id">08</div>

<!--
[CLICK]
Build vytváří image; ještě před nasazením má tým ověřit očekávané chování služby. Obchodní otázka zní: kdo test a přijetí konkrétní verze vlastní?
[CLICK]
Ověřená image dostane konkrétní tag nebo digest a jde do registry. Tím vzniká dohledatelný artefakt pro další prostředí, ne nepojmenovaný soubor na serveru.
[CLICK]
Na cílovém hostiteli se image stáhne příkazem docker pull. Registry distribuuje image; Docker daemon / Engine pak spravuje samotný běh containeru.
[CLICK]
Příkaz docker run vytvoří a spustí container. Přepínač -p 8080:80 ukazuje, že port aplikace je přístupný z hostitele; síť a publikované porty jsou vědomé provozní rozhodnutí.
[CLICK]
Po spuštění sledujeme stav přes docker ps a diagnostiku přes docker logs nebo health check. „Běží“ není automaticky totéž jako „služba je připravená“.
[CLICK]
Aktualizace znamená ověřenou novou image, nahrazení běžící instance a znovu ověření služby. Image má životní cyklus build a distribuce; container má životní cyklus run, observe a replace.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">DOCKER COMPOSE · MENŠÍ STACK</div>

# Jedna deklarace pro<br><span class="accent">více služeb na jednom hostiteli</span>
<div class="ot-compose-layout"><pre class="ot-compose-code" v-click="1"><code>services:
  app:
    image: example/app:1.4
    ports: ["8080:8080"]
    depends_on: [db]
  db:
    image: mariadb:11.4
    volumes: [db-data:/var/lib/mysql]
volumes:
  db-data:</code></pre><div class="ot-compose-explain"><section v-click="2"><span>SLUŽBY A SÍŤ</span><strong><code>app</code> komunikuje s <code>db</code> přes název služby.</strong><p>Port publikujeme jen tam, kde ho potřebuje hostitel nebo externí klient.</p></section><section v-click="3"><span>DATA</span><strong>Named volume drží data mimo container.</strong><p>Persistentní data vyžadují zálohu a ověřený postup obnovy.</p></section></div></div>
<div class="ot-compose-commands" v-click="4"><code>docker compose up -d</code><code>docker compose ps</code><code>docker compose logs</code><code>docker compose down</code></div><div class="ot-compose-warning" v-click="5"><strong><code>depends_on</code> určuje pořadí startu, ne připravenost databáze.</strong><span>Compose usnadňuje lokální nebo edge stack na jednom hostiteli; není automaticky multi-site orchestrace ani vysoká dostupnost.</span></div><div class="slide-id">09</div>

<!--
[CLICK]
Docker Compose popíše více služeb v jednom YAML souboru. Není to další typ containeru, ale deklarace menšího stacku na jednom hostiteli.
[CLICK]
Služba app hledá databázi pod jménem db. Síť mezi službami je součást definice; port zveřejňujeme pouze tam, kde jej skutečně potřebuje hostitel nebo klient.
[CLICK]
Databázová data patří do named volume, ne pouze do filesystemu běžícího containeru. Proto je záloha a obnova konkrétní provozní odpovědnost.
[CLICK]
Příkazy ukazují běžný provoz stacku: spustit, ověřit stav, číst logy a řízeně ukončit. Příkaz down s parametrem -v by mohl odstranit named volumes, proto jej zde záměrně neukazujeme.
[CLICK]
depends_on není health check databáze, pouze pořadí startu. Compose je vhodný pro menší lokální nebo edge stack; více lokalit, failover a centrální správa vyžadují další provozní vrstvu.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">OT · KDE TO DÁVÁ SMYSL</div>

# Služby kolem PLC lze nasazovat<br><span class="accent">rychleji a opakovaně</span>
<div class="ot-before-after" v-click="1"><section><span>DŘÍVE</span><strong>8 ručních instalací</strong><div class="ot-install-row"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><small>každý stroj trochu jiný</small></section><mdi-arrow-right /><section class="is-good"><span>S CONTAINEREM</span><strong>1 balíček, opakovaně nasazený</strong><div class="ot-package">IMAGE<br><small>verze 1.4</small></div><small>rychlejší rozjezd · samostatný update mimo PLC · opakovatelnost</small></section></div><div class="ot-benefit-grid" v-click="2"><div><b>01</b><strong>Rychlejší rozjezd</strong><small>doplňkové služby</small></div><div><b>02</b><strong>Update mimo PLC</strong><small>oddělený životní cyklus</small></div><div><b>03</b><strong>Stejné řešení</strong><small>další stroj nebo závod</small></div></div><div class="ot-disclaimer" v-click="3">Přínos vždy závisí na rozsahu a implementaci.</div><div class="slide-id">10</div>

<div class="ot-qualification" v-click="4"><span>OTÁZKY PŘED DALŠÍM KROKEM</span><b>Kolikrát službu nasazujeme?</b><b>Jak ji budeme aktualizovat?</b><b>Je hostitel, síť a storage kompatibilní?</b><b>Kdo odpovídá za provoz?</b></div>
<!--
[CLICK]
První krok: ruční instalace vede k tomu, že každá linka nebo stroj pracuje trochu jinak.
[CLICK]
Druhý krok: s containerem je jeden balíček služby a stejný způsob nasazení na více místech.  
[CLICK]
Třetí krok: služba se může aktualizovat nebo rozjíždět samostatně, bez zásahu do PLC runtime.  
[CLICK]
Než nabídku posuneme dál, potřebujeme znát rozsah nasazení, způsob aktualizace, kompatibilitu hostitele, sítě a storage a vlastníka provozu. Tyto odpovědi jsou vstupem pro technického specialistu.
[CLICK]
Závěr: přínos závisí na rozsahu a implementaci, ale princip je stejný — opakovatelnost služeb kolem PLC.
-->

---
layout: default
class: ot-slide
---

<div class="kicker">B&amp;R PŘÍKLAD · VÁNAD / PÁLÍCÍ STROJE</div>

# CSV do PLC vs. MariaDB + BR services:<br><span class="accent">rychlejší start, menší projekt a robustnější data</span>
<div class="ot-db-compare" v-click="1"><section><span>PŘED</span><div class="ot-db-flow tangled"><b>CSV</b><i>→</i><b>parsování při startu</b><i>→</i><b>struktury v PLC</b></div><small>watchdog · velké struktury · dlouhý start</small></section><section class="is-good"><span>PO</span><div class="ot-db-flow"><b>pálicí plán</b><i>→</i><b>MariaDB + BR service</b><i>→</i><b>databázové tabulky</b></div><small>vývoj kratší · data přehlednější · lepší provoz</small></section></div><div class="ot-db-bottom" v-click="2"><div><strong>Problém</strong><span>velká CSV, parsing a startup v řádu minut</span></div><div><strong>Přechod</strong><span>data v DB, uživatelské tabulky a přesnější model</span></div><div class="warning"><strong>Takeaway</strong><span>deployment zjednodušený, dev čas kratší, data robustnější</span></div></div><div class="ot-db-bottom" v-click="3"><div><strong>Build once</strong><span>kontejnery zjednodušují deployment</span></div><div><strong>BR service</strong><span>běží na Podman v produkci</span></div><div class="warning"><strong>Specific tags</strong><span>nikdy latest, jen konkrétní verze</span></div></div><div class="slide-id">11</div>

<!--
[CLICK]
První krok: zákazník vyrábí pálicí stroje a podle pálicího plánu má různé profily pro různé tloušťky plechů, materiály a podmínky.  
[CLICK]
Druhý krok: původně byla data uložena v CSV, která se při startu načítala do struktur v PLC. Při velkých souborech to mohlo trvat i v řádu minut a způsobovalo watchdogy.  
[CLICK]
Třetí krok: projekt obsahoval velké struktury, parsování CSV bylo náročné a vývojář strávil hodně času vytvářením nových datových variant.  
[CLICK]
Závěr: po přechodu na MariaDB a BR services se odstranily zásadní nedostatky — menší struktury v PLC, rychlejší start, přehlednější data, kratší vývojový čas a robustnější řešení.   
[CLICK]
Produkční takeaway: kontejnerizace zjednodušuje deployment, BR services běží v produkci na Podman a používá se konkrétní verze image, nikdy latest.
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
  }
}
</script>

<div class="kicker">POTENCIÁL · DALŠÍ SITUACE</div>

# Kde se ještě container<br><span class="accent">hodí v OT?</span>
<div v-if="!selectedUseCase" class="ot-use-grid"><button class="ot-use-card" v-for="(useCase, key) in useCases" :key="key" @click="selectedUseCase = key"><span>{{ useCase.number }}</span><h2>{{ useCase.title }}</h2><p>{{ useCase.summary }}</p><b>OTEVŘÍT DETAIL · →</b></button></div>
<div v-else class="ot-use-detail"><button class="ot-use-close" @click="selectedUseCase = null">← PŘEHLED MOŽNOSTÍ</button><div class="ot-use-detail-head"><span>{{ useCases[selectedUseCase].number }}</span><div><h2>{{ useCases[selectedUseCase].title }}</h2><p>{{ useCases[selectedUseCase].summary }}</p></div></div><div class="ot-use-detail-grid"><section><span>CO TO ZNAMENÁ</span><p>{{ useCases[selectedUseCase].detail }}</p></section><section><span>OBCHODNÍ HODNOTA</span><p>{{ useCases[selectedUseCase].value }}</p></section><section class="boundary"><span>NA CO POZOR</span><p>{{ useCases[selectedUseCase].boundary }}</p></section></div></div><div v-if="!selectedUseCase" class="ot-use-footer">Potenciální využití, nikoli automaticky hotové řešení.</div><div class="slide-id">12</div>
<!--
[CLICK]
První krok: tohle jsou potenciální scénáře, nikoli hotová řešení; container otevírá prostor pro služby kolem PLC.
[CLICK]
Druhý krok: commissioning a testování mohou využít simulované protistrany a zrychlené přípravy prostředí.
[CLICK]
Třetí krok: centrální služba, edge integrace a analytika využívají stejný model: oddělená služba, vlastní životní cyklus a opakovatelné nasazení.
[CLICK]
Závěr: orchestrace přichází až ve větším měřítku, kdy potřebujeme síť, monitoring, failover a správu více instancí.
-->

---
layout: default
class: ot-slide
---
<div class="kicker">LIMITY · TECHNICKÉ POSOUZENÍ</div>

# Container není náhrada PLC runtime ani<br><span class="accent">univerzální řešení</span>
<div class="ot-limit-grid" v-click="1"><article><span>CO POTŘEBUJE?</span><strong>Runtime / Docker daemon<br>Hostitelský OS + kernel</strong></article><article><span>NA ČEM ZÁVISÍ?</span><strong>CPU architektura · paměť<br>výkon · storage · síť · speciální HW</strong></article><article><span>CO LZE ŘÍDIT?</span><strong>CPU limit / shares · memory limit<br>počet procesů a další runtime limity</strong></article><article class="warning"><span>CO Z TOHO NEPLYNE?</span><strong>Žádná garance real-time<br>safety, dostupnosti ani kritické automatizace</strong></article></div><div class="ot-yes-no" v-click="2"><div><span>ANO</span><b>data · integrace · reporting · dashboardy · přenosné služby · testovací prostředí</b></div><div><span>ZÁVISÍ</span><b>GUI a desktop · platforma · síť · odpovědnost</b></div><div class="no"><span>NE</span><b>real-time řízení · safety · primární I/O · kritická automatizace</b></div></div><div class="ot-specialist" v-click="3"><mdi-account-hard-hat-outline /><strong>Rozhodnutí patří technickému specialistovi.</strong><span>Ověřit runtime, hardware, síť, bezpečnost, aktualizace, odpovědnost a provoz; v praxi jde o image, síť, storage, restart policy, host OS a jasnou odpovědnost za provoz.</span></div><div class="slide-id">13</div>
<div class="ot-compliance" v-click="4"><span>JEŠTĚ PŘED DEPLOYMENTEM</span><strong>Ověřit licence runtime, image a závislostí.</strong><b>Právní, security a provozní odpovědnost nejsou vlastnost containeru.</b></div>
<!--
[CLICK]
První krok: container není samostatný počítač. Potřebuje runtime, hostitelský OS, kernel a kompatibilní platformu.
[CLICK]
Druhý krok: důležité je posoudit CPU architekturu, paměť, úložiště, síť a případné speciální hardware.
[CLICK]
Třetí krok: limity CPU a paměti mohou chránit ostatní služby, ale neřeší real-time, safety ani kritickou dostupnost.
[CLICK]
Před deploymentem patří do posouzení také licence runtime, image a závislostí. Tento krok řeší vlastník řešení se security nebo právní podporou podle konkrétního použití.
[CLICK]
Závěr: rozhodnutí o použití patří technickému specialistovi. Container je vhodný jen v správném rozsahu a s odpovídajícím provozním modelem.
-->

---
layout: default
class: dark-slide ot-slide ot-takeaway-slide
---
<div class="kicker">SHRNUTÍ · PRAKTICKÁ ZKRATKA</div>

# Container je vhodný, když chcete službu<br><span class="accent">provozovat odděleně od PLC</span>
<div class="ot-takeaway-grid" v-click="1"><div><mdi-vector-link /><strong>Oddělení</strong><span>vlastní životní cyklus</span></div><div><mdi-update /><strong>Update</strong><span>mimo řídicí aplikaci</span></div><div><mdi-content-copy /><strong>Opakovatelnost</strong><span>stejný balíček znovu</span></div><div><mdi-shield-check-outline /><strong>Stabilita</strong><span>méně driftu prostředí</span></div></div><div class="ot-final-line" v-click="2"><span>PLC</span><b>řídí stroj</b><i>+</i><span>CONTAINER</span><b>provozuje služby okolo PLC</b></div><div class="ot-final-question" v-click="3">Pokud služba nepatří do reálného řídicího cyklu, může být container vhodná cesta.</div><div class="slide-id">14</div>
<!--
[CLICK]
První krok: PLC řídí stroj a zůstává v primární odpovědnosti za deterministické řízení.
[CLICK]
Druhý krok: container provozuje služby kolem PLC — data, integrační vrstvu, reporting, diagnostiku nebo testovací prostředí.
[CLICK]
Třetí krok: pokud služba nepatří do reálného řídicího cyklu, může být container správná cesta pro její samostatný provoz.
[CLICK]
Závěr: technický specialista rozhoduje o konkrétní platformě, bezpečnosti, síti a provozním modelu; obchodník pak rozpozná, kdy se to vůbec nabízí.
-->
