var hat = require('hat')
var peerdb = require('../')
var test = require('tape')

test('put, get (buffer)', function (t) {
  t.plan(6)
  var value = Buffer('some data')
  peerdb.put(value, function (err, key) {
    t.error(err)
    t.equal(typeof key, 'string')

    peerdb.get(key, function (err, value2) {
      t.error(err)
      t.ok(Buffer.isBuffer(value))
      t.deepEqual(value, value2)
      peerdb.close(t.error)
    })
  })
})

test('get timeout', function (t) {
  t.plan(3)
  var key = hat(160)
  peerdb.get(key, function (err, value) {
    t.ok(err instanceof Error)
    t.ok(err.message.indexOf('not found') !== -1)
    peerdb.close(t.error)
  })
})
