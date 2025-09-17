import type { Request, Response } from 'express';

export const getUsers = (req: Request, res: Response) => {
  console.log(req);
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
};

export const getId = (req: Request, res: Response) => {
  const { id } = req.params;

  if (id) {
    res.json({
      id: id,
    });
  }

  res.json({
    message: 'error not found',
  });
};
