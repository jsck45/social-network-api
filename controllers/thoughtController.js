const mongoose = require('mongoose');
const { User, Thought, Reaction } = require('../models');

module.exports = {
  
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find()
        .populate({
          path: 'reactions',
          populate: {
            path: 'username',
            select: 'username',
          }
        })
        .populate({
          path: 'username',
          populate: 'username',
          select: 'username',
        })

      if (!thoughts || thoughts.length === 0) {
        return res.status(404).json({ message: 'No thoughts found' });
      }

      const formattedThoughts = thoughts.map((thought) => ({
        thoughtId: thought._id,
        thoughtText: thought.thoughtText,
        username: thought.username ? thought.username.username : null,
        createdAt: thought.createdAt,
        reactionCount: thought.reactions.length,
        reactions: thought.reactions.map((reaction) => ({
          reactionId: reaction._id,
          reactionBody: reaction.reactionBody,
          username: reaction.username ? reaction.username.username : null,
          createdAt: reaction.createdAt,
        })),
      }));

      res.json(formattedThoughts);
    } catch (error) {
      throw new Error('Error fetching thoughts: ' + error.message);
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
          reactionId: reaction._id,
          reactionBody: reaction.reactionBody,
          username: reaction.username.username,
          createdAt: reaction.createdAt,
        })),
      }

      res.json({
        thought: formattedThought,
      })
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  async createThought(req, res) {
    try {
      const { thoughtText, username } = req.body;

      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const thought = await Thought.create({
        thoughtText,
        username: user._id, 
      })

      user.thoughts.push(thought._id);

      await user.save();

      res.json('Thought successfully created!');
    } catch (err) {
      console.error(err);
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
        { new: true },
      ).populate('username', 'username');

      if (!updatedThought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      const formattedThought = {
        thoughtId: updatedThought._id,
        thoughtText: updatedThought.thoughtText,
        username: updatedThought.username.username,
        createdAt: updatedThought.createdAt,
        reactions: updatedThought.reactions,
        reactionCount: updatedThought.reactionCount,
      }

      res.json(formattedThought);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  async deleteThought(req, res) {
    try {
      const thought = await Thought.findOneAndRemove({
        _id: req.params.thoughtId,
      })

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
        .populate('username', 'username')
        .populate('reactions.username', 'username');

      if (!thought) {
        return res
          .status(404)
          .json({ message: 'No thought found with that ID' });
      }

      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(404)
          .json({ message: 'No user found with that username' });
      }

      const newReaction = {
        reactionBody,
        username: user._id,
      }

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
      }

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
        return res
          .status(404)
          .json({ message: 'No thought found with that ID' });
      }

      const reactionIndex = thought.reactions.findIndex(
        (reaction) => reaction._id.toString() === reactionId,
      )

      if (reactionIndex === -1) {
        return res
          .status(404)
          .json({ message: 'No reaction found with that ID' });
      }

      await Thought.findByIdAndUpdate(thoughtId, {
        $pull: { reactions: { _id: reactionId } },
      })

      res.json({ message: 'Reaction successfully deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },
}
