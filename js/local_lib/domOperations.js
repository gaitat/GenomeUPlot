/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
"use strict";

function parseBoolean (string)
{
	switch (String (string).toLowerCase ())
	{
		case "true":
		case "1":
		case "yes":
		case "y":
			return true;

		case "false":
		case "0":
		case "no":
		case "n":
			return false;

		default:
			//you could throw an error, but 'undefined' seems a more logical reply
			return undefined;
	}
}

// Note: toggling 'display' of an element rearranges the elements around it (layout of page changes)

// .show(), .hide() and .toggle() affect the "display" CSS property
function hideElementDisplay (element)		{ element.hide(); }
function hideElementDisplaySlow (element)	{ element.hide('slow'); }
function hideElementDisplayFast (element)	{ element.hide('fast'); }

function showElementDisplay (element)		{ element.show(); }
function showElementDisplaySlow (element)	{ element.show('slow'); }
function showElementDisplayFast (element)	{ element.show('fast'); }

function toggleElementDisplay (element)		{ element.toggle(); }
function toggleElementDisplaySlow (element)	{ element.toggle('slow'); }
function toggleElementDisplayFast (element)	{ element.toggle('fast'); }

// .fadeIn() and .fadeOut() affect the "opacity" CSS property
function hideElementSlow (element)	{ element.fadeOut('slow'); }
function hideElementFast (element)	{ element.fadeOut('fast'); }

function showElementSlow (element)	{ element.fadeIn('slow'); }
function showElementFast (element)	{ element.fadeIn('fast'); }

function showError (message)
{
	$( "#error_panel .message" ).empty ();
	$( "#error_panel .message" ).append( message );
	showElementVisibility( $( "#error_panel" ) );
}
function showErrorSlow (message)
{
	$( "#error_panel .message" ).empty ();
	$( "#error_panel .message" ).append( message );
	showElementVisibilitySlow( $( "#error_panel" ) );
}
function showErrorFast (message)
{
	$( "#error_panel .message" ).empty ();
	$( "#error_panel .message" ).append( message );
	showElementVisibilityFast( $( "#error_panel" ) );
}

function showInfo (message)			{ showError (message); }
function showInfoSlow (message)		{ showErrorSlow (message); }
function showInfoFast (message)		{ showErrorFast (message); }

// Note: toggling 'visibility' of an element does not rearrange the elements around it (layout of page stays the same)

function hideElementVisibility (element)		{ element.css( "visibility", "hidden" ); }
function hideElementVisibilitySlow (element)	{ element.animate( { opacity: 0.0 }, 600, function() { element.css( { "visibility": "hidden" } ); } ); }
function hideElementVisibilityFast (element)	{ element.animate( { opacity: 0.0 }, 200, function() { element.css( { "visibility": "hidden" } ); } ); }

function showElementVisibility (element)		{ element.css( "visibility", "visible" ); }
function showElementVisibilitySlow (element)	{ element.css( "visibility", "visible" ).animate( { opacity: 1.0 }, 600 ); }
function showElementVisibilityFast (element)	{ element.css( "visibility", "visible" ).animate( { opacity: 1.0 }, 200 ); }

function toggleElementVisibility (element)
{
	element.css( "visibility", element.css( "visibility" ) === "hidden" ? "visible" : "hidden" );
}
function toggleElementVisibilitySlow (element)
{
	element.css( "visibility", element.css( "visibility" ) === "hidden" ?
		showElementVisibilitySlow (element) :
		hideElementVisibilitySlow (element) );
}
function toggleElementVisibilityFast (element)
{
	element.css( "visibility", element.css( "visibility" ) === "hidden" ?
		showElementVisibilityFast (element) :
		hideElementVisibilityFast (element) );
}

// could use isHidden (element)
function isVisible (element)	{ return element.is(":visible"); }

function resetDOM ()
{
	showElementFast ($('#drop_on_me'));
	showElementFast ($('#instructions'));

	hideElementFast ($('#help_panel'));
	hideElementFast ($('#caps_panel'));
	hideElementFast ($('#maps_panel'));

	$("#stopwatch_reset").prop ('checked', true);	// reset the stopwatch
	hideElementFast ($('#stopwatch'));
}
