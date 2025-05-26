CREATE TABLE weather_requests (
  id INT NOT NULL AUTO_INCREMENT,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  latitude FLOAT,
  longitude FLOAT,
  weather_data TEXT,
  PRIMARY KEY (id)
);