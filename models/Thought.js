const { Schema, model } = require('mongoose');
const reactionSchema = require('./Reaction');

const thoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 280,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (timestamp) => new Date(timestamp).toLocaleString(), 
    },
    username: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: 'username'
    },
    reactions: [reactionSchema],
  },
  {
    toJSON: {
      getters: true,
    },
    toObject: { virtuals: true },

  }
);

thoughtSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
  });

const Thought = model('Thought', thoughtSchema);

module.exports = Thought;
