((exports) => {
	typeof module !== `undefined` && module.exports ? module.exports = exports :
	typeof define === `function` && define.amd ? define(() => exports) :
	this[`Bite`] = exports;
})(() => {
	let helpers           = {};
	let escape_html       = [`&/g,'&amp`, `</g,'&lt`, `>/g,'&gt`, `"/g,'&quot`, `'/g,'&#x27`, `\`/g,'&#x60`, `=/g,'&#x3D`].join(`')[_](/`);
	let escape_regexp     = /([.*+?^=!:${}()|[\]\/\\])/g;
	let whitespace_regexp = /\s+/g;
	let newline_regexp    = /\r?\n/g;
	let left_tag_regexp   = />\s+/g;
	let right_tag_regexp  = /\s+</g;
	let empty_regexp      = /p\._\+='';/g;
	let begin             = `let _,p={_:''};`;
	let end               = `return p._`;
	let concat            = `p._+='`;
	let end_concat        = `';`;

	let fns = {
		a : `_=>{p._+=_}`, // Append HTML
		s : `$=>!$&&$!==0?'':$+''`, // String
		e : `$=>{let _='replace';return $[_](/${escape_html}')}`, // Escape
		c : `()=>{$._=_;_=$}`, // Child scope
		p : `()=>{$=_;_=$._;$._=void 0}`, // Parent scope
	};

	[
		[``,       params => `p.a(p.e(p.s(${params})));`],
		[`unsafe`, params => `p.a(p.s(${params}));`],
		[`if`,     params => `if(${params}){`, `}`],
		[`elseif`, params => `}else if(${params}){`],
		[`else`,   params => `}else{`],
		[`each`,   params => `p.c();${params}.forEach($=>{`, `});p.p();`],
		[`with`,   params => `p.c();$=${params};`, `p.p();`],
	].forEach(definition => helper.apply(null, definition));

	function helper(helper, begin, end) {
		let clean_helper =  helper.replace(escape_regexp, `\\$&`);

		helpers[helper] = {
			begin : begin ? {
				pattern : new RegExp(`{{#${clean_helper}(?:\\s+(.*?))?\\s*}}`, `gi`),
				replace : (match, params) => end_concat + begin(params) + concat,
			} : null,
			end : end ? {
				pattern : new RegExp(`{{/${clean_helper}}}`, `gi`),
				replace : end_concat + end + concat,
			} : null,
		};
	}

	function compile(body, preserve_whitespace) {
		body = (!body && body !== 0 ? `` : body + ``);
		body = preserve_whitespace ? body.replace(newline_regexp, `\\n`) :
			body.replace(whitespace_regexp, ` `).replace(left_tag_regexp, `>`).replace(right_tag_regexp, `<`);

		for(let helper in helpers) {
			let begin = helpers[helper].begin;
			let end   = helpers[helper].end;

			body = body.replace(begin.pattern, begin.replace);

			if(end) {
				body = body.replace(end.pattern, end.replace);
			}
		}

		let lib = ``;

		for(let i in fns) {
			if(body.indexOf(`p.${i}(`) !== -1) {
				lib += `p.${i}=${fns[i]};`;
			}
		}

		body = (begin + lib + concat + body + end_concat + end).replace(empty_regexp, ``);

		let template = new Function(`$`, body);
		template.toString = () => `$=>{${body}}`;

		return template;
	}

	return compile;
});
