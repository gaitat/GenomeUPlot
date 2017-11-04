/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

var GenomePlot = GenomePlot || { REVISION: '1.0e-6' };

"use strict";

GenomePlot.sampleGenome = "GRCh38";

GenomePlot.referenceFiles = {
	hg19: {
		cytoBand: 'reference/cytobands/hg19/cytoBand.json',
	},
	hg38: {
		cytoBand: 'reference/cytobands/hg38/cytoBand.json',
	},
};

// this should actually be based on the build; currently GRCh38(hg38)
GenomePlot.chromosomes =
{
	 "1": { "genomicSize": 248956422 },
	 "2": { "genomicSize": 242193529 },
	 "3": { "genomicSize": 198295559 },
	 "4": { "genomicSize": 190214555 },
	 "5": { "genomicSize": 181538259 },
	 "6": { "genomicSize": 170805979 },
	 "7": { "genomicSize": 159345973 },
	 "8": { "genomicSize": 145138636 },
	 "9": { "genomicSize": 138394717 },
	"10": { "genomicSize": 133797422 },
	"11": { "genomicSize": 135086622 },
	"12": { "genomicSize": 133275309 },
	"13": { "genomicSize": 114364328 },
	"14": { "genomicSize": 107043718 },
	"15": { "genomicSize": 101991189 },
	"16": { "genomicSize": 90338345 },
	"17": { "genomicSize": 83257441 },
	"18": { "genomicSize": 80373285 },
	"19": { "genomicSize": 58617616 },
	"20": { "genomicSize": 64444167 },
	"21": { "genomicSize": 46709983 },
	"22": { "genomicSize": 50818468 },
	"23": {
		"genomicSize": 156040895,
		"name": "X"
	},
	"24": {
		"genomicSize": 57227415,
		"name": "Y"
	}
};

GenomePlot.chromosomesCircos = [
	{ "id": "chr1", "label": "1", "color": "#996600", "len": 248956422 },
	{ "id": "chr2", "label": "2", "color": "#666600", "len": 242193529 },
	{ "id": "chr3", "label": "3", "color": "#99991E", "len": 198295559 },
	{ "id": "chr4", "label": "4", "color": "#CC0000", "len": 190214555 },
	{ "id": "chr5", "label": "5", "color": "#FF0000", "len": 181538259 },
	{ "id": "chr6", "label": "6", "color": "#FF00CC", "len": 170805979 },
	{ "id": "chr7", "label": "7", "color": "#FFCCCC", "len": 159345973 },
	{ "id": "chr8", "label": "8", "color": "#FF9900", "len": 145138636 },
	{ "id": "chr9", "label": "9", "color": "#FFCC00", "len": 138394717 },
	{ "id": "chr10", "label": "10", "color": "#FFFF00", "len": 133797422 },
	{ "id": "chr11", "label": "11", "color": "#CCFF00", "len": 135086622 },
	{ "id": "chr12", "label": "12", "color": "#00FF00", "len": 133275309 },
	{ "id": "chr13", "label": "13", "color": "#358000", "len": 114364328 },
	{ "id": "chr14", "label": "14", "color": "#0000CC", "len": 107043718 },
	{ "id": "chr15", "label": "5", "color": "#6699FF", "len": 101991189 },
	{ "id": "chr16", "label": "16", "color": "#99CCFF", "len": 90338345 },
	{ "id": "chr17", "label": "17", "color": "#00FFFF", "len": 83257441 },
	{ "id": "chr18", "label": "18", "color": "#CCFFFF", "len": 80373285 },
	{ "id": "chr19", "label": "19", "color": "#9900CC", "len": 58617616 },
	{ "id": "chr20", "label": "20", "color": "#CC33FF", "len": 64444167 },
	{ "id": "chr21", "label": "21", "color": "#CC99FF", "len": 46709983 },
	{ "id": "chr22", "label": "22", "color": "#666666", "len": 50818468 },
	{ "id": "chrX", "label": "X", "color": "#999999", "len": 156040895 },
	{ "id": "chrY", "label": "Y", "color": "#CCCCCC", "len": 57227415 },
];

// constants
GenomePlot.MEGA_BASE = 1000000;		// convert to MBase
GenomePlot.MAX_CHROMOSOME_BASE = GenomePlot.chromosomes["1"].genomicSize * 1.05;	// 250 * MEGA_BASE;
GenomePlot.NUM_CHROMS = 24;
GenomePlot.MAX_CURVATURE = 10.;
GenomePlot.GENOMIC_OVERLAP = 500000;
GenomePlot.FLOAT_PRECISION = 4;

// Cytogenetic band colors, typically reported in karyotype files.
// Colors define the G-staining shades seen in ideograms
GenomePlot.cytoBandColors = [];
GenomePlot.cytoBandColors["gpos"]		= "rgb(0,0,0)";
GenomePlot.cytoBandColors["gpos100"]	= "rgb(0,0,0)";
GenomePlot.cytoBandColors["gpos75"]		= "rgb(0,0,0)";
GenomePlot.cytoBandColors["gpos66"]		= "rgb(160,160,160)";
GenomePlot.cytoBandColors["gpos50"]		= "rgb(200,200,200)";
GenomePlot.cytoBandColors["gpos33"]		= "rgb(210,210,210)";
GenomePlot.cytoBandColors["gpos25"]		= "rgb(200,200,200)";
GenomePlot.cytoBandColors["gvar"]		= "rgb(220,220,220)";		// rgb(0.86,0.86,0.86), hsl(0 0 0.86)
GenomePlot.cytoBandColors["gneg"]		= "rgb(255,255,255)";		// rgb(1,1,1), hsl(0,0,1)
GenomePlot.cytoBandColors["acen"]		= "rgb(217,47,39)";			// rgb(0.85 0.185 0.153, hsl(0.0075 0.7 0.5)
GenomePlot.cytoBandColors["stalk"]		= "rgb(100,127,164)";		// rgb(0.39 0.5 0.64), hsl(0.6 0.26 0.52)

// copy number colors
GenomePlot.copyNumberStateColor = new Array(3);
GenomePlot.copyNumberStateColor[0] = "red";		// loss
GenomePlot.copyNumberStateColor[1] = "grey";	// normal
GenomePlot.copyNumberStateColor[2] = "blue";	// gain

// junctions colors
GenomePlot.junctionNormalColor = "magenta";

// from: http://www.hexcolortool.com/
// from: http://marcodiiga.github.io/rgba-to-rgb-conversion
GenomePlot.junctionTransposonColor = "#ff99ff";	// magenta lightened 60%

GenomePlot.junctionTypeColor = function( d ) {
	return ( ! isNaN( d.transposonMetric ) && d.transposonMetric >= GenomePlot.junctionsParams.transposon ) ?
		GenomePlot.junctionTransposonColor :
		GenomePlot.junctionNormalColor;
};

// junctions thickness
GenomePlot.junctionThickness = function( d ) { return GenomePlot.junctionsParams.thickness ? Math.sqrt (d.Nassoc) + 1 : 2; };

GenomePlot.junctionIndicatorThickness = function( d ) { return GenomePlot.junctionThickness( d ) + 4; };
GenomePlot.junctionIndicatorHighlightThickness = function( d ) { return GenomePlot.junctionIndicatorThickness( d ); };
GenomePlot.junctionIndicatorOpacity = function( d ) { return d3.select( "#tableData .s" + (d.Nassoc === "" ? 0 : d.Nassoc) + d.chrA + d.chrB + d.posA + d.posB + ".info").empty() ? 0 : 1 };

GenomePlot.junctionIndicatorStyle = {
	normal: {
		"opacity": GenomePlot.junctionIndicatorOpacity,
		"stroke-width": GenomePlot.junctionIndicatorThickness,
	//	"stroke": "#000080"
	},
	highlight: {
		"opacity": 1,
		"stroke-width": GenomePlot.junctionIndicatorHighlightThickness,
		"stroke": "#000080"
	}
};

GenomePlot.junctionNoURLColor = "#444444";
GenomePlot.junctionNoURLThickness = 1;

GenomePlot.junctionOrientationRadius = function( d ) { return GenomePlot.junctionsParams.thickness ? ( Math.sqrt (d.Nassoc) + 4 ) / 3 : 1; };

GenomePlot.debug = false;
GenomePlot.noGUI = false;

GenomePlot.criteriaRunAtStartup = false;
GenomePlot.criteriaArcFactorsAnimate = true;

// initial values for parameters
GenomePlot.initVals = {};

GenomePlot.initVals.miscParams = {
	showTooltips: false,
	showHoverline: false,
	showChromosomeHorizontalDividers: true,
	showChromosomeVerticalDividers: true,
	showAdditionalAxis: false,
};

GenomePlot.initVals.cytoBandsParams = {
	visibility:	15,
};

GenomePlot.initVals.graphTypeParams = {
	graphTypes: [ "U-Shape", "Circos" ]
};

GenomePlot.initVals.junctionsParams = {
	drawTypes:	[ "None", "Arcs" ],
	arcFactor:	GenomePlot.MAX_CURVATURE,	// arc curvature factor
	thickness:	true,	// associate thickness with # reads supporting event
	associates:	4,		// filter on # of reads supporting events
	maxAssoc:	500,
	transposon:	0.375,
	orientation:	true,
};

GenomePlot.initVals.copyNumberParams = {
	drawTypes:	[ "None", "Lines" ],
};

// local
GenomePlot.miscParams		= JSON.parse(JSON.stringify( GenomePlot.initVals.miscParams ));
GenomePlot.cytoBandsParams	= JSON.parse(JSON.stringify( GenomePlot.initVals.cytoBandsParams ));
GenomePlot.graphTypeParams	= JSON.parse(JSON.stringify( GenomePlot.initVals.graphTypeParams ));
GenomePlot.junctionsParams	= JSON.parse(JSON.stringify( GenomePlot.initVals.junctionsParams ));
GenomePlot.copyNumberParams	= JSON.parse(JSON.stringify( GenomePlot.initVals.copyNumberParams ));

GenomePlot.graphTypeParams.graphType = GenomePlot.initVals.graphTypeParams.graphTypes[0];

GenomePlot.junctionsParams.drawType = GenomePlot.initVals.junctionsParams.drawTypes[1];

GenomePlot.copyNumberParams.drawType = GenomePlot.initVals.copyNumberParams.drawTypes[1];

GenomePlot.parseQueryString = function ()
{
	// data
	GenomePlot.sampleId = getQueryVariable("sampleId");	// sampleId is case sencitive

	// data from the yaml pipelineConfig file
	GenomePlot.minimumClusterSizeToGeneratePlot =
		GenomePlot.junctionsParams.associates = 3;
};

/*
 * // from: http://stackoverflow.com/questions/17090642/d3-ignore-certain-row-in-csv
 * // from: http://stackoverflow.com/questions/13436519/csv-tsv-comment-lines-d3
 * The `d3.csv()` function does both the *loading* and the *parsing* without giving you a chance to intervene.
 * If you need to intervene, you need to load the csv as plain text, without parsing it.
 * Then remove the unnedded lines and pass it as a String into the csv module for parsing.
 *
 * For loading, use [`d3.xhr()`](https://github.com/mbostock/d3/wiki/Requests#wiki-d3_xhr)
 * For parsing, use [`d3.csv.parse()`](https://github.com/mbostock/d3/wiki/CSV#wiki-parse).
 */

GenomePlot.initData = function ()
{
	GenomePlot.prefixFile = "./data/" + GenomePlot.sampleId;
	GenomePlot.matepairDataFile = GenomePlot.prefixFile + "/" + GenomePlot.sampleId + "_visualization.json";

	GenomePlot.matepairData = undefined;
	if( GenomePlot.matepairDataFile === undefined ) {
		console.error( sprintf( "%-18s Undefined Mate Pair data file", "initData():" ) );
	}
	else {
		$.ajaxFileExists (GenomePlot.matepairDataFile)
			.done (function () {
				GenomePlot.matepairDataStartTime = performance.now();
				console.info( sprintf( "%-20s Started loading Mate Pair data file: %s at %.4fms", "initData():", GenomePlot.matepairDataFile, GenomePlot.matepairDataStartTime ) );

				// load pipeline file, synchronously
				GenomePlot.matepairData = $.ajaxJSONSync (GenomePlot.matepairDataFile);

				var endTime = performance.now();
				console.info( sprintf( "%-20s Finished loading Mate Pair data file: %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.matepairDataFile, endTime, ( ( endTime - GenomePlot.matepairDataStartTime ) / 1000 ) ) );

				// initGUI should be initialized
				if( GenomePlot.matepairData === undefined || GenomePlot.matepairData === null
				||	GenomePlot.gui === undefined )
					return;

				// change the file paths to be relative to the directory the files were copied to
				for( var record in GenomePlot.matepairData ) {
					if( typeof GenomePlot.matepairData[record] !== "string" )
						continue;

					GenomePlot.matepairData[record] =
						GenomePlot.prefixFile + "/" + GenomePlot.matepairData[record].basename();
				}

				GenomePlot.copyNumber30000DataFile = GenomePlot.matepairData["cnvBinned30KJson"];
				GenomePlot.copyNumberStateDataFile = GenomePlot.matepairData["cnvIntervals"];

				GenomePlot.alterationsDataFile = GenomePlot.matepairData["altsComprehensive"];
			} )
			.fail (function () {
				console.error( sprintf( "%-18s Failed to find Mate Pair data file: %s", "initData():", GenomePlot.matepairDataFile ) );
			} );
	}

	// load new copy number data
	GenomePlot.copyNumberData = GenomePlot.copyNumber30000Data = undefined;
	if( GenomePlot.copyNumber30000DataFile === undefined ) {
		console.error( sprintf( "%-18s Undefined CNV file of window size 30000", "initData():" ) );
	}
	else {
		$.ajaxFileExists (GenomePlot.copyNumber30000DataFile)
			.done (function () {
				GenomePlot.copyNumber30000DataStartTime = performance.now();
				console.info( sprintf( "%-20s Started loading CNV file of window size 30000: %s at %.4fms", "initData():", GenomePlot.copyNumber30000DataFile, GenomePlot.copyNumber30000DataStartTime ) );
				GenomePlot.loadedResources++;

				$.getJSON (GenomePlot.copyNumber30000DataFile)
					.fail (function() {
						console.error( sprintf( "%-20s Failed to load CNV file of window size 30000: %s", "initData():", GenomePlot.copyNumber30000DataFile ) );
					})
					.done (function (data) {
						var endTime = performance.now();
						console.info( sprintf( "%-20s Finished loading CNV file of window size 30000: %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.copyNumber30000DataFile, endTime, ( ( endTime - GenomePlot.copyNumber30000DataStartTime ) / 1000 ) ) );
						GenomePlot.loadedResources--;

						GenomePlot.processCopyNumber30000Data(data);
					} );
			} )
			.fail (function () {
				GenomePlot.copyNumberData = GenomePlot.copyNumber30000Data = undefined;

				console.error( sprintf( "%-18s Failed to find CNV file of window size 30000: %s", "initData():", GenomePlot.copyNumber30000DataFile ) );
			} );
	}

	// load copy number state data
	GenomePlot.copyNumberStateData = undefined;
	if( GenomePlot.copyNumberStateDataFile === undefined ) {
		console.error( sprintf( "%-18s Undefined CNV Intervals file", "initData():" ) );
	}
	else {
		$.ajaxFileExists (GenomePlot.copyNumberStateDataFile)
			.done (function () {
				GenomePlot.copyNumberStateDataStartTime = performance.now();
				console.info( sprintf( "%-20s Started loading CNV Intervals file: %s at %.4fms", "initData():", GenomePlot.copyNumberStateDataFile, GenomePlot.copyNumberStateDataStartTime ) );
				GenomePlot.loadedResources++;

				d3.text( GenomePlot.copyNumberStateDataFile, "text/csv",
			//	fetchData( GenomePlot.copyNumberStateDataFile,
					function( data )
					{
						var endTime = performance.now();
						console.info( sprintf( "%-20s Finished loading CNV Intervals file: %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.copyNumberStateDataFile, endTime, ( ( endTime - GenomePlot.copyNumberStateDataStartTime ) / 1000 ) ) );
						GenomePlot.loadedResources--;

						GenomePlot.copyNumberStateData = GenomePlot.processCopyNumberStateData(data);

						console.info( sprintf( "%-20s     Total CNV Intervals to draw: %s", "initData():", GenomePlot.copyNumberStateData.length.toLocaleString() ) );
					},
					function( value ) {
						var endTime = performance.now();
						console.error( sprintf( "%-20s Rejected loading CNV Intervals file: %s with %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.copyNumberStateDataFile, value, endTime, ( ( endTime - GenomePlot.copyNumberStateDataStartTime ) / 1000 ) ) );
					},
					function( error ) {
						console.error( sprintf( "%-20s Failed to load CNV Intervals file: %s with %s", "initData():", GenomePlot.copyNumberStateDataFile, error ) );
					}
				);
			} )
			.fail (function () {
				console.error( sprintf( "%-18s Failed to find CNV Intervals file: %s", "initData():", GenomePlot.copyNumberStateDataFile ) );
			} );
	}

	// load cytoband data
	GenomePlot.cytoBandData = undefined;
	if( GenomePlot.cytoBandFile === undefined ) {
		console.error( sprintf( "%-18s Undefined Cytoband file", "initData():" ) );
	}
	else {
		$.ajaxFileExists (GenomePlot.cytoBandFile)
			.done (function () {
				GenomePlot.cytoBandDataStartTime = performance.now();
				console.info( sprintf( "%-20s Started loading Cytoband file: %s at %.4fms", "initData():", GenomePlot.cytoBandFile, GenomePlot.cytoBandDataStartTime ) );
				GenomePlot.loadedResources++;

				d3.json( GenomePlot.cytoBandFile,
					function( error, data ) {
			//	fetchData( GenomePlot.cytoBandFile,
			//		function( data ) {
						var endTime = performance.now();
						console.info( sprintf( "%-20s Finished loading Cytoband file: %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.cytoBandFile, endTime, ( ( endTime - GenomePlot.cytoBandDataStartTime ) / 1000 ) ) );
						GenomePlot.loadedResources--;

						GenomePlot.cytoBandData = data;

						console.info( sprintf( "%-20s     Total Cytoband elements to draw: %s", "initData():", GenomePlot.cytoBandData.length.toLocaleString() ) );
					},
					function( value ) {
						var endTime = performance.now();
						console.error( sprintf( "%-20s Rejected loading Cytoband file: %s with %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.cytoBandFile, value, endTime, ( ( endTime - GenomePlot.cytoBandDataStartTime ) / 1000 ) ) );
					},
					function( error ) {
						console.error( sprintf( "%-20s Failed to load Cytoband file: %s with %s", "initData():", GenomePlot.cytoBandFile, error ) );
					}
				);
			} )
			.fail (function () {
				console.error( sprintf( "%-18s Failed to find Cytoband file: %s", "initData():", GenomePlot.cytoBandFile ) );
			} );
	}

	// load alterations data
	GenomePlot.alterationsData = undefined;
	if( GenomePlot.alterationsDataFile === undefined ) {
		console.error( sprintf( "%-18s Undefined Alterations file", "initData():" ) );
	}
	else {
		$.ajaxFileExists (GenomePlot.alterationsDataFile)
			.done (function () {
				GenomePlot.alterationsDataStartTime = performance.now();
				console.info( sprintf( "%-20s Started loading Alterations file: %s at %.4fms", "initData():", GenomePlot.alterationsDataFile, GenomePlot.alterationsDataStartTime ) );
				GenomePlot.loadedResources++;

				d3.text( GenomePlot.alterationsDataFile, "text/csv", function( data )
				{
					var endTime = performance.now();
					console.info( sprintf( "%-20s Finished loading Alterations file: %s at %.4fms (duration: %.4f seconds)", "initData():", GenomePlot.alterationsDataFile, endTime, ( ( endTime - GenomePlot.alterationsDataStartTime ) / 1000 ) ) );
					GenomePlot.loadedResources--;

					GenomePlot.alterationsData = GenomePlot.processAlterationsData(data);

					console.info( sprintf( "%-20s     Total Alterations to draw: %s", "initData():", GenomePlot.alterationsData.length.toLocaleString() ) );
				} );
			} )
			.fail (function () {
				console.error( sprintf( "%-18s Failed to find Alterations file: %s", "initData():", GenomePlot.alterationsDataFile ) );
			} );
	}

}	// initData

// the scales translate data values to pixel values
GenomePlot.initTransforms = function ()
{
	if( GenomePlot.graphTypeParams.graphType === "Circos" ) return;

	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		GenomePlot.linearGenomicToPaddedPixelScaleX =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.MAX_CHROMOSOME_BASE ] )													// the range of the values to plot
				.range( [ GenomePlot.padding.left, GenomePlot.innerWidth - GenomePlot.padding.right ] );	// the pixel range of the x-axis

		GenomePlot.basesPerPixel = Math.ceil( GenomePlot.MAX_CHROMOSOME_BASE / ( GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.MAX_CHROMOSOME_BASE ) - GenomePlot.linearGenomicToPaddedPixelScaleX( 0 ) ) );
//		console.info( "GenomePlot.initTransforms(): bases/pixel =", GenomePlot.basesPerPixel.toLocaleString() );

		GenomePlot.linearGenomicToUnPaddedPixelScaleX =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.MAX_CHROMOSOME_BASE ] )													// the range of the values to plot
				.range( [ 0, GenomePlot.innerWidth ] );															// the pixel range of the x-axis
		GenomePlot.linearGenomicToPaddedPixelScaleX_13_14_15 =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.chromosomes["13"].genomicSize ] )											// the range of the values to plot
				.range( [ GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[(13-1)].x ), GenomePlot.innerWidth - GenomePlot.padding.right ] );		// the pixel range of the x-axis
		GenomePlot.linearGenomicToPaddedPixelScaleX_16_17_18 =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.chromosomes["16"].genomicSize ] )											// the range of the values to plot
				.range( [ GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[(16-1)].x ), GenomePlot.innerWidth - GenomePlot.padding.right ] );		// the pixel range of the x-axis
		GenomePlot.linearGenomicToPaddedPixelScaleX_19_20 =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.chromosomes["20"].genomicSize ] )											// the range of the values to plot
				.range( [ GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[(20-1)].x ), GenomePlot.innerWidth - GenomePlot.padding.right ] );		// the pixel range of the x-axis
		GenomePlot.linearGenomicToPaddedPixelScaleX_21_22 =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.chromosomes["22"].genomicSize ] )											// the range of the values to plot
				.range( [ GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[(22-1)].x ), GenomePlot.innerWidth - GenomePlot.padding.right ] );		// the pixel range of the x-axis
		GenomePlot.linearGenomicToPaddedPixelScaleX_24 =
			d3.scale.linear()
				.domain( [ 0, GenomePlot.chromosomes["24"].genomicSize ] )											// the range of the values to plot
				.range( [ GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[(24-1)].x ), GenomePlot.innerWidth - GenomePlot.padding.right ] );		// the pixel range of the x-axis

		if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
		{
			GenomePlot.linearChromosomeToPaddedPixelScaleY_L =
				d3.scale.linear()
					.domain( [ 1, 14 ] )
					.range( [ GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom ] );

			GenomePlot.linearChromosomeToPaddedPixelScaleY_R =
				d3.scale.linear()
					.domain( [ 24, 11 ] )
					.range( [ GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom ] );
		}

		if (GenomePlot.debug) console.log ("GenomePlot.initTransforms(): x: " + "domain(" + 0 + "," + GenomePlot.MAX_CHROMOSOME_BASE + ")" + " " +
								"range(" + GenomePlot.padding.left + "," + (GenomePlot.innerWidth - GenomePlot.padding.right) + ")");
	}

	GenomePlot.linearGenomicToPaddedPixelScaleY =
		d3.scale.linear()
			.domain( [ 0, GenomePlot.ymax ] )
			.range( [ GenomePlot.innerHeight - GenomePlot.padding.bottom, GenomePlot.padding.top ] );

	GenomePlot.linearWindowPixelToPaddedPixelScaleY =
		d3.scale.linear()
			.domain( [ 0, GenomePlot.innerHeight ] )
			.range( [ GenomePlot.padding.top, GenomePlot.innerHeight - GenomePlot.padding.bottom ] );

	if (GenomePlot.debug) console.log ("GenomePlot.initTransforms(): y: " + // "domain(" + d3.min(GenomePlot.frq) + "," + d3.max(GenomePlot.frq) + ")" + " " +
									"domain(" + 0 + "," + GenomePlot.ymax + ")" + " " +
							"range(" + (GenomePlot.innerHeight - GenomePlot.padding.bottom) + "," + GenomePlot.padding.top + ")");

	GenomePlot.scaledPixelsPerLine = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[1].y ) -
										  GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[0].y );

	GenomePlot.exponentMoveToMiddleOfChromScaleY = new Array(24);

	// by zoom factor 12 bring the elements' y-position to the middle of the chromosome height
	for( var chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id++ )
	{
		GenomePlot.exponentMoveToMiddleOfChromScaleY[ chrom_id ] =
			d3.scale.pow().exponent(0.05)
				.domain([ 1, 12 ])	// 12: arbitrary scale value by which we want the overlap of data to take effect
				.range([
					// GenomePlot.chromPixelStarts is 0 based
					GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[ chrom_id ].y + GenomePlot.pixelsPerLine / 3.5),
					GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[ chrom_id ].y) - 0.05 * GenomePlot.scaledPixelsPerLine
				])
				.clamp(true);	// dont want values above 12
	}

	GenomePlot.scaleMin = 1;		// limits the zoom, 1 means do not allow zoom-out
	GenomePlot.scaleMax = 200000;	// go up to one base per pixel

	GenomePlot.zoom = d3.behavior.zoom()
		.scaleExtent( [ GenomePlot.scaleMin, GenomePlot.scaleMax ] )
		.x( GenomePlot.linearGenomicToPaddedPixelScaleX )
		.y( GenomePlot.linearWindowPixelToPaddedPixelScaleY )
		.on( "zoom", GenomePlot.onZoom )
	;

	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		GenomePlot.zoomY_L = d3.behavior.zoom()
			.scaleExtent( [ GenomePlot.scaleMin, GenomePlot.scaleMax ] )
			.y( GenomePlot.linearChromosomeToPaddedPixelScaleY_L );

		if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
		{
			GenomePlot.zoomY_R = d3.behavior.zoom()
				.scaleExtent( [ GenomePlot.scaleMin, GenomePlot.scaleMax ] )
				.y( GenomePlot.linearChromosomeToPaddedPixelScaleY_R );
		}
	}

}	// initTransforms

GenomePlot.setupContainer = function ()
{
	// remove old svg if any
	d3.select("#svgContainer").selectAll("svg").remove();

	// if you ever set the visibility of the svg layer to false you will stop
	// receiving events as it is the svg layer that is responsible for them
	var svgMain = d3.select("#svgContainer")
		.append("svg:svg")
			.attr( "id", "svgMain" )
			.attr( "width", GenomePlot.outerWidth )
			.attr( "height", GenomePlot.outerHeight )
		//	.style( "background", "#v")
	;

	var defs = svgMain.append( "defs" );

	// hatch pattern for cytobands
	defs
		.append( "pattern" )
			.attr( "id", "diagonalHatch" )
			.attr( "patternUnits", "userSpaceOnUse" )
			.attr( "width", 4 )
			.attr( "height", 4 )
		.append( "path" )
			.attr( "d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" )
			.attr( "stroke", "#000000" )
			.attr( "stroke-width", 1 );

	defs
		.append( "clipPath" )
			.attr( "id", "container-main-clip-path" )
		.append( "rect")
			.attr( "width", GenomePlot.innerWidth )
			.attr( "height", GenomePlot.innerHeight );

	var groupMain = svgMain
		.append( "svg:g" )
			.attr( "id", "groupMain" )
			.attr( "transform", "translate(" + GenomePlot.margin.left + "," + GenomePlot.margin.top + ")");

	var groupMainContainer = groupMain
		.append("svg:g")
			.attr( "id", "groupMainContainer" )
			.style( "clip-path", "url(#container-main-clip-path)" );

	// white rect behind the graph
	groupMainContainer
		.append( "svg:rect" )
			.attr( "width", GenomePlot.innerWidth )
			.attr( "height", GenomePlot.innerHeight )
			.attr( "class", "rectTransp" )
			.style( {
				"fill": "transparent",
				"stroke": "orange",
				"stroke-width": 2,
			//	"pointer-events": "all",
				"cursor": "move",
			} )

		.on( "mouseout", function()
		{
			d3.selectAll( ".hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text, .hoverX_T-text" )
				.transition()
					.duration( 200 )
					.style( "opacity", 1e-6 );

			d3.select( ".hoverX-line" )
				.transition()
					.duration( 200 )
					.style( "opacity", 1e-6 );
		} )
		.on( "mouseover", function()
		{
			d3.selectAll( ".hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text, .hoverX_T-text" )
				.transition()
					.duration( 200 )
					.style( "opacity", 1 );

			d3.select( ".hoverX-line" )
				.transition()
					.duration( 0 )
					.style( "opacity", GenomePlot.miscParams.showHoverline ? 1 : 1e-6 );
		} )
		.on( "mousemove", function()
		{
			if (GenomePlot.miscParams.showHoverline) {
				var mouseX = d3.mouse(this)[0];

				d3.select( ".hoverX-line" )
					.attr( "x1", mouseX )
					.attr( "x2", mouseX )
				;
			}
		} )
	;

	groupMainContainer
		.call( GenomePlot.zoom )
		.on( "dblclick.zoom", null );	// disable double click zoom for d3.behavior.zoom
}	// setupContainer

GenomePlot.drawBackground = function ()
{
	var startTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s %.4fms", "drawBackground():", startTime ) );

	// remove and recreate the main frame
	d3.select( "#groupMainFrame" ).remove();
	GenomePlot.svg = d3.select( "#groupMain" )
		.append( "svg:g" )
			.attr( "id", "groupMainFrame" );

	// remove and recreate the contents
	d3.select( "#groupMainContainerContents" ).remove();
	GenomePlot.container = d3.select( "#groupMainContainer" )
		.append( "svg:g" )
			.attr( "id", "groupMainContainerContents" );

	// remove old tooltip
	$(".tooltip").remove();

	// tooltip div
	GenomePlot.tooltip = d3.select("#svgContainer")
		.append("div")
			.attr( "class", "tooltip")
			.style( {
				"opacity": 1e-6,
				"font-size": "12px",
			} );

	if( GenomePlot.graphTypeParams.graphType !== "Circos" ) {
		GenomePlot.drawAxis();

		// hover line
		// from: http://stackoverflow.com/questions/29440455/how-to-as-mouseover-to-line-graph-interactive-in-d3
		// from: http://bl.ocks.org/gniemetz/4618602
		GenomePlot.container
			.append("svg:line")
				.attr( "class", "hoverX-line" )
				.style( {
				//	"stroke": "#6E7B8B",		// moved style to css so I can manipulate it based on media
					"stroke-dasharray": "3 3",
				//	"stroke-opacity": 1e-6,
					"fill": "none",
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
					"opacity": GenomePlot.miscParams.showHoverline ? 1 : 1e-6,
				} )
				.attr( "x1", 0 ).attr( "x2", 0 )
				.attr( "y1", 0 )
				.attr( "y2", GenomePlot.innerHeight ) // top to bottom
		;
	}

	///////////////////////////////////////////////////////////////////////////////

	// Create plot title label
	var fontHeight = 2.0 * GenomePlot.viewportUnitHeight;
	var letterSpacing = 0.25 * GenomePlot.viewportUnitWidth;

	GenomePlot.svg
		.append( "svg:text" )
			.attr( "text-anchor", "end")
			.attr( "x", GenomePlot.innerWidth - 10 )
			.attr( "class", "sample-text" )
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontHeight,
				"font-weight": "bold",
				"letter-spacing": letterSpacing,
				"shape-rendering": "auto",

				"-webkit-user-select": "text",
				   "-moz-user-select": "text",
						"user-select": "text",
			} )
		.text( ( GenomePlot.graphTypeParams.graphType === "Circos" ? "Circos" : "Genome" ) + " plot of " + GenomePlot.sampleId )
		.each( vCenter( GenomePlot.margin.top, -1, - fontHeight / 3 ) )
	;

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawBackground():", ((endTime-startTime)/1000) ) );
}	// drawBackground

// also computes linesPerGraph and pixelsPerLine
GenomePlot.computeChromosomeStartPositions = function ()
{
	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		// initialize it every time the function runs; garbage collection will take care of the memory
		GenomePlot.chromPixelStarts = new Array( GenomePlot.NUM_CHROMS );

		GenomePlot.linesPerGraph = 13;

		// height in pixels of one line holding one chromosome (or two)
		GenomePlot.pixelsPerLine = GenomePlot.innerHeight / GenomePlot.linesPerGraph;
		if (GenomePlot.debug) console.log (sprintf ("%-20s pixels/line: %f", "computeChromosomeStartPositions():", GenomePlot.pixelsPerLine));

		// create the start pixels positions of the left chromosomes
		for (var i = 0; i < 13; i++)
		{
			var chrom_id = i+1;

			var cx = 0;
			var cy = (i + 0.5) * GenomePlot.pixelsPerLine;		// computed in the un-padded space

			// x: genomic value; y: pixel value
			if (chrom_id === 13)
				GenomePlot.chromPixelStarts[24-2] = { x: cx, y: cy, adjust: 0 };
			else
				GenomePlot.chromPixelStarts[chrom_id-1] = { x: cx, y: cy, adjust: 0 };
		}

		// create the start pixels positions of the right chromosomes
		for (var i = 2; i < 13; i++)
		{
			var chromSizeRight;
			var chrom_id = i+1;

			// if the left chrom_id is 13 then we are at the XY line
			if (chrom_id === 13)
			{
				chrom_id = 25-1;
				chromSizeRight = GenomePlot.chromosomes["24"].genomicSize;
			}
			else
			{
				chrom_id = 25-chrom_id;
				chromSizeRight = GenomePlot.chromosomes[ chrom_id.toString() ].genomicSize;
			}

			var cx = GenomePlot.MAX_CHROMOSOME_BASE - chromSizeRight;
			var cy = (i + 0.5) * GenomePlot.pixelsPerLine;		// computed in the un-padded space

			// x: genomic value; y: pixel value
			GenomePlot.chromPixelStarts[chrom_id-1] = { x: cx, y: cy, adjust: 0 };
		}

		// adjust chromosome positions on the graph
		GenomePlot.chromPixelStarts[(14-1)].adjust = GenomePlot.chromPixelStarts[(14-1)].x - GenomePlot.chromPixelStarts[(13-1)].x;
		GenomePlot.chromPixelStarts[(14-1)].x = GenomePlot.chromPixelStarts[(13-1)].x;

		GenomePlot.chromPixelStarts[(15-1)].adjust = GenomePlot.chromPixelStarts[(15-1)].x - GenomePlot.chromPixelStarts[(13-1)].x;
		GenomePlot.chromPixelStarts[(15-1)].x = GenomePlot.chromPixelStarts[(13-1)].x;

		GenomePlot.chromPixelStarts[(17-1)].adjust = GenomePlot.chromPixelStarts[(17-1)].x - GenomePlot.chromPixelStarts[(16-1)].x;
		GenomePlot.chromPixelStarts[(17-1)].x = GenomePlot.chromPixelStarts[(16-1)].x;

		GenomePlot.chromPixelStarts[(18-1)].adjust = GenomePlot.chromPixelStarts[(18-1)].x - GenomePlot.chromPixelStarts[(16-1)].x;
		GenomePlot.chromPixelStarts[(18-1)].x = GenomePlot.chromPixelStarts[(16-1)].x;

		GenomePlot.chromPixelStarts[(19-1)].adjust = GenomePlot.chromPixelStarts[(19-1)].x - GenomePlot.chromPixelStarts[(20-1)].x;
		GenomePlot.chromPixelStarts[(19-1)].x = GenomePlot.chromPixelStarts[(20-1)].x;

		GenomePlot.chromPixelStarts[(21-1)].adjust = GenomePlot.chromPixelStarts[(21-1)].x - GenomePlot.chromPixelStarts[(22-1)].x;
		GenomePlot.chromPixelStarts[(21-1)].x = GenomePlot.chromPixelStarts[(22-1)].x;
	}
	
}	// computeChromosomeStartPositions

// for the chromosomes in the left side of the graph (i.e chroms 1-12 & 23)
// compute the size of the left and right chromosomes
GenomePlot.computeChromosomeSizes = function ()
{
	if( GenomePlot.graphTypeParams.graphType !== "U-Shape" ) return;

	for( var chrom_id = 1; chrom_id <= 13; chrom_id++ )
	{
		var chromSizeLeft, chromSizeRight;

		if( chrom_id === 1
		||	chrom_id === 2 )
		{
			chromSizeLeft = GenomePlot.chromosomes[ chrom_id.toString() ].genomicSize;
			chromSizeRight = 0;

			GenomePlot.chromosomes[ chrom_id.toString() ].chromSizeLeft = chromSizeLeft;
			GenomePlot.chromosomes[ chrom_id.toString() ].chromSizeRight = chromSizeRight;
		}
		else if (chrom_id === 13)	// if the left chrom_id is 13 then we are at the XY line
		{
			chromSizeLeft = GenomePlot.chromosomes["23"].genomicSize;
			chromSizeRight = GenomePlot.chromosomes["24"].genomicSize;

			GenomePlot.chromosomes[ "23" ].chromSizeLeft = chromSizeLeft;
			GenomePlot.chromosomes[ "23" ].chromSizeRight = chromSizeRight;
		}
		else
		{
			chromSizeLeft = GenomePlot.chromosomes[ chrom_id.toString() ].genomicSize;
			chromSizeRight = GenomePlot.chromosomes[(25-chrom_id).toString()].genomicSize +
						GenomePlot.chromPixelStarts[(25-chrom_id-1)].adjust;

			GenomePlot.chromosomes[ chrom_id.toString() ].chromSizeLeft = chromSizeLeft;
			GenomePlot.chromosomes[ chrom_id.toString() ].chromSizeRight = chromSizeRight;
		}
	}
}	// computeChromosomeSizes

// double return so I can pass in arguments (don't understand this)
function vCenter( heightAvailable, sign, offsetY )
{
	return function()
	{
		var self = d3.select(this);
		var bbox = self.node().getBBox();

		var vheight = (heightAvailable === undefined) ? 0 : heightAvailable;
		var voffset = (offsetY === undefined) ? bbox.y : offsetY;

		self.attr( "y", ((sign === undefined) ? 1 : sign ) * ( Math.abs( vheight - bbox.height ) / 2 - voffset ) );
	}
}

// double return so I can pass in arguments (don't understand this)
function hCenter( widthAvailable, sign )
{
	return function()
	{
		var self = d3.select(this);
		var bbox = self.node().getBBox();

		self.attr( "x", ((sign === undefined) ? 1 : sign ) * ( Math.abs( widthAvailable - bbox.width ) / 2 ) );
	}
}

GenomePlot.drawHorizontalDividers = function ()
{
	if( ! ( GenomePlot.graphTypeParams.graphType === "U-Shape" ) )
		return;

	// remove the old cytobands
	d3.selectAll(".horizontaldividers").remove();

	var startTime = performance.now();

	var divs = GenomePlot.container
		.append("svg:g")
			.style( {
				"stroke": "black",
				"fill": "none",
				"shape-rendering": "crispEdges",
				"vector-effect": "non-scaling-stroke",
				"stroke-opacity": 0.25, // 1e-6,
				"pointer-events": "none",
			} )
			.attr( "class", "horizontaldividers")
		.selectAll("line")
			.data( d3.range( 0, GenomePlot.innerHeight + GenomePlot.pixelsPerLine, GenomePlot.pixelsPerLine ) );

	divs
		.enter().append("svg:line")
			.attr( "x1", 0)
			.attr( "y1", function( d ) { return GenomePlot.linearWindowPixelToPaddedPixelScaleY( d ).toFixed(GenomePlot.FLOAT_PRECISION); } )
			.attr( "x2", GenomePlot.innerWidth)
			.attr( "y2", function( d ) { return GenomePlot.linearWindowPixelToPaddedPixelScaleY( d ).toFixed(GenomePlot.FLOAT_PRECISION); } )
		//	.style( "stroke", function( d ) { return ( d % GenomePlot.pixelsPerLine === 0 ) ? "red" : "black"; } )
	;

	divs.exit().remove();

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawHorizontalDividers():", ((endTime-startTime)/1000) ) );
}	// drawHorizontalDividers

// draw the vertical lines between adjacent chromosomes
GenomePlot.drawVerticalDividers = function ()
{
	// remove the old dividers
	d3.selectAll(".verticaldividers, .verticalpanels").remove();

	var startTime = performance.now();

	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		var divs = GenomePlot.container
			.append("svg:g")
				.attr( "class", "verticaldividers" )
				.style( {
					"stroke": "black",
					"stroke-opacity": 0.25, // 1e-6,
					"fill": "none",
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
				} )
			.selectAll("scatter_line")
				.data( d3.range( 1, 13 ).concat( 23 ) );	// the 13 left chromosomes

		divs
			.enter().append("svg:line")
				.attr( "x1", function( d )
				{
					var sizes = GenomePlot.chromosomes[ d.toString() ];

					// the space between adjacent chroms
					var space = GenomePlot.MAX_CHROMOSOME_BASE - sizes.chromSizeLeft - sizes.chromSizeRight;

					return GenomePlot.linearGenomicToPaddedPixelScaleX( sizes.chromSizeLeft + space/2 ).toFixed(GenomePlot.FLOAT_PRECISION);
				} )
				.attr( "x2", function( d )
				{
					var sizes = GenomePlot.chromosomes[ d.toString() ];

					// the space between adjacent chroms
					var space = GenomePlot.MAX_CHROMOSOME_BASE - sizes.chromSizeLeft - sizes.chromSizeRight;

					return GenomePlot.linearGenomicToPaddedPixelScaleX( sizes.chromSizeLeft + space/2 ).toFixed(GenomePlot.FLOAT_PRECISION);
				} )
				.attr( "y1", function( d ) { return GenomePlot.linearWindowPixelToPaddedPixelScaleY( (d === 23 ? 12 : (d-1)) * GenomePlot.pixelsPerLine ).toFixed(GenomePlot.FLOAT_PRECISION); } )
				.attr( "y2", function( d ) { return GenomePlot.linearWindowPixelToPaddedPixelScaleY( (d === 23 ? 13 : (d)) * GenomePlot.pixelsPerLine ).toFixed(GenomePlot.FLOAT_PRECISION); } )
		;

		divs.exit().remove();
	}

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawVerticalDividers():", ((endTime-startTime)/1000) ) );
}	// drawVerticalDividers

GenomePlot.getChromIdFromString = function( chrom_str )
{
	var chrom_id;

	var chrom = chrom_str.substring (3, chrom_str.length);
		 if (chrom === "X") chrom_id = 23;
	else if (chrom === "Y") chrom_id = 24;
	else					chrom_id = parseInt (chrom, 10);

	return chrom_id;	// 1 based
}

GenomePlot.drawCytobands = function ()
{
	// remove the old cytobands
	d3.selectAll(".cytobands").remove();

//	if( GenomePlot.cytoBandsParams.visibility < 1 ) return;

	var startTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s %.4fms", "drawCytobands():", startTime ) );

	// the json file has been cleaned of extraneous chromosomes
	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		GenomePlot.cytobandsHeight = 0.10 * GenomePlot.scaledPixelsPerLine;

		// filter the data appropriately and at the same time group by same color for optimized rendering
		var cytoBandDataGroupedByColor = {};
		GenomePlot.cytoBandData.forEach(function(d) {
			var chrom_id = GenomePlot.getChromIdFromString( d.chrom );		// 1 based;

			// filter out invalid chromosomes and the centromere
			if (chrom_id < 1 || chrom_id > GenomePlot.NUM_CHROMS || d.gieStain === "acen")
				return;

			d.x = GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[chrom_id-1].x + +d.chromStart );
			d.y = GenomePlot.exponentMoveToMiddleOfChromScaleY[ chrom_id - 1 ]( 1 );
			d.width = GenomePlot.linearGenomicToPaddedPixelScaleX( +d.chromEnd ) - GenomePlot.linearGenomicToPaddedPixelScaleX( +d.chromStart );
			d.height = GenomePlot.cytobandsHeight;

			// filter out bands outside the viewport
			if( d.x + d.width < 0 || d.x > GenomePlot.innerWidth || d.y + d.height < 0 || d.y > GenomePlot.innerHeight )
				return;

			if (! cytoBandDataGroupedByColor.hasOwnProperty(GenomePlot.cytoBandColors[d.gieStain])) {
				cytoBandDataGroupedByColor[GenomePlot.cytoBandColors[d.gieStain]] = [];
			}
			cytoBandDataGroupedByColor[GenomePlot.cytoBandColors[d.gieStain]].push(d);
		});

		var cytos =
			GenomePlot.container
				.append("svg:g")
					.style( {
						"stroke": "black",
						"shape-rendering": "auto",
						"vector-effect": "non-scaling-stroke",
						"stroke-opacity": GenomePlot.cytoBandsParams.visibility / 100,
						"fill-opacity": GenomePlot.cytoBandsParams.visibility / 100,
					} )
					.style( "pointer-events", function() { return GenomePlot.miscParams.showTooltips ? "all" : "none"; } )
					.attr( "class", "cytobands" )
				.selectAll("chrom-rect")
					.data( Object.keys(cytoBandDataGroupedByColor) )
					.enter()
					.append("svg:g")
					.style( "fill", function(d) { return d; } )
					.selectAll("chrom-rect-color")
						.data( function(d) { return cytoBandDataGroupedByColor[d]; } )
		;

		cytos
			.enter().append("svg:rect")
			.attr( "class", "cytorects" )
			.attr( "x", function( d ) { return d.x.toFixed(GenomePlot.FLOAT_PRECISION); } )
			.attr( "y", function( d ) { return d.y.toFixed(GenomePlot.FLOAT_PRECISION); } )
			.attr( "width", function( d ) { return d.width.toFixed(GenomePlot.FLOAT_PRECISION); } )
			.attr( "height", function( d ) { return d.height.toFixed(GenomePlot.FLOAT_PRECISION); } )
		;

		cytos.exit().remove();

		var centromere =
			GenomePlot.container
				.append("svg:g")
					.style( {
						"stroke": "black",
						"fill": "none",
						"shape-rendering": "auto",
						"vector-effect": "non-scaling-stroke",
						"stroke-opacity": GenomePlot.cytoBandsParams.visibility / 100,
						"fill-opacity": GenomePlot.cytoBandsParams.visibility / 100,
					} )
					.style( "pointer-events", function() { return GenomePlot.miscParams.showTooltips ? "all" : "none"; } )
					.attr( "class", "cytobands" )
			;

		var centomereData = GenomePlot.cytoBandData.filter(function(d) {
			if (d.gieStain !== "acen") return false;

			var chrom_id = GenomePlot.getChromIdFromString( d.chrom );		// 1 based

			var x = GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.chromPixelStarts[chrom_id-1].x + +d.chromStart );
			var y = GenomePlot.exponentMoveToMiddleOfChromScaleY[ chrom_id - 1 ]( 1 );
			var w = GenomePlot.linearGenomicToPaddedPixelScaleX( +d.chromEnd ) - GenomePlot.linearGenomicToPaddedPixelScaleX( +d.chromStart );
			var h = GenomePlot.cytobandsHeight;

			// filter out centromeres outside the viewport
			if( x + w < 0 || x > GenomePlot.innerWidth || y + h < 0 || y > GenomePlot.innerHeight )
				return false;

			d.points = ( d.name[0] === 'p' )	?
				"" + x.toFixed(GenomePlot.FLOAT_PRECISION) + "," + y.toFixed(GenomePlot.FLOAT_PRECISION) + " "
				   + x.toFixed(GenomePlot.FLOAT_PRECISION) + "," + (y + h).toFixed(GenomePlot.FLOAT_PRECISION) + " "
				   + (x + w).toFixed(GenomePlot.FLOAT_PRECISION) + "," + (y + h/2).toFixed(GenomePlot.FLOAT_PRECISION) : 		// p-arm
				"" + x.toFixed(GenomePlot.FLOAT_PRECISION) + "," + (y + h/2).toFixed(GenomePlot.FLOAT_PRECISION) + " "
				   + (x + w).toFixed(GenomePlot.FLOAT_PRECISION) + "," + (y + h).toFixed(GenomePlot.FLOAT_PRECISION) + " "
				   + (x + w).toFixed(GenomePlot.FLOAT_PRECISION) + "," + y.toFixed(GenomePlot.FLOAT_PRECISION);	// q-arm

			return true;
		});

		// draw the red centromere as a polygon
		//
		//(x,y)								(x+width,y+height)
		//	*-----	width				-----*
		//	|\   |						|   /|
		//	| \  |						|  / |
		//	|  \ |						| /  |
		//	|   \|	height/2	or		|/   |
		//	|   /|						|\   |
		//	|  / |						| \  |
		//	| /  |						|  \ |
		//	|/   |						|   \|
		//	------						-----* (x+width,y)

		// we will be adding 2 same polygons one with fill style cytoBandColors["acen"] (the centomereData can only
		// be of gieStain "acen") and one with fill "url(#diagonalHatch)"
		[ GenomePlot.cytoBandColors["acen"], "url(#diagonalHatch)" ].forEach( function (fillStyle) {
			var cm = centromere
				.append("svg:g")
					.style( "fill", fillStyle )
				.selectAll("chrome-rect")
					.data( centomereData );

			cm.enter()
				.append("svg:polygon")
					.attr( "class", "cytotris" )
					.attr( "points", function( d ) { return d.points } );

			cm.exit().remove();
		} );
	}

	d3.selectAll(".cytobands .cytorects, .cytobands .cytotris")

		// tooltips
		.on ("mouseover", function( d )
		{
			if( GenomePlot.miscParams.showTooltips )
			{
				GenomePlot.tooltip
					.transition()
					.duration( 200 )
					.style( "opacity", .9 );
				GenomePlot.tooltip.html( d.chrom + " Band " + d.name + " (" + (+d.chromStart/1000).toLocaleString() + "KB - " + (+d.chromEnd/1000).toLocaleString() + "KB)" )
					.style( "left", (event.pageX + 10) + "px" )
					.style( "top", (event.pageY - 100) + "px" )
				;
			}
		} )
		.on ("mouseout", function ()
		{
			if( GenomePlot.miscParams.showTooltips )
			{
				GenomePlot.tooltip
					.transition()
					.duration( 500 )
					.style( "opacity", 1e-6 );
			}
		} )
	;

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawCytobands():", ((endTime-startTime)/1000) ) );
}	// drawCytobands

GenomePlot.drawSVGAlterationsPaths = function( alterationsData )
{
	// first draw the indicator of a junction plot using GenomePlot.junctionIndicatorColor color
	var alterIndicator = GenomePlot.container
		.append("svg:g")
			.style( {
				"stroke-linecap": "round",
				"stroke-opacity": 0.50,
			} )
		.selectAll("scatter_line")
			.data( alterationsData )
	;

	alterIndicator
		.enter()
			.append("svg:g");

	if( GenomePlot.junctionsParams.drawType === "Arcs" )
	{
		alterIndicator
			.style( {
				"fill": "none",
				"pointer-events": "stroke",
			} )
			.append( "svg:path" )
				.attr( "d", function( d ) { return d.pathArc; } )
		;
	}

	alterIndicator
		.attr( "class", function( d ) { return "alterationsIndicator" + " s" + (d.Nassoc === "" ? 0 : d.Nassoc) + d.chrA + d.chrB + d.posA + d.posB; } )
		.style( GenomePlot.junctionIndicatorStyle.normal )
		.on ("mouseover", function( d )
		{
			if( GenomePlot.miscParams.showTooltips )
			{
				GenomePlot.tooltip
					.transition()
					.duration( 200 )
					.style( "opacity", .9 );
				GenomePlot.tooltip.html("Chr" + d.chrA + " - Chr" + d.chrB + ", Associates: " + (d.Nassoc === "" ? 0 : d.Nassoc))
					.style( "left", (d3.event.pageX + 10) + "px")
					.style( "top", (d3.event.pageY - 30) + "px");
			}

			// remove all previous highlights
			d3.selectAll( ".alterationsIndicator" )
				.transition()
				.duration( 500 )
				.style( GenomePlot.junctionIndicatorStyle.normal );
			d3.timer.flush();

			// highlight selected variant
			var selection = d3.select(this);
			selection.moveToFront();

			// from: http://bl.ocks.org/aharris88/bd59ffb45f0635667749
			var strokeWidth = parseFloat( selection.style( "stroke-width" ).replace( "px", "" ) );

			selection.transition()
				.duration( 500 )
				.style( GenomePlot.junctionIndicatorStyle.highlight )
				.style( "stroke-width", 1.55 * strokeWidth )
				.transition()
				.ease('elastic')
				.style( "stroke-width", strokeWidth )
			;
		} )
		.on ("mouseout", function( d )
		{
			if( GenomePlot.miscParams.showTooltips )
			{
				GenomePlot.tooltip
					.transition()
					.duration( 500 )
					.style( "opacity", 1e-6 );
			}

			d3.select(this)
				.transition()
				.duration( 500 )
				.style( GenomePlot.junctionIndicatorStyle.normal );
		} )
		.on ("mousedown", function( d ) {
			// prevent the start of panning since we will use the mouse up event
			d3.event.preventDefault();
			d3.event.stopImmediatePropagation();
		} )
		.on ("mouseup", function( d )
		{
			d3.event.preventDefault();
			d3.event.stopImmediatePropagation();
		} )
	;

	alterIndicator.exit().remove();

	// draw the alterations
	var alter = GenomePlot.container
		.append("svg:g")
			.style( {
				"stroke-linecap": "round",
				"stroke-opacity": 0.75,
			} )
		.selectAll("scatter_line")
			.data( alterationsData )
	;

	alter
		.enter()
			.append("svg:g");

	if( GenomePlot.junctionsParams.drawType === "Arcs" )
	{
		alter
			.style( {
				"fill": "none",
				"pointer-events": "none",
			} )
			.append( "svg:path" )
				.attr( "d", function( d ) { return d.pathArc; } )
		;
	}

	alter
		.attr( "class", "alterations" )
		.style( "stroke-width", GenomePlot.junctionThickness )
		.style( "stroke", GenomePlot.junctionTypeColor )
	;

	alter.exit().remove();

}	// drawSVGAlterationsPaths

GenomePlot.drawAlterations = function ()
{
	// remove the old alterations
	d3.selectAll(".alterationsIndicator").remove();
	d3.selectAll(".alterations").remove();

	if( GenomePlot.alterationsData === undefined ) return;

	if( GenomePlot.junctionsParams.drawType === "None" ) return;

	if( GenomePlot.graphTypeParams.graphType === "Circos" ) return;

	var startTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s %.4fms", "drawAlterations():", startTime ) );

	// first filter the data for the correct chromosome numbers and
	// then take the max(Nassoc) of the remaining GenomePlot.alterationsData
	GenomePlot.junctionsParams.maxAssoc =
		d3.max (GenomePlot.alterationsData
					.filter( function( d ) { return d.chrA <= GenomePlot.NUM_CHROMS && d.chrB <= GenomePlot.NUM_CHROMS; } ),
				function( d ) { return d.Nassoc; } );

	var offsetHigher = 0.40 * GenomePlot.pixelsPerLine;

	var alterationsData = GenomePlot.alterationsData
		.filter( function( d ) { return d.chrA <= GenomePlot.NUM_CHROMS && d.chrB <= GenomePlot.NUM_CHROMS; } )
		.filter( function( d ) {
			return d.Nassoc >= GenomePlot.junctionsParams.associates;// filter on the current numOfAssoc value
		} );

	// create the alter* paths
	alterationsData.forEach( function( d ) {
		var x1 = GenomePlot.linearGenomicToPaddedPixelScaleX (GenomePlot.chromPixelStarts[d.chrA-1].x + d.posA - 0.5),
			x2 = GenomePlot.linearGenomicToPaddedPixelScaleX (GenomePlot.chromPixelStarts[d.chrB-1].x + d.posB - 0.5),
			y1, y2;
		var curvature = GenomePlot.junctionsParams.arcFactor;

		if( d.chrA !== d.chrB ) {
			y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrA-1].y );
			y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrB-1].y );
			curvature *= 3.0;
		}
		else {
			var adjust_y;

			if( Math.abs( d.posB - d.posA ) > 5 * GenomePlot.MEGA_BASE &&
				( GenomePlot.graphTypeParams.graphType === "U-Shape" ) ) {
				adjust_y = GenomePlot.pixelsPerLine / 10;

				y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrA-1].y ) - adjust_y;
				y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrB-1].y ) - adjust_y;
			}
			else {
				adjust_y = offsetHigher - Math.sqrt (d.Nassoc) - 2;

				// place it higher in the line
				y1 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrA-1].y ) - adjust_y;
				y2 = GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[d.chrB-1].y ) - adjust_y;
			}
		}

		var dx = x2 - x1,
			dy = y2 - y1,
			dr = curvature * Math.sqrt(dx * dx + dy * dy);

		d.pathArc = "M" + x1.toFixed(GenomePlot.FLOAT_PRECISION) + "," + y1.toFixed(GenomePlot.FLOAT_PRECISION)
			+ "A" + dr + "," + dr + " 0 0,1 " + x2.toFixed(GenomePlot.FLOAT_PRECISION) + "," + y2.toFixed(GenomePlot.FLOAT_PRECISION);
	} );

	///////////////////////////////////////////////////////////////////////////////

	GenomePlot.drawSVGAlterationsPaths( alterationsData );

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawAlterations():", ((endTime-startTime)/1000) ) );
}	// drawAlterations

/**
 * handle masked data in copy number data
 * @param {array} dataInMasked - pairwise sequences to be masked
 * @returns {array[][]} - the information required to draw the lines
 */
function splitLinesToSegmentsPerCopyNumberState( dataIn, dataInMasked, dataY, dataC )
{
	// break the dataIn array into multiple line segments
	// depending on the masked ranges
	// and the copy number state
	var dataCNVLines = new Array( GenomePlot.copyNumberStateColor.length );

	for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
		dataCNVLines[sc] = [];

	var s = 0;		// count of number of segments
	var m = 0;		// count of masking pairs
	var prev_state = dataC[0];

	// for each one of the cnv states
	for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
		dataCNVLines[sc][s] = [];	// allocate a new segment

	for( var i = 0; i < dataIn.length; i++ )
	{
		if( dataIn[i] <= dataInMasked[m]
		||	dataInMasked.length === 0
		) {
			if( dataC[i] !== prev_state ) {
				s++;

				for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
					dataCNVLines[sc][s] = [];	// allocate a new segment
			}

			for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ ) {
				if( dataC[i] === GenomePlot.copyNumberStateColor[sc] ) {
					dataCNVLines[sc][s].push( { x: dataIn[i], y: dataY[i], c: dataC[i] } );
					prev_state = dataC[i];
				}
			}
		}
		else if( dataIn[i] > dataInMasked[m] && dataIn[i] < dataInMasked[m+1] ) {
			prev_state = dataC[i];
			continue;
		}
		else if( dataIn[i] >= dataInMasked[m+1] ) {
			if( dataIn[i] === dataInMasked[m+1] ) {
				s++;

				for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
					dataCNVLines[sc][s] = [];	// allocate a new segment

				if( m < dataInMasked.length - 2 )
					m += 2;
			}

			if( dataC[i] !== prev_state ) {
				s++;

				for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
					dataCNVLines[sc][s] = [];	// allocate a new segment
			}

			for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ ) {
				if( dataC[i] === GenomePlot.copyNumberStateColor[sc] ) {
					dataCNVLines[sc][s].push( { x: dataIn[i], y: dataY[i], c: dataC[i] } );
					prev_state = dataC[i];
				}
			}
		}
	}

	// clean up; order is important!
	for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ ) {
		for( var ss = s; ss >= 0; ss-- ) {
			if( dataCNVLines[sc][ss].length === 0 || dataCNVLines[sc][ss].length === 1 ) {
				dataCNVLines[sc].splice( ss, 1 );
			}
		}
	}

	return dataCNVLines;
}	// splitLinesToSegmentsPerCopyNumberState

GenomePlot.drawSVGCopyNumber = function()
{
	// remove the old copy number
	d3.selectAll(".copycircles").remove();
	d3.selectAll(".copylines").remove();

	if( GenomePlot.copyNumberParams.drawType === "None"
	||	GenomePlot.copyNumberParams.drawType !== "Lines" )
		return;

	var startTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s %.4fms", "drawSVGCopyNumber():", startTime ) );

	for( var chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id++ )
	{
		var dataX = GenomePlot.copyNumberData.toLegacy.wdnsPerChrom[ chrom_id ];
		var dataY = GenomePlot.copyNumberData.toLegacy.frqPerChrom[ chrom_id ];

		var line = d3.svg.line()
			.x( function( d, i ) { return GenomePlot.linearGenomicToPaddedPixelScaleX( d.x + GenomePlot.chromPixelStarts[ chrom_id ].x ); } )
			.y( function( d, i ) { return ( 1 - d.y ) * 0.5 * GenomePlot.scale * GenomePlot.pixelsPerLine + GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[ chrom_id ].y ); } )											// translate y value to a pixel
		;

		// get the intervals corresponding to chrom_id
		var dataCNVState = GenomePlot.copyNumberStateData
			// if we are using the tableDataSelected make sure we use only the rows with NRD values defined
			.filter( function( d ) { return d.NRD !== "" && (d.chrA-1) === chrom_id; } );

		var dataC = new Array( dataX.length );

		var i = 0, j = 0;
		while( j < dataCNVState.length ) {
			while( dataX[i] < dataCNVState[j].posA ) i++;
			while( dataX[i] <= dataCNVState[j].posB )
			{
				dataC[i] = GenomePlot.copyNumberStateColor[ dataCNVState[j].state - 1 ];

				i++;
			}

			j++;
		}

		var dataXMasked = GenomePlot.copyNumberData.toLegacy.wdnsMaskedPerChrom[ chrom_id ];

		var data = splitLinesToSegmentsPerCopyNumberState( dataX, dataXMasked, dataY, dataC );

		for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
		{
			var lines =
				GenomePlot.container
					.append("g")
						.attr( "class", "copylines" )
						.style( {
						//	"stroke": "gray",
							"stroke": function() { return GenomePlot.copyNumberStateColor[sc]; },
							"stroke-opacity": 0.75,
							"stroke-width": 1,
							"fill": "none",
							"shape-rendering": "crispEdges",
							"pointer-events": "none",
						} )
						.selectAll("path")
							.data( data[sc] )
			;

			lines
				.enter().append( "svg:path" )
					.attr( "d", line )
			;

			lines.exit().remove();
		}

		// for the garbage collector
		data = null;

		// for the garbage collector
		dataC = null;
		dataCNVState = null;
	}

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawSVGCopyNumber():", ((endTime-startTime)/1000) ) );
}	// drawSVGCopyNumber

GenomePlot.drawAxis = function ()
{
	// remove the old axis
	d3.selectAll(".x.axis, .x.axis_13_14_15, .x.axis_16_17_18, .x.axis_19_20, .x.axis_21_22, .x.axis_T").remove();
	d3.selectAll(".y.axis_L, .y.axis_R").remove();

	d3.selectAll(".hoverX-text, .hoverX_13_14_15-text, .hoverX_16_17_18-text, .hoverX_19_20-text, .hoverX_21_22-text").remove();

	var startTime = performance.now();

	var formatValue = d3.format("s");

	var fontHeight = 1.1 * GenomePlot.viewportUnitHeight;

	///////////////////////////////////////////////////////////////////////////////

	// draw the x axis
	GenomePlot.axisX = d3.svg.axis()
		.scale( GenomePlot.linearGenomicToPaddedPixelScaleX )
		.orient("bottom")
		.ticks( Math.round( GenomePlot.innerWidth / 100 ) )
		.tickFormat (function( d ) { return formatValue(d); } )
	;

	var xAxisNode = GenomePlot.svg
		.append("svg:g")
		.style( {
			"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
			"font-size": fontHeight,
			"fill": "none",
			"stroke": "black",
			"stroke-width": 1,
			"shape-rendering": "auto"
		} )
		.attr( "class", "x axis" )
		.attr( "transform", "translate(0," + (GenomePlot.innerHeight + 5) + ")")
		.call( GenomePlot.axisX );

	// fix the resulting text
	xAxisNode.selectAll("text")
		.style( "stroke", "none" )
		.style( "fill", "black" )
	;

	xAxisNode.locationY = d3.transform( xAxisNode.attr("transform") ).translate[1] + 2.5 * fontHeight;

	// hover text for this axis
	GenomePlot.svg
		.append( "svg:text" )
			.attr( "class", "hoverX-text" )
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": 1.25 * GenomePlot.viewportUnitHeight,
				"shape-rendering": "crispEdges",
				"vector-effect": "non-scaling-stroke",
				"pointer-events": "none",
			} )
			.attr( "x", 10 )
			.attr( "y", - GenomePlot.viewportUnitHeight / 1.5 )
	;

	///////////////////////////////////////////////////////////////////////////////

	if( GenomePlot.miscParams.showAdditionalAxis
	&&	GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		// draw the additional x axis
		GenomePlot.axisX_13_14_15 = d3.svg.axis()
			.scale( GenomePlot.linearGenomicToPaddedPixelScaleX_13_14_15 )
			.orient("bottom")
			.ticks( Math.round( GenomePlot.innerWidth / 300 ) )
		//	.tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return m + 'b' } ); } )
			.tickFormat (function( d ) { return formatValue(d); } )
		;

		var xAxisNode_13_14_15 = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontHeight,
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "x axis_13_14_15" )
			.call( GenomePlot.axisX_13_14_15 );

		xAxisNode_13_14_15
			.attr( "transform", "translate(0," + xAxisNode.locationY + ")");

		// fix the resulting text
		xAxisNode_13_14_15.selectAll("text")
			.style( "stroke", "none" )
			.style( "fill", "black" )
		;

		xAxisNode_13_14_15.locationY = d3.transform( xAxisNode_13_14_15.attr("transform") ).translate[1] + 2.5 * fontHeight;

		// hover text for this axis
		GenomePlot.svg
			.append( "svg:text" )
				.attr( "class", "hoverX_13_14_15-text" )
				.style( {
					"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					"font-size": 1.1 * GenomePlot.viewportUnitHeight,
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
				} )
				.attr( "x", GenomePlot.innerWidth / 8 )
				.attr( "y", xAxisNode_13_14_15.locationY - 1.1 * GenomePlot.viewportUnitHeight )
		;

		///////////////////////////////////////////////////////////////////////////////

		// draw the additional x axis
		GenomePlot.axisX_16_17_18 = d3.svg.axis()
			.scale( GenomePlot.linearGenomicToPaddedPixelScaleX_16_17_18 )
			.orient("bottom")
			.ticks( Math.round( GenomePlot.innerWidth / 375 ) )
		//	.tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return m + 'b' } ); } )
			.tickFormat (function( d ) { return formatValue(d); } )
		;

		var xAxisNode_16_17_18 = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontHeight,
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "x axis_16_17_18" )
			.call( GenomePlot.axisX_16_17_18 );

		xAxisNode_16_17_18
			.attr( "transform", "translate(0," + xAxisNode_13_14_15.locationY + ")");

		// fix the resulting text
		xAxisNode_16_17_18.selectAll("text")
			.style( "stroke", "none" )
			.style( "fill", "black" )
		;

		xAxisNode_16_17_18.locationY = d3.transform( xAxisNode_16_17_18.attr("transform") ).translate[1] + 2.5 * fontHeight;

		// hover text for this axis
		GenomePlot.svg
			.append( "svg:text" )
				.attr( "class", "hoverX_16_17_18-text" )
				.style( {
					"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					"font-size": 1.1 * GenomePlot.viewportUnitHeight,
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
				} )
				.attr( "x", GenomePlot.innerWidth / 8 )
				.attr( "y", xAxisNode_16_17_18.locationY - 1.1 * GenomePlot.viewportUnitHeight )
		;

		///////////////////////////////////////////////////////////////////////////////

		// draw the additional x axis
		GenomePlot.axisX_19_20 = d3.svg.axis()
			.scale( GenomePlot.linearGenomicToPaddedPixelScaleX_19_20 )
			.orient("bottom")
			.ticks( Math.round( GenomePlot.innerWidth / 425 ) )
		//	.tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return ' ' + m + 'b' } ); } )
			.tickFormat (function( d ) { return formatValue(d); } )
		;

		var xAxisNode_19_20 = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontHeight,
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "x axis_19_20" )
			.call( GenomePlot.axisX_19_20 );

		xAxisNode_19_20
			.attr( "transform", "translate(0," + xAxisNode_16_17_18.locationY + ")");

		// fix the resulting text
		xAxisNode_19_20.selectAll("text")
			.style( "stroke", "none" )
			.style( "fill", "black" )
		;

		xAxisNode_19_20.locationY = d3.transform( xAxisNode_19_20.attr("transform") ).translate[1] + 2.5 * fontHeight;

		// hover text for this axis
		GenomePlot.svg
			.append( "svg:text" )
				.attr( "class", "hoverX_19_20-text" )
				.style( {
					"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					"font-size": 1.1 * GenomePlot.viewportUnitHeight,
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
				} )
				.attr( "x", GenomePlot.innerWidth / 8 )
				.attr( "y", xAxisNode_19_20.locationY - 1.1 * GenomePlot.viewportUnitHeight )
		;

		///////////////////////////////////////////////////////////////////////////////

		// draw the additional x axis
		GenomePlot.axisX_21_22 = d3.svg.axis()
			.scale( GenomePlot.linearGenomicToPaddedPixelScaleX_21_22 )
			.orient("bottom")
			.ticks( Math.round( GenomePlot.innerWidth / 500 ) )
		//	.tickFormat (function( d ) { return formatValue(d).replace(/[MG]/, function( m ) { return ' ' + m + 'b' } ); } )
			.tickFormat (function( d ) { return formatValue(d); } )
		;

		var xAxisNode_21_22 = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontHeight,
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "x axis_21_22" )
			.call( GenomePlot.axisX_21_22 );

		xAxisNode_21_22
			.attr( "transform", "translate(0," + xAxisNode_19_20.locationY + ")");

		// fix the resulting text
		xAxisNode_21_22.selectAll("text")
			.style( "stroke", "none" )
			.style( "fill", "black" )
		;

		xAxisNode_21_22.locationY = d3.transform( xAxisNode_21_22.attr("transform") ).translate[1] + 2.5 * fontHeight;

		// hover text for this axis
		GenomePlot.svg
			.append( "svg:text" )
				.attr( "class", "hoverX_21_22-text" )
				.style( {
					"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
					"font-size": 1.1 * GenomePlot.viewportUnitHeight,
					"shape-rendering": "crispEdges",
					"vector-effect": "non-scaling-stroke",
					"pointer-events": "none",
				} )
				.attr( "x", GenomePlot.innerWidth / 8 )
				.attr( "y", xAxisNode_21_22.locationY - 1.1 * GenomePlot.viewportUnitHeight )
		;
	}

	///////////////////////////////////////////////////////////////////////////////

	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		var fontWidth = Math.max( 8, 1.2 * GenomePlot.viewportUnitWidth );

		// draw the left y axis
		GenomePlot.axisY_L = d3.svg.axis()
			.scale( GenomePlot.linearChromosomeToPaddedPixelScaleY_L )
			.orient("left")
			.tickValues( d3.range( 1, 14 ) )
			.tickFormat (function( d ) { return formatValue(d).replace("13", "X"); } )
		;

		GenomePlot.svg
			.append("svg:clipPath")
				.attr( "id", "clip-y-axis_L" )
			.append( "svg:rect" )
				.attr( "x", - GenomePlot.margin.left )
				.attr( "y", 0 )
				.attr( "width", GenomePlot.margin.left )
				.attr( "height", GenomePlot.innerHeight )
		;

		var yAxisNode_L = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontWidth,
				"font-weight": "bold",
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "y axis_L")
			.attr( "clip-path", "url(#clip-y-axis_L)" )
			.attr( "transform", "translate(-5,0)" )
			.call( GenomePlot.axisY_L );

		// fix the resulting text
		yAxisNode_L.selectAll("text")
			.style( {
				"stroke": "none",
				"fill": "black",
				"cursor": "pointer",
			} )
			.each( vCenter( GenomePlot.scale * GenomePlot.pixelsPerLine ) )
			.each( hCenter( GenomePlot.margin.left - 5, -1 ) )
		;

		///////////////////////////////////////////////////////////////////////////////

		// draw the right y axis
		GenomePlot.axisY_R = d3.svg.axis()
			.scale( GenomePlot.linearChromosomeToPaddedPixelScaleY_R )
			.orient("right")
			.tickValues( [ 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11 ] )
			.tickFormat (function( d ) {
				if( d === 12 ) return formatValue(d).replace("12", "Y");
				if( d === 23 ) return formatValue(d).replace("23", "");
				if( d === 24 ) return formatValue(d).replace("24", "");

				return formatValue(d);
			} )
		;

		GenomePlot.svg
			.append("svg:clipPath")
				.attr( "id", "clip-y-axis_R" )
			.append( "svg:rect" )
				.attr( "x", 0 )
				.attr( "y", 0 )
				.attr( "width", GenomePlot.margin.right )
				.attr( "height", GenomePlot.innerHeight )
		;

		var yAxisNode_R = GenomePlot.svg
			.append("svg:g")
			.style( {
				"font-family": '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				"font-size": fontWidth,
				"font-weight": "bold",
				"fill": "none",
				"stroke": "black",
				"stroke-width": 1,
				"shape-rendering": "auto"
			} )
			.attr( "class", "y axis_R")
			.attr( "clip-path", "url(#clip-y-axis_R)" )
			.attr( "transform", "translate(" + (GenomePlot.innerWidth + 5) + ",0)" )
			.call( GenomePlot.axisY_R );

		// fix the resulting text
		yAxisNode_R.selectAll("text")
			.style( {
				"stroke": "none",
				"fill": "black",
				"cursor": "pointer",
			} )
			.each( vCenter( GenomePlot.scale * GenomePlot.pixelsPerLine ) )
			.each( hCenter( GenomePlot.margin.right - 5, 1 ) )
		;
	}

	var endTime = performance.now();
	if( GenomePlot.debug ) console.info( sprintf( "%-20s duration: %.4f seconds", "drawAxis():", ((endTime-startTime)/1000) ) );
};	// drawAxis

GenomePlot.onZoom = function () {

	var t = d3.event.translate,
		s = d3.event.scale;

	// constrain the x and y components of the translation by the dimensions of the viewport
	// from: https://gist.github.com/shawnbot/6518285
	t[0] = Math.min(0, Math.max(t[0], GenomePlot.innerWidth - GenomePlot.innerWidth * s));
	t[1] = Math.min(0, Math.max(t[1], GenomePlot.innerHeight - GenomePlot.innerHeight * s));

	GenomePlot.scale = s;
	GenomePlot.translate = t;

	// update the behavior translate values with the constrained values
	d3.event.target.translate(t);

	// for geometric zooming
//	d3.select('#groupMainContainerContents').attr("transform", "translate(" + t + ")" + " scale(" + s + ")");

	// or, for semantic zooming
	GenomePlot.updateZoom(t, s);
};	// onZoom

GenomePlot.updateZoom = function ( t, s )
{
	// from: http://stackoverflow.com/questions/23212277/adding-several-y-axes-with-zoom-pan-in-d3js
	if( GenomePlot.graphTypeParams.graphType === "U-Shape")
	{
		GenomePlot.zoomY_L.scale( s ).translate( t );

		if (GenomePlot.graphTypeParams.graphType === "U-Shape") {
			GenomePlot.zoomY_R.scale( s ).translate( t );
		}

		GenomePlot.basesPerPixel = Math.ceil( GenomePlot.MAX_CHROMOSOME_BASE / (
			GenomePlot.linearGenomicToPaddedPixelScaleX( GenomePlot.MAX_CHROMOSOME_BASE ) -
			GenomePlot.linearGenomicToPaddedPixelScaleX( 0 ) ) );
		GenomePlot.scaledPixelsPerLine =
			GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[1].y ) -
			GenomePlot.linearWindowPixelToPaddedPixelScaleY( GenomePlot.chromPixelStarts[0].y );

		// update scale as it depends on scaledPixelsPerLine
		// by zoom factor 12 bring the elements' y-position to the middle of the chromosome height
		for (var chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id++)
		{
			GenomePlot.exponentMoveToMiddleOfChromScaleY[ chrom_id ] =
				d3.scale.pow().exponent(0.05)
					.domain([ 1, 12 ])	// 12: arbitrary scale value by which we want the overlap of data to take effect
					.range([
						// GenomePlot.chromPixelStarts is 0 based
						GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[ chrom_id ].y + GenomePlot.pixelsPerLine / 3.5),
						GenomePlot.linearWindowPixelToPaddedPixelScaleY(GenomePlot.chromPixelStarts[ chrom_id ].y) - 0.05 * GenomePlot.scaledPixelsPerLine
					])
					.clamp(true);	// dont want values above 12
		}
	}

	GenomePlot.drawBackground();

	GenomePlot.drawHorizontalDividers();
	GenomePlot.drawVerticalDividers();

	GenomePlot.drawCytobands();

	if( GenomePlot.copyNumberData !== undefined &&
		GenomePlot.copyNumberStateData !== undefined )
		GenomePlot.drawSVGCopyNumber();

	GenomePlot.drawAlterations();

	// set the opacity of the vertical labels depending on how much of the chromosome we see in out viewport
	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
	{
		var virtualWidth = GenomePlot.innerWidth - GenomePlot.innerWidth * s;

			d3.selectAll(".y.axis_L text")
			.style( "opacity", function( d ) { return 1 - t[0] / virtualWidth; } );

		d3.selectAll( ".y.axis_R text" )
			.style( "opacity", function( d ) { return t[0] / virtualWidth; } );
	}
}	// updateZoom


GenomePlot.drawCircos = function ()
{
	var cytobands = GenomePlot.cytoBandData.map(function (d) {
		return {
			block_id: d.chrom,
			start: parseInt(d.chromStart),
			end: parseInt(d.chromEnd),
			gieStain: d.gieStain,
			name: d.name,
		}
	});

	// intra
	var alterationsIntraData = GenomePlot.alterationsData
		.filter( function( d ) {
			return d.chrA !== d.chrB && d.Nassoc >= GenomePlot.junctionsParams.associates;	// filter on the current numOfAssoc value
		} );

	var alterationsIntra = alterationsIntraData.map(function (d) {
		return {
			source: {
				id: "chr" + (+d.chrA === 23 ? 'X' : (+d.chrA === 24 ? 'Y' : d.chrA)),
				start: Math.max( parseInt(d.posA) - 2000000 ),
				end: Math.max( parseInt(d.posA) + 2000000 ),
			},
			target: {
				id: "chr" + (+d.chrB === 23 ? 'X' : (+d.chrB === 24 ? 'Y' : d.chrB)),
				start: Math.max( parseInt(d.posB) - 2000000 ),
				end: Math.max( parseInt(d.posB) + 2000000 ),
			},
		}
	});

	// inter
	var alterationsInterData = GenomePlot.alterationsData
		.filter( function( d ) {
			return d.chrA == d.chrB && d.Nassoc >= GenomePlot.junctionsParams.associates;	// filter on the current numOfAssoc value
		} );

	var alterationsInter = alterationsInterData.map(function (d) {
		return {
			source: {
				id: "chr" + (+d.chrA === 23 ? 'X' : (+d.chrA === 24 ? 'Y' : d.chrA)),
				start: Math.max( parseInt(d.posA) - 2000000 ),
				end: Math.max( parseInt(d.posA) + 2000000 ),
			},
			target: {
				id: "chr" + (+d.chrB === 23 ? 'X' : (+d.chrB === 24 ? 'Y' : d.chrB)),
				start: Math.max( parseInt(d.posB) - 2000000 ),
				end: Math.max( parseInt(d.posB) + 2000000 ),
			},
		}
	});

	// remove old contents
	var container = d3.select("#groupMainContainerContents");
	container
		.selectAll(function() { return this.childNodes; })
		.remove();

	// remove all behaviors from the parent container
	d3.select("#groupMainContainer")
		.on(".zoom", null)
	;

	var chromRingThickness = 20;
	var labelOffset = chromRingThickness + 40;
	GenomePlot.graphTypeCircos.outerRadius = Math.max( chromRingThickness + 1, (GenomePlot.graphTypeCircos.width - labelOffset) / 2 - GenomePlot.graphTypeCircos.padding );
	if( GenomePlot.debug ) console.log (sprintf ("%-20s radius dim: %d", "drawCircos():", GenomePlot.graphTypeCircos.outerRadius));

	// from circos.js remove ".append("div").style("position","relative")" that interfered with the rendering of the svg
	var circos = new Circos({
		container: "#groupMainContainerContents",
		width: GenomePlot.graphTypeCircos.width,
		height: GenomePlot.graphTypeCircos.width,
	});

	circos.svg
		.attr( "transform", "translate(" + GenomePlot.margin.left + "," + GenomePlot.margin.top + ")")
		.style( "pointer-events", "none" )
	;

	// add zoom behavior to the circos plot
	d3.select("#groupMainContainer")
		.select("rect")
		.call( d3.behavior.zoom()
			.scaleExtent([1,10])
			.on( "zoom", function () {
				container.attr( "transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")" )
			} ) )
	;

	circos
		.layout(GenomePlot.chromosomesCircos, {
			outerRadius: GenomePlot.graphTypeCircos.outerRadius,
			innerRadius: GenomePlot.graphTypeCircos.outerRadius - chromRingThickness,
			labels: {
				radialOffset: labelOffset,
			},
			ticks: {
				display: true,
				labelDenominator: 1000000,
			},
		})
		.highlight('cytobands', cytobands, {
			outerRadius: GenomePlot.graphTypeCircos.outerRadius,
			innerRadius: GenomePlot.graphTypeCircos.outerRadius - chromRingThickness,
			opacity: 0.50,
			color: function (d) {
				return GenomePlot.cytoBandColors[d.gieStain]
			},
			tooltipContent: null,	// function (d) { return d.name },
		})
		.chords('alterationsIntra', alterationsIntra, {
			logScale: false,
			opacity: 0.75,
			color: GenomePlot.junctionNormalColor,
			tooltipContent: null,	// function (d) { return d.source.id + ' ➤ ' + d.target.id + ': ' + d.value; },
		})
		.chords('alterationsInter', alterationsInter, {
			logScale: false,
			opacity: 0.75,
			color: "orange",
			tooltipContent: null,	// function (d) { return d.source.id + ' ➤ ' + d.target.id + ': ' + d.value; },
		})
	;

	if( GenomePlot.copyNumberData !== undefined
	&&	GenomePlot.copyNumberStateData !== undefined )
	{
		for( var chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id++ )
		{
			var dataX = GenomePlot.copyNumberData.toLegacy.wdnsPerChrom[ chrom_id ];
			var dataY = GenomePlot.copyNumberData.toLegacy.frqPerChrom[ chrom_id ];

			var dataXMasked = GenomePlot.copyNumberData.toLegacy.wdnsMaskedPerChrom[ chrom_id ];

			{
				// get the intervals corresponding to chrom_id
				var dataCNVState = GenomePlot.copyNumberStateData
					// if we are using the tableDataSelected make sure we use only the rows with NRD values defined
					.filter( function( d ) { return d.NRD !== "" && (d.chrA-1) === chrom_id; } );

				var dataC = new Array( dataX.length );

				var i = 0, j = 0;
				while( j < dataCNVState.length ) {
					while( dataX[i] < dataCNVState[j].posA ) i++;
					while( dataX[i] <= dataCNVState[j].posB )
					{
						dataC[i] = GenomePlot.copyNumberStateColor[ dataCNVState[j].state - 1 ];

						i++;
					}

					j++;
				}

	function closureCopyNumberStateColor( i ) { return GenomePlot.copyNumberStateColor[i]; }

				var data = splitLinesToSegmentsPerCopyNumberState( dataX, dataXMasked, dataY, dataC );

				for( var sc = 0; sc < GenomePlot.copyNumberStateColor.length; sc++ )
				{
					var copynumber = [];

					for( var s = 0; s < data[sc].length; s++ )
					{
						for( var i = 0; i < data[sc][s].length; i++ ) {
							copynumber.push({
								block_id: "chr" + ((chrom_id+1) === 23 ? 'X' : ((chrom_id+1) === 24 ? 'Y' : (chrom_id+1))),
								position: data[sc][s][i].x,
								value: data[sc][s][i].y,
							});
						}
					}

					circos
						.line('copynumber' + (chrom_id+1) + sc, copynumber, {
							outerRadius: 0.975,
							innerRadius: 0.5,
							direction: 'in',
							maxGap: 1000000,
							min: 0,
							max: 4,
							showAxesTooltip: false,
							axes: [
								{
									color: 'blue',
									opacity: 0.3,
									position: 0.000001,
								},
								{
									color: 'yellow',
									opacity: 0.75,
									position: 1,
								},
								{
									color: 'red',
									opacity: 0.3,
									position: 2,
								},
							],
							color: closureCopyNumberStateColor(sc),
							tooltipContent: null,
						})
					;
				}

				// for the garbage collector
				data = null;

				// for the garbage collector
				dataC = null;
				dataCNVState = null;
			}
		}
	}

	circos.render();

}	// drawCircos

GenomePlot.criteriaArcFactor = function()
{
	var selector, options = {};

	GenomePlot.criteria = [];

	if (GenomePlot.graphTypeParams.graphType === "U-Shape")
	{
		selector = "g.alterations > path";
	//	options.debugContainer = d3.select("#groupMainContainerContents");

		$('#error_panel .message').empty();
		$('#error_panel .message').append ("Computing Arc Factor criteria. Please wait...");
		toggleElementVisibilitySlow ($("#error_panel"));

		var arcFactors = d3.range( 0, 3, 0.01 ); 	// .concat( d3.range( 2, 11, 0.5 ) );

		var af_i = -1;

		function criteriaArcFactors( af_i ) {
			// update the GUI with values from the data
			GenomePlot.gui.junctionsParams.arcCurvature.setValue( arcFactors[ af_i ] );

			var af_c = pathIntersections(selector, options);
			af_c.arcFactor = arcFactors[ af_i ];
			GenomePlot.criteria.push( af_c );
		}

		function viewArcFactors()
		{
			af_i ++;

			if( af_i < arcFactors.length )
			{
				setTimeout( function() {
					criteriaArcFactors( af_i );
					viewArcFactors();
				}, 100 );
			}
			else
			{
				analyzeArcFactors();
			}
		}

		function analyzeArcFactors()
		{
			// http://smallbusiness.chron.com/normalize-excel-36009.html
			// https://support.office.com/en-us/article/STANDARDIZE-function-81d66554-2d54-40ec-ba83-6437108ee775
			// https://support.office.com/en-us/article/STDEV-S-function-7d69cf97-0c1f-4acf-be27-f3e83904cc23

			var numXingsMean = d3.mean( GenomePlot.criteria, function(d) { return d.xings; } );
			var numXingsStdD = d3.deviation( GenomePlot.criteria, function(d) { return d.xings; } );

			var avgMinXingAngleMean = d3.mean( GenomePlot.criteria, function(d) { return d.avgMinXingAngle; } );
			var avgMinXingAngleStdD = d3.deviation( GenomePlot.criteria, function(d) { return d.avgMinXingAngle; } );

			GenomePlot.criteria.forEach( function( af_c ) {
				af_c.numXingsStdZ = ( af_c.xings - numXingsMean ) / numXingsStdD;
				af_c.avgMinXingAngleStdZ = ( af_c.avgMinXingAngle - avgMinXingAngleMean ) / avgMinXingAngleStdD;

				// linear combination; maximize avgMinXingAngle and minimize numXings
				af_c.score = + af_c.avgMinXingAngleStdZ + - af_c.numXingsStdZ;
			} );

console.table( GenomePlot.criteria );

			var scoreMax = d3.max( GenomePlot.criteria, function(d) { return d.score; } );
			var scoreIdx = scan( GenomePlot.criteria, function(a, b) { return b.score - a.score; } );

console.log( "at index", scoreIdx, "score", GenomePlot.criteria[ scoreIdx ].score,
	"Best Arc factor", GenomePlot.criteria[ scoreIdx ].arcFactor );
console.log( "Number of Edge Xings", GenomePlot.criteria[ scoreIdx ].xings,
	"Average Minimum Xing Angle", GenomePlot.criteria[ scoreIdx ].avgMinXingAngle );

			// update the GUI with values from the data
			GenomePlot.gui.junctionsParams.arcCurvature.setValue( GenomePlot.criteria[ scoreIdx ].arcFactor, true );

			toggleElementVisibilitySlow ($("#error_panel"));

			saveJSONtoCSV( GenomePlot.criteria, "genomeplotCriteria_" + GenomePlot.sampleId + 
				"_size_w" + GenomePlot.innerWidth + '_h' + GenomePlot.innerHeight + ".csv" );
		}

		if( GenomePlot.criteriaArcFactorsAnimate ) {
			viewArcFactors();
		} else {
			for( af_i = 0; af_i < arcFactors.length; af_i += 1 ) {
				criteriaArcFactors( af_i );
			}
			analyzeArcFactors();
		}
	}
	else if (GenomePlot.graphTypeParams.graphType === "Circos")
	{
		selector = "path.chord";
		options.circos = true;
	//	options.debugContainer = d3.select("g.alterations");

		var c_c = pathIntersections(selector, options);
		GenomePlot.criteria.push( c_c );

console.table( GenomePlot.criteria );

		saveJSONtoCSV( GenomePlot.criteria, "circosplotCriteria_" + GenomePlot.sampleId + 
			"_size_r" + GenomePlot.graphTypeCircos.outerRadius + ".csv" );
	}

}	// criteriaArcFactor

//
/* CALLBACKS */
//

GenomePlot.onKeyDown = function( event )
{
//	event.preventDefault();		// this interferes with text input in fields

	// don't catch keyboard shortcuts when focused on text input
	if ($(':focus').is('input[type=text]'))
		return;

	switch (event.keyCode)
	{
		case 72: /* h */
			// dat.gui workaround to fix a bug which allows the user to interact with the gui
			// although it is hidden (opacity: 0, z-index: -999)
			if( GenomePlot.gui.domElement.style.opacity === "0" ) {
				GenomePlot.gui.domElement.parentElement.style.display = "none";
				GenomePlot.gui.adjustWidth = 0;
			}
			else {
				GenomePlot.gui.domElement.parentElement.style.display = null;

				// if the gui displays "Open Controls" it means that it is closed
				if( $( ".dg.main .close-button" ).html() === "Close Controls" )
					GenomePlot.gui.adjustWidth = 265;
			}

			GenomePlot.debounced_draw();

			break;
	}
}	// onKeyDown

//
/* WINDOW SIZES SECTION */
//

GenomePlot.computeGraphSize = function ()
{
	GenomePlot.viewportWidth = window.viewportSize.getWidth() -
		parseFloat( $("#container").css( "margin-left" ).replace("px", "") ) -
		parseFloat( $("#container").css( "margin-right" ).replace("px", "") );
	GenomePlot.viewportHeight = window.viewportSize.getHeight();
	if (GenomePlot.debug) console.log (sprintf ("%-20s viewport dims: %d x %d", "computeGraphSize():", GenomePlot.viewportWidth, GenomePlot.viewportHeight));

	if( GenomePlot.viewportWidth <= 640
	||	GenomePlot.viewportHeight <= 480 ) {
		GenomePlot.noGUI = true;

		hideElementDisplay( $(GenomePlot.gui.domElement) );
	}
	else {
		GenomePlot.noGUI = false;

		GenomePlot.viewportWidth -= GenomePlot.gui.adjustWidth;
	}

	GenomePlot.viewportUnitWidth = GenomePlot.viewportWidth / 100;
	GenomePlot.viewportUnitHeight = GenomePlot.viewportHeight / 100;

	// assign the dimensions here, works the best
	GenomePlot.outerWidth = Math.ceil (100 * GenomePlot.viewportUnitWidth);
	GenomePlot.outerHeight = Math.ceil (90 * GenomePlot.viewportUnitHeight);

	if (GenomePlot.debug) console.log (sprintf ("%-20s outer dims: %d x %d","GenomePlot.computeGraphSize():", GenomePlot.outerWidth, GenomePlot.outerHeight));

	// distance of the outerRect from the innerRect in viewport units
	GenomePlot.margin = {
		top:	Math.max( 25, Math.ceil (3.50 * GenomePlot.viewportUnitHeight) ),
		right:	Math.max( 25, Math.ceil (2.75 * GenomePlot.viewportUnitWidth) ),
		bottom:	Math.max( 25, Math.ceil (3.50 * GenomePlot.viewportUnitHeight) ),
		left:	Math.max( 25, Math.ceil (2.75 * GenomePlot.viewportUnitWidth) ),
	};

	if( GenomePlot.graphTypeParams.graphType === "U-Shape"
	&&	GenomePlot.miscParams.showAdditionalAxis )
	{
		GenomePlot.margin.bottom = Math.max( 25, Math.ceil (14.00 * GenomePlot.viewportUnitHeight) );
	}

	if (GenomePlot.debug) console.log (sprintf ("%-20s margin: t%d r%d b%d l%d", "computeGraphSize():", GenomePlot.margin.top, GenomePlot.margin.right, GenomePlot.margin.bottom, GenomePlot.margin.left));

	GenomePlot.innerWidth = Math.ceil (GenomePlot.outerWidth - GenomePlot.margin.left - GenomePlot.margin.right);
	GenomePlot.innerHeight = Math.ceil (GenomePlot.outerHeight - GenomePlot.margin.top - GenomePlot.margin.bottom);
	if (GenomePlot.debug) console.log (sprintf ("%-20s inner dims: %d x %d", "computeGraphSize():", GenomePlot.innerWidth, GenomePlot.innerHeight));

	if( GenomePlot.graphTypeParams.graphType === "Circos" )
		GenomePlot.graphTypeCircos = {};

	// distance of the actual data from the innerRect in viewport units
	GenomePlot.padding = {
		top:	Math.ceil (2.25 * GenomePlot.viewportUnitHeight),
		right:	Math.ceil (0.75 * GenomePlot.viewportUnitWidth),
		bottom:	Math.ceil (0.75 * GenomePlot.viewportUnitHeight),
		left:	Math.ceil (0.75 * GenomePlot.viewportUnitWidth),
	};

	if( GenomePlot.graphTypeParams.graphType === "Circos" )
	{
		GenomePlot.graphTypeCircos.width = GenomePlot.innerHeight;
		GenomePlot.graphTypeCircos.padding = 40;
	}

	if (GenomePlot.debug) console.log (sprintf ("%-20s padding: t%d r%d b%d l%d", "computeGraphSize():", GenomePlot.padding.top, GenomePlot.padding.right, GenomePlot.padding.bottom, GenomePlot.padding.left));

	///////////////////////////////////////////////////////////////////////////////

	$("#backgroundContainer").css( {
		top: GenomePlot.margin.top,
		left: GenomePlot.margin.left,
		width: GenomePlot.innerWidth,
		height: GenomePlot.innerHeight,
	} );

	$("#container").css( { width: GenomePlot.outerWidth, height: GenomePlot.outerHeight } );

}	// computeGraphSize

//
/* DOCUMENT READY */
//

$(document).ready( function()
{
	// from: http://stackoverflow.com/questions/7505623/colors-in-javascript-console
	console.info( "%cWhole Genome Visualization",
		"font:normal 60pt Arial;" +
		"color:#FFFFFF;" +
		"text-shadow: 0 1px 0 #ccc," +
		"0 2px 0 #c9c9c9," +
		"0 3px 0 #bbb," +
		"0 4px 0 #b9b9b9," +
		"0 5px 0 #aaa," +
		"0 6px 1px rgba(0,0,0,.1)," +
		"0 0 5px rgba(0,0,0,.1)," +
		"0 1px 3px rgba(0,0,0,.3)," +
		"0 3px 5px rgba(0,0,0,.2)," +
		"0 5px 10px rgba(0,0,0,.25)," +
		"0 10px 10px rgba(0,0,0,.2)," +
		"0 20px 20px rgba(0,0,0,.15);"
	);

	// so that button presses on the panels do not propagate to the canvas
	$( "#error_panel" ).mousedown (function( event ) { event.preventDefault(); event.stopPropagation(); });
	$( "#info_panel" ).mousedown (function (event) { event.preventDefault(); event.stopPropagation(); });

	$( "#error_panel .ok" ).mouseup (function( event ) {
		hideElementVisibilityFast ($("#error_panel"));
		$('#error_panel .title').empty();
		$('#error_panel .title').append ("Alert:");
	});

	// cytobands file
	GenomePlot.cytoBandFile = GenomePlot.referenceFiles.hg38.cytoBand;

	GenomePlot.BASE_ALL_MAX = 0;

	for (var chrom_id = 0; chrom_id < GenomePlot.NUM_CHROMS; chrom_id++)
	{
		if( chrom_id === 0 )
			GenomePlot.chromosomes[ (chrom_id+1).toString() ].cumulativeGenomicSize = GenomePlot.chromosomes[ (chrom_id+1).toString() ].genomicSize;
		else
			GenomePlot.chromosomes[ (chrom_id+1).toString() ].cumulativeGenomicSize =
				GenomePlot.chromosomes[ chrom_id.toString() ].cumulativeGenomicSize + GenomePlot.chromosomes[ (chrom_id+1).toString() ].genomicSize;

		// compute total genomic size
		GenomePlot.BASE_ALL_MAX += GenomePlot.chromosomes[ (chrom_id+1).toString() ].genomicSize;
	}

	GenomePlot.loadedResources = 0;

	GenomePlot.parseQueryString();

	GenomePlot.initGUI();

	GenomePlot.computeGraphSize();

	if( GenomePlot.graphTypeParams.graphType === "U-Shape" )
		GenomePlot.junctionsParams.arcFactor = GenomePlot.MAX_CURVATURE;

	GenomePlot.initData();

	document.title = GenomePlot.sampleId + " Whole Genome Analysis";	// initData() must have been called already
	$("#pageTitle").html( "Integrated Whole Genome Analysis, " + GenomePlot.sampleGenome );

	GenomePlot.translate = [0,0];
	GenomePlot.scale = 1;

	// also computes linesPerGraph and pixelsPerLine
	GenomePlot.computeChromosomeStartPositions();
	GenomePlot.computeChromosomeSizes();

	GenomePlot.initTransforms();

	GenomePlot.setupContainer();
	GenomePlot.drawBackground();

	GenomePlot.drawHorizontalDividers();
	GenomePlot.drawVerticalDividers();

	GenomePlot.drawableCytobands = setInterval( function()
	{
		// call, once loading of data has completed
		if( GenomePlot.cytoBandData !== undefined )
		{
			clearInterval( GenomePlot.drawableCytobands );

			GenomePlot.drawCytobands();
		}
	}, 100 );

	GenomePlot.drawableResources = setInterval( function()
	{
		// call, once loading of data has completed
		if( GenomePlot.loadedResources === 0 )
		{
			clearInterval( GenomePlot.drawableResources );

			toggleElementVisibilitySlow( $( "#loading_panel" ) );

			if( GenomePlot.copyNumberData !== undefined &&
				GenomePlot.copyNumberStateData !== undefined )
				GenomePlot.drawSVGCopyNumber();

			GenomePlot.drawAlterations();

if( GenomePlot.criteriaRunAtStartup )
{
	setTimeout( function () {
		GenomePlot.criteriaArcFactor();
	}, 1000 );
}
		}
	}, 500 );

} );	// $(document).ready

//
/* BROWSER EVENTS */
//

// a better idiom for binding with window resize is to debounce
var debounce = function( fn, timeout )
{
	var timeoutID = -1;

	return function()
	{
		if (timeoutID > -1)
			window.clearTimeout(timeoutID);

		timeoutID = window.setTimeout (fn, timeout);
	}
};

GenomePlot.debounced_draw = debounce( function()
{
	if( GenomePlot.noGUI )
		hideElementDisplay( $(GenomePlot.gui.domElement) );
	else
		showElementDisplay( $(GenomePlot.gui.domElement) );

	GenomePlot.computeGraphSize();

	// also computes linesPerGraph and pixelsPerLine
	GenomePlot.computeChromosomeStartPositions();
	GenomePlot.computeChromosomeSizes();

	GenomePlot.initTransforms();

	GenomePlot.setupContainer();
	GenomePlot.drawBackground();

	if( GenomePlot.graphTypeParams.graphType === "Circos" ) {
		GenomePlot.drawCircos();
	}
	else
	{
		GenomePlot.drawHorizontalDividers();
		GenomePlot.drawVerticalDividers();

		GenomePlot.drawCytobands();

		if( GenomePlot.copyNumberData !== undefined &&
			GenomePlot.copyNumberStateData !== undefined )
			GenomePlot.drawSVGCopyNumber();

		GenomePlot.drawAlterations();
	}
}, 250);	// debounced_draw

// bind the window resize to the draw method.
$(window).resize( function(e) {
	if (e.target == window)
		GenomePlot.debounced_draw();
} );

//
/* KEYBOARD EVENTS */
//

window.addEventListener( "keydown", GenomePlot.onKeyDown, false );

//
/* BUTTON EVENTS */
//

// block right mouse menu pop up
window.oncontextmenu = function() { return false; }
