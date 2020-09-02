import app from './app'

const users$ = app.service('users')
let n0: Number = 0
let n1: Number = 0

function getUsers () {
  users$.find({ paginate: false }) // { default: 22224, max: 22224 }
    .then(users => {
      n0 = users.length
      users.forEach((user: any) => {
        updateUser(user)
      })
    })
    .catch(err => {
      console.error(err)
    })
}
async function updateUser (u0: { id?: any; nick?: any; _id: any; password: any }) {
  try {
    console.log(u0.id, u0.nick, u0.password)
    const u1 = await users$.patch(u0._id, { password: u0.password })
    n1++
    console.log(n1 + '/' + n0, u1.id, u1.nick, u1.password)
  } catch (err) {
    console.error(err)
  }
}

getUsers()
