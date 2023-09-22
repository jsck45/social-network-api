const { Schema } = require('mongoose')

const reactionSchema = new Schema(
  {
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280
    },
    username: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: 'username'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (timestamp) => new Date(timestamp).toLocaleString()
    },
  },
  {
    toJSON: {
      getters: true,
      transform: (doc, ret) => {
        ret.reactionID = doc._id
        delete ret._id
        delete ret.__v
      },
    }
  }
);

module.exports = reactionSchema
