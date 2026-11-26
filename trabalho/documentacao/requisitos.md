# Requisitos do Sistema — AetherDuo

Este documento lista os requisitos funcionais (o que o sistema faz) e não funcionais (características técnicas e de qualidade) implementados no aplicativo.

---

## 1. Requisitos Funcionais (RF)

| Código | Descrição |
| :--- | :--- |
| **RF01** | O sistema deve permitir que um novo usuário crie uma conta informando e-mail e senha (mínimo de 6 caracteres). |
| **RF02** | O sistema deve permitir que um usuário cadastrado faça login e encerre a sessão (logout). |
| **RF03** | O sistema deve criar automaticamente o perfil do usuário no banco de dados após o primeiro acesso. |
| **RF04** | O usuário autenticado deve poder cadastrar novos hábitos diários com um título. |
| **RF05** | O usuário deve visualizar a lista dos seus hábitos e uma barra de progresso com a contagem de concluídos no dia atual. |
| **RF06** | O usuário deve poder marcar e desmarcar um hábito como concluído no dia atual. |
| **RF07** | O usuário deve poder excluir um hábito mediante confirmação (pressionar e segurar o item). |
| **RF08** | O usuário sem dupla deve poder enviar um convite para outro usuário informando o e-mail cadastrado. |
| **RF09** | O usuário deve visualizar convites recebidos (podendo aceitar ou recusar) e convites enviados pendentes (podendo cancelar). |
| **RF10** | Ao aceitar um convite, ambos os usuários devem ser vinculados como dupla e passar a visualizar o progresso e os hábitos um do outro em tempo real. |
| **RF11** | O usuário com dupla deve poder enviar um "empurrão" diário para o parceiro (quando este ainda não concluiu todos os hábitos do dia) e o parceiro deve poder dispensar a notificação recebida. |
| **RF12** | O usuário com dupla deve poder desfazer a dupla a qualquer momento mediante confirmação. |

---

## 2. Requisitos Não Funcionais (RNF)

| Código | Descrição |
| :--- | :--- |
| **RNF01** | **Multiplataforma:** o aplicativo deve rodar na Web, Android e iOS utilizando React Native com Expo. |
| **RNF02** | **Sincronização em tempo real:** alterações em hábitos, marcações, convites e empurrões devem atualizar automaticamente na tela dos usuários conectados via Cloud Firestore. |
| **RNF03** | **Segurança básica:** apenas usuários autenticados podem ler ou gravar dados no Firestore (`request.auth != null`). |
| **RNF04** | **Usabilidade:** a interface deve ser simples, responsiva e exibir mensagens de erro e confirmação em português. |
| **RNF05** | **Controle diário automático:** a virada de dia deve reiniciar a contagem de marcações do dia atual com base na data local (`YYYY-MM-DD`). |
