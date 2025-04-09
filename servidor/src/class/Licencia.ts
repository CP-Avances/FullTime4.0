export interface Licencias {
    id: number,
    empresa: string,
    public_key: string,
    private_key: string,
    name_database: string,
    fec_activacion: string | Date,
    fec_desactivacion: string | Date
}

export interface Modulos {
    permisos: boolean,    
    reportes: boolean    
    hora_extra: boolean,    
    alimentacion: boolean,    
    accion_personal: boolean,    
}