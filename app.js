const searchForm = document.querySelector('#searchForm');
const cityName = document.querySelector('#cityName')
const temperature = document.querySelector('#temperature')
const time = document.querySelector('#time')
const localTime = document.querySelector('#localTime')
const weather = document.querySelector('#weather')
const sunrise = document.querySelector('#sunrise')
const sunset = document.querySelector('#sunset')
const weatherIcon = document.querySelector('#weatherIcon')
const thisHour = document.querySelector('#thisHour')
const nextHour = document.querySelector('#nextHour')
const today = document.querySelector('#today')

const apiId = 'f77910a5f7e2b10ec9cebe2b18c8390b'
let degUnit = 'imperial'

const DateTime = luxon.DateTime;

searchForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    let searchTerm = searchForm.elements.query.value;
    searchTerm = searchTerm.replaceAll(' ', '+')
    weatherInfo(searchTerm)
    searchForm.elements.query.value = ''
})

// a function that calls the API and extracts all the information needed; will need to add it to the eventlistener

const weatherInfo = async (query) => {
    try {
        let cityForOneAPI = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${query}&units=${degUnit}&appid=${apiId}`)
        let lat = cityForOneAPI.data.coord.lat
        let lon = cityForOneAPI.data.coord.lon
        cityName.textContent = `${cityForOneAPI.data.name}, ${cityForOneAPI.data.sys.country}`
        let city = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${degUnit}&appid=${apiId}`)
        console.log(city.data)
        timeConversion(city.data)
        temperature.textContent = unitConvert(city.data.current.temp)
        weather.textContent = city.data.current.weather[0].description.toUpperCase()
        weatherIcon.src = `http://openweathermap.org/img/wn/${city.data.current.weather[0].icon}@2x.png`
        tableInfo(city.data.hourly[0], thisHour)
        tableInfo(city.data.hourly[1], nextHour)
        tableInfo(city.data.daily[0], today)
    } catch (err) {
        console.log(err)
    }

}

const unitConvert = (locationDeg) => {
    if (degUnit === 'imperial') {
        return Math.round(locationDeg) + '°F'
    }
    // let degF = Math.floor(((locationDeg - 273.15) * 1.8) + 32)
    // return `${degF}°F`
}

const timeConversion = (unixTime) => {
    time.textContent = DateTime.fromMillis(unixTime.current.dt * 1000).toLocaleString(DateTime.DATETIME_FULL)
    //need to multiply by 1000 as API info gives a unix timestamp that is milliseconds since epoch; product gives seconds
    localTime.textContent = DateTime.fromISO(DateTime.fromMillis(unixTime.current.dt * 1000), { zone: unixTime.timezone }).toLocaleString(DateTime.DATETIME_HUGE)
    sunrise.textContent = DateTime.fromMillis(unixTime.current.sunrise * 1000).toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET)
    sunset.textContent = DateTime.fromMillis(unixTime.current.sunset * 1000).toLocaleString(DateTime.TIME_WITH_SHORT_OFFSET)
}

const tableInfo = (hourInfo, tableRow) => {
    let hourlyInfo = [`${hourInfo.pop}%`, `${hourInfo.humidity}%`, `${hourInfo.wind_speed} MPH`, hourInfo.uvi]

    for (let i = 1; i <= thisHour.children.length - 1; i++) {
        tableRow.children[i].innerText = '' //to clear out any previous cities' info
        tableRow.children[i].append(hourlyInfo[i - 1])
    }
    let ultraV = tableRow.lastElementChild
    ultraV.className = ''
    if (parseInt(ultraV.innerText) < 3) {
        ultraV.classList.add('uk-text-success', 'uk-text-bold')
    } else if (parseInt(ultraV.innerText) >= 3 && parseInt(ultraV.innerText) < 8) {
        ultraV.classList.add('uk-text-warning', 'uk-text-bold')
    } else {
        ultraV.classList.add('uk-text-danger', 'uk-text-bold')
    }
}