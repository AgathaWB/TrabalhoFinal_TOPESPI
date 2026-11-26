# AetherDuo ✦ Hábitos em Dupla

Aplicativo mobile desenvolvido em **React Native com Expo** e **Firebase** para a disciplina de **Tópicos Especiais** (3º ano do Ensino Médio Técnico).

O objetivo do aplicativo é ajudar duas pessoas a manterem a constância em seus hábitos diários através de um sistema de parceria e incentivo mútuo.

---

## 📱 Funcionalidades

1. **Autenticação:**
   - Criação de conta com e-mail e senha.
   - Login com validação e mensagens amigáveis em português.
   - Encerramento de sessão (Logout).

2. **Aba "Hábitos":**
   - Lista os hábitos diários cadastrados pelo usuário.
   - Permite adicionar novos hábitos com um clique.
   - Marcação e desmarcação de hábitos cumpridos no dia.
   - Barra de progresso dinâmica com contagem de hábitos concluídos.
   - Exclusão de hábito (basta pressionar e segurar sobre o hábito).
   - Notificações de "empurrões" recebidos da sua dupla para te lembrar de cumprir os hábitos.

3. **Aba "✦ Dupla":**
   - **Sem dupla:** Envio de convite para outro usuário através do e-mail.
   - Visualização de convites recebidos (com opção de Aceitar ou Recusar).
   - Visualização de convites enviados pendentes (com opção de Cancelar).
   - **Com dupla:** Acompanhamento em tempo real do progresso diário do seu parceiro.
   - Botão para dar um "Empurrão" (lembrete) na sua dupla caso ela ainda não tenha concluído os hábitos do dia.
   - Opção para desfazer a dupla a qualquer momento.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado no computador (versão 18 ou superior).
- Aplicativo **Expo Go** instalado no celular (Android ou iOS) OU um navegador web para testar no PC.

### Passo a passo

1. **Instalar as dependências:**
   Abra a pasta do projeto no terminal e execute:
   ```bash
   npm install
   ```

2. **Iniciar o aplicativo:**
   ```bash
   npm start
   # ou
   npx expo start
   ```

3. **Como visualizar o aplicativo:**
   - **No Computador (Navegador):** Pressione a tecla `w` no terminal para abrir a versão Web.
   - **No Celular (Expo Go):** Abra a câmera (iOS) ou o aplicativo Expo Go (Android) e aponte para o QR Code exibido no terminal.

---

## 🗄️ Como Conectar ao Banco de Dados (Firebase)

Para sincronizar os dados na nuvem entre os aparelhos, siga estes passos simples:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) com sua conta Google.
2. Clique em **Adicionar projeto** e dê o nome `AetherDuo` (desative o Google Analytics para ser mais rápido).
3. **Ativar Autenticação:**
   - No menu lateral, clique em **Criação** > **Authentication** > **Vamos começar**.
   - Escolha o provedor **E-mail/senha**, ative a primeira opção e clique em **Salvar**.
4. **Ativar o Banco de Dados (Firestore):**
   - No menu lateral, clique em **Criação** > **Cloud Firestore** > **Criar banco de dados**.
   - Escolha o local do servidor (ex: `southamerica-east1` ou padrão) e selecione o modo de teste.
   - Na aba **Regras** (Rules), certifique-se de permitir leitura e escrita para usuários logados:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
     Clique em **Publicar**.
5. **Obter as credenciais:**
   - Na página inicial do projeto no Firebase, clique no ícone da Web (`</>`) para registrar um app.
   - Copie o bloco de configuração `firebaseConfig` exibido.
   - Abra o arquivo `src/firebase.ts` no projeto e cole suas chaves no objeto `firebaseConfig`:
     ```typescript
     const firebaseConfig = {
       apiKey: "SUA_API_KEY",
       authDomain: "seu-projeto.firebaseapp.com",
       projectId: "seu-projeto",
       storageBucket: "seu-projeto.firebasestorage.app",
       messagingSenderId: "123456789",
       appId: "1:123456789:web:abcdef"
     };
     ```
6. Pronto! O aplicativo estará 100% conectado ao banco de dados e sincronizando em tempo real.
