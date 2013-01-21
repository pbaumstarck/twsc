
var node = typeof module != "undefined" && module;
if (node) {
    var $$ = require('mst');
}

// Whether a number is prime or not. Returns 'false' for not, 'true' for yes, and an integer
// when it finds a divisible number.
function isPrime(n) {
    if (n < 2) {
        return false;
    }
    var bound = Math.sqrt (n);
    for (var i = 2; i <= bound; ++i) {
        if (n % i == 0) {
            return i;
        }
    }
    return true;
}

// Match primality queries
function matchPrimality(value) {
    var match,
        number;
    if ((match = value.match(/^\s*(is)?\s*prime\s*(\d+)\s*\??\s*$/i)) != null) {
        number = parseInt(match[2]);
    } else if ((match = value.match(/^\s*(is)?\s*(\d+)\s*(is)?\s*prime\s*\??\s*$/i)) != null) {
        number = parseInt(match[2]);
    } else {
        return false;
    }
    var ret = isPrime(number);
    if (ret === false) {
        return $$.pretty(number) + " is not prime.";
    } else if (ret === true) {
        return $$.pretty(number) + " is prime.";
    } else if (typeof ret == "number") {
        return $$.pretty(number) + " is not prime: " + $$.pretty(number) + " = "
            + $$.pretty(ret) + " * " + $$.pretty(number / ret);
    } else {
        return false;
    }
}

// Factors a number into primes
function factor(number) {
    var ret = [],
        div = 2;
    while (number > 1) {
        while (number % div == 0) {
            ret.push(div);
            number /= div;
        }
        ++div;
        if (div * div > number) {
            if (number > 1) {
                ret.push(number);
            }
            break;
        }
    }
    return ret;
}

// Gets the modules that do numerical things
function getNumbersModules() {
    return [{
        // Checks for the primality of a number
        name: "Prime",
        precedence: 1,
        kernel: matchPrimality
    },{
        // Factors numbers
        name: "Factor",
        precedence: 1,
        kernel: function(value) {
            var match,
                number;
            if ((match = value.match(/^\s*(please)?\s*factor\s*(\d+)\s*\,?\s*(please)?\s*$/i)) != null) {
                number = parseInt(match[2]);
            } else {
                return false;
            }
            if (number < 1) {
                return "Can't factor " + $$.pretty(number);
            } else {
                var factors = factor(number);
                if (factors.length == 1) {
                    return $$.pretty(number) + " is prime.";
                } else {
                    return $$.pretty(number) + " = "
                        + $$.select(factor(number), function(factor) {
                                return $$.pretty(factor);
                            }).join(" * ");
                }
            }
        }
    }];
}

// Test the primality checking module
function testPrimality(console) {
    $$.each([
        "glarm",
        "is 47 prime?",
        "is 47 PRIME?",
        "is 47 prime",
        "is47prime?",
        "is prime 47?",
        "is prime 47",
        "is PRIME 47",
        "isprime 47",
        "prime 47",
        "47 prime",
        "47 is prime?"
    ], function(value) {
        console.log(value, "=>", matchPrimality(value));
    });
}

// Test the factoring checking module
function testFactoring(console) {
    for (var i = 1; i <= 1000; ++i) {
        var factors = factor(i);
        if ($$.any(factors, function(factor) { return !isPrime(factor); })) {
            throw new Error("Not a prime factor: " + factor);
        }
        console.log(i, "=>", factors.join(","));
    }
}

if (node) {
    module.exports = {
        test: function(console) {
            testPrimality(console);
            testFactoring(console);
        }
    };    
}


