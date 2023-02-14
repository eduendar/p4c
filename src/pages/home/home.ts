import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { ExercisePage } from "../exercise/exercise";
import {Http} from "@angular/http";
import { AppSettings } from "../../app/app.settings";

import 'rxjs/Rx';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


    constructor(public navCtrl: NavController, private _http: Http) {
    }

    create(mode = 1) {
        this._http.get(AppSettings.API_URL + "?func=create_test&mode=" + mode).map((data) => data.json()).subscribe((data) => {
            this.start(data.test_id,mode);
        });
    }


    start(test_id,mode) {
        this.navCtrl.push(ExercisePage, {
            id: test_id,
            mode: mode
        });
    }
}
