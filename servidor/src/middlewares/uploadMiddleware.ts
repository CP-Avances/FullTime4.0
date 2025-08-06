import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from "uuid";

const timbresDir = path.join(__dirname, "..", "uploads/timbres");

const storage = multer.diskStorage({
  destination: `${timbresDir}/`,
  filename: (_req, file, cb) => {
    const nombreTemporal = uuidv4() + file.originalname.substring(file.originalname.lastIndexOf('.'));
    cb(null, nombreTemporal);
  }
});

const upload = multer({ storage: storage });


export { upload };