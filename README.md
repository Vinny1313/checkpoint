<h1 align="center">📍 checkPoint</h1>

<p align="center">
  Sistema web responsivo de <b>registro de ponto eletrônico</b>, com confirmação de presença por geolocalização,<br/>
  comprovante em PDF e cálculo de jornada conforme a CLT.
</p>

<p align="center">
  <a href="https://checkpoint-omega-two.vercel.app"><img src="https://img.shields.io/badge/Demo-online-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo"/></a>
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
</p>

<p align="center">
  <a href="https://checkpoint-omega-two.vercel.app"><b>🔗 Acessar o projeto</b></a> · 🚧 <i>Em desenvolvimento</i>
</p>

---

## 🎯 O problema

Uma equipe de desenvolvimento registrava o ponto por um bot de Discord, com os dados enviados para um dashboard (nome, data, entrada, saída e observação). Esse modelo não permitia:

- **confirmar a presença** do colaborador;
- **gerar o comprovante** de cada registro;
- emitir o **Espelho de Ponto** e o **AEJ**.

O checkPoint nasce para resolver isso em um site responsivo, seguindo a legislação e as normas atuais de controle de ponto.

## ✨ Funcionalidades

- **Registro de ponto:** entrada, saída, pausa e retorno, com NSR (Número Sequencial de Registro) gerado pelo banco.
- **Confirmação de presença por geolocalização:** cada marcação guarda latitude e longitude e é validada no banco por geofence.
- **Comprovante em PDF:** gerado a cada marcação, com hash SHA-256 dos dados.
- **Cálculo de jornada:** baseado na CLT (art. 58, § 1º), com tolerância de 10 minutos por dia (5 por marcação).
- **Justificativas e atestados:** envio de justificativa com documento anexo e fluxo de aprovação (pendente, aprovado, rejeitado).
- **Painel do colaborador e painel administrativo.**
- **Login por matrícula e senha.**
- **Segurança em nível de linha (RLS):** o colaborador acessa só os próprios dados, e o administrador, os da sua empresa.

## 🧭 Como funciona a validação de localização

A validação acontece no **banco de dados**, não só no navegador:

1. Cada empresa tem uma coordenada-base e um raio permitido (padrão de 100 m).
2. Ao inserir uma marcação, um *trigger* do PostgreSQL calcula a distância até a base com a **fórmula de Haversine**.
3. Se a distância passar do raio, a marcação é recusada com uma mensagem informando a distância calculada.

## 🧰 Stack

| Área | Tecnologias |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (Auth, PostgreSQL, RLS, funções e triggers) |
| Documentos | jsPDF (comprovantes) |
| Interface | lucide-react |
| Deploy | Vercel |

## 🗂️ Estrutura

```
checkpoint/
├── supabase/migrations/   # schema, RLS e função de geofence
└── web/                   # aplicação Next.js
    ├── src/app/           # páginas: login, dashboard, admin
    ├── src/lib/           # cálculos de jornada, comprovante e arquivos fiscais
    └── seed.mjs           # dados iniciais para testes
```

## 🚀 Como rodar

```bash
git clone https://github.com/Vinny1313/checkpoint.git
cd checkpoint/web
npm install
```

1. Crie um projeto no [Supabase](https://supabase.com) e aplique as migrations da pasta `supabase/migrations`, em ordem.
2. Crie o arquivo `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

3. (Opcional) Rode o seed para criar uma empresa de teste:

```bash
node seed.mjs
```

4. Inicie o servidor:

```bash
npm run dev
```

Acesse <http://localhost:3000>.

> O `.env.local` não deve ser commitado. Nunca publique chaves reais.

## 🛣️ Roadmap

- [ ] Geração real dos arquivos fiscais **AFD** e **AEJ** (hoje, simulada com dados de exemplo)
- [ ] **Espelho de Ponto** mensal
- [ ] Jornadas com múltiplas pausas no cálculo diário
- [ ] Relatórios para o administrador

---

<p align="center">Feito por <a href="https://github.com/Vinny1313">Vinicius Gomes</a></p>
