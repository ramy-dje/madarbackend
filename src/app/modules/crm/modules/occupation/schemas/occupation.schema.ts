import { Schema, Types } from 'mongoose';
import OccupationInterface from '../interfaces/occupation.interface';

// crm occupation schema

export const OccupationSchema = new Schema<OccupationInterface>(
  {
    // name of the occupation
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
