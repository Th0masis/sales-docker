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
Začnu jednou větou: **PLC řídí stroj, containery provozují služby okolo PLC.** *Krátká pauza.* Neřešíme tedy souboj technologií, ale správné rozdělení odpovědnosti.
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
Tady je základní rozdělení: **PLC drží řídicí cyklus**, zatímco data, databáze, integrace a diagnostika mají vlastní tempo a vlastní provozní potřeby.
[CLICK]
Na dalším stroji nebo v další lokalitě se pak často opakuje stejný problém: přibývají verze, aktualizace a ruční instalace. *Právě tady vzniká provozní napětí.*
[CLICK]
Toto je otázka pro obchodní rozhovor: **patří služba ještě do řídicí aplikace, nebo už ji chceme provozovat samostatně vedle PLC?**
[CLICK]
Když služba není součástí reálného řídicího cyklu, otevírá se prostor pro samostatné nasazení a údržbu. **Container není náhrada PLC.**
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
Nejdřív vzniká *build*: aplikace, její závislosti a konfigurace se připraví jako jeden opakovatelný celek. Záložky jen ukazují typické soubory, které se do něj promítají.
[CLICK]
Výsledkem je **image** - verzovaný balíček služby. Konkrétní *tag*, například `service:1.4`, říká, kterou verzi chceme provozovat; registry ji umí předat na cílový hostitel.
[CLICK]
Z image se přes *pull* a *run* stane **běžící container**. To je konkrétní instance služby, ne samotný balíček.
[CLICK]
Zapamatujme si rozdíl: **image je balíček, container je běžící instance.** Přenositelnost znamená stejný běh v *kompatibilním prostředí*, ne na libovolném OS nebo CPU. Konkrétní platformu vždy posoudí technický specialista.
-->

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
**Image** je verzovaný balíček. Pro provoz potřebujeme vědět, kterou přesnou verzi služby chceme nasadit.
[CLICK]
**Container** je běžící instance image. *Restart* nebo nahrazení instance nemění původní image.
[CLICK]
**Runtime** na hostiteli container vytvoří, spustí a spravuje. Proto technické posouzení zahrnuje platformu, síť i odpovědnost za provoz.
[CLICK]
**Volume** drží persistentní data. Databáze ani důležitá konfigurace nesmí záviset jen na dočasném filesystemu containeru.
[CLICK]
*Zkratka pro rozhodování:* image se vytváří a distribuuje, container se spouští a nahrazuje, volume se zálohuje a obnovuje. **Každá z těchto odpovědností má mít vlastníka.**
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
Při standardní instalaci se aplikace a její závislosti skládají na každém hostiteli znovu. *To je místo, kde vzniká drift prostředí.*
[CLICK]
U containeru je služba zabalená jako **jeden verzovaný artefakt** se svými závislostmi.
[CLICK]
Obrázek ilustruje provozní změnu: méně ručního skládání, více opakovatelného nasazení. Neznamená to automaticky stejnou platformu nebo nulovou konfiguraci.
[CLICK]
Hodnota je **méně ručních zásahů a méně rozdílů mezi prostředími** - vždy jen v kompatibilním hostitelském prostředí.
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
Podívejme se na vrstvy. U *virtuálního stroje* má každá instance vlastní *Guest OS* nad hypervizorem. To dává vyšší izolaci, ale také vyšší režii.
[CLICK]
U *containeru* jsou oddělené aplikace a knihovny, ale sdílejí *container engine* a hostitelský OS. **Izolujeme službu, ne celé prostředí.**
[CLICK]
*Pauza.* Nejde o otázku „co je lepší“. Jde o to, **kterou vrstvu potřebujeme izolovat** a zda cílová platforma splňuje požadavky konkrétního provozu.
-->

---
layout: default
class: dark-slide ot-slide
---

<div class="kicker">ROZHODNUTÍ · VM NEBO CONTAINER</div>

# Nejde o to, co je lepší.<br><span class="accent">Rozhoduje potřebná izolace.</span>
<div class="ot-vm-decision"><section v-click="1"><span>VIRTUÁLNÍ STROJ</span><strong>Odděluje celé prostředí</strong><ul><li>vlastní Guest OS</li><li>vyšší izolace prostředí</li><li>vyšší režie a delší start</li><li>vhodný, když potřebujeme jiný OS nebo úplnější oddělení</li></ul></section><section v-click="2"><span>CONTAINER</span><strong>Odděluje službu</strong><ul><li>sdílí kernel hostitele</li><li>nižší režie a rychlejší start</li><li>samostatný lifecycle služby</li><li>vhodný pro přenosné služby v kompatibilním prostředí</li></ul></section></div>
<div class="ot-specialist" v-click="3"><mdi-account-hard-hat-outline /><strong>Provozní požadavky OT platí pro obě možnosti.</strong><span>VM ani container samy o sobě negarantují deterministický real-time, safety, dostupnost nebo failover.</span></div><div class="slide-id">07</div>

<!--
[CLICK]
Když potřebujeme oddělit celé prostředí nebo použít jiný *Guest OS*, dává smysl virtuální stroj. Cena za to je vyšší provozní režie.
[CLICK]
Když chceme samostatně provozovat konkrétní službu se závislostmi na kompatibilním hostiteli, je vhodnější container. **Jeho hlavní hodnotou je vlastní životní cyklus služby.**
[CLICK]
*Pauza.* Provozní požadavky OT platí pro obě možnosti: *deterministický real-time*, safety, dostupnost, failover, síť a odpovědnost za provoz. **Technický specialista ověří konkrétní stroj a platformu.**
-->

---
layout: default
class: ot-slide
---

<div class="kicker">COMMAND DEMONSTRATOR · IMAGE → CONTAINER</div><div class="status-badge demonstrator">OBECNÝ PŘÍKLAD</div>

# Jak se z image stane<br><span class="accent">běžící container</span>
<div class="ot-disclaimer" v-click="1">Nejde o B&R referenci. Jedná se o princip, jak image vznikne a jak z ní běží container.</div>
<div class="ot-command-demo"><aside class="ot-command-steps"><div v-click="1"><b>01</b><strong>BUILD</strong><small>sestavím image</small></div><div v-click="2"><b>02</b><strong>TEST</strong><small>ověřím chování image</small></div><div v-click="3"><b>03</b><strong>PACKAGE</strong><small>tag nebo digest do registry</small></div><div v-click="4"><b>04</b><strong>PULL</strong><small>stáhnu image na hostitele</small></div><div v-click="5"><b>05</b><strong>RUN</strong><small>spustím container</small></div><div v-click="6"><b>06</b><strong>OBSERVE</strong><small>stav, logy a health check</small></div><div v-click="7"><b>07</b><strong>UPDATE</strong><small>nahradím ověřenou verzí</small></div></aside><div class="ot-command-terminal"><header><i></i><i></i><i></i><span>COMMAND PROMPT ·</span><a href="https://hub.docker.com/_/nginx" target="_blank" title="Otevřít Docker Hub image nginx">DOCKER HUB <mdi-open-in-new /></a></header><div class="ot-command-log"><div class="ot-command-row" v-click="1"><small>$</small><div class="ot-command-cell"><code>docker build -t demo-web:1.4 .</code><strong>IMAGE · demo-web:1.4 created</strong></div></div><div class="ot-command-row" v-click="2"><small>$</small><div class="ot-command-cell"><code>docker run --rm demo-web:1.4 /health</code><strong>TEST · expected response received</strong></div></div><div class="ot-command-row" v-click="3"><small>$</small><div class="ot-command-cell"><code>docker push registry.example/demo-web:1.4</code><strong>PACKAGE · tagged artifact published to registry</strong></div></div><div class="ot-command-row is-pulling" v-click="4"><small>$</small><div class="ot-command-cell"><code>docker pull registry.example/demo-web:1.4</code><div class="ot-download-progress" aria-label="Downloading image"><span class="ot-download-hash">##########</span><span class="ot-download-value">72%</span></div><strong>PULL · image downloaded to target host</strong></div></div><div class="ot-command-row" v-click="5"><small>$</small><div class="ot-command-cell"><code>docker run -d -p 8080:80 --name demo-web demo-web:1.4</code><strong>RUN · port 8080 mapped to service</strong></div></div><div class="ot-command-row" v-click="6"><small>$</small><div class="ot-command-cell"><code>docker logs demo-web</code><strong>OBSERVE · service healthy and ready</strong></div></div><div class="ot-command-row" v-click="7"><small>$</small><div class="ot-command-cell"><code>docker stop demo-web; docker run ...:1.5</code><strong>UPDATE · verified version replaces running instance</strong></div></div></div><footer>COMMAND DEMONSTRATOR · ACTION + OBSERVATION</footer></div></div><div class="slide-id">08</div>

<!--
[CLICK]
Začínáme *buildem*: ze zdrojů a konfigurace vznikne **verzovaná image**. Vlevo je krok, vpravo je jeho jednoduchá CLI ukázka.
[CLICK]
Pak přichází *test*. Ještě před nasazením ověříme očekávané chování image. **Kdo test a přijetí verze vlastní?** To je podstatná obchodní i provozní otázka.
[CLICK]
Ověřená image dostane konkrétní *tag* nebo *digest* a uloží se do registry. Vzniká **dohledatelný artefakt**, ne nepojmenovaný soubor na serveru.
[CLICK]
Na cílovém hostiteli provedeme *pull*. Registry image distribuuje; *Docker daemon / Engine* pak spravuje běh containeru.
[CLICK]
Krok *run* vytvoří běžící container. Přepínač `-p 8080:80` ukazuje, že publikovaný port je vědomé síťové rozhodnutí, ne automatická vlastnost služby.
[CLICK]
Po spuštění službu sledujeme přes *logs* a *health check*. **„Běží“ ještě neznamená „je připravená“.**
[CLICK]
Aktualizace znamená ověřenou novou image, nahrazení běžící instance a nové ověření. *Image* se buildí a distribuuje; **container se spouští, sleduje a nahrazuje.**
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
*Docker Compose* popíše více služeb v jednom YAML souboru. **Není to další typ containeru**; je to deklarace menšího stacku na jednom hostiteli.
[CLICK]
Služba `app` komunikuje s databází přes název `db`. Síť mezi službami je součást definice; port publikujeme jen tam, kde jej opravdu potřebuje hostitel nebo externí klient.
[CLICK]
Databázová data patří do *named volume*, ne jen do filesystemu běžícího containeru. **Záloha a obnova dat mají konkrétního vlastníka.**
[CLICK]
Tyto příkazy pokrývají běžný provoz stacku: spustit, ověřit stav, číst logy a řízeně ukončit. *Pozor:* `docker compose down -v` může odstranit named volumes, proto ho zde záměrně neukazujeme.
[CLICK]
`depends_on` určuje pořadí startu, **ne připravenost databáze**. Compose je vhodný pro lokální nebo edge stack na jednom hostiteli; multi-site, failover a centrální správa potřebují další provozní vrstvu.
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
Vlevo je známá realita: ruční instalace a drobně rozdílné stroje. Vpravo je **jeden balíček služby**, který lze opakovaně nasadit.
[CLICK]
Tři přínosy jsou praktické: rychlejší rozjezd doplňkové služby, aktualizace mimo PLC a stejné řešení pro další stroj nebo lokalitu.
[CLICK]
*Pauza.* To není univerzální slib úspory. **Přínos vždy závisí na rozsahu a implementaci.**
[CLICK]
Než půjdeme dál, položme čtyři otázky: kolikrát se služba nasazuje, jak se aktualizuje, zda je kompatibilní hostitel, síť a storage a **kdo odpovídá za provoz**. To je vstup pro technického specialistu.
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
Tohle je **interní příklad**, ne univerzální B&R reference. Pálicí plán měl dříve podobu velkých CSV struktur, které se při startu parsovaly v PLC.
[CLICK]
Přechod na *MariaDB* a samostatnou BR service oddělil data od řídicí části. Cíl je **přehlednější datový model a samostatná údržba**, ne tvrzení, že container sám vyřeší celý projekt.
[CLICK]
Pro provoz je důležité *build once, deploy opakovaně*, konkrétní tag image a persistentní data. V tomto interním příkladu běží BR service na *Podmanu*; `latest` není deployment plán.
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
Tento slide je **interaktivní menu**, ne lineární odhalování. Vyberte kartu podle situace zákazníka a otevřete detail; uzavírací tlačítko se vrátí do přehledu.

U každého scénáře držte stejnou strukturu: co služba znamená, jaká je obchodní hodnota a na co si dát pozor. *Pauza.* Jsou to potenciální oblasti, nikoli hotová B&R řešení.

Při větším počtu služeb nebo lokalit přibývá orchestrace, monitoring, síť, failover a odpovědnost za provoz. **Container sám tuto provozní vrstvu nenahradí.**
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
Container není samostatný počítač. Potřebuje *runtime*, hostitelský OS a kernel; zároveň závisí na CPU architektuře, paměti, storage, síti a případném speciálním hardwaru.
[CLICK]
Tady je hranice použití: **ano** pro data a integraci; **záleží** na platformě, síti a odpovědnosti; **ne** pro real-time řízení, safety, primární I/O a kritickou automatizaci. Limity CPU a paměti nejsou garancí těchto vlastností.
[CLICK]
*Pauza.* Rozhodnutí patří technickému specialistovi: ověří runtime, hardware, síť, bezpečnost, aktualizace a **vlastníka provozu**.
[CLICK]
Ještě před deploymentem je nutné ověřit licence runtime, image a závislostí. Právní, security i provozní odpovědnost **nejsou vlastnost containeru**.
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
Na závěr si vezměme čtyři hodnoty: **oddělení služby, samostatný update, opakovatelnost a méně driftu prostředí.**
[CLICK]
*Pauza.* Hlavní věta decku: **PLC řídí stroj. Container provozuje služby okolo PLC.**
[CLICK]
Když služba nepatří do reálného řídicího cyklu, může být container správná cesta. Další krok je **technické posouzení platformy, bezpečnosti, sítě a provozního modelu.**
-->
