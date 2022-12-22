// TODO migrate from twitter-lite to use this @11ty/eleventy-fetch based service
const EleventyFetch = require("@11ty/eleventy-fetch");

require('dotenv').config();

class TwitterApi {
	constructor(service) {
		this.url = `https://api.twitter.com/2/${service}`;
	}

	setParams(params) {
		this.urlParams = params || {};
	}

	convertParamsToString() {
		let str = [];
		for(let key in this.urlParams) {
			str.push(`${key}=${this.urlParams[key]}`);
		}
		return `?${str.join("&")}`
	}

	getUrl() {
		return `${this.url}${this.convertParamsToString()}`;
	}

	fetch(cacheDuration) {
		// returns promise
		return EleventyFetch(this.getUrl(), {
			duration: cacheDuration || "*",
			type: "json",
			fetchOptions: {
				headers: {
					"user-agent": "TweetBack Twitter Archive v1.0.0",
					"authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
				},
			}
		});
	}
}

async function TwitterApiFetchUserId(username, cacheDuration) {
	// https://api.twitter.com/2/users/by?usernames=YOUR_USER_NAME&user.fields=created_at,description&expansions=pinned_tweet_id
	let service = new TwitterApi("users/by");

	service.setParams({
		usernames: username,
	});

	let {data} = await service.fetch(cacheDuration);
	if(data.length > 0 && data[0].id) {
		return data[0].id;
	}

	throw new Error("Could not find user in Twitter API: " + username);
}

module.exports = { TwitterApi, TwitterApiFetchUserId };