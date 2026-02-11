; Keywords
"fn" @keyword.function
"return" @keyword.return
"let" @keyword
"if" @keyword.conditional
"else" @keyword.conditional
"while" @keyword.repeat
"for" @keyword.repeat
"in" @keyword.repeat
"match" @keyword.conditional
"class" @keyword.type
"trait" @keyword.type
"enum" @keyword.type
"impl" @keyword
"import" @keyword.import
"pub" @keyword.modifier
"mut" @keyword.modifier
"self" @variable.builtin

; Types
(builtin_type) @type.builtin
(type (identifier) @type)
(qualified_type
  module: (identifier) @module
  name: (identifier) @type)
(array_type "[" @punctuation.bracket)
(array_type "]" @punctuation.bracket)

; Functions
(function_definition
  name: (identifier) @function.definition)
(trait_method
  name: (identifier) @function.definition)
(call_expression
  function: (identifier) @function.call)
(method_call_expression
  method: (identifier) @function.method)

; Class / trait / enum definitions
(class_definition
  name: (identifier) @type.definition)
(trait_definition
  name: (identifier) @type.definition)
(enum_definition
  name: (identifier) @type.definition)
(enum_variant
  name: (identifier) @constant)

; Struct literals
(struct_literal
  name: (identifier) @type)
(struct_literal
  name: (field_access_expression
    object: (identifier) @type
    field: (identifier) @constant))

; Match patterns
(match_pattern
  enum_name: (identifier) @type
  variant: (identifier) @constant)

; Parameters
(parameter
  name: (identifier) @variable.parameter)

; Fields
(field_definition
  name: (identifier) @property)
(field_access_expression
  field: (identifier) @property)
(field_value
  name: (identifier) @property)

; Variables
(let_statement
  name: (identifier) @variable)
(for_statement
  variable: (identifier) @variable)
(assignment_expression
  target: (identifier) @variable)

; Import
(import_statement (identifier) @module)

; Impl clause
(impl_clause (identifier) @type)

; Literals
(integer_literal) @number
(float_literal) @number.float
(string_literal) @string
(boolean_literal) @boolean

; Operators
(binary_expression
  operator: _ @operator)
(unary_expression
  operator: _ @operator)
"=" @operator

; Punctuation
"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"," @punctuation.delimiter
":" @punctuation.delimiter
"." @punctuation.delimiter

; Comments
(comment) @comment
