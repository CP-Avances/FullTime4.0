import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { EnroladoService } from 'src/app/servicios/catalogos/catEnrolados/enrolado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-editar-enrolados',
  templateUrl: './editar-enrolados.component.html',
  styleUrls: ['./editar-enrolados.component.css']
})

export class EditarEnroladosComponent implements OnInit {

  id_usuario = new FormControl(0, Validators.required);
  nombre = new FormControl('', [Validators.required, Validators.pattern('[A-Z a-z0-9]*')]);
  contrasenia = new FormControl('', Validators.maxLength(10));
  finger = new FormControl('', Validators.pattern('[0-9]*'));
  activo = new FormControl(false, Validators.required);
  data_finger = new FormControl('', Validators.pattern('[a-zA-z 1-9]*'));
  codigoF = new FormControl('', Validators.required);

  usuarios: any = [];
  idUltimoEnrolado: any = [];

  // verificar Duplicidad
  usuariosEnrolados: any = [];

  hide = true;

  // Selección
  selec1 = false;
  selec2 = false;

  // asignar los campos en un formulario en grupo
  public nuevoEnroladoForm = new FormGroup({
    enroladoId_UsuarioForm: this.id_usuario,
    enroladoNombreForm: this.nombre,
    enroladoContraseniaForm: this.contrasenia,
    enroladoActivoForm: this.activo,
    enroladoFingerForm: this.finger,
    enroladoData_FingerForm: this.data_finger,
    codigoForm: this.codigoF
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private rest: EnroladoService,
    private toastr: ToastrService,
    private restUsuario: UsuarioService,
    private router: Router,
    public dialogRef: MatDialogRef<EditarEnroladosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) { }

  ngOnInit(): void {
    this.getUsuarios();
    this.ImprimirDatos();
  }

  ImprimirDatos() {
    this.nuevoEnroladoForm.patchValue({
      enroladoId_UsuarioForm: parseInt(this.data.datosEnrolado.id_usuario),
      enroladoNombreForm: this.data.datosEnrolado.nombre,
      enroladoContraseniaForm: this.data.datosEnrolado.contrasenia,
      enroladoActivoForm: this.data.datosEnrolado.activo,
      enroladoFingerForm: this.data.datosEnrolado.finger,
      enroladoData_FingerForm: this.data.datosEnrolado.data_finger,
      codigoForm: this.data.datosEnrolado.codigo
    })
    if (this.data.datosEnrolado.activo === true) {
      this.selec1 = true;
      this.nuevoEnroladoForm.patchValue({
        enroladoActivoForm: true,
      })
    }
    else {
      this.selec2 = true;
      this.nuevoEnroladoForm.patchValue({
        enroladoActivoForm: false,
      })
    }
  }

  insertarEnrolado(form) {
    this.habilitarprogress = true;
    let dataEnrolado = {
      id: this.data.datosEnrolado.id,
      id_usuario: form.enroladoId_UsuarioForm,
      nombre: form.enroladoNombreForm,
      contrasenia: form.enroladoContraseniaForm,
      activo: form.enroladoActivoForm,
      finger: form.enroladoFingerForm,
      data_finger: form.enroladoData_FingerForm,
      codigo: form.codigoForm
    };
    this.rest.ActualizarUnEnrolado(dataEnrolado).subscribe(response => {
      this.toastr.success('Operacion Exitosa', ' Datos de Usuario Enrolado actualizados', {
        timeOut: 6000,
      });
        this.habilitarprogress = false;
        console.log(this.data.datosEnrolado.id);
        this.limpiarCampos();
        this.dialogRef.close();
        if(this.data.actualizar === true){
          window.location.reload();
        } else {
          this.router.navigate(['/enroladoDispositivo/', this.data.datosEnrolado.id]);
        }
    }, error => {
      console.log(error);
      this.habilitarprogress = false;
    });
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  limpiarCampos() {
    this.nuevoEnroladoForm.reset();
  }

  cerrarVentanaRegistroEnrolado() {
    this.limpiarCampos();
    this.dialogRef.close();
  }

  obtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Debe ingresar algun nombre';
    }
    return this.nombre.hasError('pattern') ? 'No ingresar números' : '';
  }

  getUsuarios() {
    this.usuarios = [];
    this.restUsuario.getUsuariosRest().subscribe(data => {
      this.usuarios = data;
      console.log(this.usuarios)
    })
  }

}
