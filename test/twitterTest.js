const test = require("ava");

const Twitter = require("../src/twitter.js");

test("Twitter can be instantiated", (t) => {
	const twitter = new Twitter()
	t.true(twitter instanceof Twitter)
})
