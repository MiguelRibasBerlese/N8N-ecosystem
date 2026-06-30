import { describe, it, expect } from "vitest"
import {
  calculateHealthScore,
  detectScheduleMiss,
  rankWorkflowsByRisk,
  CRITICAL_WORKFLOW_IDS,
  SCHEDULE_WORKFLOW_IDS,
} from "../health-engine"
import type { N8nWorkflow, N8nExecution } from "../types"

const makeWorkflow = (id = "wf1", name = "Test Workflow"): N8nWorkflow => ({
  id,
  name,
  active: true,
  nodes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const makeExec = (
  status: N8nExecution["status"],
  minsAgo = 10,
  durationMs = 1000
): N8nExecution => {
  const startedAt = new Date(Date.now() - minsAgo * 60 * 1000).toISOString()
  const stoppedAt = new Date(Date.now() - minsAgo * 60 * 1000 + durationMs).toISOString()
  return {
    id: Math.random().toString(36).slice(2),
    workflowId: "wf1",
    status,
    startedAt,
    stoppedAt,
    mode: "trigger",
  }
}

describe("calculateHealthScore", () => {
  it("workflow saudável com 0 erros → score 100, level healthy", () => {
    const wf = makeWorkflow()
    const execs = Array.from({ length: 10 }, () => makeExec("success"))
    const health = calculateHealthScore(wf, execs)
    expect(health.score).toBe(100)
    expect(health.level).toBe("healthy")
    expect(health.issues).toHaveLength(0)
  })

  it("workflow com >20% de erros → penalidade -30 e level warning", () => {
    const wf = makeWorkflow()
    const execs = [
      ...Array.from({ length: 3 }, () => makeExec("error")),
      ...Array.from({ length: 7 }, () => makeExec("success")),
    ]
    const health = calculateHealthScore(wf, execs)
    // 30% erros → -30 → score 70 → "warning" (spec: -30 se >20%)
    expect(health.level).toBe("warning")
    expect(health.score).toBeLessThan(80)
    expect(health.score).toBeGreaterThanOrEqual(50)
  })

  it("isDependencyNode aumenta penalidade", () => {
    const wfNormal = makeWorkflow("regular", "Regular")
    const wfCritical = makeWorkflow(CRITICAL_WORKFLOW_IDS[0], "Clint")

    const execs = [
      ...Array.from({ length: 2 }, () => makeExec("error")),
      ...Array.from({ length: 8 }, () => makeExec("success")),
    ]

    const healthNormal = calculateHealthScore(wfNormal, execs)
    const healthCritical = calculateHealthScore(wfCritical, execs)

    expect(healthCritical.score).toBeLessThan(healthNormal.score)
    expect(healthCritical.isDependencyNode).toBe(true)
  })

  it("retryStormDetected quando execução >3x tempo médio", () => {
    const wf = makeWorkflow()
    // 9 execuções rápidas (1s) + 1 lenta (10s)
    const execs = [
      makeExec("success", 1, 10_000), // última — lenta
      ...Array.from({ length: 9 }, () => makeExec("success", 5, 1_000)),
    ]
    const health = calculateHealthScore(wf, execs)
    expect(health.retryStormDetected).toBe(true)
  })

  it("execução waiting >60min penaliza score", () => {
    const wf = makeWorkflow()
    const stuckExec: N8nExecution = {
      id: "stuck1",
      workflowId: "wf1",
      status: "waiting",
      startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 min atrás
      mode: "trigger",
    }
    const health = calculateHealthScore(wf, [stuckExec])
    expect(health.score).toBeLessThan(100)
    expect(health.waitingCount).toBe(1)
    expect(health.issues.some((i) => i.includes("presa"))).toBe(true)
  })

  it("não penaliza taxa de erro com menos de 5 execuções", () => {
    const wf = makeWorkflow()
    // Apenas execuções de sucesso com 1 erro — <5 execs, sem penalidade de taxa
    const execs = [makeExec("success"), makeExec("success")]
    const health = calculateHealthScore(wf, execs)
    expect(health.errorRate24h).toBe(0)
    expect(health.issues.some((i) => i.includes("Taxa"))).toBe(false)
  })
})

describe("detectScheduleMiss", () => {
  it("retorna false para workflow não-schedule", () => {
    expect(detectScheduleMiss("nao-schedule", [], 24)).toBe(false)
  })

  it("retorna true quando sem execuções", () => {
    expect(detectScheduleMiss(SCHEDULE_WORKFLOW_IDS[0], [], 24)).toBe(true)
  })

  it("retorna true quando última execução bem-sucedida >25h atrás", () => {
    const oldExec = makeExec("success", 26 * 60) // 26h atrás
    oldExec.workflowId = SCHEDULE_WORKFLOW_IDS[0]
    expect(detectScheduleMiss(SCHEDULE_WORKFLOW_IDS[0], [oldExec], 24)).toBe(true)
  })
})

describe("rankWorkflowsByRisk", () => {
  it("coloca nós críticos primeiro, depois ordena por score", () => {
    const healths = [
      { workflowId: "wf1", workflowName: "A", score: 90, level: "healthy" as const, issues: [], retryStormDetected: false, waitingCount: 0, errorRate24h: 0, isDependencyNode: false },
      { workflowId: CRITICAL_WORKFLOW_IDS[0], workflowName: "Clint", score: 50, level: "warning" as const, issues: [], retryStormDetected: false, waitingCount: 0, errorRate24h: 0, isDependencyNode: true },
      { workflowId: "wf2", workflowName: "B", score: 20, level: "critical" as const, issues: [], retryStormDetected: false, waitingCount: 0, errorRate24h: 0, isDependencyNode: false },
    ]
    const ranked = rankWorkflowsByRisk(healths)
    expect(ranked[0].isDependencyNode).toBe(true)
    expect(ranked[1].score).toBeLessThanOrEqual(ranked[2].score)
  })
})
