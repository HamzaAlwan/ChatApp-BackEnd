const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

const secret = require("./config/secret");

// Routes
const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/postsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");

const app = express();

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

app.use(cors());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header(
		"Access-Control-Allow-Methods",
		"GET",
		"POST",
		"DELETE",
		"PUT",
		"OPTIONS"
	);
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	next();
});

// Body Parser
app.use(
	bodyParser.urlencoded({
		extended: true,
		limit: "50mb"
	})
);
app.use(bodyParser.json({ limit: "50mb" }));

mongoose.Promise = global.Promise;
mongoose.connect(secret.MongoUrl, { useNewUrlParser: true });

require("./socket/streams")(io);

app.use(cookieParser());

app.use("/api/chatapp", authRoutes);
app.use("/api/chatapp", postsRoutes);
app.use("/api/chatapp", usersRoutes);
app.use("/api/chatapp", notificationsRoutes);
// Listening to the port
server.listen(process.env.PORT || 5500, err => {
	if (err) return err;
	console.log("Node Started!");
});
