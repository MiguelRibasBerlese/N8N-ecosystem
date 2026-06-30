import type { N8nWorkflow, N8nExecution, WorkflowHealth, HealthLevel, HealthSummary } from "./types"

export const CRITICAL_WORKFLOW_IDS = [
  "uaNVMiZ1Krm0Nx5V", // Clint — 8+ dependentes
  "BHtGzCTT2vy5FZcv", // DataBase — microserviço central
  "iqGTMtrWFjjZsJbp", // Avisos — sistema de notificação
]

export const SCHEDULE_WORKFLOW_IDS = [
  "AKRzlVc0vEymM1yh",        // ACCOUNT DESCONECTED
  "g9KlDnuejEIwTgqM",        // Confirmação Reunião — CRÍTICO
  "-EvqkHvH7rbMnsnClply7",   // Atualizar Parcelas
  "nnu7KRKq3ppy9KnqRHz4r",   // [Sendflow] Insert Campaigns
  "XBuPFIhlbfET10nN",        // Trafego API META
]

const MIN_EXECUTIONS_FOR_PENALTY = 5

function levelFromScore(score: number): HealthLevel {
  if (score >= 80) return "healthy"
  if (score >= 50) return "warning"
  return "critical"
}

export function calculateHealthScore(
  workflow: N8nWorkflow,
  executions: N8nExecution[]
): WorkflowHealth {
  const isDependencyNode = CRITICAL_WORKFLOW_IDS.includes(workflow.id)
  const penaltyMultiplier = isDependencyNode ? 1.5 : 1

  const recent24h = executions.filter((e) => {
    const started = new Date(e.startedAt).getTime()
    return Date.now() - started < 24 * 60 * 60 * 1000
  })

  const errorCount = recent24h.filter((e) => e.status === "error").length
  const errorRate24h =
    recent24h.length >= MIN_EXECUTIONS_FOR_PENALTY
      ? errorCount / recent24h.length
      : 0

  const waitingExecs = executions.filter((e) => e.status === "waiting")
  const waitingStuck = waitingExecs.filter((e) => {
    const elapsed = Date.now() - new Date(e.startedAt).getTime()
    return elapsed > 60 * 60 * 1000
  })

  // Detect retry storm: execution duration > 3x average
  const durations = executions
    .filter((e) => e.stoppedAt)
    .map((e) => new Date(e.stoppedAt!).getTime() - new Date(e.startedAt).getTime())

  const avgDuration = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0

  const lastExec = executions[0]
  const lastDuration = lastExec?.stoppedAt
    ? new Date(lastExec.stoppedAt).getTime() - new Date(lastExec.startedAt).getTime()
    : 0

  const retryStormDetected = avgDuration > 0 && lastDuration > avgDuration * 3

  const issues: string[] = []
  let score = 100

  if (errorRate24h > 0.2) {
    const penalty = Math.round(30 * penaltyMultiplier)
    score -= penalty
    issues.push(`Taxa de erro crítica: ${Math.round(errorRate24h * 100)}%`)
  } else if (errorRate24h > 0.05) {
    const penalty = Math.round(20 * penaltyMultiplier)
    score -= penalty
    issues.push(`Taxa de erro elevada: ${Math.round(errorRate24h * 100)}%`)
  }

  if (retryStormDetected) {
    const penalty = Math.round(25 * penaltyMultiplier)
    score -= penalty
    issues.push("Retry storm detectado — execução >3x tempo médio")
  }

  const stuckPenalty = Math.min(waitingStuck.length * Math.round(20 * penaltyMultiplier), 40)
  if (stuckPenalty > 0) {
    score -= stuckPenalty
    issues.push(`${waitingStuck.length} execução(ões) presa(s) >60min`)
  }

  if (lastExec?.status === "error") {
    const penalty = Math.round(10 * penaltyMultiplier)
    score -= penalty
    issues.push("Última execução com erro")
  }

  score = Math.max(0, score)

  return {
    workflowId: workflow.id,
    workflowName: workflow.name,
    score,
    level: levelFromScore(score),
    issues,
    retryStormDetected,
    waitingCount: waitingExecs.length,
    errorRate24h,
    isDependencyNode,
    lastExecutionStatus: lastExec?.status,
  }
}

export function detectScheduleMiss(
  workflowId: string,
  executions: N8nExecution[],
  expectedIntervalHours: number
): boolean {
  if (!SCHEDULE_WORKFLOW_IDS.includes(workflowId)) return false
  if (executions.length === 0) return true

  const lastSuccess = executions.find((e) => e.status === "success")
  if (!lastSuccess) return true

  const elapsed = Date.now() - new Date(lastSuccess.startedAt).getTime()
  const toleranceMs = (expectedIntervalHours + 1) * 60 * 60 * 1000
  return elapsed > toleranceMs
}

export function rankWorkflowsByRisk(healths: WorkflowHealth[]): WorkflowHealth[] {
  return [...healths].sort((a, b) => {
    if (a.isDependencyNode !== b.isDependencyNode) {
      return a.isDependencyNode ? -1 : 1
    }
    return a.score - b.score
  })
}

export function buildHealthSummary(healths: WorkflowHealth[]): HealthSummary {
  return {
    total: healths.length,
    healthy: healths.filter((h) => h.level === "healthy").length,
    warning: healths.filter((h) => h.level === "warning").length,
    critical: healths.filter((h) => h.level === "critical").length,
  }
}
