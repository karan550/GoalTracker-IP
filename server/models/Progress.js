import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  hoursSpent: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique weekly progress entries
progressSchema.index({ userId: 1, goalId: 1, weekStartDate: 1 }, { unique: true });

// Index for queries
progressSchema.index({ goalId: 1, weekStartDate: -1 });
progressSchema.index({ userId: 1, weekStartDate: -1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
