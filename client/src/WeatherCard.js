import React from "react";
import "./WeatherCard.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function WeatherCard({ data }) {
  const current = data.current_weather;
  const daily = data.daily;
  const lat = data.latitude;
  const lon = data.longitude;
  const location = data.location || "Location"; // you can modify this to pass in the name

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

      {lat && lon && (
        <div className="map-section">
          <h2>Location Map</h2>
          <MapContainer center={[lat, lon]} zoom={10} scrollWheelZoom={false} style={{ height: "300px", width: "100%", marginBottom: "1rem" }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lon]}>
              <Popup>
                {location}<br />Lat: {lat}, Lon: {lon}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
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
