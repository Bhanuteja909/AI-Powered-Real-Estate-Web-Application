import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,             // trims whitespace from ends
      maxlength: 62,          // match frontend limit
      minlength: 10,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,                 // prices can't be negative
      max: 3000000000,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          // discountPrice should be less than regularPrice
          return value <= this.regularPrice;
        },
        message: 'Discount price ({VALUE}) must be less than or equal to regular price',
      },
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    furnished: {
      type: Boolean,
      required: true,
      default: false,
    },
    parking: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['sale', 'rent'],  // enforce allowed values
    },
    offer: {
      type: Boolean,
      required: true,
      default: false,
    },
    imageUrls: {
      type: [String],         // array of strings
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length > 0 && arr.length <= 6; // max 6 images
        },
        message: 'Must upload between 1 and 6 images',
      },
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',            // link to User model
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
