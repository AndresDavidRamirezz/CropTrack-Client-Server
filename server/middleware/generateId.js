import { v4 as uuidv4 } from 'uuid';

export const generateId = (req, res, next) => {

  req.body.id = uuidv4();
  console.log('🔑 [GENERATE-ID] UUID generado:', req.body.id);
  
  next();
};