const API_KEY = "Enter Your API KEY here";

/*```````````````````````````````````````````````````
` `Go to https://openweathermap.org/api this link ```````````
``Register Yourself as a user using your mail id & confirm```````
``Go to your profile section select "My API Keys" ``````````````
`` A key will appear there just copy and paste it in above section```
````````````````````````````````````````````````````*/

const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");


const errorFound = document.querySelector(".errorContainer");
const errorMessage = document.querySelector("[data-errorText]");
const errorImg = document.querySelector('[data-notFoundImg]');

let currentTab = userTab;
currentTab.classList.add("current-tab");
getfromSessionStorage(); 

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //if search form is invisble make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            errorFound.classList.remove("active");
            searchForm.classList.add("active");
        } else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorFound.classList.remove("active");

            //check sesssion storage maybe you have stored the coordinates in the local stotage
            getfromSessionStorage( );
        }
    }
}


userTab.addEventListener("click", ( ) => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", ( ) => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

function getfromSessionStorage( ){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    
    if (!localCoordinates){
        grantAccessContainer.classList.add("active");
    } else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    //make grant access display invisible
    grantAccessContainer.classList.remove("active");

    //show laoding gif to usr
    loadingScreen.classList.add("active");

    //call api
    try{
        let response  = await fetch( `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err){

        loadingScreen.classList.remove("active");
        errorFound.classList.add("active");
        errorImg.style.display = "none";
        errorMessage.innerText = `Error: ${err?.message}`;
        errorBtn.addEventListener("click", fetchUserWeatherInfo);
    }
}

function renderWeatherInfo(weatherInfo){

    //fetching elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo)

    //fetch data from data object and then show it no UI 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation( ){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    } else{
        ///Show an alert for no geolocation support available
        console.log("No Geolocation Support on your system")
    }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault( );
    let cityName = searchInput.value;

    if(cityName === "")
        return
    else
        fetchSearchWeatherInfo(cityName);
})


async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    errorFound.classList.remove("active");
    grantAccessContainer.classList.remove("ative");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        if (!data.sys){
            throw data;
        }

        errorFound.classList.remove("active");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err){
        console.log("An error occured", err);
        userInfoContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        errorFound.classList.add("active");
        errorMessage.innerText = `Error: ${err?.message}`;
    }
}
