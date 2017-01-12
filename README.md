# Bite.js
## Tiny, Dependecy-Free JavaScript Templating

### Overview

Bite.js is an ultra light-weight, full-featured templating engine designed for size and performance. It compiles templates into standalone functions in vanilla JavaScript that can be used to render those templates with a given set of data.

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

Compile templates into standalone functions by calling <code>Bite(my_template_string)</code>. The template string can come from any source (file, ajax call, string literal, user input, etc). The functions can then be called with a data context, and the resulting HTML string will be returned.

### Example

The following is a simple example of how Bite can be used. You can also check out the [live demo](https://sinova.github.io/Bite.js/#demo).

> This example tries to showcase all features, so it may look a bit contrived.


##### HTML
```Handlebars
<div id="demo-template" hidden>
	<h1>{{$.name}}</h1>

	<h2>Profession</h2>

	<div>{{$.profession.name}} for {{$.profession.years}} years</div>
	<div>{{% $.star_partial({max : $.rating})}}</div>

	{{#with $.interests}}
		<h2>Interests ({{$.items.length}})</h2>

		<ul>
			{{#forEach $.items}}
				<li>{{$$.$$.name}} {{$$.verb}} {{$}}</li>
			{{/forEach}}
		</ul>
	{{/with}}
</div>

<div id="demo-output"></div>
```

##### JavaScript
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

### Scopes

Within a template, the current context, or **scope**, is always accessible via the <code>$</code> variable. For instance, if your data looks like <code>{name : 'Sam'}</code>, your template can access that variable with <code>$.name</code> and can perform actions on it such as interpolation.

The parent scope can be accessed with <code>$$</code>. For example, to output a property from the parent scope you could do <code>{{$$.name}}</code>. You can climb further up the parent scope chain via <code>$$.$$</code>, <code>$$.$$.$$</code>, and so on. For example: <code>{{$$.$$.title}}</code>

### Pre-Compilation

Templates can be pre-compiled into functions on the server within your Node.js application. Calling <code>toString()</code> on a compiled template function will return a string which can then be saved however you wish (file, database, etc). These strings can be sent straight to the client as either a standalone JavaScript file or as part of other source files depending on your build workflow.

If you're using Webpack, you can use the [bite-templates-loader](https://github.com/Sinova/bite-templates-loader) package to automatically precompile your templates before sending them to the client.

### API

<table>
	<tr>
		<td>
			<h3>Interpolation</h3>
			{{&lt;expression&gt;}}<br>
			<br>
		</td>
		<td>
			Interpolation allows you to inject arbitrary values and expressions into your template. The most common use-case is outputting a property such as a name or date, e.g. <code>{{$.name}}</code>. However, any valid JavaScript expression is allowed, such as <code>{{1&nbsp;+&nbsp;2&nbsp;+&nbsp;3}}</code>, <code>{{'Mr.&nbsp;'&nbsp;+&nbsp;$.last_name}}</code>, or <code>{{$.name.toUpperCase()}}</code>.
		</td>
	</tr>
	<tr>
		<td>
			<h3>Unescaped Interpolation</h3>
			{{%&nbsp;&lt;expression&gt;}}<br>
			<br>
		</td>
		<td>
			By default, interpolated values are HTML-escaped. If you want to interpolate a value without escaping, use <code>{{%&nbsp;&lt;expression&gt;}}</code>. This is particularly useful when using partials (see below).<br>
			<br>
			<blockquote>
				<b>Caution:</b> Interpolating untrusted strings such as user input can lead to potential injection attacks. Use wisely!
			</blockquote>
		</td>
	</tr>
	<tr>
		<td>
			<h3>If</h3>
			{{#if&nbsp;&lt;expression&gt;}}<br>...<br>{{#elseif&nbsp;&lt;expression&gt;}}<br>...<br>{{#else}}<br>...<br>{{/if}}<br>
			<br>
		</td>
		<td>
			The <b>if</b> block allows you to control the flow of your code by testing certain conditions. Within the block, <code>{{#elseif&nbsp;&lt;expression&gt;}}</code> and <code>{{#else}}</code> blocks can optionally be used. Any valid JavaScript expression can be used with <code>#if</code> and <code>#elseif</code>.
		</td>
	</tr>
	<tr>
		<td>
			<h3>Repeat</h3>
			{{#repeat&nbsp;&lt;number&gt;}}<br>...<br>{{/repeat}}<br>
			<br>
		</td>
		<td>
			The <b>repeat</b> block allows you to repeat a subsection of the template a given number of times. Within the block, <code>i</code> becomes the current iteration counter. <code>#repeat</code> behaves like a standard <code>for</code> loop, starting with 0 and counting up to, but not including, the target number.
		</td>
	</tr>
	<tr>
		<td>
			<h3>forEach</h3>
			{{#forEach&nbsp;&lt;array&gt;}}<br>...<br>{{/forEach}}<br>
			<br>
		</td>
		<td>
			The <b>forEach</b> block allows you to loop over an array of values and output a subsection of the template. The result of the expression passed to <code>#forEach</code> must be an array. Within the block, <code>i</code> becomes the current index in the array, <code>$</code> becomes the current value, and <code>$$</code> becomes the parent scope. You can climb further up the parent scope chain via <code>$$.$$</code>, <code>$$.$$.$$</code>, and so on.
		</td>
	</tr>
	<tr>
		<td>
			<h3>With</h3>
			{{#with&nbsp;&lt;expression&gt;}}<br>...<br>{{/with}}<br>
			<br>
		</td>
		<td>
			The <b>with</b> block allows you to change the current scope within the template. <code>$</code> becomes the value of the expression passed to the block, and <code>$$</code> becomes the parent scope. You can climb further up the parent scope chain via <code>$$.$$</code>, <code>$$.$$.$$</code>, and so on.
		</td>
	</tr>
	<tr>
		<td>
			<h3>Partials</h3>
			{{%&nbsp;$.my_partial($.my_data)}}<br>
			<br>
		</td>
		<td>
			Partials leverage the fact that interpolation can inject arbitrary expressions. Thus, using a partial is as simple as passing its precompiled function into your template and calling it with your desired data. Because most partials contain HTML, use the unescaped interpolation syntax <code>{{% &lt;expression&gt;}}</code>. The example section above includes a partial.
		</td>
</table>
