function fallbackMedia(node) {
	var link = document.createElement("a");
	link.className = "tweet-media-load-error tweet-url";

	var src = node.getAttribute("src");
	link.setAttribute("href", src);
	link.innerText = src;

	var toReplace = node.tagName === "VIDEO" ? node : node.parentNode;
	toReplace.parentNode.replaceChild(link, toReplace);
}

window.fallbackMedia = fallbackMedia;