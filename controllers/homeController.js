const newsModel = require('../models/newsModel');

module.exports = {
    getHomePage: (req, res) => {
      const news = []; // Khởi tạo biến news với một mảng rỗng
      // Truyền danh sách bài viết vào template và render trang chủ
      res.render('index', { news: news });
    },
  };
  