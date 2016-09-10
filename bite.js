((exports) => {
	typeof module !== `undefined` && module.exports ? module.exports = exports :
	typeof define === `function` && define.amd ? define(() => exports) :
	this[`Bite`] = exports;
})(() => {
	const helpers            = {};
	const interpolate_regexp = /{{\s*([^#\/!][^{}]*)\s*}}/gi;
	const escape_regexp      = /([.*+?^=!:${}()|[\]\/\\])/g;
	const whitespace_regexp  = /\s+/g;
	const newline_regexp     = /\r?\n/g;
	const empty_regexp       = /o\+='';/g;
	const semi_regexp        = /;}/g;
	const begin_fn           = `let o='',_`;
	const concat             = `o+='`;
	const end_concat         = `';`;
	const end_fn             = `return o`;

	const vars = {
		s : `$=>$||$===0?$+'':''`, // String
		c : `()=>{$._=_;_=$}`, // Child scope
		p : `()=>{$=_;_=$._;$._=void 0}`, // Parent scope
		e : `$=>{return $=$||$===0?$+'':'','&<>="\`\\''.split('').map(_=>$=$.replace(new RegExp(_,'g'),'&#'+_.charCodeAt(0)+';')),$}`, // Escape HTML
		f : `'forEach'`, // forEach alias
	};

	[
		[``,       [`e`],           params => `o+=e(${params});`],
		[`!`,      [`s`],           params => `o+=s(${params});`],
		[`if`,     [],              params => `if(${params}){`, `}`],
		[`elseif`, [],              params => `}else if(${params}){`],
		[`else`,   [],              params => `}else{`],
		[`each`,   [`c`, `f`, `p`], params => `c();${params}[f]($=>{`, `});p();`],
		[`with`,   [`c`, `p`],      params => `c();$=${params};`, `p();`],
	].forEach(definition => helper.apply(null, definition));

	function helper(helper, deps, begin, end) {
		const clean_helper = helper.replace(escape_regexp, `\\$&`);
		const prefix       = helper && helper !== `!` ? `#` : ``;
		const space        = helper && helper !== `!` ? `\\s+` : `\\s*`;

		helpers[helper] = {
			deps : deps,
			begin : begin ? {
				pattern : helper ? new RegExp(`{{${prefix}${clean_helper}(?:${space}([^{}]+))?\\s*}}`, `gi`) : interpolate_regexp,
				replace : (match, params) => end_concat + begin(params || null) + concat,
			} : null,
			end : end ? {
				pattern : new RegExp(`{{/${clean_helper}}}`, `gi`),
				replace : () => end_concat + end + concat,
			} : null,
		};
	}

	function compile(body, preserve_whitespace) {
		body = (body || body === 0 ? body + `` : ``);
		body = preserve_whitespace ? body.replace(newline_regexp, `\\n`) : body.replace(whitespace_regexp, ` `);

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
				throw new Error(`Unclosed #${helper}`);
			else if(end && begins < ends)
				throw new Error(`Dangling /${helper}`);

			helpers[helper].deps.forEach((dep) => deps_map[dep] = true);
			body = body.replace(begin.pattern, begin.replace);
			end && (body = body.replace(end.pattern, end.replace));
		}

		for(let dep in deps_map)
			deps += `,${dep}=${vars[dep]}`;

		body = (begin_fn + deps + `;` + concat + body + end_concat + end_fn).replace(empty_regexp, ``).replace(semi_regexp, `}`);

		const template = new Function(`$`, body);
		template.toString = () => `$=>{${body}}`;

		return template;
	}

	return compile;
});
