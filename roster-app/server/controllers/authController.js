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

// Update Password
const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Extract user ID from JWT
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Fetch the user based on user ID
        const { data: user, error } = await supabase
            .from('useraccounts')
            .select('*')
            .eq('userid', userId)
            .single();

        if (error || !user) {
            console.error('Error fetching user:', error ? error.message : 'User not found');
            return res.status(400).json({ message: 'User not found' });
        }

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordhash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update the password in the database
        const { data, updateError } = await supabase
            .from('useraccounts')
            .update({ passwordhash: newPasswordHash })
            .eq('userid', userId);

        if (updateError) {
            console.error('Error updating password:', updateError.message);
            throw updateError;
        }

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Update password error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// Fetch user details
const getUserDetails = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { data: user, error } = await supabase
            .from('useraccounts')
            .select('username, email')
            .eq('userid', userId)
            .single();

        if (error || !user) {
            console.error('Error fetching user details:', error ? error.message : 'User not found');
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ username: user.username, email: user.email });
    } catch (err) {
        console.error('Error fetching user details:', err.message);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, updatePassword, getUserDetails };
