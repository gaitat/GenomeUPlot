import svgIntersections from 'svg-intersections';

export function pathIntersections(selector, options) {
	options = options || {};

	var debugContainer = options.debugContainer;

	var intersect = svgIntersections.intersect;
	var shape = svgIntersections.shape;

	var elements = [];
	d3.selectAll(selector).each(function (d, i) {
		elements.push(d3.select(this));
	});

	var xingCount = 0, xingAngleSum = 0;
	for (var i = 0; i < elements.length - 1; i++) {
		for (var j = i + 1; j < elements.length; j++) {
			var e1 = elements[i], e2 = elements[j];

			var shape1 = shape("path", {d: e1.attr("d")});
			var shape2 = shape("path", {d: e2.attr("d")});

			if (options.circos) {
				shape1.params[0].splice(2);
				shape2.params[0].splice(2);
			}

			var intersections = intersect(shape1, shape2);

			if (intersections.hasOwnProperty("points")) {
				intersections.points.forEach(function (point) {
					var cp1 = closestPoint(e1.node(), [point.x, point.y]);
					var cp2 = closestPoint(e2.node(), [point.x, point.y]);

					var tangent1 = getTangent(e1.node(), cp1);
					var tangent2 = getTangent(e2.node(), cp2);

					const slope1 = tangent1.tangent;
					const slope2 = tangent2.tangent;

					const deg = Math.atan((slope1 - slope2) / (1 + slope1 * slope2)) / (Math.PI / 180);
					const tanIntAngMin = Math.abs(deg);

					xingCount++;
					xingAngleSum += tanIntAngMin;

					if (debugContainer) {
						debugContainer
							.append("circle")
							.attr("cx", point.x)
							.attr("cy", point.y)
							.attr("r", 2)
							.attr("stroke-width", 2)
							.attr("stroke", "#FF0000")
							.attr("fill", "#FF0000");

						debugContainer
							.append("circle")
							.attr("cx", cp1[0])
							.attr("cy", cp1[1])
							.attr("r", 1)
							.attr("stroke-width", 1)
							.attr("stroke", "#0000FF")
							.attr("fill", "#0000FF");

						debugContainer
							.append("text")
							.attr("x", point.x + 3)
							.attr("y", point.y - 3)
							.attr("stroke", "#FF0000")
							.attr("fill", "#FF0000")
							.text(tanIntAngMin.toFixed(0));

						var tangLine1 = debugContainer.append("line").attr("stroke-width", 1).attr("stroke", "red");
						Object.keys(tangent1.lineAttrs).forEach(function (key) {
							tangLine1.attr(key, tangent1.lineAttrs[key]);
						});

						var tangLine2 = debugContainer.append("line").attr("stroke-width", 1).attr("stroke", "red");
						Object.keys(tangent2.lineAttrs).forEach(function (key) {
							tangLine2.attr(key, tangent2.lineAttrs[key]);
						});
					}

				});
			}
		}
	}


	var retVal = {};

	retVal.xings = xingCount;
	retVal.avgMinXingAngle = xingCount > 0 ? xingAngleSum / xingCount : 0;

	return retVal;

	// the following code is from
	// https://bl.ocks.org/andresin87/cb9c53581cdac51718d5 and
	// https://bl.ocks.org/mbostock/8027637
	// please note the results are approximate (using precision) and errors can occur

	function getTangent(pathNode, point) {
		var r = .5;
		var prev, next;

		try {
			prev = pathNode.getPointAtLength(point.bestLength - r);
		} catch (e) {
			prev = pathNode.getPointAtLength(0);
		}

		try {
			next = pathNode.getPointAtLength(point.bestLength + r);
		} catch (e) {
			next = pathNode.getPointAtLength(pathNode.getTotalLength());
		}

		var delta = {x: next.x - prev.x, y: next.y - prev.y};

		var LENGTH = 40; // length of tangent line

		return {
			tangent: delta.y / delta.x,
			lineAttrs: {
				x1: (point[0] - (delta.x * LENGTH) / r),
				y1: (point[1] - (delta.y * LENGTH) / r),
				x2: (point[0] + (delta.x * LENGTH) / r),
				y2: (point[1] + (delta.y * LENGTH) / r)
			},
		};
	}

	function closestPoint(pathNode, point) {
		var pathLength = pathNode.getTotalLength();
		var precision = 8;
		var best;
		var bestLength;
		var bestDistance = Infinity;

		// linear scan for coarse approximation
		for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
			if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
				best = scan;
				bestLength = scanLength;
				bestDistance = scanDistance;
			}
		}

		// binary search for precise estimate
		precision /= 2;
		while (precision > 0.1) {   // Note: we can lower that for greater precision
			var before,
				after,
				beforeLength,
				afterLength,
				beforeDistance,
				afterDistance;
			if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
				best = before;
				bestLength = beforeLength;
				bestDistance = beforeDistance;
			} else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
				best = after;
				bestLength = afterLength;
				bestDistance = afterDistance;
			} else {
				precision /= 2;
			}

		}

		best = [best.x, best.y];
		best.bestLength = bestLength;
		best.distance = Math.sqrt(bestDistance);
		return best;

		function distance2(p) {
			var dx = p.x - point[0],
				dy = p.y - point[1];
			return dx * dx + dy * dy;
		}
	}


}