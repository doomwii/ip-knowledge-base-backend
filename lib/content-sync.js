// 内容同步处理代码
const express = require('express');
const router = express.Router();

// 处理富文本内容保存
router.post('/admin/save-content', (req, res) => {
  // 在实际实现中，这里会保存内容到数据库
  // 这里提供一个模拟的实现
  res.json({
    success: true,
    message: '内容已成功保存'
  });
});

// 处理前端内容获取
router.get('/api/content/:type/:id', (req, res) => {
  const { type, id } = req.params;
  
  // 在实际实现中，这里会从数据库获取内容
  // 这里提供一个模拟的实现
  let content = '';
  
  if (type === 'article') {
    content = `
      <h2>什么是短视频IP定位？</h2>
      <p>短视频IP定位是指创作者在短视频平台上建立独特的内容定位和个人品牌，使自己的内容在海量视频中脱颖而出，形成差异化竞争优势的过程。</p>
      
      <h2>为什么IP定位很重要？</h2>
      <p>良好的IP定位能够：</p>
      <ul>
        <li>帮助创作者在激烈的平台竞争中找到自己的位置</li>
        <li>吸引特定的目标受众，提高粉丝粘性</li>
        <li>为后续的内容创作提供明确方向</li>
        <li>为商业变现奠定基础</li>
      </ul>
    `;
  } else if (type === 'chapter') {
    content = `
      <p>本章将详细介绍短视频IP定位的核心概念、重要性以及实施方法。通过学习本章内容，您将能够为自己的短视频创作建立清晰的定位，找到适合自己的内容方向。</p>
      
      <p>IP定位是短视频创作的第一步，也是最关键的一步。良好的IP定位能够帮助创作者在激烈的平台竞争中找到自己的位置，吸引特定的目标受众，为后续的内容创作提供明确方向，并为商业变现奠定基础。</p>
    `;
  }
  
  res.json({
    success: true,
    content
  });
});

// 实时内容同步处理
router.get('/admin/sync-script.js', (req, res) => {
  res.send(`
    // 实时内容同步功能
    function setupContentSync() {
      // 监听编辑器内容变化
      if (tinymce && tinymce.get('content-editor')) {
        tinymce.get('content-editor').on('change', function() {
          // 获取当前编辑的内容
          const content = tinymce.get('content-editor').getContent();
          
          // 自动保存内容
          autoSaveContent(content);
        });
      }
    }
    
    // 自动保存内容
    let saveTimeout;
    function autoSaveContent(content) {
      // 清除之前的定时器
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // 设置新的定时器，延迟2秒保存
      saveTimeout = setTimeout(function() {
        // 获取当前编辑的内容类型和ID
        const urlPath = window.location.pathname;
        let contentType = '';
        let contentId = '';
        
        if (urlPath.includes('/article/')) {
          contentType = 'article';
          contentId = urlPath.split('/article/')[1];
        } else if (urlPath.includes('/chapter/')) {
          contentType = 'chapter';
          contentId = urlPath.split('/chapter/')[1];
        }
        
        // 发送保存请求
        if (contentType && contentId) {
          fetch('/admin/save-content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: contentType,
              id: contentId,
              content: content
            })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log('内容已自动保存');
              // 显示保存成功提示
              showSaveNotification();
            }
          })
          .catch(error => {
            console.error('保存失败:', error);
          });
        }
      }, 2000);
    }
    
    // 显示保存成功提示
    function showSaveNotification() {
      // 检查是否已存在通知元素
      let notification = document.getElementById('save-notification');
      
      if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.id = 'save-notification';
        notification.className = 'save-notification';
        notification.textContent = '内容已自动保存';
        document.body.appendChild(notification);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = \`
          .save-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 9999;
          }
          
          .save-notification.show {
            opacity: 1;
          }
        \`;
        document.head.appendChild(style);
      }
      
      // 显示通知
      notification.classList.add('show');
      
      // 3秒后隐藏通知
      setTimeout(function() {
        notification.classList.remove('show');
      }, 3000);
    }
    
    // 在编辑器加载完成后设置内容同步
    document.addEventListener('DOMContentLoaded', function() {
      // 检查是否在编辑页面
      if (window.location.pathname.includes('/admin') && 
          (document.querySelector('textarea[placeholder*="Markdown"]') || 
           document.querySelector('textarea[name="content"]'))) {
        // 等待编辑器加载完成
        const checkEditor = setInterval(function() {
          if (tinymce && tinymce.get('content-editor')) {
            clearInterval(checkEditor);
            setupContentSync();
          }
        }, 500);
      }
    });
  `);
});

module.exports = router;
