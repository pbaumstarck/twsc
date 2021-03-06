"use strict";

// function: getRand
// Returns a random string from a corpus
function getRand(n) {
    if (n == null) {
        n = 32;
    }
    var corpus = 'abcdefghjijklmnopqrstuvwxyzABCDEFGHJIJKLMNOPQRSTUVWXYZ0123456789',
        ret = [];
    for (var i = 0; i < n; ++i) {
        ret.push(corpus.charAt(Math.floor(corpus.length * Math.random())));
    }
    return ret.join("");
}

// function: actuate
// Actuates the Twin-Screw Universal Controller
var actuate = (function() {
    var modules =
        getColorsModules()
        .concat(getNumbersModules())
        .concat(getDefaultModules())
        .concat(getPlottingModules())
        .concat(getMst3kModules())
        .concat(getMst3kVizModules());
    // Sort them
    modules.sort(function(a, b) {
        return -(a.precedence - b.precedence);
    });
    return function(value) {
        // Try all the modules in sorted order
        for (var i = 0; i < modules.length; ++i) {
            var mod = modules[i],
                ret = mod.kernel(value);
            if (ret == null || ret === false) {
                continue;
            } else if (ret === true) {
                // Handled it
                break;
            } else if (typeof ret == "string") {
                // They gave us a string back
                $("#results").html(ret);
                break;
            }
        }
    };
})();

// Gets a module that just echoes the return
function getDefaultModules() {
    return [{
        name: "HelpMenu",
        precedence: 0,
        kernel: function(value) {
            return value.match(/^\s*help\s*$/i) ? helpContents : null;
        }
    },{
        name: "Default",
        precedence: 0,
        kernel: function(value) {
            // Empty string begets empty string
            return value == "" ? "" : "what is this I don't even";
        }
    }];
}

// Holds the starting contents of the page, which is the help menu
var helpContents;

// Our entry point function
$(document).ready(function() {
    helpContents = $("#results").html();
    // A continuation for when the a key goes up
    function keyupCont() {
        // Collapse the old results and fill the new
        $("#results").hide("fast", function() {
            actuate($("#twsc").val());
            $("#results").show("fast");
        });
    }

    var tz = jstz.determine(); // Determines the time zone of the browser client
    tz.name(); // Returns the name of the time zone eg "Europe/Berlin"

    var visible = true;
    $("#twsc").keyup(function(event) {
        // Only respond to the 'Enter' key
        if (event && event.which === 13) {
            if (visible) {
                visible = false;
                // Collapse the image div
                var image = $("#image");
                if (image.length) {
                    image.slideUp("fast", function() {
                        keyupCont();
                    });
                } else {
                    keyupCont();
                }
            } else {
                keyupCont();
            }
        }
    });
});


