# peerdb [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/feross/peerdb/master.svg
[travis-url]: https://travis-ci.org/feross/peerdb
[npm-image]: https://img.shields.io/npm/v/peerdb.svg
[npm-url]: https://npmjs.org/package/peerdb
[downloads-image]: https://img.shields.io/npm/dm/peerdb.svg
[downloads-url]: https://npmjs.org/package/peerdb

### TODO -- WORK IN PROGRESS

[![Sauce Test Status](https://saucelabs.com/browser-matrix/peerdb.svg)](https://saucelabs.com/u/peerdb)

## features

- Encrypts files (by default)
- Modes: central-only, P2P-only (free), hybrid (default)
- Backed by MaxCDN
- 100% open source client and server
- Useful for "serverless websites" (i.e. no backend)

## why?

- Simple API (compare to Amazon S3, CloudFront, requires server-side?)
- Cheap
- Using a trustless server to add availability to a P2P app
- 100% of profits will go to the development of WebTorrent and WebTorrent Desktop

## install

```
npm install peerdb
```

## usage

It's super easy to store data:

```js
var db = require('peerdb')

db.put(Buffer('some data'), function (err, id) {
  // `id` is a unique identifier based on the data (content-addressed)
  db.get(id, function (err, data) {
    console.log(data) // 'some data'
  })
})
```

To ensure that data remains accessible when no peers are online, store it
on a centralized content delivery network (CDN):

```js
var db = require('peerdb')

db.setup({
  apiKey: '...'
})

db.put(Buffer('some data'), function (err, id) {
  // `id` is a unique identifier based on the data (content-addressed)
  db.get(id, function (err, data) {
    console.log(data) // 'some data'

    // Data can be deleted from the central server and the local database
    db.del(id, function (err) {
      // Data is
    })
  })
})
```

## api

TODO

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).
