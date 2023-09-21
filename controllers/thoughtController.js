const mongoose = require('mongoose');
const { Thought, Reaction } = require('../models');

module.exports = {
    async getThoughts(req, res) {
        try {
          const thoughts = await Thought.find()
            .populate({
              path: 'username',
              select: 'username', 
            })
            .populate({
              path: 'reactions.username',
              model: 'User',
              select: 'username',
            })            
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
            reactionCount: thought.reactionCount,
            reactions: thought.reactions.map((reaction) => ({
              reactionId: reaction.reactionId,
              reactionBody: reaction.reactionBody,
              username: reaction.username.username,
              createdAt: reaction.createdAt,
            })),         
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
            .populate({
              path: 'reactions.username',
              model: 'User',
              select: 'username',
            })
            .select('-__v');
      
          if (!thought) {
            return res.status(404).json({ message: 'No thought with that ID' });
          }
      
          const formattedThought = {
            _id: thought._id,
            thoughtText: thought.thoughtText,
            username: thought.username.username, 
            createdAt: thought.createdAt,
            reactionCount: thought.reactionCount,
            reactions: thought.reactions.map((reaction) => ({
              reactionId: reaction.reactionId,
              reactionBody: reaction.reactionBody,
              username: reaction.username.username,
              createdAt: reaction.createdAt,
            })),         
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

        const formattedThought = {
            _id: thought._id,
            thoughtText: thought.thoughtText,
            username: thought.username.username, 
            createdAt: thought.createdAt,
            reactionCount: thought.reactionCount, 
          };
      
          res.json({
            thought: formattedThought,
          });      
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
      
          const thought = await Thought.findOne({ _id: thoughtId })
            .populate('username')
            .populate({
              path: 'reactions.username',
              model: 'User',
              select: 'username',
            });
      
          if (!thought) {
            return res.status(404).json({ message: 'No thought found with that ID' });
          }
            
          const newReaction = {
            reactionBody,
            username: username,
          };
      
          thought.reactions.push(newReaction);
      
          const updatedThought = await thought.save();
      
          const formattedThought = {
            thoughtId: updatedThought.id,
            thoughtText: updatedThought.thoughtText,
            username: updatedThought.username.username,
            createdAt: updatedThought.createdAt,
            reactionCount: updatedThought.reactionCount,
            reactions: updatedThought.reactions.map((reaction) => ({
              reactionId: reaction._id, 
              reactionBody: reaction.reactionBody,
              username: reaction.username.username,
              createdAt: reaction.createdAt,
            })),
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
      
          const thought = await Thought.findOne({ _id: thoughtId });
      
          if (!thought) {
            return res.status(404).json({ message: 'No thought found with that ID' });
          }
      
          await Thought.findByIdAndUpdate(
            thoughtId,
            { $pull: { reactions: { _id: reactionId } } }
          );
      
          const updatedThought = await Thought.findById(thoughtId).populate('username');
      
          const formattedThought = {
            thoughtId: updatedThought._id,
            thoughtText: updatedThought.thoughtText,
            username: updatedThought.username.username,
            createdAt: updatedThought.createdAt,
            reactionCount: updatedThought.reactionCount,
            reactions: updatedThought.reactions.map((reaction) => ({
              reactionId: reaction._id, 
              reactionBody: reaction.reactionBody,
              username: reaction.username.username,
              createdAt: reaction.createdAt,
            })),
          };
      
          res.json(formattedThought);
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      }
    };      