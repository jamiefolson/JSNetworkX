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

goog.provide('jsnx.classes.Map');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');

/**
 * Class for Hash Map entry data structure.
 * @param {*} key A value to use as the entry's key.
 * @param {*} value A value to use as the entry's value.
 * @constructor
 * @struct
 */
jsnx.classes.Map.Entry = function(key, value){
    this.key = key;
    this.value = value;
};
goog.exportSymbol('jsnx.Map.Entry', jsnx.classes.Map.Entry);

/**
 * Class for Hash Map datastructure.
 * 
 * @param {*=}
 *            opt_map Map or Object to initialize the map with.
 * @constructor
 */
jsnx.classes.Map = function(map_opts) {

    
    /**
     * Underlying JS object used to implement the map.
     * 
     * @type {!Object}
     * @private
     */
    this.map_ = /* Object.<string, Array.<jsnx.classes.Map.Entry>>*/{};

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
    this.keys_ = /* Array*/ [];

    this.opts_ = {'equality' : 'hash'};

    if (map_opts) {
        if (map_opts instanceof jsnx.classes.Map){
            this.opts_.extend(opt_map.opts_);
        }else {
            this.opts_.extend(opt_map);
        }
    }
};
goog.exportSymbol('jsnx.Map', jsnx.classes.Map);
//Could do this, but need to override everything, so it seems easier not to for now
//goog.inherits(jsnx.classes.Map, goog.structs.Map); 


/**
 * The number of key value pairs in the map.
 * 
 * @private
 * @type {number}
 */
jsnx.classes.Map.prototype.count_ = 0;

/**
 * Version used to detect changes while iterating.
 * 
 * @private
 * @type {number}
 */
jsnx.classes.Map.prototype.version_ = 0;


/**
 * @return {number} The number of key-value pairs in the map.
 */
jsnx.classes.Map.prototype.getCount = function() {
    return this.count_;
};

/**
 * Returns the values of the map.
 * 
 * @return {!Array} The values in the map.
 */
jsnx.classes.Map.prototype.getValues = function() {
    this.cleanupKeysArray_();

    /**
    var rv = [];
    for ( var i = 0; i < this.keys_.length; i++) {
        var key = this.keys_[i];
        goog.array.concat(rv,this.map_[key]);
    }
    return rv;*/
    return goog.iter.toArray(this.getValueIterator());
};

/**
 * Returns the keys of the map.
 * 
 * @return {!Array.<*>} Array of string values.
 */
jsnx.classes.Map.prototype.getKeys = function() {
    this.cleanupKeysArray_();
    return /** @type {!Array.<*>} */
    (this.keys_.concat());
};

/**
 * Whether the map contains the given key.
 * 
 * @param {*}
 *            key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
jsnx.classes.Map.prototype.containsKey = function(key) {
    return this.hasKey_(this.map_, key);
};

/**
 * Whether the map contains the given value. This is O(n).
 * 
 * @param {*}
 *            val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
jsnx.classes.Map.prototype.containsValue = function(val) {
    /**for ( var i = 0; i < this.keys_.length; i++) {
        var key = this.keys_[i];
        if (jsnx.classes.Map.hasKey_(this.map_, key) && this.get(key) === val) {
            return true;
        }
    }
        return false;*/
    return goog.iter.some(this.getValueIterator(),
            function(other){ return other === val;});
};

/**
 * Whether this map is equal to the argument map.
 * 
 * @param {jsnx.classes.Map}
 *            otherMap The map against which to test equality.
 * @param {function(?, ?) :
 *            boolean=} opt_equalityFn Optional equality function to test
 *            equality of values. If not specified, this will test whether the
 *            values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
jsnx.classes.Map.prototype.equals = function(otherMap, opt_equalityFn) {
    if (this === otherMap) {
        return true;
    }

    if (this.count_ != otherMap.getCount()) {
        return false;
    }

    var equalityFn = opt_equalityFn || jsnx.classes.Map.identityTest;

    this.cleanupKeysArray_();
    for ( var key, i = 0; key = this.keys_[i]; i++) {
        if (!equalityFn(this.get(key), otherMap.get(key))) {
            return false;
        }
    }

    return true;
};



/**
 * @return {boolean} Whether the map is empty.
 */
jsnx.classes.Map.prototype.isEmpty = function() {
    return this.count_ == 0;
};

/**
 * Removes all key-value pairs from the map.
 */
jsnx.classes.Map.prototype.clear = function() {
    this.map_ = /*Object.<string,Array.<jsnx.classes.Map.Entry>>*/{};
    this.keys_.length = 0;
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
jsnx.classes.Map.prototype.remove = function(key) {
    return this.remove_(this.map_,key);
};

jsnx.classes.Map.prototype.remove_ = function(obj,key) {
    if (jsnx.classes.Map.hasKey_(obj, key)) {
        var hash = this.keyHash(key);
        var idx = goog.array.findIndex(obj[hash],
                jsnx.classes.Map.getKeyEquals(key));
        delete obj[hash][idx];
        this.count_--;
        this.version_++;

        // clean up the keys array if the threshhold is hit
        if (this.keys_.length > 2 * this.count_) {
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
jsnx.classes.Map.prototype.cleanupKeysArray_ = function() {
    if (this.count_ != this.keys_.length) {
        // First remove keys that are no longer in the map.
        var srcIndex = 0;
        var destIndex = 0;
        while (srcIndex < this.keys_.length) {
            var key = this.keys_[srcIndex];
            if (this.hasKey_(this.map_, key)) {
                this.keys_[destIndex++] = key;
            }
            srcIndex++;
        }
        this.keys_.length = destIndex;
    }

    if (this.count_ != this.keys_.length) {
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
        while (srcIndex < this.keys_.length) {
            var key = this.keys_[srcIndex];
            if (!(this.hasKey_(seen, key))) {
                this.keys_[destIndex++] = key;
                this.set_(seen,key,1);
            }
            srcIndex++;
        }
        this.keys_.length = destIndex;
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
jsnx.classes.Map.prototype.get = function(key, opt_val) {
    return jsnx.classes.Map.get_(this.map_,key,opt_val);
};

jsnx.classes.Map.prototype.get_ = function(obj,key,opt_val){
    if (jsnx.classes.Map.hasKey_(obj, key)) {
        var isEqual = this.getEqualityTest(key);
        var entry = goog.array.find(obj[this.keyHash(key)],
                function(entry){return isEqual(entry.key);});
        return entry == null ? null : entry.value;
    }
    return opt_val;
};

/**
 * Adds a key-value pair to the map.
 * 
 * @param {*}
 *            key The key.
 * @param {*}
 *            value The value to add.
 * @return {*} Some subclasses return a value.
 */
jsnx.classes.Map.prototype.set = function(key, value) {
    if (this.set_(this.map_,key,value)){
        this.keys_.push(key);
        // Only change the version if we add a new key.
        this.count_++;
        this.version_++;    
    };
};

/**
 * Adds a key-value pair to the map.
 * 
 * @param {Object} 
 *            obj The Object containing the hashed objects
 * @param {*}
 *            key The key.
 * @param {*}
 *            value The value to add.
 * @return {boolean} Whether or not the key's hash existed in the object.
 */
jsnx.classes.Map.prototype.set_ = function(obj,key, value) {
    var entry = new jsnx.classes.Map.Entry(key,value);
    if (this.hasKey_(obj, key)) {
        obj[key].push(entry);
        return false;
    }else {
        obj[key] = [entry];
        return true;
    }
};

/**
 * Adds multiple key-value pairs from another jsnx.classes.Map or Object.
 * 
 * @param {Object}
 *            map Object containing the data to add.
 */
jsnx.classes.Map.prototype.addAll = function(map) {
    var keys, values;
    if (map instanceof jsnx.classes.Map) {
        keys = map.getKeys();
        values = map.getValues();
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
 * @return {!jsnx.classes.Map} A new map with the same key-value pairs.
 */
jsnx.classes.Map.prototype.clone = function() {
    var map = new jsnx.classes.Map(this);
    map.addAll(this);
    return map;
};

/**
 * Returns a new map in which all the keys and values are interchanged (keys
 * become values and values become keys). If multiple keys map to the same
 * value, the chosen transposed value is implementation-dependent.
 * 
 * It acts very similarly to {goog.object.transpose(Object)}.
 * 
 * @return {!jsnx.classes.Map} The transposed map.
 */
jsnx.classes.Map.prototype.transpose = function() {
    var transposed = new jsnx.classes.Map();
    // this might not be as fast as explicit looping
    goog.iter.forEach(this.getEntryIterator(),
            function(entry){
                transposed.set(entry.value,entry.key);
    });

    return transposed;
};

/**
 * @return {!Object} Object representation of the map.
 */
jsnx.classes.Map.prototype.toObject = function() {
    this.cleanupKeysArray_();
    var obj = {};
    for ( var i = 0; i < this.keys_.length; i++) {
        var key = this.keys_[i];
        obj[key] = this.map_[key];
    }
    return obj;
};

/**
 * Returns an iterator that iterates over the keys in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
jsnx.classes.Map.prototype.getKeyIterator = function() {
    return this.__iterator__(1);
};

/**
 * Returns an iterator that iterates over the values in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
jsnx.classes.Map.prototype.getValueIterator = function() {
    return this.__iterator__(2);
};


/**
 * Returns an iterator that iterates over the entries in the map. Removal of keys
 * while iterating might have undesired side effects.
 * 
 * @return {!goog.iter.Iterator.<jsnx.classes.Map.Entry>} An iterator over the values in the map.
 */
jsnx.classes.Map.prototype.getEntryIterator = function() {
    return this.__iterator__(3);
};
/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * 
 * @param {number=}
 *            opt_type 1 to iterate over the keys. 2 to iterate over the
 *            values. 3 to iterate over entries. The default value is 2.
 *            
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
jsnx.classes.Map.prototype.__iterator__ = function(opt_type) {
    // Clean up keys to minimize the risk of iterating over dead keys.
    this.cleanupKeysArray_();

    var iter_type = (arguments.length === 0) ? 2 : opt_type;

    var i = 0;
    var keys = this.keys_;
    var visited = {};
    var map = this.map_;
    var version = this.version_;
    var selfObj = this;

    var newIter = new goog.iter.Iterator;
    var entryIter = null;
    newIter.next = function() {
        var result = null;
        while (true) {
            if (version != selfObj.version_) {
                throw Error('The map has changed since the iterator was created');
            }
            try {
                result = entryIter.next();
                return result;
            } catch (e) {
                if (i >= keys.length) {
                    throw goog.iter.StopIteration;
                }
                var key = keys[i++];
                var hash = this.keyHash(key);
                if (!(hash in visited)) {
                    visited[hash] = true;
                    switch (iter_type) {
                        case 1: entryIter = goog.iter.map(goog.iter.toIterator(map[hash]),
                            function(elem){
                                return elem.key;
                            });
                            break;
                        case 2: entryIter = goog.iter.map(goog.iter.toIterator(map[hash]),
                                function(elem){
                            return elem.value;
                        });
                        break;
                        case 3: entryIter = goog.iter.toIterator(map[hash]);
                        break;
                        default:
                            throw Error("Invalid iterator opt_type");
                    }
                }
            }
        }
    };
    return newIter;
};

/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object.<string,Array.<jsnx.classes.Map.Entry>>} obj 
 *              The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
jsnx.classes.Map.prototype.hasKey_ = function(obj, key) {
    var equality_type = this.opts_['equality'];

    var hash = this.keyHash(key);
    if (Object.prototype.hasOwnProperty.call(obj, hash)){
        if (equality_type === 'hash'){ // handle hash equality here
            return goog.isDefAndNotNull(obj[hash]) && obj[hash].length > 0;
        }else { // handle any other equality in getEqualityTest
        var isEqual = this.getEqualityTest(key);
        if (goog.array.some(obj[hash],function(entry){return isEqual(entry.key);})){
            return true;
        }
        }
    }
    return false;
};


/**
 * Retrieve a hash key for an object
 * @param {*} value to hash
 * @return {string} string hash
 * @export
 */
jsnx.classes.Map.prototype.keyHash = function (val){
    var hash = "";
    // Always use an object-oriented hash if it's defined
    if (goog.object.containsKey(val, "hash")) {
        if (typeof val['hash'] === "function"){
            hash = val['hash']();
        }else {
            hash = ""+val['hash'];
        }
    }else if (goog.object.containsKey(this.opts_,"hash")){
        // Otherwise use a custom hash-function defined for the map
        // Precedence for these two should maybe be reversed
        hash = this.opts_['hash'](val);
    }else {
        // for identity equality, hash for objects is a unique id, not "[object Object]"
        if (this.opts_['equality'] === 'identity' 
            // but only for objects
            // this could short-circuit for some conditions, but probably slows down more
            //&& typeof val === "object"   
            // and only "real" objects, not boxed primitives
            && Object.prototype.toString.call(val) === "[object Object]"){ 
            hash = goog.getUid(val);
        }else {
            // default to the object's toString() if nothing else
            hash = ""+val;
        }
    }
    return hash;
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
jsnx.classes.Map.identityTest = function(a, b) {
    return a === b;
};

/**
 * Make an equality comparison using val.equals function
 * @param {*} val Value to do compare
 * @param {*} other Value to be compared
 * @return {boolean} Whether the objects are equal
 * 
 */
jsnx.classes.Map.customEqualityTest = function(val,other){
    return val['equals'](other);
};

/**
 * Make an equality comparison using val.equals function
 * @param {*} val Value to do compare
 * @param {*} other Value to be compared
 * @return {function} Function to test whether an object is equal to val
 * 
 */
jsnx.classes.Map.getCustomEqualityTest = function(val){
    var f = val['equals'];
    return function(other){return f.call(val,other);};
};


/**
 * Make an equality comparison using object properties function
 * @param {*} val Value to do compare
 * @param {*} other Value to be compared
 * @return {boolean} Whether the objects are equal
 * 
 */
jsnx.classes.Map.structEqualityTest = function(val,other){
    return getStructEqualityTest(val)(other);
};

/**
 * Make an equality comparison using object properties function
 * @param {*} val Value to do compare
 * @return {function} Function to test whether an objects are equal
 * 
 */
jsnx.classes.Map.getStructEqualityTest = function(val){
    var valkeys = goog.object.createSet(goog.object.getKeys(val));
    return function(other) {
        for ( var key in goog.object.getKeys(other)) {
            if (!goog.object.containsKey(valkeys, key)) {
                return false;
            }
            delete valkeys[key];
            var thisval = val[key], otherval = other[key];
            if (!((thisval === otherval) || typeof thisval === "object"
                    && equalityTest(thisval, otherval))) {
                return false;
            }
        }
        if (!goog.object.isEmpty(valkeys)) {
            return false;
        }
        return true;
    };
};



/**
 * Get an function to test values for equality to val
 * @param {*} value to do compare
 * @return {function} Function to compute whether the objects are equal
 * 
 */
jsnx.classes.Map.prototype.getEqualityTest = function (val){
    
    if (goog.object.containsKey(val, 'equals')) {
        if (typeof val['equals'] === "function"){
            return return jsnx.classes.Map.getCustomEqualityTest(val);
        };
    }
    if (typeof val === "object" && this.structCompare) {
        return jsnx.classes.Map.getStructEqualityTest(val);
    }
    return function(other){return jsnx.classes.Map.identityTest(val,other);};
};