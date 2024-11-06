// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ITableDispositivos } from 'src/app/model/reportes.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as xml2js from 'xml2js';
import * as pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { RelojesComponent } from 'src/app/componentes/timbres/dispositivos/relojes/relojes.component';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';

import { AsignacionesService } from 'src/app/servicios/usuarios/asignaciones/asignaciones.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { RelojesService } from 'src/app/servicios/timbres/catRelojes/relojes.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-relojes',
  templateUrl: './listar-relojes.component.html',
  styleUrls: ['./listar-relojes.component.css']
})

export class ListarRelojesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // ALMACENAMIENTO DE DATOS
  relojes: any = [];
  empleado: any = [];
  idEmpleado: number;
  rolEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ROL DE EMPLEADO QUE INICIA SESION
  totalDispositivos: number = 0;
  numeroDipositivos: number = 0;

  idDepartamentosAcceso: Set<any> = new Set();

  listar_relojes: boolean = true;
  dispositivosEliminar: any = [];

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

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  hipervinculo: string = environment.url;

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  dispositivosCorrectos: number = 0;

  constructor(
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    public router: Router,
    public restE: EmpleadoService,
    private rest: RelojesService,
    private toastr: ToastrService,
    private asignaciones: AsignacionesService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit(): void {
    this.totalDispositivos = 10;
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.rolEmpleado = parseInt(localStorage.getItem('rol') as string);

    this.idDepartamentosAcceso = this.asignaciones.idDepartamentosAcceso;

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
    this.numero_pagina = 1;
    this.rest.ConsultarRelojes().subscribe(datos => {
      this.numeroDipositivos = datos.length;
      //console.log('dispositivos ', this.numeroDipositivos);
      this.relojes = this.rolEmpleado === 1 ? datos : this.FiltrarRelojesAsignados(datos);
    })
  }

  // METODO PARA FILTRAR RELOJES POR ASIGNACION USUARIO - DEPARTAMENTO
  FiltrarRelojesAsignados(data: any) {
    return data.filter((reloj: any) => this.idDepartamentosAcceso.has(reloj.id_departamento));
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
    this.DataDispositivos = null;
    this.archivoSubido = [];
    this.nameFile = '';
    this.ObtenerReloj();
    this.formulario.setValue({
      nombreForm: '',
      ipForm: '',
      empresaForm: '',
      sucursalForm: '',
      departamentoForm: ''
    });
    this.archivoForm.reset();
    this.mostrarbtnsubir = false;
    this.messajeExcel = '';
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

  // EVENTO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA
  ManejarPaginaMulti(e: PageEvent) {
    this.tamanio_paginaMul = e.pageSize;
    this.numero_paginaMul = e.pageIndex + 1
  }

  /** ********************************************************************************* **
   ** **                 METODOS Y VARIABLES PARA SUBIR PLANTILLAS                   ** **
   ** ********************************************************************************* **/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);
  mostrarbtnsubir: boolean = false;
  fileChange(element: any) {
    this.numero_paginaMul = 1;
    this.tamanio_paginaMul = 5;
    this.paginator.firstPage();
    this.archivoSubido = [];
    this.nameFile = '';
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0];
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase().startsWith('plantillaconfiguraciongeneral')) {
        this.numero_paginaMul = 1;
        this.tamanio_paginaMul = 5;
        this.Revisarplantilla();
      } else {
        this.toastr.error('Seleccione plantilla con nombre plantillaConfiguracionGeneral.', 'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.nameFile = '';
    }
    this.archivoForm.reset();
    this.mostrarbtnsubir = true;
  }

  // METODO PARA VALIDAR DATOS DE PLANTILLA
  DataDispositivos: any;
  listaDispositivosCorrectos: any = [];
  messajeExcel: string = '';
  Revisarplantilla() {
    this.listaDispositivosCorrectos = [];
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    // VERIFICACION DE DATOS FORMATO - DUPLICIDAD DENTRO DEL SISTEMA
    this.rest.VerificarArchivoExcel(formData).subscribe(res => {
      this.DataDispositivos = res.data;
      this.messajeExcel = res.message;

      this.DataDispositivos.sort((a: any, b: any) => {
        if (a.observacion !== 'ok' && b.observacion === 'ok') {
          return -1;
        }
        if (a.observacion === 'ok' && b.observacion !== 'ok') {
          return 1;
        }
        return 0;
      });

      if (this.messajeExcel == 'error') {
        this.toastr.error('Revisar que la numeración de la columna "item" sea correcta.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else if (this.messajeExcel == 'no_existe') {
        this.toastr.error('No se ha encontrado pestaña BIOMETRICOS en la plantilla.', 'Plantilla no aceptada.', {
          timeOut: 4500,
        });
        this.mostrarbtnsubir = false;
      }
      else {
        this.DataDispositivos.forEach((item: any) => {
          if (item.observacion.toLowerCase() == 'ok') {
            this.listaDispositivosCorrectos.push(item);
          }
        });

        this.dispositivosCorrectos = this.listaDispositivosCorrectos.length;
      }
    }, error => {
      this.toastr.error('Error al cargar los datos.', 'Plantilla no aceptada.', {
        timeOut: 4000,
      });
    });
  }

  // METODO PARA DAR COLOR A LAS CELDAS Y REPRESENTAR LAS VALIDACIONES
  colorCelda: string = ''
  EstiloCelda(observacion: string): string {
    if (observacion == 'Registro duplicado (código)' ||
      observacion == 'Registro duplicado (dirección IP)' ||
      observacion == 'Registro duplicado (número de serie)' ||
      observacion == 'Registro duplicado (dirección MAC)') {
      return 'rgb(156, 214, 255)';
    }
    else if (observacion == 'ok') {
      return 'rgb(159, 221, 154)';
    }
    else if (observacion == 'Ya existe en el sistema' ||
      observacion == 'IP ya existe en el sistema' ||
      observacion == 'Código ya existe en el sistema' ||
      observacion == 'Número de serie ya existe en el sistema' ||
      observacion == 'Dirección MAC ya existe en el sistema') {
      return 'rgb(239, 203, 106)';
    }
    else if (observacion == 'Sucursal no existe en el sistema' ||
      observacion == 'Verificar zona horaria' ||
      observacion == 'Departamento no existe en el sistema') {
      return 'rgb(255, 192, 203)';
    }
    else if (observacion == 'Departamento no pertenece a la sucursal' ||
      observacion == 'El puerto debe ser de 6 dígitos' ||
      observacion == 'Debe ingresar acciones' ||
      observacion == 'El número de acciones debe ser mayor a 0 y menor a 8') {
      return 'rgb(238, 34, 207)';
    }
    else if (observacion == 'Dirección IP incorrecta' ||
      observacion == 'Puerto incorrecto (solo números)' ||
      observacion == 'Función temperatura no válida ingrese (SI / NO)' ||
      observacion == 'Conexión no válida ingrese (interna / externa)' ||
      observacion == 'Marca no válida ingrese (ZKTECO / HIKVISION)' ||
      observacion == 'Formato de dirección MAC incorrecta (numeración hexadecimal)') {
      return 'rgb(222, 162, 73)';
    }
    else {
      return 'rgb(242, 21, 21)';
    }
  }

  colorTexto: string = '';
  EstiloTextoCelda(texto: string): string {
    let arrayObservacion = texto;
    if (arrayObservacion == 'No registrado') {
      return 'rgb(255, 80, 80)';
    } else {
      return 'black'
    }
  }

  // FUNCION PARA CONFIRMAR EL REGISTRO MULTIPLE DE DATOS DEL ARCHIVO EXCEL
  ConfirmarRegistroMultiple() {
    const mensaje = 'registro';
    console.log('listDepartamentosCorrectos: ', this.listaDispositivosCorrectos.length);
    this.ventana.open(MetodosComponent, { width: '450px', data: mensaje }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.RegistrarDispositivos();
        }
      });
  }

  // METODO PARA REGISTRAR DATOS DE PLANTILLA
  RegistrarDispositivos() {
    if (this.listaDispositivosCorrectos?.length > 0) {
      const data = {
        plantilla: this.listaDispositivosCorrectos,
        user_name: this.user_name,
        ip: this.ip,
      }
      // VERIFICAR NUMERO DE DISPOSITIVOS
      let total = this.numeroDipositivos + this.listaDispositivosCorrectos.length;
      //console.log('ver total ', total);
      if (total <= this.totalDispositivos) {
        this.rest.SubirArchivoExcel(data).subscribe(response => {
          this.toastr.success('Operación exitosa.', 'Plantilla de Dispositivos importada.', {
            timeOut: 3000,
          });
          this.LimpiarCampos();
          this.archivoForm.reset();
          this.nameFile = '';
        });
      }
      else {
        this.toastr.info('En la plantilla se ha excedido el límite máximo de dispositivos (' + this.listaDispositivosCorrectos.length+ ').', 'Permitido ingresar solo ' + this.totalDispositivos + ' dispositivos.', {
          timeOut: 4000,
        });
      }
    } else {
      this.toastr.error('No se ha encontrado datos para su registro.', 'Plantilla procesada.', {
        timeOut: 4000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }


  /** ********************************************************************************* **
   ** **                        GENERACION DE PDFs                                   ** **
   ** ********************************************************************************* **/

  generarPdf(action = 'open') {
    const documentDefinition = this.DefinirInformacionPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  DefinirInformacionPDF() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = DateTime.now();
        fecha = f.toFormat('yyyy-MM-dd');
        hora = f.toFormat('HH:mm:ss');
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
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Ciudad', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'IP', style: 'tableHeader' },
                { text: 'Puerto', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Modelo', style: 'tableHeader' },
                { text: 'Serie', style: 'tableHeader' },
                { text: 'Mac', style: 'tableHeader' },
                { text: 'ID Fabricanción', style: 'tableHeader' },
                { text: 'Fabricante', style: 'tableHeader' },
                { text: 'Zona Horaria', style: 'tableHeader' },
              ],
              ...this.relojes.map((obj: any) => {
                return [
                  { text: obj.codigo, style: 'itemsTableC' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nomciudad, style: 'itemsTable' },
                  { text: obj.nomsucursal, style: 'itemsTable' },
                  { text: obj.nomdepar, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.ip, style: 'itemsTableC' },
                  { text: obj.puerto, style: 'itemsTableC' },
                  { text: obj.marca, style: 'itemsTable' },
                  { text: obj.modelo, style: 'itemsTable' },
                  { text: obj.serie, style: 'itemsTable' },
                  { text: obj.mac, style: 'itemsTable' },
                  { text: obj.id_fabricacion, style: 'itemsTable' },
                  { text: obj.fabricante, style: 'itemsTable' },
                  { text: obj.zona_horaria_dispositivo + ' (' + obj.formato_gmt_dispositivo + ')', style: 'itemsTable' }
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
  // ORDENAR LOS DATOS SEGUN EL ID
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  urlxml: string;
  data: any = [];

  ExportToXML() {
    this.OrdenarDatos(this.relojes);
    var objeto: any;
    var arregloRelojes: any = [];
    this.relojes.forEach((obj: any) => {
      objeto = {
        "reloj": {
          "$": { "id": obj.id },
          "codigo": obj.codigo,
          "nombre_empresa": obj.nomempresa,
          "nombre_ciudad": obj.nomciudad,
          "nombre_sucursal": obj.nomsucursal,
          "nombre_departamento": obj.nomdepar,
          "nombre": obj.nombre,
          "ip": obj.ip,
          "puerto": obj.puerto,
          "marca": obj.marca,
          "modelo": obj.modelo,
          "serie": obj.serie,
          "mac": obj.mac,
          "id_fabricacion": obj.id_fabricacion,
          "fabricante": obj.fabricante,
          "zona_horaria": obj.zona_horaria_dispositivo + ' (' + obj.formato_gmt_dispositivo + ')'
        }
      }
      arregloRelojes.push(objeto)
    });

    const xmlBuilder = new xml2js.Builder({ rootName: 'Relojes' });
    const xml = xmlBuilder.buildObject(arregloRelojes);

    if (xml === undefined) {
      return;
    }

    const blob = new Blob([xml], { type: 'application/xml' });
    const xmlUrl = URL.createObjectURL(blob);

    // ABRIR UNA NUEVA PESTAÑA O VENTANA CON EL CONTENIDO XML
    const newTab = window.open(xmlUrl, '_blank');
    if (newTab) {
      newTab.opener = null; // EVITAR QUE LA NUEVA PESTAÑA TENGA ACCESO A LA VENTANA PADRE
      newTab.focus(); // DAR FOCO A LA NUEVA PESTAÑA
    } else {
      alert('No se pudo abrir una nueva pestaña. Asegúrese de permitir ventanas emergentes.');
    }

    const a = document.createElement('a');
    a.href = xmlUrl;
    a.download = 'Relojes.xml';
    // SIMULAR UN CLIC EN EL ENLACE PARA INICIAR LA DESCARGA
    a.click();
  }


  /** ********************************************************************************************** **
   ** **                          METODO DE SELECCION MULTIPLE DE DATOS                           ** **
   ** ********************************************************************************************** **/

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

    return `${this.selectionDispositivos.isSelected(row) ? 'deselect' : 'select'} row ${row.codigo + 1}`;

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  EliminarRelojes(id_reloj: number) {
    const datos = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.rest.EliminarRegistro(id_reloj, datos).subscribe((res: any) => {
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

  // METODO PARA ELIMINAR REGISTROS
  contador: number = 0;
  ingresar: boolean = false;
  EliminarMultiple() {
    const data = {
      user_name: this.user_name,
      ip: this.ip
    };
    this.ingresar = false;
    this.contador = 0;
    this.dispositivosEliminar = this.selectionDispositivos.selected;
    this.dispositivosEliminar.forEach((datos: any) => {
      this.relojes = this.relojes.filter((item: any) => item.id !== datos.id);
      //AQUI MODIFICAR EL METODO
      this.contador = this.contador + 1;
      this.rest.EliminarRegistro(datos.id, data).subscribe((res: any) => {
        if (res.message === 'error') {
          this.toastr.error('Existen datos relacionados con ' + datos.nombre + '.', 'No fue posible eliminar.', {
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

  // METODO PARA CONFIRMAR ELIMINACION MULTIPLE
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


