const mongoose = require('mongoose');
const { User, Thought } = require('../models');

module.exports = {
  async getUsers(req, res) {
    try {
      const users = await User.find()
      .populate({
        path: 'thoughts',
        model: 'Thought',
      })        
      .populate('friends')
        .select('-__v');

        console.log(users);

  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      // Format each user individually
      const formattedUsers = users.map((user) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        thoughts: user.thoughts,
        friendCount: user.friendCount,
        friends: user.friends,
      }));
  
      res.json(formattedUsers);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  

    async getSingleUser(req, res) {
      try {
        const user = await User.findOne({ _id: req.params.userId })
        .populate('thoughts')
          .select('-__v');
  
        if (!user) {
          return res.status(404).json({ message: 'No user with that ID' })
        }
  
        res.json({
          user,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json(err);
      }
    },

    async createUser(req, res) {
      try {
        const user = await User.create(req.body);
        res.json(user);
      } catch (err) {
        res.status(500).json(err);
      }
    },

    async updateUser(req, res) {
        try {
          const userId = req.params.userId;
          const { username, email } = req.body; 
      
          const updatedUserData = {};
          if (username) {
            updatedUserData.username = username;
          }
          if (email) {
            updatedUserData.email = email;
          }
      
          const user = await User.findOneAndUpdate(
            { _id: userId },
            updatedUserData,
            { new: true }
          );
      
          if (!user) {
            return res.status(404).json({ message: 'No user with that ID' });
          }
      
          res.json(user);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      },
      

    async deleteUser(req, res) {
      try {
        const user = await User.findOneAndRemove({ _id: req.params.userId });
  
        if (!user) {
          return res.status(404).json({ message: 'No such user exists' });
        }
  
        const thought = await Thought.findOneAndUpdate(
          { users: req.params.userId },
          { $pull: { users: req.params.userId } },
          { new: true }
        );
  
        if (!thought) {
          return res.status(404).json({
            message: 'User deleted, but no thoughts found',
          });
        }
  
        res.json({ message: 'User successfully deleted' });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    },
  
    async addFriend(req, res) {
        try {
          const { userId, friendId } = req.params;
      
          const user = await User.findOne({ _id: userId });
      
          if (!user) {
            return res.status(404).json({ message: 'No user found with that ID' });
          }
      
          if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid friendId' });
          }
      
          user.friends.addToSet(friendId);
      
          const updatedUser = await user.save();
      
          res.json(updatedUser);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      },
      
      async removeFriend(req, res) {
        try {
          const { userId, friendId } = req.params;
      
          const user = await mongoose.model('User').findOne({ _id: userId });
      
          if (!user) {
            return res.status(404).json({ message: 'No user found with that ID' });
          }
      
          if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid friendId' });
          }
      
          user.friends.pull(friendId);
      
          const updatedUser = await user.save();
      
          res.json(updatedUser);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      }
  };
  