// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';

@Component({
  selector: 'app-registro-rol',
  templateUrl: './registro-rol.component.html',
  styleUrls: ['./registro-rol.component.css'],
})

export class RegistroRolComponent implements OnInit {

  // VARIABLE PARA ENVIO DE INFORMACION ENTRE VENTANAS
  salir: boolean = false;

  // CAMPOS DE FORMULARIO
  descripcion = new FormControl('', Validators.required);

  // CAMPOS DE FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    descripcionForm: this.descripcion
  });

  constructor(
    public ventana: MatDialogRef<RegistroRolComponent>, // VARIABLE PARA MANEJO DE VENTANAS
    public validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    public rest: RolesService, // SERVICIO DATOS DE CATÁLOGO ROLES
  ) {
    this.formulario.setValue({
      descripcionForm: '',
    });
  }

  ngOnInit(): void {
    this.ObtenerRoles();
  }

  // METODO PARA INSERTAR DATOS
  data_nueva: any = [];
  contador: number = 0;
  roles: any = [];
  InsertarRol(form: any) {
  
    this.contador = 0;
    let rol = {
      nombre: form.descripcionForm,
    };
    this.data_nueva = rol;

    // VERIFICAR SI HAY REGISTROS DE ROLES
    if (this.roles.length != 0) {
      // VALIDAR REGISTROS DUPLICADOS
      this.roles.forEach((obj: any) => {
        if (obj.nombre.toUpperCase() === rol.nombre.toUpperCase()) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.GuardarRegistro(rol);
      }
      else {
        this.toastr.error('Rol ya se encuentra registrado.',
          'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarRegistro(rol);
    }

/*
    var j = 125000;


    let data = [{
      nombre: ''
    }]
    for (var i = 0; i <= j; i++) {
      data = data.concat({ nombre: 'rol' + [i] })
    }

    console.log('ver arreglo ', data);


    this.rest.RegistraRol(data).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.salir = true;
      this.CerrarVentana();
    });
*/

  }

  // METODO PARA BUSCAR ROLES
  ObtenerRoles() {
    this.roles = [];
    this.rest.BuscarRoles().subscribe(response => {
      this.roles = response;
    })
  }

  // METODO PARA ALMACENAR EN BASE DE DATOS
  GuardarRegistro(rol: any) {
    this.rest.RegistraRol(rol).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.salir = true;
      this.CerrarVentana();
    });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close(this.salir);
  }
}
