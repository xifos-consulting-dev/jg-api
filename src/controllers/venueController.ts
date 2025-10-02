import type { NextFunction, Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import VenueModel from '../models/venue';
import { db } from '../middlewares/db';
import { HttpException } from '../utils/HttpError';
import type { VenueStatus } from '../utils/types/venue';

type AddressInput = {
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

interface CreateVenueInput {
  name: string;
  slug: string;
  status?: VenueStatus | 'available';
  stances?: number | undefined;
  ownerId: mongoose.Types.ObjectId;
  coverImageUrl: string;
  imageUrls: string[];
  description?: string | undefined;
  address?: AddressInput | undefined;
  tags: string[];
}

type VenueSchemaAttributes = CreateVenueInput & {
  createdAt: Date;
  updatedAt: Date;
};

type VenueDocument = mongoose.Document<unknown, unknown, VenueSchemaAttributes> & VenueSchemaAttributes & { _id: mongoose.Types.ObjectId };

type VenuePlainObject = VenueSchemaAttributes & {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId | string;
};

const ALLOWED_STATUSES: ReadonlySet<VenueStatus> = new Set(['available', 'unavailable', 'maintenance']);

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const ensureArrayOfStrings = (value: unknown, field: string): string[] => {
  if (typeof value === 'undefined' || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new HttpException(400, `${field} must be an array of strings`);
  }
  const sanitized = value.map((item, index) => {
    if (typeof item !== 'string') {
      throw new HttpException(400, `${field}[${index}] must be a string`);
    }
    const trimmed = item.trim();
    if (!trimmed) {
      throw new HttpException(400, `${field}[${index}] cannot be empty`);
    }
    return trimmed;
  });
  return Array.from(new Set(sanitized));
};

const sanitizeAddress = (value: unknown): AddressInput | undefined => {
  if (typeof value === 'undefined' || value === null) {
    return undefined;
  }
  if (!isPlainObject(value)) {
    throw new HttpException(400, 'address must be an object');
  }
  const address: AddressInput = {};
  const keys: Array<keyof AddressInput> = ['line1', 'city', 'state', 'country', 'postalCode'];
  for (const key of keys) {
    const sanitized = sanitizeOptionalString(value[key]);
    if (sanitized) {
      address[key] = sanitized;
    }
  }
  return Object.keys(address).length > 0 ? address : undefined;
};

const parseStatus = (value: unknown): VenueStatus | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const normalized = trimmed.toLowerCase() as VenueStatus;
  if (!ALLOWED_STATUSES.has(normalized)) {
    throw new HttpException(400, `status must be one of: ${Array.from(ALLOWED_STATUSES).join(', ')}`);
  }
  return normalized;
};

const parseStances = (value: unknown): number | undefined => {
  if (typeof value === 'undefined' || value === null) {
    return undefined;
  }
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || Number.isNaN(parsed) || parsed < 0) {
    throw new HttpException(400, 'stances must be a non-negative number');
  }
  return parsed;
};

const buildSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const validateCreateVenueInput = (payload: unknown): CreateVenueInput => {
  if (!isPlainObject(payload)) {
    throw new HttpException(400, 'Request body must be a JSON object');
  }
  const name = sanitizeOptionalString(payload.name);
  if (!name) {
    throw new HttpException(400, 'name is required');
  }
  const ownerIdValue = sanitizeOptionalString(payload.ownerId);
  if (!ownerIdValue) {
    throw new HttpException(400, 'ownerId is required');
  }
  if (!mongoose.Types.ObjectId.isValid(ownerIdValue)) {
    throw new HttpException(400, 'ownerId must be a valid ObjectId');
  }
  const slugSource = sanitizeOptionalString(payload.slug) ?? name;

  const coverImageUrl = sanitizeOptionalString(payload.coverImageUrl);
  if (!coverImageUrl) {
    throw new HttpException(400, 'coverImageUrl is required');
  }
  const status = parseStatus(payload.status);
  if (payload.status && status === undefined) {
    throw new HttpException(400, 'status is invalid');
  }

  const input: CreateVenueInput = {
    name,
    ownerId: new mongoose.Types.ObjectId(ownerIdValue),
    slug: buildSlug(slugSource),
    status: status ?? 'available',
    stances: parseStances(payload.stances),
    coverImageUrl: coverImageUrl,
    imageUrls: ensureArrayOfStrings(payload.imageUrls, 'imageUrls'),
    description: sanitizeOptionalString(payload.description),
    address: sanitizeAddress(payload.address),
    tags: ensureArrayOfStrings(payload.tags, 'tags'),
  };
  return input;
};

const pickQueryString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  return undefined;
};

const buildVenueFilters = (query: Request['query']): FilterQuery<VenueDocument> => {
  const filters: FilterQuery<VenueDocument> = {};
  const statusValue = pickQueryString(query.status);
  const statusFilter = statusValue ? parseStatus(statusValue) : undefined;
  if (statusFilter) {
    filters.status = statusFilter;
  }
  const ownerIdValue = pickQueryString(query.ownerId);
  if (ownerIdValue) {
    if (!mongoose.Types.ObjectId.isValid(ownerIdValue)) {
      throw new HttpException(400, 'ownerId query parameter must be a valid ObjectId');
    }
    filters.ownerId = new mongoose.Types.ObjectId(ownerIdValue);
  }
  const searchValue = pickQueryString(query.search);
  if (searchValue) {
    filters.$text = { $search: searchValue.trim() };
  }
  return filters;
};

export const createVenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await db();
    const input = validateCreateVenueInput(req.body);
    console.log('Creating venue with input:', input);
    const created = await VenueModel.create(input);
    const createdObject = created.toObject() as VenuePlainObject;
    res.status(201).json(createdObject);
  } catch (error) {
    if (error instanceof HttpException) {
      next(error);
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      next(new HttpException(400, error.message));
      return;
    }
    next(new HttpException(500, 'Failed to create venue'));
  }
};

export const getVenues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await db();
    const filters = buildVenueFilters(req.query);
    const venues = await VenueModel.find(filters).sort({ createdAt: -1 }).exec();
    const plainVenues = venues.map((v) => v.toObject() as VenuePlainObject);
    res.status(200).json(plainVenues);
  } catch (error) {
    if (error instanceof HttpException) {
      next(error);
      return;
    }
    next(new HttpException(500, 'Failed to fetch venues'));
  }
};
