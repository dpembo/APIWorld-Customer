/* Copyright (c) 2017-2020 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates and/or their licensors. 
 * Use, reproduction, transfer, publication or disclosure is prohibited except as specifically provided for in your License Agreement with Software AG. 
 */

'use strict';
(function () {
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach (callback, thisArg) {
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a functionQQQQQ');
      }
      var array = this;
      thisArg = thisArg || this;
      for (var i = 0, l = array.length; i !== l; ++i) {
        callback.call(thisArg, array[i], i, array);
      }
    };
  }
})();