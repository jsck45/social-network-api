const { Schema, Types } = require('mongoose');

const reactionSchema = new Schema(
  {
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280,
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
      get: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  },
  {
    toJSON: {
      getters: true,
    },
  }
);

module.exports = reactionSchema;
