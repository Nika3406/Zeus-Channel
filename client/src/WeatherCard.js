import React from "react";
import "./WeatherCard.css";

function WeatherCard({ data }) {
  const current = data.current_weather;
  const daily = data.daily;

  return (
    <div className="weather-card">
      {current ? (
        <>
          <h2>Current Weather</h2>
          <p>Temp: {current.temperature}°C</p>
          <p>Wind: {current.windspeed} km/h</p>
        </>
      ) : (
        <p><i>No current weather data available.</i></p>
      )}

      {daily ? (
        <>
          <h2>Forecast</h2>
          {daily.time.map((day, i) => (
            <div className="forecast" key={i}>
              <strong>{day}</strong><br />
              Max Temp: {daily.temperature_2m_max[i]}°C<br />
              Min Temp: {daily.temperature_2m_min[i]}°C<br />
              Precipitation: {daily.precipitation_probability_max?.[i] ?? "N/A"}%<br />
              Humidity: {daily.relative_humidity_2m_mean?.[i] ?? "N/A"}%
            </div>
          ))}
        </>
      ) : (
        <p><i>No forecast data available.</i></p>
      )}
    </div>
  );
}

export default WeatherCard;
