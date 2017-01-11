# Bite.js
## Tiny, Dependecy-Free JavaScript Templating

### Overview

Bite.js is an ultra light-weight, full-featured templating engine designed for size and performance. It compiles templates into standalone functions in vanilla JavaScript that can be used to render the template with a given set of data.

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

Use Bite.js to compile templates into standalone functions by calling `Bite(<template_string>)`. The template string can come from any source, such as a file, ajax call, string literal, or user input.

The functions can then be called with a data contex with which to evaluate the template. The result is an HTML string. Within the template, the current context, or **scope**, is always accessible via the `$` variable. For instance, if your data looks like `{name : 'Sam'}`, your template can access that variable with `$.name` and can perform actions on it such as interpolation.

Template functions can be stored by calling their `toString()` method and saving the resulting string however you wish (file, DB, etc). If you're using Webpack, you can use the [bite-templates-loader](https://github.com/Sinova/bite-templates-loader) package to automatically precompile your templates before sending them to the client.

### Example

```HTML
<div id="demo-template" hidden>
	<h1>{{$.name}}</h1>

	<div>{{% $.star_partial({max : $.rating})}}</div>

	<div>
		<h2>Profession</h2>

		{{#with $.profession}}
			{{$.name}} ({{$.years}} years)
		{{/with}}
	</div>

	<div>
		<h2>Interests ({{$.interests.items.length}})</h2>

		<ul>
			{{#with $.interests}}
				{{#forEach $.items}}
					<li>{{$$.$$.name}} {{$$.verb}} {{$}}</li>
				{{/forEach}}
			{{/with}}
		</ul>
	</div>
</div>

<div id="demo-output"></div>
```

```JavaScript
const data = {
	name   : 'Sam',
	rating : 4,

	profession : {
		name  : 'Programmer',
		years : '6',
	},

	interests : {
		verb : 'likes',

		items : [
			'Chess',
			'Boxing',
			'Bite.js',
		],
	},

	// Inline partial just for demoing purposes
	star_partial : Bite(`
		{{#repeat 5}}
			{{#if i < $.max}}
				★
			{{#else}}
				☆
			{{/if}}
		{{/repeat}}
	`),
};

const output_div      = document.getElementById('demo-output');
const template_string = document.getElementById('demo-template').innerHTML;
const template        = Bite(template_string);

output_div.innerHTML = template(data);
```

> Check out the [demo](https://sinova.github.io/Bite.js/#demo) for a live usage example.

### API

#### Interpolation

Interpolation allows you to inject arbitrary values and expressions into your template via `{{<expression>}}`. The most common use-case is outputting a property such as a name or date, e.g. `{{$.name}}`. However, any valid JavaScript expression is allowed, such as `{{1 + 2 + 3}}`, `{{'Mr. ' + $.last_name}}`, or `{{$.name.toUpperCase()}}`.

Interpolated values are HTML-escaped by default. If you want to interpolate a value with HTML without escaping, use `{{% <expression>}}`. This is particularly useful when using partials. Use this cautiously, however, as interpolating unsafe strings such as user input can lead to JavaScript injection attacks.

#### If

The `{{#if <expression>}} ... {{/if}}` block allows you to control the flow of your code by testing certain conditions. Within the block, `{{#elseif <expression>}}` and `{{#else}}` blocks can be used. Any valid JavaScript expression can be used with `#if` and `#elseif`.

#### Repeat

The `{{#repeat <number>}} ... {{/repeat}}` block allows you to repeat a subsection of the template a given number of times. Within the block, `i` becomes the current index in the array. `#repeat` behaves like a standard `for` loop, starting with 0 and counting up to, but not including, the target number.

#### forEach

The `{{#forEach <expression>}} ... {{/forEach}}` block allows you to loop over an array of values and output a subsection of the template. The result of the expression passed to `#forEach` must be an array. Within the block, `i` becomes the current index in the array, `$` becomes the current value, and `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### With

The `{{#with <expression>}} ... {{/with}}` block allows you to change the current scope within the template. `$` becomes the value of the expression passed to the block, and `$$` becomes the parent scope. You can climb further up the parent scope chain via `$$.$$`, `$$.$$.$$`, and so on.

#### Partials

Partials leverage the fact that interpolation can inject arbitrary expressions. Thus, using a partial is as simple as passing its precompiled function into your template and calling it with your desired data. Because most partials contain HTML, use the unescaped interpolation syntax `{{% <expression>}}`. See the [demo](https://sinova.github.io/Bite.js/#demo) for a good example.
