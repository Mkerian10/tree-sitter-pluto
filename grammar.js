/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "pluto",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.method_call_expression, $.field_access_expression],
  ],

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          $.import_statement,
          $.function_definition,
          $.class_definition,
          $.trait_definition,
          $.enum_definition,
          $.error_definition,
          $.app_definition,
          $.test_definition,
        ),
      ),

    comment: (_) => token(seq("//", /.*/)),

    // ── Imports ──────────────────────────────────────────────

    import_statement: ($) => seq("import", $.identifier),

    // ── Functions ────────────────────────────────────────────

    function_definition: ($) =>
      seq(
        optional("pub"),
        "fn",
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        optional(field("return_type", $.type)),
        field("body", $.block),
      ),

    parameter_list: ($) => seq($.parameter, repeat(seq(",", $.parameter))),

    parameter: ($) =>
      choice(
        seq(optional("mut"), "self"),
        seq(field("name", $.identifier), ":", field("type", $.type)),
      ),

    // ── Classes ──────────────────────────────────────────────

    class_definition: ($) =>
      seq(
        optional("pub"),
        "class",
        field("name", $.identifier),
        optional($.impl_clause),
        "{",
        repeat(choice($.field_definition, $.function_definition)),
        "}",
      ),

    impl_clause: ($) =>
      seq("impl", $.identifier, repeat(seq(",", $.identifier))),

    field_definition: ($) =>
      seq(field("name", $.identifier), ":", field("type", $.type)),

    // ── Traits ───────────────────────────────────────────────

    trait_definition: ($) =>
      seq(
        optional("pub"),
        "trait",
        field("name", $.identifier),
        "{",
        repeat($.trait_method),
        "}",
      ),

    trait_method: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        "(",
        optional($.parameter_list),
        ")",
        optional(field("return_type", $.type)),
        optional(field("body", $.block)),
      ),

    // ── Enums ────────────────────────────────────────────────

    enum_definition: ($) =>
      seq(
        optional("pub"),
        "enum",
        field("name", $.identifier),
        "{",
        repeat($.enum_variant),
        "}",
      ),

    enum_variant: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("{", $.field_list, "}")),
      ),

    field_list: ($) =>
      seq($.field_definition, repeat(seq(",", $.field_definition))),

    // ── Errors ───────────────────────────────────────────

    error_definition: ($) =>
      seq(
        optional("pub"),
        "error",
        field("name", $.identifier),
        "{",
        repeat($.field_definition),
        "}",
      ),

    // ── Apps ─────────────────────────────────────────────

    app_definition: ($) =>
      seq(
        optional("pub"),
        "app",
        field("name", $.identifier),
        optional(seq("[", $.parameter_list, "]")),
        "{",
        repeat(choice($.function_definition, $.ambient_declaration)),
        "}",
      ),

    ambient_declaration: ($) =>
      seq("ambient", $.identifier),

    // ── Tests ────────────────────────────────────────────

    test_definition: ($) =>
      seq(
        "test",
        field("name", $.string_literal),
        $.block,
      ),

    // ── Types ────────────────────────────────────────────────

    type: ($) =>
      choice($.builtin_type, $.identifier, $.qualified_type, $.array_type),

    builtin_type: (_) => choice("int", "float", "bool", "string", "void"),

    qualified_type: ($) =>
      seq(field("module", $.identifier), ".", field("name", $.identifier)),

    array_type: ($) => seq("[", $.type, "]"),

    // ── Statements ───────────────────────────────────────────

    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.let_statement,
        $.return_statement,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.match_statement,
        $.expression_statement,
      ),

    let_statement: ($) =>
      seq(
        "let",
        field("name", $.identifier),
        optional(seq(":", field("type", $.type))),
        "=",
        field("value", $._expression),
      ),

    return_statement: ($) =>
      prec.right(seq("return", optional($._expression))),

    if_statement: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        field("then", $.block),
        optional(seq("else", field("else", $.block))),
      ),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $._expression),
        field("body", $.block),
      ),

    for_statement: ($) =>
      seq(
        "for",
        field("variable", $.identifier),
        "in",
        field("iterable", $._expression),
        field("body", $.block),
      ),

    match_statement: ($) =>
      seq(
        "match",
        field("scrutinee", $._expression),
        "{",
        repeat($.match_arm),
        "}",
      ),

    // Match arm: EnumName.Variant { body } or EnumName.Variant { bindings } { body }
    // Tree-sitter can't distinguish { bindings } from { body } without semantic info,
    // so we parse the whole arm as a pattern followed by one or two blocks.
    // The highlights.scm handles the visual distinction.
    match_arm: ($) =>
      seq(
        field("pattern", $.match_pattern),
        field("body", $.block),
        optional(field("extra_body", $.block)),
      ),

    match_pattern: ($) =>
      seq(
        field("enum_name", $.identifier),
        ".",
        field("variant", $.identifier),
      ),

    expression_statement: ($) => $._expression,

    // ── Expressions ──────────────────────────────────────────

    _expression: ($) =>
      choice(
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.boolean_literal,
        $.identifier,
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.method_call_expression,
        $.field_access_expression,
        $.index_expression,
        $.struct_literal,
        $.array_literal,
        $.parenthesized_expression,
        $.assignment_expression,
      ),

    integer_literal: (_) => /\d+/,

    float_literal: (_) => /\d+\.\d+/,

    string_literal: (_) =>
      seq('"', repeat(choice(/[^"\\]/, seq("\\", /./))), '"'),

    boolean_literal: (_) => choice("true", "false"),

    binary_expression: ($) =>
      choice(
        ...[
          ["+", 6],
          ["-", 6],
          ["*", 7],
          ["/", 7],
          ["%", 7],
          ["==", 4],
          ["!=", 4],
          ["<", 5],
          [">", 5],
          ["<=", 5],
          [">=", 5],
          ["&&", 3],
          ["||", 2],
        ].map(([op, prec_val]) =>
          prec.left(
            prec_val,
            seq(
              field("left", $._expression),
              field("operator", op),
              field("right", $._expression),
            ),
          ),
        ),
      ),

    unary_expression: ($) =>
      prec(
        8,
        seq(
          field("operator", choice("-", "!")),
          field("operand", $._expression),
        ),
      ),

    call_expression: ($) =>
      prec(
        10,
        seq(
          field("function", $._expression),
          "(",
          optional($.argument_list),
          ")",
        ),
      ),

    method_call_expression: ($) =>
      prec(
        10,
        seq(
          field("object", $._expression),
          ".",
          field("method", $.identifier),
          "(",
          optional($.argument_list),
          ")",
        ),
      ),

    field_access_expression: ($) =>
      prec(
        10,
        seq(
          field("object", $._expression),
          ".",
          field("field", $.identifier),
        ),
      ),

    index_expression: ($) =>
      prec(
        10,
        seq(
          field("object", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    struct_literal: ($) =>
      prec(
        1,
        seq(
          field("name", $._expression),
          "{",
          optional($.field_value_list),
          "}",
        ),
      ),

    assignment_expression: ($) =>
      prec.right(
        -1,
        seq(
          field("target", $._expression),
          "=",
          field("value", $._expression),
        ),
      ),

    field_value_list: ($) =>
      seq($.field_value, repeat(seq(",", $.field_value))),

    field_value: ($) =>
      seq(field("name", $.identifier), ":", field("value", $._expression)),

    array_literal: ($) =>
      seq(
        "[",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        "]",
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    argument_list: ($) =>
      seq($._expression, repeat(seq(",", $._expression))),

    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
