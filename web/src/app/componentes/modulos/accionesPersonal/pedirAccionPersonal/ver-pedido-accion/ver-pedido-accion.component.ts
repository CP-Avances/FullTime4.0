import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

// IMPORTACION DE SERVICIOS
import { AccionPersonalService } from 'src/app/servicios/modulos/modulo-acciones-personal/accionPersonal/accion-personal.service';
import { ValidacionesService } from 'src/app/servicios/generales/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/configuracion/parametrizacion/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/usuarios/empleado/empleadoRegistro/empleado.service';
import { ProcesoService } from 'src/app/servicios/modulos/modulo-acciones-personal/catProcesos/proceso.service';
import { EmpresaService } from 'src/app/servicios/configuracion/parametrizacion/catEmpresa/empresa.service';

import { ListarPedidoAccionComponent } from '../listar-pedido-accion/listar-pedido-accion.component';

@Component({
  selector: 'app-ver-pedido-accion',
  standalone: false,
  templateUrl: './ver-pedido-accion.component.html',
  styleUrls: ['./ver-pedido-accion.component.css']
})

export class VerPedidoAccionComponent implements OnInit {

  @Input() idPedido: number;

  // INICIACION DE VARIABLES 
  idEmpleadoLogueado: any;
  empleados: any = [];
  departamento: any;

  constructor(
    public restProcesos: ProcesoService,
    public restEmpresa: EmpresaService,
    public componentel: ListarPedidoAccionComponent,
    public restAccion: AccionPersonalService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    public router: Router,
    public restE: EmpleadoService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado') as string);
    this.departamento = parseInt(localStorage.getItem("departamento") as string);
  }

  ngOnInit(): void {
    this.ObtenerTiposAccion();
    this.BuscarParametro();

  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'dd/MM/yyyy';
  formato_hora: string = 'HH:mm:ss';
  idioma_fechas: string = 'es';
  // METODO PARA BUSCAR PARAMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 1
    this.parametro.ListarDetalleParametros(1).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.CargarInformacion(this.formato_fecha)
      },
      vacio => {
        this.CargarInformacion(this.formato_fecha)
      });
  }

  // METODO DE BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe((datos) => {
      this.tipos_accion = datos;
    });
  }

  datosPedido: any = [];
  datoEmpleado: string = '';
  datoEmpleadoH: string = '';
  datoEmpleadoG: string = '';
  datoEmpleadoR: string = '';
  sueldo: string = '';
  ciudad: string = '';
  cargo: string = '';
  cargoH: string = '';
  cargoG: string = '';
  cargoR: string = '';
  cargop: string = '';
  decreto: string = '';
  departamentoE: string = '';
  proceso: string = '';
  identificacion: string = '';
  textoFijo: string = '';
  CargarInformacion(formato_fecha: string) {
    this.restAccion.BuscarDatosPedidoId(this.idPedido).subscribe(data => {
      this.datosPedido = data;
      
      console.log('datos pedido: ',this.datosPedido)

      this.tipos_accion.forEach((item: any) => {
        if (item.descripcion == this.datosPedido[0].descripcion) {
          this.textoFijo = item.base_legal + ' ';
        }
      });

      this.datosPedido.forEach((valor: any) => {
        valor.fecha_elaboracion =  this.validar.FormatearFecha(valor.fecha_elaboracion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        valor.fecha_rige_desde =  this.validar.FormatearFecha(valor.fecha_rige_desde, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        valor.fecha_rige_hasta =  this.validar.FormatearFecha(valor.fecha_rige_hasta, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas);
        valor.fecha_posesion =  valor.fecha_posesion ? this.validar.FormatearFecha(valor.fecha_posesion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
        valor.fecha_acta_final =  valor.fecha_acta_final ? this.validar.FormatearFecha(valor.fecha_acta_final, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
        valor.fecha_testigo = valor.fecha_testigo ? this.validar.FormatearFecha(valor.fecha_testigo, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
        valor.fecha_comunicacion = valor.fecha_comunicacion ? this.validar.FormatearFecha(valor.fecha_comunicacion, formato_fecha, this.validar.dia_abreviado, this.idioma_fechas) : "";
        valor.hora_comunicacion = valor.hora_comunicacion ? this.validar.FormatearHora(valor.hora_comunicacion, this.formato_hora) : "";
      })

    });
  }

  // METODO PARA VER LISTA DE PEDIDOS
  VerListaPedidos() {
    this.componentel.ver_lista = true;
    this.componentel.ver_datos = false;
    this.componentel.VerDatosAcciones();
  }

  // METODO PARA ABRIR EDITAR
  AbrirEditar(id: number) {
    this.componentel.ver_editar = true;
    this.componentel.ver_datos = false;
    this.componentel.pagina = 'datos-pedido';
    this.componentel.pedido_id = id;
  }

}
