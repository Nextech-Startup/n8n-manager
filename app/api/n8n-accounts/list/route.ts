import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const accounts = await prisma.n8nAccount.findMany({
      where: { userId: payload.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      accounts: accounts.map(acc => ({
        id: acc.id,
        user_id: acc.userId,
        name: acc.name,
        base_url: acc.baseUrl,
        api_key: acc.apiKey,
        is_default: acc.isDefault,
        created_at: acc.createdAt.toISOString(),
        updated_at: acc.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar contas' },
      { status: 500 }
    );
  }
}
