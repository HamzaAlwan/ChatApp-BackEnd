const Joi = require("joi");
const HttpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Helpers = require("../helpers/helpers");
const config = require("../config/secret");

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
			country: Joi.string().required(),
			email: Joi.string()
				.email()
				.required(),
			phoneNumber: Joi.string()
				.min(6)
				.required(),
			password: Joi.string()
				.min(8)
				.required()
		});
		const { error } = Joi.validate(req.body, schema);

		if (error && error.details) {
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
	}
};
