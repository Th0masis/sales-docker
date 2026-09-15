<script setup lang="ts">
const iframeSource = (() => {
  if (!import.meta.env.DEV) return ''
  if (typeof window === 'undefined') return ''

  const currentPort = Number(window.location.port || (window.location.protocol === 'https:' ? 443 : 80))
  return `${window.location.protocol}//${window.location.hostname}:${currentPort + 1}/`
})()
</script>

<template>
  <div class="skills-embed-frame" aria-label="Embedded skills.sh open agent skills ecosystem">
    <div class="skills-embed-chrome">
      <div class="skills-embed-dots"><i></i><i></i><i></i></div>
      <span>skills.sh · open agent skills ecosystem</span>
      <a href="https://www.skills.sh/" target="_blank" rel="noreferrer">OPEN ↗</a>
    </div>
    <iframe
      v-if="iframeSource"
      :src="iframeSource"
      title="skills.sh open agent skills ecosystem"
      loading="eager"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
    <div v-else class="skills-embed-fallback">
      <div class="skills-embed-fallback-mark">SKILLS<span>.SH</span></div>
      <div class="skills-embed-fallback-copy">
        <strong>Open agent skills ecosystem</strong>
        <span>Browse reusable skills for coding, research, testing, and automation workflows.</span>
      </div>
      <div class="skills-embed-fallback-tags">
        <span>engineering</span><span>automation</span><span>testing</span><span>devops</span>
      </div>
    </div>
  </div>
</template>