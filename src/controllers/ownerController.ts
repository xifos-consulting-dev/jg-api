import type { Request, Response } from 'express';
import { HttpException } from '../utils/HttpError';
import { OwnerService } from '../services/ownerService';
const ownerService = new OwnerService();

export const getAllOwners = async (req: Request, res: Response) => {
  try {
    const owners = await ownerService.getOwners();
    res.status(200).json(owners);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const updateOwner = async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.id;
    const updateData = req.body;
    if (!ownerId) {
      res.status(400).json({ message: 'Owner ID is required' });
      return;
    }
    const updatedOwner = await ownerService.updateOwnerById(ownerId, updateData);
    res.status(200).json(updatedOwner);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
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

export const deleteOwnerByObjectId = async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.id;
    if (!ownerId) {
      res.status(400).json({ message: 'Owner ID is required' });
      return;
    }
    const deletedOwner = await ownerService.deleteOwnerbyId(ownerId);
    res.status(200).json(deletedOwner);
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
