const searchForm = document.querySelector('.search-loaction');
const cityValue = document.querySelector('.search-loaction input');
const cityName = document.querySelector('.city-name p');
const cardBody = document.querySelector('.card-body');
const timeImage = document.querySelector('.card-top img');
const highlights = document.querySelector('.highlights');
const hour = document.querySelector('.hourly');

const spitOutCelcius = (kelvin) => {
  celcius = Math.round(kelvin - 273.15);
  return celcius;
}
const isDayTime = (icon) => {
  if (icon.includes('d')) { return true }
  else { return false }
}

updateWeatherApp = (data) => {
  const [daily, hourly] = data;
  const imageName = daily.weather[0].icon;
  const iconSrc = `http://openweathermap.org/img/wn/${imageName}@2x.png`
  cityName.textContent = daily.name;
  cardBody.innerHTML = `
    <div class="card-body">
          <div class="card-mid d-flex">
            <div class="col-7 text-center temp">
              <span style="font-size: 3em; letter-spacing: -2px;">${spitOutCelcius(daily.main.temp)}&deg;C</span>
            </div>
            <div class="col-5 mt-3 condition-temp">
              <p class="condition" style="text-transform:capitalize;">${daily.weather[0].description}</p>
              <p class="high">${spitOutCelcius(daily.main.temp_max)}&deg;C</p>
              <p class="low">${spitOutCelcius(daily.main.temp_min)}&deg;C</p>
            </div>
          </div>
          <div class="icon-container card shadow mx-auto my-3">
            <img src="${iconSrc}" class="mx-auto my-auto" alt="" />
          </div>
          <div class="px-3 py-2 d-flex justify-content-center gap-2">
            <div class="text-center">
            <span>Feels Like</span>
              <span class="pr-2">${spitOutCelcius(daily.main.feels_like)}&deg;C</span>
            </div>
            <div class="text-center ml-4">
            <span>Humidity</span>
              <span>${daily.main.humidity}%</span>
            </div>
          </div>
        </div>
    `;

  if (isDayTime(imageName)) {
    timeImage.setAttribute('src', './assets/day_image.svg');
  } else {
    timeImage.setAttribute('src', './assets/night_image.svg');
  }

  hour.innerHTML = ``;

  for (i = 0; i < 8; i++) {
    const hourly_imageName = hourly.list[i].weather[0].icon;
    const hourly_iconSrc = `http://openweathermap.org/img/wn/${hourly_imageName}@2x.png`
    const str = hourly.list[i].weather[0].description;
    const desc = str.charAt(0).toUpperCase() + str.slice(1);
    hour.innerHTML += `
    <div style="border-radius: 15%" class="
    d-flex
    col-12 col-md-4 col-xl-2 col-lg-3
    flex-column
    align-items-center
    bg-white
    p-3
    m-2
    font-weight-bold
  ">
  <p>${desc}</p>
  <img src="${hourly_iconSrc}" class="py-4" alt="" style="max-width: 100px" />
  <div>
    <span>${spitOutCelcius(hourly.list[i].main.temp_max)}&deg;C</span>
    <span>${spitOutCelcius(hourly.list[i].main.temp_min)}&deg;C</span>
  </div>
  <span>${hourly.list[i].dt_txt.split(' ')[1]}</span>
  
  </div>
    `;
  }

  highlights.innerHTML = `
    <div style="border-radius: 15%" class="
    d-flex
    col-12 col-md-4 col-xl-2 col-lg-3
    flex-column
    align-items-center
    bg-white
    p-3
    m-2
    font-weight-bold
  ">
<p class="py-2">Visibility</p>
<h2 class="py-2">${parseInt(daily.visibility) / 1000} km</h2>
<img src="./assets/binoculars.png" style="height: 120px;" alt="" srcset="" />
</div>
<div style="border-radius: 15%" class="
    d-flex
    col-12 col-md-4 col-xl-2 col-lg-3
    flex-column
    align-items-center
    bg-white
    p-3
    m-2
    font-weight-bold
  ">
<p class="py-2">Pressure</p>
<h2 class="py-2">${daily.main.pressure} hPa</h2>
<img src="./assets/pressure-gauge.png" style="height: 120px;" alt="" srcset="" />
</div>
<div style="border-radius: 15%" class="
    d-flex
    col-12 col-md-4 col-xl-2 col-lg-3
    flex-column
    align-items-center
    bg-white
    p-3
    m-2
    font-weight-bold
  ">
<p class="py-2">Wind Speed</p>
<h2 class="py-2">${daily.wind.speed} km/h</h2>
<img src="./assets/windock.png" style="height: 120px;" alt="" srcset="" />
</div>
    `;

}

function successCallback(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  requestByCoord(lat, lon)
    .then((data) => {
      updateWeatherApp(data);
    })
    alert("Write the name of the city which you want to search and select Enter button to get the information.");
}

navigator.geolocation.getCurrentPosition(successCallback);

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const citySearched = cityValue.value.trim();
  searchForm.reset();

  requestByCity(citySearched)
    .then((data) => {
      updateWeatherApp(data);
      updateGraph(data);
    })
})

updateGraph = (data) => {
  const [daily,hourly] = data;

  const xlabels = [];
  const ylabels = [];

  chartIt();

  async function chartIt() {
    await getData();
    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: xlabels,
        datasets: [
          {
            label: 'Maximum Temperature',
            data: ylabels,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 3,
            borderColor: '#777',
            hoverBorderWidth: 3,
            hoverBorderColor: '#000'
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: 'Maximum Temperature v/s Time (Graph/Chart)',
          fontSize: 25
        },
        legend: {
          display: true,
          position: 'right',
          labels: {
            fontColor: '#000'
          }
        },
        layout: {
          padding: {
            left: 50,
            right: 0,
            bottom: 0,
            top: 0
          }
        },
        tooltips: {
          enabled: true
        }
      }
    });
  }

  async function getData() {

    for (i = 0; i < 10; i++) {
      const time = hourly.list[i].dt_txt.split(' ')[1]
      xlabels.push(time);

      const maxtemp = hourly.list[i].main.temp_max;
      ylabels.push(maxtemp);
    }
  }
}