
var node = typeof module != "undefined" && module;

if (node) {
  var $$ = require('mst'),
    shows = require('./shows.js'),
    Show = shows.Show;
}

// class: WatchRecord
// A record of watching things for a show.
function WatchRecord() {
  /**
   * The record type we use to describe a watch.
   * @typedef {{show: Show, episode: Episode, date: Date, kind: string}}
   * @private
   */
  var Watch;

  var _this = this,
    /**
     * The individual shows that we have records for.
     * @type {!Array.<Show>}
     * @private
     */
    _shows = [],
    /**
     * The pattern we use to look for a single episode watch.
     * @type {!RegExp}
     * @private
     */
    _pattern = /(^|\s)(([\w\d][\w\d]?)\d{2})\s*\-\s*((\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*))(\s*[\,\;]\s*(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2}(r|q|t\d*)))*)/i,
    /**
     * A list of records of our watches:
     * @type {{show: Show, episode: Episode, date: Date, kind: string}}
     * @private
     */
    _watches = [],
    /**
     * String information? I forget.
     * @type {!Array.<string>}
     * @private
     */
    _btws = [];

  // Return the shows that are stored internally.
  _this.shows = function() { return _shows; }
  // List of all the shows we have watches for.
  _this.getShows = function() {
    var showSet = {};
    $$.each(_shows, function(show) {
      showSet[show.toString()] = true;
    });
    return $$.toArray(showSet, function(key, value) { return key; });
  }
  // The number of watches that we have.
  _this.nWatches = function() { return _watches.length; }
  // Public accessor to the watches list.
  _this.watches = function() { return _watches; }
  // The list of our BTW strings.
  _this.btws = function() { return _btws; }

  /**
   * Gets a string key to use for a date, e.g., '2013-04-10'.
   * @param {Date} date
   * @param {string}
   */
  function _getDateKey(date) {
    var gi;
    return date.getFullYear() + "-"
      + ((gi = date.getMonth() + 1) < 10 ? "0" + gi : gi) + "-"
      + ((gi = date.getDate()) < 10 ? "0" + gi : gi);
  }

  // Add the processed watches to the record.
  _this.addWatches = function(obj) {
    if (obj instanceof WatchRecord) {
      _shows = _shows.concat(obj.shows())
      _watches = _watches.concat(obj.watches());
      return;
    }
    var show = Show.get(obj.show) || obj.show,
      hasShow = typeof show != "string",
      showKey = hasShow ? show.toString() : obj.show,
      watches = obj.body;
    if (obj.btws) {
      _btws = _btws.concat(obj.btws);
    }
    _shows.push(show);

    var value = obj.body;
    while ((match = _pattern.exec(value))) {
      var number = match[2],
        dates = match[4],
        ep = hasShow ? show.getEpisode(number) : number;
      if (!ep) {
        console.log(match);
      } else {
        // Parse all dates
        var subValue = match[0],
          datePattern = /(\d{4}[\.\-]\d{1,2}[\.\-]\d{1,2})(r|q|t\d*)/i,
          subMatch;
        while ((subMatch = datePattern.exec(subValue)) != null) {
          _watches.push({
            show: show,
            episode: ep,
            date: new Date(subMatch[1]),
            kind: subMatch[2]
          });
          subValue = subValue.substr(subMatch.index + subMatch[0].length + 1);
        }
      }
      value = value.substr(match.index + match[0].length + 1);
    }
  }

  /**
   * Get an array of all the watches grouped by some value.
   * @param {!function(!Watch):string} keyKernel Extracts a string key to
   *     group by from a single watch.
   * @param {!function(!Watch):!Object} ctorKernel For a newly seen group value,
   *     returns an object to begin aggregating for it.
   * @param {!function(!Object, !Watch)} updateKernel Takes an aggregation
   *     object and adds another 'Watch' to it.
   * @param {boolean} asList Whether the return value should be a flattened
   *     list or a dictionary with the keys provided by 'keyKernel'.
   * @return {(!Object.<string, !Object>|Array.<!Object>)}
   * @private
   */
  function _getGrouped(keyKernel, ctorKernel, updateKernel, asList) {
    var groupedMap = {};
    $$.each(_watches, function(tuple) {
      var key = keyKernel(tuple);
      if (!(key in groupedMap)) {
        groupedMap[key] = ctorKernel(tuple);
      }
      updateKernel(groupedMap[key], tuple);
    });
    if (asList === true) {
      return $$.toArray(groupedMap, function(key, value) { return value; });
    }
    return groupedMap;
  }

  // Get the list of all views grouped by date.
  _this.getGroupedByDate = function(asList) {
    return _getGrouped(
        function(tuple) { return _getDateKey(tuple.date); },
        function(tuple) { return { date: _getDateKey(tuple.date), views: [] }; },
        function(elem, tuple) { elem.views.push(tuple); },
        asList);
  }

  /**
   * Gets all views grouped by episode.
   * @return {*.<{ep: !Episode, show: !Show, views: !Array.<Date>}>}
   *     Either as a list of a dictionary with keys of the concatenated show
   *     and episode names.
   */
  _this.getGroupedByEpisode = function() {
    var keyKernel = function(tuple) {
      return (tuple.show ? tuple.show.toString() : "NULL") + "::" +
          (tuple.episode ? tuple.episode.toString() : "NULL");
    },
      ctorKernel = function(tuple) {
      return {
        ep: tuple.episode,
        show: tuple.show,
        views: []
      };
    },
      grouped = _getGrouped(
        keyKernel,
        ctorKernel,
        function(elem, tuple) { elem.views.push(tuple.date); },
        false);
    // Fill in the missing episodes for every show.
    $$.each(_shows, function(show) {
      $$.each(show.getAllEpisodes(), function(ep) {
        var tuple = {
          show: show,
          episode: ep
        },
          key = keyKernel(tuple);
        if (!(key in grouped)) {
          grouped[key] = ctorKernel(tuple);
        }
      });
    });
    return $$.toArray(grouped, function(key, value) { return value; });
  }

  /**
   * Gets a JSON array of all the watches we have recorded, with only primitive
   * values, no objects.
   * @return {!Array.<!{show: string,
   *                    episode: string,
   *                    date: Date,
   *                    kind: string}>}
   */
  _this.getWatchesJson = function() {
    function getKind(kind) {
      var match;
      if (kind == "R") {
        return "Random";
      } else if (kind == "Q") {
        return "Request";
      } else if (match = kind.match(/^T(\d+)$/)) {
        return "Watchthrough " + match[1];
      } else {
        return kind;
      }
    }
    return $$.select(_watches, function(item) {
      return {
        show: item.show.name(),
        season: item.episode.season().name(),
        episode: item.episode.toString(false),
        date: item.date,
        dateKey: _getDateKey(item.date),
        kind: getKind(item.kind)
      };
    });
  };
}

if (node) {
    module.exports = {
        WatchRecord: WatchRecord
    };
}
