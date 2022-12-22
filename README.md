# `tweetback` Twitter Archive

Take ownership of your Twitter data. First talked about at [Jamstack Conf 2019](https://www.zachleat.com/web/own-your-content/) and in [this blog post](https://www.zachleat.com/web/own-my-tweets/).

## Demos

* https://www.zachleat.com/twitter/
* https://twitter.11ty.dev/

## Features

* Built with [Eleventy](https://www.11ty.dev/)
* Each tweet has its own independent URL (with backwards/forwards threading!)
* Uses [`@tweetback/canonical`](https://github.com/tweetback/tweetback-canonical) to resolve other Twitter archives URLs (internal links stay in the archive and don’t link out to Twitter).
* `t.co` links are bypassed and original hyperlinks URLs are used.
* Links to users, tweets, non-truncated URLs.
* Nicer link formatting for links-to-tweets: @username/:id.
* Support some markdown: I sometimes use `backtick` markdown notation for code in my tweet text. This translates to `<code>` properly.
* Analytics:
	* See your most popular tweets
	* Who you retweet the most
	* Who you reply to the most
	* Frequently used swear words
	* Top emoji
	* Top hashtags

## Usage

* Clone/download this repository
* In your terminal, `cd` to the folder of the project
* Install [Node.js](https://nodejs.org/)
* Run `npm install`

### Populate the database from your Twitter Archive zip

1. Copy `./data/tweets.js` from your [Twitter Archive](https://help.twitter.com/en/managing-your-account/how-to-download-your-twitter-archive) `zip` file into the `./database` directory of this project.
   * Rename `window.YTD.tweet.part0` in `tweets.js` to `module.exports`
1. If you want to exclude Twitter Circles tweets (these are included in the archive, why 😭): copy `./data/twitter-circle-tweet.js` from your Twitter Archive `zip` file into the `./database` directory of this project.
   * Rename `window.YTD.tweet.part0` in `twitter-circle-tweet.js` to `module.exports`
1. Run `npm run import` or `npm run import-without-circles`

### Build the web site

1. Edit the `_data/metadata.js` file to add metadata information.
1. _Optional:_ If you want the web site to live in a subdirectory (e.g. `/twitter/`), use [Eleventy’s Path Prefix feature](https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix) via the command line `--pathprefix=twitter` or via a return object in your configuration file.
1. Run `npm run build` or `npm start`

⚠️ _Warning_: the first build may take quite a long time (depending on the size of your archive), as remote media is fetched/downloaded into your project locally. Repeat builds will be much faster.

### Fetch additional tweets from the API (optional)

If you want to fetch additional tweets from the API and put them into your sqlite database:

1. You will need a twitter developer token an a `TWITTER_BEARER_TOKEN` environment variable (from the Twitter API v2). Read more about [App-only Bearer Tokens](https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens).
1. Run `npm run fetch-new-data`

### Add your production URL to `@tweetback/canonical` (optional)

https://github.com/tweetback/tweetback-canonical has a `mapping.js` file that stores the existing twitter username => canonical URL mappings. These will be transformed automatically to point to other archives in all `tweetback` instances.

### Publish your archive (optional)

- To [GitHub Pages](docs/deploy-with-github-pages.md)

