# Bite.js
## Tiny, Dependecy-Free JavaScript Templating

### Overview

Bite.js is an ultra light-weight, full-featured templating engine designed for size and performance. It produces standalone functions in vanilla JavaScript that can be used to render a template with a given set of data.

Check out the [demo](https://sinova.github.io/Bite.js/).

### Features

* Interpolation
* Conditionals
* Iteration
* Parent/Child Scoping
* Arbitrary Expressions
* Precompilation or Run-Time Compilation

### Installation

```Bash
npm install bite-templates
```

### API

#### Interpolation

Interpolation allows you to inject arbitrary values and expressions into your template. The most common use-case is outputting a property such as a name or date, e.g. `{{$.name}}`. However, any valid JavaScript expression is allowed, such as `{{1 + 2 + 3}}`, `{{'Mr. ' + $.last_name}}`, or `{{$.name.toUpperCase()}}`.

#### If

The `{{#if <expression>}} ... {{/if}}` block allows you to control the flow of your code by testing certain conditions. Within the block, `{{#elseif <expression>}}` and `{{#else}}` blocks can be used. Any valid JavaScript expression can be used with `#if` and `#elseif`.

#### Repeat

The `{{#repeat <number>}} ... {{/repeat}}` block allows you to repeat a subsection of the template a given number of times. Within the block, `i` becomes the current index in the array. `#repeat` behaves like a standard `for` loop, starting with 0 and counting up to, but not including, the target number.

#### Each

The `{{#each <expression>}} ... {{/each}}` block allows you to loop over an array of values and output a subsection of the template. The result of the expression must be an array. Within the block, `i` becomes the current index in the array, `$` becomes the current value, `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### With

The `{{#with <expression>}} ... {{/with}}` block allows you to change the current scope within the template. `$` becomes the value of the expression passed to the block, and `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### Partials

Partials leverage the fact that interpolation can inject arbitrary expressions. Thus, using a partial is as simple as passing its precompiled function into your template and calling it with your desired data. See the [demo](https://sinova.github.io/Bite.js/) for a good example.
