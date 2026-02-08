# n8n Workflow Manager v3.0 ✨

Gerencie múltiplas contas n8n com **autenticação segura por email**!

## 🚀 Novos Recursos v3.0

- ✅ **Código por Email** - Receba código de 6 dígitos no email a cada login
- 🔐 **Login válido por 30 dias** - Fique logado sem precisar digitar código toda hora
- 📧 **Segurança aprimorada** - Códigos expiram em 10 minutos
- 🏢 **Múltiplas contas n8n** - Gerencie produção, desenvolvimento, testes
- 💾 **Prisma ORM** - Type-safe, migrations automáticas
- 🐘 **PostgreSQL (Supabase)** - Banco de dados robusto e gratuito

## 📋 Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (grátis)
- Email (Gmail recomendado) para enviar códigos
- Conta(s) n8n (cloudfy.host ou self-hosted)

## ⚡ Quick Start

### 1. Extrair e instalar

```bash
tar -xzf n8n-workflow-manager-prisma.tar.gz
cd n8n-workflow-manager
npm install
```

### 2. Configurar Banco de Dados

1. Criar projeto no [Supabase](https://supabase.com)
2. Copiar connection string em: **Settings** → **Database** → **Connection string** → **URI**
3. Criar arquivo `.env`:

```bash
cp .env.example .env
```

4. Editar `.env` e adicionar a connection string:

```env
DATABASE_URL="postgresql://postgres:SUA-SENHA@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:SUA-SENHA@db.xxx.supabase.co:5432/postgres"
JWT_SECRET=mude-para-algo-seguro-em-producao
```

### 3. Configurar Email (Gmail)

**📧 Veja o guia completo em:** `CONFIGURAR-EMAIL.md`

Resumo rápido:
1. Ativar verificação em 2 etapas: https://myaccount.google.com/security
2. Gerar senha de app: https://myaccount.google.com/apppasswords
3. Adicionar no `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-de-16-digitos
```

### 4. Criar tabelas no banco

```bash
npm run prisma:generate
npm run prisma:push
```

### 5. Iniciar aplicação

```bash
npm run dev
```

Acesse: `http://localhost:3000` 🎉

## 🔐 Como Funciona a Segurança

### Fluxo de Login:

1. **Você faz login** com email e senha
2. **Sistema envia código** de 6 dígitos no seu email
3. **Você digita o código** (válido por 10 minutos)
4. **Fica logado por 30 dias** 🎊
5. **Após 30 dias** → repete o processo

### Segurança Implementada:

- ✅ Senhas com bcrypt (10 rounds)
- ✅ JWT expira em 30 dias (não 7!)
- ✅ Código expira em 10 minutos
- ✅ Códigos usados são invalidados
- ✅ Códigos antigos são invalidados ao gerar novos
- ✅ API Keys criptografadas no banco
- ✅ Sessions no sessionStorage

## 🎯 Uso Diário

### Primeira vez

1. **Criar Conta**
   - Clique em "Registrar"
   - Digite email e senha
   - Login automático (sem código no primeiro acesso)

2. **Adicionar Conta n8n**
   - Clique em "+ Nova Conta"
   - Nome: "Produção", "Dev", etc.
   - Base URL: `https://seu-n8n.cloudfy.host`
   - API Key: Gere no n8n (Settings → n8n API)

3. **Gerenciar Workflows**
   - Selecione a conta
   - Clique em "Atualizar"
   - Use os toggles para ativar/desativar

### Logins seguintes

1. Digite email e senha
2. Vá no seu email e copie o código
3. Cole o código
4. Pronto! Logado por 30 dias

## 📁 Estrutura do Projeto

```
n8n-workflow-manager/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/          # Criar conta
│   │   │   ├── login/             # Login + enviar código
│   │   │   └── verify-code/       # Verificar código
│   │   ├── n8n-accounts/          # Gerenciar contas n8n
│   │   └── workflows/             # Listar/Toggle workflows
│   ├── page.tsx                   # Interface principal
│   └── types.ts
├── lib/
│   ├── auth.ts                    # JWT (30 dias)
│   ├── email.ts                   # Envio de códigos
│   └── prisma.ts                  # Cliente Prisma
├── prisma/
│   └── schema.prisma              # Schema do banco
├── CONFIGURAR-EMAIL.md            # Guia de setup de email
└── README.md
```

## 🗄️ Schema do Banco

```prisma
model User {
  id           String
  email        String @unique
  passwordHash String
  verificationCodes  VerificationCode[]
  n8nAccounts N8nAccount[]
}

model VerificationCode {
  id        String
  userId    String
  code      String
  expiresAt DateTime
  used      Boolean @default(false)
}

model N8nAccount {
  id        String
  userId    String
  name      String
  baseUrl   String
  apiKey    String
  isDefault Boolean
}
```

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Dev server
npm run build            # Build produção
npm run start            # Start produção
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:push      # Sync schema (dev)
npm run prisma:migrate   # Migration (prod)
npm run prisma:studio    # Interface visual do banco
```

## 🔑 Como obter API Key do n8n

1. Acesse seu n8n
2. Settings → n8n API
3. Create an API key
4. Copie (só é mostrada uma vez!)

## 🐛 Solução de Problemas

### Email não chega

- ✅ Verifique spam/lixo eletrônico
- ✅ Confirme que a senha de app está correta
- ✅ Tente gerar nova senha de app
- ✅ Aguarde 1-2 minutos

### "Erro ao enviar email"

- ✅ Verifique as configurações SMTP no `.env`
- ✅ Use **senha de app**, não a senha normal do Gmail
- ✅ Confirme que verificação em 2 etapas está ativa

### "Código inválido ou expirado"

- ✅ Código expira em 10 minutos
- ✅ Gere um novo fazendo login novamente
- ✅ Digite o código mais recente

### Token expirado

- ✅ Normal após 30 dias
- ✅ Faça login novamente
- ✅ Receberá novo código por email

### Prisma errors

```bash
# Limpar e recriar
npm run prisma:generate
npm run prisma:push
```

## 📧 Provedores de Email Suportados

- ✅ Gmail (recomendado)
- ✅ Outlook/Hotmail
- ✅ Yahoo
- ✅ SendGrid
- ✅ Qualquer SMTP

Veja `CONFIGURAR-EMAIL.md` para detalhes.

## 🚀 Deploy em Produção

### Vercel

1. Push para GitHub
2. Import no Vercel
3. Configure env vars:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
4. Deploy!

### Outras plataformas

- Railway
- Render
- Digital Ocean

## 🎨 Tecnologias

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL (Supabase)
- Nodemailer
- Tailwind CSS
- bcryptjs
- JWT

## 📝 Changelog

### v3.0
- 🔐 Código por email (removido TOTP)
- ⏰ JWT expira em 30 dias (antes 7)
- 📧 Template de email profissional
- ✨ Interface simplificada

### v2.0
- Múltiplas contas n8n
- Prisma ORM
- 2FA com TOTP

### v1.0
- Versão inicial
- localStorage (inseguro)

## 📄 Licença

MIT

---

**Dúvidas?** Leia `CONFIGURAR-EMAIL.md` primeiro! 😊

# 📧 Como Configurar o Email (Gmail)

Para o sistema funcionar, você precisa configurar um email SMTP para enviar os códigos de verificação.

## 🔧 Usando Gmail (Recomendado)

### Passo 1: Ativar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Role até "Como fazer login no Google"
3. Clique em "Verificação em duas etapas"
4. Siga as instruções para ativar

### Passo 2: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Em "Selecionar app", escolha "Email"
3. Em "Selecionar dispositivo", escolha "Outro" e digite "n8n Manager"
4. Clique em "Gerar"
5. **COPIE A SENHA DE 16 DÍGITOS** (sem espaços)

### Passo 3: Configurar no .env

Edite o arquivo `.env` e adicione:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-aqui
```

**Exemplo:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=joao.silva@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

## 📧 Testando

Após configurar, tente fazer login:

1. Acesse a aplicação
2. Digite seu email e senha
3. Clique em "Entrar"
4. Verifique seu email
5. Digite o código de 6 dígitos

Se não funcionar, verifique:
- ✅ Senha de app está correta (16 dígitos)
- ✅ Email está correto
- ✅ Verificação em 2 etapas está ativa

## 🔄 Outros Provedores de Email

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

### SendGrid (Profissional)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-do-sendgrid
```

## 🆘 Problemas Comuns

### "Erro ao enviar email"

- Verifique se a senha de app está correta
- Tente gerar uma nova senha de app
- Confirme que a verificação em 2 etapas está ativa

### Email não chega

- Verifique a pasta de spam/lixo eletrônico
- Aguarde alguns minutos
- Tente fazer login novamente

### "Invalid login" ou "Authentication failed"

- Certifique-se de usar a **senha de app**, não a senha normal do Gmail
- A senha de app tem 16 caracteres (pode ter espaços ou não)

## ✅ Pronto!

Depois de configurar, o sistema vai:
1. Enviar código de 6 dígitos no seu email a cada login
2. Código expira em 10 minutos
3. Login válido por 30 dias
4. Após 30 dias, precisa fazer login e receber novo código

