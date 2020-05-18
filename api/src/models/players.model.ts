// players-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations';

export default function (app: Application) {
  const modelName = 'players';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    id: { type: Schema.Types.ObjectId, ref: "users" },
    nick: { type: String, required: true },
    profile: {
      flag: { type: String },
      avatar: { type: String }
    },
    seat: {
      sId: { type: Number },
      sId0: { type: Number },
      tId: { type: Schema.Types.ObjectId, ref: "table" },
      tId0: { type: Schema.Types.ObjectId, ref: "table" }
    },
    status: { type: Number },
    state: { type: Number }
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}
