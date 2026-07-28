# GymManager Pro — Documento de Requisitos

> **Projeto:** GymManager Pro  
> **Empresa:** FitTech Solutions  
> **Cliente:** Academia LifeFit  
> **Data:** 2024  
> **Versão:** 1.0

---

## 1. Introdução

O GymManager Pro é um sistema web de gerenciamento completo para academias, desenvolvido pela FitTech Solutions para a Academia LifeFit. O sistema permite controle de alunos, planos, matrículas, aulas, financeiro e dashboard gerencial.

---

## 2. Requisitos Funcionais

### RF001 — Autenticação
- **RF001.1:** O sistema deve permitir login com email e senha.
- **RF001.2:** O sistema deve suportar 4 níveis de acesso: Administrador, Recepcionista, Professor e Aluno.
- **RF001.3:** O sistema deve oferecer funcionalidade de "Esqueci minha senha" (envio de email de recuperação).
- **RF001.4:** O sistema deve manter a sessão do usuário via token JWT.
- **RF001.5:** O sistema deve permitir logout com limpeza da sessão local.

### RF002 — Gestão de Alunos
- **RF002.1:** O sistema deve permitir cadastrar alunos com: foto, nome, CPF, data de nascimento, telefone, endereço e status.
- **RF002.2:** O sistema deve validar o formato do CPF (apenas números, formato XXX.XXX.XXX-XX).
- **RF002.3:** O sistema deve impedir cadastro de CPF duplicado.
- **RF002.4:** O sistema deve permitir editar dados cadastrais do aluno.
- **RF002.5:** O sistema deve permitir excluir alunos, verificando dependências (matrículas, faturas).
- **RF002.6:** O sistema deve exibir o histórico de medidas corporais do aluno (peso, altura, % gordura, circunferências).
- **RF002.7:** O sistema deve permitir buscar alunos por nome, CPF ou telefone.
- **RF002.8:** O sistema deve paginar a lista de alunos (10 por página).
- **RF002.9:** O sistema deve filtrar alunos por status (Ativo/Inativo).
- **RF002.10:** O sistema não deve permitir data de nascimento no futuro.

### RF003 — Planos e Matrículas
- **RF003.1:** O sistema deve permitir criar planos com: nome, descrição, duração em meses e preço.
- **RF003.2:** O sistema deve validar que o preço é positivo e a duração é de pelo menos 1 mês.
- **RF003.3:** O sistema deve impedir exclusão de planos com matrículas ativas vinculadas.
- **RF003.4:** O sistema deve permitir matricular um aluno em um plano, calculando automaticamente a data de término.
- **RF003.5:** O sistema deve gerar automaticamente as faturas mensais ao criar uma matrícula.
- **RF003.6:** O sistema deve permitir cancelar uma matrícula, cancelando também as faturas pendentes.
- **RF003.7:** O sistema deve permitir renovar uma matrícula, expirando a anterior e criando nova.
- **RF003.8:** O sistema deve exibir o status correto da matrícula: Ativa, Cancelada ou Expirada.

### RF004 — Agenda e Aulas
- **RF004.1:** O sistema deve permitir cadastrar modalidades (nome, descrição, capacidade máxima).
- **RF004.2:** O sistema deve permitir criar horários de aulas vinculados a modalidades e instrutores.
- **RF004.3:** O sistema deve validar sobreposição de horários para o mesmo instrutor.
- **RF004.4:** O sistema deve permitir check-in de alunos em aulas.
- **RF004.5:** O sistema deve respeitar o limite de capacidade máxima de cada modalidade.
- **RF004.6:** O dropdown de instrutores deve mostrar apenas usuários com perfil de Professor.

### RF005 — Financeiro
- **RF005.1:** O sistema deve exibir lista de faturas com filtro por status.
- **RF005.2:** O sistema deve permitir registrar pagamento de fatura (baixa).
- **RF005.3:** O sistema deve permitir aplicar desconto percentual em faturas.
- **RF005.4:** O desconto de X% deve calcular: valor_final = valor_original × (1 - X/100).
- **RF005.5:** O sistema deve exibir resumo financeiro: receita total, pendente, vencidas.
- **RF005.6:** A receita total deve considerar apenas faturas efetivamente pagas (excluindo canceladas).
- **RF005.7:** Alunos inadimplentes há mais de 30 dias devem ter a catraca bloqueada (status visual).
- **RF005.8:** O sistema deve suportar pagamento parcial de faturas.

### RF006 — Dashboard
- **RF006.1:** O sistema deve exibir KPIs: total de alunos ativos, novos alunos no mês, matrículas ativas, inadimplentes.
- **RF006.2:** O sistema deve exibir gráfico de faturamento mensal.
- **RF006.3:** O sistema deve exibir gráfico de aulas mais populares (por check-ins).
- **RF006.4:** O sistema deve exibir o status da catraca para cada aluno ativo.
- **RF006.5:** O KPI "Novos alunos este mês" deve contar apenas alunos cadastrados no mês corrente.
- **RF006.6:** O KPI "Total de alunos" deve contar apenas alunos com status Ativo.

---

## 3. Requisitos Não Funcionais

### RNF001 — Segurança
- **RNF001.1:** Todas as rotas da API (exceto login e recuperação de senha) devem exigir autenticação JWT.
- **RNF001.2:** Senhas devem ser armazenadas com hash bcrypt (salt round ≥ 10).
- **RNF001.3:** Tokens JWT devem ter tempo de expiração definido (recomendado: 8 horas).
- **RNF001.4:** O login não deve retornar o hash da senha na resposta.
- **RNF001.5:** CORS deve ser configurado para aceitar apenas origens autorizadas em produção.
- **RNF001.6:** Respostas de erro não devem expor stack traces em produção.
- **RNF001.7:** O logout deve invalidar o token no servidor (blacklist ou rotação).

### RNF002 — Usabilidade
- **RNF002.1:** O sistema deve ser responsivo (desktop, tablet e mobile).
- **RNF002.2:** Botões de ação devem estar sempre acessíveis, inclusive em telas menores.
- **RNF002.3:** Feedback visual (toasts) deve ser mostrado para todas as ações do usuário.
- **RNF002.4:** O sistema deve exibir estados de carregamento (skeletons) durante requisições.
- **RNF002.5:** Modais devem bloquear scroll do fundo enquanto abertas.
- **RNF002.6:** O modo escuro (dark mode) deve persistir entre sessões.

### RNF003 — Validação de Dados
- **RNF003.1:** CPF deve aceitar apenas caracteres numéricos e pontuação (formato: XXX.XXX.XXX-XX).
- **RNF003.2:** Telefone deve ter máscara de formato: (XX) XXXXX-XXXX.
- **RNF003.3:** Busca textual deve ser insensível a acentos (ex: "Joao" deve encontrar "João").
- **RNF003.4:** Medidas corporais (peso, altura) devem aceitar apenas valores positivos.

### RNF004 — Performance
- **RNF004.1:** A paginação deve buscar apenas os dados da página solicitada (não todos os registros).
- **RNF004.2:** O sistema deve manter tempo de resposta abaixo de 500ms para listagens simples.

### RNF005 — Testabilidade
- **RNF005.1:** Todos os elementos interativos devem possuir atributos `data-testid` únicos.
- **RNF005.2:** O sistema deve ser testável com frameworks como Cypress e Playwright.

---

## 4. Regras de Negócio

| ID | Regra |
|----|-------|
| RN001 | O CPF do aluno é único no sistema. |
| RN002 | A data de nascimento deve ser uma data no passado. |
| RN003 | O preço de um plano deve ser maior que zero. |
| RN004 | A duração de um plano deve ser de pelo menos 1 mês. |
| RN005 | Um aluno só pode ter uma matrícula ativa por vez. |
| RN006 | Ao cancelar uma matrícula, todas as faturas pendentes são automaticamente canceladas. |
| RN007 | O desconto é calculado como porcentagem: `finalAmount = amount × (1 - discount/100)`. |
| RN008 | Alunos com faturas vencidas há mais de 30 dias têm a catraca bloqueada. |
| RN009 | Não é possível excluir um plano com matrículas ativas. |
| RN010 | O check-in em aula respeita o limite de capacidade da modalidade. |
| RN011 | Horários de aula não podem sobrepor para o mesmo instrutor. |
| RN012 | Apenas administradores podem excluir usuários. |
| RN013 | A renovação de matrícula deve expirar a matrícula anterior antes de criar a nova. |
| RN014 | O check-in não pode ser registrado com data futura. |
| RN015 | A exclusão de aluno deve verificar e tratar registros dependentes (matrículas, faturas, check-ins). |
