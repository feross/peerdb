module.exports = PeerDB

var magnet = require('magnet-uri')
var once = require('once')
var parallel = require('run-parallel')
var WebTorrent = require('webtorrent')
var xhr = require('xhr')

var ANNOUNCE = 'wss://tracker.webtorrent.io'
var TIMEOUT = 20000
var UPLOAD_URL = typeof window !== 'undefined' && window.location.hostname
  ? 'http://localhost:9200/uploads/'
  : 'http://peerdb.io/uploads/'

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

  var opts = {
    announce: ANNOUNCE,
    name: 'PeerDB User Data'
  }

  var torrent = this._client.seed(value, opts)

  torrent.once('error', function (err) {
    cb(err)
  })

  torrent.once('seed', onSeed)

  function onSeed () {
    torrent.files[0].getBuffer(function (err, buf) {
      if (err) return cb(err)

      parallel([
        // Upload torrent data
        function (cb) {
          xhr({
            method: 'POST',
            body: buf,
            url: UPLOAD_URL + '?key=' + torrent.infoHash
          }, function (err, res) {
            if (err) return cb(err)
            if (res.statusCode !== 200) {
              return cb('PeerDB: Upload failed with http response: ' + res.statusCode)
            }
            cb(null)
          })
        },
        // Upload torrent metadata (.torrent file)
        function (cb) {
          xhr({
            method: 'POST',
            body: torrent.torrentFile,
            url: UPLOAD_URL + '?key=' + torrent.infoHash + '&torrent=true'
          }, function (err, res) {
            if (err) return cb(err)
            if (res.statusCode !== 200) {
              return cb('PeerDB: Upload failed with http response: ' + res.statusCode)
            }
            cb(null)
          })
        }
      ], function (err) {
        cb(err, torrent.infoHash)
      })
    })
  }
}

PeerDB.prototype.get = function (key, cb) {
  this._checkOpen()
  if (!cb) cb = noop
  cb = once(cb)

  var torrent = this._client.get(key)
  if (!torrent) {
    var opts = {
      infoHash: key,
      announce: ANNOUNCE,
      urlList: UPLOAD_URL + key,
      xs: UPLOAD_URL + key + '.torrent'
    }

    torrent = this._client.add(magnet.encode(opts), opts)
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

  var timeout = setTimeout(function () {
    cb(new Error('PeerDB: key "' + key + '" not found'))
  }, TIMEOUT)

  function onReady (torrent) {
    torrent.files[0].getBuffer(function (err, value) {
      clearTimeout(timeout)
      cb(err, value)
    })
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
  if (this.destroyed) {
    throw new Error('PeerDB: database is closed')
  }
}

function noop () {}
