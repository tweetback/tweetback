window.addEventListener('message', function (event) {
	document.querySelectorAll('iframe[data-tweetback-resize]').forEach((frame) => {
		if (frame.contentWindow === event.source) {
			frame.style.height = event.data + 'px';
		}
	});
});
