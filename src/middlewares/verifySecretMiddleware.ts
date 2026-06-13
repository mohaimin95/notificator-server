import { NextFunction, Request, Response } from "express";
import { isSecretKeyValid } from "../services/keyService";

const verifySecretMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const secret = (
    (req.headers["Authorization"] ||
      req.headers["authorization"] ||
      "") as string
  )?.replace("Bearer ", "");
  if (!isSecretKeyValid(secret)) {
    return res.status(403).json({
      error: "Forbidden",
      details: "Invalid secret key",
    });
  }
  next();
};

export default verifySecretMiddleware;
