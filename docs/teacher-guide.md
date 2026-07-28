# 🔒 GymManager Pro — Guia do Professor

> **⚠️ DOCUMENTO CONFIDENCIAL**  
> Este documento é destinado EXCLUSIVAMENTE ao professor da disciplina de Teste de Software.  
> **NÃO distribua este arquivo aos alunos.**

---

## Objetivo

O GymManager Pro contém **50 bugs intencionais** inseridos no código-fonte, identificados com a tag `// [BUG_INTENCIONAL_ID_X]`. Estes bugs servem como objetos de aprendizagem para que os alunos pratiquem:

- Análise de requisitos vs. implementação
- Técnicas de teste funcional e não-funcional
- Identificação de bugs de segurança, lógica, UI, e regras de negócio
- Escrita de relatórios de defeito
- Testes exploratórios

---

## Como Usar nas 20 Semanas

| Semana | Foco | Bugs Sugeridos |
|--------|------|---------------|
| 1-2 | Introdução a Testes, Instalação do Sistema | — |
| 3-4 | Testes de UI e Usabilidade | #4, #25, #31, #40, #44 |
| 5-6 | Testes de Validação de Dados | #1, #5, #13, #28, #30, #38 |
| 7-8 | Testes de Regras de Negócio | #2, #10, #14, #16, #17 |
| 9-10 | Testes de Integração Frontend-Backend | #15, #23, #29, #48 |
| 11-12 | Testes de Segurança | #3, #7, #12, #19, #26, #34, #39, #46 |
| 13-14 | Testes de Estado e Paginação | #6, #8, #9, #42 |
| 15-16 | Testes de Regras Financeiras | #21, #27, #33, #41, #47 |
| 17-18 | Testes de Dados e Integridade | #11, #20, #35, #36, #45, #49, #50 |
| 19-20 | Testes de Regressão e Automação | #18, #22, #24, #32, #37, #43 |

---

## Catálogo Completo dos 50 Bugs

| ID | Módulo | Título | Tipo | Severidade | Passos para Reproduzir | Comportamento Esperado | Comportamento Atual | Arquivo Afetado | Competência MSEP |
|----|--------|--------|------|-----------|----------------------|----------------------|--------------------|-----------------|--------------------|
| 1 | Alunos | CPF aceita letras no cadastro | Validação | Alta | 1. Abrir modal "Novo Aluno". 2. Digitar "ABC.DEF.GHI-JK" no campo CPF. 3. Preencher demais campos. 4. Clicar "Cadastrar". | Sistema deve rejeitar CPF com letras e exibir erro de validação. | CPF com letras é aceito e salvo no banco de dados normalmente. | `backend/src/validators/schemas.ts` (L6) e `frontend/src/pages/Students.tsx` | Teste de Validação de Dados |
| 2 | Financeiro | Desconto subtrai valor fixo ao invés de porcentagem | Regra de Negócio | Crítica | 1. Ir ao Financeiro. 2. Clicar no ícone % de uma fatura de R$ 89,90. 3. Inserir "10" como desconto. 4. Clicar "Aplicar". | Valor final: R$ 89,90 × 0,90 = R$ 80,91. | Valor final: R$ 89,90 - R$ 10,00 = R$ 79,90 (subtrai fixo). | `backend/src/controllers/financeController.ts` (L100) | Teste de Regra de Negócio |
| 3 | Usuários API | Rota GET /api/users não verifica autenticação JWT | Segurança | Crítica | 1. Usar Postman/curl. 2. Fazer GET http://localhost:3001/api/users sem header Authorization. | Deve retornar 401 Unauthorized. | Retorna 200 com lista completa de todos os usuários. | `backend/src/routes/userRoutes.ts` (L20) | Teste de Segurança |
| 4 | Matrículas | Botão "Criar Matrícula" desaparece em tela mobile | UI/Responsividade | Alta | 1. Abrir modal "Nova Matrícula". 2. Redimensionar navegador para < 768px. 3. Observar o botão de submit. | Botão "Criar Matrícula" deve estar sempre visível e acessível. | Botão desaparece (classe `hidden md:inline-flex`). | `frontend/src/pages/Enrollments.tsx` (L143) | Teste de Responsividade |
| 5 | Alunos | Data de nascimento aceita data futura | Validação | Alta | 1. Abrir modal "Novo Aluno". 2. Selecionar data de nascimento = "2030-01-01". 3. Preencher demais campos. 4. Salvar. | Sistema deve bloquear data futura com mensagem de erro. | Data futura é aceita e salva normalmente. | `backend/src/controllers/studentController.ts` (L47) | Teste de Validação |
| 6 | Alunos | Busca não encontra nomes com acento ao digitar sem acento | Filtro/Busca | Média | 1. Ir para página Alunos. 2. Digitar "Joao" na busca. 3. Clicar Filtrar. | Deve encontrar "João Silva" (busca insensível a acentos). | Não encontra "João" porque usa `contains` literal. | `backend/src/controllers/studentController.ts` (L22-26) | Teste de Filtro |
| 7 | Usuários | Recepcionista consegue excluir usuários (deve ser só Admin) | Autorização | Crítica | 1. Login como recepcao@lifefit.com. 2. Fazer DELETE /api/users/{id} via Postman. | Deve retornar 403 Forbidden. | Permite a exclusão (RECEPTIONIST está na lista de authorize). | `backend/src/routes/userRoutes.ts` (L67) | Teste de Permissão |
| 8 | Alunos | Estado do modal de edição vaza para "Novo Aluno" | Estado (React) | Média | 1. Clicar "Editar" no aluno "João". 2. Fechar modal sem salvar. 3. Clicar "Novo Aluno". | Formulário deve abrir vazio para novo cadastro. | Formulário abre preenchido com dados do "João" (shared state). | `frontend/src/pages/Students.tsx` (L29, L52-63) | Teste de Estado |
| 9 | Alunos | Paginação mostra mesmos dados em todas as páginas | Paginação | Alta | 1. Ir para Alunos. 2. Verificar "Página 1 de 4". 3. Clicar na página 2. | Deve exibir os alunos da página 2 (registros 11-20). | Exibe os mesmos alunos da página 1 (skip sempre = 0). | `backend/src/controllers/studentController.ts` (L14) | Teste de Paginação |
| 10 | Dashboard | Aluno inadimplente 30+ dias mostra catraca como "Liberada" | Regra de Negócio | Crítica | 1. Verificar no banco: aluno com fatura vencida há 30+ dias. 2. Ir ao Dashboard. 3. Ver seção "Status da Catraca". | Deve mostrar ícone de cadeado (Bloqueada) para inadimplentes. | Todos os alunos aparecem com cadeado aberto (RELEASED). | `backend/src/controllers/dashboardController.ts` (L41-46) | Teste de Regra de Negócio |
| 11 | Matrículas | Data de vencimento da fatura salva com 1 dia a menos | Data/Timezone | Média | 1. Criar matrícula com início em dia 15. 2. Verificar faturas geradas. 3. Comparar data de vencimento. | Vencimento deve ser no dia 10 de cada mês. | Vencimento salvo como dia 9 (setDate(9) ao invés de 10). | `backend/src/controllers/enrollmentController.ts` (L55) | Teste de Data |
| 12 | Autenticação | Token JWT nunca expira | Segurança | Alta | 1. Fazer login e copiar o token JWT. 2. Esperar várias horas/dias. 3. Usar o token em uma requisição. | Token deve expirar após período definido (ex: 8h). | Token funciona indefinidamente (sem `expiresIn`). | `backend/src/controllers/authController.ts` (L30-32) | Teste de Segurança |
| 13 | Alunos | Campo telefone aceita qualquer texto sem máscara | Validação | Baixa | 1. Abrir modal "Novo Aluno". 2. Digitar "abc123" no campo telefone. 3. Salvar. | Deve exigir formato (XX) XXXXX-XXXX. | Aceita qualquer string sem validação de formato. | `backend/src/validators/schemas.ts` (L7) | Teste de Validação |
| 14 | Planos | Excluir plano com matrículas ativas não é bloqueado | Regra de Negócio | Alta | 1. Verificar plano com matrículas ativas. 2. Clicar "Excluir" no plano. 3. Confirmar exclusão. | Deve bloquear com mensagem "Plano possui matrículas ativas". | Tenta excluir e pode falhar com erro de FK ou suceder indevidamente. | `backend/src/controllers/planController.ts` (L68) | Teste de Regra de Negócio |
| 15 | Financeiro | Pagar fatura não atualiza status da matrícula | Integração | Média | 1. Ter uma matrícula com fatura vencida. 2. Pagar a fatura. 3. Verificar status da matrícula. | Se todas faturas estão pagas, matrícula deve refletir status atualizado. | Fatura é paga mas matrícula não é atualizada. | `backend/src/controllers/financeController.ts` (L73-74) | Teste de Integração |
| 16 | Matrículas | Plano trimestral calcula data de término errada (4 meses) | Regra de Negócio | Crítica | 1. Criar matrícula com Plano Trimestral. 2. Verificar data de término calculada. | endDate = startDate + 3 meses. | endDate = startDate + 4 meses (código usa +4 para planos de 3 meses). | `backend/src/controllers/enrollmentController.ts` (L39-41) | Teste de Regra de Negócio |
| 17 | Aulas | Check-in permite exceder capacidade máxima da modalidade | Regra de Negócio | Alta | 1. Modalidade com maxCapacity=15. 2. Realizar 16+ check-ins. | Deve bloquear no 16° check-in com mensagem de capacidade. | Permite check-in ilimitado (comparação usa +100 no limite). | `backend/src/controllers/scheduleController.ts` (L83) | Teste de Regra de Negócio |
| 18 | Dashboard | "Novos alunos este mês" conta todos os alunos | Query/Lógica | Alta | 1. Ir ao Dashboard. 2. Verificar KPI "Novos este Mês". | Deve mostrar apenas alunos cadastrados no mês corrente. | Mostra contagem total de alunos (count sem filtro de data). | `backend/src/controllers/dashboardController.ts` (L11) | Teste de Lógica |
| 19 | Autenticação | Senha de um professor hasheada com MD5 ao invés de bcrypt | Segurança | Crítica | 1. Tentar login como joao.prof@lifefit.com / prof123. | Login deve funcionar normalmente. | Login falha porque bcrypt.compareSync não decodifica MD5. | `backend/prisma/seed.ts` (L14-16) | Teste de Segurança |
| 20 | Alunos | Excluir aluno não faz cascade em matrículas/faturas | Integridade de Dados | Alta | 1. Tentar excluir um aluno com matrículas vinculadas. | Deve excluir registros dependentes ou impedir com mensagem clara. | Erro de foreign key constraint (registros órfãos ou erro 500). | `backend/src/controllers/studentController.ts` (L83) | Teste de Integridade |
| 21 | Financeiro | Receita total inclui faturas canceladas no somatório | Regra de Negócio | Alta | 1. Ir ao Dashboard ou Financeiro > Resumo. 2. Verificar "Receita Total". | Deve somar apenas faturas com status PAID. | Soma faturas PAID e CANCELLED juntas. | `backend/src/controllers/financeController.ts` (L103-105) | Teste de Regra de Negócio |
| 22 | Aulas | Horários sobrepostos para mesmo instrutor não são validados | Regra de Negócio | Média | 1. Criar horário: Segunda 08:00-09:00, Instrutor A. 2. Criar outro: Segunda 08:30-09:30, Instrutor A. | Deve bloquear com "Horário sobreposto para este instrutor". | Ambos são criados sem validação de sobreposição. | `backend/src/controllers/scheduleController.ts` (L50-51) | Teste de Regra de Negócio |
| 23 | UI | Toast exibe "sucesso" quando ocorre erro ao salvar aluno | UI/Feedback | Alta | 1. Tentar cadastrar aluno com CPF duplicado. 2. Observar a notificação toast. | Deve exibir toast vermelho de erro. | Exibe toast verde de sucesso (addToast('success',...) no catch). | `frontend/src/pages/Students.tsx` (L93) | Teste de UI |
| 24 | Matrículas | Renovação cria matrícula duplicada sem expirar a anterior | Regra de Negócio | Alta | 1. Ter matrícula ativa para aluno X. 2. Clicar "Renovar". 3. Verificar lista de matrículas. | Matrícula anterior deve mudar para "Expirada" e nova ser criada. | Ambas ficam como "Ativa" (matrícula duplicada). | `backend/src/controllers/enrollmentController.ts` (L80-97) | Teste de Regra de Negócio |
| 25 | Alunos | Lista mostra alunos inativos sem indicador de filtro ativo | UI | Baixa | 1. Ir para Alunos. 2. Não selecionar filtro de status. 3. Observar a lista. | Deve mostrar indicador de que todos (ativos + inativos) estão listados, ou filtrar por padrão apenas ativos. | Lista mistura ativos e inativos sem distinção visual de filtro. | `frontend/src/pages/Students.tsx` | Teste de UI |
| 26 | Autenticação | Login retorna hash da senha na resposta da API | Segurança | Crítica | 1. Fazer POST /api/auth/login com credenciais válidas. 2. Inspecionar o JSON de resposta. | Resposta deve conter token e dados do usuário SEM a senha. | O campo `password` (hash bcrypt) aparece no objeto user retornado. | `backend/src/controllers/authController.ts` (L34-36) | Teste de Segurança |
| 27 | Financeiro | Filtro de faturas vencidas compara datas como strings | Lógica | Média | 1. Ir ao Financeiro. 2. Selecionar filtro "Vencidas". 3. Verificar resultados. | Deve listar faturas com vencimento < data atual. | Comparação incorreta usando `.toISOString()` como filtro Prisma. | `backend/src/controllers/financeController.ts` (L20-22) | Teste de Lógica |
| 28 | Planos | Preço do plano aceita valores negativos | Validação | Alta | 1. Abrir modal "Novo Plano". 2. Inserir preço "-50". 3. Salvar. | Deve rejeitar com "Preço deve ser positivo". | Plano é criado com preço negativo (Zod não tem `.positive()`). | `backend/src/validators/schemas.ts` (L41) | Teste de Validação |
| 29 | Dashboard | Gráfico de aulas populares não renderiza dados | UI/Gráfico | Alta | 1. Ir ao Dashboard. 2. Observar gráfico "Aulas Mais Populares". | Gráfico pizza deve mostrar modalidades com check-ins. | Gráfico vazio porque PieChart usa `dataKey="checkins"` mas API envia `value`. | `frontend/src/pages/Dashboard.tsx` (L117) e `backend/src/controllers/dashboardController.ts` (L80) | Teste de Integração |
| 30 | Alunos | Medidas corporais aceitam peso/altura negativos | Validação | Média | 1. Abrir detalhes de aluno. 2. Adicionar medida com peso = -70. | Deve rejeitar valores negativos. | Salva medida com peso negativo (Zod sem `.positive()`). | `backend/src/validators/schemas.ts` (L81-83) | Teste de Validação |
| 31 | UI | Modal aberto não impede scroll do fundo da página | UI | Baixa | 1. Abrir qualquer modal (ex: "Novo Aluno"). 2. Tentar scrollar a página ao fundo. | Scroll do fundo deve estar bloqueado enquanto modal está aberta. | Página de fundo continua scrollável (sem `overflow:hidden` no body). | `frontend/src/pages/Students.tsx` | Teste de UI |
| 32 | Matrículas | Cancelamento não gera nota de estorno pro-rata | Regra de Negócio | Média | 1. Matrícula ativa com faturas pagas. 2. Cancelar matrícula. 3. Verificar se gera nota de crédito. | Deve gerar nota de crédito/estorno proporcional ao período não utilizado. | Cancela sem gerar qualquer nota de estorno. | `backend/src/controllers/enrollmentController.ts` (L66) | Teste de Regra de Negócio |
| 33 | Financeiro | Pagamento marca fatura como paga sem verificar valor | Regra de Negócio | Alta | 1. Fatura de R$ 89,90. 2. Clicar "Pagar" sem informar valor. | Deve solicitar confirmação de valor ou permitir pagamento parcial. | Marca como PAID automaticamente sem qualquer confirmação de valor. | `backend/src/controllers/financeController.ts` (L73-74) | Teste de Regra de Negócio |
| 34 | API | CORS configurado com wildcard * em produção | Segurança | Alta | 1. Inspecionar código fonte do servidor. 2. Verificar configuração CORS. | CORS deve listar origens específicas permitidas em produção. | Usa `origin: '*'` que permite qualquer origem. | `backend/src/index.ts` (L16) | Teste de Segurança |
| 35 | Alunos | Atualizar foto do aluno não remove a foto anterior | Gerenciamento de Recursos | Baixa | 1. Cadastrar aluno com foto. 2. Editar e trocar a foto. 3. Verificar armazenamento. | Foto anterior deve ser removida do armazenamento. | Foto anterior permanece no sistema (sem limpeza). | `backend/src/controllers/studentController.ts` (L72) | Teste de Gerenciamento |
| 36 | Aulas | Check-in permite data futura | Validação | Média | 1. Fazer POST /api/schedules/{id}/checkin com `checkinDate: "2030-12-31"`. | Deve rejeitar datas futuras. | Aceita qualquer data, inclusive futuras. | `backend/src/controllers/scheduleController.ts` (L89) | Teste de Validação |
| 37 | Dashboard | Contador de inadimplentes usa operador de comparação invertido | Lógica | Alta | 1. Ir ao Dashboard. 2. Verificar KPI "Inadimplentes". 3. Comparar com dados reais. | Deve contar faturas PENDING com vencimento < 30 dias atrás. | Usa `gt` (maior que) ao invés de `lt` (menor que), contando faturas não vencidas. | `backend/src/controllers/dashboardController.ts` (L18-21) | Teste de Lógica |
| 38 | Planos | Duração de plano aceita 0 meses | Validação | Média | 1. Criar plano com duração = 0 meses. | Deve exigir mínimo de 1 mês. | Aceita 0 meses (Zod usa `.min(0)` ao invés de `.min(1)`). | `backend/src/validators/schemas.ts` (L39) | Teste de Validação |
| 39 | Autenticação | Token continua válido após logout | Segurança | Alta | 1. Fazer login e copiar o token. 2. Fazer logout. 3. Usar o token copiado em requisição via Postman. | Token deve ser invalidado após logout. | Token continua funcionando (logout só limpa localStorage). | `frontend/src/contexts/AuthContext.tsx` (L47-50) | Teste de Segurança |
| 40 | Alunos | Ordenação por nome é case-sensitive | UX | Baixa | 1. Ter alunos com nomes iniciando com maiúscula e minúscula. 2. Verificar ordem na tabela. | Ordenação deve ser case-insensitive. | Maiúsculas vêm antes de minúsculas (`localeCompare` padrão). | `frontend/src/pages/Students.tsx` (L105) | Teste de UX |
| 41 | Financeiro | Valor monetário exibido sem casas decimais no resumo | UI/Formatação | Média | 1. Ir ao Dashboard. 2. Verificar "Faturamento Total". | Deve exibir "R$ 1.234,56". | Exibe "R$ 1234" (sem decimais, usa `Math.floor`). | `frontend/src/pages/Dashboard.tsx` (L57) e `frontend/src/pages/Finance.tsx` (L95) | Teste de UI |
| 42 | Matrículas | Badge de status mostra "Ativa" para matrículas expiradas | Regra de Negócio | Alta | 1. Ter matrícula com endDate no passado e status "ACTIVE". 2. Verificar badge na lista. | Deve mostrar "Expirada" ou verificar a data de término. | Mostra "Ativa" ignorando a data de término (só checa status != CANCELLED). | `frontend/src/pages/Enrollments.tsx` (L69-72) | Teste de Regra de Negócio |
| 43 | Aulas | Dropdown de instrutores mostra todos os usuários | Filtro de Dados | Média | 1. Abrir modal "Novo Horário". 2. Verificar dropdown de Instrutor. | Deve listar apenas usuários com role = INSTRUCTOR. | Lista todos os usuários (Admin, Recepcionista, Aluno, Instrutor). | `frontend/src/pages/Classes.tsx` (L43) e `backend/src/routes/userRoutes.ts` | Teste de Filtro |
| 44 | UI | Modo escuro (dark mode) não persiste ao recarregar a página | Estado/UX | Baixa | 1. Ativar modo escuro clicando no ícone 🌙. 2. Recarregar a página (F5). | Modo escuro deve ser mantido. | Volta ao modo claro (não salva preferência no localStorage). | `frontend/src/components/layout/Header.tsx` (L8-15) | Teste de Estado |
| 45 | Alunos | Verificação de CPF duplicado converte para lowercase | Lógica (Dead Code) | Baixa | 1. Inspecionar código de criação de aluno. 2. Verificar query de duplicata de CPF. | Busca deve usar CPF exatamente como informado. | Converte para lowercase antes de buscar (CPF não tem letras normalmente, mas se BUG #1 permitir letras, causa inconsistência). | `backend/src/controllers/studentController.ts` (L50-51) | Análise de Código |
| 46 | API | Respostas de erro retornam stack trace | Segurança | Alta | 1. Causar um erro no backend (ex: ID inválido). 2. Inspecionar resposta JSON. | Deve retornar apenas mensagem genérica em produção. | Retorna `stack` com caminho completo dos arquivos do servidor. | `backend/src/index.ts` (L55-60) | Teste de Segurança |
| 47 | Financeiro | Sistema não suporta pagamento parcial | Regra de Negócio | Média | 1. Fatura de R$ 89,90. 2. Aluno quer pagar R$ 50,00. 3. Clicar "Pagar". | Deve permitir informar valor parcial e manter saldo. | Marca como totalmente paga independente do valor. | `backend/src/controllers/financeController.ts` (L74) | Teste de Regra de Negócio |
| 48 | Dashboard | Tooltip do gráfico mostra valor em centavos ao invés de reais | UI/Formatação | Média | 1. Ir ao Dashboard. 2. Passar mouse sobre barras do gráfico de faturamento. 3. Verificar tooltip. | Deve mostrar "R$ 89,90". | Mostra "8990" (multiplica por 100 no formatter). | `frontend/src/pages/Dashboard.tsx` (L60-61) | Teste de UI |
| 49 | Matrículas | Data de início usa fuso horário do servidor, não do cliente | Data/Timezone | Baixa | 1. Criar matrícula sem especificar data de início. 2. Verificar data salva. | Deve usar a data/hora local do cliente. | Usa `new Date()` do servidor (pode diferir do horário do cliente). | `backend/src/controllers/enrollmentController.ts` (L36) | Teste de Data |
| 50 | Dashboard | KPI "Total de alunos" conta alunos inativos | Regra de Negócio | Média | 1. Ir ao Dashboard. 2. Verificar KPI "Total de Alunos". 3. Comparar com alunos ativos. | Deve contar apenas alunos com status = ACTIVE. | Conta todos os alunos incluindo inativos (count sem filtro). | `backend/src/controllers/dashboardController.ts` (L8) | Teste de Regra de Negócio |

---

## Distribuição por Tipo

| Tipo | Quantidade | IDs |
|------|-----------|-----|
| Validação | 8 | 1, 5, 13, 28, 30, 36, 38, 45 |
| Regra de Negócio | 15 | 2, 10, 14, 16, 17, 21, 22, 24, 32, 33, 42, 47, 50, 18, 37 |
| Segurança | 9 | 3, 7, 12, 19, 26, 34, 39, 46 |
| UI/UX | 8 | 4, 23, 25, 29, 31, 40, 44, 48 |
| Lógica/Dados | 5 | 6, 8, 9, 27, 41 |
| Data/Timezone | 3 | 11, 36, 49 |
| Integração | 2 | 15, 35 |

## Distribuição por Severidade

| Severidade | Quantidade | IDs |
|-----------|-----------|-----|
| Crítica | 8 | 2, 3, 7, 10, 16, 19, 26, 34 |
| Alta | 19 | 1, 4, 5, 9, 12, 14, 17, 18, 20, 21, 23, 24, 28, 29, 33, 37, 39, 42, 46 |
| Média | 15 | 6, 8, 11, 15, 22, 27, 30, 32, 36, 38, 41, 43, 47, 48, 50 |
| Baixa | 8 | 13, 25, 31, 35, 40, 44, 45, 49 |

---

## Dicas para o Professor

1. **Não revele a quantidade de bugs** aos alunos — deixe-os encontrar o máximo possível.
2. **Use as severidades** para criar desafios progressivos (começar pelos de alta severidade).
3. **Peça relatórios de defeito** formais (seguindo template padrão).
4. **Compare requisitos vs. implementação** — os alunos devem usar o `requisitos.md` como baseline.
5. **Automatização**: Os atributos `data-testid` permitem automação com Cypress/Playwright.
6. **Os bugs são encontráveis pela tag** `// [BUG_INTENCIONAL_ID_X]` no código — ideal para correção após identificação.
