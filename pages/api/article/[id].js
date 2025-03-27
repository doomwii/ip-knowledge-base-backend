import { Server } from 'socket.io';
import connectToDatabase from '../../../lib/mongodb';
import Article from '../../../models/Article';
import { verifyToken } from '../../../lib/auth-utils';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  // 验证身份
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: '无效的令牌' });
    }

    // 连接数据库
    await connectToDatabase();
    
    const { id } = req.query;
    const { content } = req.body;
    
    if (!id || !content) {
      return res.status(400).json({ success: false, message: '文章ID和内容不能为空' });
    }
    
    // 更新文章内容
    const article = await Article.findByIdAndUpdate(
      id,
      { content, updatedAt: new Date() },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }
    
    // 使用Socket.IO发送实时更新
    if (res.socket.server.io) {
      const io = res.socket.server.io;
      io.to(`article_${id}`).emit('articleUpdated', {
        id,
        content,
        updatedAt: article.updatedAt
      });
    }
    
    res.status(200).json({ success: true, message: '内容已同步' });
    
  } catch (error) {
    console.error('同步错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}

// 初始化Socket.IO
export const config = {
  api: {
    bodyParser: true,
  },
};

// 创建Socket.IO服务器实例
if (!global.socketInitialized) {
  global.socketInitialized = true;
  
  const initSocketServer = (server) => {
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    server.io = io;
    
    io.on('connection', (socket) => {
      console.log('客户端连接:', socket.id);
      
      // 加入文章房间
      socket.on('joinArticle', (articleId) => {
        socket.join(`article_${articleId}`);
        console.log(`客户端 ${socket.id} 加入文章 ${articleId}`);
      });
      
      // 离开文章房间
      socket.on('leaveArticle', (articleId) => {
        socket.leave(`article_${articleId}`);
        console.log(`客户端 ${socket.id} 离开文章 ${articleId}`);
      });
      
      // 断开连接
      socket.on('disconnect', () => {
        console.log('客户端断开连接:', socket.id);
      });
    });
    
    return io;
  };
  
  // 在API路由中初始化Socket.IO
  if (typeof window === 'undefined') {
    if (!global.io) {
      global.io = {};
    }
  }
}
