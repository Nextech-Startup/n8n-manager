import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, signAccessToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🟢 ===== /api/auth/refresh CHAMADO =====');
  
  try {
    const { refreshToken } = await request.json();
    
    console.log('🟢 refreshToken recebido:', refreshToken ? 'EXISTE' : 'NÃO EXISTE');

    if (!refreshToken) {
      console.log('🔴 Erro: refreshToken não enviado');
      return NextResponse.json(
        { success: false, message: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar refresh token
    console.log('🟢 Verificando token...');
    const decoded = verifyToken(refreshToken);
    
    console.log('🟢 Token decodificado:', decoded);

    if (!decoded || decoded.type !== 'refresh') {
      console.log('🔴 Token inválido ou não é do tipo refresh');
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar usuário
    console.log('🟢 Buscando usuário:', decoded.userId);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      console.log('🔴 Usuário não encontrado');
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('🟢 Usuário encontrado:', user.email);

    // Gerar novo access token
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    console.log('✅ Novo access token gerado!');
    console.log('✅ Retornando sucesso');

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
    console.error('🔴 ERRO no /api/auth/refresh:', error);
    return NextResponse.json(
      { success: false, message: 'Refresh token inválido ou expirado' },
      { status: 401 }
    );
  }
}