"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const timbresDir = path_1.default.join(__dirname, "..", "uploads/timbres");
const storage = multer_1.default.diskStorage({
    destination: `${timbresDir}/`,
    filename: (_req, file, cb) => {
        const nombreTemporal = (0, uuid_1.v4)() + file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null, nombreTemporal);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
exports.upload = upload;
