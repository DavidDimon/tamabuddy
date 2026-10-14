# Roadmap: eficiência de contexto e avaliação do Jev

Status: active

Progress: milestone 1 completed on 2026-10-14. The reproducible scenario set,
collector, first command/input measurements, and six passing retrieval-quality
checks live under `baselines/agent-context/`. Milestone 2 has not started.

## Target outcome

Reduzir o contexto e a saída de ferramentas consumidos durante manutenção do
Tamabuddy sem enfraquecer recuperação arquitetural, qualidade, segurança ou
evidência de conclusão. Avaliar o Jev apenas como roteador estruturado e adotá-lo
somente se um experimento reproduzível demonstrar economia líquida com precisão
aceitável.

O roadmap termina com:

- comandos de agente com saída previsível e limitada;
- handoffs curtos que permitem iniciar uma conversa por milestone;
- recuperação progressiva que não carrega referências externas sem necessidade;
- uma baseline comparável antes/depois;
- uma decisão registrada de adotar, adiar ou rejeitar Jev.

## Baseline

### Estado verificado

- O harness já roteia solicitações entre engine, desktop e product delivery e
  orienta leitura progressiva.
- Uma tarefa visual lê aproximadamente 24 mil caracteres de orientação; o
  snapshot completo do Taste representa cerca de 16 mil caracteres desse total.
- O harness inteiro contém aproximadamente 153 mil caracteres, mas não deve ser
  recuperado por completo em uma tarefa normal.
- `NX_DAEMON=false NX_ISOLATE_PLUGINS=false` removeu os avisos repetitivos de
  workers isolados observados no ambiente atual.
- Um único `nx show project --json` ainda produziu mais de 6 mil tokens de saída,
  mesmo sem os avisos.
- Testes direcionados, cobertura, lint, typecheck, build e verificações visuais
  já existem; a otimização não pode retirar esses gates do fechamento de um
  milestone.
- `.env` e `.env.*` são ignorados, com exceção de `.env.example`. Nenhuma chave
  TypeSafe está armazenada no repositório.

### Hipóteses a validar

- Histórico longo e saída de ferramentas são fontes maiores de desperdício que
  as instruções mínimas recuperadas pelo harness.
- Um handoff estruturado permite trocar de conversa com pouca ou nenhuma perda
  de precisão.
- A maior parte das tarefas visuais pode usar um checklist local curto; o
  snapshot integral do Taste pode ficar reservado para auditorias profundas e
  atualização do checklist.
- Jev pode ajudar em classificação ambígua e ranqueamento de documentos, mas não
  deve substituir rotas determinísticas conhecidas.

## Milestones

### 1. Criar uma baseline reproduzível

- Outcome: tornar consumo, latência e qualidade comparáveis antes de otimizar.
- Entry conditions: comandos e avaliações atuais executáveis; nenhum segredo é
  necessário.
- Deliverables:
  - definir de 6 a 10 cenários representativos: localização de mudança, pequena
    alteração desktop, alteração engine, revisão, planejamento e polimento
    visual;
  - registrar para cada cenário documentos lidos, caracteres de entrada
    controlável, bytes/linhas de saída das ferramentas, duração, reruns e gates
    aprovados;
  - registrar manualmente estimativas disponíveis na tela de uso do Codex,
    separando-as das métricas coletadas pelo repositório;
  - criar um formato curto de relatório que não armazene prompts, segredos ou
    conteúdo sensível.
- Exit evidence: todos os cenários possuem uma execução inicial registrada e
  podem ser repetidos sem interpretação adicional.
- Risks and decisions: tokens internos e cache do Codex podem não estar
  disponíveis programaticamente; nesse caso, caracteres/bytes e uso exibido na
  interface permanecem métricas distintas, sem falsa conversão exata.

### 2. Tornar comandos de agente silenciosos e direcionados

- Outcome: impedir que descoberta, testes e Nx despejem saída irrelevante no
  contexto.
- Entry conditions: baseline do milestone 1 disponível.
- Deliverables:
  - oferecer uma entrada de execução voltada ao agente que aplique as opções de
    Nx compatíveis com o ambiente, sem alterar silenciosamente a experiência dos
    comandos humanos existentes;
  - preferir projeto/arquivo afetado durante desenvolvimento e reservar
    `run-many`, cobertura completa e build para o fechamento;
  - limitar reporters, stack traces e impressão de DOM, preservando o log
    completo em arquivo ignorado quando um diagnóstico exigir detalhe;
  - extrair somente campos necessários de comandos JSON de descoberta;
  - documentar fallback quando uma opção compacta ocultar a causa de uma falha.
- Exit evidence: os cenários aplicáveis reduzem em pelo menos 50% bytes de saída
  sem alterar exit code, diagnóstico acionável ou resultado dos gates.
- Risks and decisions: saída curta demais pode esconder falhas; qualquer resumo
  deve manter comando, alvo, status e caminho para o log completo.

### 3. Introduzir orçamento de contexto e handoff por milestone

- Outcome: permitir conversas curtas e recuperação previsível do estado.
- Entry conditions: métricas de contexto controlável do milestone 1.
- Deliverables:
  - adicionar um template de handoff com objetivo, mudanças concluídas,
    validações, decisões, riscos, worktree e próximo passo;
  - orientar início de uma nova conversa ao concluir um milestone ou quando o
    histórico deixa de contribuir para a tarefa atual;
  - definir orçamento indicativo por classe de tarefa para documentos do
    harness, código e saída de ferramentas, tratado como alerta e não como gate
    cego;
  - manter `current-state.md` como fato implementado e handoffs como estado
    transitório, evitando duplicação arquitetural.
- Exit evidence: um cenário é concluído em uma conversa nova usando apenas o
  handoff e a recuperação normal, com o mesmo resultado esperado e redução de
  pelo menos 30% no contexto controlável.
- Risks and decisions: handoffs não podem afirmar que trabalho não verificado
  está concluído nem carregar logs completos para compensar uma síntese ruim.

### 4. Compactar a recuperação de design sem perder o Taste

- Outcome: reduzir o custo recorrente de tarefas visuais mantendo o snapshot
  externo auditável e disponível.
- Entry conditions: cenários visuais da baseline e identidade visual atual
  preservados.
- Deliverables:
  - extrair um checklist local curto apenas das regras aplicadas ao Tamabuddy,
    com proveniência para o snapshot versionado;
  - usar o checklist curto em polimentos focados;
  - carregar o Taste integral somente para auditoria ampla, revisão do próprio
    checklist ou problema sem cobertura local;
  - acrescentar avaliações de recuperação que detectem tanto leitura excessiva
    quanto ausência do Taste quando ele é necessário.
- Exit evidence: os cenários visuais mantêm as mesmas constatações e gates,
  reduzindo em pelo menos 50% os caracteres de orientação recuperados em
  polimentos focados.
- Risks and decisions: a síntese local não pode virar uma cópia divergente nem
  remover a precedência definida na decisão 001; atualização do snapshot deve
  revisar também o checklist.

### 5. Executar um spike opcional com Jev

- Outcome: determinar com dados se decisão estruturada externa reduz o custo
  total de solicitações ambíguas.
- Entry conditions:
  - milestones 1 a 4 concluídos;
  - ainda existe custo relevante de roteamento não resolvido por regras
    determinísticas;
  - aprovação explícita para enviar ao TypeSafe somente metadados ou trechos
    minimizados;
  - `TYPESAFE_API_KEY` fornecida por variável de ambiente ou secret manager,
    nunca em arquivo versionado.
- Deliverables:
  - protótipo isolado, opt-in e fail-open: indisponibilidade do Jev retorna ao
    roteamento determinístico;
  - uma única chamada com perguntas independentes para classificar domínio,
    ranquear documentos candidatos e indicar confiança;
  - allowlist de dados enviados, redaction de segredos, timeout, retry limitado,
    orçamento e telemetria sem conteúdo sensível;
  - comparação A/B contra o roteador atual nos cenários da baseline;
  - registro de decisão com custo, latência, precisão, economia downstream,
    privacidade e manutenção.
- Exit evidence: decisão explícita de adotar, adiar ou rejeitar. Adoção exige,
  simultaneamente, pelo menos 95% de acerto nas rotas protegidas, nenhuma quebra
  de gate, redução líquida mínima de 20% no contexto controlável dos casos
  elegíveis e latência mediana adicional de no máximo 500 ms.
- Risks and decisions: Jev retorna decisões estruturadas, não compacta o
  histórico do Codex e não recupera tokens já consumidos. Se não superar o
  roteamento local após incluir sua própria entrada, saída, latência e custo, o
  protótipo deve ser removido e a decisão registrada como rejeitada ou adiada.

## Measures

- Caracteres de documentação e código recuperados por cenário.
- Bytes e linhas emitidos por comando no contexto do agente.
- Quantidade de comandos repetidos após falha pouco informativa.
- Duração total e latência mediana por cenário.
- Percentual de cenários concluídos com todos os gates aprovados.
- Precisão de roteamento e taxa de fallback.
- Uso/custo exibido pelo Codex, quando disponível, registrado separadamente.
- Para Jev: tokens de entrada/saída, custo, latência e confiança retornados pelo
  serviço.

## Sequencing and stop conditions

1. Executar milestones 1 e 2 como melhorias obrigatórias de baixo risco.
2. Executar milestone 3 e repetir a baseline antes de alterar o fluxo de design.
3. Executar milestone 4 somente se o custo do Taste continuar material.
4. Encerrar sem Jev se os milestones 2 a 4 atingirem a meta de redução e o
   roteamento ambíguo deixar de ser relevante.
5. Executar milestone 5 apenas para casos que continuarem caros ou ambíguos.

## Explicit non-goals

- Trocar o modelo principal do Codex ou alterar seu gerenciamento interno de
  contexto.
- Enviar código-fonte, prompts completos, segredos ou logs indiscriminadamente a
  um serviço externo.
- Fazer do Jev uma dependência do build, runtime do jogo ou gates de CI.
- Remover validações completas de fechamento para economizar tokens.
- Converter estimativas por caracteres em uma alegação de tokens exatos.
- Reescrever o harness inteiro ou duplicar suas regras em adapters.

## Unresolved choices

- Onde persistir os relatórios de baseline: artefato local ignorado ou resumo
  versionado sem conteúdo sensível.
- Se a entrada silenciosa será um script Node portátil, uma convenção de comando
  ou ambos.
- Qual fonte de uso do Codex estará disponível de forma estável para comparação.
- Qual política de retenção e região do TypeSafe é aceitável antes do spike.
