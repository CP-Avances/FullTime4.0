export interface Licencias {
    id: number,
    name_database: string,
    empresa: string,
    public_key: string,
    private_key: string,
    fec_activacion: string | Date,
    fec_desactivacion: string | Date
}

export interface Modulos {
    hora_extra: boolean,    
    accion_personal: boolean,    
    alimentacion: boolean,    
    permisos: boolean,    
    reportes: boolean    
}