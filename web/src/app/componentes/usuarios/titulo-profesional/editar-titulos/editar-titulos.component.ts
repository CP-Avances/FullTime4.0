import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-titulos',
  templateUrl: './editar-titulos.component.html',
  styleUrls: ['./editar-titulos.component.css']
})

export class EditarTitulosComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivelF = new FormControl('');
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivelF,
    nombreNivelForm: this.nombreNivel
  });

  // ARREGLO DE NIVELES EXISTENTES
  HabilitarDescrip: boolean = true;
  niveles: any = [];
  idNivel: any = [];

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  constructor(
    private ntitulo: NivelTitulosService,
    private rest: TituloService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarTitulosComponent>,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');

    this.ObtenerNivelesTitulo();
    this.ImprimirDatos();
  }

  // METODO PARA LISTAR NIVELES
  ObtenerNivelesTitulo() {
    this.niveles = [];
    this.ntitulo.ListarNiveles().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
    });
  }

  // METODO PARA ACTIVAR FORULARIO
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

  // METODO PARA GUARDAR NIVEL DE TITULO
  GuardarNivel(form: any) {
    let nivel = {
      nombre: form.nombreNivelForm,
      user_name: this.user_name,
      ip: this.ip,
    };
    // VERIIFCAR DUPLICIDAD
    let nombre_nivel = (nivel.nombre).toUpperCase();
    this.ntitulo.BuscarNivelNombre(nombre_nivel).subscribe(response => {
      this.toastr.warning('El nivel ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
        timeOut: 3000,
      });
    }, vacio => {
      // GUARDAR DATOS DE NIVEL EN EL SISTEMA
      this.ntitulo.RegistrarNivel(nivel).subscribe(response => {
        this.ActualizarTitulo(form, response.id);
      });
    });
  }

  // METODO PARA ACTUALIZAR TITULO
  ActualizarTitulo(form: any, idNivel: number) {
    let titulo = {
      id: this.data.id,
      nombre: form.tituloNombreForm,
      id_nivel: idNivel,
      user_name: this.user_name,
      ip: this.ip,
    };
    // VERIFICAR SI EL REGISTRO TITULO ES DIFERENTE
    if ((titulo.nombre).toUpperCase() === (this.data.nombre).toUpperCase() && titulo.id_nivel === this.idNivel[0].id) {
      this.AlmacenarTitulo(titulo);
    }
    else {
      // METODO PARA VALIDAR DUPLICADOS
      let verificar = {
        nombre: (titulo.nombre).toUpperCase(),
        nivel: titulo.id_nivel
      }
      this.rest.BuscarTituloNombre(verificar).subscribe(response => {
        this.toastr.warning('El nombre ingresado ya existe en el sistema.', 'Ups!!! algo salio mal.', {
          timeOut: 3000,
        });
      }, vacio => {
        this.AlmacenarTitulo(titulo);
      });
    }
  }

  // METODO PARA ALMACENAR DATOS TITULO EN EL SISTEMA
  AlmacenarTitulo(titulo: any) {
    this.rest.ActualizarUnTitulo(titulo).subscribe(response => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.CerrarVentana();
    });
  }

  // METODO PARA VALIDAR REGISTRO DE LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // METODO PARA REGISTRAR DATOS
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
      this.ActualizarTitulo(form, form.tituloNivelForm);
    }
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  ImprimirDatos() {
    this.idNivel = [];
    let nivel = (this.data.nivel).toUpperCase();
    this.ntitulo.BuscarNivelNombre(nivel).subscribe(datos => {
      this.idNivel = datos;
      this.formulario.patchValue({
        tituloNombreForm: this.data.nombre,
        tituloNivelForm: this.data.nivel
      })
      this.nivelF.setValue(this.idNivel[0].id)
    })
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
