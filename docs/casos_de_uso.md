# GymManager Pro — Casos de Uso

> **Projeto:** GymManager Pro  
> **Versão:** 1.0

---

## UC001 — Realizar Login

**Ator Principal:** Qualquer usuário do sistema  
**Pré-condições:** O usuário deve estar cadastrado no sistema.  
**Pós-condições:** O usuário é autenticado e redirecionado ao Dashboard.

### Fluxo Principal
1. O usuário acessa a tela de login.
2. O usuário insere email e senha.
3. O usuário clica em "Entrar".
4. O sistema valida as credenciais.
5. O sistema gera um token JWT e armazena no navegador.
6. O sistema redireciona para o Dashboard.

### Fluxo Alternativo — Credenciais Inválidas
4a. O sistema identifica que email ou senha estão incorretos.  
4b. O sistema exibe mensagem de erro "Credenciais inválidas".  
4c. O fluxo retorna ao passo 2.

### Fluxo Alternativo — Esqueceu a Senha
3a. O usuário clica em "Esqueci minha senha".  
3b. O sistema redireciona para a tela de recuperação.  
3c. O usuário insere seu email e clica em "Enviar instruções".  
3d. O sistema exibe mensagem de confirmação.

---

## UC002 — Cadastrar Novo Aluno

**Ator Principal:** Administrador ou Recepcionista  
**Pré-condições:** O usuário deve estar autenticado com perfil adequado.  
**Pós-condições:** O aluno é cadastrado no sistema com status "Ativo".

### Fluxo Principal
1. O usuário navega até a página "Alunos".
2. O usuário clica no botão "Novo Aluno".
3. O sistema exibe o modal de cadastro.
4. O usuário preenche: nome, CPF, data de nascimento, telefone, endereço.
5. O usuário clica em "Cadastrar Aluno".
6. O sistema valida os dados (CPF válido, data no passado, campos obrigatórios).
7. O sistema verifica se o CPF já existe.
8. O sistema salva o aluno no banco de dados.
9. O sistema exibe toast de sucesso e atualiza a lista.

### Fluxo Alternativo — CPF Duplicado
7a. O sistema identifica CPF já cadastrado.  
7b. O sistema exibe mensagem "CPF já cadastrado".  
7c. O fluxo retorna ao passo 4.

### Fluxo Alternativo — Dados Inválidos
6a. O sistema identifica campos obrigatórios não preenchidos ou formato inválido.  
6b. O sistema exibe mensagens de validação nos campos.  
6c. O fluxo retorna ao passo 4.

### Fluxo Alternativo — Cancelar
5a. O usuário clica em "Cancelar" ou fecha o modal.  
5b. O sistema fecha o modal sem salvar.  
5c. O estado do formulário é limpo.

---

## UC003 — Criar Matrícula

**Ator Principal:** Administrador ou Recepcionista  
**Pré-condições:** Deve existir pelo menos um aluno e um plano cadastrados.  
**Pós-condições:** A matrícula é criada e as faturas mensais são geradas automaticamente.

### Fluxo Principal
1. O usuário navega até a página "Matrículas".
2. O usuário clica em "Nova Matrícula".
3. O sistema exibe o modal com listas de alunos e planos.
4. O usuário seleciona o aluno, o plano e a data de início.
5. O usuário clica em "Criar Matrícula".
6. O sistema calcula a data de término baseada na duração do plano.
7. O sistema cria a matrícula com status "Ativa".
8. O sistema gera automaticamente as faturas mensais.
9. O sistema exibe toast de sucesso e atualiza a lista.

### Fluxo Alternativo — Cancelar Matrícula
1. Na lista de matrículas, o usuário clica no ícone de cancelar.
2. O sistema altera o status da matrícula para "Cancelada".
3. O sistema cancela todas as faturas pendentes vinculadas.
4. O sistema exibe toast de confirmação.

### Fluxo Alternativo — Renovar Matrícula
1. Na lista de matrículas, o usuário clica no ícone de renovar.
2. O sistema expira a matrícula atual.
3. O sistema cria uma nova matrícula com mesmo plano e aluno.
4. O sistema gera novas faturas para o período renovado.

---

## UC004 — Registrar Pagamento de Fatura

**Ator Principal:** Administrador ou Recepcionista  
**Pré-condições:** Deve existir uma fatura com status "Pendente" ou "Vencida".  
**Pós-condições:** A fatura é marcada como "Paga" com a data de pagamento registrada.

### Fluxo Principal
1. O usuário navega até a página "Financeiro".
2. O usuário localiza a fatura desejada (pode usar filtros por status).
3. O usuário clica no ícone de "Pagar" (✓).
4. O sistema registra o pagamento com a data atual.
5. O sistema atualiza o status da fatura para "Pago".
6. O sistema recalcula o resumo financeiro.
7. O sistema exibe toast de sucesso.

### Fluxo Alternativo — Aplicar Desconto
1. O usuário clica no ícone de "Desconto" (%).
2. O sistema exibe modal de desconto.
3. O usuário insere o percentual de desconto (ex: 10 para 10%).
4. O sistema calcula o novo valor: `finalAmount = amount × (1 - desconto/100)`.
5. O sistema atualiza a fatura com o desconto aplicado.
6. O sistema exibe toast de sucesso.

---

## UC005 — Realizar Check-in em Aula

**Ator Principal:** Recepcionista ou Professor  
**Pré-condições:** Deve existir um horário de aula cadastrado e alunos ativos.  
**Pós-condições:** O check-in do aluno é registrado para a aula selecionada.

### Fluxo Principal
1. O usuário navega até a página "Aulas".
2. O usuário localiza o horário de aula desejado na grade.
3. O usuário clica no ícone de "Check-in" (✓).
4. O sistema exibe modal de check-in com informações da aula.
5. O usuário seleciona o aluno no dropdown.
6. O usuário clica em "Confirmar Check-in".
7. O sistema verifica se a capacidade máxima não foi atingida.
8. O sistema registra o check-in com a data/hora atual.
9. O sistema atualiza o contador de check-ins na grade.
10. O sistema exibe toast de sucesso.

### Fluxo Alternativo — Capacidade Máxima Atingida
7a. O sistema identifica que o número de check-ins atingiu a capacidade máxima.  
7b. O sistema exibe mensagem "Capacidade máxima atingida".  
7c. O check-in não é registrado.

---

## UC006 — Visualizar Dashboard

**Ator Principal:** Qualquer usuário autenticado  
**Pré-condições:** O usuário deve estar autenticado.  
**Pós-condições:** O dashboard é exibido com dados atualizados.

### Fluxo Principal
1. O usuário acessa o Dashboard (página inicial após login).
2. O sistema carrega as estatísticas do banco de dados.
3. O sistema exibe os KPIs: total de alunos ativos, novos alunos no mês, matrículas ativas, inadimplentes.
4. O sistema exibe o gráfico de faturamento mensal.
5. O sistema exibe o gráfico de aulas mais populares.
6. O sistema exibe o status da catraca para alunos ativos.

### Dados exibidos
- **Total de Alunos:** Contagem de alunos com status "Ativo".
- **Novos este Mês:** Alunos cadastrados no mês corrente.
- **Matrículas Ativas:** Matrículas com status "Ativa" e data de término futura.
- **Inadimplentes:** Alunos com faturas pendentes vencidas há mais de 30 dias.
- **Faturamento Total:** Soma dos valores de faturas efetivamente pagas.
- **Catraca:** Liberada para alunos em dia, Bloqueada para inadimplentes 30+ dias.

---

## UC007 — Gerenciar Usuários do Sistema

**Ator Principal:** Administrador  
**Pré-condições:** O usuário deve estar autenticado com perfil de Administrador.  
**Pós-condições:** Usuário é criado, editado ou excluído conforme ação realizada.

### Fluxo Principal — Criar Usuário
1. O administrador navega até "Usuários".
2. Clica em "Novo Usuário".
3. Preenche: nome, email, senha, perfil.
4. Clica em "Criar Usuário".
5. O sistema valida os dados e cria o usuário com senha hasheada.

### Fluxo Alternativo — Editar Usuário
1. O administrador clica no ícone de editar ao lado do usuário.
2. O sistema exibe o modal com dados atuais.
3. O administrador altera os campos desejados.
4. O administrador clica em "Salvar".

### Fluxo Alternativo — Excluir Usuário
1. O administrador clica no ícone de excluir.
2. O sistema exibe modal de confirmação.
3. O administrador confirma a exclusão.
4. O sistema remove o usuário do banco de dados.
