export interface MenuNode {
    name: string;
    accion?: boolean;
    estado?: boolean;
    icono?: string;
    children?: itemNode[];
}
  
interface itemNode {
    name: string;
    url: string;
}