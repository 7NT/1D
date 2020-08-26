// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations'

export default function (app: Application) {
  const modelName = 'users'
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema(
    {
      nick: { type: String, unique: true },
      email: { type: String, unique: true, lowercase: true, required: true },
      password: { type: String },

      // googleId: { type: String },
      // facebookId: { type: String },
      name: { type: String },
      avatar: { type: String },
      locale: { type: String },
      country: { type: String },
      flag: { type: String },
      status: { type: Number, default: 0 },
      state: { type: Number, default: 0 },
      logoutAt: { type: Date },
      seat: {
        tId: { type: String },
        sId: { type: Number },
      }
    },
    {
      timestamps: true
    }
  )

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model(modelName, schema)
}
