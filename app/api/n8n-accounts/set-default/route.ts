import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'ID da conta não fornecido' },
        { status: 400 }
      );
    }

    // Remover padrão de todas as contas
    await prisma.n8nAccount.updateMany({
      where: { userId: payload.userId },
      data: { isDefault: false },
    });

    // Definir nova conta padrão
    await prisma.n8nAccount.update({
      where: { 
        id: accountId,
        userId: payload.userId,
      },
      data: { isDefault: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Conta padrão atualizada',
    });
  } catch (error) {
    console.error('Erro ao definir conta padrão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao definir conta padrão' },
      { status: 500 }
    );
  }
}
