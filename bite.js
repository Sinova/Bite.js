((exports) => {
	typeof module !== `undefined` && module.exports ? module.exports = exports() :
	typeof define === `function` && define.amd ? define(() => exports()) :
	this[`Bite`] = exports();
})(() => {
	const helpers    = {};
	const concat     = `o+='`;
	const end_concat = `';`;

	const utilities = {
		s : `$=>$||$===0?$+'':''`, // String
		e : `$=>('&<>="\`\\''.split('').map(x=>$=$.replace(new RegExp(x,'g'),'&#'+x.charCodeAt(0)+';')),$)`, // Escape HTML
		r : `($)=>{$=+$||0;for(var x=0,a=[];x<$;++x)a.push(x);return a}`, // Repeat generator
		c : `()=>{$.$$=$$;$$=$}`, // Child scope
		p : `()=>{$=$$;$$=$.$$;$.$$=void 0}`, // Parent scope
	};

	[
		[``,       [`e`, `s`], params => `o+=e(s(${params}));`],
		[`!`,      [`s`],      params => `o+=s(${params});`],
		[`if`,     [],         params => `if(${params}){`, `}`],
		[`elseif`, [],         params => `}else if(${params}){`],
		[`else`,   [],         params => `}else{`],
		[`repeat`, [`r`],      params => `r(${params}).forEach((i)=>{`, `});`],
		[`each`,   [`c`, `p`], params => `c();${params}.forEach(($,i)=>{`, `});p();`],
		[`with`,   [`c`, `p`], params => `c();$=${params};`, `p();`],
	].forEach(definition => helper.apply(null, definition));

	function helper(helper, deps, begin, end) {
		const clean_helper = helper.replace(/([.*+?^=!:${}()|[\]\/\\])/g, `\\$&`);
		const prefix       = helper && helper !== `!` ? `#` : ``;
		const space        = helper && helper !== `!` ? `\\s+` : `\\s*`;

		helpers[helper] = {
			deps : deps,
			begin : {
				pattern : helper ? new RegExp(`{{${prefix}${clean_helper}(?:${space}([^{}]+))?\\s*}}`, `gi`) : /{{\s*([^#\/!][^{}]*)\s*}}/g,
				replace : (match, params) => end_concat + begin(params ? params.replace(/\\'/g, `'`) : null) + concat,
			},
			end : end ? {
				pattern : new RegExp(`{{/${clean_helper}}}`, `gi`),
				replace : () => end_concat + end + concat,
			} : null,
		};
	}

	function bite(body, preserve_whitespace) {
		body = (body || body === 0 ? body + `` : ``).replace(/'/g, `\\'`);
		body = preserve_whitespace ? body.replace(/\r?\n/g, `\\n`) : body.replace(/\s+/g, ` `);

		const deps_map = {};
		let deps       = ``;

		for(let helper in helpers) {
			const begin  = helpers[helper].begin;
			const end    = helpers[helper].end;
			const begins = (body.match(begin.pattern) || ``).length;
			const ends   = (end && body.match(end.pattern) || ``).length;

			if(!begins)
				continue;
			else if(end && begins > ends)
				throw new Error(`Unclosed {{#${helper}}}`);
			else if(end && begins < ends)
				throw new Error(`Unexpected {{/${helper}}}`);

			helpers[helper].deps.forEach((dep) => deps_map[dep] = true);
			body = body.replace(begin.pattern, begin.replace);
			end && (body = body.replace(end.pattern, end.replace));
		}

		for(let dep in utilities)
			if(deps_map[dep])
				deps += utilities[dep] ? `,${dep}=${utilities[dep]}` : `,${dep}`;

		body = (`let $$,o=''${deps};${concat}${body}${end_concat}return o`).replace(/o\+='';/g, ``).replace(/;}/g, `}`);

		const template = new Function(`$`, body);
		template.toString = () => `$=>{${body}}`;

		return template;
	}

	return bite;
});
