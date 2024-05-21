const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Register User
const register = async (req, res) => {
    const { username, email, password, role = 'admin' } = req.body; // Set default role

    try {
        // Check if username or email already exists
        let { data: existingUser, error } = await supabase
            .from('useraccounts')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const { data: newUser, error: insertError } = await supabase
            .from('useraccounts')
            .insert([
                {
                    username,
                    email,
                    passwordhash: hashedPassword,
                    role
                }
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        // Generate JWT token
        const token = jwt.sign({ id: newUser.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: "User registered successfully",
            token,
            userDetails: {
                id: newUser.userid,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
};

// Login User
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        let { data: user, error } = await supabase
            .from('useraccounts')
            .select('*')
            .eq('username', username)
            .single();

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordhash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: "Logged in successfully",
            token,
            userDetails: {
                id: user.userid,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login };
