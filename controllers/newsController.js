const newsModel = require('../models/newsModel');

module.exports = {
  createNews: (req, res) => {
    const { title, content } = req.body;
    const news = {
      title,
      content,
    };
    
    newsModel.createNews(news, (error, result) => {
      if (error) {
        return res.status(500).json({
          message: 'Internal Server Error',
          error: error,
        });
      }
      return res.status(201).json({
        message: 'News created successfully',
        data: result,
      });
    });
  },
  //Thêm các hàm xử lý khác cho Controller tin tức ở đây
};
