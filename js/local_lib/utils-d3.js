/**
 * @author gaitat / Athanasios Gaitatzes (Saki)
 */
"use strict";

// d3.scan which does not exist in v3
export function scan(values, compare) {
  if (!(n = values.length)) return;
  var n,
      i = 0,
      j = 0,
      xi,
      xj = values[j];

  if (compare == null) compare = ascending;

  while (++i < n) {
    if (compare(xi = values[i], xj) < 0 || compare(xj, xj) !== 0) {
      xj = xi, j = i;
    }
  }

  if (compare(xj, xj) === 0) return j;
}

// d3.comparator which is not a proper npm
// from: https://github.com/interactivethings/d3-comparator
function identity(d) { return d; }

export function comparator() {
  var cmps = [], accessors = [];

  var comparator = function(a, b) {
    var i = -1,
      n = cmps.length,
      result;
    while (++i < n) {
      result = cmps[i](accessors[i](a), accessors[i](b));
      if (result !== 0) return result;
    }
    return 0;
  };

  comparator.order = function(cmp, accessor) {
    cmps.push(cmp);
    accessors.push(accessor || identity);
    return comparator;
  };

  return comparator;
}
