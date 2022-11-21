const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/tweet.db");

class DataSource {
	constructor() {
		this.cache = {
			replies: {}
		};
	}

	async getRepliesToId(id) {
		if(!id) {
			return [];
		}

		// populate cache if it hasn’t yet.
		if(!this.cache.all) {
			await this.getAllTweets();
		}

		// full table scans for this was way too expensive, so we cache
		return this.cache.replies[id] ? Array.from(this.cache.replies[id]) : [];
	}

	async getTweetById(id) {
		if(!id) {
			return null;
		}
		// TODO get this from cache?

		return new Promise((resolve, reject) => {
			db.get("SELECT * FROM tweets WHERE id_str = ?", { 1: id }, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(row ? this.normalizeTweetObject(row) : null);
				}
			});
		});
	}

	// takes a db row, returns the tweet json
	normalizeTweetObject(tweet) {
		let json = JSON.parse(tweet.json);
		if(tweet.api_version === "2") {
			let replies = (json.referenced_tweets || []).filter(entry => entry.type === "replied_to");
			let replyTweetId = replies.length ? replies[0].id : null;

			let obj = {};
			obj.date = new Date(Date.parse(json.created_at));
			obj.id = json.id;
			obj.id_str = json.id;
			// should always be a string
			obj.full_text = json.text || "";
			obj.truncated = false;
			obj.retweet_count = json.public_metrics.retweet_count;
			obj.favorite_count = json.public_metrics.like_count;
			obj.quote_count = json.public_metrics.quote_count;
			obj.reply_count = json.public_metrics.reply_count;
			obj.in_reply_to_status_id = replyTweetId;
			obj.in_reply_to_status_id_str = replyTweetId;
			obj.in_reply_to_user_id = json.in_reply_to_user_id;
			obj.in_reply_to_user_id_str = json.in_reply_to_user_id;
			obj.in_reply_to_screen_name = tweet.in_reply_to_screen_name; // use the db row instead of the json
			obj.entities = json.entities || {};

			if(json.entities && json.entities.urls) {
				obj.entities.urls = json.entities.urls;
			} else {
				obj.entities.urls = [];
			}

			if(json.entities && json.entities.mentions) {
				obj.entities.user_mentions = json.entities.mentions.map(entry => {
					entry.screen_name = entry.username;
					return entry;
				});
			} else {
				obj.entities.user_mentions = [];
			}

			// Normalized before inserted in to the DB (see tweet-to-db.js)
			obj.extended_entities = json.extended_entities;

			return obj;
		}

		json.date = new Date(json.created_at);
		// should always be a string
		json.entities = json.entities || {};
		json.entities.urls = json.entities.urls || [];
		json.entities.user_mentions = json.entities.user_mentions || [];
		json.full_text = json.full_text || "";
		return json;
	}

	async getAllTweets() {
		if(this.cache.all) {
			return this.cache.all;
		}
		if( this.cachedGetAllPromise ) {
			return this.cachedGetAllPromise;
		}

		// This should only run once.
		this.cachedGetAllPromise = new Promise((resolve, reject) => {
			db.all("SELECT * FROM tweets", (err, rows) => {
				if(err) {
					reject(err);
				} else {
					let ret = rows.filter(row => {
						if(row.hidden) {
							return false;
						}
						return true;
					}).map(row => {
						let json = this.normalizeTweetObject(row);
						if(json.in_reply_to_status_id_str) {
							if(!this.cache.replies[json.in_reply_to_status_id_str]) {
								this.cache.replies[json.in_reply_to_status_id_str] = new Set();
							}
							this.cache.replies[json.in_reply_to_status_id_str].add(json);
						}
						return json;
					});
					this.cache.all = ret;
					resolve(ret);
				}
			});
		});

		return this.cachedGetAllPromise;
	}
}

module.exports = new DataSource();