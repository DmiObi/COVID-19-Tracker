import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, printStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";

const App = () => {
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({}); // API info of the selected country
  const [countries, setCountries] = useState([]);  // full and abr. names of all countries
  const [mapCountries, setMapCountries] = useState([]); // full and abr. names of all countries
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases"); // cases is the dafault case type
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: 10.4796 });
  const [mapZoom, setMapZoom] = useState(2.3);

  // Loads worldwide data from API when the web app starts
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {setCountryInfo(data);});
  }, []);

  // Getting data from API for table and map  
  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({ // removing unnecessary data
            name: country.country, // country's full name 
            value: country.countryInfo.iso2, // country's abriviated name
          }));
          let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };

    getCountriesData();
  }, []);

  console.log(casesType);

  // updates components when a country is chosen
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode); // updates the current selected country
        setCountryInfo(data);

        if (countryCode === "worldwide") {
          setMapCenter([34.80746, 10.4796]) // defult center for the map 
          setMapZoom(2.3) // default zoom for the map
        } else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]); // the center of the maps becomes the center of they country
          setMapZoom(4); // by how much we zoom into the selected country
        }
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <div className="app__name_logo">
            <img src="./COVID-19_icon.png" className="app__logo"/>
            <h1 className="app__header_text">COVID-19 Tracker</h1>
          </div>
          
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={printStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={printStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
