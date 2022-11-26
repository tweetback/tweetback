let data = {
	username: "overflowhidden", // No leading @ here
	homeLabel: "kimjohannesen.dk",
	homeUrl: "https://kimjohannesen.dk/",
};

data.avatar = `https://v1.indieweb-avatar.11ty.dev/${encodeURIComponent(data.homeUrl)}/`;

module.exports = data;