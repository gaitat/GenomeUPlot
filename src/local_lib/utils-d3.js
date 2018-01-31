/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
/* eslint-disable */

function ascending(a, b)
{
    if (a < b)
    {
        return -1;
    }
    else if (a > b)
    {
        return 1;
    }
    else if (a === b)
    {
        return 0;
    }

    return NaN;
}

// d3.scan which does not exist in v3
export function scan(values, compare)
{
    const n = values.length;
    if (!n) return;

    let i = 0;
    let j = 0;
    let xi;
    let xj = values[j];

    let cmp = compare;
    if (compare == null) cmp = ascending;

    while (++i < n)
    {
        xi = values[i];
        if (cmp(xi, xj) < 0 || cmp(xj, xj) !== 0)
        {
            xj = xi;
            j = i;
        }
    }

    if (cmp(xj, xj) === 0) return j;
}

// d3.comparator which is not a proper npm
// from: https://github.com/interactivethings/d3-comparator
function identity(d) { return d; }

export function comparator()
{
    const cmps = [];
    const accessors = [];

    const comparator = function (a, b)
    {
        let i = -1;
        const n = cmps.length;
        let result;

        while (++i < n)
        {
            result = cmps[i](accessors[i](a), accessors[i](b));
            if (result !== 0) return result;
        }
        return 0;
    };

    comparator.order = function (cmp, accessor)
    {
        cmps.push(cmp);
        accessors.push(accessor || identity);
        return comparator;
    };

    return comparator;
}
