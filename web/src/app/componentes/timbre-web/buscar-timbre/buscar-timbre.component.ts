import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

//SERVICIOS
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';

import { EditarTimbreComponent } from '../editar-timbre/editar-timbre.component';
import { VerTimbreComponent } from '../ver-timbre/ver-timbre.component';

@Component({
  selector: 'app-buscar-timbre',
  templateUrl: './buscar-timbre.component.html',
  styleUrls: ['./buscar-timbre.component.css']
})

export class BuscarTimbreComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  codigo = new FormControl('',);
  cedula = new FormControl('',);
  fecha = new FormControl('', Validators.required);

  mostrarTabla: boolean = true;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public buscarTimbreForm = new FormGroup({
    cedulaForm: this.codigo,
    codigoForm: this.cedula,
    fechaForm: this.fecha
  });

  // ITEMS DE PAGINACION DE LA TABLA 
  numero_pagina_e: number = 1;
  tamanio_pagina_e: number = 5;
  pageSizeOptions_e = [5, 10, 20, 50];

  rol: any;

  timbres: any [];

  constructor(
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private timbresServicio: TimbresService,
    public ventana: MatDialog,
  ){

  }

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol')
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

  // METODO DE VALIDACION DE INGRESO DE SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e)
  }

  // EVENTO PARA MANEJAR LA PAGINACION DE TABLA
  ManejarPaginaE(e: PageEvent) {
    this.tamanio_pagina_e = e.pageSize;
    this.numero_pagina_e = e.pageIndex + 1;
  }

  buscarTimbresFecha(form: any){
    this.timbres = [];

    console.log('datos form: ',form)

    if(form.codigoForm === "" && form.cedulaForm === ""){
      return this.toastr.error('Ingrese el codigo o la cedula.', 'Llenar los campos.', {
        timeOut: 6000,
      })
      
    }else{
      var datos: any = {
        codigo: form.cedulaForm,
        cedula: form.codigoForm,
        fecha: moment(form.fechaForm).format('YYYY-MM-DD')
      }
  
      if(this.rol != '1'){
        datos.codigo = '5008' //codigo del empleado pero obtenido directamente en el onInit
        datos.cedula = '1753595717' //cedula del empleado pero obtenido directamente en el onInit
      }
      
      this.timbresServicio.obtenerTimbresFechaEmple(datos).subscribe( timbres => {
        this.timbres = timbres.timbres
        this.mostrarTabla = false;

      },error => {
        console.log('error: ',error);
        return this.toastr.error(error.error.message, 'Notificacion', {
          timeOut: 6000,
        })
      })
    }
  }

  AbrirVentanaEditarAutorizacion(timbre: any): void {
    this.ventana.open(EditarTimbreComponent,
      { width: '650px', data: { timbre: timbre } })
      .afterClosed().subscribe(item => {
        
      });
  }

  AbrirVentanaVerInfoTimbre(timbre: any): void {
    this.ventana.open(VerTimbreComponent,
      { width: '650px', data: { timbre: timbre } })
      .afterClosed().subscribe(item => {
        
      });
  }
  
  // METODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.codigo.reset('');
    this.cedula.reset('');
    this.fecha.reset()
  }

  ngOnDestroy(): void {
    this.mostrarTabla = true
  }

}