const dataSource = require("../src/DataSource");
const metadata = require("../_data/metadata.js");

module.exports = async function(data) {
	let titleTweetNumberStr = "";
	if(data.page.fileSlug === "tweet-pages") {
		titleTweetNumberStr = `—№ ${this.renderNumber(data.pagination.hrefs.length - data.pagination.pageNumber)}`;
	} else if(data.page.fileSlug === "newest") {
		titleTweetNumberStr = `—№ ${this.renderNumber((await dataSource.getAllTweets()).length)}`;
	}

	let navHtml = "";
	if(data.page.fileSlug === "tweet-pages" || data.page.fileSlug === "newest") {
		let newestHref = "/newest/";
		let previousHref = data.pagination.previousPageHref;
		let nextHref = data.pagination.nextPageHref;

		if(data.page.fileSlug === "newest") {
			newestHref = "";
			previousHref = "";
			nextHref = "/" + (await dataSource.getAllTweets()).sort((a, b) => b.date - a.date).slice(1, 2).map(tweet => tweet.id_str).join("") + "/";
		} else if(data.page.fileSlug === "tweet-pages" && data.pagination.firstPageHref === data.page.url) {
			newestHref = "";
		}

		navHtml = `<ul class="tweets-nav">
			<li>${newestHref ? `<a href="${newestHref}">` : ""}⇤ Newest<span class="sr-only"> Tweet</span>${newestHref ? `</a>` : ""}</li>
			<li>${previousHref ? `<a href="${previousHref}">` : ""}⇠ Newer<span class="sr-only"> Tweet</span>${previousHref ? `</a>` : ""}</li>
			<li>${nextHref ? `<a href="${nextHref}">` : ""}Older<span class="sr-only"> Tweet</span> ⇢${nextHref ? `</a>` : ""}</li>
		</ul>`;
	}

	let meta_description = `A read-only indieweb self-hosted archive of${ data.pagination && data.pagination.hrefs && data.pagination.hrefs.length ? ` all ${data.pagination.hrefs.length} of` : ""} ${data.metadata.username}’s tweets.`;
	if (data.page.fileSlug === "tweet-pages" && data.tweet && data.tweet.full_text) {
		// note that data.tweet.full_text is already HTML-escaped
		meta_description = data.tweet.full_text.replace(/\s+/g, " ");
	}

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${data.metadata.username}’s Twitter Archive${titleTweetNumberStr}</title>
		<meta name="description" content="${meta_description}" />

		<link rel="profile" href="https://microformats.org/profile/hatom">
		<link rel="stylesheet" href="/assets/style.css">
		<script src="/assets/script.js" type="module"></script>
		<script src="/assets/is-land.js" type="module"></script>

		${data.page.fileSlug === "newest" ? `
			<link rel="canonical" href="/${data.tweet.id_str}/">
			<meta http-equiv="refresh" content="0; url=/${data.tweet.id_str}/">
			` : ""}
	</head>
	<body>
		<header>
			<h1 class="tweets-title"><a href="/"><img src="${metadata.avatar}" width="52" height="52" alt="${data.metadata.username}’s avatar" class="tweet-avatar">${data.metadata.username}’s Twitter Archive</a>${titleTweetNumberStr}</h1>
			${!data.hideHeaderTweetsLink ? `<ul class="tweets-nav">
				<li><a rel="home" href="${data.metadata.homeUrl}">← ${data.metadata.homeLabel}</a></li>
			</ul>`: ""}
			${navHtml}
		</header>
		<main>
			${data.content}
		</main>
		<footer>
			<p>An open source project from <a href="https://github.com/tweetback">tweetback</a>.</p>
		</footer>
	</body>
</html>`;
};