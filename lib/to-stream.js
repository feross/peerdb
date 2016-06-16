/* global Blob */

module.exports = toStream

var FileReadStream = require('filestream/read')
var fs = require('fs')
var stream = require('readable-stream')

function toStream (obj) {
  if (obj instanceof Blob) {
    return fromBlob(obj)
  }
  if (Buffer.isBuffer(obj)) {
    return fromBuffer(obj)
  }
  if (typeof obj === 'string') {
    return fromFilePath(obj)
  }
}

/**
 * Convert a `File` to a lazy readable stream.
 * @param  {File|Blob} file
 * @return {function}
 */
function fromBlob (file) {
  return new FileReadStream(file)
}

/**
 * Convert a `Buffer` to a lazy readable stream.
 * @param  {Buffer} buffer
 * @return {function}
 */
function fromBuffer (buffer) {
  var s = new stream.PassThrough()
  s.end(buffer)
  return s
}

/**
 * Convert a file path to a lazy readable stream.
 * @param  {string} path
 * @return {function}
 */
function fromFilePath (path) {
  return fs.createReadStream(path)
}
