// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/idb-keyval/dist/idb-keyval.mjs":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.set = set;
exports.del = del;
exports.clear = clear;
exports.keys = keys;
exports.Store = void 0;

class Store {
  constructor(dbName = 'keyval-store', storeName = 'keyval') {
    this.storeName = storeName;
    this._dbp = new Promise((resolve, reject) => {
      const openreq = indexedDB.open(dbName, 1);

      openreq.onerror = () => reject(openreq.error);

      openreq.onsuccess = () => resolve(openreq.result); // First time setup: create an empty object store


      openreq.onupgradeneeded = () => {
        openreq.result.createObjectStore(storeName);
      };
    });
  }

  _withIDBStore(type, callback) {
    return this._dbp.then(db => new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, type);

      transaction.oncomplete = () => resolve();

      transaction.onabort = transaction.onerror = () => reject(transaction.error);

      callback(transaction.objectStore(this.storeName));
    }));
  }

}

exports.Store = Store;
let store;

function getDefaultStore() {
  if (!store) store = new Store();
  return store;
}

function get(key, store = getDefaultStore()) {
  let req;
  return store._withIDBStore('readonly', store => {
    req = store.get(key);
  }).then(() => req.result);
}

function set(key, value, store = getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.put(value, key);
  });
}

function del(key, store = getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.delete(key);
  });
}

function clear(store = getDefaultStore()) {
  return store._withIDBStore('readwrite', store => {
    store.clear();
  });
}

function keys(store = getDefaultStore()) {
  const keys = [];
  return store._withIDBStore('readonly', store => {
    // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
    // And openKeyCursor isn't supported by Safari.
    (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
      if (!this.result) return;
      keys.push(this.result.key);
      this.result.continue();
    };
  }).then(() => keys);
}
},{}],"../node_modules/tesseract.js-utils/src/common/browser/cache.js":[function(require,module,exports) {
const { set, get, del } = require('idb-keyval');

module.exports = {
  readCache: get,
  writeCache: set,
  deleteCache: del,
  checkCache: path => (
    get(path)
      .then(v => typeof v !== 'undefined')
  ),
};

},{"idb-keyval":"../node_modules/idb-keyval/dist/idb-keyval.mjs"}],"../node_modules/tesseract.js-utils/node_modules/is-url/index.js":[function(require,module,exports) {

/**
 * Expose `isUrl`.
 */

module.exports = isUrl;

/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */

var protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;

var localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/
var nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isUrl(string){
  if (typeof string !== 'string') {
    return false;
  }

  var match = string.match(protocolAndDomainRE);
  if (!match) {
    return false;
  }

  var everythingAfterProtocol = match[1];
  if (!everythingAfterProtocol) {
    return false;
  }

  if (localhostDomainRE.test(everythingAfterProtocol) ||
      nonLocalhostDomainRE.test(everythingAfterProtocol)) {
    return true;
  }

  return false;
}

},{}],"../node_modules/tesseract.js-utils/src/loadLang.js":[function(require,module,exports) {
const isURL = require('is-url');

const handleLang = modules => ({
  TessModule,
  dataPath,
  cachePath,
  cacheMethod,
  lang
}) => data => {
  if (TessModule) {
    if (dataPath) {
      try {
        TessModule.FS.mkdir(dataPath);
      } catch (err) {// TODO: Do some error handling here.
      }
    }

    TessModule.FS.writeFile(`${dataPath || '.'}/${lang}.traineddata`, data);
  }

  if (['write', 'refresh', undefined].includes(cacheMethod)) {
    return modules.writeCache(`${cachePath || '.'}/${lang}.traineddata`, data).then(() => data);
  }

  return data;
};

const loadAndGunzipFile = modules => ({
  langPath,
  cachePath,
  cacheMethod,
  ...options
}) => lang => {
  let {
    readCache
  } = modules;

  if (['refresh', 'none'].includes(cacheMethod)) {
    readCache = () => Promise.resolve();
  }

  return readCache(`${cachePath || '.'}/${lang}.traineddata`).then(data => {
    if (typeof data === 'undefined') {
      return Promise.reject();
    }

    return handleLang(modules)({
      cachePath,
      cacheMethod,
      lang,
      ...options
    })(data);
  }).catch(() => {
    const fetchTrainedData = iLangPath => modules.fetch(`${iLangPath}/${lang}.traineddata.gz`).then(resp => resp.arrayBuffer()).then(buf => modules.gunzip(new Uint8Array(buf))).then(handleLang(modules)({
      cachePath,
      cacheMethod,
      lang,
      ...options
    }));
    /** When langPath is an URL, just do the fetch */


    if (isURL(langPath)) {
      return fetchTrainedData(langPath);
    }
    /** When langPath is not an URL in browser environment */


    if (true) {
      return fetchTrainedData(modules.resolveURL(langPath));
    }
    /** When langPath is not an URL in Node.js environment */


    return modules.readCache(`${langPath}/${lang}.traineddata.gz`).then(buf => modules.gunzip(new Uint8Array(buf))).then(handleLang(modules)({
      cachePath,
      cacheMethod,
      lang,
      ...options
    }));
  });
};
/**
 *
 * @name loadLang
 * @function load language(s) from local cache, download from remote if not in cache.
 * @param {object} options
 * @param {string} options.lang - langs to load, use '+' for multiple languages, ex: eng+chi_tra
 * @param {object} options.TessModule - TesseractModule
 * @param {string} options.langPath - prefix path for downloading lang file
 * @param {string} options.cachePath - path to find cache
 * @param {string} options.dataPath - path to store data in mem
 * @param {string} options.cacheMethod -
 *     method of cache invaliation, should one of following options:
 *       write: read cache and write back (default method)
 *       readOnly: read cache and not to write back
 *       refresh: not to read cache and write back
 *       none: not to read cache and not to write back
 *
 */


module.exports = modules => ({
  lang: langs,
  ...options
}) => Promise.all(langs.split('+').map(loadAndGunzipFile(modules)(options)));
},{"is-url":"../node_modules/tesseract.js-utils/node_modules/is-url/index.js"}],"../node_modules/tesseract.js-utils/src/common/browser/fetch.js":[function(require,module,exports) {
module.exports = fetch.bind();

},{}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/process/browser.js":[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};
},{}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/base64-js/index.js":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/ieee754/index.js":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/isarray/index.js":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"../../../../../../../home/exqt/.config/yarn/global/node_modules/base64-js/index.js","ieee754":"../../../../../../../home/exqt/.config/yarn/global/node_modules/ieee754/index.js","isarray":"../../../../../../../home/exqt/.config/yarn/global/node_modules/isarray/index.js","buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/zlibjs/bin/node-zlib.js":[function(require,module,exports) {
var process = require("process");
var Buffer = require("buffer").Buffer;
/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function q(b){throw b;}var t=void 0,v=!0;var B="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function G(b,a){this.index="number"===typeof a?a:0;this.m=0;this.buffer=b instanceof(B?Uint8Array:Array)?b:new (B?Uint8Array:Array)(32768);2*this.buffer.length<=this.index&&q(Error("invalid index"));this.buffer.length<=this.index&&this.f()}G.prototype.f=function(){var b=this.buffer,a,c=b.length,d=new (B?Uint8Array:Array)(c<<1);if(B)d.set(b);else for(a=0;a<c;++a)d[a]=b[a];return this.buffer=d};
G.prototype.d=function(b,a,c){var d=this.buffer,e=this.index,f=this.m,g=d[e],k;c&&1<a&&(b=8<a?(I[b&255]<<24|I[b>>>8&255]<<16|I[b>>>16&255]<<8|I[b>>>24&255])>>32-a:I[b]>>8-a);if(8>a+f)g=g<<a|b,f+=a;else for(k=0;k<a;++k)g=g<<1|b>>a-k-1&1,8===++f&&(f=0,d[e++]=I[g],g=0,e===d.length&&(d=this.f()));d[e]=g;this.buffer=d;this.m=f;this.index=e};G.prototype.finish=function(){var b=this.buffer,a=this.index,c;0<this.m&&(b[a]<<=8-this.m,b[a]=I[b[a]],a++);B?c=b.subarray(0,a):(b.length=a,c=b);return c};
var aa=new (B?Uint8Array:Array)(256),L;for(L=0;256>L;++L){for(var R=L,ba=R,ca=7,R=R>>>1;R;R>>>=1)ba<<=1,ba|=R&1,--ca;aa[L]=(ba<<ca&255)>>>0}var I=aa;function ha(b,a,c){var d,e="number"===typeof a?a:a=0,f="number"===typeof c?c:b.length;d=-1;for(e=f&7;e--;++a)d=d>>>8^S[(d^b[a])&255];for(e=f>>3;e--;a+=8)d=d>>>8^S[(d^b[a])&255],d=d>>>8^S[(d^b[a+1])&255],d=d>>>8^S[(d^b[a+2])&255],d=d>>>8^S[(d^b[a+3])&255],d=d>>>8^S[(d^b[a+4])&255],d=d>>>8^S[(d^b[a+5])&255],d=d>>>8^S[(d^b[a+6])&255],d=d>>>8^S[(d^b[a+7])&255];return(d^4294967295)>>>0}
var ia=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,
2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,
2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,
2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,
3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,
936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],S=B?new Uint32Array(ia):ia;function ja(){};function ka(b){this.buffer=new (B?Uint16Array:Array)(2*b);this.length=0}ka.prototype.getParent=function(b){return 2*((b-2)/4|0)};ka.prototype.push=function(b,a){var c,d,e=this.buffer,f;c=this.length;e[this.length++]=a;for(e[this.length++]=b;0<c;)if(d=this.getParent(c),e[c]>e[d])f=e[c],e[c]=e[d],e[d]=f,f=e[c+1],e[c+1]=e[d+1],e[d+1]=f,c=d;else break;return this.length};
ka.prototype.pop=function(){var b,a,c=this.buffer,d,e,f;a=c[0];b=c[1];this.length-=2;c[0]=c[this.length];c[1]=c[this.length+1];for(f=0;;){e=2*f+2;if(e>=this.length)break;e+2<this.length&&c[e+2]>c[e]&&(e+=2);if(c[e]>c[f])d=c[f],c[f]=c[e],c[e]=d,d=c[f+1],c[f+1]=c[e+1],c[e+1]=d;else break;f=e}return{index:b,value:a,length:this.length}};function T(b){var a=b.length,c=0,d=Number.POSITIVE_INFINITY,e,f,g,k,h,m,r,p,l,n;for(p=0;p<a;++p)b[p]>c&&(c=b[p]),b[p]<d&&(d=b[p]);e=1<<c;f=new (B?Uint32Array:Array)(e);g=1;k=0;for(h=2;g<=c;){for(p=0;p<a;++p)if(b[p]===g){m=0;r=k;for(l=0;l<g;++l)m=m<<1|r&1,r>>=1;n=g<<16|p;for(l=m;l<e;l+=h)f[l]=n;++k}++g;k<<=1;h<<=1}return[f,c,d]};function na(b,a){this.k=oa;this.F=0;this.input=B&&b instanceof Array?new Uint8Array(b):b;this.b=0;a&&(a.lazy&&(this.F=a.lazy),"number"===typeof a.compressionType&&(this.k=a.compressionType),a.outputBuffer&&(this.a=B&&a.outputBuffer instanceof Array?new Uint8Array(a.outputBuffer):a.outputBuffer),"number"===typeof a.outputIndex&&(this.b=a.outputIndex));this.a||(this.a=new (B?Uint8Array:Array)(32768))}var oa=2,pa={NONE:0,L:1,t:oa,X:3},qa=[],U;
for(U=0;288>U;U++)switch(v){case 143>=U:qa.push([U+48,8]);break;case 255>=U:qa.push([U-144+400,9]);break;case 279>=U:qa.push([U-256+0,7]);break;case 287>=U:qa.push([U-280+192,8]);break;default:q("invalid literal: "+U)}
na.prototype.h=function(){var b,a,c,d,e=this.input;switch(this.k){case 0:c=0;for(d=e.length;c<d;){a=B?e.subarray(c,c+65535):e.slice(c,c+65535);c+=a.length;var f=a,g=c===d,k=t,h=t,m=t,r=t,p=t,l=this.a,n=this.b;if(B){for(l=new Uint8Array(this.a.buffer);l.length<=n+f.length+5;)l=new Uint8Array(l.length<<1);l.set(this.a)}k=g?1:0;l[n++]=k|0;h=f.length;m=~h+65536&65535;l[n++]=h&255;l[n++]=h>>>8&255;l[n++]=m&255;l[n++]=m>>>8&255;if(B)l.set(f,n),n+=f.length,l=l.subarray(0,n);else{r=0;for(p=f.length;r<p;++r)l[n++]=
f[r];l.length=n}this.b=n;this.a=l}break;case 1:var s=new G(B?new Uint8Array(this.a.buffer):this.a,this.b);s.d(1,1,v);s.d(1,2,v);var u=ra(this,e),w,C,x;w=0;for(C=u.length;w<C;w++)if(x=u[w],G.prototype.d.apply(s,qa[x]),256<x)s.d(u[++w],u[++w],v),s.d(u[++w],5),s.d(u[++w],u[++w],v);else if(256===x)break;this.a=s.finish();this.b=this.a.length;break;case oa:var D=new G(B?new Uint8Array(this.a.buffer):this.a,this.b),M,z,N,X,Y,qb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],da,Fa,ea,Ga,la,ta=Array(19),
Ha,Z,ma,E,Ia;M=oa;D.d(1,1,v);D.d(M,2,v);z=ra(this,e);da=sa(this.U,15);Fa=ua(da);ea=sa(this.T,7);Ga=ua(ea);for(N=286;257<N&&0===da[N-1];N--);for(X=30;1<X&&0===ea[X-1];X--);var Ja=N,Ka=X,K=new (B?Uint32Array:Array)(Ja+Ka),y,O,A,fa,J=new (B?Uint32Array:Array)(316),H,F,P=new (B?Uint8Array:Array)(19);for(y=O=0;y<Ja;y++)K[O++]=da[y];for(y=0;y<Ka;y++)K[O++]=ea[y];if(!B){y=0;for(fa=P.length;y<fa;++y)P[y]=0}y=H=0;for(fa=K.length;y<fa;y+=O){for(O=1;y+O<fa&&K[y+O]===K[y];++O);A=O;if(0===K[y])if(3>A)for(;0<A--;)J[H++]=
0,P[0]++;else for(;0<A;)F=138>A?A:138,F>A-3&&F<A&&(F=A-3),10>=F?(J[H++]=17,J[H++]=F-3,P[17]++):(J[H++]=18,J[H++]=F-11,P[18]++),A-=F;else if(J[H++]=K[y],P[K[y]]++,A--,3>A)for(;0<A--;)J[H++]=K[y],P[K[y]]++;else for(;0<A;)F=6>A?A:6,F>A-3&&F<A&&(F=A-3),J[H++]=16,J[H++]=F-3,P[16]++,A-=F}b=B?J.subarray(0,H):J.slice(0,H);la=sa(P,7);for(E=0;19>E;E++)ta[E]=la[qb[E]];for(Y=19;4<Y&&0===ta[Y-1];Y--);Ha=ua(la);D.d(N-257,5,v);D.d(X-1,5,v);D.d(Y-4,4,v);for(E=0;E<Y;E++)D.d(ta[E],3,v);E=0;for(Ia=b.length;E<Ia;E++)if(Z=
b[E],D.d(Ha[Z],la[Z],v),16<=Z){E++;switch(Z){case 16:ma=2;break;case 17:ma=3;break;case 18:ma=7;break;default:q("invalid code: "+Z)}D.d(b[E],ma,v)}var La=[Fa,da],Ma=[Ga,ea],Q,Na,ga,wa,Oa,Pa,Qa,Ra;Oa=La[0];Pa=La[1];Qa=Ma[0];Ra=Ma[1];Q=0;for(Na=z.length;Q<Na;++Q)if(ga=z[Q],D.d(Oa[ga],Pa[ga],v),256<ga)D.d(z[++Q],z[++Q],v),wa=z[++Q],D.d(Qa[wa],Ra[wa],v),D.d(z[++Q],z[++Q],v);else if(256===ga)break;this.a=D.finish();this.b=this.a.length;break;default:q("invalid compression type")}return this.a};
function va(b,a){this.length=b;this.N=a}
var xa=function(){function b(a){switch(v){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,
a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:q("invalid length: "+a)}}var a=[],c,d;for(c=3;258>=c;c++)d=b(c),a[c]=d[2]<<24|d[1]<<
16|d[0];return a}(),ya=B?new Uint32Array(xa):xa;
function ra(b,a){function c(a,c){var b=a.N,d=[],f=0,e;e=ya[a.length];d[f++]=e&65535;d[f++]=e>>16&255;d[f++]=e>>24;var g;switch(v){case 1===b:g=[0,b-1,0];break;case 2===b:g=[1,b-2,0];break;case 3===b:g=[2,b-3,0];break;case 4===b:g=[3,b-4,0];break;case 6>=b:g=[4,b-5,1];break;case 8>=b:g=[5,b-7,1];break;case 12>=b:g=[6,b-9,2];break;case 16>=b:g=[7,b-13,2];break;case 24>=b:g=[8,b-17,3];break;case 32>=b:g=[9,b-25,3];break;case 48>=b:g=[10,b-33,4];break;case 64>=b:g=[11,b-49,4];break;case 96>=b:g=[12,b-
65,5];break;case 128>=b:g=[13,b-97,5];break;case 192>=b:g=[14,b-129,6];break;case 256>=b:g=[15,b-193,6];break;case 384>=b:g=[16,b-257,7];break;case 512>=b:g=[17,b-385,7];break;case 768>=b:g=[18,b-513,8];break;case 1024>=b:g=[19,b-769,8];break;case 1536>=b:g=[20,b-1025,9];break;case 2048>=b:g=[21,b-1537,9];break;case 3072>=b:g=[22,b-2049,10];break;case 4096>=b:g=[23,b-3073,10];break;case 6144>=b:g=[24,b-4097,11];break;case 8192>=b:g=[25,b-6145,11];break;case 12288>=b:g=[26,b-8193,12];break;case 16384>=
b:g=[27,b-12289,12];break;case 24576>=b:g=[28,b-16385,13];break;case 32768>=b:g=[29,b-24577,13];break;default:q("invalid distance")}e=g;d[f++]=e[0];d[f++]=e[1];d[f++]=e[2];var h,k;h=0;for(k=d.length;h<k;++h)l[n++]=d[h];u[d[0]]++;w[d[3]]++;s=a.length+c-1;p=null}var d,e,f,g,k,h={},m,r,p,l=B?new Uint16Array(2*a.length):[],n=0,s=0,u=new (B?Uint32Array:Array)(286),w=new (B?Uint32Array:Array)(30),C=b.F,x;if(!B){for(f=0;285>=f;)u[f++]=0;for(f=0;29>=f;)w[f++]=0}u[256]=1;d=0;for(e=a.length;d<e;++d){f=k=0;
for(g=3;f<g&&d+f!==e;++f)k=k<<8|a[d+f];h[k]===t&&(h[k]=[]);m=h[k];if(!(0<s--)){for(;0<m.length&&32768<d-m[0];)m.shift();if(d+3>=e){p&&c(p,-1);f=0;for(g=e-d;f<g;++f)x=a[d+f],l[n++]=x,++u[x];break}0<m.length?(r=za(a,d,m),p?p.length<r.length?(x=a[d-1],l[n++]=x,++u[x],c(r,0)):c(p,-1):r.length<C?p=r:c(r,0)):p?c(p,-1):(x=a[d],l[n++]=x,++u[x])}m.push(d)}l[n++]=256;u[256]++;b.U=u;b.T=w;return B?l.subarray(0,n):l}
function za(b,a,c){var d,e,f=0,g,k,h,m,r=b.length;k=0;m=c.length;a:for(;k<m;k++){d=c[m-k-1];g=3;if(3<f){for(h=f;3<h;h--)if(b[d+h-1]!==b[a+h-1])continue a;g=f}for(;258>g&&a+g<r&&b[d+g]===b[a+g];)++g;g>f&&(e=d,f=g);if(258===g)break}return new va(f,a-e)}
function sa(b,a){var c=b.length,d=new ka(572),e=new (B?Uint8Array:Array)(c),f,g,k,h,m;if(!B)for(h=0;h<c;h++)e[h]=0;for(h=0;h<c;++h)0<b[h]&&d.push(h,b[h]);f=Array(d.length/2);g=new (B?Uint32Array:Array)(d.length/2);if(1===f.length)return e[d.pop().index]=1,e;h=0;for(m=d.length/2;h<m;++h)f[h]=d.pop(),g[h]=f[h].value;k=Aa(g,g.length,a);h=0;for(m=f.length;h<m;++h)e[f[h].index]=k[h];return e}
function Aa(b,a,c){function d(b){var c=h[b][m[b]];c===a?(d(b+1),d(b+1)):--g[c];++m[b]}var e=new (B?Uint16Array:Array)(c),f=new (B?Uint8Array:Array)(c),g=new (B?Uint8Array:Array)(a),k=Array(c),h=Array(c),m=Array(c),r=(1<<c)-a,p=1<<c-1,l,n,s,u,w;e[c-1]=a;for(n=0;n<c;++n)r<p?f[n]=0:(f[n]=1,r-=p),r<<=1,e[c-2-n]=(e[c-1-n]/2|0)+a;e[0]=f[0];k[0]=Array(e[0]);h[0]=Array(e[0]);for(n=1;n<c;++n)e[n]>2*e[n-1]+f[n]&&(e[n]=2*e[n-1]+f[n]),k[n]=Array(e[n]),h[n]=Array(e[n]);for(l=0;l<a;++l)g[l]=c;for(s=0;s<e[c-1];++s)k[c-
1][s]=b[s],h[c-1][s]=s;for(l=0;l<c;++l)m[l]=0;1===f[c-1]&&(--g[0],++m[c-1]);for(n=c-2;0<=n;--n){u=l=0;w=m[n+1];for(s=0;s<e[n];s++)u=k[n+1][w]+k[n+1][w+1],u>b[l]?(k[n][s]=u,h[n][s]=a,w+=2):(k[n][s]=b[l],h[n][s]=l,++l);m[n]=0;1===f[n]&&d(n)}return g}
function ua(b){var a=new (B?Uint16Array:Array)(b.length),c=[],d=[],e=0,f,g,k,h;f=0;for(g=b.length;f<g;f++)c[b[f]]=(c[b[f]]|0)+1;f=1;for(g=16;f<=g;f++)d[f]=e,e+=c[f]|0,e<<=1;f=0;for(g=b.length;f<g;f++){e=d[b[f]];d[b[f]]+=1;k=a[f]=0;for(h=b[f];k<h;k++)a[f]=a[f]<<1|e&1,e>>>=1}return a};function Ba(b,a){this.input=b;this.b=this.c=0;this.g={};a&&(a.flags&&(this.g=a.flags),"string"===typeof a.filename&&(this.filename=a.filename),"string"===typeof a.comment&&(this.w=a.comment),a.deflateOptions&&(this.l=a.deflateOptions));this.l||(this.l={})}
Ba.prototype.h=function(){var b,a,c,d,e,f,g,k,h=new (B?Uint8Array:Array)(32768),m=0,r=this.input,p=this.c,l=this.filename,n=this.w;h[m++]=31;h[m++]=139;h[m++]=8;b=0;this.g.fname&&(b|=Ca);this.g.fcomment&&(b|=Da);this.g.fhcrc&&(b|=Ea);h[m++]=b;a=(Date.now?Date.now():+new Date)/1E3|0;h[m++]=a&255;h[m++]=a>>>8&255;h[m++]=a>>>16&255;h[m++]=a>>>24&255;h[m++]=0;h[m++]=Sa;if(this.g.fname!==t){g=0;for(k=l.length;g<k;++g)f=l.charCodeAt(g),255<f&&(h[m++]=f>>>8&255),h[m++]=f&255;h[m++]=0}if(this.g.comment){g=
0;for(k=n.length;g<k;++g)f=n.charCodeAt(g),255<f&&(h[m++]=f>>>8&255),h[m++]=f&255;h[m++]=0}this.g.fhcrc&&(c=ha(h,0,m)&65535,h[m++]=c&255,h[m++]=c>>>8&255);this.l.outputBuffer=h;this.l.outputIndex=m;e=new na(r,this.l);h=e.h();m=e.b;B&&(m+8>h.buffer.byteLength?(this.a=new Uint8Array(m+8),this.a.set(new Uint8Array(h.buffer)),h=this.a):h=new Uint8Array(h.buffer));d=ha(r,t,t);h[m++]=d&255;h[m++]=d>>>8&255;h[m++]=d>>>16&255;h[m++]=d>>>24&255;k=r.length;h[m++]=k&255;h[m++]=k>>>8&255;h[m++]=k>>>16&255;h[m++]=
k>>>24&255;this.c=p;B&&m<h.length&&(this.a=h=h.subarray(0,m));return h};var Sa=255,Ea=2,Ca=8,Da=16;function V(b,a){this.o=[];this.p=32768;this.e=this.j=this.c=this.s=0;this.input=B?new Uint8Array(b):b;this.u=!1;this.q=Ta;this.K=!1;if(a||!(a={}))a.index&&(this.c=a.index),a.bufferSize&&(this.p=a.bufferSize),a.bufferType&&(this.q=a.bufferType),a.resize&&(this.K=a.resize);switch(this.q){case Ua:this.b=32768;this.a=new (B?Uint8Array:Array)(32768+this.p+258);break;case Ta:this.b=0;this.a=new (B?Uint8Array:Array)(this.p);this.f=this.S;this.z=this.O;this.r=this.Q;break;default:q(Error("invalid inflate mode"))}}
var Ua=0,Ta=1;
V.prototype.i=function(){for(;!this.u;){var b=W(this,3);b&1&&(this.u=v);b>>>=1;switch(b){case 0:var a=this.input,c=this.c,d=this.a,e=this.b,f=a.length,g=t,k=t,h=d.length,m=t;this.e=this.j=0;c+1>=f&&q(Error("invalid uncompressed block header: LEN"));g=a[c++]|a[c++]<<8;c+1>=f&&q(Error("invalid uncompressed block header: NLEN"));k=a[c++]|a[c++]<<8;g===~k&&q(Error("invalid uncompressed block header: length verify"));c+g>a.length&&q(Error("input buffer is broken"));switch(this.q){case Ua:for(;e+g>d.length;){m=
h-e;g-=m;if(B)d.set(a.subarray(c,c+m),e),e+=m,c+=m;else for(;m--;)d[e++]=a[c++];this.b=e;d=this.f();e=this.b}break;case Ta:for(;e+g>d.length;)d=this.f({B:2});break;default:q(Error("invalid inflate mode"))}if(B)d.set(a.subarray(c,c+g),e),e+=g,c+=g;else for(;g--;)d[e++]=a[c++];this.c=c;this.b=e;this.a=d;break;case 1:this.r(Va,Wa);break;case 2:for(var r=W(this,5)+257,p=W(this,5)+1,l=W(this,4)+4,n=new (B?Uint8Array:Array)(Xa.length),s=t,u=t,w=t,C=t,x=t,D=t,M=t,z=t,N=t,z=0;z<l;++z)n[Xa[z]]=W(this,3);if(!B){z=
l;for(l=n.length;z<l;++z)n[Xa[z]]=0}s=T(n);C=new (B?Uint8Array:Array)(r+p);z=0;for(N=r+p;z<N;)switch(x=Ya(this,s),x){case 16:for(M=3+W(this,2);M--;)C[z++]=D;break;case 17:for(M=3+W(this,3);M--;)C[z++]=0;D=0;break;case 18:for(M=11+W(this,7);M--;)C[z++]=0;D=0;break;default:D=C[z++]=x}u=B?T(C.subarray(0,r)):T(C.slice(0,r));w=B?T(C.subarray(r)):T(C.slice(r));this.r(u,w);break;default:q(Error("unknown BTYPE: "+b))}}return this.z()};
var Za=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Xa=B?new Uint16Array(Za):Za,$a=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],ab=B?new Uint16Array($a):$a,bb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],cb=B?new Uint8Array(bb):bb,db=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],eb=B?new Uint16Array(db):db,fb=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,
10,11,11,12,12,13,13],gb=B?new Uint8Array(fb):fb,hb=new (B?Uint8Array:Array)(288),$,ib;$=0;for(ib=hb.length;$<ib;++$)hb[$]=143>=$?8:255>=$?9:279>=$?7:8;var Va=T(hb),jb=new (B?Uint8Array:Array)(30),kb,lb;kb=0;for(lb=jb.length;kb<lb;++kb)jb[kb]=5;var Wa=T(jb);function W(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k;d<a;)f>=g&&q(Error("input buffer is broken")),c|=e[f++]<<d,d+=8;k=c&(1<<a)-1;b.j=c>>>a;b.e=d-a;b.c=f;return k}
function Ya(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k=a[0],h=a[1],m,r;d<h&&!(f>=g);)c|=e[f++]<<d,d+=8;m=k[c&(1<<h)-1];r=m>>>16;r>d&&q(Error("invalid code length: "+r));b.j=c>>r;b.e=d-r;b.c=f;return m&65535}
V.prototype.r=function(b,a){var c=this.a,d=this.b;this.A=b;for(var e=c.length-258,f,g,k,h;256!==(f=Ya(this,b));)if(256>f)d>=e&&(this.b=d,c=this.f(),d=this.b),c[d++]=f;else{g=f-257;h=ab[g];0<cb[g]&&(h+=W(this,cb[g]));f=Ya(this,a);k=eb[f];0<gb[f]&&(k+=W(this,gb[f]));d>=e&&(this.b=d,c=this.f(),d=this.b);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};
V.prototype.Q=function(b,a){var c=this.a,d=this.b;this.A=b;for(var e=c.length,f,g,k,h;256!==(f=Ya(this,b));)if(256>f)d>=e&&(c=this.f(),e=c.length),c[d++]=f;else{g=f-257;h=ab[g];0<cb[g]&&(h+=W(this,cb[g]));f=Ya(this,a);k=eb[f];0<gb[f]&&(k+=W(this,gb[f]));d+h>e&&(c=this.f(),e=c.length);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};
V.prototype.f=function(){var b=new (B?Uint8Array:Array)(this.b-32768),a=this.b-32768,c,d,e=this.a;if(B)b.set(e.subarray(32768,b.length));else{c=0;for(d=b.length;c<d;++c)b[c]=e[c+32768]}this.o.push(b);this.s+=b.length;if(B)e.set(e.subarray(a,a+32768));else for(c=0;32768>c;++c)e[c]=e[a+c];this.b=32768;return e};
V.prototype.S=function(b){var a,c=this.input.length/this.c+1|0,d,e,f,g=this.input,k=this.a;b&&("number"===typeof b.B&&(c=b.B),"number"===typeof b.M&&(c+=b.M));2>c?(d=(g.length-this.c)/this.A[2],f=258*(d/2)|0,e=f<k.length?k.length+f:k.length<<1):e=k.length*c;B?(a=new Uint8Array(e),a.set(k)):a=k;return this.a=a};
V.prototype.z=function(){var b=0,a=this.a,c=this.o,d,e=new (B?Uint8Array:Array)(this.s+(this.b-32768)),f,g,k,h;if(0===c.length)return B?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);f=0;for(g=c.length;f<g;++f){d=c[f];k=0;for(h=d.length;k<h;++k)e[b++]=d[k]}f=32768;for(g=this.b;f<g;++f)e[b++]=a[f];this.o=[];return this.buffer=e};
V.prototype.O=function(){var b,a=this.b;B?this.K?(b=new Uint8Array(a),b.set(this.a.subarray(0,a))):b=this.a.subarray(0,a):(this.a.length>a&&(this.a.length=a),b=this.a);return this.buffer=b};function mb(b){this.input=b;this.c=0;this.G=[];this.R=!1}
mb.prototype.i=function(){for(var b=this.input.length;this.c<b;){var a=new ja,c=t,d=t,e=t,f=t,g=t,k=t,h=t,m=t,r=t,p=this.input,l=this.c;a.C=p[l++];a.D=p[l++];(31!==a.C||139!==a.D)&&q(Error("invalid file signature:"+a.C+","+a.D));a.v=p[l++];switch(a.v){case 8:break;default:q(Error("unknown compression method: "+a.v))}a.n=p[l++];m=p[l++]|p[l++]<<8|p[l++]<<16|p[l++]<<24;a.$=new Date(1E3*m);a.ba=p[l++];a.aa=p[l++];0<(a.n&4)&&(a.W=p[l++]|p[l++]<<8,l+=a.W);if(0<(a.n&Ca)){h=[];for(k=0;0<(g=p[l++]);)h[k++]=
String.fromCharCode(g);a.name=h.join("")}if(0<(a.n&Da)){h=[];for(k=0;0<(g=p[l++]);)h[k++]=String.fromCharCode(g);a.w=h.join("")}0<(a.n&Ea)&&(a.P=ha(p,0,l)&65535,a.P!==(p[l++]|p[l++]<<8)&&q(Error("invalid header crc16")));c=p[p.length-4]|p[p.length-3]<<8|p[p.length-2]<<16|p[p.length-1]<<24;p.length-l-4-4<512*c&&(f=c);d=new V(p,{index:l,bufferSize:f});a.data=e=d.i();l=d.c;a.Y=r=(p[l++]|p[l++]<<8|p[l++]<<16|p[l++]<<24)>>>0;ha(e,t,t)!==r&&q(Error("invalid CRC-32 checksum: 0x"+ha(e,t,t).toString(16)+" / 0x"+
r.toString(16)));a.Z=c=(p[l++]|p[l++]<<8|p[l++]<<16|p[l++]<<24)>>>0;(e.length&4294967295)!==c&&q(Error("invalid input size: "+(e.length&4294967295)+" / "+c));this.G.push(a);this.c=l}this.R=v;var n=this.G,s,u,w=0,C=0,x;s=0;for(u=n.length;s<u;++s)C+=n[s].data.length;if(B){x=new Uint8Array(C);for(s=0;s<u;++s)x.set(n[s].data,w),w+=n[s].data.length}else{x=[];for(s=0;s<u;++s)x[s]=n[s].data;x=Array.prototype.concat.apply([],x)}return x};function nb(b){if("string"===typeof b){var a=b.split(""),c,d;c=0;for(d=a.length;c<d;c++)a[c]=(a[c].charCodeAt(0)&255)>>>0;b=a}for(var e=1,f=0,g=b.length,k,h=0;0<g;){k=1024<g?1024:g;g-=k;do e+=b[h++],f+=e;while(--k);e%=65521;f%=65521}return(f<<16|e)>>>0};function ob(b,a){var c,d;this.input=b;this.c=0;if(a||!(a={}))a.index&&(this.c=a.index),a.verify&&(this.V=a.verify);c=b[this.c++];d=b[this.c++];switch(c&15){case pb:this.method=pb;break;default:q(Error("unsupported compression method"))}0!==((c<<8)+d)%31&&q(Error("invalid fcheck flag:"+((c<<8)+d)%31));d&32&&q(Error("fdict flag is not supported"));this.J=new V(b,{index:this.c,bufferSize:a.bufferSize,bufferType:a.bufferType,resize:a.resize})}
ob.prototype.i=function(){var b=this.input,a,c;a=this.J.i();this.c=this.J.c;this.V&&(c=(b[this.c++]<<24|b[this.c++]<<16|b[this.c++]<<8|b[this.c++])>>>0,c!==nb(a)&&q(Error("invalid adler-32 checksum")));return a};var pb=8;function rb(b,a){this.input=b;this.a=new (B?Uint8Array:Array)(32768);this.k=sb.t;var c={},d;if((a||!(a={}))&&"number"===typeof a.compressionType)this.k=a.compressionType;for(d in a)c[d]=a[d];c.outputBuffer=this.a;this.I=new na(this.input,c)}var sb=pa;
rb.prototype.h=function(){var b,a,c,d,e,f,g,k=0;g=this.a;b=pb;switch(b){case pb:a=Math.LOG2E*Math.log(32768)-8;break;default:q(Error("invalid compression method"))}c=a<<4|b;g[k++]=c;switch(b){case pb:switch(this.k){case sb.NONE:e=0;break;case sb.L:e=1;break;case sb.t:e=2;break;default:q(Error("unsupported compression type"))}break;default:q(Error("invalid compression method"))}d=e<<6|0;g[k++]=d|31-(256*c+d)%31;f=nb(this.input);this.I.b=k;g=this.I.h();k=g.length;B&&(g=new Uint8Array(g.buffer),g.length<=
k+4&&(this.a=new Uint8Array(g.length+4),this.a.set(g),g=this.a),g=g.subarray(0,k+4));g[k++]=f>>24&255;g[k++]=f>>16&255;g[k++]=f>>8&255;g[k++]=f&255;return g};exports.deflate=tb;exports.deflateSync=ub;exports.inflate=vb;exports.inflateSync=wb;exports.gzip=xb;exports.gzipSync=yb;exports.gunzip=zb;exports.gunzipSync=Ab;function tb(b,a,c){process.nextTick(function(){var d,e;try{e=ub(b,c)}catch(f){d=f}a(d,e)})}function ub(b,a){var c;c=(new rb(b)).h();a||(a={});return a.H?c:Bb(c)}function vb(b,a,c){process.nextTick(function(){var d,e;try{e=wb(b,c)}catch(f){d=f}a(d,e)})}
function wb(b,a){var c;b.subarray=b.slice;c=(new ob(b)).i();a||(a={});return a.noBuffer?c:Bb(c)}function xb(b,a,c){process.nextTick(function(){var d,e;try{e=yb(b,c)}catch(f){d=f}a(d,e)})}function yb(b,a){var c;b.subarray=b.slice;c=(new Ba(b)).h();a||(a={});return a.H?c:Bb(c)}function zb(b,a,c){process.nextTick(function(){var d,e;try{e=Ab(b,c)}catch(f){d=f}a(d,e)})}function Ab(b,a){var c;b.subarray=b.slice;c=(new mb(b)).i();a||(a={});return a.H?c:Bb(c)}
function Bb(b){var a=new Buffer(b.length),c,d;c=0;for(d=b.length;c<d;++c)a[c]=b[c];return a};}).call(this);

},{"process":"../../../../../../../home/exqt/.config/yarn/global/node_modules/process/browser.js","buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/tesseract.js-utils/src/common/browser/gunzip.js":[function(require,module,exports) {
module.exports = require('zlibjs').gunzipSync;

},{"zlibjs":"../node_modules/zlibjs/bin/node-zlib.js"}],"../node_modules/resolve-url/resolve-url.js":[function(require,module,exports) {
var define;
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],"../node_modules/bmp-js/lib/encoder.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
/**
 * @author shaozilee
 *
 * BMP format encoder,encode 24bit BMP
 * Not support quality compression
 *
 */

function BmpEncoder(imgData){
	this.buffer = imgData.data;
	this.width = imgData.width;
	this.height = imgData.height;
	this.extraBytes = this.width%4;
	this.rgbSize = this.height*(3*this.width+this.extraBytes);
	this.headerInfoSize = 40;

	this.data = [];
	/******************header***********************/
	this.flag = "BM";
	this.reserved = 0;
	this.offset = 54;
	this.fileSize = this.rgbSize+this.offset;
	this.planes = 1;
	this.bitPP = 24;
	this.compress = 0;
	this.hr = 0;
	this.vr = 0;
	this.colors = 0;
	this.importantColors = 0;
}

BmpEncoder.prototype.encode = function() {
	var tempBuffer = new Buffer(this.offset+this.rgbSize);
	this.pos = 0;
	tempBuffer.write(this.flag,this.pos,2);this.pos+=2;
	tempBuffer.writeUInt32LE(this.fileSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.reserved,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.offset,this.pos);this.pos+=4;

	tempBuffer.writeUInt32LE(this.headerInfoSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.width,this.pos);this.pos+=4;
	tempBuffer.writeInt32LE(-this.height,this.pos);this.pos+=4;
	tempBuffer.writeUInt16LE(this.planes,this.pos);this.pos+=2;
	tempBuffer.writeUInt16LE(this.bitPP,this.pos);this.pos+=2;
	tempBuffer.writeUInt32LE(this.compress,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.rgbSize,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.hr,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.vr,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.colors,this.pos);this.pos+=4;
	tempBuffer.writeUInt32LE(this.importantColors,this.pos);this.pos+=4;

	var i=0;
	var rowBytes = 3*this.width+this.extraBytes;

	for (var y = 0; y <this.height; y++){
		for (var x = 0; x < this.width; x++){
			var p = this.pos+y*rowBytes+x*3;
			i++;//a
			tempBuffer[p]= this.buffer[i++];//b
			tempBuffer[p+1] = this.buffer[i++];//g
			tempBuffer[p+2]  = this.buffer[i++];//r
		}
		if(this.extraBytes>0){
			var fillOffset = this.pos+y*rowBytes+this.width*3;
			tempBuffer.fill(0,fillOffset,fillOffset+this.extraBytes);
		}
	}

	return tempBuffer;
};

module.exports = function(imgData, quality) {
  if (typeof quality === 'undefined') quality = 100;
 	var encoder = new BmpEncoder(imgData);
	var data = encoder.encode();
  return {
    data: data,
    width: imgData.width,
    height: imgData.height
  };
};

},{"buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/bmp-js/lib/decoder.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
/**
 * @author shaozilee
 *
 * Bmp format decoder,support 1bit 4bit 8bit 24bit bmp
 *
 */

function BmpDecoder(buffer,is_with_alpha) {
  this.pos = 0;
  this.buffer = buffer;
  this.is_with_alpha = !!is_with_alpha;
  this.bottom_up = true;
  this.flag = this.buffer.toString("utf-8", 0, this.pos += 2);
  if (this.flag != "BM") throw new Error("Invalid BMP File");
  this.parseHeader();
  this.parseRGBA();
}

BmpDecoder.prototype.parseHeader = function() {
  this.fileSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.reserved = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.offset = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.headerSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.width = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.height = this.buffer.readInt32LE(this.pos);
  this.pos += 4;
  this.planes = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.bitPP = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.compress = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.rawSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.hr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.vr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.colors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.importantColors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;

  if(this.bitPP === 16 && this.is_with_alpha){
    this.bitPP = 15
  }
  if (this.bitPP < 15) {
    var len = this.colors === 0 ? 1 << this.bitPP : this.colors;
    this.palette = new Array(len);
    for (var i = 0; i < len; i++) {
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var quad = this.buffer.readUInt8(this.pos++);
      this.palette[i] = {
        red: red,
        green: green,
        blue: blue,
        quad: quad
      };
    }
  }
  if(this.height < 0) {
    this.height *= -1;
    this.bottom_up = false;
  }

}

BmpDecoder.prototype.parseRGBA = function() {
    var bitn = "bit" + this.bitPP;
    var len = this.width * this.height * 4;
    this.data = new Buffer(len);
    this[bitn]();
};

BmpDecoder.prototype.bit1 = function() {
  var xlen = Math.ceil(this.width / 8);
  var mode = xlen%4;
  var y = this.height >= 0 ? this.height - 1 : -this.height
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y
    for (var x = 0; x < xlen; x++) {
      var b = this.buffer.readUInt8(this.pos++);
      var location = line * this.width * 4 + x*8*4;
      for (var i = 0; i < 8; i++) {
        if(x*8+i<this.width){
          var rgb = this.palette[((b>>(7-i))&0x1)];

          this.data[location+i*4] = 0;
          this.data[location+i*4 + 1] = rgb.blue;
          this.data[location+i*4 + 2] = rgb.green;
          this.data[location+i*4 + 3] = rgb.red;

        }else{
          break;
        }
      }
    }

    if (mode != 0){
      this.pos+=(4 - mode);
    }
  }
};

BmpDecoder.prototype.bit4 = function() {
    //RLE-4
    if(this.compress == 2){
        this.data.fill(0xff);

        var location = 0;
        var lines = this.bottom_up?this.height-1:0;
        var low_nibble = false;//for all count of pixel

        while(location<this.data.length){
            var a = this.buffer.readUInt8(this.pos++);
            var b = this.buffer.readUInt8(this.pos++);
            //absolute mode
            if(a == 0){
                if(b == 0){//line end
                    if(this.bottom_up){
                        lines--;
                    }else{
                        lines++;
                    }
                    location = lines*this.width*4;
                    low_nibble = false;
                    continue;
                }else if(b == 1){//image end
                    break;
                }else if(b ==2){
                    //offset x,y
                    var x = this.buffer.readUInt8(this.pos++);
                    var y = this.buffer.readUInt8(this.pos++);
                    if(this.bottom_up){
                        lines-=y;
                    }else{
                        lines+=y;
                    }

                    location +=(y*this.width*4+x*4);
                }else{
                    var c = this.buffer.readUInt8(this.pos++);
                    for(var i=0;i<b;i++){
                        if (low_nibble) {
                            setPixelData.call(this, (c & 0x0f));
                        } else {
                            setPixelData.call(this, (c & 0xf0)>>4);
                        }

                        if ((i & 1) && (i+1 < b)){
                            c = this.buffer.readUInt8(this.pos++);
                        }

                        low_nibble = !low_nibble;
                    }

                    if ((((b+1) >> 1) & 1 ) == 1){
                        this.pos++
                    }
                }

            }else{//encoded mode
                for (var i = 0; i < a; i++) {
                    if (low_nibble) {
                        setPixelData.call(this, (b & 0x0f));
                    } else {
                        setPixelData.call(this, (b & 0xf0)>>4);
                    }
                    low_nibble = !low_nibble;
                }
            }

        }




        function setPixelData(rgbIndex){
            var rgb = this.palette[rgbIndex];
            this.data[location] = 0;
            this.data[location + 1] = rgb.blue;
            this.data[location + 2] = rgb.green;
            this.data[location + 3] = rgb.red;
            location+=4;
        }
    }else{

      var xlen = Math.ceil(this.width/2);
      var mode = xlen%4;
      for (var y = this.height - 1; y >= 0; y--) {
        var line = this.bottom_up ? y : this.height - 1 - y
        for (var x = 0; x < xlen; x++) {
          var b = this.buffer.readUInt8(this.pos++);
          var location = line * this.width * 4 + x*2*4;

          var before = b>>4;
          var after = b&0x0F;

          var rgb = this.palette[before];
          this.data[location] = 0;
          this.data[location + 1] = rgb.blue;
          this.data[location + 2] = rgb.green;
          this.data[location + 3] = rgb.red;


          if(x*2+1>=this.width)break;

          rgb = this.palette[after];

          this.data[location+4] = 0;
          this.data[location+4 + 1] = rgb.blue;
          this.data[location+4 + 2] = rgb.green;
          this.data[location+4 + 3] = rgb.red;

        }

        if (mode != 0){
          this.pos+=(4 - mode);
        }
      }

    }

};

BmpDecoder.prototype.bit8 = function() {
    //RLE-8
    if(this.compress == 1){
        this.data.fill(0xff);

        var location = 0;
        var lines = this.bottom_up?this.height-1:0;

        while(location<this.data.length){
            var a = this.buffer.readUInt8(this.pos++);
            var b = this.buffer.readUInt8(this.pos++);
            //absolute mode
            if(a == 0){
                if(b == 0){//line end
                    if(this.bottom_up){
                        lines--;
                    }else{
                        lines++;
                    }
                    location = lines*this.width*4;
                    continue;
                }else if(b == 1){//image end
                    break;
                }else if(b ==2){
                    //offset x,y
                    var x = this.buffer.readUInt8(this.pos++);
                    var y = this.buffer.readUInt8(this.pos++);
                    if(this.bottom_up){
                        lines-=y;
                    }else{
                        lines+=y;
                    }

                    location +=(y*this.width*4+x*4);
                }else{
                    for(var i=0;i<b;i++){
                        var c = this.buffer.readUInt8(this.pos++);
                        setPixelData.call(this, c);
                    }
                    if(b&1 == 1){
                        this.pos++;
                    }

                }

            }else{//encoded mode
                for (var i = 0; i < a; i++) {
                    setPixelData.call(this, b);
                }
            }

        }




        function setPixelData(rgbIndex){
            var rgb = this.palette[rgbIndex];
            this.data[location] = 0;
            this.data[location + 1] = rgb.blue;
            this.data[location + 2] = rgb.green;
            this.data[location + 3] = rgb.red;
            location+=4;
        }
    }else {
        var mode = this.width % 4;
        for (var y = this.height - 1; y >= 0; y--) {
            var line = this.bottom_up ? y : this.height - 1 - y
            for (var x = 0; x < this.width; x++) {
                var b = this.buffer.readUInt8(this.pos++);
                var location = line * this.width * 4 + x * 4;
                if (b < this.palette.length) {
                    var rgb = this.palette[b];

                    this.data[location] = 0;
                    this.data[location + 1] = rgb.blue;
                    this.data[location + 2] = rgb.green;
                    this.data[location + 3] = rgb.red;

                } else {
                    this.data[location] = 0;
                    this.data[location + 1] = 0xFF;
                    this.data[location + 2] = 0xFF;
                    this.data[location + 3] = 0xFF;
                }
            }
            if (mode != 0) {
                this.pos += (4 - mode);
            }
        }
    }
};

BmpDecoder.prototype.bit15 = function() {
  var dif_w =this.width % 3;
  var _11111 = parseInt("11111", 2),_1_5 = _11111;
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y
    for (var x = 0; x < this.width; x++) {

      var B = this.buffer.readUInt16LE(this.pos);
      this.pos+=2;
      var blue = (B & _1_5) / _1_5 * 255 | 0;
      var green = (B >> 5 & _1_5 ) / _1_5 * 255 | 0;
      var red = (B >> 10 & _1_5) / _1_5 * 255 | 0;
      var alpha = (B>>15)?0xFF:0x00;

      var location = line * this.width * 4 + x * 4;

      this.data[location] = alpha;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += dif_w;
  }
};

BmpDecoder.prototype.bit16 = function() {
  var dif_w =(this.width % 2)*2;
  //default xrgb555
  this.maskRed = 0x7C00;
  this.maskGreen = 0x3E0;
  this.maskBlue =0x1F;
  this.mask0 = 0;

  if(this.compress == 3){
    this.maskRed = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskGreen = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskBlue = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.mask0 = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
  }


  var ns=[0,0,0];
  for (var i=0;i<16;i++){
    if ((this.maskRed>>i)&0x01) ns[0]++;
    if ((this.maskGreen>>i)&0x01) ns[1]++;
    if ((this.maskBlue>>i)&0x01) ns[2]++;
  }
  ns[1]+=ns[0]; ns[2]+=ns[1];	ns[0]=8-ns[0]; ns[1]-=8; ns[2]-=8;

  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y;
    for (var x = 0; x < this.width; x++) {

      var B = this.buffer.readUInt16LE(this.pos);
      this.pos+=2;

      var blue = (B&this.maskBlue)<<ns[0];
      var green = (B&this.maskGreen)>>ns[1];
      var red = (B&this.maskRed)>>ns[2];

      var location = line * this.width * 4 + x * 4;

      this.data[location] = 0;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += dif_w;
  }
};

BmpDecoder.prototype.bit24 = function() {
  for (var y = this.height - 1; y >= 0; y--) {
    var line = this.bottom_up ? y : this.height - 1 - y
    for (var x = 0; x < this.width; x++) {
      //Little Endian rgb
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var location = line * this.width * 4 + x * 4;
      this.data[location] = 0;
      this.data[location + 1] = blue;
      this.data[location + 2] = green;
      this.data[location + 3] = red;
    }
    //skip extra bytes
    this.pos += (this.width % 4);
  }

};

/**
 * add 32bit decode func
 * @author soubok
 */
BmpDecoder.prototype.bit32 = function() {
  //BI_BITFIELDS
  if(this.compress == 3){
    this.maskRed = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskGreen = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.maskBlue = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
    this.mask0 = this.buffer.readUInt32LE(this.pos);
    this.pos+=4;
      for (var y = this.height - 1; y >= 0; y--) {
          var line = this.bottom_up ? y : this.height - 1 - y;
          for (var x = 0; x < this.width; x++) {
              //Little Endian rgba
              var alpha = this.buffer.readUInt8(this.pos++);
              var blue = this.buffer.readUInt8(this.pos++);
              var green = this.buffer.readUInt8(this.pos++);
              var red = this.buffer.readUInt8(this.pos++);
              var location = line * this.width * 4 + x * 4;
              this.data[location] = alpha;
              this.data[location + 1] = blue;
              this.data[location + 2] = green;
              this.data[location + 3] = red;
          }
      }

  }else{
      for (var y = this.height - 1; y >= 0; y--) {
          var line = this.bottom_up ? y : this.height - 1 - y;
          for (var x = 0; x < this.width; x++) {
              //Little Endian argb
              var blue = this.buffer.readUInt8(this.pos++);
              var green = this.buffer.readUInt8(this.pos++);
              var red = this.buffer.readUInt8(this.pos++);
              var alpha = this.buffer.readUInt8(this.pos++);
              var location = line * this.width * 4 + x * 4;
              this.data[location] = alpha;
              this.data[location + 1] = blue;
              this.data[location + 2] = green;
              this.data[location + 3] = red;
          }
      }

  }




};

BmpDecoder.prototype.getData = function() {
  return this.data;
};

module.exports = function(bmpData) {
  var decoder = new BmpDecoder(bmpData);
  return decoder;
};

},{"buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/bmp-js/index.js":[function(require,module,exports) {
/**
 * @author shaozilee
 *
 * support 1bit 4bit 8bit 24bit decode
 * encode with 24bit
 * 
 */

var encode = require('./lib/encoder'),
    decode = require('./lib/decoder');

module.exports = {
  encode: encode,
  decode: decode
};

},{"./lib/encoder":"../node_modules/bmp-js/lib/encoder.js","./lib/decoder":"../node_modules/bmp-js/lib/decoder.js"}],"../node_modules/file-type/index.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function (obj) { return typeof obj; }; } else { _typeof = function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var toBytes = function (s) {
  return _toConsumableArray(s).map(function (c) {
    return c.charCodeAt(0);
  });
};

var xpiZipFilename = toBytes('META-INF/mozilla.rsa');
var oxmlContentTypes = toBytes('[Content_Types].xml');
var oxmlRels = toBytes('_rels/.rels');

function readUInt64LE(buf) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var n = buf[offset];
  var mul = 1;
  var i = 0;

  while (++i < 8) {
    mul *= 0x100;
    n += buf[offset + i] * mul;
  }

  return n;
}

var fileType = function (input) {
  if (!(input instanceof Uint8Array || input instanceof ArrayBuffer || Buffer.isBuffer(input))) {
    throw new TypeError("Expected the `input` argument to be of type `Uint8Array` or `Buffer` or `ArrayBuffer`, got `".concat(_typeof(input), "`"));
  }

  var buf = input instanceof Uint8Array ? input : new Uint8Array(input);

  if (!(buf && buf.length > 1)) {
    return null;
  }

  var check = function (header, options) {
    options = Object.assign({
      offset: 0
    }, options);

    for (var i = 0; i < header.length; i++) {
      // If a bitmask is set
      if (options.mask) {
        // If header doesn't equal `buf` with bits masked off
        if (header[i] !== (options.mask[i] & buf[i + options.offset])) {
          return false;
        }
      } else if (header[i] !== buf[i + options.offset]) {
        return false;
      }
    }

    return true;
  };

  var checkString = function (header, options) {
    return check(toBytes(header), options);
  };

  if (check([0xFF, 0xD8, 0xFF])) {
    return {
      ext: 'jpg',
      mime: 'image/jpeg'
    };
  }

  if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return {
      ext: 'png',
      mime: 'image/png'
    };
  }

  if (check([0x47, 0x49, 0x46])) {
    return {
      ext: 'gif',
      mime: 'image/gif'
    };
  }

  if (check([0x57, 0x45, 0x42, 0x50], {
    offset: 8
  })) {
    return {
      ext: 'webp',
      mime: 'image/webp'
    };
  }

  if (check([0x46, 0x4C, 0x49, 0x46])) {
    return {
      ext: 'flif',
      mime: 'image/flif'
    };
  } // Needs to be before `tif` check


  if ((check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) && check([0x43, 0x52], {
    offset: 8
  })) {
    return {
      ext: 'cr2',
      mime: 'image/x-canon-cr2'
    };
  }

  if (check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) {
    return {
      ext: 'tif',
      mime: 'image/tiff'
    };
  }

  if (check([0x42, 0x4D])) {
    return {
      ext: 'bmp',
      mime: 'image/bmp'
    };
  }

  if (check([0x49, 0x49, 0xBC])) {
    return {
      ext: 'jxr',
      mime: 'image/vnd.ms-photo'
    };
  }

  if (check([0x38, 0x42, 0x50, 0x53])) {
    return {
      ext: 'psd',
      mime: 'image/vnd.adobe.photoshop'
    };
  } // Zip-based file formats
  // Need to be before the `zip` check


  if (check([0x50, 0x4B, 0x3, 0x4])) {
    if (check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {
      offset: 30
    })) {
      return {
        ext: 'epub',
        mime: 'application/epub+zip'
      };
    } // Assumes signed `.xpi` from addons.mozilla.org


    if (check(xpiZipFilename, {
      offset: 30
    })) {
      return {
        ext: 'xpi',
        mime: 'application/x-xpinstall'
      };
    }

    if (checkString('mimetypeapplication/vnd.oasis.opendocument.text', {
      offset: 30
    })) {
      return {
        ext: 'odt',
        mime: 'application/vnd.oasis.opendocument.text'
      };
    }

    if (checkString('mimetypeapplication/vnd.oasis.opendocument.spreadsheet', {
      offset: 30
    })) {
      return {
        ext: 'ods',
        mime: 'application/vnd.oasis.opendocument.spreadsheet'
      };
    }

    if (checkString('mimetypeapplication/vnd.oasis.opendocument.presentation', {
      offset: 30
    })) {
      return {
        ext: 'odp',
        mime: 'application/vnd.oasis.opendocument.presentation'
      };
    } // The docx, xlsx and pptx file types extend the Office Open XML file format:
    // https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
    // We look for:
    // - one entry named '[Content_Types].xml' or '_rels/.rels',
    // - one entry indicating specific type of file.
    // MS Office, OpenOffice and LibreOffice may put the parts in different order, so the check should not rely on it.


    var findNextZipHeaderIndex = function (arr) {
      var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return arr.findIndex(function (el, i, arr) {
        return i >= startAt && arr[i] === 0x50 && arr[i + 1] === 0x4B && arr[i + 2] === 0x3 && arr[i + 3] === 0x4;
      });
    };

    var zipHeaderIndex = 0; // The first zip header was already found at index 0

    var oxmlFound = false;
    var type = null;

    do {
      var offset = zipHeaderIndex + 30;

      if (!oxmlFound) {
        oxmlFound = check(oxmlContentTypes, {
          offset: offset
        }) || check(oxmlRels, {
          offset: offset
        });
      }

      if (!type) {
        if (checkString('word/', {
          offset: offset
        })) {
          type = {
            ext: 'docx',
            mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          };
        } else if (checkString('ppt/', {
          offset: offset
        })) {
          type = {
            ext: 'pptx',
            mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          };
        } else if (checkString('xl/', {
          offset: offset
        })) {
          type = {
            ext: 'xlsx',
            mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          };
        }
      }

      if (oxmlFound && type) {
        return type;
      }

      zipHeaderIndex = findNextZipHeaderIndex(buf, offset);
    } while (zipHeaderIndex >= 0); // No more zip parts available in the buffer, but maybe we are almost certain about the type?


    if (type) {
      return type;
    }
  }

  if (check([0x50, 0x4B]) && (buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) && (buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)) {
    return {
      ext: 'zip',
      mime: 'application/zip'
    };
  }

  if (check([0x75, 0x73, 0x74, 0x61, 0x72], {
    offset: 257
  })) {
    return {
      ext: 'tar',
      mime: 'application/x-tar'
    };
  }

  if (check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) && (buf[6] === 0x0 || buf[6] === 0x1)) {
    return {
      ext: 'rar',
      mime: 'application/x-rar-compressed'
    };
  }

  if (check([0x1F, 0x8B, 0x8])) {
    return {
      ext: 'gz',
      mime: 'application/gzip'
    };
  }

  if (check([0x42, 0x5A, 0x68])) {
    return {
      ext: 'bz2',
      mime: 'application/x-bzip2'
    };
  }

  if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
    return {
      ext: '7z',
      mime: 'application/x-7z-compressed'
    };
  }

  if (check([0x78, 0x01])) {
    return {
      ext: 'dmg',
      mime: 'application/x-apple-diskimage'
    };
  }

  if (check([0x33, 0x67, 0x70, 0x35]) || // 3gp5
  check([0x0, 0x0, 0x0]) && check([0x66, 0x74, 0x79, 0x70], {
    offset: 4
  }) && (check([0x6D, 0x70, 0x34, 0x31], {
    offset: 8
  }) || // MP41
  check([0x6D, 0x70, 0x34, 0x32], {
    offset: 8
  }) || // MP42
  check([0x69, 0x73, 0x6F, 0x6D], {
    offset: 8
  }) || // ISOM
  check([0x69, 0x73, 0x6F, 0x32], {
    offset: 8
  }) || // ISO2
  check([0x6D, 0x6D, 0x70, 0x34], {
    offset: 8
  }) || // MMP4
  check([0x4D, 0x34, 0x56], {
    offset: 8
  }) || // M4V
  check([0x64, 0x61, 0x73, 0x68], {
    offset: 8
  }) // DASH
  )) {
    return {
      ext: 'mp4',
      mime: 'video/mp4'
    };
  }

  if (check([0x4D, 0x54, 0x68, 0x64])) {
    return {
      ext: 'mid',
      mime: 'audio/midi'
    };
  } // https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska


  if (check([0x1A, 0x45, 0xDF, 0xA3])) {
    var sliced = buf.subarray(4, 4 + 4096);
    var idPos = sliced.findIndex(function (el, i, arr) {
      return arr[i] === 0x42 && arr[i + 1] === 0x82;
    });

    if (idPos !== -1) {
      var docTypePos = idPos + 3;

      var findDocType = function (type) {
        return _toConsumableArray(type).every(function (c, i) {
          return sliced[docTypePos + i] === c.charCodeAt(0);
        });
      };

      if (findDocType('matroska')) {
        return {
          ext: 'mkv',
          mime: 'video/x-matroska'
        };
      }

      if (findDocType('webm')) {
        return {
          ext: 'webm',
          mime: 'video/webm'
        };
      }
    }
  }

  if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) || check([0x66, 0x72, 0x65, 0x65], {
    offset: 4
  }) || // Type: `free`
  check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {
    offset: 4
  }) || check([0x6D, 0x64, 0x61, 0x74], {
    offset: 4
  }) || // MJPEG
  check([0x6D, 0x6F, 0x6F, 0x76], {
    offset: 4
  }) || // Type: `moov`
  check([0x77, 0x69, 0x64, 0x65], {
    offset: 4
  })) {
    return {
      ext: 'mov',
      mime: 'video/quicktime'
    };
  } // RIFF file format which might be AVI, WAV, QCP, etc


  if (check([0x52, 0x49, 0x46, 0x46])) {
    if (check([0x41, 0x56, 0x49], {
      offset: 8
    })) {
      return {
        ext: 'avi',
        mime: 'video/vnd.avi'
      };
    }

    if (check([0x57, 0x41, 0x56, 0x45], {
      offset: 8
    })) {
      return {
        ext: 'wav',
        mime: 'audio/vnd.wave'
      };
    } // QLCM, QCP file


    if (check([0x51, 0x4C, 0x43, 0x4D], {
      offset: 8
    })) {
      return {
        ext: 'qcp',
        mime: 'audio/qcelp'
      };
    }
  } // ASF_Header_Object first 80 bytes


  if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
    // Search for header should be in first 1KB of file.
    var _offset = 30;

    do {
      var objectSize = readUInt64LE(buf, _offset + 16);

      if (check([0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65], {
        offset: _offset
      })) {
        // Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
        if (check([0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B], {
          offset: _offset + 24
        })) {
          // Found audio:
          return {
            ext: 'wma',
            mime: 'audio/x-ms-wma'
          };
        }

        if (check([0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B], {
          offset: _offset + 24
        })) {
          // Found video:
          return {
            ext: 'wmv',
            mime: 'video/x-ms-asf'
          };
        }

        break;
      }

      _offset += objectSize;
    } while (_offset + 24 <= buf.length); // Default to ASF generic extension


    return {
      ext: 'asf',
      mime: 'application/vnd.ms-asf'
    };
  }

  if (check([0x0, 0x0, 0x1, 0xBA]) || check([0x0, 0x0, 0x1, 0xB3])) {
    return {
      ext: 'mpg',
      mime: 'video/mpeg'
    };
  }

  if (check([0x66, 0x74, 0x79, 0x70, 0x33, 0x67], {
    offset: 4
  })) {
    return {
      ext: '3gp',
      mime: 'video/3gpp'
    };
  } // Check for MPEG header at different starting offsets


  for (var start = 0; start < 2 && start < buf.length - 16; start++) {
    if (check([0x49, 0x44, 0x33], {
      offset: start
    }) || // ID3 header
    check([0xFF, 0xE2], {
      offset: start,
      mask: [0xFF, 0xE2]
    }) // MPEG 1 or 2 Layer 3 header
    ) {
        return {
          ext: 'mp3',
          mime: 'audio/mpeg'
        };
      }

    if (check([0xFF, 0xE4], {
      offset: start,
      mask: [0xFF, 0xE4]
    }) // MPEG 1 or 2 Layer 2 header
    ) {
        return {
          ext: 'mp2',
          mime: 'audio/mpeg'
        };
      }

    if (check([0xFF, 0xF8], {
      offset: start,
      mask: [0xFF, 0xFC]
    }) // MPEG 2 layer 0 using ADTS
    ) {
        return {
          ext: 'mp2',
          mime: 'audio/mpeg'
        };
      }

    if (check([0xFF, 0xF0], {
      offset: start,
      mask: [0xFF, 0xFC]
    }) // MPEG 4 layer 0 using ADTS
    ) {
        return {
          ext: 'mp4',
          mime: 'audio/mpeg'
        };
      }
  }

  if (check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {
    offset: 4
  })) {
    return {
      // MPEG-4 layer 3 (audio)
      ext: 'm4a',
      mime: 'audio/mp4' // RFC 4337

    };
  } // Needs to be before `ogg` check


  if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {
    offset: 28
  })) {
    return {
      ext: 'opus',
      mime: 'audio/opus'
    };
  } // If 'OggS' in first  bytes, then OGG container


  if (check([0x4F, 0x67, 0x67, 0x53])) {
    // This is a OGG container
    // If ' theora' in header.
    if (check([0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61], {
      offset: 28
    })) {
      return {
        ext: 'ogv',
        mime: 'video/ogg'
      };
    } // If '\x01video' in header.


    if (check([0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00], {
      offset: 28
    })) {
      return {
        ext: 'ogm',
        mime: 'video/ogg'
      };
    } // If ' FLAC' in header  https://xiph.org/flac/faq.html


    if (check([0x7F, 0x46, 0x4C, 0x41, 0x43], {
      offset: 28
    })) {
      return {
        ext: 'oga',
        mime: 'audio/ogg'
      };
    } // 'Speex  ' in header https://en.wikipedia.org/wiki/Speex


    if (check([0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20], {
      offset: 28
    })) {
      return {
        ext: 'spx',
        mime: 'audio/ogg'
      };
    } // If '\x01vorbis' in header


    if (check([0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73], {
      offset: 28
    })) {
      return {
        ext: 'ogg',
        mime: 'audio/ogg'
      };
    } // Default OGG container https://www.iana.org/assignments/media-types/application/ogg


    return {
      ext: 'ogx',
      mime: 'application/ogg'
    };
  }

  if (check([0x66, 0x4C, 0x61, 0x43])) {
    return {
      ext: 'flac',
      mime: 'audio/x-flac'
    };
  }

  if (check([0x4D, 0x41, 0x43, 0x20])) {
    // 'MAC '
    return {
      ext: 'ape',
      mime: 'audio/ape'
    };
  }

  if (check([0x77, 0x76, 0x70, 0x6B])) {
    // 'wvpk'
    return {
      ext: 'wv',
      mime: 'audio/wavpack'
    };
  }

  if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
    return {
      ext: 'amr',
      mime: 'audio/amr'
    };
  }

  if (check([0x25, 0x50, 0x44, 0x46])) {
    return {
      ext: 'pdf',
      mime: 'application/pdf'
    };
  }

  if (check([0x4D, 0x5A])) {
    return {
      ext: 'exe',
      mime: 'application/x-msdownload'
    };
  }

  if ((buf[0] === 0x43 || buf[0] === 0x46) && check([0x57, 0x53], {
    offset: 1
  })) {
    return {
      ext: 'swf',
      mime: 'application/x-shockwave-flash'
    };
  }

  if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
    return {
      ext: 'rtf',
      mime: 'application/rtf'
    };
  }

  if (check([0x00, 0x61, 0x73, 0x6D])) {
    return {
      ext: 'wasm',
      mime: 'application/wasm'
    };
  }

  if (check([0x77, 0x4F, 0x46, 0x46]) && (check([0x00, 0x01, 0x00, 0x00], {
    offset: 4
  }) || check([0x4F, 0x54, 0x54, 0x4F], {
    offset: 4
  }))) {
    return {
      ext: 'woff',
      mime: 'font/woff'
    };
  }

  if (check([0x77, 0x4F, 0x46, 0x32]) && (check([0x00, 0x01, 0x00, 0x00], {
    offset: 4
  }) || check([0x4F, 0x54, 0x54, 0x4F], {
    offset: 4
  }))) {
    return {
      ext: 'woff2',
      mime: 'font/woff2'
    };
  }

  if (check([0x4C, 0x50], {
    offset: 34
  }) && (check([0x00, 0x00, 0x01], {
    offset: 8
  }) || check([0x01, 0x00, 0x02], {
    offset: 8
  }) || check([0x02, 0x00, 0x02], {
    offset: 8
  }))) {
    return {
      ext: 'eot',
      mime: 'application/vnd.ms-fontobject'
    };
  }

  if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
    return {
      ext: 'ttf',
      mime: 'font/ttf'
    };
  }

  if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
    return {
      ext: 'otf',
      mime: 'font/otf'
    };
  }

  if (check([0x00, 0x00, 0x01, 0x00])) {
    return {
      ext: 'ico',
      mime: 'image/x-icon'
    };
  }

  if (check([0x00, 0x00, 0x02, 0x00])) {
    return {
      ext: 'cur',
      mime: 'image/x-icon'
    };
  }

  if (check([0x46, 0x4C, 0x56, 0x01])) {
    return {
      ext: 'flv',
      mime: 'video/x-flv'
    };
  }

  if (check([0x25, 0x21])) {
    return {
      ext: 'ps',
      mime: 'application/postscript'
    };
  }

  if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
    return {
      ext: 'xz',
      mime: 'application/x-xz'
    };
  }

  if (check([0x53, 0x51, 0x4C, 0x69])) {
    return {
      ext: 'sqlite',
      mime: 'application/x-sqlite3'
    };
  }

  if (check([0x4E, 0x45, 0x53, 0x1A])) {
    return {
      ext: 'nes',
      mime: 'application/x-nintendo-nes-rom'
    };
  }

  if (check([0x43, 0x72, 0x32, 0x34])) {
    return {
      ext: 'crx',
      mime: 'application/x-google-chrome-extension'
    };
  }

  if (check([0x4D, 0x53, 0x43, 0x46]) || check([0x49, 0x53, 0x63, 0x28])) {
    return {
      ext: 'cab',
      mime: 'application/vnd.ms-cab-compressed'
    };
  } // Needs to be before `ar` check


  if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
    return {
      ext: 'deb',
      mime: 'application/x-deb'
    };
  }

  if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
    return {
      ext: 'ar',
      mime: 'application/x-unix-archive'
    };
  }

  if (check([0xED, 0xAB, 0xEE, 0xDB])) {
    return {
      ext: 'rpm',
      mime: 'application/x-rpm'
    };
  }

  if (check([0x1F, 0xA0]) || check([0x1F, 0x9D])) {
    return {
      ext: 'Z',
      mime: 'application/x-compress'
    };
  }

  if (check([0x4C, 0x5A, 0x49, 0x50])) {
    return {
      ext: 'lz',
      mime: 'application/x-lzip'
    };
  }

  if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
    return {
      ext: 'msi',
      mime: 'application/x-msi'
    };
  }

  if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
    return {
      ext: 'mxf',
      mime: 'application/mxf'
    };
  }

  if (check([0x47], {
    offset: 4
  }) && (check([0x47], {
    offset: 192
  }) || check([0x47], {
    offset: 196
  }))) {
    return {
      ext: 'mts',
      mime: 'video/mp2t'
    };
  }

  if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
    return {
      ext: 'blend',
      mime: 'application/x-blender'
    };
  }

  if (check([0x42, 0x50, 0x47, 0xFB])) {
    return {
      ext: 'bpg',
      mime: 'image/bpg'
    };
  }

  if (check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
    // JPEG-2000 family
    if (check([0x6A, 0x70, 0x32, 0x20], {
      offset: 20
    })) {
      return {
        ext: 'jp2',
        mime: 'image/jp2'
      };
    }

    if (check([0x6A, 0x70, 0x78, 0x20], {
      offset: 20
    })) {
      return {
        ext: 'jpx',
        mime: 'image/jpx'
      };
    }

    if (check([0x6A, 0x70, 0x6D, 0x20], {
      offset: 20
    })) {
      return {
        ext: 'jpm',
        mime: 'image/jpm'
      };
    }

    if (check([0x6D, 0x6A, 0x70, 0x32], {
      offset: 20
    })) {
      return {
        ext: 'mj2',
        mime: 'image/mj2'
      };
    }
  }

  if (check([0x46, 0x4F, 0x52, 0x4D])) {
    return {
      ext: 'aif',
      mime: 'audio/aiff'
    };
  }

  if (checkString('<?xml ')) {
    return {
      ext: 'xml',
      mime: 'application/xml'
    };
  }

  if (check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {
    offset: 60
  })) {
    return {
      ext: 'mobi',
      mime: 'application/x-mobipocket-ebook'
    };
  } // File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)


  if (check([0x66, 0x74, 0x79, 0x70], {
    offset: 4
  })) {
    if (check([0x6D, 0x69, 0x66, 0x31], {
      offset: 8
    })) {
      return {
        ext: 'heic',
        mime: 'image/heif'
      };
    }

    if (check([0x6D, 0x73, 0x66, 0x31], {
      offset: 8
    })) {
      return {
        ext: 'heic',
        mime: 'image/heif-sequence'
      };
    }

    if (check([0x68, 0x65, 0x69, 0x63], {
      offset: 8
    }) || check([0x68, 0x65, 0x69, 0x78], {
      offset: 8
    })) {
      return {
        ext: 'heic',
        mime: 'image/heic'
      };
    }

    if (check([0x68, 0x65, 0x76, 0x63], {
      offset: 8
    }) || check([0x68, 0x65, 0x76, 0x78], {
      offset: 8
    })) {
      return {
        ext: 'heic',
        mime: 'image/heic-sequence'
      };
    }
  }

  if (check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return {
      ext: 'ktx',
      mime: 'image/ktx'
    };
  }

  if (check([0x44, 0x49, 0x43, 0x4D], {
    offset: 128
  })) {
    return {
      ext: 'dcm',
      mime: 'application/dicom'
    };
  } // Musepack, SV7


  if (check([0x4D, 0x50, 0x2B])) {
    return {
      ext: 'mpc',
      mime: 'audio/x-musepack'
    };
  } // Musepack, SV8


  if (check([0x4D, 0x50, 0x43, 0x4B])) {
    return {
      ext: 'mpc',
      mime: 'audio/x-musepack'
    };
  }

  if (check([0x42, 0x45, 0x47, 0x49, 0x4E, 0x3A])) {
    return {
      ext: 'ics',
      mime: 'text/calendar'
    };
  }

  if (check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
    return {
      ext: 'glb',
      mime: 'model/gltf-binary'
    };
  }

  if (check([0xD4, 0xC3, 0xB2, 0xA1]) || check([0xA1, 0xB2, 0xC3, 0xD4])) {
    return {
      ext: 'pcap',
      mime: 'application/vnd.tcpdump.pcap'
    };
  }

  return null;
};

module.exports = fileType; // TODO: Remove this for the next major release

module.exports.default = fileType;
Object.defineProperty(fileType, 'minimumBytes', {
  value: 4100
});

module.exports.stream = function (readableStream) {
  return new Promise(function (resolve, reject) {
    // Using `eval` to work around issues when bundling with Webpack
    var stream = eval('require')('stream'); // eslint-disable-line no-eval

    readableStream.once('readable', function () {
      var pass = new stream.PassThrough();
      var chunk = readableStream.read(module.exports.minimumBytes) || readableStream.read();

      try {
        pass.fileType = fileType(chunk);
      } catch (error) {
        reject(error);
      }

      readableStream.unshift(chunk);

      if (stream.pipeline) {
        resolve(stream.pipeline(readableStream, pass, function () {}));
      } else {
        resolve(readableStream.pipe(pass));
      }
    });
  });
};
},{"buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/tesseract.js-utils/src/readImage.js":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
const bmp = require('bmp-js');
const fileType = require('file-type');

module.exports = (TessModule, iBuf, yres = 70) => {
  const buf = Buffer.from(iBuf);
  const type = fileType(buf);
  let bytesPerPixel = 0;
  let data = null;
  let pix = null;
  let w = 0;
  let h = 0;

  /*
   * Although leptonica should support reading bmp, there is a bug of "compressed BMP files".
   * As there is no solution, we need to use bmp-js for now.
   * @see https://groups.google.com/forum/#!topic/tesseract-ocr/4mPD9zTxdxE
   */
  if (type && type.mime === 'image/bmp') {
    const bmpBuf = bmp.decode(buf);
    data = TessModule._malloc(bmpBuf.data.length * Uint8Array.BYTES_PER_ELEMENT);
    TessModule.HEAPU8.set(bmpBuf.data, data);
    w = bmpBuf.width;
    h = bmpBuf.height;
    bytesPerPixel = 4;
  } else {
    const ptr = TessModule._malloc(buf.length * Uint8Array.BYTES_PER_ELEMENT);
    TessModule.HEAPU8.set(buf, ptr);
    pix = TessModule._pixReadMem(ptr, buf.length);
    if (TessModule.getValue(pix + (7 * 4), 'i32') === 0) {
      /*
       * Set a yres default value to prevent warning from tesseract
       * See kMinCredibleResolution in tesseract/src/ccstruct/publictypes.h
       */
      TessModule.setValue(pix + (7 * 4), yres, 'i32');
    }
    [w, h] = Array(2).fill(0)
      .map((v, idx) => (
        TessModule.getValue(pix + (idx * 4), 'i32')
      ));
  }

  return {
    w,
    h,
    bytesPerPixel,
    data,
    pix,
  };
};

},{"bmp-js":"../node_modules/bmp-js/index.js","file-type":"../node_modules/file-type/index.js","buffer":"../../../../../../../home/exqt/.config/yarn/global/node_modules/buffer/index.js"}],"../node_modules/tesseract.js-utils/src/index.browser.js":[function(require,module,exports) {
const cache = require('./common/browser/cache');

module.exports = {
  loadLang: require('./loadLang')({
    fetch: require('./common/browser/fetch'),
    gunzip: require('./common/browser/gunzip'),
    resolveURL: require('resolve-url'),
    ...cache,
  }),
  readImage: require('./readImage'),
  cache,
};

},{"./common/browser/cache":"../node_modules/tesseract.js-utils/src/common/browser/cache.js","./loadLang":"../node_modules/tesseract.js-utils/src/loadLang.js","./common/browser/fetch":"../node_modules/tesseract.js-utils/src/common/browser/fetch.js","./common/browser/gunzip":"../node_modules/tesseract.js-utils/src/common/browser/gunzip.js","resolve-url":"../node_modules/resolve-url/resolve-url.js","./readImage":"../node_modules/tesseract.js-utils/src/readImage.js"}],"../node_modules/check-types/src/check-types.js":[function(require,module,exports) {
var define;
/*globals define, module, Symbol */
/*jshint -W056 */

(function (globals) {
  'use strict';

  var strings, messages, predicates, functions, assert, not, maybe,
      collections, slice, neginf, posinf, isArray, haveSymbols;

  strings = {
    v: 'value',
    n: 'number',
    s: 'string',
    b: 'boolean',
    o: 'object',
    t: 'type',
    a: 'array',
    al: 'array-like',
    i: 'iterable',
    d: 'date',
    f: 'function',
    l: 'length'
  };

  messages = {};
  predicates = {};

  [
    { n: 'equal', f: equal, s: 'v' },
    { n: 'undefined', f: isUndefined, s: 'v' },
    { n: 'null', f: isNull, s: 'v' },
    { n: 'assigned', f: assigned, s: 'v' },
    { n: 'primitive', f: primitive, s: 'v' },
    { n: 'includes', f: includes, s: 'v' },
    { n: 'zero', f: zero },
    { n: 'infinity', f: infinity },
    { n: 'number', f: number },
    { n: 'integer', f: integer },
    { n: 'even', f: even },
    { n: 'odd', f: odd },
    { n: 'greater', f: greater },
    { n: 'less', f: less },
    { n: 'between', f: between },
    { n: 'greaterOrEqual', f: greaterOrEqual },
    { n: 'lessOrEqual', f: lessOrEqual },
    { n: 'inRange', f: inRange },
    { n: 'positive', f: positive },
    { n: 'negative', f: negative },
    { n: 'string', f: string, s: 's' },
    { n: 'emptyString', f: emptyString, s: 's' },
    { n: 'nonEmptyString', f: nonEmptyString, s: 's' },
    { n: 'contains', f: contains, s: 's' },
    { n: 'match', f: match, s: 's' },
    { n: 'boolean', f: boolean, s: 'b' },
    { n: 'object', f: object, s: 'o' },
    { n: 'emptyObject', f: emptyObject, s: 'o' },
    { n: 'nonEmptyObject', f: nonEmptyObject, s: 'o' },
    { n: 'instanceStrict', f: instanceStrict, s: 't' },
    { n: 'instance', f: instance, s: 't' },
    { n: 'like', f: like, s: 't' },
    { n: 'array', f: array, s: 'a' },
    { n: 'emptyArray', f: emptyArray, s: 'a' },
    { n: 'nonEmptyArray', f: nonEmptyArray, s: 'a' },
    { n: 'arrayLike', f: arrayLike, s: 'al' },
    { n: 'iterable', f: iterable, s: 'i' },
    { n: 'date', f: date, s: 'd' },
    { n: 'function', f: isFunction, s: 'f' },
    { n: 'hasLength', f: hasLength, s: 'l' },
  ].map(function (data) {
    var n = data.n;
    messages[n] = 'Invalid ' + strings[data.s || 'n'];
    predicates[n] = data.f;
  });

  functions = {
    apply: apply,
    map: map,
    all: all,
    any: any
  };

  collections = [ 'array', 'arrayLike', 'iterable', 'object' ];
  slice = Array.prototype.slice;
  neginf = Number.NEGATIVE_INFINITY;
  posinf = Number.POSITIVE_INFINITY;
  isArray = Array.isArray;
  haveSymbols = typeof Symbol === 'function';

  functions = mixin(functions, predicates);
  assert = createModifiedPredicates(assertModifier, assertImpl);
  not = createModifiedPredicates(notModifier, notImpl);
  maybe = createModifiedPredicates(maybeModifier, maybeImpl);
  assert.not = createModifiedModifier(assertModifier, not);
  assert.maybe = createModifiedModifier(assertModifier, maybe);

  collections.forEach(createOfPredicates);
  createOfModifiers(assert, assertModifier);
  createOfModifiers(not, notModifier);
  collections.forEach(createMaybeOfModifiers);

  exportFunctions(mixin(functions, {
    assert: assert,
    not: not,
    maybe: maybe
  }));

  /**
   * Public function `equal`.
   *
   * Returns true if `lhs` and `rhs` are strictly equal, without coercion.
   * Returns false otherwise.
   */
  function equal (lhs, rhs) {
    return lhs === rhs;
  }

  /**
   * Public function `undefined`.
   *
   * Returns true if `data` is undefined, false otherwise.
   */
  function isUndefined (data) {
    return data === undefined;
  }

  /**
   * Public function `null`.
   *
   * Returns true if `data` is null, false otherwise.
   */
  function isNull (data) {
    return data === null;
  }

  /**
   * Public function `assigned`.
   *
   * Returns true if `data` is not null or undefined, false otherwise.
   */
  function assigned (data) {
    return data !== undefined && data !== null;
  }

  /**
   * Public function `primitive`.
   *
   * Returns true if `data` is a primitive type, false otherwise.
   */
  function primitive (data) {
    var type;

    switch (data) {
      case null:
      case undefined:
      case false:
      case true:
        return true;
    }

    type = typeof data;
    return type === 'string' || type === 'number' || (haveSymbols && type === 'symbol');
  }

  /**
   * Public function `zero`.
   *
   * Returns true if `data` is zero, false otherwise.
   */
  function zero (data) {
    return data === 0;
  }

  /**
   * Public function `infinity`.
   *
   * Returns true if `data` is positive or negative infinity, false otherwise.
   */
  function infinity (data) {
    return data === neginf || data === posinf;
  }

  /**
   * Public function `number`.
   *
   * Returns true if `data` is a number, false otherwise.
   */
  function number (data) {
    return typeof data === 'number' && data > neginf && data < posinf;
  }

  /**
   * Public function `integer`.
   *
   * Returns true if `data` is an integer, false otherwise.
   */
  function integer (data) {
    return typeof data === 'number' && data % 1 === 0;
  }

  /**
   * Public function `even`.
   *
   * Returns true if `data` is an even number, false otherwise.
   */
  function even (data) {
    return typeof data === 'number' && data % 2 === 0;
  }

  /**
   * Public function `odd`.
   *
   * Returns true if `data` is an odd number, false otherwise.
   */
  function odd (data) {
    return integer(data) && data % 2 !== 0;
  }

  /**
   * Public function `greater`.
   *
   * Returns true if `lhs` is a number greater than `rhs`, false otherwise.
   */
  function greater (lhs, rhs) {
    return number(lhs) && lhs > rhs;
  }

  /**
   * Public function `less`.
   *
   * Returns true if `lhs` is a number less than `rhs`, false otherwise.
   */
  function less (lhs, rhs) {
    return number(lhs) && lhs < rhs;
  }

  /**
   * Public function `between`.
   *
   * Returns true if `data` is a number between `x` and `y`, false otherwise.
   */
  function between (data, x, y) {
    if (x < y) {
      return greater(data, x) && data < y;
    }

    return less(data, x) && data > y;
  }

  /**
   * Public function `greaterOrEqual`.
   *
   * Returns true if `lhs` is a number greater than or equal to `rhs`, false
   * otherwise.
   */
  function greaterOrEqual (lhs, rhs) {
    return number(lhs) && lhs >= rhs;
  }

  /**
   * Public function `lessOrEqual`.
   *
   * Returns true if `lhs` is a number less than or equal to `rhs`, false
   * otherwise.
   */
  function lessOrEqual (lhs, rhs) {
    return number(lhs) && lhs <= rhs;
  }

  /**
   * Public function `inRange`.
   *
   * Returns true if `data` is a number in the range `x..y`, false otherwise.
   */
  function inRange (data, x, y) {
    if (x < y) {
      return greaterOrEqual(data, x) && data <= y;
    }

    return lessOrEqual(data, x) && data >= y;
  }

  /**
   * Public function `positive`.
   *
   * Returns true if `data` is a positive number, false otherwise.
   */
  function positive (data) {
    return greater(data, 0);
  }

  /**
   * Public function `negative`.
   *
   * Returns true if `data` is a negative number, false otherwise.
   */
  function negative (data) {
    return less(data, 0);
  }

  /**
   * Public function `string`.
   *
   * Returns true if `data` is a string, false otherwise.
   */
  function string (data) {
    return typeof data === 'string';
  }

  /**
   * Public function `emptyString`.
   *
   * Returns true if `data` is the empty string, false otherwise.
   */
  function emptyString (data) {
    return data === '';
  }

  /**
   * Public function `nonEmptyString`.
   *
   * Returns true if `data` is a non-empty string, false otherwise.
   */
  function nonEmptyString (data) {
    return string(data) && data !== '';
  }

  /**
   * Public function `contains`.
   *
   * Returns true if `data` is a string that contains `substring`, false
   * otherwise.
   */
  function contains (data, substring) {
    return string(data) && data.indexOf(substring) !== -1;
  }

  /**
   * Public function `match`.
   *
   * Returns true if `data` is a string that matches `regex`, false otherwise.
   */
  function match (data, regex) {
    return string(data) && !! data.match(regex);
  }

  /**
   * Public function `boolean`.
   *
   * Returns true if `data` is a boolean value, false otherwise.
   */
  function boolean (data) {
    return data === false || data === true;
  }

  /**
   * Public function `object`.
   *
   * Returns true if `data` is a plain-old JS object, false otherwise.
   */
  function object (data) {
    return Object.prototype.toString.call(data) === '[object Object]';
  }

  /**
   * Public function `emptyObject`.
   *
   * Returns true if `data` is an empty object, false otherwise.
   */
  function emptyObject (data) {
    return object(data) && Object.keys(data).length === 0;
  }

  /**
   * Public function `nonEmptyObject`.
   *
   * Returns true if `data` is a non-empty object, false otherwise.
   */
  function nonEmptyObject (data) {
    return object(data) && Object.keys(data).length > 0;
  }

  /**
   * Public function `instanceStrict`.
   *
   * Returns true if `data` is an instance of `prototype`, false otherwise.
   */
  function instanceStrict (data, prototype) {
    try {
      return data instanceof prototype;
    } catch (error) {
      return false;
    }
  }

  /**
   * Public function `instance`.
   *
   * Returns true if `data` is an instance of `prototype`, false otherwise.
   * Falls back to testing constructor.name and Object.prototype.toString
   * if the initial instanceof test fails.
   */
  function instance (data, prototype) {
    try {
      return instanceStrict(data, prototype) ||
        data.constructor.name === prototype.name ||
        Object.prototype.toString.call(data) === '[object ' + prototype.name + ']';
    } catch (error) {
      return false;
    }
  }

  /**
   * Public function `like`.
   *
   * Tests whether `data` 'quacks like a duck'. Returns true if `data` has all
   * of the properties of `archetype` (the 'duck'), false otherwise.
   */
  function like (data, archetype) {
    var name;

    for (name in archetype) {
      if (archetype.hasOwnProperty(name)) {
        if (data.hasOwnProperty(name) === false || typeof data[name] !== typeof archetype[name]) {
          return false;
        }

        if (object(data[name]) && like(data[name], archetype[name]) === false) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Public function `array`.
   *
   * Returns true if `data` is an array, false otherwise.
   */
  function array (data) {
    return isArray(data);
  }

  /**
   * Public function `emptyArray`.
   *
   * Returns true if `data` is an empty array, false otherwise.
   */
  function emptyArray (data) {
    return array(data) && data.length === 0;
  }

  /**
   * Public function `nonEmptyArray`.
   *
   * Returns true if `data` is a non-empty array, false otherwise.
   */
  function nonEmptyArray (data) {
    return array(data) && greater(data.length, 0);
  }

  /**
   * Public function `arrayLike`.
   *
   * Returns true if `data` is an array-like object, false otherwise.
   */
  function arrayLike (data) {
    return assigned(data) && greaterOrEqual(data.length, 0);
  }

  /**
   * Public function `iterable`.
   *
   * Returns true if `data` is an iterable, false otherwise.
   */
  function iterable (data) {
    if (! haveSymbols) {
      // Fall back to `arrayLike` predicate in pre-ES6 environments.
      return arrayLike(data);
    }

    return assigned(data) && isFunction(data[Symbol.iterator]);
  }

  /**
   * Public function `includes`.
   *
   * Returns true if `data` contains `value`, false otherwise.
   */
  function includes (data, value) {
    var iterator, iteration, keys, length, i;

    if (! assigned(data)) {
      return false;
    }

    if (haveSymbols && data[Symbol.iterator] && isFunction(data.values)) {
      iterator = data.values();

      do {
        iteration = iterator.next();

        if (iteration.value === value) {
          return true;
        }
      } while (! iteration.done);

      return false;
    }

    keys = Object.keys(data);
    length = keys.length;
    for (i = 0; i < length; ++i) {
      if (data[keys[i]] === value) {
        return true;
      }
    }

    return false;
  }

  /**
   * Public function `hasLength`.
   *
   * Returns true if `data` has a length property that equals `length`, false
   * otherwise.
   */
  function hasLength (data, length) {
    return assigned(data) && data.length === length;
  }

  /**
   * Public function `date`.
   *
   * Returns true if `data` is a valid date, false otherwise.
   */
  function date (data) {
    return instanceStrict(data, Date) && integer(data.getTime());
  }

  /**
   * Public function `function`.
   *
   * Returns true if `data` is a function, false otherwise.
   */
  function isFunction (data) {
    return typeof data === 'function';
  }

  /**
   * Public function `apply`.
   *
   * Maps each value from the `data` to the corresponding predicate and returns
   * the result array. If the same function is to be applied across all of the
   * data, a single predicate function may be passed in.
   *
   */
  function apply (data, predicates) {
    assert.array(data);

    if (isFunction(predicates)) {
      return data.map(function (value) {
        return predicates(value);
      });
    }

    assert.array(predicates);
    assert.hasLength(data, predicates.length);

    return data.map(function (value, index) {
      return predicates[index](value);
    });
  }

  /**
   * Public function `map`.
   *
   * Maps each value from the `data` to the corresponding predicate and returns
   * the result object. Supports nested objects. If the `data` is not nested and
   * the same function is to be applied across all of it, a single predicate
   * function may be passed in.
   *
   */
  function map (data, predicates) {
    assert.object(data);

    if (isFunction(predicates)) {
      return mapSimple(data, predicates);
    }

    assert.object(predicates);

    return mapComplex(data, predicates);
  }

  function mapSimple (data, predicate) {
    var result = {};

    Object.keys(data).forEach(function (key) {
      result[key] = predicate(data[key]);
    });

    return result;
  }

  function mapComplex (data, predicates) {
    var result = {};

    Object.keys(predicates).forEach(function (key) {
      var predicate = predicates[key];

      if (isFunction(predicate)) {
        if (not.assigned(data)) {
          result[key] = !!predicate.m;
        } else {
          result[key] = predicate(data[key]);
        }
      } else if (object(predicate)) {
        result[key] = mapComplex(data[key], predicate);
      }
    });

    return result;
  }

  /**
   * Public function `all`
   *
   * Check that all boolean values are true
   * in an array (returned from `apply`)
   * or object (returned from `map`).
   *
   */
  function all (data) {
    if (array(data)) {
      return testArray(data, false);
    }

    assert.object(data);

    return testObject(data, false);
  }

  function testArray (data, result) {
    var i;

    for (i = 0; i < data.length; i += 1) {
      if (data[i] === result) {
        return result;
      }
    }

    return !result;
  }

  function testObject (data, result) {
    var key, value;

    for (key in data) {
      if (data.hasOwnProperty(key)) {
        value = data[key];

        if (object(value) && testObject(value, result) === result) {
          return result;
        }

        if (value === result) {
          return result;
        }
      }
    }

    return !result;
  }

  /**
   * Public function `any`
   *
   * Check that at least one boolean value is true
   * in an array (returned from `apply`)
   * or object (returned from `map`).
   *
   */
  function any (data) {
    if (array(data)) {
      return testArray(data, true);
    }

    assert.object(data);

    return testObject(data, true);
  }

  function mixin (target, source) {
    Object.keys(source).forEach(function (key) {
      target[key] = source[key];
    });

    return target;
  }

  /**
   * Public modifier `assert`.
   *
   * Throws if `predicate` returns false.
   */
  function assertModifier (predicate, defaultMessage) {
    return function () {
      return assertPredicate(predicate, arguments, defaultMessage);
    };
  }

  function assertPredicate (predicate, args, defaultMessage) {
    var argCount = predicate.l || predicate.length;
    var message = args[argCount];
    var ErrorType = args[argCount + 1];
    assertImpl(
      predicate.apply(null, args),
      nonEmptyString(message) ? message : defaultMessage,
      isFunction(ErrorType) ? ErrorType : TypeError
    );
    return args[0];
  }

  function assertImpl (value, message, ErrorType) {
    if (value) {
      return value;
    }
    throw new (ErrorType || Error)(message || 'Assertion failed');
  }

  /**
   * Public modifier `not`.
   *
   * Negates `predicate`.
   */
  function notModifier (predicate) {
    var modifiedPredicate = function () {
      return notImpl(predicate.apply(null, arguments));
    };
    modifiedPredicate.l = predicate.length;
    return modifiedPredicate;
  }

  function notImpl (value) {
    return !value;
  }

  /**
   * Public modifier `maybe`.
   *
   * Returns true if predicate argument is  null or undefined,
   * otherwise propagates the return value from `predicate`.
   */
  function maybeModifier (predicate) {
    var modifiedPredicate = function () {
      if (not.assigned(arguments[0])) {
        return true;
      }

      return predicate.apply(null, arguments);
    };
    modifiedPredicate.l = predicate.length;

    // Hackishly indicate that this is a maybe.xxx predicate.
    // Without this flag, the alternative would be to iterate
    // through the maybe predicates or use indexOf to check,
    // which would be time-consuming.
    modifiedPredicate.m = true;

    return modifiedPredicate;
  }

  function maybeImpl (value) {
    if (assigned(value) === false) {
      return true;
    }

    return value;
  }

  /**
   * Public modifier `of`.
   *
   * Applies the chained predicate to members of the collection.
   */
  function ofModifier (target, type, predicate) {
    var modifiedPredicate = function () {
      var collection, args;

      collection = arguments[0];

      if (target === 'maybe' && not.assigned(collection)) {
        return true;
      }

      if (!type(collection)) {
        return false;
      }

      collection = coerceCollection(type, collection);
      args = slice.call(arguments, 1);

      try {
        collection.forEach(function (item) {
          if (
            (target !== 'maybe' || assigned(item)) &&
            !predicate.apply(null, [ item ].concat(args))
          ) {
            // TODO: Replace with for...of when ES6 is required.
            throw 0;
          }
        });
      } catch (ignore) {
        return false;
      }

      return true;
    };
    modifiedPredicate.l = predicate.length;
    return modifiedPredicate;
  }

  function coerceCollection (type, collection) {
    switch (type) {
      case arrayLike:
        return slice.call(collection);
      case object:
        return Object.keys(collection).map(function (key) {
          return collection[key];
        });
      default:
        return collection;
    }
  }

  function createModifiedPredicates (modifier, object) {
    return createModifiedFunctions([ modifier, predicates, object ]);
  }

  function createModifiedFunctions (args) {
    var modifier, object, functions, result;

    modifier = args.shift();
    object = args.pop();
    functions = args.pop();

    result = object || {};

    Object.keys(functions).forEach(function (key) {
      Object.defineProperty(result, key, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: modifier.apply(null, args.concat(functions[key], messages[key]))
      });
    });

    return result;
  }

  function createModifiedModifier (modifier, modified) {
    return createModifiedFunctions([ modifier, modified, null ]);
  }

  function createOfPredicates (key) {
    predicates[key].of = createModifiedFunctions(
      [ ofModifier.bind(null, null), predicates[key], predicates, null ]
    );
  }

  function createOfModifiers (base, modifier) {
    collections.forEach(function (key) {
      base[key].of = createModifiedModifier(modifier, predicates[key].of);
    });
  }

  function createMaybeOfModifiers (key) {
    maybe[key].of = createModifiedFunctions(
      [ ofModifier.bind(null, 'maybe'), predicates[key], predicates, null ]
    );
    assert.maybe[key].of = createModifiedModifier(assertModifier, maybe[key].of);
    assert.not[key].of = createModifiedModifier(assertModifier, not[key].of);
  }

  function exportFunctions (functions) {
    if (typeof define === 'function' && define.amd) {
      define(function () {
        return functions;
      });
    } else if (typeof module !== 'undefined' && module !== null && module.exports) {
      module.exports = functions;
    } else {
      globals.check = functions;
    }
  }
}(this));

},{}],"../node_modules/tesseract.js/src/common/options.js":[function(require,module,exports) {
module.exports = {
  defaultOptions: {
    /*
     * default path for downloading *.traineddata, this URL basically
     * points to a github page, not using jsDelivr as there is is limitation
     * of 20 MB.
     */
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  },
};

},{}],"../node_modules/tesseract.js/package.json":[function(require,module,exports) {
module.exports = {
  "name": "tesseract.js",
  "version": "2.0.0-alpha.3",
  "description": "Pure Javascript Multilingual OCR",
  "main": "src/index.js",
  "scripts": {
    "start": "node scripts/server.js",
    "build": "webpack --config scripts/webpack.config.prod.js",
    "prepublishOnly": "npm run build",
    "test": "npm run test:node",
    "test:node": "nyc mocha --exit --bail --require ./scripts/test-helper.js ./tests/*.test.js",
    "lint": "eslint src"
  },
  "browser": {
    "./src/node/index.js": "./src/browser/index.js"
  },
  "author": "",
  "contributors": [
    "jeromewu"
  ],
  "license": "Apache-2.0",
  "devDependencies": {
    "eslint": "^5.9.0",
    "eslint-config-airbnb": "^17.1.0",
    "eslint-plugin-import": "^2.14.0",
    "eslint-plugin-jsx-a11y": "^6.1.2",
    "eslint-plugin-react": "^7.11.1",
    "expect.js": "^0.3.1",
    "express": "^4.16.4",
    "mocha": "^5.2.0",
    "nyc": "^13.1.0",
    "webpack": "^4.26.0",
    "webpack-cli": "^3.1.2",
    "webpack-dev-middleware": "^3.4.0"
  },
  "dependencies": {
    "check-types": "^7.4.0",
    "is-url": "1.2.2",
    "node-fetch": "^2.3.0",
    "resolve-url": "^0.2.1",
    "tesseract.js-core": "^2.0.0-beta.5",
    "tesseract.js-utils": "^1.0.0-beta.5"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/naptha/tesseract.js.git"
  },
  "bugs": {
    "url": "https://github.com/naptha/tesseract.js/issues"
  },
  "homepage": "https://github.com/naptha/tesseract.js"
}
;
},{}],"../node_modules/tesseract.js/src/browser/index.js":[function(require,module,exports) {
/**
 *
 * Tesseract Worker adapter for browser
 *
 * @fileoverview Tesseract Worker adapter for browser
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
const check = require('check-types');

const resolveURL = require('resolve-url');

const {
  defaultOptions
} = require('../common/options');

const {
  version
} = require('../../package.json');
/**
 * readFromBlobOrFile
 *
 * @name readFromBlobOrFile
 * @function
 * @access private
 * @param {object} blob A blob or file objec to read
 * @param {function} res callback function after reading completes
 */


const readFromBlobOrFile = (blob, res) => {
  const fileReader = new FileReader();

  fileReader.onload = () => {
    res(fileReader.result);
  };

  fileReader.readAsArrayBuffer(blob);
};
/**
 * loadImage
 *
 * @name loadImage
 * @function load image from different source
 * @access private
 * @param {string, object} image - image source, supported formats:
 *   string: URL string, can be relative path
 *   img HTMLElement: extract image source from src attribute
 *   video HTMLElement: extract image source from poster attribute
 *   canvas HTMLElement: extract image data by converting to Blob 
 *   File instance: data from <input type="file" />
 * @returns {array} binary image in array format
 */


const loadImage = image => {
  if (check.string(image)) {
    return fetch(resolveURL(image)).then(resp => resp.arrayBuffer());
  }

  if (check.instance(image, HTMLElement)) {
    if (image.tagName === 'IMG') {
      return loadImage(image.src);
    }

    if (image.tagName === 'VIDEO') {
      return loadImage(image.poster);
    }

    if (image.tagName === 'CANVAS') {
      return new Promise(res => {
        image.toBlob(blob => {
          readFromBlobOrFile(blob, res);
        });
      });
    }
  }

  if (check.instance(image, File)) {
    return new Promise(res => {
      readFromBlobOrFile(image, res);
    });
  }

  return Promise.reject();
};
/*
 * Default options for browser worker
 */


exports.defaultOptions = { ...defaultOptions,
  workerPath: undefined === 'development' ? resolveURL(`/dist/worker.dev.js?nocache=${Math.random().toString(36).slice(3)}`) : `https://unpkg.com/tesseract.js@v${version}/dist/worker.min.js`,

  /*
   * If browser doesn't support WebAssembly,
   * load ASM version instead
   */
  corePath: `https://unpkg.com/tesseract.js-core@v2.0.0-beta.5/tesseract-core${typeof WebAssembly === 'object' ? '' : '.asm'}.js`
};
/**
 * spawnWorker
 *
 * @name spawnWorker
 * @function create a new Worker in browser
 * @access public
 * @param {object} instance - TesseractWorker instance
 * @param {object} options
 * @param {string} options.workerPath - worker script path
 */

exports.spawnWorker = (instance, {
  workerPath
}) => {
  let worker;

  if (window.Blob && window.URL) {
    const blob = new Blob([`importScripts("${workerPath}");`]);
    worker = new Worker(window.URL.createObjectURL(blob));
  } else {
    worker = new Worker(workerPath);
  }

  worker.onmessage = ({
    data
  }) => {
    instance.recv(data);
  };

  return worker;
};
/**
 * terminateWorker
 *
 * @name terminateWorker
 * @function terminate worker
 * @access public
 * @param {object} instance TesseractWorker instance
 */


exports.terminateWorker = instance => {
  instance.worker.terminate();
};
/**
 * sendPacket
 *
 * @name sendPacket
 * @function send packet to worker and create a job
 * @access public
 * @param {object} instance TesseractWorker instance
 * @param {object} iPacket data for worker
 */


exports.sendPacket = (instance, iPacket) => {
  const packet = { ...iPacket
  };
  loadImage(packet.payload.image).then(buf => new Uint8Array(buf)).then(img => {
    packet.payload.image = Array.from(img);
    instance.worker.postMessage(packet);
  });
};
},{"check-types":"../node_modules/check-types/src/check-types.js","resolve-url":"../node_modules/resolve-url/resolve-url.js","../common/options":"../node_modules/tesseract.js/src/common/options.js","../../package.json":"../node_modules/tesseract.js/package.json"}],"../node_modules/tesseract.js/src/common/circularize.js":[function(require,module,exports) {
/**
 * The result of dump.js is a big JSON tree
 * which can be easily serialized (for instance
 * to be sent from a webworker to the main app
 * or through Node's IPC), but we want
 * a (circular) DOM-like interface for walking
 * through the data.
 *
 * @fileoverview DOM-like interface for walking through data
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */

module.exports = (iPage) => {
  const page = {
    ...iPage,
    paragraphs: [],
    lines: [],
    words: [],
    symbols: [],
  };

  page.blocks.forEach((iBlock) => {
    const block = {
      ...iBlock,
      page,
      lines: [],
      words: [],
      symbols: [],
    };

    block.paragraphs.forEach((iPara) => {
      const para = {
        ...iPara,
        block,
        page,
        words: [],
        symbols: [],
      };

      para.lines.forEach((iLine) => {
        const line = {
          ...iLine,
          paragraph: para,
          block,
          page,
          symbols: [],
        };

        line.words.forEach((iWord) => {
          const word = {
            ...iWord,
            line,
            paragraph: para,
            block,
            page,
          };

          word.symbols.forEach((iSym) => {
            const sym = {
              ...iSym,
              word,
              line,
              paragraph: para,
              block,
              page,
            };

            sym.line.symbols.push(sym);
            sym.paragraph.symbols.push(sym);
            sym.block.symbols.push(sym);
            sym.page.symbols.push(sym);
          });
          word.paragraph.words.push(word);
          word.block.words.push(word);
          word.page.words.push(word);
        });
        line.block.lines.push(line);
        line.page.lines.push(line);
      });
      para.page.paragraphs.push(para);
    });
  });
  return page;
};

},{}],"../node_modules/tesseract.js/src/common/TesseractJob.js":[function(require,module,exports) {
/**
 *
 * The job exectued by worker, each job is basically a recognition of an image.
 *
 * @fileoverview Job excuted by Worker
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
const adapter = require('../node/');

/** A global job counter as part of job id */
let jobCounter = 0;

class TesseractJob {
  /**
   * constructor
   *
   * @name constructor
   * @function initial a TesseractJob
   * @access public
   * @param {object} worker - An instance of TesseractWorker
   */
  constructor(worker) {
    jobCounter += 1;
    this.id = `Job-${jobCounter}-${Math.random().toString(16).slice(3, 8)}`;

    this._worker = worker;

    /**
     * As all the callback functions are saved in an array.
     * Basically you can register more than callback function
     * for then, catch, progress and finally.
     */
    this._resolve = [];
    this._reject = [];
    this._progress = [];
    this._finally = [];
  }

  /**
   * then
   *
   * @name then
   * @function A function to chain like Promise
   * @access public
   * @param {function} resolve - called when the job succeeds
   * @param {function} reject - called when the job fails
   */
  then(resolve, reject) {
    if (this._resolve.push) {
      this._resolve.push(resolve);
    } else {
      resolve(this._resolve);
    }

    if (reject) this.catch(reject);
    return this;
  }

  /**
   * catch
   *
   * @name catch
   * @function register a function to call when there is an error
   * @access public
   * @param {function} reject - callback function for error
   */
  catch(reject) {
    if (this._reject.push) {
      this._reject.push(reject);
    } else {
      reject(this._reject);
    }
    return this;
  }

  /**
   * progress
   *
   * @name progress
   * @function register a function to show progress of the recognition,
   *   use res.progress to print the message
   * @access public
   * @param {function} fn - callback function for progress information
   */
  progress(fn) {
    this._progress.push(fn);
    return this;
  }

  /**
   * finally
   *
   * @name finally
   * @function registry a callback function for final
   * @access public
   * @param {function} fn - callback function for final
   */
  finally(fn) {
    this._finally.push(fn);
    return this;
  }

  /**
   * send
   *
   * @name send
   * @function send specific action with payload a worker
   * @access public
   * @param {string} action - action to trigger, should be "recognize" or "detect"
   * @param {object} payload - data to be consumed
   */
  send(action, payload) {
    adapter.sendPacket(this._worker, {
      jobId: this.id,
      action,
      payload,
    });
  }

  /**
   * handle
   *
   * @name handle
   * @function execute packet action
   * @access public
   * @param {object} packet action and payload to handle
   */
  handle(packet) {
    const { data } = packet;
    let runFinallyCbs = false;

    if (packet.status === 'resolve') {
      if (this._resolve.length === 0) console.log(data);
      this._resolve.forEach((fn) => {
        const ret = fn(data);
        if (ret && typeof ret.then === 'function') {
          console.warn('TesseractJob instances do not chain like ES6 Promises. To convert it into a real promise, use Promise.resolve.');
        }
      });
      this._resolve = data;
      this._worker.dequeue();
      runFinallyCbs = true;
    } else if (packet.status === 'reject') {
      if (this._reject.length === 0) console.error(data);
      this._reject.forEach(fn => fn(data));
      this._reject = data;
      this._worker.dequeue();
      runFinallyCbs = true;
    } else if (packet.status === 'progress') {
      this._progress.forEach(fn => fn(data));
    } else {
      console.warn('Message type unknown', packet.status);
    }

    if (runFinallyCbs) {
      this._finally.forEach(fn => fn(data));
    }
  }
}

module.exports = TesseractJob;

},{"../node/":"../node_modules/tesseract.js/src/browser/index.js"}],"../node_modules/tesseract.js/src/common/TesseractWorker.js":[function(require,module,exports) {
/**
 *
 * The core part of tesseract.js to execute the OCR jobs.
 *
 * @fileoverview Worker for OCR jobs
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
const check = require('check-types');

const resolveURL = true ? require('resolve-url') : s => s;

const adapter = require('../node');

const circularize = require('./circularize');

const TesseractJob = require('./TesseractJob');
/**
 * TesseractWorker
 * @name TesseractWorker
 * @function execute TesseractJob with a queue mechanism
 * @access public
 */


class TesseractWorker {
  /**
   * constructor
   *
   * @name constructor
   * @function initialize the worker
   * @access public
   * @param {object} options - worker configurations
   * @param {string} options.workerPath -
   *     A remote path to load worker script.
   *     In browser-like environment, it is downloaded from a CDN service.
   *     Please update this option if you self-host the worker script.
   *     In Node.js environment, this option is not used as the worker script is in local.
   * @param {string} options.corePath -
   *     A remote path to load tesseract.js-core script.
   *     In browser-like environment, it is downloaded from a CDN service.
   *     Please update this option if you self-host the core script.
   *     In Node.js environment, this option is not used as the core script is in local.
   * @param {string} options.langPath -
   *     A remote path to load *.traineddata.gz, it is download from a CDN service.
   *     Please update this option if you self-host the worker script.
   * @param {string} [options.cachePath=.] - @see {@link https://github.com/jeromewu/tesseract.js-utils/blob/master/src/loadLang.js}
   * @param {string} [options.cacheMethod=write] - @see {@link https://github.com/jeromewu/tesseract.js-utils/blob/master/src/loadLang.js}
   * @param {string} [options.dataPath=.] - @see {@link https://github.com/jeromewu/tesseract.js-utils/blob/master/src/loadLang.js}
   *
   */
  constructor(options = {}) {
    this.worker = null;
    this.options = { ...adapter.defaultOptions,
      ...options
    };
    ['corePath', 'workerPath', 'langPath'].forEach(key => {
      if (check.not.undefined(options[key])) {
        this.options = { ...this.options,
          [key]: resolveURL(options[key])
        };
      }
    });
    this._currentJob = null;
    this._queue = [];
  }
  /**
   * recognize
   *
   * @name recognize
   * @function recognize text in given image
   * @access public
   * @param {Buffer, string} image - image to be recognized
   * @param {string} [lang=eng] - language to recognize
   * @param {object} params - tesseract parameters
   *
   */


  recognize(image, lang = 'eng', params = {}) {
    return this._sendJob('recognize', image, lang, params);
  }
  /**
   * detect
   *
   * @name detect
   * @function detect language of the text in the image
   * @access public
   * @param {Buffer, string} image - image to be recognized
   * @param {object} params - tesseract parameters
   *
   */


  detect(image, params = {}) {
    return this._sendJob('detect', image, 'osd', params);
  }
  /**
   * recv
   *
   * @name recv
   * @function handle completed job
   * @access public
   * @param {object} packet job data
   */


  recv(packet) {
    if (this._currentJob.id === packet.jobId) {
      this._currentJob.handle({ ...packet,
        data: packet.status === 'resolve' && packet.action === 'recognize' ? circularize(packet.data) : packet.data
      });
    } else {
      console.warn(`Job ID ${packet.jobId} not known.`);
    }
  }
  /**
   * dequeue
   *
   * @name dequeue
   * @function dequeue and execute the rear job
   * @access public
   */


  dequeue() {
    this._currentJob = null;

    if (this._queue.length) {
      this._queue[0]();
    }
  }
  /**
   * terminate
   *
   * @name terminate
   * @function terminate the worker
   * @access public
   *
   */


  terminate() {
    if (this.worker) {
      adapter.terminateWorker(this);
    }

    this.worker = null;
    this._currentJob = null;
    this._queue = [];
  }
  /**
   * _sendJob
   *
   * @name _sendJob
   * @function append a new job to the job queue
   * @access private
   * @param {string} type job type, should be recognize or detect
   * @param {Buffer, string} image image to recognize
   * @param {string} lang language to recognize
   * @param {object} params tesseract parameters
   */


  _sendJob(type, image, lang, params) {
    return this._delay(job => {
      job.send(type, {
        image,
        lang,
        params,
        options: this.options
      });
    });
  }
  /**
   * _delay
   *
   * @name _delay
   * @function delays the fn to execute until it is on the rear of the queue
   * @access private
   * @param {function} fn A handler function for the job
   */


  _delay(fn) {
    if (check.null(this.worker)) {
      this.worker = adapter.spawnWorker(this, this.options);
    }

    const job = new TesseractJob(this);

    this._queue.push(() => {
      this._queue.shift();

      this._currentJob = job;
      fn(job);
    });

    if (check.null(this._currentJob)) {
      this.dequeue();
    }

    return job;
  }

}

module.exports = TesseractWorker;
},{"check-types":"../node_modules/check-types/src/check-types.js","resolve-url":"../node_modules/resolve-url/resolve-url.js","../node":"../node_modules/tesseract.js/src/browser/index.js","./circularize":"../node_modules/tesseract.js/src/common/circularize.js","./TesseractJob":"../node_modules/tesseract.js/src/common/TesseractJob.js"}],"../node_modules/tesseract.js/src/index.js":[function(require,module,exports) {
/**
 *
 * Entry point for tesseract.js, should be the entry when bundling.
 *
 * @fileoverview entry point for tesseract.js
 * @author Kevin Kwok <antimatter15@gmail.com>
 * @author Guillermo Webster <gui@mit.edu>
 * @author Jerome Wu <jeromewus@gmail.com>
 */
const utils = require('tesseract.js-utils');
const TesseractWorker = require('./common/TesseractWorker');

module.exports = {
  /** Worker for OCR, @see common/TesseractWorker.js */
  TesseractWorker,
  /** Utilities for tesseract.js, @see {@link https://www.npmjs.com/package/tesseract.js-utils} */
  utils,
};

},{"tesseract.js-utils":"../node_modules/tesseract.js-utils/src/index.browser.js","./common/TesseractWorker":"../node_modules/tesseract.js/src/common/TesseractWorker.js"}],"js/index.js":[function(require,module,exports) {
"use strict";

var _tesseract = _interopRequireDefault(require("tesseract.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var TesseractWorker = _tesseract.default.TesseractWorker;
var worker = new TesseractWorker({// langPath: document.URL + 'tessdata/'
}); // Speech

var synth = window.speechSynthesis;
var inputTxt = document.querySelector('.txt');
var voiceSelect = document.querySelector('.voice-select');
var playButton = document.querySelector('#play');
var stopButton = document.querySelector('#stop');
var autoplay = document.querySelector('#autoplay');
var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value');
var voices = [];

function populateVoiceList() {
  voices = synth.getVoices();
  var ENGKORVoices = voices.filter(function (v) {
    return v.lang == "en-US" || v.lang == "ko-KR";
  });
  var nonENGKORVoices = voices.filter(function (v) {
    return !(v.lang == "en-US" || v.lang == "ko-KR");
  });
  ENGKORVoices.sort(function (a, b) {
    var aname = a.name.toUpperCase(),
        bname = b.name.toUpperCase();
    if (aname < bname) return -1;else if (aname == bname) return 0;else return +1;
  });
  nonENGKORVoices.sort(function (a, b) {
    var aname = a.name.toUpperCase(),
        bname = b.name.toUpperCase();
    if (aname < bname) return -1;else if (aname == bname) return 0;else return +1;
  });
  voices = [].concat(_toConsumableArray(ENGKORVoices), _toConsumableArray(nonENGKORVoices));
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex; // voiceSelect.innerHTML = '';

  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if (voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.error('speechSynthesis.speaking');
    return;
  }

  if (inputTxt.value !== '') {
    var utterThis = new SpeechSynthesisUtterance(inputTxt.value);

    utterThis.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend');
    };

    utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
    };

    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');

    for (var i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
      }
    }

    utterThis.pitch = pitch.value;
    utterThis.rate = rate.value;
    synth.speak(utterThis);
  }
}

playButton.onclick = function (event) {
  event.preventDefault();
  speak();
  inputTxt.blur();
};

stopButton.onclick = function (event) {
  event.preventDefault();
  synth.cancel();
};

pitch.onchange = function () {
  pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
  rateValue.textContent = rate.value;
}; // Image


document.onImageSelected = function (event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();
  var imgtag = document.querySelector(".input-image");
  var progressText = document.querySelector(".progress-text");
  var language = document.querySelector(".language-select").value;

  reader.onload = function (event) {
    imgtag.src = event.target.result;
    worker.recognize(event.target.result, language).progress(function (message) {
      progressText.innerHTML = message.status + " ( " + message.progress.toFixed(2) + "% )";
    }).then(function (result) {
      progressText.innerHTML = "Done!";
      console.log(result);
      inputTxt.value = result.text;
      if (autoplay.checked) speak();
    });
  };

  reader.readAsDataURL(selectedFile);
};
},{"tesseract.js":"../node_modules/tesseract.js/src/index.js"}],"../../../../../../../home/exqt/.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "13727" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../../home/exqt/.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/index.js"], null)
//# sourceMappingURL=/js.00a46daa.js.map