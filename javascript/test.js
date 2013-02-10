"use strict";

var $$ = require('mst'),
    diff = require('diff'),
    assert = require('assert'),
    fs = require('fs'),
	log = [],
	base_consoleLog = console.log,
	// Isolate what mode we're using, whither 'view', to show output; 'test', to run against the
	// reference body; or 'overwrite', to overwrite the reference file.
	mode = process.argv.length < 3 ? "test" : process.argv[2];

console.log = function() {
    var str = "";
    for (var i = 0; i < arguments.length; ++i) {
	    str += (i > 0 ? " " : "") + arguments[i];
	}
	log.push(str);
	if (mode == "view" || mode == "overwrite") {
		base_consoleLog.apply(null, arguments);
	}
}

var tests = [
    require('./colors.js').test,
    require('./numbers.js').test,
    require('./plots.js').test,
    require('./mst3k.js').test
];
$$.each(tests, function(test) {
    test(console);
});

if (mode == "test") {
	fs.writeFileSync("comparison.json", JSON.stringify(log, null, '\t'));
	var reference = fs.readFileSync("reference.json", "utf-8").replace(/\r/g, ""),
		actual = JSON.stringify(log, null, '\t').replace(/\r/g, ""),
		success = actual == reference;
	if (success) {
		base_consoleLog("Tests passed");
	} else {
		base_consoleLog("*** TESTS FAILED ***");
		var leDiff = diff.diffLines(reference, actual);
		for (var i = 0; i < leDiff.length; ++i) {
			var line = leDiff[i];
			if (line.added) {
				base_consoleLog(" >" + line.value.replace(/\n/g, "\n >"));
			} else if (line.removed) {
				base_consoleLog("< " + line.value.replace(/\n/g, "\n< "));
			}
		}
	}
} else if (mode == "overwrite") {
	fs.writeFileSync("reference.json", JSON.stringify(log, null, '\t'));
}


