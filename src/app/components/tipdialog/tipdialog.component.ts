import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { NavParams,Events} from '@ionic/angular';

@Component({
  selector: 'app-tipdialog',
  templateUrl: './tipdialog.component.html',
  styleUrls: ['./tipdialog.component.scss'],
})
export class TipdialogComponent implements OnInit {
  public did:string = "";
  public feedName:string = "";
  public feedDesc:string = "";
  constructor(
    public theme: ThemeService,
    private navParams: NavParams,
    private events:Events){ }

  ngOnInit() {
    this.did = this.navParams.get('did');
    this.feedName = this.navParams.get('name');
    this.feedDesc = this.navParams.get('des');
  }

  cancel(){
    this.events.publish("tipdialog-cancel");
  }

  confirm(){
    this.events.publish("tipdialog-confirm",this.feedName,this.feedDesc);
  }

}
