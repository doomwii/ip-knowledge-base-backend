import connectToDatabase from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // 连接数据库
  await connectToDatabase();
  
  // 获取所有系列
  if (req.method === 'GET') {
    try {
      const series = await Series.find({}).sort({ order: 1 });
      return res.status(200).json({ success: true, data: series });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // 创建新系列 (需要管理员权限)
  if (req.method === 'POST') {
    // 检查用户是否已登录且为管理员
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: '未授权操作' });
    }
    
    try {
      const { title, description, coverImage, order } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ success: false, message: '标题和描述为必填项' });
      }
      
      const series = await Series.create({
        title,
        description,
        coverImage: coverImage || '',
        order: order || 0,
      });
      
      return res.status(201).json({ success: true, data: series });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // 不支持的方法
  return res.status(405).json({ success: false, message: '方法不允许' });
}
