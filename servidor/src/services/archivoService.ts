import * as path from "path";
import * as fs from "fs";

class ArchivoService {
  private tempDir = path.join(__dirname, "..", "temp");

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir);
    }
  }

  async leerArchivo(filePath: string) {
    return fs.readFileSync(filePath);
  }

  async eliminarArchivo(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export const archivoService = new ArchivoService();
export default archivoService;
