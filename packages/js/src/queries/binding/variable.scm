;; variable declarations

;; @kind = "const" | "let"
(lexical_declaration
  [("const") ("let")] @kind
  (variable_declarator
    name: (_) @name
    value: (_)? @v (#not-match? @v "^[(]?[ \t\n]*(function|class|require|import|await import|[(][^)]*[)][ \t\n]*=>)"))
) @node

;; @kind = "var"
(variable_declaration
  ("var") @kind
  (variable_declarator
    name: (_) @name
    value: (_)? @v (#not-match? @v "^[(]?[ \t\n]*(function|class|require|import|await import|[(][^)]*[)][ \t\n]*=>)"))
) @node

;; Rust regex
;; "^[(]?[ \t\n]*(function|class|require|import|await import|[(][^)]*[)][ \t\n]*=>)"
;; function ...
;; (...) => ...
;; class ...
;; (function ...)
;; (() => ...)
;; require ...
;; import ...
;; await import ...