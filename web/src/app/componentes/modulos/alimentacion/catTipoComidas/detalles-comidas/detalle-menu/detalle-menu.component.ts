import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';

import { TipoComidasService } from 'src/app/servicios/modulos/modulo-alimentacion/catTipoComidas/tipo-comidas.service';

@Component({
  selector: 'app-detalle-menu',
  templateUrl: './detalle-menu.component.html',
  styleUrls: ['./detalle-menu.component.css']
})

export class DetalleMenuComponent implements OnInit {
  ips_locales: any = '';

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  valorF = new FormControl('', [Validators.required, Validators.pattern("^[0-9]+(.[0-9][0-9])?$")]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  observacionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{5,48}")]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    valorForm: this.valorF,
    nombreForm: this.nombreF,
    observacionForm: this.observacionF
  });

  constructor(
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<DetalleMenuComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');  
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    }); 
  }

  // METODO PARA REGISTRAR DETALLE
  InsertarDetalle(form: any) {
    let datosMenu = {
      nombre: form.nombreForm,
      valor: form.valorForm,
      observacion: form.observacionForm,
      id_menu: this.data.menu.id,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales,
    };

    this.rest.CrearDetalleMenu(datosMenu).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      if (this.data.vista === 'lista') {
        this.Salir(2);
      }
      else {
        this.LimpiarCampos();
      }
    }, error => {
      this.toastr.error('Ups!!! algo salio mal.', 'No se pudo registrar.', {
        timeOut: 6000,
      })
    });
  }

  // METODO DE VALIDACION DE INGRESO DE DECIMALES
  IngresarNumeroDecimal(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMERICO Y QUE TECLAS NO RECIBIRA.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras.', 'Usar solo números.', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // VER MENSAJE DE ERROR DECIMALES
  ObtenerMensajeErrorDecimales() {
    if (this.valorF.hasError('required')) {
      return 'Ingresar un valor hasta con dos decimales.';
    }
    return this.valorF.hasError('pattern') ? 'Ingresar dos decimales.' : '';
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  Salir(opcion: number) {
    this.LimpiarCampos();
    this.ventana.close(opcion);
  }

}
