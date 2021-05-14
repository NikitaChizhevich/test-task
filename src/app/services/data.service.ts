import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
    constructor(private http: HttpClient) {

    }

    getRate() {
        return from(this.getData());
    }

    private async getData() {
        const res = [];
        const dates = this.getDates();
        for (let i = 0; i < dates.length; i++) {
            try {
                const r = await this.http.get(`https://www.cbr-xml-daily.ru/archive/${dates[i]}/daily_json.js`).toPromise();
                res.push(this.formatData(r));
            } catch (error) {
                console.log('error');
            }
        }

        return res;
    }

    private formatData(item) {
        console.log(item);
        const newItem = {
            data: item.Date,
            usd: item.Valute.USD,
            eur: item.Valute.EUR
        }

        return newItem;
    }

    private getDates() {
        const dateArray = [];
        let currentDate = moment(new Date()).subtract(10, 'd');
        const stopDate = moment(new Date());
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('YYYY/MM/DD'))
            currentDate = moment(currentDate).add(1, 'days');
        }
        console.log(dateArray);
        return dateArray;
    }
}