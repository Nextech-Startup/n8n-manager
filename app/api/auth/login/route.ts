import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateVerificationCode, sendVerificationCode } from '@/lib/email';
import { signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🟢 ===== /api/auth/login CHAMADO =====');
  
  try {
    const { email, password, rememberMe } = await request.json();
    
    // Tenta ler o cookie de confiança (refreshToken)
    const trustToken = request.cookies.get('refreshToken')?.value;
    
    console.log('🟢 Dados recebidos:');
    console.log('  - email:', email);
    console.log('  - password:', password ? '***' : 'vazio');
    console.log('  - rememberMe:', rememberMe);
    console.log('  - dispositivo confiável:', trustToken ? 'SIM' : 'NÃO');

    if (!email || !password) {
      console.log('🔴 Erro: email ou password faltando');
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário
    console.log('🟢 Buscando usuário...');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('🔴 Usuário não encontrado');
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    console.log('🟢 Usuário encontrado:', user.email);

    // Verificar senha
    console.log('🟢 Verificando senha...');
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      console.log('🔴 Senha incorreta');
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    console.log('✅ Senha correta!');

    // ============================================================
    // LÓGICA DE DISPOSITIVO CONFIÁVEL (PULAR 2FA)
    // ============================================================
    if (trustToken) {
      console.log('🚀 Dispositivo confiável detectado! Pulando 2FA...');
      
      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      return NextResponse.json({
        success: true,
        requiresCode: false, // Indica ao front que não precisa ir para VerifyCodeScreen
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.createdAt,
        },
      });
    }

    // ============================================================
    // FLUXO NORMAL DE 2FA (SE NÃO FOR CONFIÁVEL)
    // ============================================================
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log('🟢 Código gerado:', code);
    console.log('🟢 Invalidando códigos anteriores...');

    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    console.log('🟢 Salvando novo código no banco...');

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    console.log('🟢 Enviando código por email...');
    const emailSent = await sendVerificationCode(user.email, code);

    if (!emailSent) {
      console.log('🔴 Erro ao enviar email');
      return NextResponse.json(
        { success: false, message: 'Erro ao enviar código. Tente novamente.' },
        { status: 500 }
      );
    }

    console.log('✅ Email enviado com sucesso!');

    return NextResponse.json({
      success: true,
      requiresCode: true,
      userId: user.id,
      rememberMe,
      message: 'Código enviado para seu email',
    });

  } catch (error) {
    console.error('🔴 ERRO no /api/auth/login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}