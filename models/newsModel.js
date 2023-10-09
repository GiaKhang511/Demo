const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'newsdb',
});

db.connect();

module.exports = {
  createNews: (news, callback) => {
    db.query(
      'INSERT INTO news (title, content, created_at) VALUES (?, ?, ?)',
      [news.title, news.content, new Date()],
      (error, results) => {
        if (error) {
          console.error(error);
          return callback(error);
        }
        return callback(null, results);
      }
    );
  },
  //Thêm các phương thức khác cho Mô hình tin tức ở đây 
    getAllNews: (callback) => {
      db.query('SELECT * FROM news ORDER BY created_at DESC', (error, results) => {
        if (error) {
          console.error(error);
          return callback(error);
        }
        return callback(null, results);
      });
    },
  };
  

