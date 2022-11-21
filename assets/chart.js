var sentimentMaxSeriesLength = 40;

function makeSentimentChart( chartSelector, dataInput, meanValue, chartOptionsOverrides ) {
	var sliced = dataInput.slice( 0, sentimentMaxSeriesLength );

	var dataSeries = [];
	var averageSeries = [];
	var zeroSeries = [];
	var series = [];

	sliced.forEach(function( sentimentValue, index ) {
		zeroSeries.push({ x: index, y: 0 });
		dataSeries.push({ x: index, y: parseInt( sentimentValue, 10 ) });
		if( meanValue ) {
			averageSeries.push({ x: index, y: meanValue });
		}
	});

	// if( sliced.length === 1 ) {
	// 	dataSeries.push( { x: 1, y: dataSeries[ 0 ].y } );
	// }
	if( sliced.length <= 1 ) {
		zeroSeries = [{ x: 0, y: 0 }, { x: sliced.length - 1, y: 0 }];
	}

	series.push( zeroSeries );
	series.push( averageSeries );
	series.push( dataSeries );

	var chartOptions = {
		showPoint: true,
		fullWidth: true,
		chartPadding: {top: 4,right: 4,bottom: 4,left: 4},
		axisX: {showGrid: false, showLabel: false, offset: 0},
		axisY: {showGrid: false, showLabel: false, offset: 0}
	};

	if( chartOptionsOverrides ) {
		for( var j in chartOptionsOverrides ) {
			chartOptions[ j ] = chartOptionsOverrides[ j ];
		}
	}

	new Chartist.Line( chartSelector, {
		series: series
	}, chartOptions );
}

function getSentimentsFromList( listSelector ) {
	var list = document.querySelector( listSelector );
	return Array.prototype.slice.call( list.querySelectorAll( ".tweet-sentiment" ) ).map(value => value.innerHTML);
}