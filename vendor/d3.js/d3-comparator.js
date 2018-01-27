(function() {
  d3.comparator = function() {
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
  };
  
  function identity(d) { return d; }
})();
