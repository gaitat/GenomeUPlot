/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

import GenomePlot from './GenomePlot';
import { comparator } from '../local_lib/utils-d3';

"use strict";

GenomePlot.processAlterationsData = function(data)
{
	if( data === null ) return;

	data = data.replace( /^[#@][^\r\n]+[\r\n]+/mg, '' );		// remove comments
	var dataParsed = d3.csv.parse( data );
	data = null;	// for the garbage collector

	var localData = dataParsed.map( function( d )
	{
		return {
			"Nassoc":	+d["Nassoc"],
			"chrA":		+d["chrA"],
			"chrB":		+d["chrB"],
			"posA":		+d["posA"],
			"posB":		+d["posB"],
			"size":		+d["size"],
			"transposonMetric":	 +d["transposonMetric"],
		};
	} );

	// from: https://github.com/interactivethings/d3-comparator
	// sort first by chrom_id and then by txStart (transcription start) so that the genes come in genomic order in the plot
	var compare = comparator()
		.order( d3.ascending, function( d ) { return d.chrA; } )
		.order( d3.ascending, function( d ) { return d.chrB; } )
		.order( d3.ascending, function( d ) { return d.posA; } )
		.order( d3.ascending, function( d ) { return d.posB; } )
	;
	localData.sort( compare );

	return localData;

};	// processAlterationsData
