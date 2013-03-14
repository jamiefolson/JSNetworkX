// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Hash Map.
 * 
 * @author arv@google.com (Erik Arvidsson)
 * @author jonp@google.com (Jon Perlow) Optimized for IE6
 * 
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes. For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */

goog.provide('jsnx.classes.HashMap');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');

/**
 * Class for Hash Map datastructure.
 * 
 * @param {*=}
 *            opt_map HashMap or Object to initialize the map with.
 * @param {...*}
 *            var_args If 2 or more arguments are present then they will be used
 *            as key-value pairs.
 * @constructor
 */
jsnx.classes.HashMap = function(opt_hash) {

    /**
     * Underlying JS object used to implement the map.
     * 
     * @type {!Object}
     * @private
     */
    this.map_ = {};

    /**
     * An array of keys. This is necessary for two reasons: 1. Iterating the
     * keys using for (var key in this.map_) allocates an object for every key
     * in IE which is really bad for IE6 GC perf. 2. Without a side data
     * structure, we would need to escape all the keys as that would be the only
     * way we could tell during iteration if the key was an internal key or a
     * property of the object.
     * 
     * This array can contain deleted keys so it's necessary to check the map as
     * well to see if the key is still in the map (this doesn't require a memory
     * allocation in IE).
     * 
     * @type {!Array.<string>}
     * @private
     */
    this.hashes_ = [];
    
    this.opts_ = {};


    if (opt_hash) {
        this.opts_['hash'] = opt_hash;
    }
};
goog.exportSymbol('jsnx.HashMap', jsnx.classes.HashMap);


/**
 * The number of key value pairs in the map.
 * 
 * @private
 * @type {number}
 */
jsnx.classes.HashMap.prototype.count_ = 0;

/**
 * Version used to detect changes while iterating.
 * 
 * @private
 * @type {number}
 */
jsnx.classes.HashMap.prototype.version_ = 0;

/**
 * @return {number} The number of key-value pairs in the map.
 */
jsnx.classes.HashMap.prototype.getCount = function() {
    return this.count_;
};

/**
 * Returns the values of the map.
 * 
 * @return {!Array} The values in the map.
 */
jsnx.classes.HashMap.prototype.getValues = function() {
    this.cleanupKeysArray_();

    var rv = [];
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        rv.push(this.map_[hash][1]);
    }
    return rv;
};

/**
 * Returns the entries of the map.
 * 
 * @return {!Array.<Array.<*>>} Array of entry pairs.
 */
jsnx.classes.HashMap.prototype.getEntries = function() {
    this.cleanupKeysArray_();

    var rv = [];
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        var entry = this.map_[hash];
        rv.push(entry);
    }
    return rv;
};

/**
 * Returns the keys of the map.
 * 
 * @return {!Array.<string>} Array of string values.
 */
jsnx.classes.HashMap.prototype.getKeys = function() {
    this.cleanupKeysArray_();

    var rv = [];
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        rv.push(this.map_[hash][0]);
    }
    return rv;
};

/**
 * Whether the map contains the given key.
 * 
 * @param {!*}
 *            key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
jsnx.classes.HashMap.prototype.containsKey = function(key) {
    if (goog.isDef(key)){
    var hash = this.keyHash_(key);
    if (Object.prototype.hasOwnProperty.call(this.map_, hash)) {
        return this.map_[hash][0] === key;
    }
    }
    return false;
};

/**
 * Whether the map contains the given value. This is O(n).
 * 
 * @param {*}
 *            val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
jsnx.classes.HashMap.prototype.containsValue = function(val) {
    if (goog.isDef(val)){
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        if (this.hasHash_(this.map_, hash) && this.map_[hash][1] === val) {
            return true;
        }
    }
    }
    return false;
};

/**
 * Whether this map is equal to the argument map.
 * 
 * @param {jsnx.classes.HashMap}
 *            otherMap The map against which to test equality.
 * @param {function(?, ?) :
 *            boolean=} opt_equalityFn Optional equality function to test
 *            equality of values. If not specified, this will test whether the
 *            values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
jsnx.classes.HashMap.prototype.equals = function(otherMap, opt_equalityFn) {
    if (this === otherMap) {
        return true;
    }

    if (this.count_ != otherMap.getCount()) {
        return false;
    }

    var equalityFn = opt_equalityFn || jsnx.classes.HashMap.defaultEquals;

    this.cleanupKeysArray_();
    for ( var hash, i = 0; hash = this.hashes_[i]; i++) {
        var entry = this.map_[hash];
        if (!equalityFn(entry[1], otherMap.get(entry[0]))) {
            return false;
        }
    }

    return true;
};

/**
 * Default equality test for values.
 * 
 * @param {*}
 *            a The first value.
 * @param {*}
 *            b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
jsnx.classes.HashMap.defaultEquals = function(a, b) {
    return a === b;
};

/**
 * @return {boolean} Whether the map is empty.
 */
jsnx.classes.HashMap.prototype.isEmpty = function() {
    return this.count_ == 0;
};

/**
 * Removes all key-value pairs from the map.
 */
jsnx.classes.HashMap.prototype.clear = function() {
    this.map_ = {};
    this.hashes_.length = 0;
    this.count_ = 0;
    this.version_ = 0;
};

/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * 
 * @param {*}
 *            key The key to remove.
 * @return {boolean} Whether object was removed.
 */
jsnx.classes.HashMap.prototype.remove = function(key) {
    var hash = this.keyHash_(key);
    if (this.hasHash_(this.map_, hash)) {
        delete this.map_[hash];
        this.count_--;
        this.version_++;

        // clean up the keys array if the threshhold is hit
        if (this.hashes_.length > 2 * this.count_) {
            this.cleanupKeysArray_();
        }

        return true;
    }
    return false;
};

/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * 
 * @private
 */
jsnx.classes.HashMap.prototype.cleanupKeysArray_ = function() {
    if (this.count_ != this.hashes_.length) {
        // First remove keys that are no longer in the map.
        var srcIndex = 0;
        var destIndex = 0;
        while (srcIndex < this.hashes_.length) {
            var hash = this.hashes_[srcIndex];
            if (this.hasHash_(this.map_, hash)) {
                this.hashes_[destIndex++] = hash;
            }
            srcIndex++;
        }
        this.hashes_.length = destIndex;
    }

    if (this.count_ != this.hashes_.length) {
        // If the count still isn't correct, that means we have duplicates. This
        // can
        // happen when the same key is added and removed multiple times. Now we
        // have
        // to allocate one extra Object to remove the duplicates. This could
        // have
        // been done in the first pass, but in the common case, we can avoid
        // allocating an extra object by only doing this when necessary.
        var seen = {};
        var srcIndex = 0;
        var destIndex = 0;
        while (srcIndex < this.hashes_.length) {
            var hash = this.hashes_[srcIndex];
            if (!(this.hasHash_(seen, hash))) {
                this.hashes_[destIndex++] = hash;
                seen[hash] = 1;
            }
            srcIndex++;
        }
        this.hashes_.length = destIndex;
    }
};

/**
 * Returns the value for the given key. If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * 
 * @param {*}
 *            key The key to get the value for.
 * @param {*=}
 *            opt_val The value to return if no item is found for the given key,
 *            defaults to undefined.
 * @return {*} The value for the given key.
 */
jsnx.classes.HashMap.prototype.get = function(key, opt_val) {
    if (goog.isDef(key)){
    var hash = this.keyHash_(key);
    if (this.hasHash_(this.map_, hash)) {
        var entry = this.map_[hash];
        if (key !== entry[0]){
            throw new Error("Provided key not equal to hashed key");
        }
        return entry[1];
    }
    }
    return opt_val;
};

/**
 * Adds a key-value pair to the map.
 * 
 * @param {!*}
 *            key The key.
 * @param {!*}
 *            value The value to add.
 * @return {*} Some subclasses return a value.
 */
jsnx.classes.HashMap.prototype.set = function(key, value) {
    if (goog.isDef(key)){
    var hash = this.keyHash_(key);
    if (!goog.isDef(value)){
        value = true;
    }
    if (!(this.hasHash_(this.map_, hash))) {
        this.count_++;
        this.hashes_.push(hash);
        // Only change the version if we add a new key.
        this.version_++;
    }
    }
    this.map_[hash] = [key, value];
};

/**
 * Adds multiple key-value pairs from another jsnx.classes.HashMap or Object.
 * 
 * @param {Object}
 *            map Object containing the data to add.
 */
jsnx.classes.HashMap.prototype.addAll = function(map) {
    var keys, values;
    if (map instanceof jsnx.classes.HashMap) {
        keys = map.getKeys();
        values = map.getValues();
    } else if (map instanceof goog.iter.Iterator){
        goog.iter.forEach(map,function(entry){
            this.set(entry[0],entry[1]);
        },this);
        return;
    } else {
        keys = goog.object.getKeys(map);
        values = goog.object.getValues(map);
    }
    // we could use goog.array.forEach here but I don't want to introduce that
    // dependency just for this.
    for ( var i = 0; i < keys.length; i++) {
        this.set(keys[i], values[i]);
    }
};

/**
 * Clones a map and returns a new map.
 * 
 * @return {!jsnx.classes.HashMap} A new map with the same key-value pairs.
 */
jsnx.classes.HashMap.prototype.clone = function() {
    return new jsnx.classes.HashMap(this);
};

/**
 * Returns a new map in which all the keys and values are interchanged (keys
 * become values and values become keys). If multiple keys map to the same
 * value, the chosen transposed value is implementation-dependent.
 * 
 * It acts very similarly to {goog.object.transpose(Object)}.
 * 
 * @return {!jsnx.classes.HashMap} The transposed map.
 */
jsnx.classes.HashMap.prototype.transpose = function() {
    var transposed = new jsnx.classes.HashMap();
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        var entry = this.map_[hash];
        transposed.set(entry[1], entry[0]);
    }

    return transposed;
};

/**
 * @return {!Object} Object representation of the map.
 * @export
 */
/*jsnx.classes.HashMap.prototype.toObject = function() {
    this.cleanupKeysArray_();
    var obj = {};
    for ( var i = 0; i < this.hashes_.length; i++) {
        var hash = this.hashes_[i];
        obj[hash] = this.map_[hash];
    }
    return obj;
};*/
jsnx.classes.HashMap.prototype.toObject = function() {
        var obj = {};
        goog.array.forEach(this.getEntries(),function(entry){
            obj[entry[0]] = 
                (entry[1] instanceof jsnx.classes.HashMap) ? entry[1].toObject() :
                    entry[1];
        });
        return obj;
};

/**
 * Returns an iterator that iterates over the keys in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
jsnx.classes.HashMap.prototype.getKeyIterator = function() {
    return this.__iterator__(true);
};

/**
 * Returns an iterator that iterates over the values in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
jsnx.classes.HashMap.prototype.getValueIterator = function() {
    return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the entries in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
jsnx.classes.HashMap.prototype.getEntryIterator = function() {
    return this.__iterator__(2);
};

/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * 
 * @param {boolean|number=}
 *            opt_type True|1 to iterate over the keys. 
 *            False|0 to iterate over the values.  
 *            Any other value to iterate over entries.
 *            The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
jsnx.classes.HashMap.prototype.__iterator__ = function(opt_type) {
    // Clean up keys to minimize the risk of iterating over dead keys.
    this.cleanupKeysArray_();

    var i = 0;
    var hashes = this.hashes_;
    var map = this.map_;
    var version = this.version_;
    var selfObj = this;

    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
        while (true) {
            if (version != selfObj.version_) {
                throw Error('The map has changed since the iterator was created');
            }
            if (i >= hashes.length) {
                throw goog.iter.StopIteration;
            }
            var hash = hashes[i++];
            var entry = map[hash];
            return opt_type ? (opt_type == 1 ? entry[0] : entry) : entry[1];
        }
    };
    return newIter;
};

/**
 * Safe way to test for hasOwnProperty. It even allows testing for
 * 'hasOwnProperty'.
 * 
 * @param {Object}
 *            obj The object to test for presence of the given key.
 * @param {*}
 *            key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
jsnx.classes.HashMap.prototype.hasHash_ = function(obj, hash) {
    return Object.prototype.hasOwnProperty.call(obj, hash);
};

/**
 * Retrieve a hash key for an object
 * 
 * @param {*}
 *            value to hash
 * @return {string} string hash
 * @private
 */
jsnx.classes.HashMap.prototype.keyHash_ = function(val) {
    var hash = "";

    // Always use a custom hash-function defined for the map
    // Precedence for these two should maybe be reversed
    if (goog.object.containsKey(this.opts_, "hash")) {
        hash = this.opts_['hash'](val);
    } else if (goog.isObject(val)) {
        if (goog.object.containsKey(val, "hash")) {
    
        // Otherwise use an object-oriented hash if it's defined
        if (typeof val['hash'] === "function") {
            hash = val['hash']();
        } else {
            hash = "" + val['hash'];
        }
    } else {
        // hash for objects is a unique id, not "[object Object]"
        // and only "real" objects, not boxed primitives
        if (Object.prototype.toString.call(val) === "[object Object]"
        // but only for objects
        // this could short-circuit for some conditions, but probably slows down more
        //&& typeof val === "object"   
        ) {
            hash = goog.getUid(val);
        }
    } 
    }else {
            // default to the object's toString() if nothing else
            hash = "" + val;
        }
    
    return hash;
};
