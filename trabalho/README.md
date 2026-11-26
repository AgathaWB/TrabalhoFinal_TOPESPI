# AetherDuo ✦ Hábitos em Dupla

Aplicativo de acompanhamento de hábitos diários em dupla, desenvolvido para o trabalho final da disciplina de **Tópicos Especiais**.

---

##  Sobre o Projeto

Manter a constância em hábitos saudáveis (como estudar, beber água ou praticar exercícios) é muito mais fácil quando há companhia e incentivo mútuo.  
O **AetherDuo** resolve esse problema conectando **duas pessoas**: cada usuário gerencia seus próprios hábitos diários e acompanha, em tempo real, o progresso da sua dupla — podendo até enviar um **"empurrão"** amigável quando o parceiro ainda não concluiu as tarefas do dia.

---

##  Principais Funcionalidades

- **Cadastro e Login:** criação de conta e autenticação com e-mail e senha via Firebase Authentication.
- **Gerenciamento de Hábitos (Aba *Hábitos*):**
  - Adicionar novos hábitos diários.
  - Marcar e desmarcar hábitos concluídos no dia com atualização instantânea da barra de progresso.
  - Excluir hábitos pressionando e segurando o item.
  - Visualizar avisos de "empurrões" recebidos da dupla e dispensá-los com um toque.
- **Sistema de Dupla em Tempo Real (Aba *✦ Dupla*):**
  - Enviar convite pelo e-mail de outro usuário cadastrado.
  - Aceitar, recusar ou cancelar convites pendentes.
  - Acompanhar a barra de progresso e a lista de hábitos do parceiro em tempo real.
  - Enviar um **empurrão diário** (`Dar um empurrão`) para incentivar o parceiro.
  - Desfazer a dupla a qualquer momento.

---

## Tecnologias Utilizadas

- **React Native** + **Expo (SDK 54)** — execução multiplataforma (Web, Android e iOS).
- **TypeScript** — tipagem estática para maior segurança no código.
- **Firebase Authentication** — controle de contas e login por e-mail e senha.
- **Cloud Firestore** — banco de dados NoSQL na nuvem com sincronização em tempo real (`onSnapshot`).

---

## Estrutura do Projeto

- `App.tsx` — componente principal, navegação por abas e controle de sessão.
- `src/firebase.ts` — conexão com o Firebase e instâncias `auth` e `db`.
- `src/auth.tsx` — autenticação, criação automática de perfil e tratamento de erros.
- `src/data.ts` — leitura em tempo real e operações no Firestore (hábitos, marcações, convites e empurrões).
- `src/screens/` — telas de login (`AuthScreen.tsx`), hábitos (`HabitsScreen.tsx`) e dupla (`DuoScreen.tsx`).
- `src/components.tsx`, `src/theme.ts`, `src/dates.ts`, `src/alert.ts`, `src/types.ts` — componentes visuais, cores, datas, alertas e tipos.
- `firestore.rules` — regras de segurança do Cloud Firestore.
- `documentacao/` — documentação completa do projeto:
  - [Visão do Projeto](documentacao/visao.md)
  - [Requisitos](documentacao/requisitos.md)
  - [Casos de Uso](documentacao/casosuso.md)
  - [Arquitetura](documentacao/arquitetura.md)
  - [Interface](documentacao/interface.md)

---

## Como Executar

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- Navegador web (para testar no PC) ou aplicativo **Expo Go** (para testar no celular)

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor do Expo:
   ```bash
   npx expo start -c
   ```
3. Escolha como abrir:
   - **Navegador:** pressione `w` no terminal (ou rode `npm run web`).
   - **Celular (Expo Go):** escaneie o QR Code exibido no terminal.

---

## Roteiro Rápido para Apresentação

1. **Introdução (30s):** explicar a ideia do app (criar hábitos diários com incentivo em dupla) e mostrar as tecnologias (Expo + React Native + Firebase).
2. **Demonstração ao vivo:**
   - Abrir duas sessões lado a lado (ex.: janela normal e aba anônima do navegador).
   - Mostrar o cadastro/login na tela inicial.
   - Na **Conta A**, cadastrar 2 ou 3 hábitos e marcar um deles para mostrar a barra de progresso subindo.
   - Na aba **✦ Dupla**, enviar um convite para o e-mail da **Conta B**.
   - Na **Conta B**, aceitar o convite e mostrar que as duas telas passam a exibir os hábitos da dupla em tempo real.
   - Da **Conta A**, clicar em **Dar um empurrão** e mostrar o aviso aparecendo imediatamente na **Conta B**.
3. **Encerramento:** mostrar rapidamente o Firebase Console (Authentication e Firestore) provando que os dados estão salvos na nuvem.
