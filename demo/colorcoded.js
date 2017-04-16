const browser      = typeof HTMLElement !== `undefined`;
const html_find    = /([&<>="`'])/g;
const html_replace = match => `&#${match.charCodeAt()};`;

let container_template   = null;
let wrapper_template     = null;
let highlighter_template = null;

if(browser) {
	container_template             = document.createElement(`div`);
	wrapper_template               = document.createElement(`div`);
	highlighter_template           = document.createElement(`div`);
	container_template.className   = `colorcoded-container`;
	wrapper_template.className     = `colorcoded-wrapper`;
	highlighter_template.className = `colorcoded-highlighter colorcoded`;
}

const highlight_regexp = new RegExp(`(?:${[
	// Comments
	`((?:\\/\\*[\\s\\S]*?(?:\\*\\/|$)|\\/\\/.*(?=\\n|$))+)`,
	// Strings
	`((?:${[`"`, `'`, `\``].map(q => `${q}(?:[^${q}\\\\]+|(?:\\\\[\\s\\S])+)*(?:${q}|$)`).join(`|`)})+)`,
	// Keywords
	`(\\b(?:${[
		`abstract`, `alias`, `and`, `arguments`, `array`, `as`, `asm`, `assert`, `auto`,
		`base`, `begin`, `bool`, `boolean`, `break`, `byte`,
		`case`, `catch`, `char`, `checked`, `class`, `clone`, `compl`, `const`, `continue`,
		`debugger`, `decimal`, `declare`, `defer`, `defult`, `deinit`, `delegate`, `delete`, `do`, `double`,
		`echo`, `elif`, `else`, `elseif`, `elsif`, `end`, `ensure`, `enum`, `event`, `except`, `exec`, `explicit`, `export`,
		`fallthrough`, `false`, `final`, `finally`, `fixed`, `float`, `for`, `foreach`, `friend`, `from`, `func`, `function`,
		`global`, `goto`, `guard`,
		`if`, `implement`, `implicit`, `import`, `in`, `include`, `include_once`, `init`, `inline`, `inout`, `instanceof`, `interface`, `internal`, `is`,
		`lambda`, `let`, `lock`, `long`,
		`module`, `mutable`,
		`namespace`, `nan`, `native`, `new`, `next`, `nil`, `not`, `null`,
		`object`, `operator`, `or`, `out`, `override`,
		`package`, `params`, `private`, `protected`, `protocol`, `public`,
		`raise`, `readonly`, `redo`, `ref`, `register`, `repeat`, `require`, `require_once`, `rescue`, `restrict`, `retry`, `retry`, `return`,
		`sbyte`, `sealed`, `self`, `short`, `signed`, `sizeof`, `static`, `string`, `struct`, `subscript`, `super`, `switch`, `synchronized`,
		`template`, `tends`, `tension`, `tern`, `then`, `this`, `throw`, `throws`, `transient`, `true`, `try`, `type`, `typealias`, `typedef`, `typeid`, `typename`, `typeof`,
		`unchecked`, `undef`, `undefined`, `union`, `unless`, `unsigned`, `until`, `use`, `using`,
		`var`, `virtual`, `void`, `volatile`,
		`wchart_t`, `when`, `where`, `while`, `with`,
		`xor`,
		`yield`,
	].sort((a, b) => b.length - a.length).join(`|`)})\\b(?!\\s*=))`,
	// Functions
	`(\\b[a-z_]\\w*)(?=\\()`,
	// Braces
	`([()[\\]{}]+)`,
	// Operators
	`([!@#$%^&*\\-=+|;:,.\/<>?]+)`,
	// Numbers
	`\\b(\\d+)\\b`,
].join(`|`)})`, `gi`);

function colorcoded(element) {
	if(typeof element === `string`) {
		return highlight(element);
	}

	if(element && typeof element[Symbol.iterator] === `function`) {
		const results = [];

		for(const tmp of element) {
			results.push(colorcoded(tmp));
		}

		return results;
	}

	if(browser) {
		if(element.tagName === `INPUT` || element.tagName === 'TEXTAREA') {
			const container   = container_template.cloneNode();
			const highlighter = highlighter_template.cloneNode();
			const wrapper     = wrapper_template.cloneNode();
			const style       = window.getComputedStyle(element);
			const data        = {element, highlighter, frame : null};

			container.style.display   = style.display;
			highlighter.style.cssText = style.cssText;
			element.spellcheck        = false;

			element.classList.add(`colorcoded-textarea`);
			element.setAttribute('spellcheck', 'false');
			element.addEventListener(`input`, updateHighlighter.bind(null, data));
			element.addEventListener(`scroll`, updateScroll.bind(null, data));

			updateHighlighter(data);
			updateScroll(data);

			element.parentElement.insertBefore(container, element);
			container.appendChild(wrapper);
			wrapper.appendChild(highlighter);
			wrapper.appendChild(element);
		}
		else {
			element.classList.add(`colorcoded`);
			element.innerHTML = highlight(element.textContent);
		}
	}

	return element;
}

function highlight(text) {
	return text.replace(highlight_regexp, (match, comment, string, keyword, fnc, brace, operator, number) => {
		const type     = comment ? `comment` : string ? `string` : keyword ? `keyword` : fnc ? `function` : brace ? `brace` : operator ? `operator` : `number`;
		const contents = match.replace(html_find, html_replace);

		return `<span class="colorcoded-${type}">${contents}</span>`;
	});
}

function updateHighlighter(data) {
	if(!data.frame) {
		data.frame = window.requestAnimationFrame(() => {
			data.frame = null;

			const element     = data.element;
			const highlighter = data.highlighter;

			highlighter.innerHTML = `<div class="colorcoded-sizer"></div>${highlight(element.value)}`;

			const height = element.scrollHeight;
			const width  = element.scrollWidth;

			if(highlighter.scrollHeight < height || highlighter.scrollWidth < width) {
				highlighter.firstChild.style.height = `${height}px`;
				highlighter.firstChild.style.width  = `${width}px`;

				updateScroll(element, highlighter);
			}
		});
	}
}

function updateScroll(data) {
	data.highlighter.scrollTop  = data.element.scrollTop;
	data.highlighter.scrollLeft = data.element.scrollLeft;
}

window.colorcoded = colorcoded;
