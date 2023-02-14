import {Component} from '@angular/core';

import { Http, URLSearchParams, Headers } from '@angular/http';

import {NavController, NavParams, ToastController} from 'ionic-angular';
import { AppSettings } from "../../app/app.settings";
import 'rxjs/Rx';
import {ResultPage} from "../result/result";


interface Answer {
    id: number;
    text: string;
    right: boolean;
}

interface Question {
    id: number;
    text: string;
    type: number;
    opportunity: number
    answers: Answer
}

@Component({
    selector: 'page-exercise',
    templateUrl: 'exercise.html'
})
export class ExercisePage {
    private test_id = 0;
    private mode = 0;

    private max = 60;
    private current = 0;
    private test_questions = [];
    private currentQuestion: Question;

    private userResponse = {};
    private checkActivated = false;

    constructor( private navParams: NavParams, private _http: Http, private toastCtrl: ToastController, public navCtrl: NavController) {
        this.mode = navParams.get("mode");
        this.test_id = navParams.get("id");
        _http.get(AppSettings.API_URL+"?func=get_test_questions&test_id="+this.test_id).map( ( res) => res.json() ).subscribe( (data) => {
            this.test_questions = data;
            this.max = data.length;

            this.nextQuestion();
        });
    };

    nextQuestion(){

        if (this.current == this.max){
            this.navCtrl.push(ResultPage, {
                id: this.test_id
            });
            return;
        }



        let question_id = this.test_questions[this.current].question_id;
        this._http.get(AppSettings.API_URL+"?func=get_question&question_id="+question_id)
            .map( ( res) => res.json() ).subscribe( (data) => {
                this.currentQuestion = data[0];
                this.userResponse = {};
                let answers = data[0].answers;
                if (this.test_questions[this.current].answer){
                    this.userResponse = JSON.parse(this.test_questions[this.current].answer);
                }else{
                    Object.keys(answers).map( (item) => {
                        this.userResponse[answers[item].id] = false;
                    });
                }
            this.current += 1;
            this.checkActivated = false;
        });
    }

    previous(){
        this.current -= 2;
        this.nextQuestion();
    }

    checkQuestion(){
        this.checkActivated = true;
    }

    checkResponse(origin, user){

        if (this.checkActivated){
            let o = origin == 1?true:false;

            if (o == true && o == user){
                return "secondary";
            }else if ( user == true && o == false){
                return "danger";
            }
        }

    }

    saveQuestion(){

        let op = this.currentQuestion.opportunity;
        let count = 0;
        Object.keys(this.userResponse).map( (key) => {
            if (this.userResponse[key] == true) count += 1;
        });

        if (op != count){
            let msg = 'Please choose '+op+' answers';
            if (op == 1) msg = 'Please choose '+op+' answer';
            let toast = this.toastCtrl.create({
                message: msg,
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return false;
        }

        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('id', this.test_questions[this.current-1].id);
        urlSearchParams.append('answer', JSON.stringify(this.userResponse));
        let body = urlSearchParams.toString();

        let headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        this._http.post(AppSettings.API_URL+"?func=save_question",body,{headers: headers}
        ).map( ( res) => res.json() ).subscribe( (data) => {
           this.nextQuestion();
        });
    }
}