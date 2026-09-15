<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const LOOP_DURATION_SECONDS = 9
const LOOP_DURATION_MS = LOOP_DURATION_SECONDS * 1000
const BOTTLE_COUNT = 5
const COUNTER_STEP_MS = LOOP_DURATION_MS / BOTTLE_COUNT
type InteractiveMode = 'execute' | 'aborted' | 'stopped'

const props = withDefaults(defineProps<{
  state?: 'running' | 'fault' | 'recovered'
  count?: number
  compact?: boolean
  interactive?: boolean
}>(), {
  state: 'running',
  count: 42,
  compact: false,
  interactive: false,
})

const interactiveMode = ref<InteractiveMode>('execute')
const displayCount = ref(props.interactive ? 0 : props.count)
const rejectedCount = ref(0)
// 'on' = on the belt, 'rejected' = removed by CLEAR, 'pending' = waiting for its slot to reach the infeed.
type BottleState = 'on' | 'rejected' | 'pending'
const bottleStates = ref<BottleState[]>(Array.from({ length: BOTTLE_COUNT }, () => 'on'))
const cappedAtStop = ref<boolean[]>(Array.from({ length: BOTTLE_COUNT }, () => false))
const conveyorRoot = ref<HTMLElement>()
let counterTimer: ReturnType<typeof setInterval> | undefined

const currentState = computed(() => props.interactive ? interactiveMode.value : props.state)
const stateClass = computed(() => `is-${currentState.value}`)
const machineIsRunning = computed(() => props.interactive ? interactiveMode.value === 'execute' : props.state === 'running')
const machineStatus = computed(() => {
  if (props.interactive) {
    return interactiveMode.value === 'aborted' ? 'ABORTED' : interactiveMode.value === 'stopped' ? 'STOPPED' : 'EXECUTE'
  }
  return props.state === 'fault' ? 'ABORTED' : props.state === 'recovered' ? 'COMPLETE' : 'RUNNING'
})
const fillerStatus = computed(() => {
  if (props.interactive) {
    return interactiveMode.value === 'aborted' ? 'HOLD' : interactiveMode.value === 'stopped' ? 'EMPTY' : 'FILL'
  }
  return props.state === 'fault' ? 'HOLD' : props.state === 'recovered' ? 'DONE' : 'FILL'
})
const capperStatus = computed(() => {
  if (props.interactive) {
    return interactiveMode.value === 'execute' ? 'CAP' : interactiveMode.value === 'aborted' ? 'HOLD' : 'EMPTY'
  }
  return props.state === 'fault' ? 'HOLD' : props.state === 'recovered' ? 'DONE' : 'CAP'
})
const faultStatus = computed(() => {
  if (props.interactive) return interactiveMode.value === 'aborted' ? 'E_STOP' : 'NONE'
  return props.state === 'fault' ? 'AXIS_04' : 'NONE'
})
const counterStatus = computed(() => {
  if (props.interactive) {
    return interactiveMode.value === 'aborted' ? 'HOLD' : interactiveMode.value === 'stopped' ? 'RETAINED' : 'COUNT'
  }
  return props.state === 'fault' ? 'HOLD' : props.state === 'recovered' ? 'EXACT' : 'COUNT'
})
const recoveryStatus = computed(() => {
  if (props.interactive) {
    return interactiveMode.value === 'aborted' ? 'CLEAR REQUIRED' : interactiveMode.value === 'stopped' ? 'START READY' : 'READY'
  }
  return props.state === 'fault' ? 'AWAIT CLEAR' : props.state === 'recovered' ? 'VERIFIED' : 'READY'
})
const canEstop = computed(() => props.interactive && interactiveMode.value === 'execute')
const canClear = computed(() => props.interactive && interactiveMode.value === 'aborted')
const canStart = computed(() => props.interactive && interactiveMode.value === 'stopped')

const bottleStyle = (bottleIndex: number): Record<string, string> => ({
  '--bottle-delay': `${-((bottleIndex - 1) * LOOP_DURATION_SECONDS / BOTTLE_COUNT)}s`,
})

const advanceCounter = () => {
  if (!machineIsRunning.value) return
  if (props.interactive) {
    // A finished batch of 100 starts over from zero.
    if (displayCount.value >= 100) {
      displayCount.value = 1
      rejectedCount.value = 0
      return
    }
    displayCount.value += 1
    return
  }
  displayCount.value = displayCount.value >= 100 ? 0 : displayCount.value + 1
}

const handleBottleIteration = (event: AnimationEvent) => {
  if (event.target !== event.currentTarget) return
  if (!props.interactive) return
  const index = Number((event.currentTarget as HTMLElement).dataset.bottleIndex)
  // A pending bottle re-enters exactly when its own slot comes back around to the infeed.
  if (bottleStates.value[index] === 'pending') {
    bottleStates.value[index] = 'on'
    return
  }
  if (bottleStates.value[index] === 'on') advanceCounter()
}

const stopCounter = () => {
  if (!counterTimer) return
  clearInterval(counterTimer)
  counterTimer = undefined
}

const startCounter = () => {
  stopCounter()
  if (!props.interactive && machineIsRunning.value) {
    counterTimer = setInterval(advanceCounter, COUNTER_STEP_MS)
  }
}

const emergencyStop = () => {
  if (!canEstop.value) return
  cappedAtStop.value = Array.from({ length: BOTTLE_COUNT }, (_, index) => {
    if (bottleStates.value[index] !== 'on') return false
    const cap = conveyorRoot.value?.querySelector<HTMLElement>(`[data-bottle-index="${index}"] .bottle-cap`)
    return cap !== undefined && Number.parseFloat(getComputedStyle(cap).opacity) >= 0.99
  })
  interactiveMode.value = 'aborted'
  stopCounter()
}

// Clearing rejects every bottle that is not capped yet; capped bottles stay on the belt.
const clearMachine = () => {
  if (!canClear.value) return
  for (let index = 0; index < BOTTLE_COUNT; index += 1) {
    if (bottleStates.value[index] !== 'on' || cappedAtStop.value[index]) continue
    bottleStates.value[index] = 'rejected'
    rejectedCount.value += 1
  }
  interactiveMode.value = 'stopped'
  stopCounter()
}

// Rejected bottles keep their original cycle slot, so they can never re-enter on top of another bottle.
const startMachine = () => {
  if (!canStart.value) return
  for (let index = 0; index < BOTTLE_COUNT; index += 1) {
    if (bottleStates.value[index] === 'rejected') bottleStates.value[index] = 'pending'
  }
  interactiveMode.value = 'execute'
  startCounter()
}

onMounted(() => {
  if (props.interactive) displayCount.value = 0
  startCounter()
})
onUnmounted(stopCounter)

watch(() => props.count, (value) => {
  if (!props.interactive) displayCount.value = value
})

watch(() => props.state, (value) => {
  if (props.interactive) return
  displayCount.value = props.count
  if (value === 'running') startCounter()
  else stopCounter()
})

watch(() => props.interactive, (value) => {
  interactiveMode.value = 'execute'
  displayCount.value = value ? 0 : props.count
  rejectedCount.value = 0
  bottleStates.value = bottleStates.value.map(() => 'on')
  cappedAtStop.value = cappedAtStop.value.map(() => false)
  startCounter()
})
</script>

<template>
  <div ref="conveyorRoot" class="bottle-conveyor" :class="[stateClass, { compact, interactive }]">
    <div class="conveyor-header">
      <div class="machine-label">
        <span>LINE / 04</span>
        <b>CONVEYOR AXIS</b>
      </div>
      <div class="machine-state" aria-live="polite">
        <i></i>
        {{ machineStatus }}
      </div>
    </div>

    <div class="conveyor-stage">
      <div class="axis-drive">
        <div class="drive-core"><span>M</span></div>
        <small>ACOPOS</small>
      </div>

      <div class="belt-wrap">
        <div class="station-track">
          <div class="station filler-station">
            <span>FILLER</span>
            <b>{{ fillerStatus }}</b>
            <i></i>
          </div>
          <div class="station capper-station">
            <span>CAPPER</span>
            <b>{{ capperStatus }}</b>
            <i></i>
          </div>
        </div>
        <div class="bottles">
          <div
            v-for="bottleIndex in BOTTLE_COUNT"
            :key="bottleIndex"
            class="bottle"
            :class="{ 'is-off-belt': interactive && bottleStates[bottleIndex - 1] !== 'on' }"
            :data-bottle-index="bottleIndex - 1"
            :style="bottleStyle(bottleIndex)"
            @animationiteration="handleBottleIteration"
          >
            <i class="bottle-liquid"></i>
            <i class="bottle-cap"></i>
          </div>
        </div>
        <div class="belt"><i v-for="rollerIndex in 16" :key="rollerIndex"></i></div>
      </div>

      <div class="counter-panel">
        <span>PRODUCTION</span>
        <b>{{ String(displayCount).padStart(3, '0') }}</b>
        <small>/ 100</small>
      </div>
    </div>

    <div class="fault-rail">
      <div><span>FAULT</span><b>{{ faultStatus }}</b></div>
      <div><span>COUNTER</span><b>{{ counterStatus }}</b></div>
      <div v-if="interactive"><span>REJECTED</span><b>{{ rejectedCount }}</b></div>
      <div><span>RECOVERY</span><b>{{ recoveryStatus }}</b></div>
    </div>

    <div v-if="interactive" class="conveyor-controls" aria-label="Machine controls">
      <button class="conveyor-control is-estop" type="button" :disabled="!canEstop" @click.stop="emergencyStop">
        <mdi-stop-circle-outline aria-hidden="true" />
        <span>E-STOP</span>
      </button>
      <button class="conveyor-control" type="button" :disabled="!canClear" @click.stop="clearMachine">
        <mdi-refresh aria-hidden="true" />
        <span>CLEAR</span>
      </button>
      <button class="conveyor-control is-start" type="button" :disabled="!canStart" @click.stop="startMachine">
        <mdi-play-circle-outline aria-hidden="true" />
        <span>START</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bottle-conveyor {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  background: #202326;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
}

.conveyor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.13);
}

.machine-label span,
.machine-label b {
  display: block;
}

.machine-label span {
  margin-bottom: 4px;
  color: #8f989e;
  font: 500 7px/1 'IBM Plex Mono', monospace;
}

.machine-label b,
.machine-state {
  font: 600 10px/1 'IBM Plex Mono', monospace;
}

.machine-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b8c0c5;
}

.machine-state i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #45a96b;
  box-shadow: 0 0 0 5px rgba(69, 169, 107, 0.13);
}

.is-fault .machine-state i {
  background: #ff7a00;
  box-shadow: 0 0 0 5px rgba(255, 122, 0, 0.14);
  animation: fault-pulse 1.2s infinite;
}

.is-aborted .machine-state i {
  background: #ff7a00;
  box-shadow: 0 0 0 5px rgba(255, 122, 0, 0.14);
  animation: fault-pulse 1.2s infinite;
}

.is-stopped .machine-state i {
  background: #8f989e;
  box-shadow: 0 0 0 5px rgba(143, 152, 158, 0.13);
}

.conveyor-stage {
  display: grid;
  grid-template-columns: 90px 1fr 120px;
  align-items: end;
  gap: 18px;
  min-height: 165px;
  padding: 22px 18px 24px;
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
}

.axis-drive {
  display: grid;
  place-items: center;
}

.drive-core {
  display: grid;
  width: 60px;
  height: 60px;
  place-items: center;
  border: 6px solid #6f787e;
  border-radius: 50%;
  background: #111315;
  box-shadow: inset 0 0 0 3px #ff7a00;
}

.drive-core span {
  color: #ff7a00;
  font: 700 14px/1 'IBM Plex Mono', monospace;
}

.axis-drive small {
  margin-top: 8px;
  color: #8f989e;
  font: 500 7px/1 'IBM Plex Mono', monospace;
}

.belt-wrap {
  position: relative;
  min-width: 0;
}

.station-track {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 39px;
  margin-bottom: 9px;
}

.station {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  min-width: 0;
  padding: 0 9px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-top: 3px solid #7b878d;
  background: rgba(255, 255, 255, 0.05);
}

.station:first-child {
  border-right: 0;
}

.station.capper-station {
  border-color: rgba(255, 122, 0, 0.62);
  border-left-color: rgba(255, 122, 0, 0.62);
}

.station::after {
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 1px;
  height: 9px;
  content: '';
  background: #8c969b;
}

.station span,
.station b {
  font-family: 'IBM Plex Mono', monospace;
}

.station span {
  overflow: hidden;
  color: #bdc5c9;
  font-size: 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.station b {
  color: #ff7a00;
  font-size: 7px;
  font-weight: 600;
}

.station i {
  position: absolute;
  right: 9px;
  bottom: 6px;
  left: 9px;
  height: 2px;
  background: rgba(255, 122, 0, 0.34);
}

.is-fault .station i {
  background: rgba(255, 122, 0, 0.72);
}

.is-aborted .station i {
  background: rgba(255, 122, 0, 0.72);
}

.is-stopped .station i {
  background: rgba(143, 152, 158, 0.48);
}

.is-recovered .station i {
  background: rgba(69, 169, 107, 0.72);
}

.bottles {
  position: relative;
  height: 74px;
}

.bottle {
  position: absolute;
  bottom: 0;
  left: 0;
  visibility: hidden;
  --bottle-half-width: 11px;
  --bottle-infeed: 30px;
  width: 21px;
  height: 54px;
  border: 2px solid #929ba1;
  border-radius: 5px 5px 3px 3px;
  background: rgba(255, 255, 255, 0.06);
  animation: bottle-flow 9s linear infinite;
  animation-delay: var(--bottle-delay);
  animation-play-state: paused;
}

/* Rejected bottles stay in the DOM on their own cycle slot, just hidden until they re-enter. */
.bottle.is-off-belt {
  visibility: hidden !important;
}

.bottle::before {
  position: absolute;
  top: -9px;
  left: 50%;
  width: 7px;
  height: 9px;
  border: 2px solid #929ba1;
  border-bottom: 0;
  content: '';
  transform: translateX(-50%);
}

.bottle-liquid {
  position: absolute;
  right: 2px;
  bottom: 2px;
  left: 2px;
  height: 0;
  background: rgba(255, 122, 0, 0.25);
  animation: liquid-fill 9s linear infinite;
  animation-delay: var(--bottle-delay);
  animation-play-state: paused;
}

.bottle-cap {
  position: absolute;
  top: -13px;
  left: 50%;
  width: 12px;
  height: 4px;
  border: 1px solid #ff7a00;
  background: #ff7a00;
  opacity: 0;
  animation: cap-appear 9s linear infinite;
  animation-delay: var(--bottle-delay);
  animation-play-state: paused;
  transform: translateX(-50%);
}

.bottle-liquid {
  background: #ff7a00;
}

.is-running .bottle,
.is-running .bottle-liquid,
.is-running .bottle-cap {
  animation-play-state: running;
}

.is-execute .bottle,
.is-execute .bottle-liquid,
.is-execute .bottle-cap {
  animation-play-state: running;
}

.is-recovered .bottle-liquid {
  height: 76%;
  background: #ff7a00;
  animation: none;
}

.is-recovered .bottle-cap {
  opacity: 1;
  animation: none;
}

.belt {
  display: flex;
  justify-content: space-around;
  height: 20px;
  padding-top: 4px;
  border-top: 4px solid #8a9399;
  border-bottom: 4px solid #51585d;
  background: #151719;
}

.belt i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #737c82;
}

.counter-panel {
  min-height: 103px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-left: 4px solid #ff7a00;
  background: #111315;
}

.counter-panel span,
.counter-panel b,
.counter-panel small {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
}

.counter-panel span {
  color: #8f989e;
  font-size: 7px;
}

.counter-panel b {
  margin-top: 10px;
  color: #ff7a00;
  font-size: 30px;
  line-height: 1;
}

.counter-panel small {
  margin-top: 5px;
  color: #8f989e;
  font-size: 8px;
}

.fault-rail {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.fault-rail > div {
  min-height: 48px;
  padding: 11px 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
}

.fault-rail span,
.fault-rail b {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
}

.fault-rail span {
  margin-bottom: 5px;
  color: #7f888e;
  font-size: 6px;
}

.fault-rail b {
  color: #c8ced2;
  font-size: 8px;
}

.conveyor-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.14);
}

.conveyor-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 48px;
  padding: 9px 12px;
  border: 0;
  color: #c8ced2;
  background: #292e31;
  font: 600 8px/1 'IBM Plex Mono', monospace;
  cursor: pointer;
}

.conveyor-control:hover:not(:disabled) {
  color: #fff;
  background: #353b3f;
}

.conveyor-control:disabled {
  opacity: 0.34;
  cursor: not-allowed;
}

.conveyor-control svg {
  width: 17px;
  height: 17px;
}

.conveyor-control.is-estop {
  color: #ff9b55;
}

.conveyor-control.is-start {
  color: #70c18d;
}

.is-fault .fault-rail > div:first-child,
.is-fault .fault-rail > div:nth-child(2) {
  background: rgba(255, 122, 0, 0.12);
}

.is-fault .fault-rail > div:first-child b,
.is-fault .fault-rail > div:nth-child(2) b,
.is-recovered .fault-rail b {
  color: #ff7a00;
}

.is-aborted .fault-rail > div:first-child,
.is-aborted .fault-rail > div:nth-child(2) {
  background: rgba(255, 122, 0, 0.12);
}

.is-aborted .fault-rail > div:first-child b,
.is-aborted .fault-rail > div:nth-child(2) b {
  color: #ff7a00;
}

.is-stopped .fault-rail > div:nth-child(2) b,
.is-stopped .fault-rail > div:last-child b {
  color: #b8c0c5;
}

.compact .conveyor-stage {
  min-height: 120px;
  grid-template-columns: 60px 1fr 88px;
  gap: 10px;
  padding: 13px 14px 15px;
}

.compact .conveyor-header {
  height: 42px;
  padding: 0 14px;
}

.compact .station-track {
  gap: 0;
  height: 31px;
  margin-bottom: 7px;
}

.compact .station {
  padding: 0 6px;
  border-top-width: 2px;
}

.compact .station span,
.compact .station b {
  font-size: 6px;
}

.compact .station::after {
  bottom: -8px;
  height: 7px;
}

.compact .station i {
  right: 6px;
  bottom: 4px;
  left: 6px;
}

.compact .bottles {
  height: 57px;
}

.compact .bottle {
  --bottle-half-width: 8.5px;
  --bottle-infeed: 24px;
  width: 17px;
  height: 43px;
}

.compact .bottle::before {
  top: -7px;
  left: 50%;
  width: 6px;
  height: 7px;
}

.compact .bottle-cap {
  top: -11px;
}

.compact .counter-panel {
  min-height: 82px;
  padding: 11px;
}

.compact .counter-panel b {
  margin-top: 7px;
  font-size: 23px;
}

@keyframes bottle-flow {
  0%, 10% { visibility: visible; left: calc(0px - var(--bottle-infeed)); }
  22%, 39% { left: calc(25% - var(--bottle-half-width)); }
  58%, 69% { left: calc(75% - var(--bottle-half-width)); }
  100% { visibility: visible; left: calc(100% + var(--bottle-half-width)); }
}

@keyframes liquid-fill {
  0%, 21% { height: 0; }
  37%, 100% { height: 76%; }
}

@keyframes cap-appear {
  0%, 61% { opacity: 0; transform: translateX(-50%) scale(0.7); }
  64%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
}

@keyframes fault-pulse {
  50% { opacity: 0.35; }
}
</style>