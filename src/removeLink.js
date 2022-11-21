module.exports = function(text, replacementText) {
	return text.replace( /\<[^\>]*\>/g, replacementText || "" );
};