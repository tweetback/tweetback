# `tweetback` Twitter Archive

## Populate the database from your Twitter Archive zip

1. Copy `./data/tweets.js` from your Twitter Archive `zip` file into the `./database` directory of this project.
1. Rename `window.YTD.tweet.part0` in `tweets.js` to `module.exports`
1. Run `npm run import`

## Build the web site

1. Edit the `_data/metadata.js` file to add metadata information.
1. Run `npm run build` or `npm start`

Note that the first build may take quite a long time (depending on the size of your archive), as remote media is fetched/downloaded into your project locally. Repeat builds will be much faster.

## Fetch additional tweets from the API

If you want to fetch additional tweets from the API and put them into your sqlite database:

1. You will need a twitter developer token an a `TWITTER_BEARER_TOKEN` environment variable (from the Twitter API v2).
1. Run `npm run data`

## Contributors

* [Zach Leatherman](https://zachleat.com/)
