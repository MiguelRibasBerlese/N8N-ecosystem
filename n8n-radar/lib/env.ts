import { z } from "zod"

const envSchema = z.object({
  N8N_BASE_URL: z.string().url(),
  N8N_API_KEY: z.string().min(1),
  DASHBOARD_USER: z.string().min(1),
  DASHBOARD_PASSWORD: z.string().min(8),
  DASHBOARD_KEY: z.string().min(16),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_POLL_INTERVAL: z.coerce.number().default(30000),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error("❌ Variáveis de ambiente inválidas:")
  result.error.flatten().fieldErrors &&
    Object.entries(result.error.flatten().fieldErrors).forEach(([key, msgs]) => {
      console.error(`  ${key}: ${msgs?.join(", ")}`)
    })
  throw new Error("Configuração de ambiente inválida — verifique .env.local")
}

export const env = result.data
