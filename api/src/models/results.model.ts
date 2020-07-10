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
    tId: { type: String },
    bId: { type: String },
    info: {
      bN: { type: Number },
      bT: { type: String },
      bV: { type: Number },
      contract: { type: String },
      by: { type: Number },
      lead: { type: String },
      cc: { type: Array },
      pairs: { type: Array },
      t2: {type: String }
    },
    players: { type: Array },  //JSON string
    bids: { type: String },
    plays: { type: String },
    result: { type: Number },
    score: { type: Number },
    mix: { type: Number },
    played: { type: Date, default: Date.now }
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
}
