import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a goal title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    enum: ['health', 'career', 'education', 'finance', 'personal', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetDate: {
    type: Date,
    required: [true, 'Please provide a target date']
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'archived'],
    default: 'in-progress'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate milestones
goalSchema.virtual('milestones', {
  ref: 'Milestone',
  localField: '_id',
  foreignField: 'goalId'
});

// Update progress based on completed milestones
goalSchema.methods.updateProgress = async function() {
  const Milestone = mongoose.model('Milestone');
  const milestones = await Milestone.find({ goalId: this._id });
  
  if (milestones.length === 0) {
    this.progress = 0;
    return;
  }
  
  const completedCount = milestones.filter(m => m.completed).length;
  this.progress = Math.round((completedCount / milestones.length) * 100);
  
  // Auto-complete goal if all milestones are done
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  // Set status to in-progress if goal has been started
  if (this.progress > 0 && this.status === 'not-started') {
    this.status = 'in-progress';
  }
};

// Index for better query performance
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ targetDate: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
