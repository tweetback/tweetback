const Sentiment = require("sentiment");
const parseDomain = require("parse-domain");
const dataSource = require("./DataSource");
const metadata = require("../_data/metadata.js");
const eleventyImg = require("@11ty/eleventy-img");

const ELEVENTY_IMG_OPTIONS = {
	widths: [null],
	formats: ["jpeg"],
	// If you don’t want to check this into your git repository (and want to fetch them in your build)
	// outputDir: "./_site/img/",
	outputDir: "./img/",
	urlPath: "/img/",
	cacheDuration: "*",
	filenameFormat: function (id, src, width, format, options) {
		return `${id}.${format}`;
	}
};

const sentiment = new Sentiment();

class Twitter {
	isOriginalPost(tweet) {
		return !this.isRetweet(tweet) && !this.isMention(tweet) && !this.isReply(tweet);
	}

	isReply(tweet) {
		return !!tweet.in_reply_to_status_id;
	}

	isSearchMatch(tweet, needle, caseSensitive, before) {
		let haystack = (tweet.full_text || "");

		// transform text before search
		if(before && typeof before === "function") {
			haystack = before(haystack);
		}

		let needles = needle;
		if(!Array.isArray(needle)) {
			needles = [needle];
		}
		return needles.filter(needle => !!haystack.match(new RegExp("\\b" + needle + "\\b", "g" + (!caseSensitive ? "i" : "")))).length > 0;
	}

	getSearchTweets(tweets, searchObj) {
		return tweets.filter(tweet => {
			return this.isSearchMatch(tweet, searchObj.term, searchObj.caseSensitive, searchObj.before) &&
				!this.isRetweet(tweet) &&
				(searchObj.includeReplies || !this.isMention(tweet) && !this.isReply(tweet));
		}).sort(function(a,b) {
			return b.date - a.date;
		});
	}

	getLinkUrls(tweet) {
		let links = [];

		if(tweet.entities && tweet.entities.urls) {
			for(let url of tweet.entities.urls) {
				try {
					let urlObj = new URL(url.expanded_url);
					let parsedDomain = parseDomain(urlObj.host);
					links.push({
						host: urlObj.host,
						origin: urlObj.origin,
						domain: `${parsedDomain.domain}.${parsedDomain.tld}`
					});
				} catch(e) {
					console.log( e );
				}
			}
		}

		return links;
	}

	isRetweet(tweet) {
		return tweet && (
			tweet.full_text.startsWith("RT ") ||
			// alternate version of manual old school retweet
			tweet.full_text.startsWith("RT: ")
		);
	}

	_isMentionCheck(tweet) {
		return !this.isReply(tweet) && tweet.full_text.trim().startsWith("@") && !tweet.full_text.trim().startsWith("@font-face ");
	}

	isMention(tweet) {
		return this._isMentionCheck(tweet);
	}

	// isAmbiguousReplyMention(tweet) {
	// 	let days = 365;
	// 	let comparisonDate = new Date(2012, 5, Date.now() - 1000*60*60*24*days);
	// 	return this._isMentionCheck(tweet) && (tweet.date - comparisonDate > 0);
	// }

	getUrlObject(url) {
		let displayUrl = url.expanded_url;
		let className = "tweet-url";
		let targetUrl = url.expanded_url;

		// Links to my tweets
		if(displayUrl.startsWith(`https://twitter.com/${metadata.username}/status/`)) {
			targetUrl = `/${url.expanded_url.substr(`https://twitter.com/${metadata.username}/status/`.length)}`;
		}

		// Links to other tweets
		if(displayUrl.startsWith("https://twitter.com") && displayUrl.indexOf("/status/") > -1) {
			displayUrl = displayUrl.substring("https://twitter.com/".length);
			displayUrl = displayUrl.replace("/status/", "/");
			// displayUrl = displayUrl.replace(/(\d+)/, function(match) {
			// 	return "" + (match.length > 6 ? "…" : "") + match.substr(-6);
			// });
			className = "tweet-username";
		} else {
			if(displayUrl.startsWith("http://")) {
				displayUrl = displayUrl.substring("http://".length);
			}
			if(displayUrl.startsWith("https://")) {
				displayUrl = displayUrl.substring("https://".length);
			}
			if(displayUrl.startsWith("www.")) {
				displayUrl = displayUrl.substring("www.".length);
			}
		}
		return {
			displayUrl,
			className,
			targetUrl,
		}
	}

	async renderFullText(tweet) {
		let {transform: twitterLink} = await import("@tweetback/canonical");
		let text = tweet.full_text;

		// Markdown
		// replace `*` with <code>*</code>
		text = text.replace(/\`([^\`]*)\`/g, "<code>$1</code>");

		let medias = [];

		// linkify urls
		if( tweet.entities ) {
			for(let url of tweet.entities.urls) {
				if(url.expanded_url.indexOf(`/${tweet.id}/photo/`) > -1) { // || url.expanded_url.indexOf(`/${tweet.id}/video/`) > -1) {
					text = text.replace(url.url, "");
				} else {
					let {targetUrl, className, displayUrl} = this.getUrlObject(url);
					targetUrl = twitterLink(targetUrl);
					let displayUrlHtml = `<a href="${targetUrl}" class="${className}">${displayUrl}</a>`
					text = text.replace(url.url, displayUrlHtml);

					if(targetUrl.startsWith("https://") && !targetUrl.startsWith("https://twitter.com/")) {
						medias.push(`<a href="${targetUrl}"><img src="https://v1.opengraph.11ty.dev/${encodeURIComponent(targetUrl)}/small/" alt="OpenGraph image for ${displayUrl}" loading="lazy" decoding="async" width="375" height="197" class="tweet-media tweet-media-og"></a>`);
					}
				}
			}

			for(let mention of tweet.entities.user_mentions) {
				let usernameMatch = new RegExp(`@${mention.screen_name}`, "i");
				text = text.replace(usernameMatch, `<a href="${twitterLink(`https://twitter.com/${mention.screen_name}/`)}" class="tweet-username">${mention.screen_name}</a>`);
			}
		}

		if( tweet.extended_entities ) {
			for(let media of tweet.extended_entities.media ) {
				if(media.type === "photo") {
					// remove photo URL
					text = text.replace(media.url, "");

					let imgHtml = "";
					// TODO the await use here on eleventyImg could be improved
					try {
						let stats = await eleventyImg(media.media_url_https, ELEVENTY_IMG_OPTIONS);
						let imgRef = stats.jpeg[0];
						imgHtml = `<img src="${imgRef.url}" width="${imgRef.width}" height="${imgRef.height}" alt="${media.alt_text || "oh my god twitter doesn’t include alt text from images in their API"}" class="tweet-media" onerror="fallbackMedia(this)" loading="lazy" decoding="async">`;
						medias.push(`<a href="${imgRef.url}">${imgHtml}</a>`);
					} catch(e) {
						console.log("Image request error", e.message);
						medias.push(`<a href="${media.media_url_https}">${media.media_url_https}</a>`);
					}
				} else if(media.type === "animated_gif" || media.type === "video") {
					if(media.video_info && media.video_info.variants) {
						text = text.replace(media.url, "");

						let remoteVideoUrl = media.video_info.variants[0].url;

						try {
							let stats = await eleventyImg(media.media_url_https, ELEVENTY_IMG_OPTIONS);
							let imgRef = stats.jpeg[0];
							medias.push(`<video muted controls ${media.type === "animated_gif" ? "loop" : ""} src="${remoteVideoUrl}" poster="${imgRef.url}" class="tweet-media"></video>`);
						} catch(e) {
							console.log("Video request error", e.message);
							medias.push(`<a href="${remoteVideoUrl}">${remoteVideoUrl}</a>`);
						}
					}
				}
			}
		}
		if(medias.length) {
			text += `<div class="tweet-medias">${medias.join("")}</div>`;
		}
		return text;
	}

	getSentiment(tweet) {
		return sentiment.analyze(tweet.full_text).score;
	}

	cleanupSource(text) {
		text = text.replace("Twitter for", "via");
		text = text.replace("Twitter Web App", "");
		text = text.replace("Twitter Web Client", "");
		return text.trim();
	}

	renderDate(d) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
	}

	renderPercentage(count, total) {
		return `${(count * 100 / total).toFixed(1)}%`;
	}

	async renderTweet(tweet, options = {}) {
		if( !tweet ) {
			return "";
		}

		let {transform: twitterLink} = await import("@tweetback/canonical");
		let sentimentValue = this.getSentiment(tweet);

		let shareCount = parseInt(tweet.retweet_count, 10) + (tweet.quote_count ? tweet.quote_count : 0);

		return `<li id="${tweet.id_str}" class="tweet${options.class ? ` ${options.class}` : ""}${this.isReply(tweet) && tweet.in_reply_to_screen_name !== metadata.username ? " is_reply " : ""}${this.isRetweet(tweet) ? " is_retweet" : ""}${this.isMention(tweet) ? " is_mention" : ""}">
		${this.isReply(tweet) ? `<a href="${tweet.in_reply_to_screen_name !== metadata.username ? twitterLink(`https://twitter.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`) : `/${tweet.in_reply_to_status_id_str}/`}" class="tweet-pretext">…in reply to @${tweet.in_reply_to_screen_name}</a>` : ""}
			<div class="tweet-text">${await this.renderFullText(tweet, options)}</div>
			<span class="tweet-metadata">
				${!options.hidePermalink ? `<a href="/${tweet.id_str}/" class="tag tag-naked">Permalink</a>` : ""}
				<a href="https://twitter.com/${metadata.username}/status/${tweet.id_str}" class="tag tag-icon"><span class="sr-only">On twitter.com </span><img src="${this.avatarUrl("https://twitter.com/")}" alt="Twitter logo" width="27" height="27"></a>
				${!this.isReply(tweet) ? (this.isRetweet(tweet) ? `<span class="tag tag-retweet">Retweet</span>` : (this.isMention(tweet) ? `<span class="tag">Mention</span>` : "")) : ""}
				${!this.isRetweet(tweet) ? `<a href="/" class="tag tag-naked tag-lite tag-avatar"><img src="/assets/avatar.jpg" width="52" height="52" alt="${metadata.username}’s avatar" class="tweet-avatar"></a>` : ""}
				${options.showPopularity && !this.isRetweet(tweet) ? `
					${shareCount > 0 ? `<span class="tag tag-lite tag-retweet">♻️ ${this.renderNumber(shareCount)}<span class="sr-only"> Retweet${shareCount !== "1" ? "s" : ""}</span></span>` : ""}
					${tweet.favorite_count > 0 ? `<span class="tag tag-lite tag-favorite">❤️ ${this.renderNumber(tweet.favorite_count)}<span class="sr-only"> Favorite${tweet.favorite_count !== "1" ? "s" : ""}</span></span>` : ""}
				`.trim() : ""}
				${tweet.date ? `<span class="tag tag-naked tag-lite">${this.renderDate(tweet.date)}</span>` : ""}
				${!this.isRetweet(tweet) ?
					`<span class="tag tag-naked tag-lite${!options.showSentiment || sentimentValue === 0 ? " sr-only" : ""}">Mood ` +
						(sentimentValue > 0 ? "+" : "") +
						`<strong class="tweet-sentiment">${sentimentValue}</strong>` +
						(sentimentValue > 0 ? " 🙂" : (sentimentValue < 0 ? " 🙁" : "")) +
					"</span>" : ""}
			</span>
		</li>`;

		// source ? `<span class="tag tag-naked tag-lite">${source}</span>` : ""
	}

	async getReplies(tweet, direction = "next") {
		if( direction === "next" ) {
			return (await dataSource.getRepliesToId(tweet.id_str)) || [];
		} else {
			let replyTweet = await dataSource.getTweetById(tweet && tweet.in_reply_to_status_id_str);
			return replyTweet ? [replyTweet] : [];
		}
	}

	async getReplyHtml(tweet, direction = "next", tweetOptions = {}) {
		let replies = await this.getReplies(tweet, direction);
		if(!replies.length) {
			return "";
		}

		let repliesHtml = [];
		for(let replyTweet of replies) {
			let tweetHtml = await this.renderTweet(replyTweet, Object.assign({ class: `tweet-${direction}` }, tweetOptions));
			let previousHtml = direction === "previous" ? await this.getReplyHtml(replyTweet, direction, tweetOptions) : "";
			let nextHtml = direction === "next" ? await this.getReplyHtml(replyTweet, direction, tweetOptions) : "";

			repliesHtml.push((previousHtml ? `<ol class="tweets-replies">${previousHtml}</ol>` : "") +
				tweetHtml +
				(nextHtml ? `<ol class="tweets-replies">${nextHtml}</ol>` : ""));
		}

		return repliesHtml.join("");
	}

	async renderTweetThread(tweet, tweetOptions = {}) {
		let previousAndNextTweetOptions = Object.assign({}, tweetOptions, { hidePermalink: false });
		let previousHtml = await this.getReplyHtml(tweet, "previous", previousAndNextTweetOptions);
		let nextHtml = await this.getReplyHtml(tweet, "next", previousAndNextTweetOptions);
		return `<ol class="tweets tweets-thread">
			${previousHtml ? `<ol class="tweets-replies">${previousHtml}</ol>` : ""}
			${await this.renderTweet(tweet, tweetOptions)}
			${nextHtml ? `<ol class="tweets-replies">${nextHtml}</ol>` : ""}
		</ol>`;
	}

	getMostPopularTweets(tweets, limit = 15, forYear) {
		function sortByShareCount(a, b) {
			let shareCountA = (parseInt(a.retweet_count, 10) || 0) + (parseInt(a.quote_count, 10) || 0);
			let shareCountB = (parseInt(b.retweet_count, 10) || 0) + (parseInt(b.quote_count, 10) || 0);
			return shareCountB - shareCountA;
		}

		let topTweets = tweets.filter(tweet => {
			return !this.isRetweet(tweet) && (!forYear || forYear == tweet.date.getFullYear());
		});
		let top = new Set();

		let topRetweets = topTweets.sort(sortByShareCount).slice(0, limit);
		for( let tweet of topRetweets) {
			top.add(tweet);
		}

		let topFavorites = topTweets.sort(function(a,b) {
			return parseInt(b.favorite_count, 10) - parseInt(a.favorite_count, 10);
		}).slice(0, limit);

		for( let tweet of topFavorites) {
			top.add(tweet);
		}

		return Array.from(top).sort(sortByShareCount);
	}
}
module.exports = Twitter;