import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from 'app/services/data.service';
import * as Chartist from 'chartist';
import 'chartist-plugin-tooltips';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  leftCurrency = 'RUR';
  rightCurrency = 'USD';
  changeUsd: any = 0;
  changeEur: any = 0;
  currentEurRate = 0;
  currentUsdRate = 0;
  rubInput = new FormControl();
  convertInput = new FormControl({ value: 0, disabled: true });
  constructor(private dataService: DataService) { }
  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;
    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  };
  startAnimationForBarChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  };
  ngOnInit() {
    this.rubInput.valueChanges.subscribe(v => {
      const last = v.slice(v.length - 1);
      if (isNaN(Number(last)) && last !== '.') {
        this.rubInput.setValue(v.slice(0, -1));
      }
    });

    this.dataService.getRate().subscribe(res => {
      this.changeEur = res.length ? (res[res.length - 1].eur.Value - res[res.length - 1].eur.Previous).toFixed(4) : 0;
      this.changeUsd = res.length ? (res[res.length - 1].usd.Value - res[res.length - 1].usd.Previous).toFixed(4) : 0;


      this.currentEurRate = res.length ? (res[res.length - 1].eur.Value) : 0;
      this.currentUsdRate = res.length ? (res[res.length - 1].usd.Value) : 0;

      const minUsd = Math.min.apply(null, res.map(item => item.usd.Value)),
        maxUsd = Math.max.apply(null, res.map(item => item.usd.Value)),
        minEur = Math.min.apply(null, res.map(item => item.eur.Value)),
        maxEur = Math.max.apply(null, res.map(item => item.eur.Value));

      const dataUsd: any = {
        labels: res.map(v => moment(v.data).format('DD.MM.YYYY')),
        series: [
          res.map(v => v.usd.Value)
        ]
      };

      const dataEur: any = {
        labels: res.map(v => moment(v.data).format('DD.MM.YYYY')),
        series: [
          res.map(v => v.eur.Value)
        ]
      };

      const optionsUsd: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0
        }),
        low: Math.floor(minUsd),
        high: Math.ceil(maxUsd), // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
        axisY: {
          showLabel: true,
        },
        plugins: [
          Chartist.plugins.tooltip({
          })
        ]
      };
      const optionsEur: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0
        }),
        low: Math.floor(minEur),
        high: Math.ceil(maxEur), // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
        axisY: {
          showLabel: true,
        },
        plugins: [
          Chartist.plugins.tooltip({
          })
        ]
      }


      const usdChart = new Chartist.Line('#usdChart', dataUsd, optionsUsd);
      const eurChart = new Chartist.Line('#eurChart', dataEur, optionsEur);


      this.startAnimationForLineChart(usdChart);
      this.startAnimationForLineChart(eurChart);

    });

  }


  convertToUsd() {
    const v = this.rubInput.value || 0;
    if (!isNaN(Number(v))) {
      console.log(v);
      this.convertInput.setValue((v / this.currentUsdRate).toFixed(4));
    }
  }

  setActiveLeftCurrency(currency: string) {
    this.leftCurrency = currency;
  }

  setActiveRightCurrency(currency: string) {
    this.rightCurrency = currency;
  }


  convert() {
    if (this.leftCurrency === this.rightCurrency) {
      this.convertInput.setValue(this.rubInput.value);
      return;
    }
    const event = `${this.leftCurrency}>${this.rightCurrency}`;
    switch (event) {
      case `RUR>EUR`:
        this.convertInput.setValue((this.rubInput.value / this.currentEurRate).toFixed(2));
        break;
      case `RUR>USD`:
        this.convertInput.setValue((this.rubInput.value / this.currentUsdRate).toFixed(2));
        break;
      case `EUR>RUR`:
        this.convertInput.setValue((this.rubInput.value * this.currentEurRate).toFixed(2));
        break;
      case `USD>RUR`:
        this.convertInput.setValue((this.rubInput.value * this.currentUsdRate).toFixed(2));
        break;
      case `USD>EUR`:
        const rubUsd = this.rubInput.value * this.currentUsdRate;
        const eur = rubUsd / this.currentEurRate;
        this.convertInput.setValue(eur.toFixed(2));
        break;
      case `EUR>USD`:
        const rubEur = this.rubInput.value * this.currentEurRate;
        const usd = rubEur / this.currentUsdRate;
        this.convertInput.setValue(usd.toFixed(2));
        break;
      default:
        break;
    }
  }
}
