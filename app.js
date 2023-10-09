const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // Import body-parser
const bcrypt = require('bcrypt'); // Thêm bcrypt
const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
// Cài đặt EJS làm template engine
app.set('view engine', 'ejs');

// Kết nối cơ sở dữ liệu MySQL
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Thay đổi tên người dùng và mật khẩu tương ứng của bạn
  password: '',
  database: 'my_news_website',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected');
});

// Cấu hình định tuyến và xử lý yêu cầu ở đây
// Định tuyến và xử lý yêu cầu trang chủ
app.get('/', (req, res) => {
    // Truy vấn cơ sở dữ liệu để lấy danh sách tin tức
    db.query('SELECT * FROM news', (err, results) => {
      if (err) {
        throw err;
      }
      // Hiển thị trang chủ và truyền danh sách tin tức vào template
      res.render('index', { news: results });
    });
  });
  app.get('/addNews', (req, res) => {
    res.render('addNews'); // Hiển thị trang thêm tin tức
  });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.post('/addNews', (req, res) => {
    const { title, content } = req.body;
    
    // Kết nối cơ sở dữ liệu MySQL
    const db = mysql.createConnection({
      host: 'localhost',
      user: 'root', // Thay đổi tên người dùng và mật khẩu tương ứng của bạn
      password: '',
      database: 'my_news_website',
    });
  
    db.connect((err) => {
      if (err) {
        throw err;
      }
      console.log('MySQL connected');
      
      const sql = 'INSERT INTO news (title, content, created_at) VALUES (?, ?, NOW())';
      db.query(sql, [title, content], (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Tin tức đã được thêm vào cơ sở dữ liệu');
        res.redirect('/'); // Chuyển hướng về trang chủ sau khi thêm tin tức thành công
      });
    });
  });
  // Định tuyến và xử lý yêu cầu trang hiển thị tin tức
app.get('/news', (req, res) => {
    // Truy vấn cơ sở dữ liệu để lấy danh sách tin tức
    db.query('SELECT * FROM news', (err, results) => {
      if (err) {
        throw err;
      }
      // Hiển thị trang danh sách tin tức và truyền danh sách tin tức vào template
      res.render('news', { news: results });
    });
  });
// Xử lý yêu cầu đăng ký
// Đường dẫn tới trang đăng ký
app.get('/register', (req, res) => {
    res.render('register');
});

// Xử lý yêu cầu đăng ký
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra xem tên người dùng đã tồn tại chưa
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkUserQuery, [username], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            res.send('Tên người dùng đã tồn tại. Vui lòng chọn tên khác.');
        } else {
            // Nếu tên người dùng chưa tồn tại, thêm vào cơ sở dữ liệu
            const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertUserQuery, [username, password], (err, result) => {
                if (err) {
                    throw err;
                }
                res.redirect('/login'); // Chuyển hướng người dùng đến trang đăng nhập sau khi đăng ký thành công
            });
        }
    });
});
// Đường dẫn tới trang đăng nhập
app.get('/login', (req, res) => {
    res.render('login');
});

// Xử lý yêu cầu đăng nhập
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra xem tên người dùng và mật khẩu có trong cơ sở dữ liệu không
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(checkUserQuery, [username, password], (err, results) => {
        if (err) {
            throw err;
        }

        if (results.length > 0) {
            // Đăng nhập thành công, lưu trạng thái đăng nhập vào session
            req.session.loggedIn = true;
            req.session.username = username;
            res.redirect('/dashboard'); // Chuyển hướng đến trang dashboard hoặc trang chính của ứng dụng
        } else {
            // Đăng nhập thất bại, hiển thị thông báo lỗi
            res.send('Sai tên người dùng hoặc mật khẩu. Vui lòng thử lại.');
        }
    });
});
// dashboard
const protectDashboard = (req, res, next) => {
    if (req.session.loggedIn) {
        next(); // Cho phép truy cập nếu đã đăng nhập
    } else {
        res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
    }
};

// Sử dụng middleware protectDashboard cho trang dashboard
app.get('/dashboard', protectDashboard, (req, res) => {
    res.render('dashboard', { username: req.session.username });
});
// Trang xóa tin tức
app.get('/deleteNews/:id', (req, res) => {
    const newsId = req.params.id;
    // Truy vấn cơ sở dữ liệu để lấy thông tin tin tức cần xóa
    const sql = 'SELECT * FROM news WHERE id = ?';
    db.query(sql, [newsId], (err, result) => {
        if (err) {
            throw err;
        }
        if (result.length === 0) {
            res.status(404).send('Tin tức không tồn tại');
            return;
        }
        const news = result[0];
        res.render('deleteNews', { news });
    });
});

// Xử lý xóa tin tức
app.post('/deleteNews/:id', (req, res) => {
    const newsId = req.params.id;
    // Thực hiện truy vấn để xóa tin tức từ cơ sở dữ liệu
    const sql = 'DELETE FROM news WHERE id = ?';
    db.query(sql, [newsId], (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Tin tức đã được xóa');
        res.redirect('/'); // Chuyển hướng về trang chủ sau khi xóa tin tức thành công
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

