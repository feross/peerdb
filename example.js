var peerdb = require('./')

// Make it easier to play with this in the console
if (typeof window !== 'undefined') {
  window.peerdb = peerdb
  window.Buffer = Buffer
}

// var value = Buffer('some data')

// peerdb.put(value, function (err, key) {
//   if (err) throw err
//   console.log('put value as key: ' + key)
//   peerdb.get(key, function (err, value) {
//     if (err) throw err
//     console.log('got value: ' + value)
//   })
// })

var drop = require('drag-drop')

drop('body', function (files) {
  peerdb.put(files[0], function (err, key) {
    if (err) throw err
    window.location.hash = key
  })
})

