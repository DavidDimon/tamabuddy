# Strategies

No Strategy exists in the engine. V1 stage decay differs by numeric data, so a typed table or pure lookup is the correct mechanism.

Add a Strategy only when:

- at least two algorithms implement the same domain operation;
- selection occurs at runtime or composition time;
- callers should depend on one stable contract;
- shared contract tests can verify every implementation.

Different constants, species data, or one `if` branch are not enough. Do not name a lookup table `Strategy`. If future species use distinct decay algorithms, keep selection in engine composition and algorithms in domain code; React and persistence must not choose care outcomes.
