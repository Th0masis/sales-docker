<script setup lang="ts">
import { computed, ref } from 'vue'

type LaneKind = 'human' | 'agent'

type Lane = {
  id: string
  kind: LaneKind
  label: string
  sublabel: string
}

type WorkflowStage = {
  index: number
  id: string
  lane: string
  column: number
  columnLabel: string
  label: string
  nodeLabel: string
  owner: 'HUMAN' | 'AGENT'
  model: string
  description: string
  evidence: string
  handoff: string
  optional?: boolean
  prompt?: string
  aiOutput?: string
  illustration?: 'coverage' | 'physical' | 'reasoning' | 'review' | 'test' | 'merge' | 'pr'
  spec?: {
    intent: string
    flow: string
    acceptance: string
  }
  kanban?: Array<{
    title: string
    tickets: Array<{
      id: string
      title: string
      selected?: boolean
    }>
  }>
  signoff?: {
    id: string
    title: string
    detail: string
  }
  delegation?: {
    lead: string
    agents: Array<{
      name: string
      task: string
      note: string
    }>
  }
}

type WorkflowFeedback = {
  from: number[]
  label: string
}

type WorkflowDefinition = {
  id: string
  number: string
  code: string
  title: string
  mode: string
  summary: string
  ownership: [string, string, string]
  lanes: Lane[]
  stages: WorkflowStage[]
  loops: Array<{
    from: number
    to: number
    label: string
    direction?: 'left-down'
  }>
  feedbackLoop?: WorkflowFeedback
}

const laneHeight = 56
const delegationHeaderHeight = 14
const subagentLaneHeight = 20
const routeNodeClearance = 11
const feedbackGutter = 64

const workflows: WorkflowDefinition[] = [
  {
    id: 'specification',
    number: '01',
    code: 'SPECIFICATION',
    title: 'Intent to independent tickets',
    mode: 'HITL',
    summary: 'Clarify human intent, turn shared understanding into a spec, then create reviewable independent tickets.',
    ownership: ['HUMAN INTENT', 'AGENT CLARIFICATION', 'HUMAN REVIEW'],
    loops: [{ from: 2, to: 1, label: 'MORE CLARITY', direction: 'left-down' }],
    lanes: [
      { id: 'human', kind: 'human', label: 'HUMAN', sublabel: 'intent + direction + review' },
      { id: 'clarifier', kind: 'agent', label: 'AGENT', sublabel: 'critical questions' },
      { id: 'spec', kind: 'agent', label: 'AGENT', sublabel: 'specification author' },
      { id: 'tickets', kind: 'agent', label: 'AGENT', sublabel: 'ticket planner' },
    ],
    stages: [
      {
        index: 0,
        id: 'intent',
        lane: 'human',
        column: 1,
        columnLabel: 'INTENT',
        label: 'Describe the need',
        nodeLabel: 'WHAT / WHY',
        owner: 'HUMAN',
        model: 'HUMAN',
        description: 'Describe the bug or new feature in terms of intent and desired outcome, without prescribing a technical solution.',
        evidence: 'need + intent',
        handoff: 'feature request',
        prompt: 'I want the machine to be able to recover from an axis fault and countinue the batch after the error has been cleared',
      },
      {
        index: 1,
        id: 'questions',
        lane: 'clarifier',
        column: 2,
        columnLabel: 'QUESTIONS',
        label: 'Ask critical questions',
        nodeLabel: 'CLARIFY',
        owner: 'AGENT',
        model: 'CLARIFIER',
        description: 'Probe direction, edge cases, expected behavior, boundaries, risks, and ambiguous language until both sides share the same understanding.',
        evidence: 'questions + unknowns',
        handoff: 'questions > answers',
        illustration: 'reasoning',
      },
      {
        index: 2,
        id: 'answers',
        lane: 'human',
        column: 3,
        columnLabel: 'DIRECTION',
        label: 'Resolve unknowns',
        nodeLabel: 'ANSWER',
        owner: 'HUMAN',
        model: 'HUMAN',
        description: 'Answer the open questions and make the product decisions that define the intended behavior and direction.',
        evidence: 'decisions + intent',
        handoff: 'shared understanding',
        aiOutput: 'What should happen to half filled bottles?\nA: Discard\nB: Finnish filling\nC: Other',
      },
      {
        index: 3,
        id: 'spec',
        lane: 'spec',
        column: 4,
        columnLabel: 'SPEC',
        label: 'Write the spec (optional)',
        nodeLabel: 'SPEC',
        owner: 'AGENT',
        model: 'SPEC WRITER',
        description: 'An optional fresh agent turns the clarified intent into a concise spec: problem, goal, scope, success criteria, platform and performance constraints, security compliance, and integrations.',
        evidence: 'reviewable spec',
        handoff: 'reviewable spec',
        optional: true,
        spec: {
          intent: 'Recover from an axis fault without losing the batch.',
          flow: 'Stop, reject every uncapped bottle, then resume the batch.',
          acceptance: 'Count holds and the 100-bottle batch completes.',
        },
      },
      {
        index: 4,
        id: 'tickets',
        lane: 'tickets',
        column: 5,
        columnLabel: 'TICKETS',
        label: 'Split into tickets',
        nodeLabel: 'TICKETS',
        owner: 'AGENT',
        model: 'TICKET PLANNER',
        description: 'A fresh agent decomposes the spec into independent, ordered tickets; identifies unknowns and blockers; then creates and labels each ticket by readiness and priority.',
        evidence: 'tickets + dependency map',
        handoff: 'individual tickets',
        kanban: [
          { title: 'BACKLOG', tickets: [{ id: 'T-01', title: 'Stop and show the fault' }] },
          { title: 'READY', tickets: [{ id: 'T-02', title: 'Reject uncapped bottles' }] },
          { title: 'REVIEW', tickets: [{ id: 'T-03', title: 'Resume the same batch' }] },
        ],
      },
      {
        index: 5,
        id: 'review',
        lane: 'human',
        column: 6,
        columnLabel: 'REVIEW',
        label: 'Review intent and unknowns',
        nodeLabel: 'CHECK',
        owner: 'HUMAN',
        model: 'HUMAN',
        description: 'Inspect the ticket set: confirm the original intention survived decomposition, challenge remaining unknowns, and approve what is ready for implementation.',
        evidence: 'approved ticket set',
        handoff: 'ready > implementation',
        signoff: {
          id: 'T-03',
          title: 'Resume the same batch',
          detail: 'Counting continues from the held value to 100.',
        },
      },
    ],
  },
  {
    id: 'implementation',
    number: '02',
    code: 'IMPLEMENTATION',
    title: 'Issues to integrated feature',
    mode: 'AFK',
    summary: 'Plan dependencies, implement isolated issues, review and test in a loop, then merge completed issue branches.',
    ownership: ['AGENT PLANNING', 'REVIEW + TEST LOOP', 'FEATURE INTEGRATION'],
    loops: [
      { from: 2, to: 1, label: 'CHANGES' },
      { from: 3, to: 1, label: 'FAILED' },
    ],
    lanes: [
      { id: 'planner', kind: 'agent', label: 'AGENT', sublabel: 'planner' },
      { id: 'implementer', kind: 'agent', label: 'AGENT', sublabel: 'implementer / cheap' },
      { id: 'reviewer', kind: 'agent', label: 'AGENT', sublabel: 'reviewer / expensive' },
      { id: 'tester', kind: 'agent', label: 'AGENT', sublabel: 'test agent' },
      { id: 'merger', kind: 'agent', label: 'AGENT', sublabel: 'merger / diff only' },
    ],
    stages: [
      {
        index: 0,
        id: 'plan',
        lane: 'planner',
        column: 1,
        columnLabel: 'PLAN',
        label: 'Plan and branch',
        nodeLabel: 'PLAN',
        owner: 'AGENT',
        model: 'PLANNER',
        description: 'Inspect open issues, order dependencies, identify parallel work, create an issue branch from the correct parent branch, and hand the current commit plus issue to the implementer.',
        evidence: 'plan + branch + handoff',
        handoff: 'commit + issue',
        kanban: [
          { title: 'OPEN', tickets: [{ id: 'ISSUE-14', title: 'Stop and show the fault' }] },
          { title: 'READY', tickets: [{ id: 'ISSUE-15', title: 'Reject uncapped bottles' }] },
          { title: 'SELECTED', tickets: [{ id: 'ISSUE-16', title: 'Resume the same batch', selected: true }] },
        ],
      },
      {
        index: 1,
        id: 'implement',
        lane: 'implementer',
        column: 2,
        columnLabel: 'IMPLEMENT',
        label: 'Implement and test',
        nodeLabel: 'CODE + TEST',
        owner: 'AGENT',
        model: 'CHEAP MODEL',
        description: 'Implement within the issue guardrails, spawn research subagents, gather application feedback with tools, write spec-aligned tests, and commit directly to the issue branch.',
        evidence: 'commits + tests + feedback',
        handoff: 'implementation diff',
        delegation: {
          lead: 'IMPLEMENTATION AGENT',
          agents: [
            { name: 'AS-HELP MCP', task: 'PLC guidance', note: 'Search the AS-Help' },
            { name: 'as', task: 'Build + simulation', note: 'Debug' },
            { name: 'WEB RESEARCH', task: 'Patterns + edge cases', note: 'Research' },
            { name: 'HMI AGENT', task: 'Application feedback', note: 'HMI Design' },
          ],
        },
      },
      {
        index: 2,
        id: 'review',
        lane: 'reviewer',
        column: 3,
        columnLabel: 'REVIEW',
        label: 'Review the implementation',
        nodeLabel: 'REVIEW',
        owner: 'AGENT',
        model: 'EXPENSIVE MODEL',
        illustration: 'review',
        description: 'Check the implementation against instructions and guardrails, verify that intent was not lost, and ensure unrelated application areas were not changed. Failures return to implementation.',
        evidence: 'diff + review verdict',
        handoff: 'passed review',
      },
      {
        index: 3,
        id: 'test',
        lane: 'tester',
        column: 4,
        columnLabel: 'TEST',
        label: 'Run deterministic tests',
        nodeLabel: 'TEST',
        owner: 'AGENT',
        model: 'DETERMINISTIC',
        illustration: 'test',
        description: 'Run the declared tests and verify their raw results. Any failure returns the issue to the implementer for another implementation, review, and test iteration.',
        evidence: 'test report + logs',
        handoff: 'passed tests',
      },
      {
        index: 4,
        id: 'merge',
        lane: 'merger',
        column: 5,
        columnLabel: 'MERGE',
        label: 'Integrate issue branches',
        nodeLabel: 'MERGE',
        owner: 'AGENT',
        model: 'DIFF-ONLY',
        illustration: 'merge',
        description: 'After all issue iterations pass, merge the issue branches into one feature branch and produce a detailed account of what was fixed using only the resulting diffs.',
        evidence: 'feature branch + change report',
        handoff: 'feature > evaluation',
      },
    ],
  },
  {
    id: 'evaluation',
    number: '03',
    code: 'EVALUATION',
    title: 'Evidence to PR decision',
    mode: 'HITL',
    summary: 'Verify that tests preserve intent, optionally inspect the experience, then make the accountable PR decision.',
    ownership: ['HUMAN INTENT CHECK', 'OPTIONAL FEEDBACK', 'HUMAN PR GATE'],
    loops: [],
    lanes: [
      { id: 'human', kind: 'human', label: 'HUMAN', sublabel: 'intent + feedback + PR gate' },
    ],
    feedbackLoop: {
      from: [0, 1],
      label: 'ENHANCE THE WORKFLOW',
    },
    stages: [
      {
        index: 0,
        id: 'intent-tests',
        lane: 'human',
        column: 1,
        columnLabel: 'INTENT',
        label: 'Validate tests against intent',
        nodeLabel: 'TEST INTENT',
        owner: 'HUMAN',
        model: 'HUMAN',
        illustration: 'coverage',
        description: 'Review whether the deterministic tests actually preserve the original intent and prove the spec success criteria, rather than merely passing.',
        evidence: 'intent coverage verdict',
        handoff: 'intent is intact',
      },
      {
        index: 1,
        id: 'expectations',
        lane: 'human',
        column: 2,
        columnLabel: 'EXPECTATIONS',
        label: 'Inspect the experience (optional)',
        nodeLabel: 'FEEDBACK',
        owner: 'HUMAN',
        model: 'OPTIONAL',
        illustration: 'physical',
        description: 'Use feedback from the running system to judge whether the implementation behaves as expected and whether the workflow itself needs adjustment.',
        evidence: 'experience feedback + gaps',
        handoff: 'expectations met',
      },
      {
        index: 2,
        id: 'pr-decision',
        lane: 'human',
        column: 3,
        columnLabel: 'PR GATE',
        label: 'Decide PR readiness',
        nodeLabel: 'READY?',
        owner: 'HUMAN',
        model: 'HUMAN',
        illustration: 'pr',
        description: 'Review the test report, human findings, and remaining gaps; then decide whether the feature is ready for a human-reviewed pull request or must iterate.',
        evidence: 'test report + PR decision',
        handoff: 'ready > PR',
      },
    ],
  },
]

const activeWorkflowId = ref('specification')
const collapsedSubagents = ref<Record<string, boolean>>({})
const currentStageIndex = ref(0)
const isDetailOpen = ref(false)

const activeWorkflow = computed(() => workflows.find(workflow => workflow.id === activeWorkflowId.value) ?? workflows[0])
const lanes = computed(() => activeWorkflow.value.lanes)
const stages = computed(() => activeWorkflow.value.stages)
const columnCount = computed(() => stages.value.length)
const workflowContentHeight = computed(() => lanes.value.reduce((height, lane) => height + laneHeight + delegationHeightForLane(lane.id), 0))
const workflowTrackHeight = computed(() => workflowContentHeight.value + (activeWorkflow.value.feedbackLoop ? feedbackGutter : 0))
const selectedStage = computed(() => stages.value[currentStageIndex.value] ?? stages.value[0])
const loopDestinations = computed(() => activeWorkflow.value.loops.filter((loop, loopIndex, loops) => loops.findIndex(candidate => candidate.to === loop.to) === loopIndex))

function stagesForLane(laneId: string) {
  return stages.value.filter(stage => stage.lane === laneId)
}

function delegationStageForLane(laneId: string) {
  return stages.value.find(stage => stage.lane === laneId && stage.delegation)
}

function delegationGridColumn(laneId: string) {
  return (delegationStageForLane(laneId)?.column ?? 1) + 1
}

function delegationForLane(laneId: string) {
  return delegationStageForLane(laneId)?.delegation
}

function subagentGroupKey(laneId: string) {
  return `${activeWorkflowId.value}:${laneId}`
}

function isSubagentCollapsed(laneId: string) {
  return collapsedSubagents.value[subagentGroupKey(laneId)] ?? false
}

function toggleSubagents(laneId: string) {
  const key = subagentGroupKey(laneId)
  collapsedSubagents.value = {
    ...collapsedSubagents.value,
    [key]: !isSubagentCollapsed(laneId),
  }
}

function delegationHeightForLane(laneId: string) {
  const delegation = delegationForLane(laneId)
  if (!delegation) return 0
  return delegationHeaderHeight + (isSubagentCollapsed(laneId) ? 0 : delegation.agents.length * subagentLaneHeight)
}

function laneCenterY(laneId: string) {
  let offset = 0

  for (const lane of lanes.value) {
    if (lane.id === laneId) return offset + laneHeight / 2
    offset += laneHeight + delegationHeightForLane(lane.id)
  }

  return laneHeight / 2
}

function stageOwnerClass(stageIndex: number) {
  return stages.value[stageIndex].owner === 'HUMAN' ? 'is-human' : 'is-agent'
}

function stageState(index: number) {
  if (index === currentStageIndex.value) return 'is-active'
  if (index < currentStageIndex.value) return 'is-complete'
  return 'is-pending'
}

function selectStage(index: number) {
  currentStageIndex.value = index
}

function openStageDetail(index: number) {
  selectStage(index)
  isDetailOpen.value = true
}

function switchWorkflow(workflowId: string) {
  if (workflowId === activeWorkflowId.value) return
  isDetailOpen.value = false
  activeWorkflowId.value = workflowId
  currentStageIndex.value = 0
}

function closeDetail() {
  isDetailOpen.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeDetail()
}

function routeStyle(stageIndex: number, part: 'horizontal' | 'vertical') {
  const previousStage = stages.value[stageIndex - 1]
  const stage = stages.value[stageIndex]
  const startX = ((previousStage.column - 0.5) / columnCount.value) * 100
  const endX = ((stage.column - 0.5) / columnCount.value) * 100
  const previousY = laneCenterY(previousStage.lane)
  const currentY = laneCenterY(stage.lane)

  if (part === 'horizontal') {
    const sameRow = previousY === currentY
    const endClearance = sameRow ? routeNodeClearance * 2 : routeNodeClearance

    return {
      left: `calc(${startX}% + ${routeNodeClearance}px)`,
      top: `${previousY}px`,
      width: `calc(${endX - startX}% - ${endClearance}px)`,
    }
  }

  const targetClearance = currentY < previousY ? routeNodeClearance : 0

  return {
    left: `${endX}%`,
    top: `${Math.min(previousY, currentY) + targetClearance}px`,
    height: `${Math.abs(currentY - previousY) - routeNodeClearance}px`,
  }
}

function routeLabelStyle(stageIndex: number) {
  const previousStage = stages.value[stageIndex - 1]
  const stage = stages.value[stageIndex]
  const startX = ((previousStage.column - 0.5) / columnCount.value) * 100
  const endX = ((stage.column - 0.5) / columnCount.value) * 100
  const previousY = laneCenterY(previousStage.lane)

  return {
    left: `${(startX + endX) / 2}%`,
    top: `${previousY}px`,
  }
}

function routeIsVertical(stageIndex: number) {
  return stages.value[stageIndex - 1].lane !== stages.value[stageIndex].lane
}

function loopBendY(loop: WorkflowDefinition['loops'][number], loopIndex: number) {
  const fromStage = stages.value[loop.from]
  const toStage = stages.value[loop.to]
  const fromY = laneCenterY(fromStage.lane)
  const toY = laneCenterY(toStage.lane)
  return Math.max(fromY, toY) + laneHeight / 2 - 3 + loopIndex * 6
}

function loopGeometry(loop: WorkflowDefinition['loops'][number], loopIndex: number) {
  const fromStage = stages.value[loop.from]
  const toStage = stages.value[loop.to]
  const fromX = ((fromStage.column - 0.5) / columnCount.value) * 1000
  const toX = ((toStage.column - 0.5) / columnCount.value) * 1000
  const fromY = laneCenterY(fromStage.lane)

  if (loop.direction === 'left-down') {
    const approachY = fromY + 18
    return {
      path: `M ${fromX} ${approachY} H ${toX}`,
      labelX: (fromX + toX) / 2,
      labelY: approachY - 5,
    }
  }

  const bendY = loopBendY(loop, loopIndex)
  const fromClearance = 18
  const destinationLoops = activeWorkflow.value.loops.filter(candidate => candidate.to === loop.to)
  const sharedBendY = Math.min(...destinationLoops.map(candidate => loopBendY(candidate, activeWorkflow.value.loops.indexOf(candidate))))
  const sharedApproach = bendY > sharedBendY ? ` V ${sharedBendY}` : ''

  return {
    path: `M ${fromX} ${fromY + fromClearance} V ${bendY} H ${toX}${sharedApproach}`,
    labelX: (fromX + toX) / 2,
    labelY: bendY - 5,
  }
}

function loopSharedGeometry(loop: WorkflowDefinition['loops'][number]) {
  const toStage = stages.value[loop.to]
  const toX = ((toStage.column - 0.5) / columnCount.value) * 1000
  const toY = laneCenterY(toStage.lane)

  if (loop.direction === 'left-down') {
    const fromStage = stages.value[loop.from]
    const approachY = laneCenterY(fromStage.lane) + 18
    return {
      path: `M ${toX} ${approachY} V ${toY - routeNodeClearance}`,
    }
  }

  const destinationLoops = activeWorkflow.value.loops.filter(candidate => candidate.to === loop.to)
  const bendY = Math.min(...destinationLoops.map(candidate => loopBendY(candidate, activeWorkflow.value.loops.indexOf(candidate))))
  const toClearance = routeNodeClearance

  return {
    path: `M ${toX} ${bendY} V ${toY + toClearance}`,
  }
}

function destinationIsActive(loop: WorkflowDefinition['loops'][number]) {
  return activeWorkflow.value.loops.some(candidate => candidate.to === loop.to && candidate.from === currentStageIndex.value)
}

function feedbackLoopGeometry() {
  const feedbackLoop = activeWorkflow.value.feedbackLoop
  if (!feedbackLoop) return undefined

  const sourceX = feedbackLoop.from.map(stageIndex => {
    const stage = stages.value[stageIndex]
    return ((stage.column - 0.5) / columnCount.value) * 1000
  })
  const trunkX = Math.min(...sourceX)
  const arrowX = 18
  const sharedY = workflowContentHeight.value + feedbackGutter - 4
  const fromClearance = 18
  const branchPaths = feedbackLoop.from.map(stageIndex => {
    const stage = stages.value[stageIndex]
    const branchX = ((stage.column - 0.5) / columnCount.value) * 1000
    const sourceY = laneCenterY(stage.lane)
    const approach = branchX === trunkX ? '' : ` H ${trunkX}`
    return `M ${branchX} ${sourceY + fromClearance} V ${sharedY}${approach}`
  })

  return {
    branchPaths,
    sharedPath: `M ${trunkX} ${sharedY} H ${arrowX}`,
    labelX: (trunkX + arrowX) / 2,
    labelY: sharedY - 5,
  }
}

function feedbackBranchIsActive(stageIndex: number) {
  return activeWorkflow.value.feedbackLoop?.from[stageIndex] === currentStageIndex.value
}

function feedbackLoopIsActive() {
  return activeWorkflow.value.feedbackLoop?.from.includes(currentStageIndex.value) ?? false
}

</script>

<template>
  <section
    class="agent-workflow"
    :style="{ '--column-count': columnCount }"
    :aria-label="activeWorkflow.title"
    @keydown="handleKeydown"
  >
    <nav class="workflow-switcher" aria-label="Choose workflow">
      <button
        v-for="workflow in workflows"
        :key="workflow.id"
        class="workflow-tab"
        :class="{ 'is-selected': workflow.id === activeWorkflowId }"
        type="button"
        :aria-pressed="workflow.id === activeWorkflowId"
        @click.stop="switchWorkflow(workflow.id)"
      >
        <span class="workflow-tab-index">{{ workflow.number }}</span>
        <span class="workflow-tab-copy">
          <b>{{ workflow.code }}</b>
          <small>{{ workflow.mode }} · {{ workflow.title }}</small>
        </span>
      </button>
    </nav>

    <div class="workflow-ownership" aria-hidden="true">
      <span>{{ activeWorkflow.ownership[0] }}</span><i></i><b>{{ activeWorkflow.ownership[1] }}</b><i></i><span>{{ activeWorkflow.ownership[2] }}</span>
    </div>

    <div class="workflow-columns">
      <div></div>
      <button
        v-for="stage in stages"
        :key="stage.id"
        type="button"
        :class="{ 'is-current': stage.index === currentStageIndex }"
        :aria-label="`Go to step ${stage.index + 1}: ${stage.label}`"
        :aria-current="stage.index === currentStageIndex ? 'step' : undefined"
        @click.stop="selectStage(stage.index)"
      >
        <span>{{ String(stage.index + 1).padStart(2, '0') }}</span>
        <small>{{ stage.columnLabel }}</small>
      </button>
    </div>

    <div class="workflow-track-stack" :class="{ 'has-feedback': activeWorkflow.feedbackLoop }">
      <template v-for="lane in lanes" :key="lane.id">
        <div class="workflow-lane">
          <div class="lane-identity" :class="`is-${lane.kind}`">
          <span class="lane-avatar" aria-hidden="true">
            <mdi-account-outline v-if="lane.kind === 'human'" />
            <mdi-robot-outline v-else />
          </span>
            <span class="lane-identity-content">
              <span class="lane-main"><b>{{ lane.label }}</b><small>{{ lane.sublabel }}</small></span>
            </span>
          </div>
          <div class="lane-track">
            <div class="lane-grid">
              <button
                v-for="stage in stagesForLane(lane.id)"
                :key="stage.id"
                class="stage-node"
                :class="[`is-${stage.owner.toLowerCase()}`, stageState(stage.index), { 'has-delegation': stage.delegation }]"
                type="button"
                :style="{ gridColumn: stage.column }"
                :aria-label="`${stage.label}: ${stage.description}`"
                :aria-haspopup="'dialog'"
                :aria-current="stage.index === currentStageIndex ? 'step' : undefined"
                @click.stop="openStageDetail(stage.index)"
              >
                <span class="node-dot" aria-hidden="true">
                  <mdi-robot-outline v-if="stage.owner === 'AGENT'" />
                  <i v-else></i>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="delegationForLane(lane.id)"
          class="workflow-subagent-stack"
          :class="{
            'is-active': delegationStageForLane(lane.id)?.index === currentStageIndex,
            'is-collapsed': isSubagentCollapsed(lane.id),
          }"
        >
          <button
            class="workflow-subagent-heading"
            type="button"
            :aria-expanded="!isSubagentCollapsed(lane.id)"
            :aria-label="isSubagentCollapsed(lane.id) ? 'Expand subagent lanes' : 'Collapse subagent lanes'"
            @click.stop="toggleSubagents(lane.id)"
          >
            <span><b>SUBAGENT LANES</b><small>{{ String(delegationForLane(lane.id)?.agents.length).padStart(2, '0') }}</small></span>
            <mdi-chevron-down class="workflow-subagent-toggle" aria-hidden="true" />
          </button>
          <template v-if="!isSubagentCollapsed(lane.id)">
            <div class="workflow-subagent-branches" aria-hidden="true">
              <span class="workflow-subagent-elbow" :style="{ gridColumn: delegationGridColumn(lane.id) }"></span>
              <span class="workflow-subagent-spine" :style="{ gridColumn: delegationGridColumn(lane.id) }"></span>
            </div>
            <div
              v-for="agent in delegationForLane(lane.id)?.agents"
              :key="agent.name"
              class="workflow-subagent-lane"
            >
              <div class="subagent-lane-identity">
                <mdi-robot-outline aria-hidden="true" />
                <span><b>{{ agent.name }}</b><small>{{ agent.task }}</small></span>
              </div>
              <div class="subagent-lane-track">
                <div class="subagent-lane-grid">
                  <span
                    class="subagent-node"
                    :style="{ gridColumn: delegationStageForLane(lane.id)?.column }"
                    :title="`${agent.name}: ${agent.task}`"
                    aria-hidden="true"
                  >
                    <i></i>
                    <span class="subagent-note">{{ agent.note }}</span>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </template>

      <div class="workflow-route-layer" aria-hidden="true">
        <span
          v-for="stageIndex in stages.length - 1"
          :key="stageIndex"
          class="workflow-route"
          :class="[
            stageState(stageIndex),
            stageOwnerClass(stageIndex - 1),
          ]"
        >
          <i class="route-horizontal" :style="routeStyle(stageIndex, 'horizontal')"></i>
          <i v-if="routeIsVertical(stageIndex)" class="route-vertical" :style="routeStyle(stageIndex, 'vertical')"></i>
        </span>
      </div>

      <svg
        v-if="activeWorkflow.loops.length || activeWorkflow.feedbackLoop"
        class="workflow-loop-layer"
        :viewBox="`0 0 1000 ${workflowTrackHeight}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <marker id="workflow-loop-arrow" viewBox="0 0 12 8" refX="0" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path class="workflow-loop-arrow-tip" d="M 4 0 L 12 4 L 4 8 z" />
          </marker>
        </defs>
        <g
          v-for="(loop, loopIndex) in activeWorkflow.loops"
          :key="`${loop.from}-${loop.to}`"
          class="workflow-loop"
            :class="{ 'is-active': currentStageIndex === loop.from }"
        >
          <path class="workflow-loop-underlay" :d="loopGeometry(loop, loopIndex).path" />
          <path
            class="workflow-loop-path"
            :class="`is-phase-${loopIndex % 2}`"
            :d="loopGeometry(loop, loopIndex).path"
          />
          <text class="workflow-loop-label" :x="loopGeometry(loop, loopIndex).labelX" :y="loopGeometry(loop, loopIndex).labelY">{{ loop.label }}</text>
        </g>
        <g
          v-for="destinationLoop in loopDestinations"
          :key="`destination-${destinationLoop.to}`"
          class="workflow-loop workflow-loop-shared"
            :class="{ 'is-active': destinationIsActive(destinationLoop) }"
        >
          <path class="workflow-loop-underlay" :d="loopSharedGeometry(destinationLoop).path" />
          <path
            class="workflow-loop-path"
            :d="loopSharedGeometry(destinationLoop).path"
            marker-end="url(#workflow-loop-arrow)"
          />
        </g>
        <g
          v-if="activeWorkflow.feedbackLoop"
          class="workflow-loop workflow-feedback-loop"
        >
          <g
            v-for="(branchPath, branchIndex) in feedbackLoopGeometry()?.branchPaths"
            :key="`feedback-branch-${branchIndex}`"
            class="workflow-feedback-branch"
            :class="{ 'is-active': feedbackBranchIsActive(branchIndex) }"
          >
            <path class="workflow-loop-underlay" :d="branchPath" />
            <path
              class="workflow-loop-path"
              :class="`is-phase-${branchIndex % 2}`"
              :d="branchPath"
            />
          </g>
          <g class="workflow-feedback-shared" :class="{ 'is-active': feedbackLoopIsActive() }">
            <path class="workflow-loop-underlay" :d="feedbackLoopGeometry()?.sharedPath" />
            <path
              class="workflow-loop-path"
              :d="feedbackLoopGeometry()?.sharedPath"
              marker-end="url(#workflow-loop-arrow)"
            />
            <text
              class="workflow-loop-label"
              :x="feedbackLoopGeometry()?.labelX"
              :y="feedbackLoopGeometry()?.labelY"
            >{{ activeWorkflow.feedbackLoop.label }}</text>
          </g>
        </g>
      </svg>
    </div>

    <div v-if="isDetailOpen" class="workflow-modal-backdrop" @click.self.stop="closeDetail">
      <article
        class="workflow-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`workflow-detail-${activeWorkflow.id}-${selectedStage.id}`"
        @click.stop
      >
        <header class="modal-head">
          <div>
            <small>{{ activeWorkflow.code }} · STEP {{ String(selectedStage.index + 1).padStart(2, '0') }}{{ selectedStage.optional ? ' · OPTIONAL' : '' }}</small>
            <h2 :id="`workflow-detail-${activeWorkflow.id}-${selectedStage.id}`">{{ selectedStage.label }}</h2>
          </div>
          <button type="button" aria-label="Close step details" @click.stop="closeDetail">×</button>
        </header>

        <div class="modal-body">
          <div class="modal-copy">
            <div class="modal-owner" :class="`is-${selectedStage.owner.toLowerCase()}`">
              <span>{{ selectedStage.owner === 'HUMAN' ? 'H' : 'AI' }}</span>
              <div><small>RESPONSIBLE</small><b>{{ selectedStage.owner }} · {{ selectedStage.model }}</b></div>
            </div>

            <section>
              <small>WHAT HAPPENS</small>
              <p>{{ selectedStage.description }}</p>
            </section>

            <div class="modal-flow">
              <section><small>RESULT / EVIDENCE</small><b>{{ selectedStage.evidence }}</b></section>
              <i aria-hidden="true">→</i>
              <section><small>NEXT HANDOFF</small><b>{{ selectedStage.handoff }}</b></section>
            </div>
          </div>

          <figure class="modal-media">
            <div v-if="selectedStage.prompt || selectedStage.aiOutput" class="modal-terminal">
              <div class="terminal-chrome">
                <div class="terminal-lights" aria-hidden="true">
                  <span class="terminal-light is-red"></span>
                  <span class="terminal-light is-yellow"></span>
                  <span class="terminal-light is-green"></span>
                </div>
                <small>AI@WORKFLOW:~$</small>
                <b>{{ selectedStage.prompt ? 'PROMPT' : 'OUTPUT' }}</b>
              </div>
              <div class="terminal-body">
                <span class="terminal-symbol" aria-hidden="true">&gt;</span>
                <p>{{ selectedStage.prompt || selectedStage.aiOutput }}</p>
              </div>
              <div class="terminal-footer">
                <small>READY</small>
                <span class="terminal-cursor" aria-hidden="true"></span>
              </div>
            </div>
            <div v-else-if="selectedStage.illustration === 'coverage'" class="modal-coverage" aria-label="Test coverage report">
              <div class="coverage-head"><span>TEST COVERAGE</span><b>INTENT MAP</b></div>
              <div class="coverage-summary">
                <div class="coverage-score"><strong>92%</strong><small>INTENT COVERED</small></div>
                <div class="coverage-meter" aria-hidden="true"><i></i></div>
              </div>
              <ul class="coverage-list">
                <li><span class="coverage-mark" aria-hidden="true">✓</span><span class="coverage-item-label">Axis fault recovery</span><b>PASS</b></li>
                <li><span class="coverage-mark" aria-hidden="true">✓</span><span class="coverage-item-label">Uncapped bottles rejected</span><b>PASS</b></li>
                <li><span class="coverage-mark" aria-hidden="true">✓</span><span class="coverage-item-label">Batch resumes to 100</span><b>PASS</b></li>
              </ul>
              <div class="coverage-foot"><span>CRITERIA</span><b>3 / 3 VERIFIED</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'physical'" class="modal-physical-test" aria-label="Physical test and running system validation">
              <div class="physical-test-head"><span>FUNCTIONAL + PHYSICAL TEST</span><b>RUNNING SYSTEM</b></div>
              <div class="physical-test-state">
                <div class="physical-test-machine" aria-hidden="true">
                  <span class="physical-test-machine-axis"></span>
                  <span class="physical-test-bottle is-first"></span>
                  <span class="physical-test-bottle is-second"></span>
                  <span class="physical-test-machine-pulse"></span>
                </div>
                <div class="physical-test-state-copy"><small>SCENARIO</small><b>FAULT → CLEAR → RESUME</b></div>
              </div>
              <ul class="physical-test-list">
                <li><i aria-hidden="true">✓</i><span>FUNCTIONAL / AXIS RECOVERY</span><b>PASS</b></li>
                <li><i aria-hidden="true">✓</i><span>PHYSICAL / HMI + MOTION</span><b>PASS</b></li>
                <li class="is-review"><i aria-hidden="true">!</i><span>VALIDATION / OPERATOR CHECK</span><b>CHECK</b></li>
              </ul>
              <div class="physical-test-foot"><span>VALIDATION</span><b>EXPERIENCE FEEDBACK</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'reasoning'" class="modal-reasoning" aria-hidden="true">
              <span class="reasoning-connector reasoning-connector-why"></span>
              <span class="reasoning-connector reasoning-connector-edge"></span>
              <span class="reasoning-connector reasoning-connector-risk"></span>
              <span class="reasoning-connector reasoning-connector-output"></span>
              <span class="reasoning-node reasoning-node-why">WHY?</span>
              <span class="reasoning-node reasoning-node-edge">EDGE</span>
              <span class="reasoning-node reasoning-node-risk">RISK</span>
              <div class="reasoning-core"><i>AI</i><b>REASON</b></div>
              <span class="reasoning-output">CLARIFY</span>
            </div>
            <div v-else-if="selectedStage.spec" class="modal-spec">
              <div class="spec-head">
                <span>SPEC-01</span>
                <b>DRAFT SPEC</b>
              </div>
              <h3>Axis fault recovery</h3>
              <dl>
                <div><dt>INTENT</dt><dd>{{ selectedStage.spec.intent }}</dd></div>
                <div><dt>FLOW</dt><dd>{{ selectedStage.spec.flow }}</dd></div>
                <div><dt>CHECK</dt><dd>{{ selectedStage.spec.acceptance }}</dd></div>
              </dl>
              <div class="spec-foot"><span>STATUS</span><b>OPTIONAL / REVIEW</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'review'" class="modal-review" aria-label="Implementation review checklist">
              <div class="review-head"><span>REVIEW GATE</span><b>ALL CHECKS PASS</b></div>
              <div class="review-verdict">
                <span class="review-verdict-mark" aria-hidden="true">✓</span>
                <div><small>VERDICT</small><b>READY TO TEST</b></div>
              </div>
              <ul class="review-checklist">
                <li><i aria-hidden="true">✓</i><span>Intent preserved</span><b>PASS</b></li>
                <li><i aria-hidden="true">✓</i><span>Guardrails intact</span><b>PASS</b></li>
                <li><i aria-hidden="true">✓</i><span>Unrelated areas untouched</span><b>PASS</b></li>
              </ul>
              <div class="review-foot"><span>DIFF + INSTRUCTIONS</span><b>3 / 3 CHECKS</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'test'" class="modal-test-run" aria-label="Test run results">
              <div class="test-run-head"><span>TEST RUN</span><b>DETERMINISTIC</b></div>
              <div class="test-run-summary">
                <div class="test-run-status is-failed">
                  <i aria-hidden="true">×</i>
                  <span>BEFORE FIX</span>
                  <b>1 FAILED</b>
                </div>
                <span class="test-run-arrow" aria-hidden="true">→</span>
                <div class="test-run-status is-passed">
                  <i aria-hidden="true">✓</i>
                  <span>AFTER FIX</span>
                  <b>3 PASSED</b>
                </div>
              </div>
              <div class="test-run-log">
                <div><small>AXIS_FAULT_RECOVERY</small><b class="is-failed">FAIL</b></div>
                <div><small>RESUME_BATCH_COUNT</small><b class="is-passed">PASS</b></div>
                <div><small>RECOVER_AND_CONTINUE</small><b class="is-passed">PASS</b></div>
              </div>
              <div class="test-run-foot"><span>EXIT CODE</span><b>0 / GREEN</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'merge'" class="modal-merge" aria-label="Vertical Git graph showing issue branches merging into the final feature branch">
              <div class="merge-head"><span>GIT MERGE</span><b>2 ISSUE BRANCHES</b></div>
              <div class="merge-graph-stage">
                <svg class="merge-graph" viewBox="0 0 180 170" role="img" aria-label="Two issue branches merging into the feature branch">
                  <path class="merge-graph-main" d="M 40 10 V 160" />
                  <path class="merge-graph-branch-15" d="M 40 24 H 108 A 12 12 0 0 1 120 36 V 128 A 12 12 0 0 1 108 140 H 40" />
                  <path class="merge-graph-branch-14" d="M 40 40 H 68 A 12 12 0 0 1 80 52 V 92 A 12 12 0 0 1 68 104 H 40" />
                  <circle class="merge-graph-node is-main" cx="40" cy="12" r="3.5" />
                  <circle class="merge-graph-node is-main" cx="40" cy="24" r="3.5" />
                  <circle class="merge-graph-node is-main" cx="40" cy="40" r="3.5" />
                  <circle class="merge-graph-node is-15" cx="120" cy="62" r="3.5" />
                  <circle class="merge-graph-node is-15" cx="120" cy="100" r="3.5" />
                  <circle class="merge-graph-node is-14" cx="80" cy="64" r="3.5" />
                  <circle class="merge-graph-node is-14" cx="80" cy="82" r="3.5" />
                  <circle class="merge-graph-node is-main" cx="40" cy="104" r="3.5" />
                  <circle class="merge-graph-node is-main" cx="40" cy="140" r="3.5" />
                  <circle class="merge-graph-node is-main" cx="40" cy="160" r="3.5" />
                  <text class="merge-graph-main-label" x="48" y="18">feature/axis-recovery</text>
                  <text class="merge-graph-label is-14" x="88" y="50">issue/14</text>
                  <text class="merge-graph-label is-15" x="128" y="50">issue/15</text>
                  <text class="merge-graph-merge-label" x="50" y="152">MERGE</text>
                </svg>
                <div class="merge-result">
                  <small>FINAL FEATURE BRANCH</small>
                  <b>feature/axis-recovery</b>
                  <span>MERGED + READY</span>
                </div>
              </div>
              <div class="merge-command"><span>$ git merge</span><b>issue/14 + issue/15</b></div>
            </div>
            <div v-else-if="selectedStage.illustration === 'pr'" class="modal-pr" aria-label="Pull request readiness review">
              <div class="pr-head"><span>PULL REQUEST</span><b>HUMAN REVIEW</b></div>
              <div class="pr-summary">
                <div class="pr-branch"><small>FROM</small><b>feature/axis-recovery</b></div>
                <span class="pr-arrow" aria-hidden="true">→</span>
                <div class="pr-branch is-target"><small>INTO</small><b>main</b></div>
              </div>
              <ul class="pr-checklist">
                <li><i aria-hidden="true">✓</i><span>Intent and criteria preserved</span><b>PASS</b></li>
                <li><i aria-hidden="true">✓</i><span>Tests + validation attached</span><b>PASS</b></li>
                <li class="is-required"><i aria-hidden="true">!</i><span>Accountable approval</span><b>REQUIRED</b></li>
              </ul>
              <div class="pr-foot"><span>STATUS</span><b>READY FOR HUMAN REVIEW</b></div>
            </div>
            <div v-else-if="selectedStage.kanban" class="modal-kanban" aria-label="Ticket Kanban board">
              <div class="kanban-head"><b>TICKET BOARD</b><small>{{ selectedStage.kanban.length }} COLUMNS</small></div>
              <div class="kanban-columns">
                <section v-for="column in selectedStage.kanban" :key="column.title" class="kanban-column">
                  <header><span>{{ column.title }}</span><b>{{ String(column.tickets.length).padStart(2, '0') }}</b></header>
                  <article
                    v-for="ticket in column.tickets"
                    :key="ticket.id"
                    class="kanban-ticket"
                    :class="{ 'is-selected': ticket.selected }"
                  >
                    <small>{{ ticket.id }}</small>
                    <span v-if="ticket.selected" class="kanban-selected-mark">SELECTED</span>
                    <p>{{ ticket.title }}</p>
                  </article>
                </section>
              </div>
            </div>
            <div v-else-if="selectedStage.signoff" class="modal-signoff" aria-label="Signed off ticket">
              <div class="signoff-bar"><span>HUMAN REVIEW</span><b>SIGNED OFF</b></div>
              <article class="signoff-ticket">
                <header><span>{{ selectedStage.signoff.id }}</span><b>READY FOR BUILD</b></header>
                <h3>{{ selectedStage.signoff.title }}</h3>
                <p>{{ selectedStage.signoff.detail }}</p>
                <div class="signoff-footer"><span>APPROVED</span><i aria-hidden="true">✓</i></div>
              </article>
              <div class="signoff-stamp" aria-hidden="true">SIGNED<br>OFF</div>
            </div>
            <div v-else-if="selectedStage.delegation" class="modal-delegation" aria-label="Implementation agent subagent delegation">
              <div class="delegation-head"><span>DELEGATION MAP</span><b>{{ String(selectedStage.delegation.agents.length).padStart(2, '0') }} SUBAGENTS</b></div>
              <div class="delegation-lead">
                <i class="delegation-lead-icon" aria-hidden="true"></i>
                <div><small>LEAD AGENT</small><b>{{ selectedStage.delegation.lead }}</b></div>
              </div>
              <div class="delegation-agents">
                <article v-for="(agent, agentIndex) in selectedStage.delegation.agents" :key="agent.name" class="delegation-agent">
                  <i class="delegation-agent-mark" aria-hidden="true"></i>
                  <div><small>SUBAGENT {{ String(agentIndex + 1).padStart(2, '0') }}</small><b>{{ agent.name }}</b><span>{{ agent.task }}</span></div>
                </article>
              </div>
              <div class="delegation-foot"><span>PARALLEL TOOL CALLS</span><b>HAND BACK RESULTS</b></div>
            </div>
            <div v-else aria-hidden="true">
              <span>{{ String(selectedStage.index + 1).padStart(2, '0') }}</span>
              <i></i>
              <b>{{ selectedStage.nodeLabel }}</b>
            </div>
            <figcaption>{{ selectedStage.prompt ? 'AI PROMPT' : selectedStage.illustration === 'coverage' ? 'TEST COVERAGE' : selectedStage.illustration === 'physical' ? 'PHYSICAL TEST / VALIDATION' : selectedStage.illustration === 'reasoning' ? 'AI REASONING' : selectedStage.illustration === 'review' ? 'IMPLEMENTATION REVIEW' : selectedStage.illustration === 'test' ? 'FUNCTIONAL + PHYSICAL VALIDATION' : selectedStage.illustration === 'merge' ? 'GIT MERGE' : selectedStage.illustration === 'pr' ? 'PULL REQUEST GATE' : selectedStage.aiOutput ? 'AI OUTPUT' : selectedStage.spec ? 'SPEC PREVIEW' : selectedStage.kanban ? 'TICKET KANBAN' : selectedStage.signoff ? 'TICKET SIGN-OFF' : selectedStage.delegation ? 'SUBAGENT DELEGATION' : 'ILLUSTRATION / SCREENSHOT' }}</figcaption>
          </figure>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.agent-workflow {
  --workflow-bg: #0b0d0e;
  --workflow-panel: #121517;
  --workflow-line: rgba(255, 255, 255, 0.13);
  --workflow-muted: #7e888e;
  --workflow-human: #84cf8a;
  --workflow-agent: #9c7cff;
  --workflow-highlight: #ff7a00;
  --identity-width: 190px;
  --lane-size: 56px;
  --delegation-header-height: 14px;
  --subagent-lane-height: 20px;
  --subagent-indent: 12px;
  --subagent-label-indent: 26px;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 390px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.19);
  color: #f7f8f8;
  background: var(--workflow-bg);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.18);
  font-family: 'IBM Plex Sans', sans-serif;
}

.workflow-switcher {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  min-height: 74px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--workflow-line);
  background: rgba(255, 255, 255, 0.035);
}

.workflow-tab {
  display: grid;
  grid-template-columns: 34px 1fr;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-left: 3px solid transparent;
  color: #aab3b7;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  text-align: left;
}

.workflow-tab:hover,
.workflow-tab:focus-visible {
  outline: none;
  border-color: rgba(255, 122, 0, 0.52);
  background: rgba(255, 122, 0, 0.08);
}

.workflow-tab.is-selected {
  border-color: rgba(255, 122, 0, 0.7);
  border-left-color: var(--workflow-highlight);
  color: #f3f4f4;
  background: rgba(255, 122, 0, 0.12);
}

.workflow-tab-index {
  color: var(--workflow-highlight);
  font: 600 17px/1 'IBM Plex Mono', monospace;
}

.workflow-tab-copy,
.workflow-tab-copy b,
.workflow-tab-copy small {
  transition: opacity 180ms ease;
  display: block;
  min-width: 0;
}

.workflow-tab-copy b,
.workflow-tab-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-tab-copy b {
  color: inherit;
  font: 600 11px/1 'IBM Plex Mono', monospace;
}

.workflow-tab-copy small {
  margin-top: 5px;
  color: var(--workflow-muted);
  font: 500 9px/1 'IBM Plex Mono', monospace;
}

.workflow-tab.is-selected .workflow-tab-copy small {
  color: #d4a77f;
}

.workflow-ownership,
.workflow-columns,
.lane-identity,
.inspector-stage small,
.inspector-index,
.inspector-evidence {
  font-family: 'IBM Plex Mono', monospace;
}

.workflow-ownership {
  display: grid;
  grid-template-columns: 1fr 18px 1fr 18px 1fr;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 16px 0 calc(var(--identity-width) + 16px);
  color: var(--workflow-muted);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-align: center;
}

.workflow-ownership b {
  color: var(--workflow-agent);
  font-weight: 500;
}

.workflow-ownership i {
  height: 1px;
  background: rgba(156, 124, 255, 0.55);
}

.workflow-columns {
  display: grid;
  grid-template-columns: var(--identity-width) repeat(var(--column-count), minmax(0, 1fr));
  align-items: end;
  min-height: 48px;
  padding: 0 14px;
  border-bottom: 1px solid var(--workflow-line);
  background: rgba(255, 255, 255, 0.025);
}

.workflow-columns > button {
  display: grid;
  min-width: 0;
  height: 48px;
  padding: 0;
  align-content: center;
  justify-items: center;
  border: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.workflow-columns > button:hover,
.workflow-columns > button:focus-visible {
  outline: none;
  background: rgba(255, 122, 0, 0.09);
}

.workflow-columns span,
.workflow-columns small {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  line-height: 1.1;
}

.workflow-columns span {
  margin-bottom: 4px;
  color: #9da7ac;
  font-size: 9px;
  font-weight: 600;
}

.workflow-columns small {
  max-width: 100%;
  overflow: hidden;
  color: #e1e6e8;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-columns > button.is-current span,
.workflow-columns > button.is-current small {
  color: var(--workflow-highlight);
}

.workflow-track-stack {
  position: relative;
  padding: 0 14px;
  background:
    linear-gradient(0deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    var(--workflow-bg);
  background-size: 100% var(--lane-size), auto;
}

.workflow-track-stack.has-feedback {
  padding-bottom: 64px;
}

.workflow-lane {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: var(--identity-width) 1fr;
  height: var(--lane-size);
}

.lane-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.lane-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  flex: none;
  place-items: center;
  border: 1px solid currentColor;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.09);
  line-height: 1;
}

.lane-avatar svg {
  width: 19px;
  height: 19px;
}

.lane-identity.is-human .lane-avatar {
  border-radius: 50%;
}

.lane-identity.is-agent .lane-avatar {
  border-radius: 4px;
  color: var(--workflow-agent);
  background: rgba(156, 124, 255, 0.1);
}

.lane-identity > span:last-child,
.lane-identity b,
.lane-identity small {
  display: block;
  min-width: 0;
}

.lane-identity b {
  color: #c7cdd0;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.lane-identity small {
  overflow: hidden;
  margin-top: 4px;
  color: #6d787e;
  font-size: 9px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lane-identity-content,
.lane-main {
  display: block;
  min-width: 0;
}

.lane-identity-content {
  flex: 1;
}

.lane-track {
  position: relative;
  min-width: 0;
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: calc(100% / var(--column-count)) 100%;
}

.workflow-subagent-stack {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-rows: var(--delegation-header-height);
  grid-auto-rows: var(--subagent-lane-height);
  min-width: 0;
  background: rgba(156, 124, 255, 0.025);
  transition: background-color 180ms ease;
}

.workflow-subagent-stack.is-active {
  background: rgba(255, 122, 0, 0.07);
}

.workflow-subagent-branches {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: grid;
  grid-template-columns: var(--identity-width) repeat(var(--column-count), minmax(0, 1fr));
  pointer-events: none;
}

.workflow-subagent-spine {
  display: block;
  width: 1px;
  height: calc(100% - (var(--subagent-lane-height) / 2));
  justify-self: center;
  background: rgba(156, 124, 255, 0.55);
  grid-row: 1;
  transform: translateX(var(--subagent-indent));
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.workflow-subagent-elbow {
  display: block;
  width: calc(var(--subagent-indent) + 1px);
  height: 1px;
  align-self: start;
  justify-self: center;
  background: rgba(156, 124, 255, 0.55);
  grid-row: 1;
  transform: translateX(calc(var(--subagent-indent) / 2));
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.workflow-subagent-stack.is-active .workflow-subagent-spine,
.workflow-subagent-stack.is-active .workflow-subagent-elbow {
  background: var(--workflow-highlight);
  box-shadow: 0 0 6px rgba(255, 122, 0, 0.65);
}

.workflow-subagent-heading {
  display: grid;
  min-width: 0;
  grid-template-columns: var(--identity-width) 1fr;
  width: 100%;
  min-height: var(--delegation-header-height);
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
  box-shadow: inset 0 -1px 0 rgba(156, 124, 255, 0.2);
  position: relative;
  z-index: 1;
}

.workflow-subagent-heading:focus-visible {
  outline: 1px solid var(--workflow-agent);
  outline-offset: -1px;
}

.workflow-subagent-heading > span {
  display: flex;
  grid-column: 1;
  min-width: 0;
  align-items: center;
  gap: 6px;
  padding-left: calc(22px + var(--subagent-label-indent));
}

.workflow-subagent-toggle {
  grid-column: 2;
  align-self: center;
  justify-self: end;
  width: 8px;
  height: 8px;
  margin-right: 12px;
  color: #9d91c5;
  transition: color 180ms ease, transform 180ms ease;
}

.workflow-subagent-stack.is-active .workflow-subagent-toggle,
.workflow-subagent-heading:hover .workflow-subagent-toggle,
.workflow-subagent-heading:focus-visible .workflow-subagent-toggle {
  color: var(--workflow-highlight);
}

.workflow-subagent-stack.is-collapsed .workflow-subagent-toggle {
  transform: rotate(-90deg);
}

.workflow-subagent-heading b,
.workflow-subagent-heading small {
  display: block;
  line-height: 1;
}

.workflow-subagent-heading b {
  overflow: hidden;
  color: var(--workflow-agent);
  font: 600 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-subagent-stack.is-active .workflow-subagent-heading b {
  color: var(--workflow-highlight);
}

.workflow-subagent-heading small {
  color: #b6a8e2;
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.workflow-subagent-lane {
  display: grid;
  min-width: 0;
  grid-template-columns: var(--identity-width) 1fr;
  position: relative;
  z-index: 1;
}

.subagent-lane-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  padding: 0 10px 0 calc(22px + var(--subagent-label-indent));
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.08);
}

.subagent-lane-identity > svg {
  display: block;
  width: 12px;
  height: 12px;
  flex: none;
  color: var(--workflow-agent);
  transition: color 180ms ease, filter 180ms ease;
}

.workflow-subagent-stack.is-active .subagent-lane-identity > svg {
  color: var(--workflow-highlight);
  filter: drop-shadow(0 0 4px rgba(255, 122, 0, 0.55));
}

.subagent-lane-identity > span {
  display: block;
  min-width: 0;
}

.subagent-lane-identity b,
.subagent-lane-identity small {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subagent-lane-identity b {
  color: #ded8f3;
  font: 600 5.5px/1 'IBM Plex Mono', monospace;
}

.subagent-lane-identity small {
  margin-top: 2px;
  color: #9d91c5;
  font: 500 4.5px/1 'IBM Plex Mono', monospace;
}

.subagent-lane-track {
  position: relative;
  min-width: 0;
  background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: calc(100% / var(--column-count)) 100%;
}

.subagent-lane-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--column-count), minmax(0, 1fr));
  align-items: center;
  height: 100%;
}

.subagent-node {
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  min-width: 0;
  place-items: center;
}

.subagent-node .subagent-note {
  position: absolute;
  top: 50%;
  left: calc(50% + (var(--subagent-indent) * 2) + 5px);
  transform: translateY(-50%);
}

.subagent-node::before {
  position: absolute;
  top: 50%;
  left: calc(50% + var(--subagent-indent));
  width: var(--subagent-indent);
  height: 1px;
  background: rgba(156, 124, 255, 0.55);
  content: '';
  transform: translateY(-50%);
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.workflow-subagent-stack.is-active .subagent-node::before {
  background: var(--workflow-highlight);
  box-shadow: 0 0 6px rgba(255, 122, 0, 0.65);
}

.subagent-node i {
  display: block;
  position: relative;
  width: 9px;
  height: 9px;
  border: 1px solid var(--workflow-agent);
  border-radius: 2px;
  background: #181126;
  box-shadow: 0 0 0 3px rgba(156, 124, 255, 0.07);
  transform: translateX(calc(var(--subagent-indent) * 2));
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.workflow-subagent-stack.is-active .subagent-node i {
  border-color: var(--workflow-highlight);
  background: #26180d;
  box-shadow: 0 0 0 3px rgba(255, 122, 0, 0.2), 0 0 14px rgba(255, 122, 0, 0.5);
}

.subagent-node i::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--workflow-agent);
  content: '';
  transform: translate(-50%, -50%);
  transition: background-color 180ms ease;
}

.workflow-subagent-stack.is-active .subagent-node i::before {
  background: #ffb36b;
}

.subagent-note {
  display: inline-flex;
  min-width: 0;
  max-width: calc(100% - 8px);
  align-items: center;
  align-self: center;
  justify-self: start;
  padding: 2px 5px;
  overflow: hidden;
  border: 1px solid rgba(156, 124, 255, 0.3);
  border-radius: 2px;
  color: #9d91c5;
  background: rgba(156, 124, 255, 0.05);
  font: 500 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 180ms ease, border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.workflow-subagent-stack.is-active .subagent-note {
  border-color: rgba(255, 122, 0, 0.72);
  color: #ffb36b;
  background: rgba(255, 122, 0, 0.15);
  box-shadow: 0 0 8px rgba(255, 122, 0, 0.35);
}

.lane-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--column-count), minmax(0, 1fr));
  align-items: center;
  height: 100%;
}

.lane-grid::before {
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  content: '';
  background: rgba(255, 255, 255, 0.14);
}

.stage-node {
  position: relative;
  z-index: 3;
  display: flex;
  width: 100%;
  height: var(--lane-size);
  min-width: 0;
  align-items: center;
  padding: 0;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  border: 0;
  color: #aeb7bb;
  background: transparent;
  cursor: pointer;
  grid-row: 1;
}

.stage-node:focus-visible {
  outline: 1px solid var(--workflow-highlight);
  outline-offset: -1px;
}

.node-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 2px solid var(--workflow-agent);
  border-radius: 4px;
  background: #181126;
  box-shadow: 0 0 0 4px rgba(156, 124, 255, 0.08);
  transform: translate(-50%, -50%);
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.node-dot > svg {
  width: 20px;
  height: 20px;
  color: var(--workflow-agent);
}

.stage-node.is-human .node-dot {
  width: 22px;
  height: 22px;
  border-color: var(--workflow-human);
  border-radius: 50%;
  background: #122116;
  box-shadow: 0 0 0 4px rgba(132, 207, 138, 0.08);
}

.node-dot i::before {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  color: var(--workflow-agent);
  background: currentColor;
  box-shadow: 3px 0 0 currentColor;
  content: '';
}

.node-dot i::after {
  position: absolute;
  top: -3px;
  left: 3px;
  width: 1px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  content: '';
}

.node-dot i {
  position: absolute;
  inset: 0;
  display: block;
  margin: auto;
  width: 8px;
  height: 6px;
  border: 1px solid var(--workflow-agent);
  border-radius: 2px;
  background: rgba(156, 124, 255, 0.16);
  transform: translateY(1.5px);
}

.stage-node.is-human .node-dot i {
  width: 8px;
  height: 4px;
  border: 0;
  border-left: 2px solid var(--workflow-human);
  border-bottom: 2px solid var(--workflow-human);
  border-radius: 0;
  background: transparent;
  transform: rotate(-45deg);
}

.stage-node.is-human .node-dot i::before {
  display: none;
}

.stage-node.is-human .node-dot i::after {
  display: none;
}

.stage-node.is-human .node-dot i {
  color: var(--workflow-human);
}

.stage-node.is-pending {
  opacity: 0.52;
}

.stage-node.is-complete {
  opacity: 0.9;
}

.stage-node.is-agent.is-pending,
.stage-node.is-agent.is-complete {
  opacity: 1;
}

.stage-node.is-active {
  opacity: 1;
}

.stage-node.is-active .node-dot {
  box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.14), 0 0 20px rgba(255, 122, 0, 0.22);
}

.stage-node.is-active.is-human .node-dot {
  border-color: var(--workflow-human);
  background: #122116;
}

.stage-node.is-active.is-agent .node-dot {
  border-color: var(--workflow-highlight);
  background: #26180d;
}

.stage-node.is-active.is-agent .node-dot > svg {
  color: var(--workflow-highlight);
}

.stage-node.is-active.is-agent .node-dot i {
  border-color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.16);
  color: var(--workflow-highlight);
}

.stage-node.is-active.is-agent .node-dot i::before,
.stage-node.is-active.is-agent .node-dot i::after {
  background: var(--workflow-highlight);
}

.stage-node.has-delegation::after {
  position: absolute;
  z-index: 0;
  top: calc(50% + 10px);
  left: 50%;
  width: 1px;
  height: calc(var(--delegation-header-height) - 3px);
  background: rgba(156, 124, 255, 0.55);
  content: '';
  transform: translateX(-50%);
}

.workflow-route-layer {
  position: absolute;
  z-index: 0;
  top: 0;
  right: 14px;
  bottom: 0;
  left: calc(var(--identity-width) + 14px);
  pointer-events: none;
}

.workflow-loop-layer {
  position: absolute;
  z-index: 1;
  top: 0;
  right: 14px;
  bottom: 0;
  left: calc(var(--identity-width) + 14px);
  width: calc(100% - var(--identity-width) - 28px);
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.workflow-loop-path {
  fill: none;
  stroke: var(--workflow-highlight);
  stroke-dasharray: 2 6;
  stroke-linecap: round;
  stroke-width: 1.25;
  opacity: 0.58;
  transition: opacity 180ms ease, stroke-width 180ms ease;
  vector-effect: non-scaling-stroke;
}

.workflow-loop-path.is-phase-1 {
  stroke-dashoffset: 4;
}

.workflow-loop-underlay {
  fill: none;
  stroke: var(--workflow-bg);
  stroke-width: 3.5;
  transition: stroke-width 180ms ease;
  vector-effect: non-scaling-stroke;
}

.workflow-loop.is-active .workflow-loop-path {
  stroke-width: 2;
  opacity: 1;
}

.workflow-feedback-branch.is-active .workflow-loop-path,
.workflow-feedback-shared.is-active .workflow-loop-path {
  stroke-width: 2;
  opacity: 1;
}

.workflow-loop.is-active .workflow-loop-underlay {
  stroke-width: 5;
}

.workflow-feedback-branch.is-active .workflow-loop-underlay,
.workflow-feedback-shared.is-active .workflow-loop-underlay {
  stroke-width: 5;
}

.workflow-loop-arrow-tip {
  fill: var(--workflow-highlight);
  opacity: 0.62;
}

.workflow-loop.is-active .workflow-loop-arrow-tip {
  opacity: 1;
}

.workflow-loop-label {
  fill: var(--workflow-highlight);
  font: 600 6px/1 'IBM Plex Mono', monospace;
  paint-order: stroke;
  stroke: var(--workflow-bg);
  stroke-linejoin: round;
  stroke-width: 7px;
  text-anchor: middle;
  opacity: 0.72;
  transition: opacity 180ms ease;
  vector-effect: non-scaling-stroke;
}

.workflow-loop.is-active .workflow-loop-label {
  opacity: 1;
}

.workflow-feedback-shared.is-active .workflow-loop-label {
  opacity: 1;
}

.workflow-route {
  position: absolute;
  inset: 0;
  opacity: 0.46;
  transition: opacity 180ms ease;
}

.workflow-route.is-complete {
  opacity: 0.92;
}

.workflow-route.is-active {
  opacity: 1;
}
.workflow-route.is-complete .route-label,
.workflow-route.is-active .route-label {
  opacity: 1;
}

.workflow-route.is-human {
  --route-color: var(--workflow-human);
}

.workflow-route.is-agent {
  --route-color: var(--workflow-agent);
}

.route-horizontal,
.route-vertical {
  position: absolute;
  display: block;
  background: var(--route-color);
}

.route-horizontal {
  height: 1px;
}

.route-vertical {
  width: 1px;
  transform: translateX(-0.5px);
}

.route-label {
  position: absolute;
  z-index: 1;
  display: block;
  padding: 1px 3px;
  color: var(--route-color);
  background: rgba(11, 13, 14, 0.9);
  font: 500 5px/1 'IBM Plex Mono', monospace;
  letter-spacing: 0.04em;
  opacity: 0;
  pointer-events: none;
  text-align: center;
  text-transform: uppercase;
  transform: translate(-50%, -100%);
  white-space: nowrap;
}

.workflow-inspector {
  position: relative;
  display: grid;
  margin-top: auto;
  grid-template-columns: 185px 1fr 265px;
  align-items: center;
  gap: 15px;
  min-height: 66px;
  padding: 0 16px;
  border-top: 1px solid var(--workflow-line);
  background: var(--workflow-panel);
}

.inspector-stage {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inspector-index {
  color: var(--workflow-highlight);
  font-size: 15px;
  line-height: 1;
}

.inspector-stage small,
.inspector-stage b {
  display: block;
}

.inspector-stage small {
  color: var(--workflow-muted);
  font-size: 6px;
  line-height: 1;
}

.inspector-stage b {
  margin-top: 6px;
  color: #f2f4f4;
  font-size: 11px;
  line-height: 1;
}

.workflow-inspector p {
  margin: 0;
  color: #b4bdc1;
  font-size: 11px;
  line-height: 1.25;
}

.inspector-evidence {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: #909ba0;
  font-size: 7px;
}

.inspector-evidence span:first-child {
  color: var(--workflow-highlight);
}

.inspector-evidence b {
  overflow: hidden;
  color: #d8dddf;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inspector-evidence i {
  color: var(--workflow-highlight);
  font-style: normal;
}

.workflow-progress {
  position: absolute;
  right: 16px;
  bottom: 0;
  left: 16px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.workflow-progress i {
  display: block;
  height: 100%;
  background: var(--workflow-highlight);
  transition: width 260ms ease;
}

.workflow-modal-backdrop {
  position: absolute;
  z-index: 20;
  display: grid;
  inset: 0;
  padding: 26px;
  place-items: center;
  background: rgba(4, 6, 7, 0.82);
  backdrop-filter: blur(5px);
}

.workflow-modal {
  width: min(760px, 94%);
  overflow: hidden;
  border: 1px solid rgba(255, 122, 0, 0.72);
  background: #121517;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.52);
}

.modal-head {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  border-bottom: 1px solid var(--workflow-line);
  background: #191c1e;
}

.modal-head small,
.modal-copy small,
.modal-owner,
.modal-media figcaption {
  font-family: 'IBM Plex Mono', monospace;
}

.modal-head small {
  color: var(--workflow-highlight);
  font-size: 7px;
}

.modal-head h2 {
  margin: 5px 0 0;
  color: #f7f8f8;
  font-size: 18px;
  line-height: 1;
}

.modal-head button {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d4d9db;
  background: transparent;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.modal-head button:hover,
.modal-head button:focus-visible {
  outline: none;
  border-color: var(--workflow-highlight);
  color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.1);
}

.modal-body {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(210px, 0.8fr);
  min-height: 280px;
}

.modal-copy {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 20px;
}

.modal-owner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-owner > span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--workflow-agent);
  color: var(--workflow-agent);
  background: rgba(156, 124, 255, 0.1);
  font-size: 7px;
}

.modal-owner.is-human > span {
  border-color: var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.09);
}

.modal-owner small,
.modal-owner b {
  display: block;
}

.modal-copy small {
  color: var(--workflow-muted);
  font-size: 7px;
  line-height: 1;
}

.modal-owner b {
  margin-top: 5px;
  color: #e9eced;
  font-size: 9px;
  line-height: 1;
}

.modal-copy section p {
  margin: 8px 0 0;
  color: #c5cccf;
  font-size: 13px;
  line-height: 1.45;
}

.modal-flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  gap: 10px;
}

.modal-flow section {
  min-width: 0;
  padding: 11px;
  border-left: 2px solid var(--workflow-highlight);
  background: rgba(255, 255, 255, 0.035);
}

.modal-flow b {
  display: block;
  margin-top: 7px;
  color: #edf0f1;
  font-size: 10px;
  line-height: 1.3;
}

.modal-flow > i {
  align-self: center;
  color: var(--workflow-highlight);
  font-style: normal;
}

.modal-media {
  display: grid;
  min-width: 0;
  margin: 0;
  padding: 18px;
  grid-template-rows: 1fr auto;
  border-left: 1px solid var(--workflow-line);
  background:
    linear-gradient(135deg, rgba(156, 124, 255, 0.1), transparent 52%),
    #0b0d0e;
}

.modal-media > div {
  display: grid;
  min-height: 190px;
  place-content: center;
  place-items: center;
  border: 1px dashed rgba(255, 255, 255, 0.24);
  color: #d7dcde;
}

.modal-media span {
  color: var(--workflow-highlight);
  font: 500 34px/1 'IBM Plex Mono', monospace;
}

.modal-media i {
  width: 46px;
  height: 1px;
  margin: 14px 0;
  background: var(--workflow-highlight);
}

.modal-media b {
  font: 600 9px/1 'IBM Plex Mono', monospace;
}

.modal-media .modal-terminal {
  display: grid !important;
  min-height: 190px;
  align-content: stretch;
  grid-template-rows: 28px 1fr 20px;
  place-content: stretch;
  place-items: stretch;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: #090b0c;
  text-align: left;
}

.terminal-chrome {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 0 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: #15181a;
}

.terminal-lights {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-media .terminal-light {
  display: block;
  width: 5px;
  height: 5px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  font: 0/0 sans-serif;
}

.terminal-light.is-red {
  background: #e56d5f;
}

.terminal-light.is-yellow {
  background: #d9aa5d;
}

.terminal-light.is-green {
  background: #72bf83;
}

.terminal-chrome small,
.terminal-chrome b,
.terminal-footer small {
  font-family: 'IBM Plex Mono', monospace;
  line-height: 1;
}

.terminal-chrome small {
  overflow: hidden;
  color: #9da6ab;
  font-size: 6px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-chrome b {
  color: var(--workflow-highlight);
  font-size: 6px;
  font-weight: 600;
}

.terminal-body {
  display: grid;
  grid-template-columns: auto 1fr;
  align-content: start;
  gap: 8px;
  min-width: 0;
  padding: 16px 13px 10px;
}

.modal-media .terminal-symbol {
  display: block;
  color: var(--workflow-highlight);
  font: 600 10px/1.55 'IBM Plex Mono', monospace;
}

.terminal-body p {
  min-width: 0;
  margin: 0;
  color: #e1e5e6;
  font: 500 10px/1.55 'IBM Plex Mono', monospace;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.terminal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  padding: 0 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #687278;
}

.terminal-footer small {
  font-size: 5px;
}

.modal-media .terminal-cursor {
  display: block;
  width: 5px;
  height: 9px;
  padding: 0;
  background: var(--workflow-highlight);
  font: 0/0 sans-serif;
  animation: workflow-pulse 900ms ease-in-out infinite;
}

.modal-media .modal-spec {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 10px;
  place-content: stretch;
  place-items: stretch;
  padding: 13px;
  border: 1px solid rgba(255, 122, 0, 0.55);
  background:
    linear-gradient(135deg, rgba(255, 122, 0, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.spec-head,
.spec-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.modal-media .spec-head span,
.modal-media .spec-foot span,
.spec-head b,
.spec-foot b,
.modal-spec dt {
  font-family: 'IBM Plex Mono', monospace;
  line-height: 1;
}

.modal-media .spec-head span {
  color: var(--workflow-highlight);
  font-size: 7px;
}

.spec-head b {
  color: #9da6ab;
  font-size: 6px;
  font-weight: 600;
}

.modal-spec h3 {
  margin: 0;
  color: #f0f2f3;
  font: 600 12px/1.15 'IBM Plex Sans', sans-serif;
}

.modal-spec dl {
  display: grid;
  align-content: start;
  gap: 7px;
  min-width: 0;
  margin: 0;
}

.modal-spec dl > div {
  display: grid;
  grid-template-columns: 35px 1fr;
  gap: 8px;
  min-width: 0;
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-spec dt {
  color: var(--workflow-highlight);
  font-size: 5px;
}

.modal-spec dd {
  min-width: 0;
  margin: 0;
  color: #c9d0d3;
  font-size: 8px;
  line-height: 1.3;
}

.spec-foot {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-media .spec-foot span {
  color: #687278;
  font-size: 5px;
}

.spec-foot b {
  color: var(--workflow-human);
  font-size: 5px;
  font-weight: 600;
}

.modal-media .modal-coverage {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(132, 207, 138, 0.55);
  background:
    linear-gradient(135deg, rgba(132, 207, 138, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.coverage-head,
.coverage-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.coverage-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .coverage-head span {
  color: var(--workflow-human);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.coverage-head b {
  color: #9da6ab;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.coverage-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgba(132, 207, 138, 0.42);
  background: rgba(132, 207, 138, 0.08);
}

.coverage-score {
  display: grid;
  align-content: center;
  gap: 3px;
}

.modal-media .coverage-score strong {
  color: var(--workflow-human);
  font: 600 18px/1 'IBM Plex Mono', monospace;
}

.modal-media .coverage-score small,
.modal-media .coverage-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.coverage-meter {
  min-width: 0;
  height: 7px;
  border: 1px solid rgba(132, 207, 138, 0.45);
  background: rgba(0, 0, 0, 0.24);
}

.modal-media .coverage-meter i {
  display: block;
  width: 92%;
  height: 100%;
  margin: 0;
  background: var(--workflow-human);
}

.coverage-list {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.coverage-list li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 7px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 2px solid var(--workflow-human);
  background: rgba(0, 0, 0, 0.2);
}

.modal-media .coverage-mark {
  display: grid;
  width: 11px;
  height: 11px;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 8px/1 'IBM Plex Sans', sans-serif;
}

.modal-media .coverage-item-label {
  overflow: hidden;
  color: #d8dddf;
  font: 500 7px/1.2 'IBM Plex Sans', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coverage-list b,
.coverage-foot b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.coverage-foot {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .modal-physical-test {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(255, 122, 0, 0.55);
  background:
    linear-gradient(135deg, rgba(255, 122, 0, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.physical-test-head,
.physical-test-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.physical-test-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .physical-test-head span {
  color: var(--workflow-highlight);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.physical-test-head b {
  color: #9da6ab;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.physical-test-state {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 7px;
  border: 1px solid rgba(255, 122, 0, 0.42);
  background: rgba(255, 122, 0, 0.08);
}

.physical-test-machine {
  position: relative;
  height: 42px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: #090b0c;
}

.physical-test-machine::before {
  position: absolute;
  right: 7px;
  bottom: 10px;
  left: 7px;
  height: 2px;
  background: var(--workflow-human);
  content: '';
}

.physical-test-machine::after {
  position: absolute;
  top: 8px;
  bottom: 11px;
  left: 12px;
  width: 2px;
  background: var(--workflow-agent);
  box-shadow: 24px 0 0 rgba(156, 124, 255, 0.38);
  content: '';
}

.modal-media .physical-test-machine span {
  display: block;
  margin: 0;
  padding: 0;
  font: 0/0 sans-serif;
}

.physical-test-machine-axis {
  position: absolute;
  top: 8px;
  left: 10px;
  width: 34px;
  height: 2px;
  background: var(--workflow-highlight);
}

.physical-test-bottle {
  position: absolute;
  bottom: 12px;
  width: 7px;
  height: 10px;
  border: 1px solid var(--workflow-human);
  background: rgba(132, 207, 138, 0.18);
}

.physical-test-bottle.is-first {
  left: 24px;
}

.physical-test-bottle.is-second {
  left: 42px;
  border-color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.18);
}

.physical-test-machine-pulse {
  position: absolute;
  top: 11px;
  right: 9px;
  width: 13px;
  height: 1px;
  background: var(--workflow-human);
  box-shadow: 4px 4px 0 var(--workflow-human), 8px 8px 0 var(--workflow-human);
}

.physical-test-state-copy {
  min-width: 0;
}

.modal-media .physical-test-state-copy small {
  display: block;
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.physical-test-state-copy b {
  display: block;
  margin-top: 5px;
  overflow-wrap: anywhere;
  color: #e1e5e6;
  font: 600 7px/1.25 'IBM Plex Mono', monospace;
}

.physical-test-list {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.physical-test-list li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 7px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 2px solid var(--workflow-human);
  background: rgba(0, 0, 0, 0.2);
}

.physical-test-list li.is-review {
  border-left-color: var(--workflow-highlight);
}

.modal-media .physical-test-list i {
  display: grid;
  width: 11px;
  height: 11px;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 8px/1 'IBM Plex Sans', sans-serif;
  font-style: normal;
}

.modal-media .physical-test-list li.is-review i {
  border-color: var(--workflow-highlight);
  color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.1);
}

.modal-media .physical-test-list span {
  overflow: hidden;
  color: #d8dddf;
  font: 500 7px/1.2 'IBM Plex Sans', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.physical-test-list b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.physical-test-list li.is-review b {
  color: var(--workflow-highlight);
}

.physical-test-foot {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .physical-test-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.physical-test-foot b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .modal-review {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(255, 122, 0, 0.55);
  background:
    linear-gradient(135deg, rgba(255, 122, 0, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.review-head,
.review-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.review-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .review-head span {
  color: var(--workflow-highlight);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.review-head b {
  color: #ffb36b;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.review-verdict {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgba(132, 207, 138, 0.42);
  background: rgba(132, 207, 138, 0.08);
}

.modal-media .review-verdict-mark {
  display: grid;
  width: 20px;
  height: 20px;
  flex: none;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 13px/1 'IBM Plex Sans', sans-serif;
}

.review-verdict div {
  min-width: 0;
}

.review-verdict small {
  display: block;
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.review-verdict b {
  display: block;
  margin-top: 4px;
  color: var(--workflow-human);
  font: 600 8px/1 'IBM Plex Mono', monospace;
}

.review-checklist {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.review-checklist li {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 7px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 2px solid var(--workflow-human);
  background: rgba(0, 0, 0, 0.2);
}

.modal-media .review-checklist i {
  display: grid;
  width: 11px;
  height: 11px;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 8px/1 'IBM Plex Sans', sans-serif;
  font-style: normal;
}

.modal-media .review-checklist span {
  overflow: hidden;
  color: #d8dddf;
  font: 500 7px/1.2 'IBM Plex Sans', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-checklist b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.review-foot {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .review-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.review-foot b {
  color: var(--workflow-highlight);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .modal-test-run {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(255, 122, 0, 0.55);
  background:
    linear-gradient(135deg, rgba(255, 122, 0, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.test-run-head,
.test-run-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.test-run-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .test-run-head span {
  color: var(--workflow-highlight);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.test-run-head b {
  color: #9da6ab;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.test-run-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: 5px;
  min-width: 0;
}

.test-run-status {
  display: grid;
  grid-template-columns: 15px 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 6px;
  min-width: 0;
  padding: 7px 5px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.22);
}

.modal-media .test-run-status i {
  display: grid;
  width: 14px;
  height: 14px;
  grid-row: 1 / -1;
  margin: 0;
  place-items: center;
  border-radius: 50%;
  font: 600 10px/1 'IBM Plex Sans', sans-serif;
  font-style: normal;
}

.modal-media .test-run-status span {
  overflow: hidden;
  color: #aeb7bb;
  font: 600 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.test-run-status b {
  margin-top: 4px;
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.test-run-status.is-failed {
  border-color: rgba(229, 109, 95, 0.55);
  background: rgba(229, 109, 95, 0.08);
}

.modal-media .test-run-status.is-failed i {
  border: 1px solid #e56d5f;
  color: #e56d5f;
  background: rgba(229, 109, 95, 0.12);
}

.test-run-status.is-failed b,
.test-run-log b.is-failed {
  color: #e56d5f;
}

.test-run-status.is-passed {
  border-color: rgba(132, 207, 138, 0.55);
  background: rgba(132, 207, 138, 0.08);
}

.modal-media .test-run-status.is-passed i {
  border: 1px solid var(--workflow-human);
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.12);
}

.test-run-status.is-passed b,
.test-run-log b.is-passed {
  color: var(--workflow-human);
}

.modal-media .test-run-arrow {
  align-self: center;
  color: var(--workflow-highlight);
  font: 600 10px/1 'IBM Plex Mono', monospace;
}

.test-run-log {
  display: grid;
  align-content: start;
  gap: 4px;
  min-width: 0;
  padding: 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.2);
}

.test-run-log div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 5px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.test-run-log div:last-child {
  border-bottom: 0;
}

.modal-media .test-run-log small {
  overflow: hidden;
  color: #c9d0d3;
  font: 500 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.test-run-log b {
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.test-run-foot {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .test-run-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.test-run-foot b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .modal-merge {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(132, 207, 138, 0.48);
  background:
    linear-gradient(135deg, rgba(132, 207, 138, 0.08), transparent 55%),
    #0d1011;
  text-align: left;
}

.merge-head,
.merge-command {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.merge-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .merge-head span {
  color: var(--workflow-highlight);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.merge-head b {
  color: var(--workflow-human);
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.merge-graph-stage {
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
}

.modal-media .merge-graph {
  display: block;
  width: 100%;
  height: 150px;
  min-height: 0;
  overflow: visible;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  background:
    linear-gradient(135deg, rgba(156, 124, 255, 0.07), transparent 58%),
    #0a0c0d;
}

.merge-graph path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.merge-graph-main {
  stroke: var(--workflow-human);
}

.merge-graph-branch-14 {
  stroke: var(--workflow-highlight);
}

.merge-graph-branch-15 {
  stroke: var(--workflow-agent);
}

.merge-graph-branch-16 {
  stroke: #ffb36b;
}

.merge-graph-node {
  fill: #0d1011;
  stroke-width: 2;
}

.merge-graph-node.is-main {
  stroke: var(--workflow-human);
}

.merge-graph-node.is-14 {
  stroke: var(--workflow-highlight);
}

.merge-graph-node.is-15 {
  stroke: var(--workflow-agent);
}

.merge-graph-node.is-16 {
  stroke: #ffb36b;
}

.merge-graph-label,
.merge-graph-main-label {
  fill: #e1e5e6;
  font: 600 7px 'IBM Plex Mono', monospace;
}

.merge-graph-main-label {
  fill: var(--workflow-human);
}

.merge-graph-label.is-14 {
  fill: var(--workflow-highlight);
}

.merge-graph-label.is-15 {
  fill: var(--workflow-agent);
}

.merge-graph-label.is-16 {
  fill: #ffb36b;
}

.merge-graph-merge-label {
  fill: var(--workflow-human);
  font: 600 5px 'IBM Plex Mono', monospace;
}

.merge-graph-detail {
  fill: var(--workflow-muted);
  font: 500 4.5px 'IBM Plex Mono', monospace;
}

.merge-result {
  display: grid;
  gap: 3px;
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid rgba(132, 207, 138, 0.32);
  background: rgba(0, 0, 0, 0.22);
}

.modal-media .merge-result small {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .merge-result b {
  overflow-wrap: anywhere;
  color: #edf0f1;
  font: 600 8px/1.15 'IBM Plex Mono', monospace;
}

.modal-media .merge-result span {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.merge-command {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .merge-command span {
  color: var(--workflow-highlight);
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.merge-command b {
  overflow: hidden;
  color: #c9d0d3;
  font: 500 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-media .modal-pr {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 8px;
  place-content: stretch;
  place-items: stretch;
  padding: 12px;
  border: 1px solid rgba(132, 207, 138, 0.55);
  background:
    linear-gradient(135deg, rgba(132, 207, 138, 0.08), transparent 52%),
    #0d1011;
  text-align: left;
}

.pr-head,
.pr-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.pr-head {
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .pr-head span {
  color: var(--workflow-human);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.pr-head b {
  color: #9da6ab;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.pr-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: stretch;
  gap: 5px;
  min-width: 0;
}

.pr-branch {
  display: grid;
  align-content: start;
  gap: 4px;
  min-width: 0;
  padding: 7px 6px;
  border: 1px solid rgba(255, 122, 0, 0.42);
  border-left: 2px solid var(--workflow-highlight);
  background: rgba(0, 0, 0, 0.22);
}

.pr-branch.is-target {
  border-color: rgba(132, 207, 138, 0.42);
  border-left-color: var(--workflow-human);
}

.modal-media .pr-branch small {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.pr-branch b {
  overflow-wrap: anywhere;
  color: #e1e5e6;
  font: 600 7px/1.2 'IBM Plex Mono', monospace;
}

.modal-media .pr-arrow {
  align-self: center;
  color: var(--workflow-highlight);
  font: 600 10px/1 'IBM Plex Mono', monospace;
}

.pr-checklist {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pr-checklist li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 7px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 2px solid var(--workflow-human);
  background: rgba(0, 0, 0, 0.2);
}

.pr-checklist li.is-required {
  border-left-color: var(--workflow-highlight);
}

.modal-media .pr-checklist i {
  display: grid;
  width: 11px;
  height: 11px;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 8px/1 'IBM Plex Sans', sans-serif;
  font-style: normal;
}

.modal-media .pr-checklist li.is-required i {
  border-color: var(--workflow-highlight);
  color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.1);
}

.modal-media .pr-checklist span {
  overflow: hidden;
  color: #d8dddf;
  font: 500 7px/1.2 'IBM Plex Sans', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pr-checklist b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.pr-checklist li.is-required b {
  color: var(--workflow-highlight);
}

.pr-foot {
  padding-top: 7px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .pr-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.pr-foot b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .modal-kanban {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto 1fr;
  gap: 10px;
  place-content: stretch;
  place-items: stretch;
  padding: 11px;
  border: 1px solid rgba(132, 207, 138, 0.48);
  background:
    linear-gradient(135deg, rgba(132, 207, 138, 0.07), transparent 56%),
    #0d1011;
  text-align: left;
}

.kanban-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .kanban-head b {
  color: var(--workflow-human);
  font: 600 7px/1 'IBM Plex Mono', monospace;
}

.kanban-head small {
  color: #7e888e;
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.kanban-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
}

.kanban-column {
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
  padding: 6px 4px;
  border-top: 2px solid var(--workflow-highlight);
  background: rgba(255, 255, 255, 0.035);
}

.kanban-column:nth-child(2) {
  border-top-color: var(--workflow-agent);
}

.kanban-column:nth-child(3) {
  border-top-color: var(--workflow-human);
}

.kanban-column > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
}

.modal-media .kanban-column > header span {
  overflow: hidden;
  color: #aeb7bb;
  font: 600 5px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-column > header b {
  color: #687278;
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.kanban-ticket {
  min-width: 0;
  padding: 7px 5px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.22);
}

.kanban-ticket.is-selected {
  border-color: var(--workflow-highlight);
  background:
    linear-gradient(135deg, rgba(255, 122, 0, 0.18), transparent 72%),
    rgba(255, 122, 0, 0.08);
  box-shadow: 0 0 0 1px rgba(255, 122, 0, 0.25), 0 0 12px rgba(255, 122, 0, 0.28);
}

.kanban-ticket small {
  color: var(--workflow-highlight);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.kanban-selected-mark {
  float: right;
  color: #ffb36b;
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.kanban-ticket p {
  min-width: 0;
  margin: 6px 0 0;
  color: #d8dddf;
  font-size: 7px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.modal-media .modal-signoff {
  position: relative;
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto 1fr;
  gap: 10px;
  place-content: stretch;
  place-items: stretch;
  overflow: hidden;
  padding: 11px;
  border: 1px solid rgba(132, 207, 138, 0.48);
  background:
    linear-gradient(135deg, rgba(132, 207, 138, 0.08), transparent 56%),
    #0d1011;
  text-align: left;
}

.signoff-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .signoff-bar span {
  color: #aeb7bb;
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .signoff-bar b {
  color: var(--workflow-human);
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.signoff-ticket {
  position: relative;
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(132, 207, 138, 0.6);
  background: rgba(0, 0, 0, 0.24);
  box-shadow: 4px 4px 0 rgba(132, 207, 138, 0.08);
}

.signoff-ticket::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--workflow-human);
  content: '';
}

.signoff-ticket header,
.signoff-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.modal-media .signoff-ticket header span {
  color: var(--workflow-highlight);
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.modal-media .signoff-ticket header b {
  color: #aeb7bb;
  font: 600 5px/1 'IBM Plex Mono', monospace;
  white-space: nowrap;
}

.signoff-ticket h3 {
  margin: 5px 0 0;
  color: #f0f2f3;
  font: 600 12px/1.15 'IBM Plex Sans', sans-serif;
}

.signoff-ticket p {
  min-width: 0;
  margin: 0;
  color: #c9d0d3;
  font-size: 8px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.signoff-footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .signoff-footer span {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .signoff-footer i {
  display: grid;
  width: 14px;
  height: 14px;
  margin: 0;
  place-items: center;
  border: 1px solid var(--workflow-human);
  border-radius: 50%;
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.1);
  font: 600 9px/1 'IBM Plex Sans', sans-serif;
}

.signoff-stamp {
  position: absolute;
  right: 17px;
  bottom: 30px;
  padding: 4px 5px;
  border: 1px solid rgba(132, 207, 138, 0.8);
  color: var(--workflow-human);
  font: 600 6px/1.15 'IBM Plex Mono', monospace;
  letter-spacing: 0;
  text-align: center;
  transform: rotate(-8deg);
}

.modal-media .modal-delegation {
  display: grid !important;
  min-height: 190px;
  align-content: start;
  grid-template-rows: auto auto 1fr auto;
  gap: 7px;
  place-content: stretch;
  place-items: stretch;
  overflow: hidden;
  padding: 10px;
  border: 1px solid rgba(156, 124, 255, 0.52);
  background:
    linear-gradient(135deg, rgba(156, 124, 255, 0.08), transparent 56%),
    #0d1011;
  text-align: left;
}

.delegation-head,
.delegation-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.delegation-head {
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .delegation-head span {
  color: #aeb7bb;
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.modal-media .delegation-head b {
  color: var(--workflow-agent);
  font: 600 6px/1 'IBM Plex Mono', monospace;
}

.delegation-lead {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 6px 7px;
  border: 1px solid rgba(156, 124, 255, 0.46);
  background: rgba(156, 124, 255, 0.08);
}

.modal-media .delegation-lead-icon {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  flex: none;
  margin: 0;
  border: 1px solid var(--workflow-agent);
  border-radius: 50%;
  color: var(--workflow-agent);
  background: #171126;
  font-style: normal;
}

.delegation-lead-icon::before {
  position: absolute;
  top: 7px;
  left: 5px;
  width: 6px;
  height: 4px;
  border: 1px solid currentColor;
  border-radius: 1px;
  background: rgba(156, 124, 255, 0.12);
  content: '';
}

.delegation-lead-icon::after {
  position: absolute;
  top: 4px;
  left: 8px;
  width: 1px;
  height: 2px;
  background: currentColor;
  content: '';
}

.delegation-lead small,
.delegation-agent small {
  display: block;
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .delegation-lead b {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #edf0f1;
  font: 600 7px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delegation-agents {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  min-width: 0;
}

.delegation-agent {
  display: grid;
  grid-template-columns: 7px 1fr;
  align-content: start;
  gap: 5px;
  min-width: 0;
  padding: 6px 5px;
  border: 1px solid rgba(156, 124, 255, 0.32);
  border-left: 2px solid var(--workflow-agent);
  background: rgba(0, 0, 0, 0.22);
}

.modal-media .delegation-agent-mark {
  display: block;
  width: 6px;
  height: 6px;
  margin: 3px 0 0;
  border: 1px solid var(--workflow-agent);
  border-radius: 50%;
  background: rgba(156, 124, 255, 0.16);
  font-style: normal;
}

.modal-media .delegation-agent b {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #e1e5e6;
  font: 600 6px/1 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-media .delegation-agent span {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #9da6ab;
  font: 500 5px/1.2 'IBM Plex Mono', monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delegation-foot {
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.modal-media .delegation-foot span {
  color: var(--workflow-muted);
  font: 500 5px/1 'IBM Plex Mono', monospace;
}

.modal-media .delegation-foot b {
  color: var(--workflow-human);
  font: 600 5px/1 'IBM Plex Mono', monospace;
}

.modal-reasoning {
  position: relative;
  display: block !important;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 48%, rgba(156, 124, 255, 0.18), transparent 30%),
    linear-gradient(135deg, rgba(255, 122, 0, 0.08), transparent 56%);
}

.reasoning-core {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: grid;
  width: 68px;
  height: 68px;
  place-content: center;
  place-items: center;
  border: 1px solid var(--workflow-agent);
  border-radius: 50%;
  background: #171126;
  box-shadow: 0 0 0 7px rgba(156, 124, 255, 0.08), 0 0 24px rgba(156, 124, 255, 0.18);
  transform: translate(-50%, -50%);
}

.reasoning-core::before {
  position: absolute;
  inset: 7px;
  border: 1px solid rgba(255, 122, 0, 0.65);
  border-radius: 50%;
  content: '';
}

.reasoning-core i,
.reasoning-core b {
  position: relative;
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-style: normal;
  line-height: 1;
}

.reasoning-core i {
  color: var(--workflow-highlight);
  font-size: 12px;
}

.reasoning-core b {
  margin-top: 5px;
  color: #f0f2f3;
  font-size: 6px;
}

.modal-reasoning .reasoning-node,
.modal-reasoning .reasoning-output {
  position: absolute;
  z-index: 1;
  padding: 5px 6px;
  border: 1px solid rgba(255, 122, 0, 0.6);
  color: var(--workflow-highlight);
  background: rgba(255, 122, 0, 0.08);
  font: 600 6px/1 'IBM Plex Mono', monospace;
  letter-spacing: 0.05em;
  text-align: center;
}

.reasoning-node-why {
  top: 20px;
  left: 16px;
}

.reasoning-node-edge {
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
}

.reasoning-node-risk {
  bottom: 20px;
  left: 16px;
}

.modal-reasoning .reasoning-output {
  right: 16px;
  top: 50%;
  bottom: auto;
  min-width: 52px;
  border-color: rgba(132, 207, 138, 0.65);
  color: var(--workflow-human);
  background: rgba(132, 207, 138, 0.08);
  transform: translateY(-50%);
}

.reasoning-connector {
  position: absolute;
  z-index: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 122, 0, 0.7), rgba(156, 124, 255, 0.75));
  transform-origin: left center;
}

.reasoning-connector-why {
  top: 40px;
  left: 50px;
  width: 52px;
  transform: rotate(25deg);
}

.reasoning-connector-edge {
  top: 50%;
  left: 50px;
  width: 52px;
  transform: translateY(-0.5px);
}

.reasoning-connector-risk {
  bottom: 40px;
  left: 50px;
  width: 52px;
  transform: rotate(-25deg);
}

.reasoning-connector-output {
  top: 50%;
  right: 69px;
  left: auto;
  width: 24px;
  background: linear-gradient(90deg, rgba(156, 124, 255, 0.75), rgba(132, 207, 138, 0.7));
  transform: translateY(-0.5px);
}

.modal-media figcaption {
  padding-top: 9px;
  color: var(--workflow-muted);
  font-size: 6px;
  text-align: right;
}

@keyframes workflow-pulse {
  50% { opacity: 0.35; }
}

@media (max-width: 760px) {
  .agent-workflow {
    --identity-width: 112px;
  }

  .workflow-head {
    align-items: flex-start;
    padding: 10px 12px;
    flex-direction: column;
  }

  .workflow-head-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .workflow-ownership {
    padding-left: calc(var(--identity-width) + 12px);
  }

  .workflow-switcher {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .workflow-tab {
    min-height: 34px;
  }

  .workflow-inspector {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 12px;
  }

  .workflow-inspector p {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .inspector-stage {
    grid-row: 2;
  }

  .inspector-evidence {
    grid-row: 2;
  }

  .workflow-modal-backdrop {
    padding: 12px;
  }

  .workflow-modal {
    width: 100%;
  }

  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-media {
    display: none;
  }
}
</style>