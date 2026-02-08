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

    const { name, base_url, api_key, is_default } = await request.json();

    if (!name || !base_url || !api_key) {
      return NextResponse.json(
        { success: false, message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Se esta conta será a padrão, remover padrão das outras
    if (is_default) {
      await prisma.n8nAccount.updateMany({
        where: { userId: payload.userId },
        data: { isDefault: false },
      });
    }

    // Criar conta
    const account = await prisma.n8nAccount.create({
      data: {
        userId: payload.userId,
        name,
        baseUrl: base_url,
        apiKey: api_key,
        isDefault: is_default || false,
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        user_id: account.userId,
        name: account.name,
        base_url: account.baseUrl,
        api_key: account.apiKey,
        is_default: account.isDefault,
        created_at: account.createdAt.toISOString(),
        updated_at: account.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
