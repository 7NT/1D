// results-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations';

export default function (app: Application) {
  const modelName = 'results';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;

  const schema = new Schema({
    boardId: { type: Schema.Types.ObjectId, ref: "boards", required: true },
    info: {
      bN: { type: Number },
      bT: { type: String },
      contract: { type: String },
      by: { type: Number }
    },
    players: { type: String },
    bids: { type: String },
    plays: { type: String },
    result: { type: Number },
    score: { type: Number },
    mix: { type: Number }
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}
