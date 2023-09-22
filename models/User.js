const { Schema, model } = require('mongoose')

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

          return emailRegex.test(value)
        },
        message: 'Invalid email format'
      },
    },
    thoughts: [{ type: Schema.Types.ObjectId, ref: 'Thought' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    toJSON: {
      getters: true
    },
    toObject: { virtuals: true }
  },
)

userSchema.virtual('friendCount').get(function () {
  return this.friends ? this.friends.length : 0
});

const User = model('User', userSchema)

module.exports = User
