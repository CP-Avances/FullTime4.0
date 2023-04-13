import fs from 'fs';
import path from 'path'

export const ImagenBase64LogosEmpresas = async function(path_file:string) {
    console.log("Path logo: ",path_file);
    try {
        path_file = path.resolve('logos') + '/' + path_file
        let data = fs.readFileSync(path_file);
        
        return data.toString('base64');
    } catch (error) {
        return 0
    }
}