const Twitter = require("./src/twitter");
const dataSource = require("./src/DataSource");

/* This is related to the tweet-pages template so each individual page there doesn’t need an update when the newest tweet url changes */
class NewestTweet extends Twitter {
	async data() {
		return {
			tweets: await dataSource.getAllTweets(),
			pagination: {
				data: "tweets",
				size: 1,
				before: (paginationData) => paginationData.sort((a, b) => b.date - a.date).slice(0, 1),
				alias: "tweet"
			},
			layout: "layout.11ty.js",
			permalink: "/newest/",
			hideHeaderTweetsLink: true
		};
	}

	async render(data) {
		// returns promise
		return await this.renderTweetThread(data.tweet, { hidePermalink: false });
	}
}

module.exports = NewestTweet;