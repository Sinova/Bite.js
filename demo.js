{
	let code_blocks = document.querySelectorAll('.code-block');

	for(let i = 0; i < code_blocks.length; ++i) {
		let block = code_blocks[i];

		if(block.value !== undefined) {
			block.value = removeIndentation(block.value);
		}
		else {
			block.innerHTML = removeIndentation(block.innerHTML);
		}
	}

	let demo_template = document.getElementById('demo-template');
	let demo_js       = document.getElementById('demo-js');
	let demo_output   = document.getElementById('demo-output');

	demo_template.addEventListener('input', runDemo);
	demo_js.addEventListener('input', runDemo);

	runDemo();

	function runDemo() {
		let template = demo_template.value;
		let js       = demo_js.value;

		try {
			window.eval(js);
			demo_output.classList.remove('error');
		}
		catch(e) {
			demo_output.classList.add('error');
			demo_output.innerHTML = e.message;
		}
	}

	function removeIndentation(text) {
		text = text.replace(/^\s*\r?\n|\s*$/g, '');

		let tabs = text.match(/^\t*/);

		if(tabs) {
			text = text.replace(new RegExp('^' + tabs[0], 'mg'), '')
		}

		return text;
	}
}
