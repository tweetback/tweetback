#!/bin/bash

set -euo pipefail

archive=${1:-}
user=${2:-}
image=${3:-}
if [ -z "$archive" ] || [ -z "$user" ] || [ -z "$image" ]; then
    echo "Usage: build_image.sh <path-to-twitter-export-zip> <twitter-handle-without-@> <full-container-image-name>"
    exit 0
fi

tmp=$(mktemp -d)
tweets="$tmp/tweets"
mkdir $tweets

echo "* Extracting tweets from $archive"
unzip -q $archive data/tweets.js data/twitter-circle-tweet.js -d $tweets

src="$tmp/src"
echo "* Copying source to $src"
mkdir $src
base_dir=$(cd "$(dirname ${BASH_SOURCE[0]})" && pwd)
rsync -a --exclude '.git*' $base_dir/ $src/
for f in tweets.js twitter-circle-tweet.js;
do
  cp $tweets/data/$f $src/database
  sed -i -e "s/window.YTD.tweets.part0/module.exports/" $src/database/$f
done

echo "* Updating metadata"
sed -i -e "s/username: \".*\"/username: \"$user\"/" $src/_data/metadata.js

cd $src
echo "* Creating Dockerfile"
# TODO: Create a different "npm run import"  depending on whether you
# want to import circles or not
# TODO: Would be cool to have an option for "npm start" to not check for new tweets so that container
# is completely sealed
cat > Dockerfile <<EOT
FROM node
COPY . /opt/
WORKDIR /opt
RUN npm install
RUN npm run import
RUN npm run build
EXPOSE 8080
ENTRYPOINT [ "npm", "start" ]
EOT

echo "* Build image $image"
docker build -t $image .
