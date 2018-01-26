/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

import '../../vendor/console-save';

"use strict";

export function assert ( condition, message )
{
	try {
		if ( ! condition )
			throw new Error ( message || "Assertion failed" );
	}
	catch ( error ) {
	//	alert ( "Assert " + error );
		console.error( "Assert " + error );
	}
}

// from: http://stackoverflow.com/questions/7390426/better-way-to-get-type-of-a-javascript-variable
export function ofType ( object )
{
	return ({}).toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

export function saveJSONtoCSV( json, fileName )
{
	var fields = Object.keys(json[0]);
	var replacer = function(key, value) { return value === null ? '' : value };
	var csv = json.map(function(row) {
		return fields.map(function(fieldName) {
			return JSON.stringify(row[fieldName], replacer);
		}).join(',');
	})
	csv.unshift(fields.join(',')); // add header column

	console.save( csv.join('\r\n'), fileName );
}

// how to parse a query string
export function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return(false);
}
