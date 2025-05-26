import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import WeatherCard from './WeatherCard';
import 'leaflet/dist/leaflet.css';

function App() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  // Fetch existing entries from the server
  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/read');
      setEntries(res.data);
    } catch (err) {
      setError('Failed to fetch entries.');
      console.error(err);
    }
  };

  // Submit form data to create a new weather entry
  const handleSubmit = async () => {
    setError('');
    if (!location || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }

    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      await axios.post('/api/create', {
        location,
        start_date: startDate,
        end_date: endDate
      });

      fetchEntries();

      // Reset input fields
      setLocation('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError('Failed to create entry. Make sure location is valid.');
      console.error(err);
    }
  };

  // Delete an entry by ID
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/delete/${id}`);
      fetchEntries();
    } catch (err) {
      setError('Failed to delete entry.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="App">
      <h1>Zeus Channel - Nicholas Shvelidze</h1>

      {/* Toggle Info Section */}
      <button onClick={() => setShowInfo(prev => !prev)}>
        {showInfo ? 'Hide Info' : 'Show Info'}
      </button>

      {showInfo && (
        <section className="info-text">
          <h2>About Product Manager Accelerator</h2>
          <p>
            The Product Manager Accelerator Program supports PM professionals at every career stage. From students to executives, our community has helped hundreds land dream roles.
          </p>
          <p>
            Learn new skills, sharpen your leadership, and launch your PM career with guidance from experienced mentors.
          </p>

          <h3>🚀 Services We Offer</h3>
          <ul>
            <li>
              <strong>PMA Pro:</strong> Complete PM job hunting program with mock interviews, referrals, and offers from top companies—some earning up to $800K/year.
            </li>
            <li>
              <strong>AI PM Bootcamp:</strong> Build real AI products with engineers and designers. Launch to real users.
            </li>
            <li>
              <strong>PMA Power Skills:</strong> Sharpen PM, leadership, and executive presentation skills.
            </li>
            <li>
              <strong>PMA Leader:</strong> Accelerate to Director or executive roles.
            </li>
            <li>
              <strong>1:1 Resume Review:</strong> Rewrite your resume with our experts and guarantee interviews.
              <br />
              Free resume template: <a href="https://www.drnancyli.com/pmresume" target="_blank" rel="noopener noreferrer">drnancyli.com/pmresume</a>
            </li>
          </ul>

          <p>Free PM training available on:</p>
          <ul>
            <li>YouTube: <a href="https://www.youtube.com/c/drnancyli" target="_blank" rel="noopener noreferrer">Dr. Nancy Li</a></li>
            <li>Instagram: <a href="https://instagram.com/drnancyli" target="_blank" rel="noopener noreferrer">@drnancyli</a></li>
          </ul>
        </section>
      )}

      <div className="form">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Saved Weather Entries</h2>
      {entries.map((entry) => {
        let data;
        try {
          data = typeof entry.weather_data === 'string'
            ? JSON.parse(entry.weather_data)
            : entry.weather_data;
        } catch (err) {
          console.error(`Failed to parse weather data for entry ID ${entry.id}`, err);
          return null;
        }

        return (
          <div key={entry.id} className="entry">
            <h3>{entry.location}</h3>
            <p>Date Range: {entry.start_date} to {entry.end_date}</p>
            <WeatherCard data={data} />
            <button onClick={() => handleDelete(entry.id)}>🗑 Delete</button>
          </div>
        );
      })}
    </div>
  );
}

export default App;
