const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/tweet.db");
const getDateString = require( "./getDateString" );

function createTable() {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS tweets (id_str TEXT PRIMARY KEY ASC, created_at TEXT, in_reply_to_status_id_str TEXT, in_reply_to_screen_name TEXT, full_text TEXT, json TEXT, api_version TEXT, hidden INTEGER)");
  })
}

// if the tweet does not exist in the DB, resolves a promise with the tweet ID
function checkInDatabase(tweet) {
  // save tweet to db
  return new Promise(function(resolve, reject) {
    db.get("SELECT * FROM tweets WHERE id_str = ?", { 1: tweet.id }, function(err, row) {
      if(err) {
        reject(`Error on .get() ${err}`);
      } else if(row) {
        resolve(false);
      } else {
        resolve(tweet);
      }
    });
  });
}

function saveToDatabaseApiV1( tweet ) {
  const API_VERSION = 1;

  db.parallelize(function() {
    let stmt = db.prepare("INSERT OR IGNORE INTO tweets VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(tweet.id_str, getDateString(tweet.created_at), tweet.in_reply_to_status_id_str, tweet.in_reply_to_screen_name, tweet.full_text, JSON.stringify(tweet), API_VERSION, "");
    stmt.finalize();
  });
}

function saveToDatabase( tweet, users, mediaObjects ) {
  // console.log( "Saving", {tweet} );
  const API_VERSION = 2;

  let replies = (tweet.referenced_tweets || []).filter(entry => entry.type === "replied_to");
  let replyTweetId = replies.length ? replies[0].id : null;

  let userEntry = users.filter(entry => entry.id === tweet.in_reply_to_user_id);
  let replyScreenName = userEntry.length ? userEntry[0].username : null;

  // We need to normalize the mediaObjects into each row, the Twitter API has them separated out
  if(tweet.attachments && tweet.attachments.media_keys) {
    tweet.extended_entities = {
      media: []
    };

    for(let key of tweet.attachments.media_keys) {
      let [media] = mediaObjects.filter(entry => entry.media_key === key);
      if(media) {
        // aliases for v1
        if(media.type === "video") { // video
          media.media_url_https = media.preview_image_url;
          media.video_info = {
            variants: [
              {
                url: media.url
              }
            ]
          };
        } else {
          media.media_url_https = media.url;
        }

        tweet.extended_entities.media.push(media);
      } else {
        throw new Error(`Media object not found for media key ${key} on tweet ${tweet.id}`);
      }
    }

    // console.log( JSON.stringify(tweet, null, 2) );
  }

  let stmt = db.prepare("INSERT INTO tweets VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  stmt.run(tweet.id, getDateString(tweet.created_at), replyTweetId, replyScreenName, tweet.text, JSON.stringify(tweet), API_VERSION, "");
  stmt.finalize();
}

function logTweetCount() {
  db.each("SELECT COUNT(*) AS count FROM tweets", function(err, row) {
    console.log("Finished count", row);
  });
}

module.exports = {
  checkInDatabase,
  saveToDatabase,
  saveToDatabaseApiV1,
  logTweetCount,
  createTable,
}