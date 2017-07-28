/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
"use strict";

function assert ( condition, message )
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
function ofType ( object )
{
	return ({}).toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

function saveJSONtoCSV( json, fileName )
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
