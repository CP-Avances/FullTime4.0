import { Request, Response } from 'express';
import pool from '../../database';

class EmpresasControlador {

    public async ObtenerEmpresas(req: Request, res: Response){
        try{
            //consulta de empresa en base a codigo encriptado
            let { codigo_empresa } = req.body;
            console.log('codigo_empresa: ', codigo_empresa);
            let empresasRows: any = 0;
            let empresas = await pool.query(
                "SELECT emp.empresa_codigo, emp.empresa_direccion, emp.empresa_descripcion FROM empresa AS emp WHERE emp.empresa_codigo = $1", [codigo_empresa]
            ).then(
                (result: any) => {
                    empresasRows = result.rowCount;
                    if(result.rowCount > 0){
                        return res.status(200).jsonp({message: 'ok', empresas: result.rows});
                    }
                }
            );
            
            if(empresasRows === 0){
                return res.status(404).jsonp({message: 'vacio'});
            }
        }
        catch (error) {
            res.status(500).jsonp({ message: 'error' });
        }
    }

}

export const empresasControlador = new EmpresasControlador;
export default empresasControlador