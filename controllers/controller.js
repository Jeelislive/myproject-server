import User from '../models/user.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


const register = async (req, res) => {
    try {
        //get all data from body
        const { username, email, password } = req.body
        //console.log(firstname);
       
        //all the data should exist
        if (!(username && email && password)) {
            return res.status(400).json({ message: "All fields are compulsory" });
        }

        //check if user already exist
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(401).json({ message: "User already exists" });
        }
        //  console.log("jeel", existingUser);
        //encrypt the password
        const hashpassword = await bcrypt.hash(password, 10)

        //save the user in the db
        const user = await User.create({
           username,
            email,
            password: hashpassword
        })

        //generate the tokens for the user and send it
        const token = jwt.sign(
            { id: user._id, email },
            process.env.jwtsecret,
            {
                expiresIn: "1h"
            }
        );
        // console.log(token);
        user.token = token
        user.password = undefined

        res.status(200).json(user)

    } catch (error) {
        console.log(error);
    }
}

const login = async (req, res) => {
    try {
        //get all daata from the fronend
        const { email, password } = req.body;

        //validation
        if (!(email && password)) {
            res.status(400).send("Email and password not found");
        }

        //find the user in the db
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).send("User not found in the database");
        }

        //match the password
        const matchedpass = await bcrypt.compare(password, user.password);
        if (user && matchedpass) {
            const token = jwt.sign(
                { id: user._id },
                process.env.jwtsecret,
                {
                    expiresIn: "1h"
                }
            );

            // Cookie Section:
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 1000),
                httpOnly: true
            };

            // Send a single Response (with the token):
            res.status(200).json({
                success: true,
                token,
                user: {
                    username: user.username,
                    email: user.email
                }
            });

        } else {
            res.status(401).send("Incorrect email or password");
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const dashboard = async (req, res) => {
    try {
        const { username, email } = req.user; 
        res.status(200).json({
            username,
            status: "success",
            message: "Get Profile Successfully",
            data: {
                username: req.user.username,
                email: req.user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "fail",
            message: error.message
        });
    }
}


const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({ message: 'No token found' });
        }
        const token = authHeader.split(' ')[ 1 ];

        const user = await User.findOne({ 'tokens.token': token });
        if (user) {
            await user.revokeToken(token);
            res.status(200).json({ message: 'Logged out successfully' });
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { register, login, dashboard, logout };
