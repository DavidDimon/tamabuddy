# Engine change entry

Use `../docs/extension-points.md` for concrete placement examples after classifying the change.

Classify a proposed engine change before choosing a file or pattern:

- formalized behavior -> read `docs/domain-model.md`, its owning document, and `rules/domain-behavior-consistency.md` first;

- invariant or state owned by one concept -> future entity/value object or a pure rule;
- behavioral state/transition -> future machine;
- event coordinating several transformations -> future processor;
- reusable named decision -> future policy;
- composable criteria -> future specification;
- genuinely interchangeable algorithm -> future strategy;
- persistence capability -> repository contract, implemented by infrastructure;
- external/save format translation -> adapter;
- elapsed-time behavior -> injected clock plus the owning rule/processor.

These are retrieval hints, not permission to instantiate every pattern. Inspect the current source and document any proposed boundary before adding it. Existing extension points include application ports, the elapsed-time processor, the XState machine foundation, infrastructure clock/persistence, and the deliberate public API.
