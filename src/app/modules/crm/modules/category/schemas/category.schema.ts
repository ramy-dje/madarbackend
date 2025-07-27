import { Schema } from 'mongoose';
import CategoryInterface from '../interfaces/category.interface';

// crm company category schema

export const CategorySchema = new Schema<CategoryInterface>(
  {
    // name of the category
    name: {
      required: true,
      type: String,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);
