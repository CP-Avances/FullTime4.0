// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { RelojesComponent } from 'src/app/componentes/catalogos/catRelojes/relojes/relojes.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { SelectionModel } from '@angular/cdk/collections';
import { ITableDispositivos } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-listar-relojes',
  templateUrl: './listar-relojes.component.html',
  styleUrls: ['./listar-relojes.component.css']
})

export class ListarRelojesComponent implements OnInit {

  dispositivosEliminar: any = [];


  // ALMACENAMIENTO DE DATOS Y BUSQUEDA
  filtroDepartamentoReloj = '';
  filtroSucursalReloj = '';
  filtroEmpresaReloj = '';
  filtroNombreReloj = '';
  filtroIpReloj = '';
  relojes: any = [];

  empleado: any = [];
  idEmpleado: number;
  listar_relojes: boolean = true;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  ipF = new FormControl('');
  nombreF = new FormControl('', [Validators.minLength(2)]);
  empresaF = new FormControl('', [Validators.minLength(2)]);
  sucursalF = new FormControl('', [Validators.minLength(2)]);
  departamentoF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    ipForm: this.ipF,
    nombreForm: this.nombreF,
    empresaForm: this.empresaF,
    sucursalForm: this.sucursalF,
    departamentoForm: this.departamentoF
  });

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = (localStorage.getItem('empresaURL') as string);

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public router: Router,
    public restE: EmpleadoService,
    private rest: RelojesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerReloj();
    this.ObtenerLogo();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa') as string).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA 
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa') as string)).subscribe(res => {
      this.p_color = res[0].color_principal;
      this.s_color = res[0].color_secundario;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO PARA MANEJAR PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR RELOJES
  ObtenerReloj() {
    this.relojes = [];
    this.rest.ConsultarRelojes().subscribe(datos => {
      this.relojes = datos;
    })
  }

  // METODO PARA INGRESAR IP
  IngresarIp(evt: any) {
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      nombreForm: '',
      ipForm: '',
      empresaForm: '',
      sucursalForm: '',
      departamentoForm: ''
    });
    this.ObtenerReloj();
  }

  /** ********************************************************************************* **
   ** **           VENTANAS PARA REGISTRAR Y EDITAR DATOS DE UN DISPOSITIVO          ** **
   ** ********************************************************************************* **/



  // VENTANA PARA REGISTRAR DATOS DE UN NUEVO DISPOSITIVO
  AbrirVentanaRegistrarReloj(): void {
    this.ventana.open(RelojesComponent, { width: '1200px' })
      .afterClosed().subscribe(item => {
        this.ObtenerReloj();
      });;
  }

  // METODO PARA VER DATOS DE RELOJ
  ver_datos: boolean = false;
  reloj_id: number;
  pagina: string = '';
  VerDatosReloj(id: number) {
    this.reloj_id = id;
    this.ver_datos = true;
    this.ver_editar = false;
    this.listar_relojes = false;
    this.pagina = 'listar-relojes';
  }

  // METODO PARA EDITAR DATOS DE RELOJ
  ver_editar: boolean = false;
  VerEditarReloj(id: number) {
    this.reloj_id = id;
    this.listar_relojes = false;
    this.ver_datos = false;
    this.ver_editar = true;
    this.pagina = 'editar-reloj';
  }

  /** ********************************************************************************* **
   ** **                 METODOS Y VARIABLES PARA SUBIR PLANTILLAS                   ** **
   ** ********************************************************************************* **/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);

  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 12);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'dispositivos') {
        this.plantilla();
      } else {
        this.toastr.error(
          'Solo se acepta plantilla con nombre Dispositivos.',
          'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  plantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.Verificar_Datos_ArchivoExcel(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error(
          `Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos
          de la plantilla ingresada, recuerde que los datos no pueden estar duplicados dentro del sistema,
          nombre del equipo, código y dirección IP son datos únicos de cada registro, asegurese
          que el nombre de la sucursal y el departamento exitan dentro del sistema.`,
          'Verificar los datos ingresados en la plantilla.', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      } else {
        this.rest.VerificarArchivoExcel(formData).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error(
              `Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos
              de la plantilla ingresada, recuerde que los datos no pueden estar duplicados dentro del sistema,
              nombre del equipo, código y dirección IP son datos únicos de cada registro, asegurese
              que el nombre de la sucursal y el departamento exitan dentro del sistema.`,
              'Verificar los datos ingresados en la plantilla.', {
              timeOut: 10000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          } else {
            this.rest.subirArchivoExcel(formData).subscribe(datos_reloj => {
              this.toastr.success('Operación exitosa.', 'Plantilla de Relojes importada.', {
                timeOut: 10000,
              });
              this.archivoForm.reset();
              this.nameFile = '';
              window.location.reload();
            });
          }
        });
      }
    });
  }

  /** ********************************************************************************* **
   ** **                        GENERACION DE PDFs                                   ** **
   ** ********************************************************************************* **/

  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Dispositivos', this.relojes);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Dispositivos ', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFRelojes(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFRelojes() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'ID', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'IP', style: 'tableHeader' },
                { text: 'Puerto', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Modelo', style: 'tableHeader' },
                { text: 'Serie', style: 'tableHeader' },
                { text: 'ID Fabricanción', style: 'tableHeader' },
                { text: 'Fabricante', style: 'tableHeader' },
                { text: 'Mac', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Ciudad', style: 'tableHeader' }
              ],
              ...this.relojes.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.ip, style: 'itemsTableC' },
                  { text: obj.puerto, style: 'itemsTableC' },
                  { text: obj.marca, style: 'itemsTable' },
                  { text: obj.modelo, style: 'itemsTable' },
                  { text: obj.serie, style: 'itemsTable' },
                  { text: obj.id_fabricacion, style: 'itemsTable' },
                  { text: obj.fabricante, style: 'itemsTable' },
                  { text: obj.mac, style: 'itemsTable' },
                  { text: obj.nomdepar, style: 'itemsTable' },
                  { text: obj.nomsucursal, style: 'itemsTable' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nomciudad, style: 'itemsTable' }
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /** ********************************************************************************* **
   ** **                              GENERACION DE EXCEL                            ** **
   ** ********************************************************************************* **/

  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relojes);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'relojes');
    xlsx.writeFile(wb, "RelojesEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ********************************************************************************************** ** 
   ** **                              METODO PARA EXPORTAR A CSV                                  ** **
   ** ********************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relojes);
    const csvDataR = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataR], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "RelojesCSV" + new Date().getTime() + '.csv');
  }

  /** ********************************************************************************************** **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ********************************************************************************************** **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var arregloDispositivos: any = [];
    this.relojes.forEach(obj => {
      objeto = {
        "reloj": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "ip": obj.ip,
          "puerto": obj.puerto,
          "marca": obj.marca,
          "modelo": obj.modelo,
          "serie": obj.serie,
          "id_fabricacion": obj.id_fabricacion,
          "fabricante": obj.fabricante,
          "mac": obj.mac,
          "nombre_departamento": obj.nomdepar,
          "nombre_sucursal": obj.nomsucursal,
          "nombre_empresa": obj.nomempresa,
          "nombre_ciudad": obj.nomciudad,
        }
      }
      arregloDispositivos.push(objeto)
    });

    this.rest.CrearXML(arregloDispositivos).subscribe(res => {
      this.data = res;
      this.urlxml = `${(localStorage.getItem('empresaURL') as string)}/relojes/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Control Botones
  getCrearDispositivos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Crear Dispositivos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getPlantilla(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Plantilla' && item.id_funcion === 39);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getVerDispositivos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Ver Dispositivos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getEditarDispositivos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Editar Dispositivos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getEliminarDispositivos(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Dispositivos');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }

  getDescargarReportes(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes' && item.id_funcion === 39);
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 3);
    }
  }



  // METODOS PARA LA SELECCION MULTIPLE

  plan_multiple: boolean = false;
  plan_multiple_: boolean = false;

  HabilitarSeleccion() {
    this.plan_multiple = true;
    this.plan_multiple_ = true;
    this.auto_individual = false;
    this.activar_seleccion = false;
  }

  auto_individual: boolean = true;
  activar_seleccion: boolean = true;
  seleccion_vacia: boolean = true;

  selectionDispositivos = new SelectionModel<ITableDispositivos>(true, []);



  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionDispositivos.selected.length;
    return numSelected === this.relojes.length
  }


  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionDispositivos.clear() :
      this.relojes.forEach((row: any) => this.selectionDispositivos.select(row));
  }


  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: ITableDispositivos): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.dispositivosEliminar = this.selectionDispositivos.selected;
    //console.log('paginas para Eliminar',this.paginasEliminar);

    //console.log(this.selectionPaginas.selected)
    return `${this.selectionDispositivos.isSelected(row) ? 'deselect' : 'select'} row ${row.codigo + 1}`;

  }





  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACION
  EliminarRelojes(id_reloj: number) {
    this.rest.EliminarRegistro(id_reloj).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('No se puede eliminar.', '', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
      }
      this.ObtenerReloj();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRelojes(datos.id);
          this.activar_seleccion = true;

          this.plan_multiple = false;
          this.plan_multiple_ = false;
          this.dispositivosEliminar = [];
          this.selectionDispositivos.clear();

          this.ObtenerReloj();
        } else {
          this.router.navigate(['/listarRelojes/']);
        }
      });
  }


  contador: number = 0;
  ingresar: boolean = false;

  EliminarMultiple() {


    this.ingresar = false;
    this.contador = 0;

    this.dispositivosEliminar = this.selectionDispositivos.selected;
    this.dispositivosEliminar.forEach((datos: any) => {

      this.relojes = this.relojes.filter(item => item.id !== datos.id);
      //AQUI MODIFICAR EL METODO 

      this.contador = this.contador + 1;

      this.rest.EliminarRegistro(datos.id).subscribe(res => {


        if (res.message === 'error') {
          this.toastr.error('No se puede eliminar.', '', {
            timeOut: 6000,
          });

          this.contador = this.contador - 1;

        } else {

          if (!this.ingresar) {
            this.toastr.error('Se ha eliminado ' + this.contador + ' registros.', '', {
              timeOut: 6000,
            });
            this.ingresar = true;
          }

          this.ObtenerReloj();
        }
      });
    }
    )
  }


  ConfirmarDeleteMultiple() {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {

          if (this.dispositivosEliminar.length != 0) {
            this.EliminarMultiple();
            this.activar_seleccion = true;

            this.plan_multiple = false;
            this.plan_multiple_ = false;

            this.dispositivosEliminar = [];
            this.selectionDispositivos.clear();

            this.ObtenerReloj();


          } else {
            this.toastr.warning('No ha seleccionado DISPOSITIVOS.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })

          }


        } else {
          this.router.navigate(['/listarRelojes/']);
        }
      });

  }
}


