import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Chart as ChartJS, ChartType } from 'chart.js/auto';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-trendpage',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgxChartsModule],
  templateUrl: './trendpage.component.html',
  styleUrl: './trendpage.component.css'
})

export class TrendpageComponent implements OnInit{
  public chart: any
  location: string = '' //stores the user-entered location
  myVar: string = 'temperature' //stores the selected weather variable inittially temperature
  myType: ChartType = 'bar' as ChartType;      //stores the chart type
  selectedChartLibrary: string='chartjs'; //default chart type
  selectedChartType: string = 'bar';     //default chart type

  //api keys for both the weather services and geocoding services
  apikey: string = 'OadOdFFBTzTIAaNY5xDtrTkH27KDCJc6'    
  geoApiKey: string = 'AIzaSyBiZa_fJotGY0kjzgtE6idkmSBP3NH2K_U'
  
  //urls for wetaher and geocoding apis
  apiUrl: string = 'https://api.tomorrow.io/v4/weather/forecast'
  geoCodeUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json'
  fetchedWeatherData: any = {}    //stores the processed weather data
barChartData: any;

  constructor (private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    //this function retrives location from the url parameter
    this.route.paramMap.subscribe(params => {
      this.location = params.get('location') || ''
    })
  }


  //Creating of chart from the standalone chart.js library
  createChart(){
    if (this.selectedChartLibrary === 'chart.js'){
      this.createChartJsChart();
    } else if (this.selectedChartLibrary === 'ngx-charts'){
      console.log(this.selectedChartType)
      //complete
        
    }
  }
    /*check for weather type 
    const ctx = document.getElementById('MyChart') as HTMLCanvasElement;
    let minVal = Math.min(...this.fetchedWeatherData.trend)
    let minData = minVal - 5
*/
    createChartJsChart(){
    //destroys existing chart if present
    if (this.chart) {
      this.chart.destroy(); 
    }
    const ctx = document.getElementById('myChartJS') as HTMLCanvasElement;
    //creates a new chart.js instance on the canvas element
    this.chart = new ChartJS(ctx, {
      type: this.myType ,  //set chart type from user selection
      //chart data definition
      data: {
        labels: this.fetchedWeatherData.labels.slice(0, 28),   //this is limited to first 28 and its extracted from fetchedWeatherData
     //an array with one object representing the weather variable
	      datasets: [
          {
            label: this.myVar,   //nased on myVar above
            data: this.fetchedWeatherData.trend.slice(0, 28),
            backgroundColor: 'grey'
          }
        ]
      },

      //creating ngx chart
      
      



      //defines the chart options
      options: {
        aspectRatio: 1.75,  //set to 1.75 for a wider chart
        scales: {
          y: {
            beginAtZero: false,    //for the y-axis,this is to allow for negative values
           // min: Math.floor(minData)    //set to the calculated min value above
          }
        }
      },
    });
  }
  
  onSubmit(event: Event): void {     //function handles form submission
    event.preventDefault();
    console.log(event);
    //condition to check if both location and weather variable are selected,if true fetchWeatherData is called to retrieve the data
    if (this.location && this.myVar) {
      this.fetchWeatherData(this.location, this.myVar);
    }
  }
  
  //function that takes an iso date string and converts to a js date object
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
    return date.toLocaleDateString('en-US', options).split(' ')[1];  //returns the formatted string
  }

  //function to fetch the weather data
  fetchWeatherData(location: string, trend: string): void {
    const params = {  //contructing the parameters for the geocoding api call
      address: location,
      key: this.geoApiKey,
    };
    //making an http GET request to the weather API
    this.http.get(`https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${this.apikey}`).subscribe(
          
      //processes the response using handleAPIResponse(research on it)
      //calls createChart to display the chart
         (response: any) => {
           console.log('got trend data')
           this.fetchedWeatherData = this.handleApiResponse(response, trend);
           console.log(this.fetchedWeatherData)
           this.createChart()
         },
         (error) => {
           console.error('Error fetching weather data:', error);
         }
       );

    
  }

  //Weather Data Processing Section
  handleApiResponse(response: any, trend: string): any {
    const weatherData = response.timelines.hourly   //extracts the hourly weather data
    let trendData: Array<Number> = []               //Initialising empty arrays for trend data and labels
    let labels: Array<String> = []
    
    //iteration through hourly data,adds formated date/time to labels using formatDate
    //extracts the relevant weather value based on myVar and adds to trendData
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
      case 'precipitation':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.precipitationProbability)) 
        break;
      case 'sunset':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.sunsetTime)) 
        break;
      case 'sunrise':
        trendData = []
        weatherData.map((dt: any) => trendData.push(dt.values.sunriseTime)) 
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
