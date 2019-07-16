class User {
	constructor() {
		this.globalArray = [];
	}

	EnterRoom(id, name, room) {
		const user = { id, name, room };
		this.globalArray.push(user);
		return user;
	}

	GetUserId(id) {
		const socketId = this.globalArray.filter(elem => elem.id === id)[0];
		return socketId;
	}

	RemoveUser(id) {
		const user = this.GetUserId(id);
		if (user) {
			this.globalArray = this.globalArray.filter(elem => elem.id !== id);
		}
		return user;
	}

	GetList(room) {
		const roomName = this.globalArray.filter(elem => elem.room === room);
		const names = roomName.map(elem => elem.name);
		return names;
	}
}
module.exports = { User };
