require('dotenv').config();
const { checkInDatabase, logTweetCount, saveToDatabaseApiV1, createTable } = require("./tweet-to-db");
const tweets = require("./tweets.js");

console.log( `${tweets.length} tweets found in archive.` );
logTweetCount();

async function retrieveTweets() {
	let existingRecordsFound = 0;
	let missingTweets = 0;

	for(let {tweet} of tweets ) {
		checkInDatabase(tweet).then((tweet) => {
			if(tweet === false) {
				existingRecordsFound++;
			} else {
				missingTweets++;
				saveToDatabaseApiV1(tweet);
				// console.log( "Missing tweet", { tweet });
				console.log( {existingRecordsFound, missingTweets} );
				logTweetCount();
			}
		});
	}
}

(async function() {
	try {
		createTable();

		await retrieveTweets();
	} catch(e) {
		console.log( "ERROR", e );
	}
})();

