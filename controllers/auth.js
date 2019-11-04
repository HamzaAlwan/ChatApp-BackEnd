const Joi = require("@hapi/joi");
const HttpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

const User = require("../models/userModel");
const Helpers = require("../helpers/helpers");
const config = require("../config/secret");
const secret = require("../config/secret").cloudinary;

cloudinary.config({
	cloud_name: secret.cloudName,
	api_key: secret.api_key,
	api_secret: secret.api_secret
});

module.exports = {
	async CreateUser(req, res) {
		const schema = Joi.object().keys({
			fullname: Joi.string()
				.min(5)
				.max(30)
				.required(),
			username: Joi.string()
				.min(3)
				.max(15)
				.required(),
			birthday: Joi.string().required(),
			sex: Joi.string().required(),
			email: Joi.string()
				.email()
				.required(),
			password: Joi.string()
				.min(8)
				.required()
		});
		const { error } = schema.validate(req.body);

		if (error) {
			return res.status(HttpStatus.BAD_REQUEST).json({ messageJoi: error });
		}

		// Convert the email lowercase
		req.body["email"] = Helpers.lowerCase(req.body.email);
		// Save a lowercase version of the username;
		req.body["username_lower"] = Helpers.lowerCase(req.body.username);

		const userEmail = await User.findOne({
			email: Helpers.lowerCase(req.body.email)
		});

		if (userEmail) {
			return res
				.status(HttpStatus.CONFLICT)
				.json({ message: "Email already exists" });
		}

		const userName = await User.findOne({
			username_lower: Helpers.lowerCase(req.body.username)
		});

		if (userName) {
			return res
				.status(HttpStatus.CONFLICT)
				.json({ message: "Username already exist" });
		}

		return bcrypt.hash(req.body.password, 12, (err, hash) => {
			if (err) {
				return res
					.status(HttpStatus.BAD_REQUEST)
					.json({ message: "Error hashing password" });
			} else {
				req.body.password = hash;
				User.create(req.body)
					.then(user => {
						// Create token for the user after saving his data
						const token = jwt.sign(user.toObject(), config.secret, {
							expiresIn: "7d"
						});
						res.cookie("auth", token);
						res.status(HttpStatus.CREATED).json({
							message: "User created successfully",
							user,
							token
						});
					})
					.catch(err => {
						res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
							message: err
						});
					});
			}
		});
	},
	async LoginUser(req, res) {
		if (!req.body.email || !req.body.password) {
			return res
				.status(HttpStatus.NO_CONTENT)
				.json({ messageJoi: "Empty fields are not allowed" });
		}
		await User.findOne({ email: Helpers.lowerCase(req.body.email) })
			.then(user => {
				if (!user) {
					return res
						.status(HttpStatus.NOT_FOUND)
						.json({ message: "Email was not found" });
				}

				return bcrypt.compare(req.body.password, user.password).then(result => {
					if (!result) {
						return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
							message: "Password is incorrect"
						});
					}

					const token = jwt.sign(user.toObject(), config.secret, {
						expiresIn: "7d"
					});

					res.cookie("auth", token);
					res.status(HttpStatus.OK).json({
						message: "Login successful",
						user,
						token
					});
				});
			})
			.catch(err => {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					message: err
				});
			});
	},

	async UpdateProfile(req, res) {
		const schema = Joi.object().keys({
			fullname: Joi.string()
				.min(5)
				.max(30)
				.required(),
			username: Joi.string()
				.min(3)
				.max(15)
				.required(),
			birthday: Joi.string().required(),
			sex: Joi.string().required(),
			email: Joi.string()
				.email()
				.required(),
			phone_number: Joi.string().empty(""),
			image: Joi.string().empty(""),
			userId: Joi.string().required()
		});
		const { error } = schema.validate(req.body);

		if (error) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ messageJoi: error.details });
		}

		// Convert the email lowercase
		req.body["email"] = Helpers.lowerCase(req.body.email);
		// Save a lowercase version of the username;
		req.body["username_lower"] = Helpers.lowerCase(req.body.username);

		const userEmail = await User.findOne({
			email: Helpers.lowerCase(req.body.email)
		});

		const image = req.body.image;
		delete req.body.image;

		if (userEmail && userEmail._id != req.body.userId) {
			return res
				.status(HttpStatus.CONFLICT)
				.json({ message: "Email already exists" });
		}

		const userName = await User.findOne({
			username_lower: Helpers.lowerCase(req.body.username)
		});

		if (userName && userName._id != req.body.userId) {
			return res
				.status(HttpStatus.CONFLICT)
				.json({ message: "Username already exist" });
		}

		if (image.length > 5) {
			await cloudinary.uploader.upload(image, async (error, result) => {
				if (error) {
					return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
						message: error
					});
				}
				await User.updateOne(
					{ _id: req.body.userId },
					{
						$set: {
							"image.id": `${result.public_id}.${result.format}`,
							"image.version": result.version
						}
					}
				).catch(err => {
					return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
						message: err
					});
				});
			});
		}

		await User.updateOne({ _id: req.body.userId }, { $set: req.body })
			.then(user => {
				res.status(HttpStatus.CREATED).json({
					message: "User updated successfully",
					user
				});
			})
			.catch(err => {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					message: err
				});
			});
	},
	async UpdatePassword(req, res) {
		const schema = Joi.object().keys({
			old_password: Joi.string()
				.min(8)
				.required(),
			new_password: Joi.string()
				.min(8)
				.required(),
			confirm_password: Joi.string()
				.min(8)
				.required(),
			userId: Joi.string().required()
		});

		const { error } = schema.validate(req.body);

		if (error) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ messageJoi: error.details });
		}

		if (req.body.new_password !== req.body.confirm_password) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ message: "New password and confirm password do not match!" });
		}

		let currentUser = await User.findOne({ _id: req.body.userId });

		await bcrypt.compare(
			req.body.old_password,
			currentUser.password,
			async (err, result) => {
				if (err) res.status(HttpStatus.BAD_REQUEST).json({ message: err });
				else if (!result)
					return res
						.status(HttpStatus.BAD_REQUEST)
						.json({ message: "Old password doesnot match account's password" });
				else {
					await bcrypt.hash(req.body.new_password, 12, (err, hash) => {
						if (err) {
							return res
								.status(HttpStatus.BAD_REQUEST)
								.json({ message: "Error hashing password" });
						} else {
							User.findOneAndUpdate(
								{ _id: req.body.userId },
								{ $set: { password: hash } }
							)
								.then(async user => {
									const token = jwt.sign(user.toObject(), config.secret, {
										expiresIn: "7d"
									});
									res.cookie("auth", token);
									res.status(HttpStatus.CREATED).json({
										message: "Password updated successfully",
										user,
										token
									});
								})
								.catch(err => {
									return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
										message: err
									});
								});
						}
					});
				}
			}
		);
	}
};
