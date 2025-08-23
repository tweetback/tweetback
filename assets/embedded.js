if (!document.parent) return
document.addEventListener('load', function () {
	document.parent.postMessage(document.body.offsetHeight, '*')
})
