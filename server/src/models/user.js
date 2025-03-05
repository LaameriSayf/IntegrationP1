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
    resetPasswordToken: {
      type: String 
    },
    resetPasswordExpires: { 
      type: Date 
    },
    phoneNumber: {
      type: String,
      required: false,
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
    googleId: { type: String },
    facebookId: { type: String },
   
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
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
    lastLogin: { type: Date },
    estActif: { type: Boolean, default: false }
    

  },
  { timestamps: true }

);
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this._id, email: this.email, role: this.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = { User };
