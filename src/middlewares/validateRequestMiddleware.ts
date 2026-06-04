import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const validateRequestMiddleware = ({ body }: { body: ZodType }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationResult = body.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: validationResult.error.issues,
      });
    }
    req.body = validationResult.data;
    next();
  };
};

export default validateRequestMiddleware;
