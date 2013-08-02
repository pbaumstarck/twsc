
var node = typeof module != "undefined" && module;

/**
 * Something that can act as a key value to render values out of an item.
 * This can be either a key to look up in the objects, or a custom method.
 * @typedef {(string|function(Object):*)}
 */
leftJoin.Key;


/**
 * An object that specifies different keying values for the left and right
 * sides.
 * @typedef {{left: leftJoin.Key, right: leftJoin.Key}}
 */
leftJoin.DualKey;


/**
 * Computes the left join of the two arrays using the specified 'keys' to
 * match values between the 'left' and 'right' arrays.
 * @param {!Array.<!Object>} left The left array. All items from here will
 *     be in the output, regardless of if there are matches found in 'right'.
 *     If there are multiple matches found in 'right' for a single item, that
 *     item will be copied for each match.
 * @param {!Array.<!Object>} right The right array. Information from these
 *     elements will be added to those in 'left' provided their key values
 *     match.
 * @param {!Array.<(leftJoin.Key|leftJoin.DualKey)>} keys The list of keys
 *     to use for correlating values between the left and right arrays. All
 *     specified key values must be matched between two items for them to be
 *     joined.
 * @return {!Array.<!Object>} The computed left join between the two arrays.
 */
function leftJoin(left, right, keys) {

  /**
   * Computes the intersection between two sorted arrays, and returns it
   * in a new array.
   * @param {!Array} a A sorted array.
   * @param {!Array} b A sorted array.
   * @return {!Array} The elements in both 'a' and 'b'.
   */
  function intersection(a, b) {
    var result = [],
        aix = 0,
        bix = 0;
    while (aix < a.length && bix < b.length) {
      var aval = a[aix],
          bval = b[bix];
      if (aval < bval) {
        ++aix;
      } else if (aval > bval) {
        ++bix;
      } else {
        result.push(aval);
        ++aix;
        ++bix;
      }
    }
    return result;
  }

  /**
   * Builds a copy of an object.
   * @param {!Object} obj An object.
   * @return {!Object} A copy of the object.
   */
  function copy(obj) {
    var newObj = {};
    for (var key in obj) {
      newObj[key] = obj[key];
    }
    return newObj;
  }

  /**
   * Evaluates the key on the given item, and returns the rendered value.
   * @param {!Object} item The item to evaluate.
   * @param {(leftJoin.Key|leftJoin.DualKey)} key The key to use.
   * @param {boolean} Whether this is for the left or right side.
   * @return {*} Some value.
   */
  function evalKey(item, key, isRight) {
    var type = typeof key;
    if (type == "string") {
      return item[key];
    } else if (type == "function") {
      return key[item];
    } else if (type == "object") {
      return evalKey(item, isRight ? key.right : key.left, isRight);
    } else {
      throw new Error("What is this I don't even: " + key);
    }
  }

  /**
   * We index all the elements in 'right' by their key values. This is actually
   * a map of indices, with the first key being keys from 'keys', and the values
   * being indices for those keys. These are dictionaries with keys of values
   * for those items in the arrays, and values of arrays of indices in 'right'
   * where items matching that 'key'--'value' combination can be found.
   * @type {!Object.<string, !Object.<string, !Array<number>>>}
   */
  var rightIndex = {};
  // Create all the starter indices.
  for (var i = 0; i < keys.length; ++i) {
    // var key = keys[i];
    rightIndex[i] = {};
  }
  // Index all values in 'right'.
  for (var j = 0; j < right.length; ++j) {
    var rightItem = right[j];
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      // if (key in rightItem) {
      var value = evalKey(rightItem, key, true);// rightItem[key];
      if (value !== undefined && !(value in rightIndex[i])) {
        rightIndex[i][value] = [];
      }
      rightIndex[i][value].push(j);
      // }
    }
  }

  /**
   * The computed joined elements.
   * @type {!Array.<!Object>}
   */
  var joined = [];
  for (var i = 0; i < left.length; ++i) {
    var leftItem = copy(left[i]);
    /**
     * The list of indices in 'right' that match all the key values found in
     * 'leftItem'. We compute this efficiently by looking up all 'leftItem'`s
     * key values in the index and intersecting the RHS index arrays.
     * @type {!Array.<number>}
     */
    var rightIndices = null;
    for (var j = 0; j < keys.length; ++j) {
      var key = keys[j];
      var value = evalKey(leftItem, key, false);
      //if (!(key in leftItem)) {
      if (value === undefined) {
        rightIndices = null;
        break;
      }
      //var value = leftItem[key];
      var indices = rightIndex[j][value];
      if (indices == null || indices.length == 0) {
        // Nothing with this value in 'right', so die immediately.
        rightIndices = null;
        break;
      } else if (j == 0) {
        // Take this as the first list.
        rightIndices = indices;
      } else {
        // Have to intersection with the existing list.
        rightIndices = intersection(rightIndices, indices);
        if (rightIndices.length == 0) {
          break;
        }
      }
    }

    if (rightIndices == null || rightIndices.length == 0) {
      // There were no matching RHS elements, so just copy over the
      // existing 'leftItem'.
      joined.push(copy(leftItem));
    } else {
      // Replicate 'leftItem' for all matches identified in 'rightIndices'.
      for (var j = 0; j < rightIndices.length; ++j) {
        var newItem = copy(leftItem);
        var rightItem = right[rightIndices[j]];
        // Copy over novel entries from 'rightItem'.
        for (var key in rightItem) {
          if (!(key in leftItem) && !(key in rightIndex)) {
            // Don't overwrite existing keys in 'leftItem', nor join keys.
            newItem[key] = rightItem[key];
          }
        }
        joined.push(newItem);
      }
    }
  }

  return joined;
}

function test() {
  var data1 = [{
    'a': 'a-val1',
    'b': 'b-val1'
  }, {
    'a': 'a-val2',
    'b': 'b-val1'
  }, {
    'a': 'a-val3',
    'b': 'b-val2'
  }, {
    'a': 'a-val4',
    'b': 'b-val2'
  }, {
    'a': 'a-val5',
    'b': 'b-val2'
  }];

  var data2 = [{
    'a': 'a-val1',
    'b': 'OVERWRITTEN!',
    'meta1': 'foo',
    'meta2': 'bar'
  }, {
    'a': 'a-val2',
    'b': 'OVERWRITTEN!',
    'meta1': 'goo'
  }, {
    'a': 'a-val3',
    'b': 'OVERWRITTEN!',
    'meta1': 'goo-3a'
  }, {
    'a': 'a-val3',
    'b': 'OVERWRITTEN!',
    'meta1': 'goo-3b'
  }];
  var joined = leftJoin(data1, data2, ['a']);
  for (var i = 0; i < joined.length; ++i) {
    console.log(joined[i]);
  }
}

if (node) {
  module.exports = {
    leftJoin: leftJoin,
    test: test,
  };
}
