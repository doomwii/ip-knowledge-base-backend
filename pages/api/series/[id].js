import { Server } from 'socket.io';
import connectToDatabase from '../../../lib/mongodb';
import Article from '../../../models/Article';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket已经在运行');
  } else {
    console.log('Socket初始化');
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log(`客户端连接: ${socket.id}`);
      
      // 加入文章房间
      socket.on('joinArticle', articleId => {
        socket.join(`article-${articleId}`);
        console.log(`客户端 ${socket.id} 加入文章 ${articleId}`);
      });
      
      // 离开文章房间
      socket.on('leaveArticle', articleId => {
        socket.leave(`article-${articleId}`);
        console.log(`客户端 ${socket.id} 离开文章 ${articleId}`);
      });
      
      // 断开连接
      socket.on('disconnect', () => {
        console.log(`客户端断开连接: ${socket.id}`);
      });
    });
  }
  
  // 实时同步文章内容
  if (req.method === 'POST') {
    const session = await getSession({ req });
    
    // 检查用户是否已登录且为管理员
    if (!session || session.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: '未授权操作' });
    }
    
    try {
      const { id } = req.query;
      const { content } = req.body;
      
      // 连接数据库
      await connectToDatabase();
      
      // 更新文章内容
      const article = await Article.findByIdAndUpdate(
        id,
        {
          content,
          updatedAt: Date.now(),
        },
        { new: true }
      );
      
      if (!article) {
        return res.status(404).json({ success: false, message: '文章不存在' });
      }
      
      // 广播更新
      const io = res.socket.server.io;
      io.to(`article-${id}`).emit('articleUpdated', {
        id,
        content,
        updatedAt: article.updatedAt,
      });
      
      return res.status(200).json({ success: true, message: '内容已同步' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // 对于初始化请求，返回成功
  res.status(200).json({ success: true });
}
