require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGOURI);

        const email = process.env.ADMIN_EMAIL.toLowerCase();

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin account already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        await User.create({
            name: process.env.ADMIN_NAME,
            email,
            contact: process.env.ADMIN_CONTACT,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error.message);

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();