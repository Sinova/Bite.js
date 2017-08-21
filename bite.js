((exports) => {
	typeof module !== `undefined` && module.exports ? module.exports = exports() :
	typeof define === `function` && define.amd ? define(exports) :
	this[`Bite`] = exports();
})(() => {
	const helpers = {};

	const utilities = {
		string : `$ => $ && $.nodeName ? $.outerHTML || [...$.childNodes].map(node => node.outerHTML).join('') : $ || $ === 0 ? $ + '' : ''`,
		escape : `$ => $.replace(/[&<>="\`']/g, c => \`&#\${c.charCodeAt()};\`)`,
		html   : `$ => fragment && $ && $.nodeName ? (nodes.push($), \`<br id="bite--\${nodes.length - 1}">\`) : string($)`,
		repeat : `$ => [...new Array(+$).keys()]`,
		child  : `() => ($.$$ = $$, $$ = $)`,
		parent : `() => ($ = $$, $$ = $.$$, $.$$ = void 0, '')`,
	};

	[
		[``,        [`string`, `escape`], params => `\${escape(string(${params}))}`],
		[`%`,       [`string`, `html`],   params => `\${html(${params})}`],
		[`if`,      [],                   params => `\${${params} ? \``, `\` : ''}`],
		[`elseif`,  [],                   params => `\` : ${params} ? \``],
		[`else`,    [],                   params => `\` : true ? \``],
		[`repeat`,  [`repeat`],           params => `\${repeat(${params}).map(i => \``, `\`).join('')}`],
		[`forEach`, [`child`, `parent`],  params => `\${child(), ${params}.map(($, i) => \``, `\`).join('')} \${parent()}`],
		[`with`,    [`child`, `parent`],  params => `\${child(), $ = ${params}, ''}`, `\${parent()}`],
	].forEach(definition => helper(...definition));

	function helper(helper, deps, begin, end) {
		const standalone   = [``, `%`].includes(helper);
		const clean_helper = helper.replace(/([.*+?^=!:${}()|[\]\/\\])/g, `\\$&`);
		const prefix       = helper ? standalone ? `` : `#` : `(?![#%\/])`;
		const space        = standalone ? `\\s*` : `\\s+`;

		helpers[helper] = {
			deps : deps,
			begin : {
				pattern : new RegExp(`{{${prefix}${clean_helper}(?:${space}([\\s\\S]+?))?\\s*}}(?!})`, `gi`),
				replace : (match, params) => begin(params ? params.replace(/\\`/g, '`').replace(/\\\$\{/g, '${') : null),
			},
			end : end ? {
				pattern : new RegExp(`{{/${clean_helper}}}`, `gi`),
				replace : end,
			} : null,
		};
	}

	function bite(body) {
		body = (body || body === 0 ? body + `` : ``).replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

		const deps_map = {};
		let deps       = ``;

		for(const helper in helpers) {
			const begin  = helpers[helper].begin;
			const end    = helpers[helper].end;
			const begins = (body.match(begin.pattern) || ``).length;
			const ends   = (end && body.match(end.pattern) || ``).length;

			if(end) {
				if(begins > ends) {
					throw new Error(`Unclosed {{#${helper}}}`);
				}
				else if(begins < ends) {
					throw new Error(`Unexpected {{/${helper}}}`);
				}
			}

			if(!begins) {
				continue;
			}

			helpers[helper].deps.forEach((dep) => deps_map[dep] = true);
			body = body.replace(begin.pattern, begin.replace);

			if(end) {
				body = body.replace(end.pattern, end.replace);
			}
		}

		for(const dep in utilities) {
			if(deps_map[dep]) {
				deps += `${dep}=${utilities[dep]}, `;
			}
		}

		body = `
			let $$;
			const ${deps}nodes = [], body = \`${body}\`;

			return fragment ? (
				fragment = document.createDocumentFragment(),
				$ = document.createElement('div'),
				$.innerHTML = body,
				[...$.childNodes].forEach($ => fragment.appendChild($)),
				nodes.forEach((node, i) => fragment.getElementById(\`bite--\${i}\`).replaceWith(node)),
				fragment
			) : body;
		`;

		const template = new Function(`$`, `fragment`, body);
		template.toString = () => `($, fragment) => {${body}}`;

		return template;
	}

	return bite;
});
