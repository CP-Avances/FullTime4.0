import { Request, Response } from 'express';
import pool from '../../database';
import FUNCIONES_LLAVES from '../llaves/rsa-key-service';

class EmpresasControlador {

    public async ObtenerEmpresas(req: Request, res: Response){
        try{
            //consulta de empresa en base a codigo encriptado
            let { codigo_empresa } = req.body;
            let codigo_empresa_encriptado = FUNCIONES_LLAVES.encriptarLogin(codigo_empresa);

            console.log('codigo_empresa: ', codigo_empresa);
            console.log('codigo_empresa e: ', codigo_empresa_encriptado);

            let empresasRows: any = 0;
            let empresas = await pool.query(
                "SELECT emp.empresa_codigo, emp.empresa_direccion, emp.empresa_descripcion FROM empresa AS emp WHERE emp.empresa_codigo = $1", [codigo_empresa_encriptado]
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