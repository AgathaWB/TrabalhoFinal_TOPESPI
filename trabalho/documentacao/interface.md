# Interface do Usuário — AetherDuo

## 1. Identidade Visual e Cores
A interface foi pensada para ser limpa, leve e fácil de usar tanto no celular quanto no navegador. As cores ficam centralizadas em `src/theme.ts`:

- **Fundo geral (`bg`):** `#F4F6FF` (azul bem claro)
- **Cartões (`card`):** `#FFFFFF` (branco) com borda `#E3E6F5`
- **Cor principal (`primary`):** `#5B6CFF` (azul/roxo suave para botões e abas)
- **Destaque / Dupla (`gold`):** `#F5B94A` (dourado para o logo `✦`, barra do amigo e empurrões)
- **Conclusão (`success`):** `#2FBF8F` (verde para hábitos concluídos e 100% da barra)
- **Ações destrutivas (`danger`):** `#E5484D` (vermelho para recusar, cancelar ou desfazer dupla)
- **Texto principal (`text`):** `#1B2140`

---

## 2. Telas do Aplicativo

### 2.1. Tela de Autenticação (`AuthScreen`)
- Exibe o símbolo `✦`, o título **AetherDuo** e o subtítulo *"Hábitos em dupla."*.
- Campos de **E-mail** e **Senha (mín. 6 caracteres)**.
- Botão principal (**Entrar** ou **Criar conta**) e link abaixo para alternar entre login e cadastro.
- Mensagens de erro em vermelho abaixo dos campos quando algum dado está incorreto.

### 2.2. Aba "Hábitos" (`HabitsScreen`)
- **Cabeçalho:** data por extenso em português, título **Seus hábitos** e botão **Sair**.
- **Aviso de empurrão:** quando a dupla envia um incentivo, aparece um cartão dourado no topo; ao tocar, ele é marcado como visto e desaparece.
- **Card de progresso:** mostra quantos hábitos foram concluídos no dia e a `ProgressBar` correspondente.
- **Lista de hábitos:**
  - Toque simples: marca ou desmarca o hábito no dia (muda para verde com `✓` e texto riscado).
  - Toque longo (segurar): abre confirmação para apagar o hábito.
- **Rodapé fixo:** campo de texto + botão `+` para adicionar um novo hábito rapidamente.

### 2.3. Aba "✦ Dupla" (`DuoScreen`)
Possui dois estados visuais dependendo se o usuário já tem parceiro:
- **Sem dupla:**
  - Campo de e-mail e botão **Enviar convite**.
  - Lista de **Convites recebidos** com botões **Aceitar** e **Recusar**.
  - Lista de **Convites enviados** com botão **Cancelar convite**.
- **Com dupla:**
  - E-mail do parceiro, card com contagem e barra de progresso dourada do amigo.
  - Lista somente leitura dos hábitos do parceiro hoje (`✅` ou `⬜`).
  - Botão **👋 Dar um empurrão** (desabilitado se já enviou hoje ou se o amigo já completou tudo).
  - Botão **Desfazer dupla** com confirmação.

---

## 3. Navegação
Após o login, o usuário navega entre as duas telas principais por uma barra inferior fixa (`App.tsx`) com as abas **Hábitos** e **✦ Dupla**.
