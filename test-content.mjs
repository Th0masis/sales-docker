import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('./slides.md', import.meta.url), 'utf8')
const slideMarkers = [...source.matchAll(/<div class="slide-id">(\d+)<\/div>/g)]
const slides = slideMarkers.map((marker, index) => {
  const start = index === 0 ? 0 : slideMarkers[index - 1].index + slideMarkers[index - 1][0].length
  return source.slice(start, marker.index + marker[0].length)
})

const requiredText = [
  'PLC řídí stroj',
  'Containery provozují služby okolo PLC',
  'Container není náhrada PLC runtime ani',
  'Rozhodnutí patří technickému specialistovi.',
]

const failures = []

if (slides.length !== 14) failures.push(`Expected 14 slides, found ${slides.length}`)

for (const text of requiredText) {
  if (!source.includes(text)) failures.push(`Missing required text: ${text}`)
}

for (const slideNumber of [4, 7, 8, 9, 10, 13]) {
  const slide = slides[slideNumber - 1]
  if (!slide?.includes('v-click')) failures.push(`Slide ${slideNumber} has no click state`)
}

if (!slides[11]?.includes('ot-use-card') || !slides[11]?.includes('selectedUseCase')) {
  failures.push('Slide 12 is missing its interactive use-case menu')
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Content checks passed: ${slides.length} slides`)