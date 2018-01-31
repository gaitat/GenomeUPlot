/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */

export function assert(condition, message)
{
    try
    {
        if (!condition) { throw new Error(message || 'Assertion failed'); }
    }
    catch (error)
    {
        console.error(`Assert ${error}`);
    }
}

console.save = function (data, filename)
{
    if (!data)
    {
        console.error('Console.save: No data');
        return;
    }

    let dFileName = filename;
    if (!filename) dFileName = 'console.json';

    let jdata = data;

    if (typeof data === 'object')
    {
        jdata = JSON.stringify(data, undefined, 4);
    }

    const blob = new Blob([jdata], { type: 'text/json' });
    const e = document.createEvent('MouseEvents');
    const a = document.createElement('a');

    a.download = dFileName;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
};

export function saveJSONtoCSV(json, fileName)
{
    const fields = Object.keys(json[0]);
    const replacer = function (key, value) { return value === null ? '' : value; };
    const csv = json.map(row => fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(fields.join(',')); // add header column

    console.save(csv.join('\r\n'), fileName);
}

// how to parse a query string
export function getQueryVariable(variable)
{
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i += 1)
    {
        const pair = vars[i].split('=');
        if (pair[0] === variable)
        {
            return pair[1];
        }
    }
    return (false);
}
