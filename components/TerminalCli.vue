<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useSlideContext } from '@slidev/client'

type LogMessage = {
  dateTime: string
  level: 'INFO' | 'ERROR'
  errorText: string
}

type TerminalCommand = {
  time: string
  command: string
  result: string
  logMessages?: LogMessage[]
  multiline?: boolean
}

const helpOutput = `as - B&R Automation Studio CLI

USAGE
  as [global-options] <command> [subcommand ...] [args] [options]

COMMANDS

  PROJECT
  project    - Project operations
    status - Show project info (name, path, config, CPU)
    reload - Reload project from disk (picks up hardware/logical changes made in AS)
    close - Close the project
  config     - Configuration management
    list - List all configurations
    tree - Show configuration object tree
    set-active - Switch active configuration
    read - Read a config file
    set - Set values in a config file
    cpu - Show CPU software configuration (tasks & libraries)
    scan - Scan directory for all config files
    search - Search config settings by keyword
    schema - Configuration schemas
      list - List config file types provided by installed technology packages (optionally filter by package)
      read - Read the schema (allowed nodes/defaults) for a technology-package config type (valid under Physical/<Config>/<CPU>/<TP>), e.g. .axis/.uacfg
  logical    - Logical view & mutations
    list - List all logical view objects
    catalog - Show available object types
    add - Add a new object
    remove - Remove an object
    rename - Rename an object
    set-description - Set object description
    undo - Undo last mutation
    redo - Redo last undone mutation
  library    - Installed library management
    list - List all installed B&R libraries and versions
    add - Add a library using Automation Studio dependency resolution
    replace - Replace a library with an exact installed version
  tp         - Technology Package management
    list - List all installed Technology Packages and versions
    add - Add a Technology Package or select an optional Module
    replace - Replace a selected Technology Package or Module version
  hardware   - Hardware operations
    list - List hardware topology
    module - Hardware module inventory
      list - List hardware modules with type and version
    read - Read hardware module configuration
    io-mappings - List a hardware module's permitted IO channel mappings (name, data type, direction) for use in .iom file
    connections - List a hardware module's possible connections (connectors, routing) for connecting it with other modules in the .hw file
    set - Set hardware module parameters

  BUILD & RUN
  build      - Build project
    (default) - Build project (default: incremental)
    rebuild - Full rebuild
    clean - Clean build artifacts (default: Cleans the Binaries folder and parts of the Temp folder)
    ruc - Build RUC package
    pip - Create PIP (offline install package)
    sim - Build and install to ARSim simulation
  sim        - Simulation mode
    enable - Enable simulation on the CPU
    disable - Disable simulation on the CPU
    status - Query running ARSim status via service interface
    stop - Stop running ARSim via service interface (loader stays)
    restart - Restart running ARSim via service interface
    license - Query ARSim license status (AR6+)
    timefactor - Read or set ARSim TimeZoom factor (-3..+3)
    step - Single-step control: <ticks> | resume | exit | query
    uptime - Query ARSim microsecond counter (AR A4.92+)
  transfer   - Transfer to PLC
    probe - Probe for connected PLCs
    online - Transfer to PLC online

  ONLINE (PLC)
  plc        - PLC connection (via PVI)
    connect - Connect to PLC
    disconnect - Disconnect from PLC
    status - Show PLC connection status
  var        - PLC variables (via PVI)
    read - Read a variable value
    write - Write a variable value
    force - Force a variable value
    unforce - Unforce a variable
    list - List variables
    list-forced - List all currently forced IO-mapped variables. This function is session-scoped. Forces made in AS or before the CLI session are not included.
    type - Get variable type info
    read-multi - Read multiple variables
    resolve-task - Resolve logical scope to PVI task name
    watch - Variable watch operations
      start - Start watching variables (cyclic refresh)
      poll - Poll watched variable values
      stop - Stop watching variables
  logbook    - PLC logbook operations
    list - List available logbooks
    read - Read logbook entries
    export - Export logbook to file
  io         - IO data point operations
    list - List all IO points
    read - Read an IO point value
    read-all - Read all IO points
    force - Force an IO point value
    unforce - Unforce an IO point
  network    - Network discovery (SNMP)
    scan - Scan for B&R devices on network
    adapters - List network adapters
  module     - PLC module operations
    list - List all modules on the PLC
    upload - Upload (read) a module from PLC to local file

  SYMBOLS
  symbol     - Symbol intelligence
    search - Search for symbols by name
    resolve - Resolve a symbol by full name
    resolve-path - Resolve a dotted path in scope
    members - List members of a type/struct
    scopes - List all available scopes
    variables - List variables in a scope

  SYSTEM
  daemon     - Manage background daemons
    start - Start daemon for a project
    stop - Stop running daemon
    status - List all running daemons
  pvimanager - Manage the system-wide PVI Manager
    start - Start PVI Manager
    stop - Stop PVI Manager (If PVI is elevated, terminal needs to be elevated too)
    restart - Restart PVI Manager (If PVI is elevated, terminal needs to be elevated too)
    status - Show PVI Manager status
  version    - Show version info
    (default) - Display as version

GLOBAL OPTIONS
  --project <path.apj>   Project file (auto-detected from cwd)
  --bin-dir <path>       AS bin directory (auto-detected)
  --format json|text     Output format (default: text)
  --timeout <ms>         Command timeout (default: 300000)
  --verbose              Debug output to stderr
  --help, -h             Show help for commands and subcommands
  --version, -V          Show version info

DAEMON
  A background daemon is started automatically on first command.
  Each project gets its own daemon. Auto-exits after 30 min idle.

EXAMPLES
  as project status
  as config list
  as config schema list
  as logical list
  as logical catalog --parent MainPackage
  as logical add StProgram MyProgram --parent MainPackage
  as build rebuild
  as transfer online --ip 10.0.0.1
  as symbol search "motor" --scope "modules.main.main"
  as symbol resolve-path "interface.status" --scope "modules.main.main"
  as plc connect --ip 10.0.0.1
  as var read gTemperature --task Cyclic
  as logbook read --count 20 --level error
  as io list
  as network scan
  as hardware read X20CP1686X
  as hardware set X20CP1686X "Simulation=1"
  as config scan Physical/Config1/X20CP1686X

AI/AGENT USAGE
  Use --format json for machine-parseable output.
  Use 'as help --format json' to get full command metadata.
  Typical workflow:
    1. as symbol scopes                          # discover scopes
    2. as symbol variables --scope <scope>       # list variables
    3. as symbol resolve-path <path> --scope <s> # inspect types
    4. as symbol members <path> --scope <s>      # autocomplete
    5. as build                                  # build & check

Run 'as help <command> [subcommand...]' for details on a specific command.`

const commands: TerminalCommand[] = [
  { time: '09:40:59', command: 'as --help', result: helpOutput, multiline: true },
  { time: '09:41:02', command: 'as project status', result: 'name=DevOpsDemo · config=Config1 · cpu=X20CP1686X' },
  { time: '09:41:09', command: 'as sim enable', result: 'simulation=enabled · cpu=X20CP1686X' },
  { time: '09:41:18', command: 'as build sim', result: 'success=true · 0 errors · 5 warnings · installed to ARsim' },
  { time: '09:41:29', command: 'as plc connect --ip 127.0.0.1', result: 'connected=true · target=127.0.0.1' },
  { time: '09:41:46', command: 'as var read gProductionCount --task Cyclic', result: 'name=gProductionCount · value=17 · typeName=UDINT' },
  { time: '09:42:05', command: 'as var write gCmdClear --task Cyclic --value 1', result: 'name=gCmdClear · written=true · value=1' },
  {
    time: '09:42:21',
    command: 'as logbook read --count 20 --level error',
    result: 'logbook=$arlogsys · entries=3',
    logMessages: [
      { dateTime: '09:41:48', level: 'INFO', errorText: 'download to ArSim' },
      { dateTime: '09:41:52', level: 'INFO', errorText: 'Opcua server ready' },
      { dateTime: '09:42:03', level: 'ERROR', errorText: 'MpAxis gAxisConveyor · # -1067378809 [6023]: Voltage sag at controller enable input' },
    ],
  },
  { time: '09:42:37', command: 'as build pip', result: 'pip created · ReleaseCandidate/' },
]

// Section headings in the help text (PROJECT, BUILD & RUN, ...) are highlighted.
const helpLines = helpOutput.split('\n').map(text => ({
  text,
  category: /^ {2}[A-Z][A-Z &()]*$/.test(text),
}))

const { $clicks } = useSlideContext()
const currentStep = computed(() => Math.min(Math.max($clicks.value - 1, -1), commands.length - 1))
const readyThrough = ref(-1)
let resultTimer: ReturnType<typeof setTimeout> | undefined

watch(currentStep, (step) => {
  if (resultTimer)
    clearTimeout(resultTimer)

  if (step < 0) {
    readyThrough.value = -1
    return
  }

  readyThrough.value = step - 1
  resultTimer = setTimeout(() => {
    if (currentStep.value === step)
      readyThrough.value = step
  }, 900)
}, { immediate: true })

onBeforeUnmount(() => {
  if (resultTimer)
    clearTimeout(resultTimer)
})

const visibleCommands = computed(() => commands
  .slice(0, currentStep.value + 1)
  .map((entry, index) => ({ entry, index }))
  .filter(({ index }) => currentStep.value < 1 || index > 0))
</script>

<template>
  <div class="evidence-terminal">
    <div class="terminal-title"><i></i><i></i><i></i><span>AS CLI</span><small>COMMAND PROMPT</small></div>
    <div class="terminal-body">
      <div v-if="currentStep < 0" class="terminal-idle">
        <div>[AsBackend] Spawned daemon PID &lt;pid&gt; for &lt;absolute path&gt;\DevOpsDemo.apj</div>
        <div>[as-cli] Waiting for daemon to initialize (this may take up to 2 minutes)...</div>
      </div>
      <div v-for="item in visibleCommands" :key="item.entry.command" class="terminal-entry">
        <div class="terminal-command">
          <span class="time">{{ item.entry.time }}</span>
          <span class="op">[as]</span>
          <b>{{ item.entry.command }}</b>
          <em :class="item.index <= readyThrough ? 'ok' : 'pending'">{{ item.index <= readyThrough ? 'DONE' : '...' }}</em>
        </div>
        <div v-if="item.index <= readyThrough" class="terminal-output">
          <span class="output-label">OUT</span>
          <div v-if="item.entry.logMessages" class="logbook-output">
            <strong>{{ item.entry.result }}</strong>
            <table>
              <thead><tr><th>DATE/TIME</th><th>LEVEL</th><th>LOG MESSAGE</th></tr></thead>
              <tbody>
                <tr v-for="message in item.entry.logMessages" :key="`${message.dateTime}-${message.errorText}`">
                  <td>{{ message.dateTime }}</td><td :class="`log-level-${message.level.toLowerCase()}`">{{ message.level }}</td><td>{{ message.errorText }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre v-else-if="item.entry.multiline" class="help-output"><span
            v-for="(line, lineIndex) in helpLines"
            :key="lineIndex"
            :class="{ 'help-category': line.category }"
          >{{ line.text }}
</span></pre>
          <b v-else>{{ item.entry.result }}</b>
        </div>
      </div>
    </div>
    <div class="terminal-footer">AS CLI GIVES CONTROLLED ACTION + OBSERVATION</div>
  </div>
</template>

<style scoped>
.evidence-terminal {
  display: grid;
  grid-template-rows: 42px minmax(0, 1fr) auto;
  height: 514px;
}

.terminal-title {
  height: auto;
}

.terminal-body {
  min-height: 0;
  overflow-y: auto;
}

.terminal-body > .terminal-idle,
.terminal-body > .terminal-entry {
  display: block;
  min-height: 0;
  border-bottom: 0;
}

.terminal-idle,
.terminal-command {
  display: grid;
  grid-template-columns: 70px 100px 1fr 80px;
  column-gap: 6px;
  align-items: center;
  min-height: 24px;
  font: 500 8px/1 'IBM Plex Mono', monospace;
}

.terminal-idle {
  padding: 8px 0;
  color: #aeb6bb;
  font: 500 8px/1.35 'IBM Plex Mono', monospace;
}

.terminal-idle div + div {
  margin-top: 5px;
}

.terminal-command {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.terminal-command em.pending {
  color: #8f989e;
  animation: terminal-pending 0.9s steps(2, end) infinite;
}

.terminal-output {
  display: grid;
  grid-template-columns: 70px 1fr;
  align-items: start;
  min-height: 20px;
  padding: 4px 0 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  color: #56bb7a;
  font: 500 8px/1.25 'IBM Plex Mono', monospace;
}

.output-label {
  color: #596267;
}

.terminal-output b,
.logbook-output strong {
  color: #56bb7a;
  font-weight: 600;
}

.help-output {
  max-width: 100%;
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  color: #aeb6bb;
  font: 500 6px/1.2 'IBM Plex Mono', monospace;
}

.help-category {
  color: #ff7a00;
  font-weight: 700;
}

.logbook-output table {
  width: 100%;
  margin-top: 7px;
  border-collapse: collapse;
  color: #aeb6bb;
  font: 500 7px/1.25 'IBM Plex Mono', monospace;
}

.logbook-output th,
.logbook-output td {
  padding: 3px 6px 3px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.logbook-output th {
  color: #596267;
  font-weight: 500;
}

.logbook-output td:first-child {
  color: #70797e;
}

.logbook-output .log-level-error {
  color: var(--br-orange);
}

@keyframes terminal-pending {
  50% { opacity: 0.35; }
}
</style>