<script setup lang="ts">
import { computed, ref } from 'vue'

const FLEXIBLE_TIME_UNITS = 62
const BASE_GOVERN_UNITS = 9
const MAX_GOVERN_UNITS = FLEXIBLE_TIME_UNITS - BASE_GOVERN_UNITS
const FIXED_STAGE_UNITS = 49

const qualityInvestment = ref(0)
const governUnits = computed(() => 9 + (qualityInvestment.value / 100) * 44)
const reclaimedUnits = computed(() => FLEXIBLE_TIME_UNITS - governUnits.value)
const qualityLabel = computed(() => `${Math.round(qualityInvestment.value)}% quality investment`)
const isDragging = ref(false)
const trackStyle = computed<Record<string, string>>(() => ({
  '--govern-time': `${governUnits.value}fr`,
  '--reclaimed-time': `${reclaimedUnits.value}fr`,
}))

function setInvestmentFromPointer(clientX: number, track: HTMLElement) {
  const trackRect = track.getBoundingClientRect()
  const columnGap = Number.parseFloat(getComputedStyle(track).columnGap) || 0
  const unitWidth = (trackRect.width - columnGap * 7) / (FIXED_STAGE_UNITS + FLEXIBLE_TIME_UNITS)
  if (unitWidth <= 0) return

  const flexibleStart = trackRect.left + columnGap * 6 + FIXED_STAGE_UNITS * unitWidth
  const governUnitsAtPointer = (clientX - flexibleStart) / unitWidth
  const boundedGovernUnits = Math.min(MAX_GOVERN_UNITS, Math.max(BASE_GOVERN_UNITS, governUnitsAtPointer))
  qualityInvestment.value = ((boundedGovernUnits - BASE_GOVERN_UNITS) / (MAX_GOVERN_UNITS - BASE_GOVERN_UNITS)) * 100
}

function startDragging(event: PointerEvent) {
  const handle = event.currentTarget as HTMLElement
  const track = handle.closest('.track-after')
  if (!track) return

  event.preventDefault()
  handle.setPointerCapture(event.pointerId)
  isDragging.value = true
  setInvestmentFromPointer(event.clientX, track)
}

function drag(event: PointerEvent) {
  if (!isDragging.value) return
  const handle = event.currentTarget as HTMLElement
  const track = handle.closest('.track-after')
  if (track) setInvestmentFromPointer(event.clientX, track)
}

function stopDragging(event: PointerEvent) {
  isDragging.value = false
  const handle = event.currentTarget as HTMLElement
  if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId)
}

function nudgeInvestment(event: KeyboardEvent) {
  if (event.key === 'Home') qualityInvestment.value = 0
  if (event.key === 'End') qualityInvestment.value = 100
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') qualityInvestment.value = Math.max(0, qualityInvestment.value - 5)
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') qualityInvestment.value = Math.min(100, qualityInvestment.value + 5)
}
</script>

<template>
  <div class="cycle-block cycle-tradeoff">
    <p class="cycle-head"><b>DevOps after AI</b> — build runs at agent speed</p>
    <div class="cycle-track track-after" :style="trackStyle">
      <span>Plan</span>
      <span>Design</span>
      <span class="hot"></span>
      <span>Test</span>
      <span>Deploy</span>
      <span>Maintain</span>
      <span
        class="own"
        :class="{ 'is-dragging': isDragging }"
        role="slider"
        tabindex="0"
        aria-label="Time spent improving the system"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(qualityInvestment)"
        :aria-valuetext="qualityLabel"
        @pointerdown="startDragging"
        @pointermove="drag"
        @pointerup="stopDragging"
        @pointercancel="stopDragging"
        @keydown.prevent="nudgeInvestment"
      >
        Improve
        <i class="cycle-divider" aria-hidden="true"></i>
      </span>
      <em>reclaimed</em>
    </div>

    <div class="cycle-track track-after cycle-legend">
      <small style="grid-column: 1 / 3">requirements</small>
      <small style="grid-column: 4">review</small>
      <small style="grid-column: 5">release</small>
      <small style="grid-column: 7">improve</small>
      <small style="grid-column: 8">trade for quality</small>
    </div>
  </div>
</template>