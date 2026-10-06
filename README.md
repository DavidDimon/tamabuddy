# Tamabuddy Nx + Harness — Prompt Pack

Execute os prompts em ordem, a partir da raiz do repositório. Cada etapa deve validar o resultado e pedir autorização antes de seguir para a próxima.

Objetivo final: monorepo Nx do projeto Tamabuddy, com app React, biblioteca TypeScript `tamabuddy-engine`, harness arquitetural e uma engine própria de simulação de mascote virtual. O front-end consome a engine exclusivamente pelas APIs públicas do projeto.

Ordem:

1. `01-project-base-nx.md`
2. `02-harness-base.md`
3. `03-engine-architecture.md`
4. `04-frontend-base.md`
5. `05-tamabuddy-domain-rules.md`
6. `06-engine-architecture-docs.md`
7. `07-harness-implementation.md`
8. `08-engine-implementation.md`
9. `09-final-validation.md`

## Convenções globais

Todos os prompts devem preservar estas convenções, mesmo quando a etapa não as repetir explicitamente:

- testes usam o sufixo `.spec.ts`; não criar arquivos `.test.ts`;
- mocks continuam com o sufixo `.mock.ts`;
- commits seguem Conventional Commits no formato `<type>(<scope-ou-task>): <mensagem>`, por exemplo `feat(engine): add hunger decay`;
- Husky executa o `commitlint` no hook `commit-msg`;
- textos do harness podem ser otimizados pela skill Caveman, sem alterar código, comandos, paths, símbolos, mensagens de erro ou significado técnico;
- mudanças de código devem passar pela rule/skill de code smells definida no harness.

## Convenção obrigatória de testes

Para cada área/entidade, testes e mocks devem ficar próximos da implementação:

```text
feature/
├── SomeEntity.ts
├── __tests__/
│   └── SomeEntity.spec.ts
└── __mocks__/
    └── SomeEntity.mock.ts
```

Quando houver múltiplas entidades no mesmo diretório, organize os mocks por entidade dentro de `__mocks__`; não criar um diretório global de mocks para todo o engine. A mesma regra vale para processors, strategies, policies, specifications etc. Configure Vitest/Nx para reconhecer `*.spec.ts` e audite que nenhum `*.test.ts` seja criado.
