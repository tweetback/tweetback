require('dotenv').config();

const Twitter = require( "twitter-lite" );
const { TwitterApiFetchUserId } = require("./twitter-api.js");
const { checkInDatabase, saveToDatabase, logTweetCount } = require("./tweet-to-db");
const metadata = require("../_data/metadata.js")

const RESULTS_PER_PAGE = 100;
const STOP_FETCH_AT_EXISTING_RECORD_COUNT = 200;

const client = new Twitter({
	version: "2",
	extension: false,
	bearer_token: process.env.TWITTER_BEARER_TOKEN,
});

let requestCount = 0;

async function retrieveTweets( maxId, existingRecordsFound = 0 ) {
	console.log( "Fetching more tweets!", maxId );
	var params = {
		// since_id
		max_results: RESULTS_PER_PAGE,
		expansions: [
			"in_reply_to_user_id",
			"attachments.media_keys",
			// "referenced_tweets.id",
			// "referenced_tweets.id.author_id",
			// "entities.mentions.username",
		].join(","),
		"media.fields": [
			"width",
			"height",
			"alt_text",
			"type",
			"preview_image_url",
			"url",
			// "non_public_metrics",
			// "organic_metrics",
			// "promoted_metrics",
		].join(","),
		"tweet.fields": [
			"attachments",
			"author_id",
			// "context_annotations",
			"conversation_id",
			"created_at",
			"entities",
			"id",
			"in_reply_to_user_id",
			"lang",
			"public_metrics",
			// "non_public_metrics",
			// "organic_metrics",
			// "promoted_metrics",
			"possibly_sensitive",
			"referenced_tweets",
			"reply_settings",
			"source",
			"text",
			"withheld"
		].join(",")
	};

	if( maxId ) {
		params.until_id = maxId;
	}

	console.log( params );

	let twitterUserId = await TwitterApiFetchUserId(metadata.username);
	console.log( "Found userid", twitterUserId );

	console.log( "TWITTER REQUEST to statuses/user_timeline (1500/15m)", ++requestCount );
	let results = await client.get( `users/${twitterUserId}/tweets`, params);
	if(results.errors) {
		console.log( "ERRORS", results.errors );
	}

	let tweets = results.data;
	let users = results.includes.users;
	let media = results.includes.media;

	console.log( `${tweets.length} tweets found.` );
	// console.log( JSON.stringify(tweets, null, 2) );

	let promises = [];
	for(let tweet of tweets ) {
		maxId = tweet.id;
		promises.push(checkInDatabase(tweet));
	}
	let pendingTweets = await Promise.all(promises);

	for(let tweet of pendingTweets) {
		if(tweet === false) {
			existingRecordsFound++;
		} else {
			saveToDatabase(tweet, users, media);
		}
	}

	logTweetCount();

	if(existingRecordsFound < STOP_FETCH_AT_EXISTING_RECORD_COUNT) {
		retrieveTweets(maxId, existingRecordsFound);
	} else {
		console.log( STOP_FETCH_AT_EXISTING_RECORD_COUNT, " existing records found, stopping." );
	}
}

(async function() {
	try {
		await retrieveTweets();
	} catch(e) {
		console.log( "ERROR", e );
	}
})();

