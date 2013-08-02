
var node = typeof module != "undefined" && module != null;

if (node) {
    var $$ = require('mst'),
        shows = require('./shows.js'),
        Show = shows.Show,
        Season = shows.Season,
        Episode = shows.Episode;
}

/**
 * Get a JSON array of all the MST3K episodes with associated meta information.
 * @return {!Array.<!{episode: string}>}
 */
function getMst3kEpisodesMeta() {
  var show = Show.get("MST3K");
  var eps = $$.select(show.getAllEpisodes(), function(ep) {
    var record = {
      season: ep.season().name(),
      episode: ep.toString(),
      number: ep.number(),
      title: ep.title()
    };

    // Determine host.
    var season = +record.season;
    if (record.season == "K" || !isNaN(season) && (
        season <= 4 || season == 5 && ep.number() <= 12)) {
      record.host = "Joel";
    } else {
      record.host = "Mike";
    }

    // Determine who was Tom.
    if (record.season == "K" || !isNaN(season) && season <= 1) {
      record.Tom = "Josh Weinstein";
    } else {
      record.Tom = "Kevin Murphy";
    }

    // Determine who was Crow.
    if (record.season == "K" || record.season == "M" ||
        !isNaN(season) && season <= 7) {
      record.Crow = "Trace Beaulieu";
    } else {
      record.Crow = "Bill Corbett";
    }

    // Determine the Mads.
    record.Mads = [];
    // - First the primary Mad.
    if (isNaN(season) || season <= 7) {
      record.Mads.push("Dr. Forrester");
    } else {
      record.Mads.push("Pearl Forrester");
    }
    // - And then the sidekicks.
    if (record.season == "K" || !isNaN(season) && season <= 6) {
      record.Mads.push("TV's Frank");
    } else if (!isNaN(season)) {
      if (season == 7) {
        record.Mads.push("Pearl Forrester");
      } else if (season == 8 && record.number < 13) { // ?
        record.Mads.push("Professor Bobo");
      } else {
        record.Mads.push("Observer/Brain Guy");
        record.Mads.push("Professor Bobo");
      }
    }

    return record;
  });
  // console.log(eps);
  return eps;
}

if (node) {
  module.exports = {
    getMst3kEpisodesMeta: getMst3kEpisodesMeta
  };
}
