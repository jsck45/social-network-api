const mongoose = require('mongoose');
const { User, Thought } = require('../models');

module.exports = {
  async getUsers(req, res) {
    try {
      const users = await User.find()
        .populate({
          path: 'thoughts',
          select: 'thoughtText reactions', 
          populate: {
            path: 'reactions',
            select: 'reactionBody username', 
            populate: {
              path: 'username',
              select: 'username',
            },
          },
        })
        .populate({
          path: 'friends',
          select: 'username',
        })
        .select('-__v');
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      const formattedUsers = users.map((user) => ({
        userID: user._id,
        username: user.username,
        email: user.email,
        thoughts: user.thoughts.map((thought) => ({
          thoughtID: thought._id,
          thoughtText: thought.thoughtText,
          reactionCount: thought.reactions.length, 
          reactions: thought.reactions.map((reaction) => ({
            reactionID: reaction._id,
            reaction: reaction.reactionBody,
            username: reaction.username ? reaction.username.username : null,
          })),
        })),
        friendCount: user.friendCount,
        friends: user.friends.map((friend) => ({ friendID: friend._id, username: friend.username })),    
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
        .populate({
          path: 'thoughts',
          select: 'thoughtText reactions',
          populate: {
            path: 'reactions',
            select: 'reactionBody username',
            populate: {
              path: 'username',
              select: 'username',
            },
          },
        })
        .populate({
          path: 'friends',
          select: 'username',
        })
        .select('-__v');
  
      if (!user) {
        return res.status(404).json({ message: 'No user with that ID' });
      }
  
      const formattedUser = {
        userID: user._id,
        username: user.username,
        email: user.email,
        thoughts: user.thoughts.map((thought) => ({
          thoughtID: thought._id,
          thoughtText: thought.thoughtText,
          reactionCount: thought.reactions.length,
          reactions: thought.reactions.map((reaction) => ({
            reactionID: reaction._id,
            reaction: reaction.reactionBody,
            username: reaction.username ? reaction.username.username : null,
          })),
        })),
        friendCount: user.friendCount,
        friends: user.friends.map((friend) => ({ friendID: friend._id, username: friend.username })),
      };
  
      res.json(formattedUser);
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
      
          const user = await User.findOne({ _id: userId })
      
          if (!user) {
            return res.status(404).json({ message: 'No user found with that ID' });
          }
      
          if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ message: 'Invalid friendId' });
          }
      
          user.friends.addToSet(friendId);
      
          await user.save();
      
          const formattedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            friendCount: user.friendCount,
            friends: user.friends   
          };
      
          res.json(formattedUser);
        
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
      
          await user.save();
      
          const formattedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            friendCount: user.friendCount,
            friends: user.friends   
          };
      
          res.json(formattedUser);
        
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      }
  };
  