import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mno: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  address: { type: String, default: "" },
  birthdate: { type: String, default: "" },
  photo: { type: String, default: "" },
});

export default mongoose.model("User", userSchema);
