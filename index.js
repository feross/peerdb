module.exports = PeerDB

var once = require('once')
var WebTorrent = require('webtorrent')

var CLIENT_OPTS = {
  announce: 'wss://tracker.webtorrent.io'
}

function PeerDB () {
  this.destroyed = false
  this._client = new WebTorrent({
    dht: false
  })
}

PeerDB._getDefaultInstance = function () {
  if (!this._defaultInstance) {
    this._defaultInstance = new PeerDB()
  }
  return this._defaultInstance
}

PeerDB.put = function (value, cb) {
  var db = this._getDefaultInstance()
  db.put(value, cb)
}

PeerDB.get = function (key, cb) {
  var db = this._getDefaultInstance()
  db.get(key, cb)
}

PeerDB.del = function (key, cb) {
  var db = this._getDefaultInstance()
  db.del(key, cb)
}

PeerDB.close = function (cb) {
  var db = this._getDefaultInstance()
  this._defaultInstance = null
  db.close(cb)
}

PeerDB.prototype.put = function (value, cb) {
  this._checkOpen()
  if (!cb) cb = noop
  cb = once(cb)

  this._client.seed(value, CLIENT_OPTS)
    .once('error', function (err) {
      cb(err)
    })
    .once('seed', function () {
      cb(null, this.infoHash)
    })
}

PeerDB.prototype.get = function (key, cb) {
  this._checkOpen()
  if (!cb) cb = noop
  cb = once(cb)

  var torrent = this._client.get(key)
  if (!torrent) {
    torrent = this._client.add(key, CLIENT_OPTS)
    torrent.once('error', function (err) {
      cb(err)
    })
  }

  if (torrent.ready) {
    onReady(torrent)
  } else {
    torrent.once('ready', function () {
      onReady(torrent)
    })
  }

  function onReady (torrent) {
    torrent.files[0].getBuffer(cb)
  }
}

PeerDB.prototype.del = function (key, cb) {
  this._checkOpen()
  if (!cb) cb = noop
  cb = once(cb)

  this._client.remove(key)

  // TODO: delete from central server
  process.nextTick(function () {
    cb(null)
  })
}

PeerDB.prototype.close = function (cb) {
  this._checkOpen()
  if (!cb) cb = noop
  cb = once(cb)

  this._client.destroy(function (err) {
    cb(err)
  })

  this.destroyed = true
  this._client = null
}

PeerDB.prototype._checkOpen = function () {
  if (this.destroyed) throw new Error('DB is already destroyed')
}

function noop () {}
