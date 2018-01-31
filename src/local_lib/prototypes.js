/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
/* eslint-disable max-len, no-mixed-operators, no-extend-native */

// map a number from one interval into another
Number.prototype.map = function (inMin, inMax, outMin, outMax)
{
    return (this - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
};

Number.prototype.numeric = Number.prototype.numeric || function ()
{
    return !Number.isNaN(parseFloat(this)) && Number.isFinite(this);
};

Number.isInteger = Number.isInteger || function (x)
{
    return typeof x === 'number' && Number.isFinite(x) && Math.floor(x) === x;
};

// round number to exp decimal places
Number.prototype.round = function (pre)
{
    if (typeof pre === 'undefined' || +pre === 0)
    {
        return Math.round(this);
    }

    let value = +this;
    const exp = +pre;

    if (Number.isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
    {
        return NaN;
    }

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(`${value[0]}e${value[1] ? (+value[1] + exp) : exp}`));

    // Shift back
    value = value.toString().split('e');

    return +(`${value[0]}e${value[1] ? (+value[1] - exp) : -exp}`);
};

Math.trunc = Math.trunc || function (x)
{
    return x < 0 ? Math.ceil(x) : Math.floor(x);
};

Math.roundToDigits = Math.roundToDigits || function (x, n)
{
    return Math.round(x * (10 ** n)) / (10 ** n);
};

Math.log2 = Math.log2 || function (x)
{
    return Math.log(x) / Math.LN2;
};

Array.prototype.max = function ()
{
    return Math.max(...this);
};

Array.prototype.min = function ()
{
    return Math.min(...this);
};

String.prototype.basename = String.prototype.basename || function (sep)
{
    const separator = sep || '\\/';
    return this.split(new RegExp(`[${separator}]`)).pop();
};

// /////////////////////////////////////////////////////////////////////////////

d3.selection.prototype.moveToFront = function ()
{
    return this.each(function ()
    {
        this.parentNode.appendChild(this);
    });
};

// /////////////////////////////////////////////////////////////////////////////

// loadDataFile (url)
jQuery.extend({
    ajaxJSONSync(url)
    {
        let result = null;
        $.ajax({
            url,
            async: false, // make it a synchronous call
            dataType: 'json',
            success(data) { result = data; },
            error(jqXHR)
            {
                console.error(`Error in ajaxJSONSync(): ${jqXHR.statusText}`);
            },
        });
        return result;
    },

    // from: http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
    ajaxFileExists(url)
    {
        return $.ajax({
            type: 'HEAD',
            url,
            // I want a new tab not a new window so ensure you are doing the ajax call with 'async: false' option set.
            async: false, // An interesting fact is that the new tab can not be opened if the action is not invoked by the user (clicking a button or something) or if it is asynchronous.
        });
    },
});
