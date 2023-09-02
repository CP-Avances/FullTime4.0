import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { RolPermisosService } from 'src/app/servicios/catalogos/catRolPermisos/rol-permisos.service';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RolesService } from '../../../../servicios/catalogos/catRoles/roles.service';
import { PageEvent } from '@angular/material/paginator';

interface Funciones {
  value: string;
}

interface Links {
  value: string;
  viewValue: string;
}

interface Etiquetas {
  value: string;
}

@Component({
  selector: 'app-seleccionar-rol-permiso',
  templateUrl: './seleccionar-rol-permiso.component.html',
  styleUrls: ['./seleccionar-rol-permiso.component.css'],
  //encapsulation: ViewEncapsulation.None,
})
export class SeleccionarRolPermisoComponent implements OnInit {

  funcion = new FormControl('', Validators.required);
  link = new FormControl('', Validators.required);
  etiqueta = new FormControl('', Validators.required);

  public nuevoRolPermisoForm = new FormGroup({
    funcionForm: this.funcion,
    linkForm: this.link,
    etiquetaForm: this.etiqueta
  });

  funciones: Funciones[] = [
    {value: 'Ver'},
    {value: 'Crear'},
    {value: 'Editar'},
    {value: 'Eliminar'}
  ];

  links: Links[] = [
    {value: '/home', viewValue:'Home'},
    {value: '/horasExtras', viewValue:'Horas Extras'},
    {value: '/notificaciones', viewValue:'Notificaciones'},
    {value: '/tipoPermisos', viewValue:'Tipo Permisos'},
    {value: '/empleado', viewValue:'Empleado'},
    {value: '/departamento', viewValue:'Departamento'},
  ];

  etiquetas: Etiquetas[] = [
    {value: 'para visualizar información'},
    {value: 'para crear nuevos registros'},
    {value: 'para editar información'},
    {value: 'para eliminar información'}
  ];

  idRol: string;
  idPermiso: string;
  guardarRol: any = [];
  guardarRoles: any = [];
  tableRoles: any = [];
  tablePermios: any = [];
  nombreRol: string;

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public location: Location,
    public rest: RolPermisosService,
    private toastr: ToastrService,
    private rol: RolesService,

  ) { 
    // codigo para obtner el id del rol seleccionado
    var url = this.location.prepareExternalUrl(this.location.path());
    this.idRol = url.split('/')[2];
    // codigo para obtener el nombre del rol
    this.rol.getOneRol(parseInt(this.idRol)).subscribe(data => {
      this.nombreRol = data[0].nombre;
    })
  }

  ngOnInit(): void {
    this.limpliarCampos();
    this.obtenerPermisosRolUsuario();
  }

  ManejarPagina(e: PageEvent){
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  limpliarCampos() {
    this.nuevoRolPermisoForm.reset();
  }

  obtenerMensajeErrorFuncion(){
    if (this.funcion.hasError('required')) {
      return 'Debe ingresar alguna Función';
    }
  }

  obtenerMensajeErrorLink(){
    if (this.link.hasError('required')) {
      return 'Debe ingresar alguna Url ';
    }
  }

  obtenerMensajeErrorEtiqueta(){
    if (this.etiqueta.hasError('required')) {
      return 'Debe ingresar alguna etiqueta';
    }
  }

  insertarRolPermiso(form){
    let dataRol = {
      funcion: form.funcionForm,
      link: form.linkForm,
      etiqueta: form.etiquetaForm + ' ' + form.linkForm
    }

    this.rest.postRolPermisoRest(dataRol).subscribe(res => {

      this.toastr.success('Operacion exitosa.', 'Rol Permiso guardado', {
        timeOut: 6000,
      });
      
      // sacar id de la tabla rol permiso
      this.guardarRol = res;
      this.idPermiso = this.guardarRol.id;

      let dataPermisoDenegado = {
        id_rol: this.idRol,
        id_permiso: this.idPermiso
      };

      // insertar id del cg_roles y cg_rol_permiso a la tabla rol_perm_denegado
      this.rest.postPermisoDenegadoRest(dataPermisoDenegado).subscribe(respon => {
        this.obtenerPermisosRolUsuario();
      });
    });

    this.limpliarCampos();
  }

  obtenerPermisosRolUsuario(){
    this.guardarRoles = [];

    this.rest.getPermisosUsuarioRolRest(parseInt(this.idRol)).subscribe(res => {
      this.guardarRoles = res;
    }, error => {
      console.log(error);
    });
  }

}
