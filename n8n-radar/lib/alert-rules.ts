import type { Alert, N8nExecution, WorkflowHealth } from "./types"

let alertCounter = 0
function makeAlert(partial: Omit<Alert, "id" | "detectedAt">): Alert {
  return {
    ...partial,
    id: `alert-${++alertCounter}-${Date.now()}`,
    detectedAt: new Date().toISOString(),
  }
}

interface RuleInput {
  healths: WorkflowHealth[]
  executions: N8nExecution[]
  allExecutions: Record<string, N8nExecution[]>
}

// Regra 1: Clint sem execução bem-sucedida nas últimas 2h
function checkClintDown({ allExecutions }: RuleInput): Alert | null {
  const clintId = "uaNVMiZ1Krm0Nx5V"
  const execs = allExecutions[clintId] ?? []
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
  const recentSuccess = execs.find(
    (e) => e.status === "success" && new Date(e.startedAt).getTime() > twoHoursAgo
  )
  if (!recentSuccess) {
    return makeAlert({
      workflowId: clintId,
      workflowName: "Clint",
      type: "dependency_down",
      severity: "critical",
      message: "Clint sem execução bem-sucedida nas últimas 2h — 8 workflows em risco",
    })
  }
  return null
}

// Regra 2: DataBase levando >3x tempo médio histórico
function checkDatabaseDegraded({ allExecutions }: RuleInput): Alert | null {
  const dbId = "BHtGzCTT2vy5FZcv"
  const execs = allExecutions[dbId] ?? []
  if (execs.length < 5) return null

  const durations = execs
    .filter((e) => e.stoppedAt)
    .map((e) => new Date(e.stoppedAt!).getTime() - new Date(e.startedAt).getTime())

  if (durations.length < 2) return null
  const avg = durations.slice(1).reduce((a, b) => a + b, 0) / (durations.length - 1)
  if (durations[0] > avg * 3) {
    return makeAlert({
      workflowId: dbId,
      workflowName: "DataBase",
      type: "retry_storm",
      severity: "warning",
      message: `DataBase levando ${Math.round(durations[0] / 1000)}s — ${Math.round(durations[0] / avg)}x acima da média`,
    })
  }
  return null
}

// Regra 3: Execução waiting >60min
function checkWaitingStuck({ executions }: RuleInput): Alert[] {
  const stuck = executions.filter((e) => {
    if (e.status !== "waiting") return false
    return Date.now() - new Date(e.startedAt).getTime() > 60 * 60 * 1000
  })
  return stuck.map((e) =>
    makeAlert({
      workflowId: e.workflowId,
      workflowName: e.workflowName ?? e.workflowId,
      type: "waiting_stuck",
      severity: "warning",
      message: `Execução ${e.id} presa em "waiting" há ${Math.round((Date.now() - new Date(e.startedAt).getTime()) / 60000)}min`,
    })
  )
}

// Regra 4: Retry storm — execução >3x tempo médio com retryOnFail
function checkRetryStorm({ healths }: RuleInput): Alert[] {
  return healths
    .filter((h) => h.retryStormDetected)
    .map((h) =>
      makeAlert({
        workflowId: h.workflowId,
        workflowName: h.workflowName,
        type: "retry_storm",
        severity: "critical",
        message: `Retry storm em "${h.workflowName}" — execução >3x tempo médio`,
      })
    )
}

// Regra 5: Schedule perdido >25h (tolerância 1h)
function checkScheduleMissed({ allExecutions }: RuleInput): Alert[] {
  const CRITICAL_SCHEDULES: Record<string, string> = {
    "g9KlDnuejEIwTgqM":       "Confirmação Reunião",
    "AKRzlVc0vEymM1yh":        "ACCOUNT DESCONECTED",
    "-EvqkHvH7rbMnsnClply7":  "Atualizar Parcelas",
    "nnu7KRKq3ppy9KnqRHz4r":  "[Sendflow] Insert Campaigns",
    "XBuPFIhlbfET10nN":        "Trafego API META",
  }

  const alerts: Alert[] = []
  for (const [id, name] of Object.entries(CRITICAL_SCHEDULES)) {
    const execs = allExecutions[id] ?? []
    const lastSuccess = execs.find((e) => e.status === "success")
    if (!lastSuccess) {
      alerts.push(makeAlert({ workflowId: id, workflowName: name, type: "schedule_missed", severity: "warning", message: `${name}: sem execução bem-sucedida registrada` }))
      continue
    }
    const elapsed = Date.now() - new Date(lastSuccess.startedAt).getTime()
    if (elapsed > 25 * 60 * 60 * 1000) {
      alerts.push(makeAlert({
        workflowId: id,
        workflowName: name,
        type: "schedule_missed",
        severity: "warning",
        message: `${name}: não executou há ${Math.round(elapsed / 3600000)}h (esperado: 24h)`,
      }))
    }
  }
  return alerts
}

// Regra 6: Avisos silencioso — 0 execuções nas últimas 24h
function checkAvisosSilent({ allExecutions }: RuleInput): Alert | null {
  const id = "iqGTMtrWFjjZsJbp"
  const execs = allExecutions[id] ?? []
  const yesterday = Date.now() - 24 * 60 * 60 * 1000
  const recent = execs.filter((e) => new Date(e.startedAt).getTime() > yesterday)
  if (recent.length === 0) {
    return makeAlert({
      workflowId: id,
      workflowName: "Avisos",
      type: "avisos_silent",
      severity: "warning",
      message: "Workflow Avisos com 0 execuções nas últimas 24h — incomum",
    })
  }
  return null
}

// Regra 7: [Sendflow] Member com >3 execuções simultâneas (loop)
function checkSendflowLoop({ executions }: RuleInput): Alert | null {
  const id = "nKRnoyp65q8tN1B_xEdof"
  const running = executions.filter((e) => e.workflowId === id && e.status === "running")
  if (running.length > 3) {
    return makeAlert({
      workflowId: id,
      workflowName: "[Sendflow] Member",
      type: "sendflow_loop",
      severity: "critical",
      message: `[Sendflow] Member com ${running.length} execuções simultâneas — risco de loop infinito`,
    })
  }
  return null
}

export function runAllRules(data: RuleInput): Alert[] {
  const alerts: Alert[] = []

  const r1 = checkClintDown(data)
  if (r1) alerts.push(r1)

  const r2 = checkDatabaseDegraded(data)
  if (r2) alerts.push(r2)

  alerts.push(...checkWaitingStuck(data))
  alerts.push(...checkRetryStorm(data))
  alerts.push(...checkScheduleMissed(data))

  const r6 = checkAvisosSilent(data)
  if (r6) alerts.push(r6)

  const r7 = checkSendflowLoop(data)
  if (r7) alerts.push(r7)

  return alerts
}
