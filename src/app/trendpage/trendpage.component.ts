import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Chart, { ChartTypeRegistry } from 'chart.js/auto';

@Component({
  selector: 'app-trendpage',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './trendpage.component.html',
  styleUrl: './trendpage.component.css'
})

export class TrendpageComponent implements OnInit{
  public chart: any
  location: string = ''
  myVar: string = 'temperature'
  myType: String = 'bar'
  apikey: string = 'b252a5af48d4190ae5d519ca9b0e2b75'
  apiUrl: string = 'http://api.openweathermap.org/data/2.5/forecast'
  fetchedWeatherData: any = {}

  constructor (private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.location = params.get('location') || ''
    })
  }

  createChart(){
    const ctx = document.getElementById('MyChart') as HTMLCanvasElement;
    let minVal = Math.min(...this.fetchedWeatherData.trend)
    let minData = minVal > 10 ? minVal - 10 : minVal

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: this.myType == 'bar' ? 'bar' : 'line',

      data: {
        labels: this.fetchedWeatherData.labels, 
	      datasets: [
          {
            label: this.myVar,
            data: this.fetchedWeatherData.trend,
            backgroundColor: 'blue'
          }
        ]
      },
      options: {
        aspectRatio: 1.75,
        scales: {
          y: {
            beginAtZero: false,
            min: Math.floor(minData)
          }
        }
      },
    });
  }
  
  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.location && this.myVar) {
      this.fetchWeatherData(this.location, this.myVar);
    }
  }

  fetchWeatherData(location: string, trend: string): void {
    const params = {
      q: location,
      appid: this.apikey,
      units: 'metric'
    };

    this.http.get(this.apiUrl, { params }).subscribe(
      (response: any) => {
        this.fetchedWeatherData = this.handleApiResponse(response, trend);
        console.log(this.fetchedWeatherData)
        this.createChart()
      },
      (error) => {
        console.error('Error fetching weather data:', error);
      }
    );
  }

  handleApiResponse(response: any, trend: string): any {
    const weatherData = response.list
    let trendData: Array<Number> = []
    let stats: Array<any> = []
    let desc: Array<String> = []
    let details: Array<String> = []
    let labels: Array<String> = []

    weatherData.map((dt: any) => {
      desc = []
      details = []
      weatherData.map((dt: any) => desc.push(dt.weather[0].main))
      weatherData.map((dt: any) => details.push(dt.weather[0].description))
      stats.push({
        'main': desc,
        'description': details
      })
    })

    weatherData.map((dt: any) => labels.push(dt.dt_txt.split(' ')))

    switch (trend) {
      case 'temperature':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.main.temp))
        break;
      case 'humidity_level':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.main.humidity))
        break;
      case 'precipitation':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.main.pressure)) 
        break;
      default:
        trendData = [];
    }

    return {
      'labels': labels.slice(0, 15),
      'trend': trendData.slice(0, 15),
      'stats': stats.slice(0, 15)
    }
  }

}
