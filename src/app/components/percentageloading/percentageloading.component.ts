import { Component, OnInit,Input} from '@angular/core';

@Component({
  selector: 'app-percentageloading',
  templateUrl: './percentageloading.component.html',
  styleUrls: ['./percentageloading.component.scss'],
})
export class PercentageloadingComponent implements OnInit {

  public max:number = 100;
  public stroke: number = 4;
  public radius: number = 25;
  public color: string = '#7624fe';
  public background: string = '#eaeaea';
  public clockwise: boolean = true;
  public duration: number = 800;
  public animation: string = 'easeOutCubic';
  public animationDelay: number = 0;
  public gradient: boolean = false;
  public rounded:boolean = false;
  public semicircle: boolean = false;
  @Input() public percent:number = 0;
  @Input() public rotateNum:any ={};
  constructor() { }

  ngOnInit() {}

}
