import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a milestone title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update goal progress when milestone is saved
milestoneSchema.post('save', async function() {
  const Goal = mongoose.model('Goal');
  const goal = await Goal.findById(this.goalId);
  if (goal) {
    await goal.updateProgress();
    await goal.save();
  }
});

// Update goal progress when milestone is deleted
milestoneSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Goal = mongoose.model('Goal');
    const goal = await Goal.findById(doc.goalId);
    if (goal) {
      await goal.updateProgress();
      await goal.save();
    }
  }
});

// Also handle findByIdAndDelete
milestoneSchema.post('remove', async function() {
  const Goal = mongoose.model('Goal');
  const goal = await Goal.findById(this.goalId);
  if (goal) {
    await goal.updateProgress();
    await goal.save();
  }
});

// Index for queries
milestoneSchema.index({ goalId: 1, order: 1 });
milestoneSchema.index({ dueDate: 1, completed: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;
