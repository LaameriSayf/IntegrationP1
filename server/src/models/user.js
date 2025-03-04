const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Business owner', 'Financial manager', 'Accountant', 'Admin'],
      required: true,
    },
    entreprise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Entreprise',
    },
    bankAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankAccount',
      },
    ],
    image: {
      type: String, 
      default: '',
    },
    verificationToken: {
      type: String,
      required: false, 
    },
    isActive: { 
      type: Boolean,
      default: true, 
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } 
);

const User = mongoose.model('User', userSchema);

module.exports = { User };
