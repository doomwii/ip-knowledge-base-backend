import mongoose from 'mongoose';

const SeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供系列标题'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '请提供系列描述'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Series || mongoose.model('Series', SeriesSchema);
