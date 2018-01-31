/* eslint-disable max-len, no-mixed-operators, prefer-destructuring */

import svgIntersections from 'svg-intersections';

// the following code is from
// https://bl.ocks.org/andresin87/cb9c53581cdac51718d5 and
// https://bl.ocks.org/mbostock/8027637
// please note the results are approximate (using precision) and errors can occur

function getTangent(pathNode, point)
{
    const r = 0.5;
    let prev;
    let next;

    try
    {
        prev = pathNode.getPointAtLength(point.bestLength - r);
    }
    catch (e)
    {
        prev = pathNode.getPointAtLength(0);
    }

    try
    {
        next = pathNode.getPointAtLength(point.bestLength + r);
    }
    catch (e)
    {
        next = pathNode.getPointAtLength(pathNode.getTotalLength());
    }

    const delta = { x: next.x - prev.x, y: next.y - prev.y };

    const LENGTH = 40; // length of tangent line

    return {
        tangent: delta.y / delta.x,
        lineAttrs: {
            x1: (point[0] - (delta.x * LENGTH) / r),
            y1: (point[1] - (delta.y * LENGTH) / r),
            x2: (point[0] + (delta.x * LENGTH) / r),
            y2: (point[1] + (delta.y * LENGTH) / r),
        },
    };
}

function closestPoint(pathNode, point)
{
    function distance2(p)
    {
        const dx = p.x - point[0];
        const dy = p.y - point[1];
        return dx * dx + dy * dy;
    }

    const pathLength = pathNode.getTotalLength();
    let precision = 8;
    let best;
    let bestLength;
    let bestDistance = Infinity;

    // linear scan for coarse approximation
    for (let scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision)
    {
        scan = pathNode.getPointAtLength(scanLength);
        scanDistance = distance2(scan);
        if (scanDistance < bestDistance)
        {
            best = scan;
            bestLength = scanLength;
            bestDistance = scanDistance;
        }
    }

    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.1)
    { // Note: we can lower that for greater precision
        let before;
        let after;
        let beforeLength;
        let afterLength;
        let beforeDistance;
        let afterDistance;

        /* eslint-disable no-cond-assign */
        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance)
        {
            best = before;
            bestLength = beforeLength;
            bestDistance = beforeDistance;
        }
        else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance)
        {
            best = after;
            bestLength = afterLength;
            bestDistance = afterDistance;
        }
        else
        {
            precision /= 2;
        }
    /* eslint-enable no-cond-assign */
    }

    best = [best.x, best.y];
    best.bestLength = bestLength;
    best.distance = Math.sqrt(bestDistance);
    return best;
}

export default function pathIntersections(selector, opts)
{
    const options = opts || {};

    const debugContainer = options.debugContainer;

    const intersect = svgIntersections.intersect;
    const shape = svgIntersections.shape;

    const elements = [];
    d3.selectAll(selector).each(function ()
    {
        elements.push(d3.select(this));
    });

    let xingCount = 0;
    let xingAngleSum = 0;

    for (let i = 0; i < elements.length - 1; i += 1)
    {
        for (let j = i + 1; j < elements.length; j += 1)
        {
            const e1 = elements[i];
            const e2 = elements[j];

            const shape1 = shape('path', { d: e1.attr('d') });
            const shape2 = shape('path', { d: e2.attr('d') });

            if (options.circos)
            {
                shape1.params[0].splice(2);
                shape2.params[0].splice(2);
            }

            const intersections = intersect(shape1, shape2);

            const hasPointsProperty = Object.prototype.hasOwnProperty.call(intersections, 'points');
            if (hasPointsProperty)
            {
                for (let k = 0; k < intersections.points.length; k += 1)
                {
                    const point = intersections.points[k];

                    const cp1 = closestPoint(e1.node(), [point.x, point.y]);
                    const cp2 = closestPoint(e2.node(), [point.x, point.y]);

                    const tangent1 = getTangent(e1.node(), cp1);
                    const tangent2 = getTangent(e2.node(), cp2);

                    const slope1 = tangent1.tangent;
                    const slope2 = tangent2.tangent;

                    const deg = Math.atan((slope1 - slope2) / (1 + slope1 * slope2)) / (Math.PI / 180);
                    const tanIntAngMin = Math.abs(deg);

                    xingCount += 1;
                    xingAngleSum += tanIntAngMin;

                    if (debugContainer)
                    {
                        debugContainer
                            .append('circle')
                            .attr('cx', point.x)
                            .attr('cy', point.y)
                            .attr('r', 2)
                            .attr('stroke-width', 2)
                            .attr('stroke', '#FF0000')
                            .attr('fill', '#FF0000');

                        debugContainer
                            .append('circle')
                            .attr('cx', cp1[0])
                            .attr('cy', cp1[1])
                            .attr('r', 1)
                            .attr('stroke-width', 1)
                            .attr('stroke', '#0000FF')
                            .attr('fill', '#0000FF');

                        debugContainer
                            .append('text')
                            .attr('x', point.x + 3)
                            .attr('y', point.y - 3)
                            .attr('stroke', '#FF0000')
                            .attr('fill', '#FF0000')
                            .text(tanIntAngMin.toFixed(0));

                        const tangLine1 = debugContainer.append('line').attr('stroke-width', 1).attr('stroke', 'red');
                        Object.keys(tangent1.lineAttrs).forEach((key) =>
                        {
                            tangLine1.attr(key, tangent1.lineAttrs[key]);
                        });

                        const tangLine2 = debugContainer.append('line').attr('stroke-width', 1).attr('stroke', 'red');
                        Object.keys(tangent2.lineAttrs).forEach((key) =>
                        {
                            tangLine2.attr(key, tangent2.lineAttrs[key]);
                        });
                    }
                }
            }
        }
    }

    return {
        xings: xingCount,
        avgMinXingAngle: xingCount > 0 ? xingAngleSum / xingCount : 0,
    };
}
