
var node = typeof module != "undefined" && module;
if (node) {
    var $$ = require('mst');
}

// Return the canonical array-of-arrays representation of a matrix, with the first row
// being for metadata and being expanded to object form, with types filled in as:
// {
//   name: {String},
//   type: [number|date|string]
// }
function getArrayArray(data) {
    // Get a 'string', 'number', or 'date' type from the item
    function getType(item) {
        var type = typeof item;
        if (type == "number") {
            // Good
        } else if (type instanceof Date) {
            // Good
        } else if (type == "string") {
            // Detect dates
            try {
                var date = new Date(item);
                if (date && !isNaN(+date)) {
                    type = "date";
                }
            } catch (e) {
                // Keep 'string'
            }
        } else {
            throw new Error("Could not interpret type");
        }
        return type;
    }
    if (!(data instanceof Array) || data.length == 0) {
        return null;
    }
    // The return matrix
    var ret = [],
        // The first row of metadata
        meta = [];
    if (data[0] instanceof Array) {
        // It's already in array-of-arrays format, but detect the metadata
        // The first row is metadata if it's all strings or objects
        if ($$.all(data[0], function(item) { return typeof item == "string" || typeof item == "object"; })) {
            if (data.length < 2) {
                // Not actually data
                return null;
            }
            // Everything is in place, so just slice 'data' to get 'ret'
            ret = data.slice();
            // But check that every meta entry is an object with a type
            $$.replace(data[0], function(ser, six) {
                if (typeof ser == "string") {
                    // Must get type
                    return {
                        name: ser,
                        type: getType(data[1][six])
                    };
                } else {
                    return ser;
                }
            });
        } else {
            // Must assemble the metadata row
            $$.each(data[0], function(item, ix) {
                meta.push({
                    name: String.fromCharCode(65 + ix),
                    type: getType(item)
                });
            });
            // Assemble the return from the synthetic metadata
            ret = [meta].concat(data.slice());
        }
    } else if (typeof data[0] == "object") {
        // Must synthesize the metadata from the first thing
        $$.each(data[0], function(key, value) {
            meta.push({
                name: key,
                type: getType(value)
            });
        });
        // Must reslice everything
        var ret = [meta];
        $$.each(data, function(obj) {
            var row = [];
            $$.each(meta, function(ser) {
                row.push(obj[ser.name]);
            });
            ret.push(row);
        });
    } else if (typeof data[0] == "number") {
        // It's a single array of numbers
        ret = [
            [{
                name: "#",
                type: "string"
            },{
                name: String.fromCharCode(65),
                type: "number"
            }]
        ];
        $$.each(data, function(val, ix) {
            ret.push(["" + (ix + 1), val]);
        });
    } else {
        // No data
        return null;
    }
    
    // Now must rectify the 'date'-typed columns
    $$.each(ret[0], function(ser, six) {
        if (ser.type == "date") {
            $$.each(ret, function(row, rix) {
                if (rix == 0) {
                    // Skip the metadata row
                    return;
                }
                var item = row[six];
                if (!(item instanceof Date)) {
                    row[six] = new Date(item);
                }
            });
        }
    });
    return ret;
}

// Checks for things that need to be plotted
function checkPlotting(value) {
    // The data on a chart
    var chart;
    try {
        // Try to JSON everything
        chart = JSON.parse(value);
    } catch (e) {
        try {
            // Try to wrap it in brackets and re-parse it
            chart = JSON.parse("[" + value + "]");
        } catch (e) {        
            return false;
        }
    }
    if (!chart) {
        return false;
    } else if (chart instanceof Array) {
        chart = {
            data: chart
        };
    } else if (typeof chart == "object") {
        if (!chart.data || !(chart.data instanceof Array)) {
            return false;
        }
    } else {
        return false;
    }
    
    /*if (value.match(/^\s*chart\s*$/i) == null) {
        return false;
    }*/
    // Get the chart data in array-of-arrays form
    var arr = getArrayArray(chart.data);
    if (arr == null) {
        return null;
    }
    chart.data = arr;
    
    // Determine which order to display the series in by taking (in order) the first string,
    // the first date, or the first number.
    var xSeries = {
        "string": -1,
        "date": -1,
        "number": -1
    };
    // Record the first instance of each type
    $$.each(chart.data[0], function(ser, six) {
        if (xSeries[ser.type] == -1) {
            xSeries[ser.type] = six;
        }
    });
    var nSeries = chart.data[0].length,
        // The ordered series indices
        ixes = $$.colon([nSeries]),
        ix;
    if ((ix = xSeries["string"]) != -1
        || (ix = xSeries["date"]) != -1
        || (ix = xSeries["number"]) != -1) {
        if (ix != 0) {
            // Must re-order things
            ixes.splice(ix, 1);
            ixes.unshift(ix);
        }
    }
    
    // Assemble the matrix
    var data = new google.visualization.DataTable();
    $$.each(ixes, function(ix) {
        var ser = chart.data[0][ix];
        data.addColumn(ser.type, ser.name);
    });
    var matrix = [];
    $$.each(chart.data, function(row, rix) {
        if (rix == 0) {
            return;
        }
        var newRow = [];
        $$.each(ixes, function(ix) {
            newRow.push(row[ix]);
        });
        matrix.push(newRow);
    });
    data.addRows(matrix);
    // Set chart options
    var options = {
        'title': chart.title || 'Plot',
        'width': chart.width || 640,
        'height': chart.height || 480
    };
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('results'));
    chart.draw(data, options);
    return true;
}

// Returns the modules for plotting
function getPlottingModules() {
    return [{
        // Checks for plotting things
        name: "Plots",
        precedence: 1,
        kernel: checkPlotting
    }];
}


// Test the array-of-arrays recovery
function testArrayArray(console) {
    $$.each([
        // A--A
        [[1],[2],[3],[4]],
        [[1,"a"],[2,"5"],[3,"124"],[4,"123"]],
        [[1,"2011.12.31"],[2,"2012.1.1"],[3,"2012.1.2"],[4,"2012.1.3"]],
        // A--A with metadata
        [["GLARM"],[1],[2],[3],[4]],
        [[{name:"foo",type:"number"},{name:"bar",type:"string"}],
            [1,"a"],[2,"5"],[3,"124"],[4,"123"]],
        [["first",{name:"second",type:"date"}],[1,"2011.12.31"],[2,"2012.1.1"],[3,"2012.1.2"],[4,"2012.1.3"]],
        // A--O
        [{a:1},{a:2},{a:3},{a:4}],
        [{a:1,b:"a"},{a:2,b:"a6"},{a:3,b:"5"},{a:4,b:"moose"}],
        [{a:1,b:"2011.5.5"},{a:2,b:"2011.5.6"},{a:3,b:"2011.5.7"},{a:4,b:"2011.5.8"}]
    ], function(obj) {
        console.log("^");
        console.log(JSON.stringify(obj, null, 2));
        console.log("=>");
        var arr = getArrayArray(obj);
        console.log(JSON.stringify(arr, null, 2));
        console.log("$");
    });
}

//testArrayArray(console);

if (node) {
    module.exports = {
        test: function(console) {
            testArrayArray(console);
        }
    };    
}


