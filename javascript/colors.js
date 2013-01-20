
var node = typeof module != "undefined" && module;
if (node) {
    var $$ = require('mst');
}

var engColors = {
    "aliceblue": "#F0F8FF",
    "antiquewhite": "#FAEBD7",
    "aqua": "#00FFFF",
    "aquamarine": "#7FFFD4",
    "azure": "#F0FFFF",
    "beige": "#F5F5DC",
    "bisque": "#FFE4C4",
    "black": "#000000",
    "blanchedalmond": "#FFEBCD",
    "blue": "#0000FF",
    "blueviolet": "#8A2BE2",
    "brown": "#A52A2A",
    "burlywood": "#DEB887",
    "cadetblue": "#5F9EA0",
    "chartreuse": "#7FFF00",
    "chocolate": "#D2691E",
    "coral": "#FF7F50",
    "cornflowerblue": "#6495ED",
    "cornsilk": "#FFF8DC",
    "crimson": "#DC143C",
    "cyan": "#00FFFF",
    "darkblue": "#00008B",
    "darkcyan": "#008B8B",
    "darkgoldenrod": "#B8860B",
    "darkgray": "#A9A9A9",
    "darkgrey": "#A9A9A9",
    "darkgreen": "#006400",
    "darkkhaki": "#BDB76B",
    "darkmagenta": "#8B008B",
    "darkolivegreen": "#556B2F",
    "darkorange": "#FF8C00",
    "darkorchid": "#9932CC",
    "darkred": "#8B0000",
    "darksalmon": "#E9967A",
    "darkseagreen": "#8FBC8F",
    "darkslateblue": "#483D8B",
    "darkslategray": "#2F4F4F",
    "darkslategrey": "#2F4F4F",
    "darkturquoise": "#00CED1",
    "darkviolet": "#9400D3",
    "deeppink": "#FF1493",
    "deepskyblue": "#00BFFF",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1E90FF",
    "firebrick": "#B22222",
    "floralwhite": "#FFFAF0",
    "forestgreen": "#228B22",
    "fuchsia": "#FF00FF",
    "gainsboro": "#DCDCDC",
    "ghostwhite": "#F8F8FF",
    "gold": "#FFD700",
    "goldenrod": "#DAA520",
    "gray": "#808080",
    "grey": "#808080",
    "green": "#008000",
    "greenyellow": "#ADFF2F",
    "honeydew": "#F0FFF0",
    "hotpink": "#FF69B4",
    "indianred": "#CD5C5C",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "lavenderblush": "#FFF0F5",
    "lawngreen": "#7CFC00",
    "lemonchiffon": "#FFFACD",
    "lightblue": "#ADD8E6",
    "lightcoral": "#F08080",
    "lightcyan": "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgray": "#D3D3D3",
    "lightgrey": "#D3D3D3",
    "lightgreen": "#90EE90",
    "lightpink": "#FFB6C1",
    "lightsalmon": "#FFA07A",
    "lightseagreen": "#20B2AA",
    "lightskyblue": "#87CEFA",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#B0C4DE",
    "lightyellow": "#FFFFE0",
    "lime": "#00FF00",
    "limegreen": "#32CD32",
    "linen": "#FAF0E6",
    "magenta": "#FF00FF",
    "maroon": "#800000",
    "mediumaquamarine": "#66CDAA",
    "mediumblue": "#0000CD",
    "mediumorchid": "#BA55D3",
    "mediumpurple": "#9370DB",
    "mediumseagreen": "#3CB371",
    "mediumslateblue": "#7B68EE",
    "mediumspringgreen": "#00FA9A",
    "mediumturquoise": "#48D1CC",
    "mediumvioletred": "#C71585",
    "midnightblue": "#191970",
    "mintcream": "#F5FFFA",
    "mistyrose": "#FFE4E1",
    "moccasin": "#FFE4B5",
    "navajowhite": "#FFDEAD",
    "navy": "#000080",
    "oldlace": "#FDF5E6",
    "olive": "#808000",
    "olivedrab": "#6B8E23",
    "orange": "#FFA500",
    "orangered": "#FF4500",
    "orchid": "#DA70D6",
    "palegoldenrod": "#EEE8AA",
    "palegreen": "#98FB98",
    "paleturquoise": "#AFEEEE",
    "palevioletred": "#DB7093",
    "papayawhip": "#FFEFD5",
    "peachpuff": "#FFDAB9",
    "peru": "#CD853F",
    "pink": "#FFC0CB",
    "plum": "#DDA0DD",
    "powderblue": "#B0E0E6",
    "purple": "#800080",
    "red": "#FF0000",
    "rosybrown": "#BC8F8F",
    "royalblue": "#4169E1",
    "saddlebrown": "#8B4513",
    "salmon": "#FA8072",
    "sandybrown": "#F4A460",
    "seagreen": "#2E8B57",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "silver": "#C0C0C0",
    "skyblue": "#87CEEB",
    "slateblue": "#6A5ACD",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#FFFAFA",
    "springgreen": "#00FF7F",
    "steelblue": "#4682B4",
    "tan": "#D2B48C",
    "teal": "#008080",
    "thistle": "#D8BFD8",
    "tomato": "#FF6347",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "wheat": "#F5DEB3",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "yellow": "#FFFF00",
    "yellowgreen": "#9ACD32"
};

// Converts a string color in hexadecimal or English to an RGB tuple '(r,g,b,base)'
function color2Rgb(color) {
    if (color.toLowerCase() in engColors) {
        // Decode English language colors with the map
        color = engColors[color.toLowerCase()];
    }
    var match,
        factor;
    if (color.length >= 6) {
        // Match double-wide characters
        match = color.match(/^\#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        factor = 1;
    } else {
        // Match single-wide characters
        match = color.match(/^\#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
        factor = 16;
    }
    if (match == null || match.length < 4) {
        return null;
    } else {
        var vals = $$.select(match.slice(1, 4), function(val) { return /*factor **/ parseInt(val, 16); });
        return {
            r: vals[0],
            g: vals[1],
            b: vals[2],
            base: 256 / factor
        };
    }
}

// Converts an RGB tuple '(r,g,b,base)' to a hexadecimal string starting with '#'
function rgb2Hex(color) {
    // Converts a single value to two-character hexadecimal
    function value2Hex(val) {
        val = Math.round(val).toString(16);
        // Must zero-pad for under-long things
        return color.base == 256 && val.length < 2 ? "0" + val : val;
    }
    return "#" + value2Hex(color.r) + value2Hex(color.g) + value2Hex(color.b)
}

// Scale the base on a given RGB color
function rgbScaleBase(rgb, base) {
    if (rgb.base == base) {
        return rgb;
    } else {
        // Going from base 16 to base 256, say
        var factor = (base - 1) / (rgb.base - 1);
        return {
            r: rgb.r * factor,
            g: rgb.g * factor,
            b: rgb.b * factor,
            base: base
        };
    }
}

// Tests our conversion functions
function testConversions(console) {
    $$.each([
        "moose",
        "red",
        "f00",
        "f000",
        "f00ff0",
        "#f00ff0",
        "#666",
        "#ff8844"
    ], function(color) {
        var res = color2Rgb(color),
            str = res;
        if (res != null) {
            str = "{ ";
            var i = 0;
            $$.each(res, function(key, value) {
                str += (i++ > 0 ? ", " : "") + key + ": " + value;
            });
        }
        console.log(color, "=>", str);
        if (res != null) {
            console.log(color, "=> (back)", rgb2Hex(res));
        }
    });
}

// A regular expression component for matching a color
var color = "(\\\"|\\')?"
    + "("
        + "\\#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})";
$$.each(engColors, function(key, value) {
    color += "|" + key;
});
color += ")"
    + "(\\\"|\\')?";

// Converts a list of colors to a proper form, with '#' prefixing all hex codes
function rectifyColors(colors) {
    $$.replace(colors, function(color) {
        // Trim whitespace
        color = color.replace(/(^\s+|\s+$|'|")/g, "");
        // Add a prefix '#' if it needs one
        if (color.indexOf("#") == -1 && color.match(/^[0-9a-fA-F]+$/i) != null) {
            color = "#" + color;
        }
        return color;
    });
    return colors;
}

// Matches strings containing an arbitrary number of hex colors
// 
// returns: A list of colors if any are found, or 'null' otherwise
function matchColors(value) {
    var regex = new RegExp("^\\s*\\[?\\s*" + color + "((\\,\\s*|\\s+)" + color + ")*\\s*\\]?\\s*$", "i"),
        match = value.match(regex);
    if (match == null) {
        return null;
    }
    var values;
    // Replace all non-color or delimiter characters
    value = value.replace(/[^\#0-9a-zA-Z\,\s]+/g, "")
                .replace(/(^\s+|\s+$)/g, "");
    if (value.indexOf(",") != -1) {
        values = value.split(/\s*\,\s*/);
    } else {
        values = value.split(/\s+/);
    }
    return rectifyColors(values);
}

// Runs tests on color matching
function testMatchColors(console) {
    $$.each([
        "moose",
        "glial mice mouse",
        "fff",
        "#fff",
        "#fff0",
        "#fff000",
        "'#fff'",
        "\"#ffffff\"",
        "#fff #aaa #bbb #c0c",
        "#fff, #aaa, #bbb, #c0c",
        "[#fff, #aaa, #bbb, #c0c]",
        "['#fff', '#aaa', '#bbb', '#c0c']",
        "['#fff' '#aaa' '#bbb' '#c0c']",
        "tomato",
        "fuchsia indianred",
        "'fuchsia' \"indianred\"",
        "[DimGrey, 'fuchsia', \"indianred\""
    ], function(test) {
        console.log(test, "=>", matchColors(test));
    });
}

// Matches a requested fade of colors
// 
// returns: The list of colors to be faded between
function matchColorRange(value) {
    var regex = new RegExp("^\\s*" + color + "(\\s+to\\s+" + color + ")+\\s*$", "i"),
        match = value.match(regex);
    if (match == null) {
        return null;
    }
    return rectifyColors(value.split(/\s+to\s+/i));
}

// Test matching a color range
function testMatchColorRange(console) {
    $$.each([
        "red",
        "red to blue",
        "f00 to 00f",
        "'#f00' to '#00f'"
    ], function(test) {
        console.log(test, "=>", matchColorRange(test));
    });
}

// The principal size for our 'div's
var principal = 80;

// Gets the modules that recognize colors
function getColorsModules() {
    return [{
        // The module that recognizes colors
        name: "Colors",
        precedence: 1,
        kernel: function(value) {
            var colors = matchColors(value);
            if (colors == null) {
                return false;
            }
            // Construct some 'div's
            var ret = "",
                width = principal,
                height = principal;
            $$.each(colors, function(color, ix) {
                ret += '<span style="width: ' + width + 'px; height: ' + height + 'px; background-color: ' + color + '; '
                    + 'display: inline-block; border: 1px black solid; align: center; vertical-align: middle;">' + color + '</span> ';
            });
            return ret;
        }
    },{
        // The module that recognizes color ranges
        name: "ColorRanges",
        precedence: 1,
        kernel: function(value) {
            var colors = matchColorRange(value);
            if (colors == null) {
                return false;
            }
            if (colors.length == 2) {
                // Construct a fade from one color to the other
                var ret = "",
                    width = 2,
                    height = principal,
                    a = color2Rgb(colors[0]),
                    b = color2Rgb(colors[1]),
                    nSteps = 200;
                // Convert 'a' and 'b' to a common base
                var maxBase = Math.max(a.base, b.base);
                a = rgbScaleBase(a, maxBase);
                b = rgbScaleBase(b, maxBase);
                // Calculate a delta color
                var delta = {
                    r: (b.r - a.r) / nSteps,
                    g: (b.g - a.g) / nSteps,
                    b: (b.b - a.b) / nSteps
                };
                ret += colors[0] + "&nbsp;";
                for (var i = 0; i <= nSteps; ++i) {
                    var color = rgb2Hex({
                        r: a.r + i * delta.r,
                        g: a.g + i * delta.g,
                        b: a.b + i * delta.b,
                        base: maxBase
                    });
                    ret += '<div style="width: ' + width + 'px; height: ' + height + 'px; background-color: ' + color + '; '
                        + 'display: inline-block; padding: 0px;" '
                        + 'onmouseover="$(\'#rangeMouseOver\').html(\'' + color + '\')"></div>';
                }
                ret += "&nbsp;" + colors[1]
                    + '<br />'
                    + '<div id="rangeMouseOver"></div>';
                return ret;
            } else {
                return false;
            }
        }
    }];
}

if (node) {
    module.exports = {
        getModules: getColorsModules,
        test: function(console) {
            testMatchColors(console);
            testMatchColorRange(console);
            testConversions(console);
        }
    };    
}


