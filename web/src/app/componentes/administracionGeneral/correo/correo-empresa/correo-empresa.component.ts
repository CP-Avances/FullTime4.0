// SECCIÓN DE LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';

// SECCIÓN DE SERVICIOS
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-correo-empresa',
  templateUrl: './correo-empresa.component.html',
  styleUrls: ['./correo-empresa.component.css']
})

export class CorreoEmpresaComponent implements OnInit {

  hide1 = true;
  hide = true;

  // DATOS DE FORMULARIO CONFIGURACION DE CORREO
  emailF = new FormControl('', [Validators.email]);
  puertoF = new FormControl('');
  servidorF = new FormControl('');
  passwordF = new FormControl('');
  password_confirmF = new FormControl('');

  contrasenia: string = '';
  confirmar_contrasenia: string = '';

  btnDisableGuardar: boolean = false;
  dis_correo: boolean = false;

  // VARIABLES PROGRESS SPINNER 
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  public formulario = new FormGroup({
    email: this.emailF,
    puertoF: this.puertoF,
    passwordF: this.passwordF,
    servidorF: this.servidorF,
    password_confirmF: this.password_confirmF
  })

  constructor(
    private restE: EmpresaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CorreoEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.formulario.patchValue({
      email: this.data.correo,
      puertoF: this.data.puerto,
      servidorF: this.data.servidor,
    })
  }

  // METODO PARA GUARDAR DATOS DE CORREO
  GuardarConfiguracion(form: any) {
    this.habilitarprogress = true;
    let data = {
      correo: form.email || this.data.correo,
      password_correo: form.passwordF || this.data.password_correo,
      servidor: form.servidorF || this.data.servidor,
      puerto: form.puertoF || this.data.puerto
    }
    this.restE.EditarCredenciales(this.data.id, data).subscribe(res => {
      this.habilitarprogress = false;
      this.toastr.success(res.message)
      this.ventana.close({ actualizar: true })
    })
  }

  // METODO PARA VALIDAR CONTRASEÑA INGRESADA
  ValidacionContrasenia(e: any) {
    let especiales = [9, 13, 16, 17, 18, 19, 20, 27, 33, 32, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46];
    let tecla_especial = false;
    for (var i in especiales) {
      if (e.keyCode == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (e.ctrlKey) {
      if (e.key === 'v' || e.key === 'V') {
        return false
      }
    }

    if (tecla_especial) return false;

    if (e.keyCode === 8) { this.contrasenia = this.contrasenia.slice(0, -1) }
    if (e.keyCode != 8) {
      this.contrasenia = this.contrasenia + e.key;
    }

    if (this.contrasenia.length === 0 && this.confirmar_contrasenia.length === 0) {
      this.btnDisableGuardar = false;
    } else {
      this.btnDisableGuardar = true;
    }

    if (this.confirmar_contrasenia !== '' && this.confirmar_contrasenia.length != 0) {
      this.CompararContrasenia();
    }
  }

  // METODO PARA VALIDAR CONFIRMACION DE CONTRASEÑA
  ValidacionConfirmarContrasenia(e: any) {
    let especiales = [9, 13, 16, 17, 18, 19, 20, 27, 33, 32, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46];
    let tecla_especial = false

    for (var i in especiales) {
      if (e.keyCode == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }

    if (tecla_especial) return false;

    if (e.keyCode === 8) { this.confirmar_contrasenia = this.confirmar_contrasenia.slice(0, -1) }

    if (e.keyCode != 8) {
      this.confirmar_contrasenia = this.confirmar_contrasenia + e.key;
    }

    if (this.contrasenia.length === 0 && this.confirmar_contrasenia.length === 0) {
      this.btnDisableGuardar = false;
    } else {
      this.btnDisableGuardar = true;
    }

    if (this.contrasenia.length != 0) {
      this.CompararContrasenia();
    }
  }

  // METODO PARA VALIDAR QUE LAS CONTRASEÑAS SEAN IGUALES
  CompararContrasenia() {
    if (this.contrasenia === this.confirmar_contrasenia
      && this.contrasenia != '' && this.confirmar_contrasenia != '') {
      this.toastr.success('Contraseñas iguales')
      this.btnDisableGuardar = false;
    } else {
      this.btnDisableGuardar = true;
      this.password_confirmF.setValidators(Validators.requiredTrue)
    }
  }

  // MENSAJE DE ERROR EN CONTRASEÑAS
  ObtenerErrorPasswordConfirm() {
    if (this.contrasenia != this.confirmar_contrasenia) {
      return 'Las contraseña no son iguales';
    }
    this.password_confirmF.setValidators(Validators.required)
    return '';
  }

  // METODO PARA VALIDAR INGRESO DE NÚMEROS
  IngresarSoloNumeros(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
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

}
