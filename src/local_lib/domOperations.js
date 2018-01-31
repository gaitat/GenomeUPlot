/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

export function parseBoolean(string)
{
    switch (String(string).toLowerCase())
    {
    case 'true':
    case '1':
    case 'yes':
    case 'y':
        return true;

    case 'false':
    case '0':
    case 'no':
    case 'n':
        return false;

    default:
        // you could throw an error, but 'undefined' seems a more logical reply
        return undefined;
    }
}

// Note: toggling 'display' of an element rearranges the elements around it (layout of page changes)

// .show(), .hide() and .toggle() affect the "display" CSS property
export function hideElementDisplay(element) { element.hide(); }

export function hideElementDisplaySlow(element) { element.hide('slow'); }

export function hideElementDisplayFast(element) { element.hide('fast'); }

export function showElementDisplay(element) { element.show(); }

export function showElementDisplaySlow(element) { element.show('slow'); }

export function showElementDisplayFast(element) { element.show('fast'); }

export function toggleElementDisplay(element) { element.toggle(); }

export function toggleElementDisplaySlow(element) { element.toggle('slow'); }

export function toggleElementDisplayFast(element) { element.toggle('fast'); }

// .fadeIn() and .fadeOut() affect the "opacity" CSS property
export function hideElementSlow(element) { element.fadeOut('slow'); }

export function hideElementFast(element) { element.fadeOut('fast'); }

export function showElementSlow(element) { element.fadeIn('slow'); }

export function showElementFast(element) { element.fadeIn('fast'); }

// Note: toggling 'visibility' of an element does not rearrange the elements around it
// (layout of page stays the same)

export function hideElementVisibility(element) { element.css('visibility', 'hidden'); }

export function hideElementVisibilitySlow(element) { element.animate({ opacity: 0.0 }, 600, () => { element.css({ visibility: 'hidden' }); }); }

export function hideElementVisibilityFast(element) { element.animate({ opacity: 0.0 }, 200, () => { element.css({ visibility: 'hidden' }); }); }

export function showElementVisibility(element) { element.css('visibility', 'visible'); }

export function showElementVisibilitySlow(element) { element.css('visibility', 'visible').animate({ opacity: 1.0 }, 600); }

export function showElementVisibilityFast(element) { element.css('visibility', 'visible').animate({ opacity: 1.0 }, 200); }

export function toggleElementVisibility(element)
{
    element.css('visibility', element.css('visibility') === 'hidden' ? 'visible' : 'hidden');
}

export function toggleElementVisibilitySlow(element)
{
    element.css('visibility', element.css('visibility') === 'hidden' ?
        showElementVisibilitySlow(element) :
        hideElementVisibilitySlow(element));
}

export function toggleElementVisibilityFast(element)
{
    element.css('visibility', element.css('visibility') === 'hidden' ?
        showElementVisibilityFast(element) :
        hideElementVisibilityFast(element));
}

export function showError(message)
{
    $('#error_panel .message').empty();
    $('#error_panel .message').append(message);
    showElementVisibility($('#error_panel'));
}

export function showErrorSlow(message)
{
    $('#error_panel .message').empty();
    $('#error_panel .message').append(message);
    showElementVisibilitySlow($('#error_panel'));
}

export function showErrorFast(message)
{
    $('#error_panel .message').empty();
    $('#error_panel .message').append(message);
    showElementVisibilityFast($('#error_panel'));
}

export function showInfo(message) { showError(message); }

export function showInfoSlow(message) { showErrorSlow(message); }

export function showInfoFast(message) { showErrorFast(message); }

// could use isHidden (element)
export function isVisible(element) { return element.is(':visible'); }

export function resetDOM()
{
    showElementFast($('#drop_on_me'));
    showElementFast($('#instructions'));

    hideElementFast($('#help_panel'));
    hideElementFast($('#caps_panel'));
    hideElementFast($('#maps_panel'));

    $('#stopwatch_reset').prop('checked', true); // reset the stopwatch
    hideElementFast($('#stopwatch'));
}
