import { HttpException } from '../utils/HttpError';
import { Request, Response, NextFunction } from 'express';
import { db } from '../middlewares/db';
import mongoose, { Error as MongooseError } from 'mongoose';

import OwnerModel from '../models/owner';

export class OwnerService {
  public async getOwnerById(id: string) {
    if (!id) {
      throw new HttpException(400, 'Owner ID is required');
    }
    const owner = await OwnerModel.findById(id).exec();
    if (!owner) {
      throw new HttpException(404, 'Owner not found');
    }
    return owner;
  }

  public async createOwner(data: { name: string; email: string; phone?: string; identification?: string }) {
    await db();

    const name = data.name?.trim();
    const email = data.email?.trim();

    if (!name || !email) {
      throw new HttpException(400, 'Name and email are required');
    }

    const ownerId = new mongoose.Types.ObjectId();

    try {
      const newOwner = new OwnerModel({
        ...data,
        _id: ownerId,
        name,
        email,
      });
      return await newOwner.save();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        throw error;
      }

      if (error instanceof MongooseError.ValidationError) {
        throw new HttpException(400, error.message);
      }

      if ((error as { code?: number }).code === 11000) {
        throw new HttpException(409, 'Owner with this email already exists');
      }

      throw new HttpException(500, 'Failed to create owner');
    }
  }

  public getOwners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await db();
      const owners = await OwnerModel.find().sort({ createdAt: -1 }).exec();
      const plainVenues = owners.map((owner) => owner.toObject());
      res.status(200).json(plainVenues);
    } catch (error) {
      if (error instanceof HttpException) {
        next(error);
        return;
      }
    }
  };
}
