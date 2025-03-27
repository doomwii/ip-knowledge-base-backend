import connectToDatabase from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { authMiddleware } from '../../../lib/auth-utils';

async function handler(req, res) {
  try {
    await connectToDatabase();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ success: false, message: '系列ID不能为空' });
    }
    
    if (req.method === 'GET') {
      const series = await Series.findById(id);
      
      if (!series) {
        return res.status(404).json({ success: false, message: '系列不存在' });
      }
      
      return res.status(200).json({ success: true, data: series });
    } else if (req.method === 'PUT') {
      const { title, description, order } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, message: '标题和描述不能为空' });
      }
      
      const updatedSeries = await Series.findByIdAndUpdate(
        id,
        {
          title,
          description,
          order: order || 0,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedSeries) {
        return res.status(404).json({ success: false, message: '系列不存在' });
      }
      
      return res.status(200).json({ success: true, data: updatedSeries });
    } else if (req.method === 'DELETE') {
      const deletedSeries = await Series.findByIdAndDelete(id);
      
      if (!deletedSeries) {
        return res.status(404).json({ success: false, message: '系列不存在' });
      }
      
      return res.status(200).json({ success: true, message: '系列已删除' });
    } else {
      return res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error) {
    console.error('系列API错误:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}

export default authMiddleware(handler);
