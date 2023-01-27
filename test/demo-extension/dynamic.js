document.documentElement.insertAdjacentHTML(
	'afterBegin',
	`
		<span class="dynamic" style="
			display: inline-block;
			padding: 4px;
			font-size: 20px;
			border: solid 4px silver;
		">
			DYNAMIC JS LOADED
		</span>
	`,
);
console.log('Dynamic script loaded', new Date());
