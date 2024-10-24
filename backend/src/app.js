const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const passport = require("passport");
const session = require("express-session");
const cookieParser = require('cookie-parser')
const passportConfig = require("./config/passport");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// middleware
const authJWT = require('./middleware/authenticate')
const limiter = require('./middleware/rateLimiter')
const restrictOrigin = require('./middleware/restrictOrigins')
// crons
const CronJobs = require('./controllers/cron/cronJobs')
// routes import
const auth_routes = require('./routes/auth/auth_routes')
const resources_routes = require('./routes/auth/res_route')
const course = require('./routes/course/course')
const student = require('./routes/student/student')
const testtype = require('./routes/test_type/test_type')
const mark = require('./routes/marks/marks')
const EditMarks = require('./routes/marks/editStatus')
const approval = require('./routes/approval/approval')

const morgan_config = morgan(
    ":method :url :status :res[content-length] - :response-time ms"
  );

const app = express();
const port = process.env.PORT;
app.use(cookieParser());

// session
app.use(
    session({
      secret: "this is my secrect code",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

// cors
app.use(express.json());
const cors_config = {
    origin: "*",
};
app.use(cors(cors_config));
app.use(morgan_config);

// auth routes
app.use("/api/auth",auth_routes);
// api routes
app.use("/api",resources_routes);
// middleware
// app.use([authJWT, limiter, restrictOrigin])

app.use("/api",course)
app.use("/api",student)
app.use('/api',testtype)
app.use('/api',mark)
app.use('/api',EditMarks)
app.use('/api',approval)

// CronJobs()
 
// port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});