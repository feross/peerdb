var aes = require('browserify-aes')
var randombytes = require('randombytes')

/**
 * The IV value is re-used across calls to cipher(), since it's used with a new key
 * each time.
 */
var IV = Buffer.alloc(16)

exports.createCipher = function () {
  var key = randombytes(16)
  var cipher = aes.createCipheriv('aes-128-ctr', key, IV)
  cipher.key = key
  return cipher
}

exports.createDecipher = function (key) {
  return aes.createDecipheriv('aes-128-ctr', key, IV)
}
