import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供章节标题'],
    trim: true,
    maxlength: [100, '章节标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '请提供章节描述'],
    trim: true
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: [true, '请提供所属系列ID']
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
