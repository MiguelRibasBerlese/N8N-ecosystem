// ⚠️ MANUTENÇÃO: IDs extraídos por análise direta da instância n8n em junho/2026.
// Quando workflows forem criados ou removidos, atualize este arquivo manualmente.

import type { WorkflowDependency } from "./types"

const KNOWN_DEPENDENCIES: WorkflowDependency[] = [
  // → Clint (uaNVMiZ1Krm0Nx5V): microserviço CRM central
  { sourceId: "drotp6CTjTtloREW", sourceName: "Lançamento Pago",       targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "0NPxKVxnJUTMoXZA", sourceName: "Compra Aprovada",       targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "OOTr7ti2mZnrHqai", sourceName: "Black Friday",           targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "5JLc9yV3j7obaIwu", sourceName: "Forms - Aplicação",     targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "J4cJ2KQmpL22CnsZ", sourceName: "Lançamento Pago v2",    targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "5h9mcGbGKhtOxQvX", sourceName: "Tally MC",              targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "SKyw75ayMe9NcwEv", sourceName: "[Tally] Sala Secreta",   targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },
  { sourceId: "gQWS1KwmH0jJLYHz", sourceName: "[Tally] Lançamento",    targetId: "uaNVMiZ1Krm0Nx5V", targetName: "Clint", connectionType: "http_call" },

  // → DataBase (BHtGzCTT2vy5FZcv): microserviço de dados
  { sourceId: "drotp6CTjTtloREW", sourceName: "Lançamento Pago",       targetId: "BHtGzCTT2vy5FZcv", targetName: "DataBase", connectionType: "http_call" },
  { sourceId: "0NPxKVxnJUTMoXZA", sourceName: "Compra Aprovada",       targetId: "BHtGzCTT2vy5FZcv", targetName: "DataBase", connectionType: "http_call" },
  { sourceId: "OOTr7ti2mZnrHqai", sourceName: "Black Friday",           targetId: "BHtGzCTT2vy5FZcv", targetName: "DataBase", connectionType: "http_call" },
  { sourceId: "iGWc6kJy1qwTN8t2", sourceName: "Workflow iGWc6k",       targetId: "BHtGzCTT2vy5FZcv", targetName: "DataBase", connectionType: "http_call" },

  // → Avisos (iqGTMtrWFjjZsJbp): sistema de notificação
  { sourceId: "g9KlDnuejEIwTgqM",       sourceName: "Confirmação Reunião",  targetId: "iqGTMtrWFjjZsJbp", targetName: "Avisos", connectionType: "http_call" },
  { sourceId: "-EvqkHvH7rbMnsnClply7",  sourceName: "Atualizar Parcelas",   targetId: "iqGTMtrWFjjZsJbp", targetName: "Avisos", connectionType: "http_call" },

  // → Error Handler (RGG82VEvsWkUoUVM)
  { sourceId: "uaNVMiZ1Krm0Nx5V", sourceName: "Clint", targetId: "RGG82VEvsWkUoUVM", targetName: "Error Handler (Clint)", connectionType: "error_handler" },
]

export function getDependencies(): WorkflowDependency[] {
  return KNOWN_DEPENDENCIES
}

export function getWorkflowDependents(workflowId: string): WorkflowDependency[] {
  return KNOWN_DEPENDENCIES.filter((d) => d.targetId === workflowId)
}

export function getCriticalImpact(workflowId: string): {
  directDependents: WorkflowDependency[]
  isCriticalNode: boolean
  impactDescription: string
} {
  const directDependents = getWorkflowDependents(workflowId)
  const isCriticalNode = directDependents.length >= 3

  let impactDescription = ""
  if (directDependents.length === 0) {
    impactDescription = "Sem dependentes conhecidos"
  } else {
    impactDescription = `${directDependents.length} workflow(s) em risco: ${directDependents.map((d) => d.sourceName).join(", ")}`
  }

  return { directDependents, isCriticalNode, impactDescription }
}
