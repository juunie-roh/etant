;; function declaration
;; @is_async function @name@params @body
(function_declaration
  "async"? @is_async
  name: (identifier) @name
  parameters: (formal_parameters) @params
  body: (statement_block) @body
)@node
;; @is_async function* @name@params @body
(generator_function_declaration
  "async"? @is_async
  name: (identifier) @name
  parameters: (formal_parameters) @params
  body: (statement_block) @body
) @node

;; arrow function / function expression
;; const/let @name = @is_async @params => @body
;; const/let @name = @is_async function @params @body
;; const/let @name = @is_async function* @params @body
(lexical_declaration
  (variable_declarator
    name: (identifier) @name
    value: [
      (arrow_function
        "async"? @is_async
        parameter: (identifier)? @params
        parameters: (formal_parameters)? @params
        body: (_) @body)
      (function_expression
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
      (generator_function
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
    ])
) @node

;; const/let @name = (@is_async @params => @body)
;; const/let @name = (@is_async function @params @body)
;; const/let @name = (@is_async function* @params @body)
(lexical_declaration
  (variable_declarator
    name: (identifier) @name
    value: (parenthesized_expression [
      (arrow_function
        "async"? @is_async
        parameter: (identifier)? @params
        parameters: (formal_parameters)? @params
        body: (_) @body)
      (function_expression
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
      (generator_function
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
    ]))
) @node

;; var @name = @is_async @params => @body
;; var @name = @is_async function @params @body
;; var @name = @is_async function* @params @body
(variable_declaration
  (variable_declarator
    name: (identifier) @name
    value: [
      (arrow_function
        "async"? @is_async
        parameter: (identifier)? @params
        parameters: (formal_parameters)? @params
        body: (_) @body)
      (function_expression
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
      (generator_function
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
    ])
) @node

;; var @name = (@is_async @params => @body)
;; var @name = (@is_async function @params @body)
;; var @name = (@is_async function* @params @body)
(variable_declaration
  (variable_declarator
    name: (identifier) @name
    value: (parenthesized_expression [
      (arrow_function
        "async"? @is_async
        parameter: (identifier)? @params
        parameters: (formal_parameters)? @params
        body: (_) @body)
      (function_expression
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
      (generator_function
        "async"? @is_async
        parameters: (formal_parameters) @params
        body: (statement_block) @body)
    ]))
) @node