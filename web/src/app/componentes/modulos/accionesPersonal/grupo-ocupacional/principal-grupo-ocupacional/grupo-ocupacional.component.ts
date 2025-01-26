import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MetodosComponent } from 'src/app/componentes/generales/metodoEliminar/metodos.component';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/generales/main-nav/main-nav.service';
import { ToastrService } from 'ngx-toastr';
import { CatGrupoOcupacionalService } from 'src/app/servicios/modulos/modulo-acciones-personal/cat-grupo-ocupacional.service';
import { RegistrarGrupoOcupacionalComponent } from '../registrar-grupo-ocupacional/registrar-grupo-ocupacional.component';
import { EditarGrupoOcupacionalComponent } from '../editar-grupo-ocupacional/editar-grupo-ocupacional.component';

@Component({
  selector: 'app-grupo-ocupacional',
  templateUrl: './grupo-ocupacional.component.html',
  styleUrl: './grupo-ocupacional.component.css'
})
export class GrupoOcupacionalComponent implements OnInit {

  ips_locales: any = '';

  buscarNombre = new FormControl('', [Validators.minLength(2)]);

  ListGrupoOcupacional: any

  // VARIABLES PARA AUDITORIA
  user_name: string | null;
  ip: string | null;

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  tamanio_paginaMul: number = 5;
  numero_paginaMul: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // VARIABLE PARA TOMAR RUTA DEL SISTEMA
  hipervinculo: string = environment.url

  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  get habilitarAccion(): boolean { return this.funciones.accionesPersonal; }

  constructor(
    private _GrupoOp: CatGrupoOcupacionalService,
    public ventana: MatDialog,
    private router: Router,
    private validar: ValidacionesService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
    private funciones: MainNavService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado') as string);
  }

  ngOnInit() {
    this.user_name = localStorage.getItem('usuario');
    this.ip = localStorage.getItem('ip');
    this.validar.ObtenerIPsLocales().then((ips) => {
      this.ips_locales = ips;
    });

    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.OptenerListaGrupoOcupacional();
      this.ObtenerEmpleados(this.idEmpleado);
      this.ObtenerLogo();
      this.ObtenerColores();
    }
  }

  LimpiarCampos() { }

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

  OptenerListaGrupoOcupacional() {
    this.ListGrupoOcupacional = []
    this._GrupoOp.ConsultarGrupoOcupacion().subscribe({
      next: (respuesta: any) => {
        this.ListGrupoOcupacional = respuesta
      }, error: (err) => {
        this.toastr.error(err.error.message, 'Erro server', {
          timeOut: 6000,
        });
      },
    })
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA VALIDAR INGRESO DE LETRA
  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }


  //METODO PARA ABRIR VENTANA EDITAR GRUPO OCUPACIONAL
  AbrirVentanaRegistrarGrupo() { 
    //console.log(datosSeleccionados);
    this.ventana.open(RegistrarGrupoOcupacionalComponent,
      {width: '450px'}).afterClosed().subscribe(items => {
        this.OptenerListaGrupoOcupacional();
      });
  }

  // METODO PARA ABRIR VENTANA EDITAR GRUPO OCUPACIONAL
  AbrirVentanaEditar(datosSeleccionados: any): void {
    //console.log(datosSeleccionados);
    this.ventana.open(EditarGrupoOcupacionalComponent,
      {
        width: '450px', data: datosSeleccionados
      }).afterClosed().subscribe(items => {
        this.OptenerListaGrupoOcupacional();
      });
  }

  // FUNCION PARA CONFIRMAR ELIMINAR REGISTROS
  ConfirmarDelete(datos: any) {
    //console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/proceso']);
        }
      });
  }
  // FUNCION PARA ELIMINAR REGISTROS
  Eliminar(id_grupo: number) {
    let dataGrupo = {
      id_grupo: id_grupo,
      user_name: this.user_name,
      ip: this.ip, ip_local: this.ips_locales
    };
    this._GrupoOp.ElminarGrupoOcupacion(dataGrupo).subscribe((res: any) => {
      if (res.codigo != 200) {
        this.toastr.error('No se completo el proceso', 'No fue posible eliminar.', {
          timeOut: 6000,
        });
      } else {
        this.toastr.error('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.OptenerListaGrupoOcupacional();
      }
    }, (error: any) => {
      this.toastr.error(error.error.message, 'No fue posible eliminar.', {
        timeOut: 6000,
      });
    });
  }


  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }


  /** ************************************************************************************************** **
       ** **                               METODO PARA EXPORTAR A PDF                                     ** **
       ** ************************************************************************************************** **/


  async GenerarPdf(action = 'open') {
    const pdfMake = await this.validar.ImportarPDF();
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
      pageSize: 'A4',
      pageOrientation: 'portrait',
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
        { text: 'Lista de Procesos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFProcesos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  presentarDataPDFProcesos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Descripcion', style: 'tableHeader' },
              ],
              ...this.ListGrupoOcupacional.map((obj: any) => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.descripcion, style: 'itemsTable' },
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
   ** **                                     METODO PARA EXPORTAR A EXCEL                             ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    /*
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.procesos);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Procesos');
    xlsx.writeFile(wb, "Procesos" + new Date().getTime() + '.xlsx');
    */
  }

  /** ************************************************************************************************** **
   ** **                                   METODO PARA EXPORTAR A CSV                                 ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    /*
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.procesos);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ProcesosCSV" + new Date().getTime() + '.csv');
    */
  }

  /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACION DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloGrados: any = [];
    this.ListGrupoOcupacional.forEach((obj: any) => {
      objeto = {
        "proceso": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "nivel": obj.nivel,
          "proceso_superior": obj.proc_padre,
        }
      }
      arregloGrados.push(objeto)
    });

    /*this.rest.CrearXML(arregloGrados).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/proceso/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });*/
  }


}
