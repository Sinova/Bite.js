# Bite.js
## Tiny, Dependecy-Free JavaScript Templating

### Overview

Bite.js is an ultra light-weight, full-featured templating engine designed for size and performance. It produces standalone functions in vanilla JavaScript that can be used to render a template with a given set of data.

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

### Usage

> Check out the [demo](https://sinova.github.io/Bite.js/#demo) for a usage example.

Bite.js generates standalone functions from your templates by calling `Bite(<template_string>)`. The template string can come from any source, such as a file, ajax call, string literal, or user input.

The resulting function can then be called with a data contex which will render the template with the data as the current **scope**. Within the template, the current **scope** is always accessible via the `$` variable. For instance, if your data looks like `{name : 'Sam'}`, your template can access that variable with `$.name` and can perform actions on it such as interpolation.

Template functions can be stored by calling their `toString()` method and saving the resulting string however you wish (file, DB, etc). If you're using Webpack, you can use the [bite-templates-loader](https://github.com/Sinova/bite-templates-loader) package to automatically precompile your templates before sending them to the client.

### API

#### Interpolation

Interpolation allows you to inject arbitrary values and expressions into your template. The most common use-case is outputting a property such as a name or date, e.g. `{{$.name}}`. However, any valid JavaScript expression is allowed, such as `{{1 + 2 + 3}}`, `{{'Mr. ' + $.last_name}}`, or `{{$.name.toUpperCase()}}`.

#### If

The `{{#if <expression>}} ... {{/if}}` block allows you to control the flow of your code by testing certain conditions. Within the block, `{{#elseif <expression>}}` and `{{#else}}` blocks can be used. Any valid JavaScript expression can be used with `#if` and `#elseif`.

#### Repeat

The `{{#repeat <number>}} ... {{/repeat}}` block allows you to repeat a subsection of the template a given number of times. Within the block, `i` becomes the current index in the array. `#repeat` behaves like a standard `for` loop, starting with 0 and counting up to, but not including, the target number.

#### forEach

The `{{#forEach <expression>}} ... {{/forEach}}` block allows you to loop over an array of values and output a subsection of the template. The result of the expression must be an array. Within the block, `i` becomes the current index in the array, `$` becomes the current value, and `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### With

The `{{#with <expression>}} ... {{/with}}` block allows you to change the current scope within the template. `$` becomes the value of the expression passed to the block, and `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### Partials

Partials leverage the fact that interpolation can inject arbitrary expressions. Thus, using a partial is as simple as passing its precompiled function into your template and calling it with your desired data. See the [demo](https://sinova.github.io/Bite.js/) for a good example.
