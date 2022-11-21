const Twitter = require("./src/twitter");
const dataSource = require("./src/DataSource");

class TweetToFile extends Twitter {
	async data() {
		return {
			tweets: await dataSource.getAllTweets(),
			pagination: {
				data: "tweets",
				size: 1,
				before: (paginationData) => paginationData.sort((a, b) => b.date - a.date),
				alias: "tweet"
			},
			layout: "layout.11ty.js",
			// permalink: false,
			permalink: data => `/${data.tweet.id_str}/`,
			hideHeaderTweetsLink: true
		};
	}

	async render(data) {
		return await this.renderTweetThread(data.tweet, { hidePermalink: true, showPopularity: true });
	}
}

module.exports = TweetToFile;