document.body.insertAdjacentHTML(
	'afterBegin',
	`
		<span class="static" style="
			display: inline-block;
			padding: 4px;
			font-size: 20px;
			border: solid 4px gray;
		">
			JS LOADED
		</span>
	`,
);
console.log('Content script loaded', new Date());
