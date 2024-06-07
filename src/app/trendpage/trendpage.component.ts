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
  apikey: string = 'cIWDPCUJjfHAoKmJcArtpBZyU77gexDx'
  geoApiKey: string = 'AIzaSyBiZa_fJotGY0kjzgtE6idkmSBP3NH2K_U'
  apiUrl: string = 'https://api.tomorrow.io/v4/weather/forecast'
  geoCodeUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json'
  fetchedWeatherData: any = {}

  constructor (private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.location = params.get('location') || ''
    })
  }

  createChart(){
    // check for weather type 
    const ctx = document.getElementById('MyChart') as HTMLCanvasElement;
    let minVal = Math.min(...this.fetchedWeatherData.trend)
    let minData = minVal - 5

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
            backgroundColor: 'violet'
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

  formatDate(isoDate: any) {
    const date = new Date(isoDate);
    const options: any = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return date.toLocaleDateString('en-US', options).split(' ')[1];
  }

  fetchWeatherData(location: string, trend: string): void {
    const params = {
      address: location,
      key: this.geoApiKey,
    };

    this.http.get(this.geoCodeUrl, { params }).subscribe(
      (response: any) => {
        const end = response['results'][0]['geometry']['location']

        this.http.get(`https://api.tomorrow.io/v4/weather/forecast?location=${end.lat}, ${end.lng}&apikey=${this.apikey}`).subscribe(
          (response: any) => {
            this.fetchedWeatherData = this.handleApiResponse(response, trend);
            this.createChart()
          },
          (error) => {
            console.error('Error fetching weather data:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching weather data:', error);
      }
    );

    
  }

  handleApiResponse(response: any, trend: string): any {
    const weatherData = response.timelines.hourly
    let trendData: Array<Number> = []
    let labels: Array<String> = []

    weatherData.map((dt: any) => labels.push(this.formatDate(dt.time)))

    switch (trend) {
      case 'temperature':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.temperature))
        break;
      case 'humidity_level':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.humidity))
        break;
      case 'wind_direction':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.windDirection)) 
        break;
      case 'wind_speed':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.windSpeed)) 
        break;
      default:
        trendData = [];
    }

    return {
      'labels': labels.slice(0, 28),
      'trend': trendData.slice(0, 28)
    }
  }

}
