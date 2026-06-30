import type { N8nWorkflow, N8nExecution, ExecutionStatus } from "./types"

interface GetExecutionsParams {
  workflowId?: string
  status?: ExecutionStatus
  limit?: number
}

class N8nClient {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "")
    this.apiKey = apiKey
  }

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}/api/v1${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const res = await fetch(url.toString(), {
        headers: { "X-N8N-API-KEY": this.apiKey },
        signal: controller.signal,
      })

      if (res.status === 401) throw new Error("N8N_API_KEY inválida")
      if (!res.ok) throw new Error(`n8n respondeu ${res.status}`)

      return res.json() as Promise<T>
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        throw new Error("n8n não respondeu em 10s")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  async getWorkflows(): Promise<N8nWorkflow[]> {
    const data = await this.fetch<{ data: N8nWorkflow[] }>("/workflows", { limit: "250" })
    return data.data
  }

  async getExecutions(params: GetExecutionsParams = {}): Promise<N8nExecution[]> {
    const query: Record<string, string> = {
      limit: String(params.limit ?? 50),
    }
    if (params.workflowId) query.workflowId = params.workflowId
    if (params.status) query.status = params.status

    const data = await this.fetch<{ data: N8nExecution[] }>("/executions", query)
    return data.data
  }

  async getWaitingExecutions(): Promise<N8nExecution[]> {
    return this.getExecutions({ status: "waiting", limit: 100 })
  }

  async getExecution(id: string): Promise<N8nExecution> {
    return this.fetch<N8nExecution>(`/executions/${id}`)
  }
}

const baseUrl = process.env.N8N_BASE_URL ?? ""
const apiKey = process.env.N8N_API_KEY ?? ""

if (!baseUrl || !apiKey) {
  console.error(
    "❌ N8N_BASE_URL e N8N_API_KEY são obrigatórios. Configure .env.local (veja .env.local.example)."
  )
}

export const n8nClient = new N8nClient(baseUrl, apiKey)
