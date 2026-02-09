import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// RATE LIMITER EMBUTIDO
// ============================================================

type RateLimitEntry = {
  count: number
  resetTime: number
}

type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

// Armazena requisições em memória
const requests = new Map<string, RateLimitEntry>()

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of requests.entries()) {
    if (now > entry.resetTime) {
      requests.delete(key)
    }
  }
}, 5 * 60 * 1000)

function checkRateLimit(identifier: string, config: RateLimitConfig): { 
  allowed: boolean
  remaining: number
  resetTime: number 
} {
  const now = Date.now()
  const entry = requests.get(identifier)

  // Se não existe ou expirou, cria nova entrada
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    requests.set(identifier, { count: 1, resetTime })
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetTime 
    }
  }

  // Se ainda está dentro da janela
  if (entry.count < config.maxRequests) {
    entry.count++
    requests.set(identifier, entry)
    return { 
      allowed: true, 
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime 
    }
  }

  // Limite excedido
  return { 
    allowed: false, 
    remaining: 0,
    resetTime: entry.resetTime 
  }
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             request.headers.get('x-real-ip') || 
             'unknown'
  return ip
}

// ============================================================
// CONFIGURAÇÕES DE RATE LIMIT POR ROTA
// ============================================================

const RATE_LIMITS = {
  AUTH_LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 req / 15 min
  AUTH_VERIFY: { maxRequests: 3, windowMs: 5 * 60 * 1000 },  // 3 req / 5 min
  ACCOUNT_CREATE: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 req / hora
  ACCOUNT_DELETE: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 req / hora
  ACCOUNT_LIST: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 req / min
  WORKFLOWS_LIST: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 req / min
  WORKFLOWS_TOGGLE: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 req / min
}

const ROUTE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/login': RATE_LIMITS.AUTH_LOGIN,
  '/api/auth/verify-code': RATE_LIMITS.AUTH_VERIFY,
  '/api/n8n-accounts/create': RATE_LIMITS.ACCOUNT_CREATE,
  '/api/n8n-accounts/delete': RATE_LIMITS.ACCOUNT_DELETE,
  '/api/n8n-accounts/list': RATE_LIMITS.ACCOUNT_LIST,
  '/api/workflows': RATE_LIMITS.WORKFLOWS_LIST,
  '/api/workflows/toggle': RATE_LIMITS.WORKFLOWS_TOGGLE,
}

// ============================================================
// PROXY (Next.js 16+)
// ============================================================

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Verifica se a rota tem rate limiting configurado
  const limitConfig = ROUTE_LIMITS[pathname]
  
  if (limitConfig) {
    const clientId = getClientIdentifier(request)
    const rateLimit = checkRateLimit(clientId, limitConfig)
    
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000)
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Limite de requisições excedido. Tente novamente em ${waitMinutes} minuto(s).` 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limitConfig.maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          }
        }
      )
    }

    // Adiciona headers de rate limit na resposta
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(limitConfig.maxRequests))
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
    response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime))
    
    return response
  }

  return NextResponse.next()
}

// Configuração de quais rotas o middleware deve rodar
export const config = {
  matcher: '/api/:path*',
}