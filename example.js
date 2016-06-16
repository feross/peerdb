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
  console.log('drop!')
  peerdb.put(files[0], function (err, key) {
    if (err) throw err
    console.log('put value as key: ' + key)
  })
})

document.querySelector('html').style.width = '100%'
document.querySelector('html').style.height = '100%'
document.querySelector('html').style.margin = '0'

document.querySelector('body').style.width = '100%'
document.querySelector('body').style.height = '100%'
document.querySelector('body').style.margin = '0'
