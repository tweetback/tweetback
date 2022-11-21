const emojiRegex = require("emoji-regex");
const { flag, code, name } = require("country-emoji");

function EmojiAggregator() {
	this.emoji = [];
	this.emojiTweetCount = 0;
}

EmojiAggregator.prototype.addGlyph = function( glyph, tweet ) {
	var key = null;
	for( var j = 0, k = this.emoji.length; j < k; j++ ) {
		if( this.emoji[ j ].glyph === glyph ) {
			key = j;
			break;
		}
	}

	if( key === null ) {
		var tweets = {};
		tweets[ tweet.id ] = tweet;
		this.emoji.push( { glyph: glyph, count: 1, tweetcount: 1, tweets: tweets } );
	} else {
		this.emoji[ key ].count++;

		if( this.emoji[ key ].tweets[ tweet.id ] ) {
			// do nothing
		} else {
			this.emoji[ key ].tweetcount++;
			this.emoji[ key ].tweets[ tweet.id ] = tweet;
		}
	}
};

EmojiAggregator.prototype.add = function( tweet ) {
	var text = tweet.full_text;
	var emojis = EmojiAggregator.findEmoji( text );
	if(emojis.length) {
		this.emojiTweetCount++;
	}

	for(let emoji of emojis) {
		this.addGlyph(emoji, tweet);
	}
};

EmojiAggregator.findEmoji = function( text ) {
	var match = text.match( emojiRegex() );
	var emoji = [];
	if( match ) {
		for( var j = 0, k = match.length; j < k; j++ ) {
			// flags are encoded as two different points here
			if( j + 1 < k && code( match [ j ] + match[ j + 1 ] ) ) {
				emoji.push( match [ j ] + match[ j + 1 ] );
				j++;
			} else {
				emoji.push( match [ j ] );
			}
		}
	}
	return emoji;
};

EmojiAggregator.prototype.getTweetCount = function() {
	return this.emojiTweetCount;
};

EmojiAggregator.prototype.getSorted = function() {
	return this.emoji.slice().sort(function( a, b ) {
		return b.count - a.count;
	});
};

module.exports = EmojiAggregator;