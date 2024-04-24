const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, email, password, userType } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            userType
        });

        await newUser.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, userType: user.userType });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = { register, login };
