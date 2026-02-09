import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Gerar novo access token
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token: newAccessToken,
      refreshToken, // Mantém o mesmo refresh token
      user: {
        id: user.id,
        email: user.email,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Refresh token inválido ou expirado' },
      { status: 401 }
    );
  }
}