// SECCION DE LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// SECCION DE SERVICIOS
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

@Component({
  selector: 'app-correo-empresa',
  standalone: false,
  templateUrl: './correo-empresa.component.html',
  styleUrls: ['./correo-empresa.component.css']
})

export class CorreoEmpresaComponent implements OnInit {
  ips_locales: any = '';

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

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

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
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    this.formulario.patchValue({
      email: this.data.correo,
      puertoF: this.data.puerto,
      servidorF: this.data.servidor,
    })
  }

  // METODO PARA GUARDAR DATOS DE CORREO
  GuardarConfiguracion(form: any) {
    let data = {
      correo: form.email || this.data.correo,
      password_correo: form.passwordF || this.data.password_correo,
      servidor: form.servidorF || this.data.servidor,
      puerto: form.puertoF || this.data.puerto,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    }
    this.restE.EditarCredenciales(this.data.id, data).subscribe(res => {
      this.toastr.success(res.message)
      this.ventana.close({ actualizar: true })
    })
  }


  CompararContrasenia() {
    const password = this.passwordF.value;
    const confirm = this.password_confirmF.value;

    if (password === confirm && password && confirm) {
      this.btnDisableGuardar = false;
      this.password_confirmF.setErrors(null); // limpia errores
    } else {
      this.btnDisableGuardar = true;
      this.password_confirmF.setErrors({ mismatch: true });
    }
  }

  // MENSAJE DE ERROR EN CONTRASEÑAS
  ObtenerErrorPasswordConfirm(): string {
    if (this.password_confirmF.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (this.password_confirmF.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
