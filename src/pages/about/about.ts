import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {Http} from "@angular/http";

import 'rxjs/Rx';
import {ExercisePage} from "../exercise/exercise";

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
    private api_url = "http://emreduendar.de/p4c/api/index.php";
    private tests = [];

  constructor(public navCtrl: NavController, private _http: Http) {
    this.get_tests();
  }

    get_tests(){
        this._http.get(this.api_url+"?func=get_tests").map( (data) => data.json() ).subscribe( (data) => {
            this.tests = data;
        });
    }

    start(test_id) {
        this.navCtrl.push(ExercisePage, {
            id: test_id
        });
    }
}
