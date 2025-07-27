import { Schema, Types } from 'mongoose';
import IndustryInterface from '../interfaces/industry.interface';

// crm industry schema

export const IndustrySchema = new Schema<IndustryInterface>(
  {
    // name of the industry
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
