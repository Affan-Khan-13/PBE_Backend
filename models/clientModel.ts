import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the Client document
export interface Client extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  target?: string;
  preferableActivity: string;
  // encryptPassword(password: string): Promise<void> | Promise<boolean>;
  // validatePassword(password: string): Promise<boolean>;
}

// Create the Mongoose schema
const ClientSchema: Schema<Client> = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["client", "admin", "coach"],
      default: "client",
    },
    target: { type: String, default: null },
    preferableActivity: { type: String },
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt`
);

// ClientSchema.methods.encryptPassword = async function (password: string) {
//   if (!this.password) {
//     return false;
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(password, salt);
// };

// ClientSchema.methods.validatePassword = async function (password: string) {
//   if (!this.password) {
//     return false;
//   }
//   console.log(password, this.password);
//   return bcrypt.compare(password, this.password);
// };

// Create the Mongoose model
const ClientModel: Model<Client> = mongoose.model<Client>(
  "Client",
  ClientSchema
);

export default ClientModel;
