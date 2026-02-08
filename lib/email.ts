import nodemailer from 'nodemailer';

// Configurar transporter com suas credenciais de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"n8n Manager" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Seu código de verificação - n8n Manager',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
              text-align: center;
              letter-spacing: 8px;
              padding: 20px;
              background-color: #f0f9ff;
              border-radius: 8px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1 style="color: #1f2937; margin-bottom: 20px;">🔐 Código de Verificação</h1>
              
              <p>Olá!</p>
              
              <p>Você solicitou acesso ao <strong>n8n Workflow Manager</strong>.</p>
              
              <p>Use o código abaixo para completar seu login:</p>
              
              <div class="code">${code}</div>
              
              <div class="warning">
                <strong>⚠️ Atenção:</strong><br>
                • Este código expira em <strong>10 minutos</strong><br>
                • Não compartilhe este código com ninguém<br>
                • Se você não solicitou este código, ignore este email
              </div>
              
              <p>Este login será válido por <strong>30 dias</strong>. Após esse período, você precisará fazer login novamente e receber um novo código.</p>
              
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>© ${new Date().getFullYear()} n8n Workflow Manager</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Código de Verificação - n8n Manager

Seu código de verificação é: ${code}

Este código expira em 10 minutos.
Não compartilhe este código com ninguém.

Este login será válido por 30 dias.
      `,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

// Função para gerar código de 6 dígitos
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
