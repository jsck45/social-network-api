const mongoose = require('mongoose');
const { Thought } = require('../models');

module.exports = {
    async getThoughts(req, res) {
        try {
          const thoughts = await Thought.find()
            .populate({
              path: 'username',
              select: 'username', 
            })
            .populate('reactions')
            .select('-__v');
      
          if (!thoughts || thoughts.length === 0) {
            return res.status(404).json({ message: 'No thoughts found' });
          }
      
          // Create a new array with the desired format (excluding unwanted fields)
          const formattedThoughts = thoughts.map((thought) => ({
            _id: thought._id,
            thoughtText: thought.thoughtText,
            username: thought.username.username, // Extract the username field
            createdAt: thought.createdAt,
            reactions: thought.reactions,
            reactionCount: thought.reactionCount,
            id: thought.id,
          }));
      
          const thoughtObj = {
            thoughts: formattedThoughts,
          };
      
          res.json(thoughtObj);
        } catch (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      },
      
      
      

      async getSingleThought(req, res) {
        try {
          const thought = await Thought.findOne({ _id: req.params.thoughtId })
            .populate({
              path: 'username',
              select: 'username',
            })
            .select('-__v');
      
          if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
          }
      
          const formattedThought = {
            _id: thought._id,
            thoughtText: thought.thoughtText,
            username: thought.username.username, // Extract the username field
            createdAt: thought.createdAt,
            reactions: thought.reactions,
            reactionCount: thought.reactionCount,
            id: thought.id,
          };
      
          res.json({
            thought: formattedThought,
          });
        } catch (err) {
          console.log(err);
          return res.status(500).json(err);
        }
      },
      

    async createThought(req, res) {
      try {
        const thought = await Thought.create(req.body);
        res.json(thought);
      } catch (err) {
        res.status(500).json(err);
      }
    },

        async updateThought(req, res) {
          try {
            const { thoughtId } = req.params;
            const { thoughtText } = req.body;
      
            if (!thoughtText) {
              return res.status(400).json({ message: 'thoughtText is required' });
            }
      
            const updatedThought = await Thought.findOneAndUpdate(
              { _id: thoughtId },
              { thoughtText }, 
              { new: true }
            );
      
            if (!updatedThought) {
              return res.status(404).json({ message: 'No thought with that ID' });
            }
      
            res.json(updatedThought);
          } catch (err) {
            console.error(err);
            res.status(500).json(err);
          }
        },

    async deleteThought(req, res) {
      try {
        const thought = await Thought.findOneAndRemove({ _id: req.params.thoughtId });
  
        if (!thought) {
          return res.status(404).json({ message: 'No such thought exists' });
        }
   
        res.json({ message: 'Thought successfully deleted' });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    },
  
    async addReaction(req, res) {
        try {
          const { thoughtId } = req.params;
          const { reactionBody, username } = req.body;
      
          const thought = await Thought.findOne({ _id: thoughtId });
      
          console.log('Type of reactionId from req.params:', typeof thoughtId);

          if (!thought) {
            return res.status(404).json({ message: 'No thought found with that ID' });
          }
      
          thought.reactions.push({ reactionBody, username }); // Add the reaction without specifying reactionId
      
          const updatedThought = await thought.save();
      
          const formattedThought = {
            _id: updatedThought._id,
            thoughtText: updatedThought.thoughtText,
            username: updatedThought.username.username, // Extract the username field
            createdAt: updatedThought.createdAt,
            reactions: updatedThought.reactions.map((reaction) => ({
                reactionId: reaction.reactionId,
                reactionBody: reaction.reactionBody,
                username: reaction.username.username, // Assuming you want to extract the username field
                createdAt: reaction.createdAt,
              })),
            reactionCount: updatedThought.reactionCount,
            id: updatedThought.id,
          };
      
          res.json(formattedThought);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      },
      
      async removeReaction(req, res) {
        try {
          const { thoughtId, reactionId } = req.params;
      
          console.log('thoughtId:', thoughtId);
          console.log('reactionId:', reactionId);
      
          const thought = await Thought.findOne({ _id: thoughtId });
      
          console.log('thought:', thought);
      
          if (!thought) {
            return res.status(404).json({ message: 'No thought found with that ID' });
          }
      
          const reactionObjectId = new mongoose.Types.ObjectId(reactionId);
      
          if (!thought.reactions.some(reaction => reaction.reactionId.equals(reactionObjectId))) {
            return res.status(400).json({ message: 'Reaction not found in the thought' });
          }
      
          const updatedThought = await Thought.findByIdAndUpdate(
            thoughtId,
            { $pull: { reactions: { reactionId: reactionObjectId } } },
            { new: true }
          );         
      
          const formattedThought = {
            _id: updatedThought._id,
            thoughtText: updatedThought.thoughtText,
            username: updatedThought.username.username,
            createdAt: updatedThought.createdAt,
            reactions: updatedThought.reactions,
            reactionCount: updatedThought.reactionCount,
          };
      
          res.json(formattedThought);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      }
    };      