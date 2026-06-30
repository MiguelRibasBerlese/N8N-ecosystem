// CONTRATO — não altere este arquivo após o Prompt 2.
// Importe daqui em todos os outros arquivos do projeto.

export interface N8nNode {
  id: string
  name: string
  type: string
  parameters?: Record<string, unknown>
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
}

export interface N8nWorkflow {
  id: string
  name: string
  active: boolean
  nodes: N8nNode[]
  createdAt: string
  updatedAt: string
  tags?: { id: string; name: string }[]
}

export type ExecutionStatus = "success" | "error" | "running" | "waiting" | "canceled"

export interface N8nExecution {
  id: string
  workflowId: string
  workflowName?: string
  status: ExecutionStatus
  startedAt: string
  stoppedAt?: string
  mode: string
  retryOf?: string
  retrySuccessId?: string
}

export type HealthLevel = "healthy" | "warning" | "critical"

export interface WorkflowHealth {
  workflowId: string
  workflowName: string
  score: number
  level: HealthLevel
  issues: string[]
  retryStormDetected: boolean
  waitingCount: number
  errorRate24h: number
  isDependencyNode: boolean
  lastExecutionStatus?: ExecutionStatus
}

export type AlertType =
  | "error_spike"
  | "waiting_stuck"
  | "schedule_missed"
  | "retry_storm"
  | "dependency_down"
  | "avisos_silent"
  | "sendflow_loop"

export type AlertSeverity = "warning" | "critical"

export interface Alert {
  id: string
  workflowId: string
  workflowName: string
  type: AlertType
  severity: AlertSeverity
  message: string
  detectedAt: string
  resolvedAt?: string
  autoResolved?: boolean
}

export type DependencyConnectionType = "http_call" | "webhook" | "error_handler"

export interface WorkflowDependency {
  sourceId: string
  sourceName: string
  targetId: string
  targetName: string
  connectionType: DependencyConnectionType
}

export interface HealthSummary {
  total: number
  healthy: number
  warning: number
  critical: number
}
