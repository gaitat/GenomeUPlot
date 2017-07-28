/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
"use strict";

// map a number from one interval into another
Number.prototype.map = function ( in_min, in_max, out_min, out_max )
{
	return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
}

Number.prototype.numeric = Number.prototype.numeric || function ()
{
	return ! isNaN( parseFloat( this ) ) && isFinite( this );
}
/*
Number.prototype.isInteger = Number.prototype.isInteger || function() {
	return (this ^ 0) === +this;
}
*/
Number.isInteger = Number.isInteger || function(x) {
	return typeof x === "number" && isFinite(x) && Math.floor(x) === x;
}

// round number to exp decimal places
Number.prototype.round = function(exp) {
	if (typeof exp === 'undefined' || +exp === 0)
		return Math.round( this );

	var value = +this;
	exp = +exp;

	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
		return NaN;

	// Shift
	value = value.toString().split('e');
	value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

	// Shift back
	value = value.toString().split('e');

	return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

Math.trunc = Math.trunc || function(x) {
	return x < 0 ? Math.ceil(x) : Math.floor(x);
}

Math.roundToDigits = Math.roundToDigits || function(x, n) {
	return Math.round (x * Math.pow (10, n)) / Math.pow (10, n);
}

Math.log2 = Math.log2 || function(x) {
	return Math.log(x) / Math.LN2;
}
/*
var log2 = Math.log(2);

if (typeof Math.log2 === "undefined") {
    Math.log2 = function (x) {
        return Math.log(x) / log2;
    }
}
*/

Array.prototype.max = function () {
    return Math.max.apply(Math, this);
};

Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};
 
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

Array.prototype.min = function () {
    return Math.min.apply(Math, this);
};

String.prototype.startsWith = String.prototype.startsWith || function (aString) {
	if (this.length < aString.length) {
		return false;
	}
	else {
		return (this.substr(0, aString.length) == aString);
	}
}

String.prototype.endsWith = String.prototype.endsWith || function (aString) {
	if (this.length < aString.length) {
		return false;
	}
	else {
		return (this.substr(this.length - aString.length, aString.length) == aString);
	}
}

String.prototype.contains = String.prototype.contains || function (it) {
	return this.indexOf(it) != -1;
};

String.prototype.includes = String.prototype.includes || function (it) {
	return this.indexOf(it) != -1;
};

String.prototype.splitLines = String.prototype.splitLines || function () {
	return this.split(/\r\n|\n|\r/gm);
}

String.prototype.basename = String.prototype.basename || function(sep) {
	sep = sep || '\\/';
	return this.split(new RegExp("["+sep+"]")).pop();
}

// from: http://stackoverflow.com/questions/3730510/javascript-sort-array-and-return-an-array-of-indicies-that-indicates-the-positi
Array.prototype.sortIndices = function (func) {
	var i = this.length,
		j = this.length,
		that = this;

	while (i--) {
		this[i] = { k: i, v: this[i] };
	}

	this.sort (function (a, b) {
		return func ? func.call(that, a.v, b.v) : 
					  a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
	});

	while (j--) {
		this[j] = this[j].k;
	}
}

// from: https://stackoverflow.com/a/37319954/1980846
Array.prototype.filterInPlace = function(condition)
{
	let i = 0, j = 0;

	while (i < this.length) {
		const val = this[i];
		if (condition(val, i, this)) this[j++] = val;
		i++;
	}

	this.length = j;
	return this;
}

// from: https://coderwall.com/p/nilaba/simple-pure-javascript-array-unique-method-with-5-lines-of-code
Array.prototype.unique = function()
{
	return this.filter(function (value, index, self) { 
		return self.indexOf(value) === index;
	});
}

Array.prototype.uniqueInPlace = function()
{
	return this.filterInPlace(function (value, index, self) { 
		return self.indexOf(value) === index;
	});
}

///////////////////////////////////////////////////////////////////////////////

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.moveToBack = function() { 
	return this.each(function() { 
		var firstChild = this.parentNode.firstChild; 
		if (firstChild) { 
			this.parentNode.insertBefore(this, firstChild); 
		} 
	}); 
};

///////////////////////////////////////////////////////////////////////////////

// loadDataFile (url)
jQuery.extend({
	ajaxJSONSync: function(url) {
		var result = null;
		$.ajax({
			url: url,
			async: false,	// make it a synchronous call
			dataType: "json",
			success: function (data) { result = data; },
			error: function (jqXHR, textStatus, thrownError) {
				console.error ("Error in ajaxJSONSync(): " + jqXHR.statusText);
			},
		});
		return result;
	},

	ajaxTXTSync: function(url) {
		var result = null;
		$.ajax({
			url: url,
			async: false,	// make it a synchronous call
			dataType: "text",
			success: function (data) { result = data; },
			error: function (jqXHR, textStatus, thrownError) {
				console.error ("Error in ajaxTXTSync(): " + jqXHR.statusText);
			},
		});
		return result;
	},

	ajaxJSON: function(url, result) {
		$.ajax({
			url: url,
			async: true,	// make it a asynchronous call
			dataType: "json",
			success: function (data) { console.log( url ); result = data; },
			error: function (jqXHR, textStatus, thrownError) {
				console.error ("Error in ajaxJSON(): " + jqXHR.statusText);
			},
		});
	},

	ajaxPromise: function(url, type) {
		return $.ajax({
			url: url,
			dataType: type,
		});
	},

	ajaxTXT: function(url, result) {
		$.ajax({
			url: url,
			async: true,	// make it a asynchronous call
			dataType: "text",
			success: function (data) { console.log( url ); result = data; },
			error: function (jqXHR, textStatus, thrownError) {
				console.error ("Error in ajaxTXT(): " + jqXHR.statusText);
			},
		});
	},

	// from: http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
	ajaxFileExists: function(url) {
		return $.ajax({
			type: 'HEAD',
			url: url,
			// I want a new tab not a new window so ensure you are doing the ajax call with 'async: false' option set.
			async: false,   // An interesting fact is that the new tab can not be opened if the action is not invoked by the user (clicking a button or something) or if it is asynchronous.
		});
	}
});

// how to parse a query string
function getQueryVariable(variable)
{
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return pair[1]; }
	}
	return(false);
}
