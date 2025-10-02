import type { Request, Response } from 'express';
import { HttpException } from '../utils/HttpError';
import { OwnerService } from '../services/ownerService';
const ownerService = new OwnerService();

export const getAllOwners = async (req: Request, res: Response) => {
  try {
    const owners = await ownerService.getOwners(req, res, () => {});
    res.status(200).json(owners);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const createOwner = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const { name, email, phone } = req.body;
    console.log('Creating owner with data:', { name, email, phone });
    if (!name || !email || !phone) {
      res.status(400).json({ message: 'Name, email, and phone are required' });
      return;
    }
    const newOwner = await ownerService.createOwner(req.body);
    res.status(201).json(newOwner);
  } catch (error) {
    console.log(error);
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
