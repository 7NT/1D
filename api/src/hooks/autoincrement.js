'use strict'
const Datastore = require('nedb'),
  db = {},
  dbfunc = {}

db.autoincrement = new Datastore({ filename: 'data/autoincrement.db', autoload: true })

dbfunc.autoId = function getUniqueId(nameDb, cb) {
  db.autoincrement.findOne({ name: nameDb }, function (err, doc) {
    if (err) {
      throw err
    } else {
      if (doc) {
        const itemID = doc.nextId + 1
        db.autoincrement.update({ name: nameDb }, {
          name: nameDb,
          nextId: itemID
        }, {}, function (err, numReplaced) {
          db.autoincrement.persistence.compactDatafile()
          if (err) {
            throw err
          } else {
            // console.log(numReplaced)
          }
          cb(doc.nextId)
        })
      } else {
        const data = {
          name: nameDb,
          nextId: 2
        }

        db.autoincrement.insert(data, function (err, newDoc) {
          if (err) {
            throw err
          } else {
            // console.log(newDoc)
          }
          cb(1)
        })
      }
    }

  })
}

module.exports = dbfunc
