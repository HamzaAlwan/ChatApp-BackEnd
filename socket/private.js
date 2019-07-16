module.exports = function(io, User, _) {
	const user = new User();

	io.on("connection", socket => {
		socket.on("join chat", params => {
			socket.join(params.room1);
			socket.join(params.room2);
		});

		socket.on("typing", data => {
			io.to(data.receiver).emit("start_typing", data);
		});

		socket.on("notTyping", data => {
			io.to(data.receiver).emit("stop_typing", data);
		});

		// When a user connects
		socket.on("online", data => {
			socket.join(data.room);
			user.EnterRoom(socket.id, data.user, data.room);
			const list = user.GetList(data.room);
			io.emit("usersOnline", _.uniq(list));
		});
		// When a user disconnects
		socket.on("disconnect", () => {
			const removedUser = user.RemoveUser(socket.id);
			if (removedUser) {
				const userArr = user.GetList(removedUser.room);
				const arr = _.uniq(userArr);
				_.remove(arr, n => n === user.name);
				io.emit("usersOnline", arr);
			}
		});
	});
};
