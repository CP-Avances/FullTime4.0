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

  // CAMPOS DE FORMULARIO
  descripcion = new FormControl('', Validators.required);

  // AGREGRAR CAMPOS DE FORMULARIO A UN GRUPO
  public nuevoRolForm = new FormGroup({
    descripcionForm: this.descripcion
  });

  constructor(
    public ventana: MatDialogRef<EditarRolComponent>, // VARIABLE USADA PARA MANEJO DE VENTANAS
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE USADA PARA PASAR DATOS ENTRE VENTANAS
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDAR SERVICIOS
    private toastr: ToastrService, // VARAIBLE USADA PARA MANEJO DE NOTIFICACIONES
    public rest: RolesService, // SERVICIO DATOS CATÁLOGO ROLES
  ) { }

  ngOnInit(): void {
    this.nuevoRolForm.setValue({
      descripcionForm: this.data.datosRol.nombre,
    });
  }

  contador: number = 0;
  roles: any = [];
  data_nueva: any = [];
  InsertarRol(form: any) {
    this.contador = 0;
    this.roles = [];
    let dataRol = {
      id: this.data.datosRol.id,
      nombre: form.descripcionForm,
    };
    this.data_nueva = dataRol;
    this.rest.ListarRolesActualiza(this.data.datosRol.id).subscribe(response => {
      this.roles = response;
      this.roles.forEach(obj => {
        if (obj.nombre.toUpperCase() === dataRol.nombre.toUpperCase()) {
          this.contador = this.contador + 1;
        }
      })
      if (this.contador === 0) {
        this.rest.ActualizarRol(dataRol).subscribe(response => {
          this.toastr.success('Operacion exitosa.', 'Rol actualizado', {
            timeOut: 6000,
          });
          this.validar.Auditar('app-web', 'cg_roles', this.data.datosRol, this.data_nueva, 'UPDATE');
          this.LimpiarCampos();
          this.salir = true;
          this.ventana.close(this.salir);
        });
      }
      else {
        this.toastr.error('Para el correcto funcionamiento del sistema ingresar un nuevo rol ' +
          'que no se encuentre registrado en el sistema.',
          'Nombre de Rol Duplicado', {
          timeOut: 6000,
        });
      }
    })
  }

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  CerrarVentanaRegistroRol() {
    this.LimpiarCampos();
    this.ventana.close(this.salir);
  }

  ObtenerMensajeErrorDescripcion() {
    if (this.descripcion.hasError('required')) {
      return 'Debe ingresar alguna Descripción.';
    }
  }

  LimpiarCampos() {
    this.nuevoRolForm.reset();
  }

}
