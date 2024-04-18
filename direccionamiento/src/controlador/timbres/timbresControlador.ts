import { Request, Response } from 'express';
import pool from '../../database';

class TimbresControlador {

    // METODO PARA LISTAR MARCACIONES
    public async ObtenerTimbres(req: Request, res: Response): Promise<any> {
        try {
            const codigoEmpresa = req.codigo_empresa;
            let empresas = await pool.query(
                `
                SELECT emp.empresa_codigo, emp.empresa_direccion, emp.empresa_descripcion FROM empresa emp
                `
            );
            if(empresas.rowCount === 0){
                return res.status(404).jsonp({message: 'vacio'});
            }
            else
            {
                var contador = 0;
                empresas.rows.forEach(async obj => {
                    console.log('fecha ', obj.empresa_codigo)
                    console.log('fecha ', obj.empresa_direccion)
                    console.log('fecha ', obj.empresa_descripcion)
                    contador = contador + 1;
                })

                if(contador === empresas.rowCount){
                    return res.jsonp({message: 'OK', respuesta: empresas.rows});
                }
                else
                {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
        } catch (error) {
            res.status(400).jsonp({ message: error })
        }
    }
}

export const timbresControlador = new TimbresControlador;
export default timbresControlador