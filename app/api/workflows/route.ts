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

    // Pegar accountId da query string
    const accountId = request.nextUrl.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'ID da conta não fornecido' },
        { status: 400 }
      );
    }

    // Buscar conta n8n
    const account = await prisma.n8nAccount.findFirst({
      where: {
        id: accountId,
        userId: payload.userId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, message: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Buscar workflows do n8n
    const response = await fetch(`${account.baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': account.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar workflows: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      workflows: data.data || [],
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json(
      { success: false, message: 'Falha ao buscar workflows' },
      { status: 500 }
    );
  }
}
