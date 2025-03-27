import jwt from 'jsonwebtoken';

// 验证JWT令牌
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('令牌验证错误:', error);
    return null;
  }
}

// 中间件：验证请求中的JWT令牌
export function authMiddleware(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ success: false, message: '未授权' });
      }
      
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ success: false, message: '无效的令牌' });
      }
      
      // 将用户信息添加到请求对象
      req.user = decoded;
      
      // 调用原始处理程序
      return handler(req, res);
    } catch (error) {
      console.error('认证中间件错误:', error);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
  };
}
