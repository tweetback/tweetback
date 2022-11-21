const numeral = require("numeral");

module.exports = function(eleventyConfig) {
	eleventyConfig.ignores.add("README.md");
	eleventyConfig.setServerPassthroughCopyBehavior("copy");

	eleventyConfig.addPassthroughCopy("assets/");
	eleventyConfig.addPassthroughCopy("img/");
	eleventyConfig.addPassthroughCopy({
		"node_modules/chartist/dist/chartist.min.css": "assets/chartist.min.css",
		"node_modules/chartist/dist/chartist.min.js": "assets/chartist.min.js",
	});

	eleventyConfig.addJavaScriptFunction("renderNumber", function renderNumber(num) {
		if(typeof num === "string") {
			num = parseInt(num, 10);
		}
		return numeral(num).format("0,0");
	});
};