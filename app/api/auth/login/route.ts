import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { generateVerificationCode, sendVerificationCode } from '@/lib/email';
import { signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  
  try {
    const { email, password, rememberMe } = await request.json();
    
    // Tenta ler o cookie de confiança (refreshToken)
    const trustToken = request.cookies.get('refreshToken')?.value;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // ============================================================
    // LÓGICA DE DISPOSITIVO CONFIÁVEL (PULAR 2FA)
    // ============================================================
    if (trustToken) {
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

    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    const emailSent = await sendVerificationCode(user.email, code);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, message: 'Erro ao enviar código. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requiresCode: true,
      userId: user.id,
      rememberMe,
      message: 'Código enviado para seu email',
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}