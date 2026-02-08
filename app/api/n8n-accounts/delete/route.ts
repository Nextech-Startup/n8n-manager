import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
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

    await prisma.n8nAccount.delete({
      where: {
        id: accountId,
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conta deletada',
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar conta' },
      { status: 500 }
    );
  }
}
