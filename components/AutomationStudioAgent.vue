<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

const steps = [
  {
    id: 'guardrails',
    status: 'GUARDRAILS',
    category: 'guardrails',
    label: 'GUARDRAILS',
    command: 'CHECK GUARDRAILS',
    detail: 'instructions + skills',
    output: 'policy loaded',
  },
  {
    id: 'as-help',
    status: 'RESEARCHING',
    category: 'research',
    label: 'AS-HELP MCP',
    command: 'AS-HELP MCP',
    detail: 'manuals + product rules',
    output: 'motion rule retrieved',
  },
  {
    id: 'br-community',
    status: 'RESEARCHING',
    category: 'research',
    label: 'BR-COMMUNITY MCP',
    command: 'BR-COMMUNITY MCP',
    detail: 'field patterns + fixes',
    output: 'pattern matched',
  },
  {
    id: 'firmware-notes',
    status: 'RESEARCHING',
    category: 'research',
    label: 'GITHUB MCP',
    command: 'GITHUB MCP',
    detail: 'version constraints',
    output: 'release note matched',
  },
  {
    id: 'as-copilot',
    status: 'RESEARCHING',
    category: 'research',
    label: 'B&R MCP (OFFICIAL)',
    command: 'B&R MCP (OFFICIAL)',
    detail: 'cloud agent + project guidance',
    output: 'cloud guidance loaded',
  },
  {
    id: 'editor',
    status: 'IMPLEMENTING',
    category: 'project',
    label: 'CODE EDITOR',
    command: 'READ / WRITE CODE',
    detail: 'Main.st · Structured Text',
    output: 'source read · code written',
  },
  {
    id: 'simulate',
    status: 'TESTING',
    category: 'runtime',
    label: 'SIMULATE',
    command: 'as sim enable',
    detail: 'controlled runtime',
    output: 'ARSim running',
  },
  {
    id: 'build',
    status: 'TESTING',
    category: 'runtime',
    label: 'BUILD & TRANSFER',
    command: 'as build & transer',
    detail: 'target + diagnostics',
    output: '0 errors · 5 warnings',
  },
  {
    id: 'read-pv',
    status: 'TESTING',
    category: 'runtime',
    label: 'READ / WRITE PV',
    command: 'as var read / write',
    detail: 'PVI: bottleCount + state',
    output: 'bottleCount = 42',
  },
  {
    id: 'read-logbook',
    status: 'TESTING',
    category: 'runtime',
    label: 'READ LOGBOOK',
    command: 'as logbook read',
    detail: 'faults + cycle notes',
    output: 'logbook entries loaded',
  },
] as const

type StepId = (typeof steps)[number]['id']
type Connection = { id: StepId; x1: number; y1: number; x2: number; y2: number }
type Point = { x: number; y: number }
type Box = { left: number; top: number; right: number; bottom: number }

const researchTools = steps.filter(step => step.category === 'research')
const runtimeTools = steps.filter(step => step.category === 'runtime')
const connections: Connection[] = [
  { id: 'guardrails', x1: 97, y1: 218, x2: 100, y2: 205 },
  { id: 'as-help', x1: 97, y1: 218, x2: 233, y2: 52 },
  { id: 'br-community', x1: 97, y1: 218, x2: 411, y2: 52 },
  { id: 'firmware-notes', x1: 97, y1: 218, x2: 589, y2: 52 },
  { id: 'as-copilot', x1: 97, y1: 218, x2: 767, y2: 52 },
  { id: 'editor', x1: 97, y1: 218, x2: 306, y2: 201 },
  { id: 'simulate', x1: 97, y1: 218, x2: 128, y2: 379 },
  { id: 'build', x1: 97, y1: 218, x2: 376, y2: 379 },
  { id: 'read-pv', x1: 97, y1: 218, x2: 624, y2: 379 },
  { id: 'read-logbook', x1: 97, y1: 218, x2: 873, y2: 379 },
]
const connectorPoints = ref<Connection[]>(connections)
const codeLines = [
  'PROGRAM _CYCLIC',
  '  CASE em.ModeID OF',
  '    MODE_PRODUCTION: producing;',
  '    ELSE em.Command.StateComplete := TRUE;',
  '  END_CASE',
  '  IF hmi.startMachine THEN',
  '    hmi.startMachine := FALSE;',
  '    em.Command.Reset := TRUE;',
  '  END_IF',
  '  alarm;',
  '  modules;',
  '  simulation;',
  'END_PROGRAM',
]

const { $clicks } = useSlideContext()
const autoIndex = ref(0)
const isPlaying = ref(true)
const steppedIndex = ref<number | null>(null)
const stageElement = ref<HTMLElement | null>(null)
const agentElement = ref<HTMLElement | null>(null)
let playbackTimer: ReturnType<typeof setInterval> | undefined
let connectionObserver: ResizeObserver | undefined

const activeIndex = computed(() => {
  if (steppedIndex.value !== null)
    return steppedIndex.value
  if ($clicks.value > 0)
    return Math.min($clicks.value - 1, steps.length - 1)
  return autoIndex.value
})

const activeStep = computed(() => steps[activeIndex.value])
const statusClass = computed(() => activeStep.value.status.toLowerCase())

const isActive = (id: StepId) => activeStep.value.id === id
const isComplete = (id: StepId) => steps.findIndex(step => step.id === id) < activeIndex.value

const codeState = computed(() => {
  if (isActive('editor'))
    return 'READ / WRITE'
  return isComplete('editor') ? 'UPDATED' : 'SOURCE'
})

const togglePlayback = () => {
  if (!isPlaying.value) {
    autoIndex.value = activeIndex.value
    steppedIndex.value = null
  }
  isPlaying.value = !isPlaying.value
}

const stepAnimation = () => {
  const nextIndex = (activeIndex.value + 1) % steps.length
  autoIndex.value = nextIndex
  steppedIndex.value = nextIndex
  isPlaying.value = false
}

const updateConnections = () => {
  const stage = stageElement.value
  const agent = agentElement.value
  if (!stage || !agent)
    return

  const stageRect = stage.getBoundingClientRect()
  const toViewBoxPoint = (x: number, y: number): Point => ({
    x: ((x - stageRect.left) / stageRect.width) * 1000,
    y: ((y - stageRect.top) / stageRect.height) * 420,
  })
  const toViewBoxBox = (element: HTMLElement): Box => {
    const rect = element.getBoundingClientRect()
    const topLeft = toViewBoxPoint(rect.left, rect.top)
    const bottomRight = toViewBoxPoint(rect.right, rect.bottom)
    return { left: topLeft.x, top: topLeft.y, right: bottomRight.x, bottom: bottomRight.y }
  }
  const centerOf = (box: Box): Point => ({
    x: (box.left + box.right) / 2,
    y: (box.top + box.bottom) / 2,
  })
  const edgePoint = (box: Box, toward: Point): Point => {
    const center = centerOf(box)
    const deltaX = toward.x - center.x
    const deltaY = toward.y - center.y
    const halfWidth = (box.right - box.left) / 2
    const halfHeight = (box.bottom - box.top) / 2
    if (deltaX === 0 && deltaY === 0)
      return center

    const scale = 1 / Math.max(
      Math.abs(deltaX) / halfWidth,
      Math.abs(deltaY) / halfHeight,
    )
    return { x: center.x + deltaX * scale, y: center.y + deltaY * scale }
  }
  const circleEdgePoint = (box: Box, toward: Point): Point => {
    const center = centerOf(box)
    const deltaX = toward.x - center.x
    const deltaY = toward.y - center.y
    const distance = Math.hypot(deltaX, deltaY)
    if (distance === 0)
      return center

    const halfWidth = (box.right - box.left) / 2
    const halfHeight = (box.bottom - box.top) / 2
    const scale = 1 / Math.sqrt(
      (deltaX / halfWidth) ** 2 + (deltaY / halfHeight) ** 2,
    )
    return {
      x: center.x + deltaX * scale,
      y: center.y + deltaY * scale,
    }
  }
  const cornerPoint = (box: Box, toward: Point, edge: 'top' | 'bottom'): Point => ({
    x: Math.abs(box.left - toward.x) <= Math.abs(box.right - toward.x) ? box.left : box.right,
    y: edge === 'top' ? box.top : box.bottom,
  })
  const agentBox = toViewBoxBox(agent)
  const agentCenter = centerOf(agentBox)
  connectorPoints.value = connections.map((connection) => {
    const target = stage.querySelector<HTMLElement>(`[data-connection-target="${connection.id}"]`)
    if (!target)
      return connection

    const targetBox = toViewBoxBox(target)
    const targetCenter = centerOf(targetBox)
    const source = circleEdgePoint(agentBox, targetCenter)
    const category = steps.find(step => step.id === connection.id)?.category
    const endpoint = category === 'research'
      ? cornerPoint(targetBox, agentCenter, 'bottom')
      : category === 'runtime'
        ? cornerPoint(targetBox, agentCenter, 'top')
        : edgePoint(targetBox, agentCenter)
    return { id: connection.id, x1: source.x, y1: source.y, x2: endpoint.x, y2: endpoint.y }
  })
}

const startPlayback = () => {
  if (playbackTimer)
    clearInterval(playbackTimer)

  playbackTimer = setInterval(() => {
    if ($clicks.value === 0 && isPlaying.value)
      autoIndex.value = (autoIndex.value + 1) % steps.length
  }, 1700)
}

onMounted(() => {
  startPlayback()
  updateConnections()
  if (stageElement.value) {
    connectionObserver = new ResizeObserver(updateConnections)
    connectionObserver.observe(stageElement.value)
    stageElement.value.querySelectorAll<HTMLElement>('[data-connection-target]').forEach(target => connectionObserver?.observe(target))
  }
})

watch($clicks, (clicks) => {
  steppedIndex.value = null
  if (clicks > 0)
    autoIndex.value = Math.min(clicks - 1, steps.length - 1)
})

onBeforeUnmount(() => {
  if (playbackTimer)
    clearInterval(playbackTimer)
  connectionObserver?.disconnect()
})
</script>

<template>
  <section class="as-agent-visual" :class="`is-${statusClass}`" aria-label="Agent working inside an Automation Studio project">
    <header class="as-agent-header">
      <div>
        <span>LIVE TOOL TRACE / AUTOMATION STUDIO</span>
        <b>Research → code → feedback</b>
      </div>
      <div class="as-agent-status" :class="`is-${statusClass}`"><i></i><strong>{{ activeStep.status }}</strong><span>{{ activeStep.command }}</span><small>{{ activeStep.output }}</small><button class="as-playback-toggle" type="button" :aria-label="isPlaying ? 'Pause animation' : 'Play animation'" :aria-pressed="isPlaying" :title="isPlaying ? 'Pause animation' : 'Play animation'" @click.stop="togglePlayback"><mdi-pause v-if="isPlaying" /><mdi-play v-else /></button><button class="as-playback-toggle as-step-toggle" type="button" aria-label="Step animation" title="Step animation" @click.stop="stepAnimation"><mdi-debug-step-over /></button></div>
    </header>

    <div ref="stageElement" class="as-agent-stage">
      <svg class="as-connection-map" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
        <line
          v-for="connection in connectorPoints"
          :key="connection.id"
          class="as-connection"
          :class="[`is-${statusClass}`, { 'is-active': isActive(connection.id) }]"
          :x1="connection.x1"
          :y1="connection.y1"
          :x2="connection.x2"
          :y2="connection.y2"
        />
      </svg>

      <div class="as-research-band">
        <div class="as-research-tools">
          <div
            v-for="tool in researchTools"
            :key="tool.id"
            class="as-research-tool"
            :data-connection-target="tool.id"
            :class="{ 'is-active': isActive(tool.id), 'is-complete': isComplete(tool.id), 'is-cloud': tool.id === 'as-copilot' }"
          >
            <div class="as-research-tool-head">
              <mdi-database-search-outline v-if="tool.id === 'as-help'" />
              <mdi-account-group-outline v-else-if="tool.id === 'br-community'" />
              <mdi-update v-else-if="tool.id === 'firmware-notes'" />
              <mdi-cloud-outline v-else />
              <span>{{ tool.id === 'as-copilot' ? 'CLOUD MCP' : 'RESEARCH TOOL' }}</span><i></i>
            </div>
            <b>{{ tool.command }}</b>
            <small>{{ tool.detail }}</small>
          </div>
        </div>
      </div>

      <div class="as-guardrails" aria-label="Agent guardrails">
        <div class="as-guardrail-card as-guardrail-instructions" :class="{ 'is-active': isActive('guardrails') }">
          <div class="as-guardrail-head"><mdi-text-box-outline /><span>INSTRUCTIONS</span><i></i></div>
          <b>project policy</b>
          <small>scope + constraints</small>
        </div>
        <div class="as-guardrail-card as-guardrail-skills" data-connection-target="guardrails" :class="{ 'is-active': isActive('guardrails') }">
          <div class="as-guardrail-head"><mdi-lightbulb-on-outline /><span>SKILLS</span><i></i></div>
          <b>automation patterns</b>
          <small>domain actions loaded</small>
        </div>
      </div>

      <div class="as-project-frame">
        <div class="as-project-bar">
          <div class="as-project-bar-head">
            <div><i></i><span>AUTOMATION STUDIO</span></div>
            <small>DevOpsDemo.apj · WORKTREE</small>
          </div>
        </div>
        <div class="as-project-body">
          <div class="as-project-tree">
            <span class="tree-root"><mdi-folder-outline /> DevOpsDemo</span>
            <span><mdi-chevron-right /> Logical</span>
            <span class="tree-child"><mdi-file-code-outline /> Main</span>
            <span class="tree-child"><mdi-file-code-outline /> Services</span>
            <span><mdi-chevron-right /> Physical</span>
            <span class="tree-child"><mdi-chip /> Config1</span>
            <span><mdi-chevron-right /> Libraries</span>
          </div>
          <div class="as-project-inspector">
            <div class="as-code-pane-title"><span>MAIN.ST · LOGICAL / MAIN</span><i></i><small>{{ codeState }} · IEC 61131-3</small></div>
            <div class="as-code-editor" data-connection-target="editor" :class="{ 'is-active': isActive('editor') }" aria-label="Main Structured Text editor">
              <div class="as-code-editor-head"><span>Main.st</span><small>Structured Text</small></div>
              <pre><code><span v-for="(line, index) in codeLines" :key="index" class="as-code-line"><em>{{ String(index + 1).padStart(2, '0') }}</em>{{ line }}</span></code></pre>
            </div>
            <div class="as-project-metadata">
              <span>TARGET <b>X20CP1686X</b></span>
              <span>AS VERSION <b>6.1</b></span>
              <span>RULES <b>14 loaded</b></span>
            </div>
          </div>
        </div>
        <div class="as-project-footer"><span>PROJECT FILES</span><i></i><b>Main.st · source view</b></div>
      </div>

      <div class="as-runtime-tools">
        <div
          v-for="tool in runtimeTools"
          :key="tool.id"
          class="as-runtime-tool"
            :data-connection-target="tool.id"
          :class="{ 'is-active': isActive(tool.id), 'is-complete': isComplete(tool.id) }"
        >
          <div class="as-runtime-tool-head">
            <mdi-hammer-wrench v-if="tool.id === 'build'" />
            <mdi-monitor-dashboard v-else-if="tool.id === 'simulate'" />
            <mdi-chart-timeline-variant-shimmer v-else-if="tool.id === 'read-pv'" />
            <mdi-notebook-outline v-else />
            <span>as</span><i></i>
          </div>
          <b>{{ tool.command }}</b>
          <small>{{ tool.detail }}</small>
        </div>
      </div>

      <div ref="agentElement" class="as-agent-core" :class="`is-${statusClass}`">
        <div class="as-agent-avatar"><mdi-account-hard-hat-outline /></div>
        <b>AGENT</b>
        <strong>{{ activeStep.status }}</strong>
      </div>
    </div>

  </section>
</template>

<style scoped>
.as-agent-visual {
  position: relative;
  height: 484px;
  margin-top: 18px;
  overflow: hidden;
  --as-frame-inset: 180px;
  --as-active-color: var(--br-orange);
  --as-active-rgb: 255, 122, 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #e9edef;
  background: #111416;
}

.as-agent-visual.is-researching {
  --as-active-color: #70b5d0;
  --as-active-rgb: 112, 181, 208;
}

.as-agent-visual.is-guardrails {
  --as-active-color: #d8b14d;
  --as-active-rgb: 216, 177, 77;
}

.as-agent-visual.is-reviewing {
  --as-active-color: #d8b14d;
  --as-active-rgb: 216, 177, 77;
}

.as-agent-visual.is-testing {
  --as-active-color: #56bb7a;
  --as-active-rgb: 86, 187, 122;
}

.as-agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 50px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.025);
}

.as-agent-header > div:first-child,
.as-agent-status {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.as-agent-header > div:first-child span,
.as-agent-header > div:first-child b,
.as-agent-status,
.as-project-bar,
.as-project-footer,
.as-tool,
.as-project-tree,
.as-project-inspector,
.as-agent-core small {
  font-family: 'IBM Plex Mono', monospace;
}

.as-agent-header > div:first-child span {
  color: var(--br-orange);
  font-size: 8px;
  font-weight: 600;
  white-space: nowrap;
}

.as-agent-header > div:first-child b {
  color: #9ea8ad;
  font-size: 9px;
  font-weight: 500;
}

.as-agent-status {
  flex: 0 0 auto;
  color: var(--br-orange);
  font-size: 8px;
  white-space: nowrap;
}

.as-playback-toggle {
  display: grid;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  margin-left: 2px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 2px;
  color: #dce3e5;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
}

.as-playback-toggle:hover,
.as-playback-toggle:focus-visible {
  border-color: var(--br-orange);
  color: var(--br-orange);
  background: rgba(255, 122, 0, 0.12);
}

.as-playback-toggle:focus-visible {
  outline: 1px solid var(--br-orange);
  outline-offset: 2px;
}

.as-playback-toggle svg {
  width: 10px;
  height: 10px;
}

.as-agent-status i,
.as-tool-head i,
.as-project-bar i,
.as-project-footer i,
.inspector-title i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--br-orange);
  box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.12);
}

.as-agent-status small {
  color: #9ea8ad;
  font-size: 7px;
}

.as-agent-stage {
  position: relative;
  height: 434px;
}

.as-connection-map {
  position: absolute;
  inset: 0;
  z-index: 7;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.as-connection {
  fill: none;
  opacity: 0;
  stroke: rgba(255, 255, 255, 0.11);
  stroke-linecap: round;
  stroke-width: 1;
  transition: stroke 240ms ease, stroke-width 240ms ease, opacity 240ms ease;
}

.as-connection.is-active {
  opacity: 1;
  stroke: var(--as-active-color);
  stroke-width: 2;
}

.as-connection.is-active.is-researching {
  stroke: var(--as-active-color);
}

.as-connection.is-active.is-reviewing {
  stroke: var(--as-active-color);
}

.as-connection.is-active.is-testing {
  stroke: var(--as-active-color);
}

.as-project-frame {
  position: absolute;
  top: 26px;
  right: 202px;
  bottom: 25px;
  left: 202px;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(25, 29, 31, 0.9);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.2);
}

.as-project-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 35px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #aeb7bb;
  font-size: 7px;
}

.as-project-bar > div {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e9edef;
  font-weight: 600;
}

.as-project-bar small {
  color: #7d878c;
  font-size: 7px;
}

.as-project-body {
  display: grid;
  grid-template-columns: 152px 1fr;
  height: calc(100% - 65px);
}

.as-project-tree {
  display: flex;
  min-width: 0;
  padding: 18px 12px;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  color: #8b969b;
  font-size: 7px;
}

.as-project-tree span {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.as-project-tree svg {
  width: 12px;
  height: 12px;
  color: #718087;
}

.as-project-tree .tree-root {
  margin-bottom: 4px;
  color: var(--br-orange);
  font-weight: 600;
}

.as-project-tree .tree-root svg,
.as-project-tree .tree-child svg {
  color: #aab4b8;
}

.as-project-tree .tree-child {
  padding-left: 17px;
  color: #6f7b80;
}

.as-project-inspector {
  position: relative;
  display: grid;
  align-content: center;
  padding: 18px 22px;
  color: #8b969b;
  font-size: 7px;
}

.inspector-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: var(--br-orange);
  font-size: 8px;
  font-weight: 600;
}

.context-file {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 7px;
  margin-bottom: 13px;
  padding: 8px;
  border: 1px solid rgba(255, 122, 0, 0.32);
  background: rgba(255, 122, 0, 0.08);
}

.context-file svg {
  width: 16px;
  height: 16px;
  color: var(--br-orange);
}

.context-file b {
  color: #d6dde0;
  font-size: 8px;
  font-weight: 600;
}

.context-file small {
  color: var(--br-orange);
  font-size: 6px;
}

.context-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px 18px;
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.context-grid span {
  color: #68757a;
  font-size: 7px;
}

.context-grid b {
  color: #c3cdd1;
  font-size: 7px;
  font-weight: 500;
  text-align: right;
}

.as-project-footer {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 29px;
  padding: 0 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #68757a;
  font-size: 6px;
  text-transform: uppercase;
}

.as-project-footer i {
  width: 4px;
  height: 4px;
  background: #68757a;
  box-shadow: none;
}

.as-project-footer b {
  color: #9da8ad;
  font-weight: 500;
}

.as-tool {
  position: absolute;
  z-index: 4;
  display: grid;
  width: 177px;
  height: 63px;
  align-content: center;
  gap: 5px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  color: #c0c9cd;
  background: rgba(24, 28, 30, 0.96);
  transition: border-color 240ms ease, background 240ms ease, box-shadow 240ms ease, transform 240ms ease;
}

.as-tool.is-active {
  border-color: var(--br-orange);
  background: rgba(255, 122, 0, 0.13);
  box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.14), 0 0 24px rgba(255, 122, 0, 0.12);
  transform: translateY(-2px);
}

.as-tool.is-complete {
  border-color: rgba(86, 187, 122, 0.45);
}

.as-tool.is-complete .as-tool-head i {
  background: #56bb7a;
  box-shadow: 0 0 0 4px rgba(86, 187, 122, 0.12);
}

.as-tool-head {
  display: grid;
  grid-template-columns: 16px 1fr 6px;
  align-items: center;
  gap: 6px;
  color: #8f9a9f;
  font-size: 7px;
  font-weight: 600;
}

.as-tool-head svg {
  width: 15px;
  height: 15px;
  color: var(--br-orange);
}

.as-tool-head i {
  width: 5px;
  height: 5px;
  box-shadow: none;
  background: #657177;
}

.as-tool > b {
  color: #e4eaec;
  font-size: 9px;
  font-weight: 600;
}

.as-tool > small {
  color: #7f8b90;
  font-size: 7px;
}

.as-tool-read { top: 14px; left: 10px; }
.as-tool-domain { top: 14px; right: 10px; }
.as-tool-write { bottom: 14px; left: 10px; }
.as-tool-build { right: 10px; bottom: 14px; }
.as-tool-simulate { top: 170px; left: 10px; }
.as-tool-verify { top: 170px; right: 10px; }

.as-agent-core {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 6;
  display: grid;
  width: 132px;
  height: 132px;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 1px solid rgba(255, 122, 0, 0.7);
  border-radius: 50%;
  background: #171b1d;
  box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.06), 0 0 20px rgba(255, 122, 0, 0.1);
  transform: translate(-50%, -50%);
}

.as-agent-avatar {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: var(--br-orange);
}

.as-agent-avatar svg {
  width: 30px;
  height: 30px;
}

.as-agent-core > b {
  color: #f4f6f6;
  font: 700 13px/1 'IBM Plex Mono', monospace;
}

.as-agent-core small {
  color: #9aa5aa;
  font-size: 6px;
  text-transform: uppercase;
}

@media (max-width: 800px) {
  .as-agent-header > div:first-child b,
  .as-agent-status small,
  .as-project-footer b {
    display: none;
  }
}

.as-agent-status strong {
  color: #f2f5f5;
  font-size: 8px;
  font-weight: 700;
}

.as-agent-status.is-researching,
.as-agent-core.is-researching .as-agent-avatar,
.as-agent-core.is-researching > strong {
  color: #70b5d0;
}

.as-agent-status.is-implementing,
.as-agent-core.is-implementing .as-agent-avatar,
.as-agent-core.is-implementing > strong {
  color: var(--br-orange);
}

.as-agent-status.is-guardrails,
.as-agent-core.is-guardrails .as-agent-avatar,
.as-agent-core.is-guardrails > strong {
  color: #d8b14d;
}

.as-agent-status.is-reviewing,
.as-agent-core.is-reviewing .as-agent-avatar,
.as-agent-core.is-reviewing > strong {
  color: #d8b14d;
}

.as-agent-status.is-testing,
.as-agent-core.is-testing .as-agent-avatar,
.as-agent-core.is-testing > strong {
  color: #56bb7a;
}

.as-research-band {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 4;
  height: 79px;
}

.as-research-tools {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 8px var(--as-frame-inset) 0;
}

.as-research-tool,
.as-runtime-tool {
  display: grid;
  align-content: center;
  min-width: 0;
  height: 55px;
  padding: 0 12px;
  border: 1px solid rgba(112, 181, 208, 0.3);
  color: #c0c9cd;
  background: rgba(20, 25, 27, 0.96);
  font-family: 'IBM Plex Mono', monospace;
  transition: border-color 240ms ease, background 240ms ease, box-shadow 240ms ease, transform 240ms ease;
}

.as-research-tool.is-active {
  border-color: var(--as-active-color);
  background: rgba(112, 181, 208, 0.14);
  box-shadow: 0 0 0 1px rgba(112, 181, 208, 0.14);
}

.as-research-tool.is-complete {
  border-color: rgba(86, 187, 122, 0.45);
}

.as-research-tool-head,
.as-runtime-tool-head {
  display: grid;
  grid-template-columns: 15px 1fr 5px;
  align-items: center;
  gap: 6px;
  color: #8f9a9f;
  font-size: 6px;
  font-weight: 600;
}

.as-research-tool-head svg,
.as-runtime-tool-head svg {
  width: 14px;
  height: 14px;
  color: #70b5d0;
}

.as-research-tool-head i,
.as-runtime-tool-head i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #657177;
}

.as-research-tool.is-complete .as-research-tool-head i,
.as-runtime-tool.is-complete .as-runtime-tool-head i {
  background: #56bb7a;
  box-shadow: 0 0 0 4px rgba(86, 187, 122, 0.12);
}

.as-research-tool > b,
.as-runtime-tool > b {
  overflow: hidden;
  color: #e4eaec;
  font-size: 8px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.as-research-tool > small,
.as-runtime-tool > small {
  overflow: hidden;
  color: #7f8b90;
  font-size: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.as-project-frame {
  top: 74px;
  right: var(--as-frame-inset);
  bottom: 82px;
  left: var(--as-frame-inset);
}

.as-project-inspector {
  overflow: hidden;
  padding: 4px 16px;
}

.as-project-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 35px;
  padding: 0 12px;
}

.as-project-bar-head {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.as-project-body {
  height: calc(100% - 65px);
}

.as-project-inspector {
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  gap: 4px;
}

.as-code-pane-title {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--br-orange);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.as-code-pane-title i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--br-orange);
  box-shadow: none;
}

.as-code-pane-title small {
  margin-left: auto;
  overflow: hidden;
  color: #718087;
  font-size: 5px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-title {
  gap: 7px;
  margin-bottom: 8px;
  font-size: 7px;
}

.inspector-title small {
  margin-left: auto;
  color: var(--br-orange);
  font-size: 6px;
}

.as-project-io {
  display: grid;
  gap: 4px;
}

.as-editor-layout {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
}

.as-editor-layout .as-project-io-row {
  grid-template-columns: 53px minmax(0, 1fr);
  grid-template-rows: 1fr 1fr;
  min-height: 19px;
  padding: 0 6px;
}

.as-editor-layout .as-project-io-row span {
  grid-row: 1 / span 2;
  align-self: center;
}

.as-editor-layout .as-project-io-row b {
  grid-column: 2;
  grid-row: 1;
  align-self: end;
}

.as-editor-layout .as-project-io-row small {
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  text-align: left;
}

.as-code-editor {
  min-width: 0;
  height: 145px;
  overflow: hidden;
  border: 1px solid rgba(112, 181, 208, 0.28);
  background: rgba(11, 15, 17, 0.85);
  color: #c7d0d3;
  font-family: 'IBM Plex Mono', monospace;
}

.as-code-editor.is-active {
  border-color: var(--as-active-color);
  background: rgba(255, 122, 0, 0.07);
}

.as-code-editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 16px;
  padding: 0 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #dce3e5;
  font-size: 6px;
}

.as-code-editor-head small {
  overflow: hidden;
  color: #718087;
  font-size: 5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.as-code-editor pre {
  margin: 0;
  padding: 5px 7px;
  overflow: hidden;
  font: 500 6px/1.25 'IBM Plex Mono', monospace;
  white-space: normal;
}

.as-code-editor code {
  display: block;
}

.as-code-line {
  display: block;
  min-width: max-content;
  white-space: pre;
}

.as-code-line em {
  display: inline-block;
  width: 17px;
  color: #536066;
  font-style: normal;
  user-select: none;
}

.as-code-line:nth-child(1),
.as-code-line:nth-child(2),
.as-code-line:nth-child(5),
.as-code-line:nth-child(9) {
  color: #70b5d0;
}

.as-project-io-row {
  display: grid;
  grid-template-columns: 72px 122px minmax(0, 1fr);
  align-items: center;
  min-width: 0;
  min-height: 22px;
  padding: 0 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.025);
  font-family: 'IBM Plex Mono', monospace;
}

.as-project-io-row.is-active {
  border-color: var(--br-orange);
  background: rgba(255, 122, 0, 0.12);
}

.as-project-io-row.is-complete {
  border-color: rgba(86, 187, 122, 0.38);
}

.as-project-io-row span {
  color: var(--br-orange);
  font-size: 6px;
  font-weight: 700;
}

.as-project-io-row b {
  overflow: hidden;
  color: #d6dde0;
  font-size: 7px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.as-project-io-row small {
  overflow: hidden;
  color: #718087;
  font-size: 6px;
  text-overflow: ellipsis;
  text-align: right;
  white-space: nowrap;
}

.as-project-metadata {
  display: flex;
  gap: 13px;
  margin-top: 7px;
  color: #68757a;
  font: 500 6px/1 'IBM Plex Mono', monospace;
}

.as-project-metadata span {
  white-space: nowrap;
}

.as-project-metadata b {
  color: #bdc7ca;
  font-weight: 500;
}

.as-runtime-tools {
  position: absolute;
  right: var(--as-frame-inset);
  bottom: 12px;
  left: var(--as-frame-inset);
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.as-runtime-tool {
  border-color: rgba(255, 122, 0, 0.3);
}

.as-runtime-tool.is-active {
  border-color: var(--as-active-color);
  background: rgba(var(--as-active-rgb), 0.13);
  box-shadow: 0 0 0 1px rgba(var(--as-active-rgb), 0.14);
}

.as-runtime-tool-head svg {
  color: var(--br-orange);
}

.as-guardrails {
  position: absolute;
  top: 90px;
  left: 10px;
  z-index: 5;
  width: 158px;
  height: 150px;
  color: #d8b14d;
  font-family: 'IBM Plex Mono', monospace;
}

.as-guardrail-card {
  position: absolute;
  display: grid;
  width: 142px;
  height: 57px;
  align-content: center;
  gap: 5px;
  padding: 0 10px;
  border: 1px solid rgba(216, 177, 77, 0.62);
  background: rgba(31, 30, 23, 0.96);
  box-shadow: 0 0 0 1px rgba(216, 177, 77, 0.08);
}

.as-guardrail-instructions {
  top: 0;
  left: 0;
}

.as-guardrail-skills {
  top: 64px;
  left: 0;
}

.as-guardrail-card.is-active {
  border-color: var(--as-active-color);
  background: rgba(216, 177, 77, 0.14);
  box-shadow: 0 0 0 1px rgba(216, 177, 77, 0.16);
}

.as-guardrail-head {
  display: grid;
  grid-template-columns: 14px 1fr 5px;
  align-items: center;
  gap: 6px;
  color: #d8b14d;
  font-size: 6px;
  font-weight: 700;
}

.as-guardrail-head svg {
  width: 13px;
  height: 13px;
}

.as-guardrail-head i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d8b14d;
  box-shadow: 0 0 0 3px rgba(216, 177, 77, 0.12);
}

.as-guardrail-card b {
  color: #e5e1d1;
  font-size: 7px;
  font-weight: 600;
}

.as-guardrail-card small {
  color: #958d73;
  font-size: 6px;
}

.as-agent-core {
  top: 300px;
  left: 86px;
  z-index: 8;
  width: 126px;
  height: 126px;
  border-color: var(--as-active-color);
}

.as-agent-core.is-guardrails {
  box-shadow: 0 0 0 4px rgba(216, 177, 77, 0.07), 0 0 20px rgba(216, 177, 77, 0.1);
}

.as-agent-core.is-researching {
  box-shadow: 0 0 0 4px rgba(112, 181, 208, 0.07), 0 0 20px rgba(112, 181, 208, 0.1);
}

.as-agent-core.is-reviewing {
  box-shadow: 0 0 0 4px rgba(216, 177, 77, 0.07), 0 0 20px rgba(216, 177, 77, 0.1);
}

.as-agent-core.is-testing {
  box-shadow: 0 0 0 4px rgba(86, 187, 122, 0.07), 0 0 20px rgba(86, 187, 122, 0.1);
}

.as-agent-core > strong {
  position: relative;
  z-index: 1;
  font: 700 8px/1 'IBM Plex Mono', monospace;
}

.as-agent-core > small {
  position: relative;
  z-index: 1;
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .as-research-tools,
  .as-runtime-tools {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .as-research-tools {
    gap: 5px;
    margin-right: var(--as-frame-inset);
    margin-left: var(--as-frame-inset);
  }

  .as-research-tool,
  .as-runtime-tool {
    padding-right: 6px;
    padding-left: 6px;
  }

  .as-project-frame {
    right: var(--as-frame-inset);
    left: var(--as-frame-inset);
  }

  .as-agent-core {
    top: 300px;
    left: 58px;
    width: 102px;
    height: 102px;
  }

  .as-runtime-tools {
    gap: 5px;
  }

  .as-agent-visual {
    --as-frame-inset: 120px;
  }

  .as-guardrails {
    width: 108px;
  }

  .as-guardrail-card {
    width: 98px;
    padding-right: 6px;
    padding-left: 6px;
  }

}
</style>
