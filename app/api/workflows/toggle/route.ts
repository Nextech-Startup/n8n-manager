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

    const { accountId, workflowId, active } = await request.json();

    if (!accountId || !workflowId || typeof active !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
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

    // ✅ SOLUÇÃO: Usar endpoint específico para ativar/desativar
    const action = active ? 'activate' : 'deactivate';
    const endpoint = `${account.baseUrl}/api/v1/workflows/${workflowId}/${action}`;
    
    console.log(`🔄 ${active ? 'Ativando' : 'Desativando'} workflow:`, workflowId);

    const updateResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': account.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Erro do n8n:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Erro do n8n: ${errorText}`,
        },
        { status: updateResponse.status }
      );
    }

    const updatedWorkflow = await updateResponse.json();
    console.log('✅ Workflow atualizado com sucesso!', { active: updatedWorkflow.active });
    
    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('💥 Erro geral:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Falha ao atualizar workflow' },
      { status: 500 }
    );
  }
}