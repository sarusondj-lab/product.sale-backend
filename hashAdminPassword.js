// hashAdminPassword.js
import bcrypt from "bcryptjs";

const password = "kumar@123"; // <-- choose your admin password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("Admin password hash:", hash);
});