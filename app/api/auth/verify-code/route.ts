import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🟢 ===== /api/auth/verify-code CHAMADO =====');
  
  try {
    const { userId, code, rememberMe } = await request.json();
    
    console.log('🟢 Dados recebidos:');
    console.log('  - userId:', userId);
    console.log('  - code:', code);
    console.log('  - rememberMe:', rememberMe);

    if (!userId || !code) {
      console.log('🔴 Erro: userId ou code faltando');
      return NextResponse.json(
        { success: false, message: 'Código e ID do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar código no banco
    console.log('🟢 Buscando código no banco...');
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      console.log('🔴 Código inválido ou expirado');
      return NextResponse.json(
        { success: false, message: 'Código inválido ou expirado' },
        { status: 401 }
      );
    }

    console.log('🟢 Código válido! Marcando como usado...');

    // Marcar código como usado
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Buscar usuário
    console.log('🟢 Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('🔴 Usuário não encontrado');
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('🟢 Usuário encontrado:', user.email);

    // Gerar access token (sessão curta/imediata)
    console.log('🟢 Gerando access token...');
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    // Gerar objeto de resposta
    const response = NextResponse.json({
      success: true,
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.createdAt,
      },
    });

    // LÓGICA DE CONFIANÇA: Se rememberMe for true, setamos o cookie persistente
    if (rememberMe) {
      console.log('✅ rememberMe = true, gerando e persistindo refreshToken...');
      
      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
      });

      // Setar o Cookie de longa duração (30 dias)
      // Este cookie é o que permitirá pular o 2FA no próximo login
      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true, // Protege contra roubo via JS (XSS)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
      });

      console.log('✅ Cookie refreshToken setado para 30 dias.');
    } else {
      console.log('❌ rememberMe = false, limpando possíveis cookies antigos.');
      response.cookies.set('refreshToken', '', { expires: new Date(0), path: '/' });
    }

    return response;

  } catch (error) {
    console.error('🔴 ERRO no /api/auth/verify-code:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}