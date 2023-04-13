import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Task } from '../../../../model/reportes.model'

@Component({
  selector: 'app-config-empleados',
  templateUrl: './config-empleados.component.html',
  styleUrls: ['./config-empleados.component.css']
})
export class ConfigEmpleadosComponent implements OnInit {

  task: Task = {
    name: 'Seleccionar Todo',
    completed: false,
    subtasks: [
      { name: 'Codigo', completed: false },
      { name: 'Departamento', completed: false },
      { name: 'Cargo', completed: false },
      { name: 'Grupo', completed: false },
      { name: 'Detalle Grupo', completed: false }
    ]
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => t.completed = completed);
  }

  constructor(
    public dialogRef: MatDialogRef<ConfigEmpleadosComponent>,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }

  GuardarConfiguracionEmpleado() {
    sessionStorage.removeItem('arrayConfig');
    sessionStorage.removeItem('columnasValidas');
    if (this.task.subtasks) {
      console.log(this.task.subtasks);
      let columnasValidas = this.task.subtasks.filter(obj => {
        return (obj.completed === true)
      }).length + 3;
      console.log(columnasValidas);
      sessionStorage.setItem('columnasValidas', columnasValidas.toString())

      let ObjetoJSON = {
        // cedula: this.task.subtasks.filter(obj => {return (obj.name === 'Cedula')}).map(obj => {return obj.completed})[0],
        // nombre: this.task.subtasks.filter(obj => {return (obj.name === 'Nombre')}).map(obj => {return obj.completed})[0],
        codigo: this.task.subtasks.filter(obj => { return (obj.name === 'Codigo') }).map(obj => { return obj.completed })[0],
        depart: this.task.subtasks.filter(obj => { return (obj.name === 'Departamento') }).map(obj => { return obj.completed })[0],
        cargo: this.task.subtasks.filter(obj => { return (obj.name === 'Cargo') }).map(obj => { return obj.completed })[0],
        grupo: this.task.subtasks.filter(obj => { return (obj.name === 'Grupo') }).map(obj => { return obj.completed })[0],
        detall: this.task.subtasks.filter(obj => { return (obj.name === 'Detalle Grupo') }).map(obj => { return obj.completed })[0]
      }

      let jsonTask = JSON.stringify(ObjetoJSON)
      console.log(jsonTask);
      sessionStorage.setItem('arrayConfig', jsonTask)
      this.toastr.success('Configuración guardada', '', {
        timeOut: 6000,
      })
      this.dialogRef.close()
    }

  }

}
