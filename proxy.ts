import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ============================================================
// CONFIGURAÇÃO DO REDIS
// ============================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ============================================================
// RATE LIMITERS POR ROTA
// ============================================================

// Login - 10 requisições a cada 15 minutos
const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
})

// Verify Code - 5 requisições a cada 5 minutos
const verifyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'),
  analytics: true,
  prefix: 'ratelimit:verify',
})

// Account Create - 20 requisições por hora
const accountCreateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:account-create',
})

// Account Delete - 30 requisições por hora
const accountDeleteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  analytics: true,
  prefix: 'ratelimit:account-delete',
})

// Account List - 100 requisições por minuto
const accountListLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:account-list',
})

// Workflows List - 120 requisições por minuto
const workflowsListLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, '1 m'),
  analytics: true,
  prefix: 'ratelimit:workflows-list',
})

// Workflows Toggle - 60 requisições por minuto
const workflowsToggleLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'ratelimit:workflows-toggle',
})

// ============================================================
// MAPEAMENTO DE ROTAS PARA LIMITERS
// ============================================================

const ROUTE_LIMITERS: Record<string, Ratelimit> = {
  '/api/auth/login': loginLimiter,
  '/api/auth/verify-code': verifyLimiter,
  '/api/n8n-accounts/create': accountCreateLimiter,
  '/api/n8n-accounts/delete': accountDeleteLimiter,
  '/api/n8n-accounts/list': accountListLimiter,
  '/api/workflows': workflowsListLimiter,
  '/api/workflows/toggle': workflowsToggleLimiter,
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getClientIdentifier(request: NextRequest): string {
  // Pega o IP real, mesmo atrás de proxies
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip') // Cloudflare
  
  const ip = cfConnectingIp || 
             (forwarded ? forwarded.split(',')[0].trim() : realIp) || 
             'unknown'
  
  return ip
}

function formatWaitTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000)
  const seconds = Math.ceil(ms / 1000)
  
  if (minutes > 1) {
    return `${minutes} minuto(s)`
  }
  return `${seconds} segundo(s)`
}

// ============================================================
// PROXY (Next.js 16+)
// ============================================================

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Desabilita rate limiting em desenvolvimento (opcional)
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  // Verifica se a rota tem rate limiting configurado
  const limiter = ROUTE_LIMITERS[pathname]
  
  if (limiter) {
    const clientId = getClientIdentifier(request)
    
    try {
      const { success, limit, remaining, reset } = await limiter.limit(clientId)
      
      if (!success) {
        const waitTime = reset - Date.now()
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Muitas tentativas. Aguarde ${formatWaitTime(waitTime)} e tente novamente.` 
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
              'Retry-After': String(Math.ceil(waitTime / 1000)),
            }
          }
        )
      }

      // Adiciona headers de rate limit na resposta
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', String(limit))
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
      
      return response
      
    } catch (error) {
      // Se Redis falhar, permite a requisição (fail-open)
      // Em produção, você pode querer logar isso
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

// Configuração de quais rotas o middleware deve rodar
export const config = {
  matcher: '/api/:path*',
}