// IMPORTAR LIBRERIAS
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';

@Component({
  selector: 'app-editar-rol',
  templateUrl: './editar-rol.component.html',
  styleUrls: ['./editar-rol.component.css']
})

export class EditarRolComponent implements OnInit {

  salir: boolean = false;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CAMPOS DE FORMULARIO
  descripcion = new FormControl('', Validators.required);

  // AGREGRAR CAMPOS DE FORMULARIO A UN GRUPO
  public nuevoRolForm = new FormGroup({
    descripcionForm: this.descripcion
  });

  constructor(
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDAR SERVICIOS
    private toastr: ToastrService, // VARAIBLE USADA PARA MANEJO DE NOTIFICACIONES
    public rest: RolesService, // SERVICIO DATOS CATÁLOGO ROLES
    public ventana: MatDialogRef<EditarRolComponent>, // VARIABLE USADA PARA MANEJO DE VENTANAS
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE USADA PARA PASAR DATOS ENTRE VENTANAS
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.nuevoRolForm.setValue({
      descripcionForm: this.data.datosRol.nombre,
    });
  }

  // METODO PARA INGRESAR UN ROL
  contador: number = 0;
  roles: any = [];
  data_nueva: any = [];
  InsertarRol(form: any) {
    this.contador = 0;
    this.roles = [];
    let dataRol = {
      id: this.data.datosRol.id,
      nombre: form.descripcionForm,
      user_name: this.user_name,
      ip: this.ip
    };
    this.data_nueva = dataRol;
    this.rest.ListarRolesActualiza(this.data.datosRol.id).subscribe(response => {
      this.roles = response;
      this.roles.forEach((obj: any) => {
        if (obj.nombre.toUpperCase() === dataRol.nombre.toUpperCase()) {
          this.contador = this.contador + 1;
        }
      })
      if (this.contador === 0) {
        this.rest.ActualizarRol(dataRol).subscribe(response => {
          this.toastr.success('Operacion exitosa.', 'Rol actualizado', {
            timeOut: 6000,
          });
          this.LimpiarCampos();
          this.salir = true;
          this.ventana.close(this.salir);
        });
      }
      else {
        this.toastr.error('',
          'Nombre ingresado ya existe en el sistema.', {
          timeOut: 6000,
        });
      }
    })
  }

  // METODO PARA REGISTRAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA CERRAR VENTA DE REGISTRO
  CerrarVentanaRegistroRol() {
    this.LimpiarCampos();
    this.ventana.close(this.salir);
  }

  // METODO PARA VALIDAR INFORMACION
  ObtenerMensajeErrorDescripcion() {
    if (this.descripcion.hasError('required')) {
      return 'Debe ingresar alguna Descripción.';
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.nuevoRolForm.reset();
  }

}
