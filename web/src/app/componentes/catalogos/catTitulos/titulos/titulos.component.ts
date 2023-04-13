import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-titulos',
  templateUrl: './titulos.component.html',
  styleUrls: ['./titulos.component.css'],
})

export class TitulosComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivel = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivel,
    nombreNivelForm: this.nombreNivel
  });

  // ARREGLO DE NIVELES EXISTENTES
  niveles: any = [];

  HabilitarDescrip: boolean = true;


  constructor(
    private rest: TituloService,
    private nivel_: NivelTitulosService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<TitulosComponent>,
  ) {
  }

  ngOnInit(): void {
    this.ObtenerNivelesTitulo();
    this.niveles[this.niveles.length] = { nombre: "OTRO" };
  }

  // METODO PARA LISTAR NIVELES DE TITULO
  ObtenerNivelesTitulo() {
    this.niveles = [];
    this.nivel_.ListarNiveles().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA ACTIVAR FORMULARIO
  ActivarDesactivarNombre(form: any) {
    if (form.tituloNivelForm === undefined) {
      this.formulario.patchValue({ nombreNivelForm: '' });
      this.HabilitarDescrip = false;
      this.toastr.info('Ingresar nombre de nivel de título.', '', {
        timeOut: 6000,
      });
    }
    else {
      this.formulario.patchValue({ nombreNivelForm: '' });
      this.HabilitarDescrip = true;
    }
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTo.
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

  // METODO PARA EMITIR MENSAJES DE ERROR
  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  ObtenerMensajeErrorNivel() {
    if (this.nombreNivel.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
  }

  // METODO PARA REGISTRAR TITULO
  InsertarTitulo(form: any) {
    if (form.tituloNivelForm === undefined || form.tituloNivelForm === 'OTRO') {
      if (form.nombreNivelForm != '') {
        this.GuardarNivel(form);

      }
      else {
        this.toastr.info('Ingrese un nombre de nivel o seleccione uno de la lista de niveles.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarTitulo(form, form.tituloNivelForm);
    }
  }

  // METODO PARA REGISTRAR NIVEL DE TITULO
  GuardarNivel(form: any) {
    let nivel = {
      nombre: form.nombreNivelForm,
    };
    this.nivel_.RegistrarNivel(nivel).subscribe(response => {
      this.GuardarTitulo(form, response.id);
    })
  }

  // METODO PARA GUARDAR TITULO
  GuardarTitulo(form: any, idNivel: number) {
    let titulo = {
      nombre: form.tituloNombreForm,
      id_nivel: idNivel,
    };
    this.rest.RegistrarTitulo(titulo).subscribe(response => {
      this.toastr.success('Operación Exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      });
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
    this.ventana.close();
  }

}
