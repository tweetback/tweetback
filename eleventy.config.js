const numeral = require("numeral");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
	eleventyConfig.ignores.add("README.md");
	eleventyConfig.setServerPassthroughCopyBehavior("copy");

	eleventyConfig.addPassthroughCopy("assets/");
	eleventyConfig.addPassthroughCopy("img/");
	eleventyConfig.addPassthroughCopy({
		"node_modules/chartist/dist/chartist.min.css": "assets/chartist.min.css",
		"node_modules/chartist/dist/chartist.min.js": "assets/chartist.min.js",
		"node_modules/@11ty/is-land/is-land.js": "assets/is-land.js",
	});

	eleventyConfig.addJavaScriptFunction("avatarUrl", function avatarUrl(url) {
		return `https://v1.indieweb-avatar.11ty.dev/${encodeURIComponent(url)}/`;
	});

	eleventyConfig.addJavaScriptFunction("renderNumber", function renderNumber(num) {
		if(typeof num === "string") {
			num = parseInt(num, 10);
		}
		return numeral(num).format("0,0");
	});

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
};