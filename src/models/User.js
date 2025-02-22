const db = require('../config/db');
const bcrypt = require('bcrypt');

class User{

    // This function creates a new user in the database
    static async createUser(name, email, password,role,otp,otpExpiry){
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        // Return a new promise
        return new Promise((resolve,reject)=>{
            // Query the database to insert the new user
            db.query(
                'INSERT INTO user2 (name,email,password,role,otp,otp_expiry) VALUES (?,?,?,?,?,?)',
                [name,email,hashedPassword,role,otp,otpExpiry],
                (err,results)=>{ // Callback function to handle the query result
                if(err){
                    // If there is an error, reject the promise
                    reject(err);
                }else{
                    // If there is no error, resolve the promise
                    resolve(results);
                }
            })
        })
    }

// This function is used to find a user by their email address
    static async getUserByEmail(email) {
        // Create a new promise
        return new Promise((resolve, reject) => {
            // Create a query to select all users from the database where the email matches the given email
            const query = "SELECT * FROM user2 WHERE email = ?";
            // Execute the query with the given email
            db.query(query, [email], (err, results) => {
                // If there is an error, reject the promise
                if (err) reject(err);
                // Otherwise, resolve the promise with the first user found
                resolve(results[0]); 
            });
        });
    }
//This function deletes a user from the database based on the userId
    static async deleteUser(email) {
        //Create a new promise
        return new Promise((resolve, reject) => {
            //Query the database to delete the user with the given userId
            db.query(
                "DELETE FROM user2 WHERE email = ?",
                [email],
                (err, results) => {
                    //If there is an error, reject the promise
                    if (err) return reject(err);
                    //Otherwise, resolve the promise with the results
                    resolve(results);
                }
            );
        });
    }

//This function updates the login status of a user in the database
    static async updateLoginStatus(email, status) {
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE user2 SET logged_in = ? WHERE email = ?",
                [status, email],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    }
    

    // This function is used to store the OTP in the database
    static async storeOTP(email, otp, expiresAt) {
        console.log(`Attempting to store OTP: ${otp} for email: ${email}`); // Debug log
    
        return new Promise((resolve, reject) => {
            // Query to update the OTP and OTP expiry in the users table
            db.query(
                "UPDATE user2 SET otp = ?, otp_expiry = ? WHERE email = ?",
                [otp, expiresAt, email],
                (err, results) => {
                    if (err) {
                        console.error("Error storing OTP:", err);
                        reject(err);
                    }
                    // If no user is found with the given email, log a warning
                    if (results.affectedRows === 0) {
                        console.warn("⚠️ No user found with this email. OTP not stored.");
                    }
                    console.log("OTP stored successfully!");
                    resolve(results);
                }
            );
        });
    }
    
    
    // This function is used to verify the OTP sent to the user's email
    static async verifyOTP(email, otp) {
        // Create a new Promise
        return new Promise((resolve, reject) => {
            // Query the database to get the OTP and OTP expiry date for the given email
            db.query(
                "SELECT otp, otp_expiry FROM user2 WHERE email = ?",
                [email],
                (err, results) => {
                    // If there is an error, reject the Promise
                    if (err) reject(err);
    
                    // Log the results from the database
                    console.log("Fetched OTP from DB:", results);
                    
                    // Resolve the Promise with the results from the database
                    resolve(results[0]); 
                }
            );
        });
    }
// This function marks a user as verified in the database
    static async markUserVerified(email) {
        // Create a new promise
        return new Promise((resolve, reject) => {
            // Query the database to update the user's verification status
            db.query(
                "UPDATE user2 SET is_verified = true, otp = NULL, otp_expiry = NULL WHERE email = ?",
                [email],
                (err, results) => {
                    // If there is an error, reject the promise
                    if (err) reject(err);
                    // Otherwise, resolve the promise with the results
                    resolve(results);
                }
            );
        });
    }

    static async updatePassword(email, newPassword) {
        // Hash the new password using bcrypt
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Return a promise that resolves with the results of the query
        return new Promise((resolve, reject) => {
            db.query(
                "UPDATE user2 SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?",
                [hashedPassword, email],
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    }

    static async findUserById(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users2 WHERE id = ?", [id], (err, results) => {
                if (err) reject(err);
                resolve(results.length ? results[0] : null);
            });
        });
    }

}
module.exports = User;