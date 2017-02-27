((exports) => {
	typeof module !== `undefined` && module.exports ? module.exports = exports() :
	typeof define === `function` && define.amd ? define(exports) :
	this[`Bite`] = exports();
})(() => {
	const helpers = {};

	const utilities = {
		s : `$=>$||$===0?$+'':''`, // String
		e : `$=>$.replace(/[&<>="\`']/g,c=>\`&#\${c.charCodeAt()};\`)`, // Escape HTML
		r : `$=>[...new Array(+$).keys()]`, // Repeat generator
		c : `()=>($.$$=$$,$$=$)`, // Child scope
		p : `()=>($=$$,$$=$.$$,$.$$=void 0,'')`, // Parent scope
	};

	[
		[``,        [`e`, `s`], params => `\${e(s(${params}))}`],
		[`%`,       [`s`],      params => `\${s(${params})}`],
		[`if`,      [],         params => `\${${params}?\``, `\`:''}`],
		[`elseif`,  [],         params => `\`:${params}?\``],
		[`else`,    [],         params => `\`:1?\``],
		[`repeat`,  [`r`],      params => `\${r(${params}).map((i)=>\``, `\`).join('')}`],
		[`forEach`, [`c`, `p`], params => `\${c(),${params}.map(($,i)=>\``, `\`).join('')}\${p()}`],
		[`with`,    [`c`, `p`], params => `\${c(),$=${params},''}`, `\${p()}`],
	].forEach(definition => helper(...definition));

	function helper(helper, deps, begin, end) {
		const clean_helper = helper.replace(/([.*+?^=!:${}()|[\]\/\\])/g, `\\$&`);
		const prefix       = helper && helper !== `%` ? `#` : ``;
		const space        = helper && helper !== `%` ? `\\s+` : `\\s*`;

		helpers[helper] = {
			deps : deps,
			begin : {
				pattern : helper ? new RegExp(`{{${prefix}${clean_helper}(?:${space}(.+?))?\\s*}}(?!})`, `gi`) : /{{\s*([^#\/%].*?)\s*}}(?!})/g,
				replace : (match, params) => begin(params ? params.replace(/\\'/g, `'`) : null),
			},
			end : end ? {
				pattern : new RegExp(`{{/${clean_helper}}}`, `gi`),
				replace : end,
			} : null,
		};
	}

	function bite(body, preserve_whitespace) {
		body = (body || body === 0 ? body + `` : ``).replace(/'/g, `\\'`);
		body = preserve_whitespace ? body.replace(/\r?\n/g, `\\n`) : body.replace(/\s+/g, ` `);

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
				deps += `${dep}=${utilities[dep]},`;
			}
		}

		body = `let ${deps}$$;return \`${body}\``;

		const template = new Function(`$`, body);
		template.toString = () => `$=>{${body}}`;

		return template;
	}

	return bite;
});
