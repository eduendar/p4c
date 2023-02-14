import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { Http } from "@angular/http";

import { AppSettings } from "../../app/app.settings";

import 'rxjs/Rx';

@Component({
    selector: 'page-result',
    templateUrl: 'result.html'
})
export class ResultPage {

    private test_id:number = 0;
    private total:number = 0;
    private right:number = 0;
    private percentage:number = 0.0;
    private wrong_questions = [];
    private test_questions = [];

    constructor( private navParams: NavParams, public navCtrl: NavController, private _http: Http) {

        this.test_id = navParams.get("id");
        _http.get(AppSettings.API_URL+"?func=get_test_questions&test_id="+this.test_id).map( ( res) => res.json() ).subscribe( (data) => {
            this.test_questions = data;
            console.log(data);
            _http.get(AppSettings.API_URL+"?func=get_result&test_id="+this.test_id).map( data => data.json())
                .subscribe((data)=>{
                    this.total = data.total;
                    this.right = data.right;
                    this.percentage = (data.right/data.total)*100;
                    this.wrong_questions = data.wrong_questions;
                });



        });
    }

    checkResponse(origin,question_id){

        for (let i of this.test_questions) {
            if (i.question_id == question_id){
                let a = JSON.parse(i.answer);
                if (a[origin.id]){
                    if (origin.right == "1")return "secondary";
                    return "danger";
                }

            }
        }
        return "";
    }

}
