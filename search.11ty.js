const Twitter = require("./src/twitter");

class Search extends Twitter {
	data() {
		return {
			layout: "layout.11ty.js"
		};
	}

	async render(data) {
		return `
			<link href="/_pagefind/pagefind-ui.css" rel="stylesheet">
			<script src="/_pagefind/pagefind-ui.js" type="text/javascript"></script>
			<h1>Search all tweets</h1>
			<div id="pagefind-search" class="tweets-search"></div>
			<script>new PagefindUI({ element: "#pagefind-search" });</script>
`;
	}
}

module.exports = Search;
