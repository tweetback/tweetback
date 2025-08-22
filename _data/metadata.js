let data = {
	username: "eleven_ty", // No leading @ here
	displayname: "Eleventy",
	homeLabel: "11ty.dev",
	homeUrl: "https://www.11ty.dev/",
};

data.avatar = `https://v1.indieweb-avatar.11ty.dev/${encodeURIComponent(data.homeUrl)}/`;

module.exports = data;