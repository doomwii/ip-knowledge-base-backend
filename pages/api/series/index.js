import connectToDatabase from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { authMiddleware } from '../../../lib/auth-utils';

async function handler(req, res) {
  try {
    await connectToDatabase();
    
    if (req.method === 'GET') {
      const series = await Series.find({}).sort({ order: 1 });
      return res.status(200).json({ success: true, data: series });
    } else if (req.method === 'POST') {
      const { title, description, order } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, message: '标题和描述不能为空' });
      }
      
      const series = await Series.create({
        title,
        description,
        order: order || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return res.status(201).json({ success: true, data: series });
    } else {
      return res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error) {
    console.error('系列API错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}

export default authMiddleware(handler);
