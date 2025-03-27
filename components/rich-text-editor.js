// 富文本编辑器集成代码
const express = require('express');
const router = express.Router();

// 引入TinyMCE富文本编辑器
router.get('/admin/editor.js', (req, res) => {
  res.send(`
    // 加载TinyMCE编辑器
    function loadTinyMCE() {
      const script = document.createElement('script');
      script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js';
      script.referrerPolicy = 'origin';
      document.head.appendChild(script);
      
      script.onload = function() {
        initTinyMCE();
      };
    }
    
    // 初始化TinyMCE编辑器
    function initTinyMCE() {
      tinymce.init({
        selector: '#content-editor',
        height: 500,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      });
    }
    
    // 替换Markdown编辑器为富文本编辑器
    function replaceMDEditor() {
      // 查找原有的Markdown编辑器
      const mdEditor = document.querySelector('textarea[placeholder*="Markdown"]') || 
                       document.querySelector('textarea[name="content"]');
      
      if (mdEditor) {
        // 创建富文本编辑器容器
        const editorContainer = document.createElement('div');
        editorContainer.className = 'rich-text-editor-container';
        
        // 创建新的编辑器元素
        const newEditor = document.createElement('textarea');
        newEditor.id = 'content-editor';
        newEditor.name = mdEditor.name;
        newEditor.value = mdEditor.value;
        
        // 替换原有编辑器
        mdEditor.parentNode.replaceChild(editorContainer, mdEditor);
        editorContainer.appendChild(newEditor);
        
        // 初始化富文本编辑器
        loadTinyMCE();
        
        // 添加表单提交事件监听
        const form = editorContainer.closest('form');
        if (form) {
          form.addEventListener('submit', function(e) {
            // 确保富文本内容被正确提交
            const content = tinymce.get('content-editor').getContent();
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = newEditor.name;
            hiddenInput.value = content;
            form.appendChild(hiddenInput);
          });
        }
      }
    }
    
    // 在页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
      // 检查是否在编辑页面
      if (window.location.pathname.includes('/admin') && 
          (document.querySelector('textarea[placeholder*="Markdown"]') || 
           document.querySelector('textarea[name="content"]'))) {
        replaceMDEditor();
      }
    });
  `);
});

// 添加编辑器样式
router.get('/admin/editor.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.send(`
    .rich-text-editor-container {
      margin-bottom: 20px;
    }
    
    .tox-tinymce {
      border-radius: 4px;
      border: 1px solid #ddd !important;
    }
    
    .tox .tox-toolbar__group {
      border-right: 1px solid #eee !important;
    }
    
    .tox .tox-tbtn {
      color: #333 !important;
    }
    
    .tox .tox-tbtn:hover {
      background-color: #f0f0f0 !important;
    }
    
    .tox .tox-tbtn--enabled {
      background-color: #e6e6e6 !important;
    }
  `);
});

// 修改后台布局，注入富文本编辑器
router.get('/admin/inject-editor', (req, res) => {
  res.send(`
    // 注入富文本编辑器脚本和样式
    function injectEditorResources() {
      // 添加编辑器脚本
      const script = document.createElement('script');
      script.src = '/admin/editor.js';
      document.head.appendChild(script);
      
      // 添加编辑器样式
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = '/admin/editor.css';
      document.head.appendChild(style);
    }
    
    // 在页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
      injectEditorResources();
    });
  `);
});

module.exports = router;
