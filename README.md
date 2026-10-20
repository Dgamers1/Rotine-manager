# Dgamer — Painel de Rotina (Render + Node.js + Supabase)

Versão dinâmica do painel. O servidor Express entrega o site e fornece uma API protegida por sessão Supabase. Cada conta salva seus próprios dados na tabela `public.user_data`, sem misturar dados entre usuários.

## 1. Criar o projeto Supabase
1. Crie um projeto em https://supabase.com/.
2. Abra **SQL Editor** e execute todo o conteúdo de `supabase-schema.sql`.
3. Em **Project Settings → API** (ou Connect), copie a Project URL, a chave pública/anon (publishable/anon) e a chave `service_role`/secret para configurar o servidor. Nunca coloque a chave service role no navegador ou no GitHub.
4. Em **Authentication → URL Configuration**, configure a URL do seu site Render como Site URL. Para confirmar e-mail, confira também o fluxo de confirmação e o redirect URL.

## 2. Publicar no Render
1. Envie todos os arquivos desta pasta para a raiz do repositório `Dgamers1/Rotine-manager`.
2. No Render, escolha **New → Web Service** e conecte esse repositório.
3. Configure:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Em **Environment**, adicione:
   - `SUPABASE_URL` = Project URL do Supabase
   - `SUPABASE_ANON_KEY` = chave pública/anon
   - `SUPABASE_SERVICE_ROLE_KEY` = chave secreta service role (somente no Render)
5. Deploy e abra a URL `https://seu-servico.onrender.com`.

O `render.yaml` pode servir como referência para configuração.

## 3. Como funciona
- Criar conta e entrar com e-mail e senha.
- A API valida o token de autenticação antes de ler/gravar.
- Os dados são separados pelo ID da conta na tabela `user_data`.
- A aplicação sincroniza as alterações automaticamente após uma pequena pausa.
- `localStorage` serve apenas como cópia local/fallback, não como banco principal.

## Observações importantes
- O primeiro usuário começa com os dados de exemplo existentes no painel. Confirme ou ajuste datas e horários.
- Se ativar confirmação de e-mail no Supabase, o usuário precisa confirmar a conta antes de entrar.
- Não compartilhe nem publique `SUPABASE_SERVICE_ROLE_KEY`.
- Para desenvolvimento local, rode `npm install` e `npm start`; configure as três variáveis de ambiente no shell ou num `.env` local (não versionar `.env`).
- GitHub Pages não executa Node.js. Use Render Web Service para esta versão.
