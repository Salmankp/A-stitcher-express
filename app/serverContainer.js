require('dotenv').config();
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const {generateAutoSwagger} = require('./swagger');

const app = express();
require('./config/passport')(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.urlencoded({extended: false, limit: '200mb'}));
app.use(express.json({extended: true, limit: '200mb'}));

if (process.env.ENVIRONMENT === "dev" || process.env.ENVIRONMENT === "stag") {
    generateAutoSwagger();
}

if (process.env.ENVIRONMENT !== "prod") {
    const swaggerUi = require('swagger-ui-express');
    swaggerDocument = require('./swagger_output.json');

    app.use(
        '/api/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
}

app.use(
    session({
        secret: 'harisParam',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(fileUpload());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    next();
});

app.get('/', (req, res) => res.status(200).send('Server Running'));
app.use('/admin', require('./routes/admin'));
app.use('/api/v1', require('./routes/api'));

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('Page Not Found');
});

module.exports = app;
