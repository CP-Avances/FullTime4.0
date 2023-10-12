// IMPORTACION DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
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
import * as xml2js from 'xml2js';

import { RegistrarSucursalesComponent } from '../registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-lista-sucursales',
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.css']
})

export class ListaSucursalesComponent implements OnInit {

  buscarNombre = new FormControl('', [Validators.minLength(2)]);
  buscarCiudad = new FormControl('', [Validators.minLength(2)]);
  buscarEmpresa = new FormControl('', [Validators.minLength(2)]);
  filtroNombreSuc = '';
  filtroCiudadSuc = '';
  filtroEmpresaSuc = '';

  public formulario = new FormGroup({
    buscarNombreForm: this.buscarNombre,
    buscarCiudadForm: this.buscarCiudad,
    buscarEmpresForm: this.buscarEmpresa
  });

  sucursales: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  constructor(
    private rest: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSucursal();
    this.ObtenerColores();
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
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR SUCURSALES
  ObtenerSucursal() {
    this.rest.BuscarSucursal().subscribe(data => {
      this.sucursales = data;
    });
  }

  // METODO PARA REGISTRAR SUCURSAL
  AbrirVentanaRegistrar() {
    this.ventana.open(RegistrarSucursalesComponent, { width: '650px' })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }

  // METODO PARA EDITAR SUCURSAL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarSucursalComponent, { width: '650px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        if (items) {
          if (items > 0) {
            this.VerDepartamentos(items);
          }
        }
      });
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampoBuscar() {
    this.formulario.setValue({
      buscarNombreForm: '',
      buscarCiudadForm: '',
      buscarEmpresForm: ''
    });
    this.ObtenerSucursal();
  }

  // METODO PARA VALIDAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_sucursal: number) {
    this.rest.EliminarRegistro(id_sucursal).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerSucursal();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/sucursales']);
        }
      });
  }

  // METODO PARA VER DATOS DE DEPARTAMENTOS DE SUCURSAL
  ver_departamentos: boolean = false;
  sucursal_id: number;
  ver_lista: boolean = true;
  pagina: string = '';
  VerDepartamentos(id: number) {
    this.pagina = 'lista-sucursal';
    this.ver_lista = false;
    this.sucursal_id = id;
    this.ver_departamentos = true;
  }

  /** ************************************************************************************************** ** 
   ** **                                      METODO PARA EXPORTAR A PDF                              ** **
   ** ************************************************************************************************** **/
  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('Establecimientos.pdf'); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Establecimientos', this.sucursales);
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'portrait',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PAGINA
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
        { text: 'Lista de Establecimientos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFSucursales(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  presentarDataPDFSucursales() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Ciudad', style: 'tableHeader' }
              ],
              ...this.sucursales.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' }
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

  /** ************************************************************************************************** ** 
   ** **                                      METODO PARA EXPORTAR A EXCEL                            ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.sucursales);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Establecimientos');
    xlsx.writeFile(wb, "Establecimientos" + '.xlsx');
  }

  /** ************************************************************************************************** ** 
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.sucursales);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EstablecimientosCSV" + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloSucursales: any = [];
    this.sucursales.forEach(obj => {
      objeto = {
        "establecimiento": {
          "$": { "id": obj.id },
          "empresa": obj.nomempresa,
          "establecimiento": obj.nombre,
          "ciudad": obj.descripcion,
        }
      }
      arregloSucursales.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Establecimientos' });
    const xml = xmlBuilder.buildObject(arregloSucursales);

    if (xml === undefined) {
      console.error('Error al construir el objeto XML.');
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // Abrir una nueva pestaña o ventana con el contenido XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // Evitar que la nueva pestaña tenga acceso a la ventana padre
      newTab.focus(); // Dar foco a la nueva pestaña
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }
    // const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Estamblecimientos.xml';
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
  }

}
