import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ConfigurarOpcionesTimbresComponent } from '../configurar-opciones-timbres/configurar-opciones-timbres.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

@Component({
  selector: 'app-ver-configuracion-timbre',
  templateUrl: './ver-configuracion-timbre.component.html',
  styleUrl: './ver-configuracion-timbre.component.css'
})

export class VerConfiguracionTimbreComponent implements OnInit {

  @Input() informacion: any;
  @Input() opcion: any;

  configuracion: any = [];
  empleado: any = [];
  idEmpleadoLogueado: any;
  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', Validators.minLength(2));;
  codigoF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
    codigoForm: this.codigoF,
  });

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public restEmpre: EmpresaService,
    public ventanac: ConfigurarOpcionesTimbresComponent,
    public ventanae: MatDialog,
    public opciones: TimbresService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    console.log('ver info ', this.informacion)
    this.ObtenerEmpleados(this.idEmpleadoLogueado);
    this.RevisarEmpleados();
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


  // METODO PARA OBTENER IDs DE EMPLEADOS
  RevisarEmpleados() {
    let id = '';
    this.informacion.forEach((empl: any) => {
      if (id === '') {
        id = empl.id;
      }
      else {
        id = id + ', ' + empl.id;
      }
    })
    let buscar = {
      id_empleado: id,
    }
    //console.log('ver id ', buscar)
    this.ActualizarOpcionMarcacion(buscar);
  }

  // METODO PARA ACTUALIZAR OPCION DE MARCACION
  ActualizarOpcionMarcacion(informacion: any) {
    this.configuracion = [];
    let numero = 1;
    this.opciones.BuscarVariasOpcionesMarcacion(informacion).subscribe((a) => {
      //console.log('ver datos ', a)
      // FILTRAR Y COMBINAR LOS ARRAYS SOLO SI EXISTE COINCIDENCIA EN EL id DEL EMPLEADO
      this.configuracion = this.informacion
        .filter((info: any) => a.respuesta.some((res: any) => info.id === res.id_empleado)) // FILTRAR LOS QUE ESTAN EN AMBOS ARRAYS
        .map((info: any) => {
          const res = a.respuesta.find((res: any) => res.id_empleado === info.id); // ENCONTRAR LOS DATOS CORRESPONDIENTES
          return {
            ...info,
            // COMBINAR CON LA INFORMACION DE LA CONFIGURACION
            timbre_internet: res.timbre_internet,
            timbre_especial: res.timbre_especial,
            timbre_foto: res.timbre_foto,
            timbre_ubicacion_desconocida: res.timbre_ubicacion_desconocida,
            n: numero++
          };
        });
      //console.log('veificar datos ', this.configuracion);
    }, (vacio: any) => {
      //console.log('vacio ')
      this.toastr.info('No se han encontrado registros.', '', {
        timeOut: 6000,
      });
      this.Regresar();
    });
  }

  // METODO PARA SALIR DE LA PANTALLA
  Regresar() {
    this.ventanac.configurar = true;
    this.ventanac.ver_configurar = false;
  }

  // METODO PARA MANEJAR PAGINACION 
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  /** ************************************************************************************************* **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                              ** **
   ** ************************************************************************************************* **/

  // METODOS PARA LA SELECCION MULTIPLE
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  selectionUsuario = new SelectionModel<any>(true, []);
  eliminar_datos: any = [];

  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    }
    else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
      this.selectionUsuario.clear();
      this.eliminar_datos = [];
    }
  }

  // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS.
  isAllSelectedPag() {
    const numSelected = this.selectionUsuario.selected.length;
    return numSelected === this.configuracion.length
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA.
  masterTogglePag() {
    this.isAllSelectedPag() ?
      this.selectionUsuario.clear() :
      this.configuracion.forEach((row: any) => this.selectionUsuario.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
  checkboxLabelPag(row?: any): string {
    if (!row) {
      return `${this.isAllSelectedPag() ? 'select' : 'deselect'} all`;
    }
    this.eliminar_datos = this.selectionUsuario.selected;

    return `${this.selectionUsuario.isSelected(row) ? 'deselect' : 'select'} row ${row.descripcion + 1}`;
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarDetalle(id_opcion: any) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip,
      id: id_opcion
    };
    console.log('ver datos ', datos)
    this.opciones.EliminarOpcionesMarcacion(datos).subscribe((res: any) => {
      if (res.message === 'error') {
        this.toastr.error('Existen datos relacionados con este registro.', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.RevisarEmpleados();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
          this.RevisarEmpleados();
        }
      });
  }

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip,
      id: '',
    };
    this.ingresar = false;
    this.contador = 0;
    this.eliminar_datos = this.selectionUsuario.selected;
    this.eliminar_datos.forEach((datos: any) => {
      this.configuracion = this.configuracion.filter((item: any) => item.id !== datos.id);
      this.contador = this.contador + 1;
      data.id = datos.id;
      this.opciones.EliminarOpcionesMarcacion(data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con el usuario ' + datos.codigo + '.', 'No fue posible eliminar.', {
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
          this.RevisarEmpleados();
        }
      });
    }
    )
  }

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
  ConfirmarDeleteMultiple() {
    if (this.eliminar_datos.length != 0) {
      this.ventanae.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarMultiple();
            this.HabilitarSeleccion();
            this.RevisarEmpleados();
          }
        });
    } else {
      this.toastr.warning('No ha seleccionado Usuarios.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
      this.HabilitarSeleccion();
    }
  }


  /** ************************************************************************************************** **
   ** **                                       METODO PARA EXPORTAR A PDF                             ** **
   ** ************************************************************************************************** **/
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

  GenerarPDF(action: any) {
    const documentDefinition = this.DefinirInformacionPDF();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download('OpcionesMarcacionMovil'); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // METODO PARA ARMAR LA INFORMACION DEL PDF
  DefinirInformacionPDF() {
    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 60, 40, 40],
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + localStorage.getItem('fullname_print'), margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

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
                  text: '© Pag ' + currentPage.toString() + ' de ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 100, margin: [10, -25, 0, 5] },
        { text: localStorage.getItem('name_empresa')?.toUpperCase(), bold: true, fontSize: 14, alignment: 'center', margin: [0, -30, 0, 5] },
        { text: `OPCIONES MARCACIÓN APLICACIÓN MÓVIL`, bold: true, fontSize: 12, alignment: 'center', margin: [0, 0, 0, 0], },
        this.PresentarDataPDF(),
      ],
      styles: {
        cabeceras: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 5, 0, 0] },
        tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: this.p_color, margin: [0, 2, 0, 2] },
        itemsTable: { fontSize: 8, margin: [0, 2, 0, 0] },
        itemsTableCentrado: { fontSize: 8, alignment: 'center', margin: [0, 2, 0, 0] },
      }
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            headerRows: 2,
            body: [
              [
                { rowSpan: 2, text: 'N°', style: 'cabeceras' },
                { rowSpan: 2, text: 'CÉDULA', style: 'cabeceras' },
                { rowSpan: 2, text: 'CÓDIGO', style: 'cabeceras' },
                { rowSpan: 2, text: 'EMPLEADO', style: 'cabeceras' },
                { rowSpan: 2, text: 'GÉNERO', style: 'cabeceras' },
                { rowSpan: 2, text: 'CIUDAD', style: 'cabeceras' },
                { rowSpan: 2, text: 'SUCURSAL', style: 'cabeceras' },
                { rowSpan: 2, text: 'RÉGIMEN', style: 'cabeceras' },
                { rowSpan: 2, text: 'DEPARTAMENTO', style: 'cabeceras' },
                { rowSpan: 2, text: 'CARGO', style: 'cabeceras' },
                { rowSpan: 1, colSpan: 4, text: 'CONFIGURACIÓN', style: 'tableHeader' },
                {},
                {},
                {},
              ],
              [
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                { rowSpan: 1, text: 'INTERNET REQUERIDO', style: 'tableHeader' },
                { rowSpan: 1, text: 'ENVIAR FOTO', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE ESPECIAL', style: 'tableHeader' },
                { rowSpan: 1, text: 'TIMBRE UBICACIÓN DESCONOCIDA', style: 'tableHeader' },
              ],
              ...this.configuracion.map((obj: any) => {
                return [
                  { style: 'itemsTableCentrado', text: obj.n },
                  { style: 'itemsTable', text: obj.cedula },
                  { style: 'itemsTableCentrado', text: obj.codigo },
                  { style: 'itemsTable', text: obj.apellido + ' ' + obj.nombre },
                  { style: 'itemsTableCentrado', text: obj.genero == 1 ? 'M' : 'F' },
                  { style: 'itemsTable', text: obj.ciudad },
                  { style: 'itemsTable', text: obj.sucursal },
                  { style: 'itemsTable', text: obj.regimen },
                  { style: 'itemsTable', text: obj.departamento },
                  { style: 'itemsTable', text: obj.cargo },
                  { style: 'itemsTableCentrado', text: (obj.timbre_internet === true) ? 'Sí' : 'No' },
                  { style: 'itemsTableCentrado', text: (obj.timbre_foto === true) ? 'Sí' : 'No' },
                  { style: 'itemsTableCentrado', text: (obj.timbre_especial === true) ? 'Sí' : 'No' },
                  { style: 'itemsTableCentrado', text: (obj.timbre_ubicacion_desconocida === true) ? 'Sí' : 'No' },
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

  /** ****************************************************************************************** **
   ** **                               METODOS PARA EXPORTAR A EXCEL                          ** **
   ** ****************************************************************************************** **/

  ExportarExcel(): void {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.EstructurarDatosExcel(this.configuracion));
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Usuarios');
    xlsx.writeFile(wb, `OpcionesMarcacionMovil.xls`);
  }

  EstructurarDatosExcel(array: Array<any>) {
    let nuevo: Array<any> = [];
    let usuarios: any[] = [];
    let c = 0;
    array.forEach((usu) => {
      let ele = {
        'Cédula': usu.cedula,
        'Código': usu.codigo,
        'Apellido': usu.apellido,
        'Nombre': usu.nombre,
        'Género': usu.genero == 1 ? 'M' : 'F',
        'Ciudad': usu.ciudad,
        'Sucursal': usu.sucursal,
        'Régimen': usu.regimen,
        'Departamento': usu.departamento,
        'Cargo': usu.cargo,
        'Internet Requerido': usu.timbre_internet == true ? 'SI' : 'NO',
        'Enviar Foto': usu.timbre_foto == true ? 'SI' : 'NO',
        'Timbre Especial': usu.timbre_especial == true ? 'SI' : 'NO',
        'Timbre Ubicación Desconocida': usu.timbre_ubicacion_desconocida == true ? 'SI' : 'NO',
      }
      nuevo.push(ele)
    });
    nuevo.sort(function (a: any, b: any) {
      return ((a.Apellido + a.Nombre).toLowerCase().localeCompare((b.Apellido + b.Nombre).toLowerCase()))
    });
    nuevo.forEach((u: any) => {
      c = c + 1;
      const usuarioNuevo = Object.assign({ 'N°': c }, u);
      usuarios.push(usuarioNuevo);
    });
    return usuarios;
  }

  //CONTROL BOTONES
  getEliminarConfiguracionTimbreMovil(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Eliminar Configuración Timbre Móvil');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

  getDescargarReportesConfiguracionTimbreMovil(){
    const datosRecuperados = sessionStorage.getItem('paginaRol');
    if (datosRecuperados) {
      var datos = JSON.parse(datosRecuperados);
      return datos.some(item => item.accion === 'Descargar Reportes Configuración Timbre Móvil');
    }else{
      return !(parseInt(localStorage.getItem('rol') as string) !== 1);
    }
  }

}
