import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔴 ===== /api/auth/logout (PRESERVANDO CONFIANÇA) =====');
  
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Sessão encerrada, dispositivo continua confiável'
    });

    // 🟢 Limpamos APENAS o accessToken
    console.log('🟢 Removendo apenas o accessToken...');
    
    response.cookies.set('accessToken', '', { 
      expires: new Date(0),
      path: '/',
    });

    // ❌ NÃO limpamos o refreshToken aqui. 
    // É ele que diz ao /login que este dispositivo já fez 2FA.

    console.log('✅ Logout processado. RefreshToken preservado.');
    return response;
  } catch (error) {
    console.error('🔴 ERRO no /api/auth/logout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao processar logout' },
      { status: 500 }
    );
  }
}