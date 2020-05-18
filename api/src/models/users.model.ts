// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations';

export default function (app: Application) {
  const modelName = 'users';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    id: { type: String },
    nick: { type: String, required: true },
    email: { type: String, required: true },
    profile: {
      flag: { type: Number },
      avatar: { type: Number }
    },
    seat: {
      sId: { type: Number },
      tId: { type: Schema.Types.ObjectId, ref: "table" },
    },
    status: { type: Number },
    state: { type: Number },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    logoutAt: { type: Date, default: Date.now }
  });


  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}
