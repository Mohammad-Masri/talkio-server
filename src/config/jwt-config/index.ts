import * as jwt from 'jsonwebtoken';

export const JWT_OPTIONS: jwt.SignOptions = {
  expiresIn: '30d',
};
