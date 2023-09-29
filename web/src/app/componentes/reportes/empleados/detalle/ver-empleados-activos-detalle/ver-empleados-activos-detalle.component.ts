import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ver-empleados-activos-detalle',
  templateUrl: './ver-empleados-activos-detalle.component.html',
  styleUrls: ['./ver-empleados-activos-detalle.component.css']
})
export class VerEmpleadosActivosDetalleComponent implements OnInit{

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const data: string = this.route.snapshot.paramMap.get('lista')!;
    console.log(data)
    let obj= JSON.parse(data);    
    obj.forEach((obj1)=>{
      console.log(obj1)
    })
  
  }

}
