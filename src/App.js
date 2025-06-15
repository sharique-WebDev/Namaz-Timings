import React, { useEffect, useState } from 'react';
import PrayerTimes from './components/PrayerTimes';
import { getPrayerTimesByCity } from './utils/api';
import axios from 'axios';

function App() {
  const [timings, setTimings] = useState({});
  const [methodName, setMethodName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [manualMode, setManualMode] = useState(false);

  // Reverse geocode coordinates to city + country
  const fetchCityFromCoords = async (lat, lon) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const address = response.data.address;
    return {
      city: address.city || address.town || address.village,
      country: address.country,
    };
  };

  // Load timings using city + country
  const loadTimings = async (c, cn) => {
    try {
      setLoading(true);
      const data = await getPrayerTimesByCity(c, cn);
      setTimings(data.timings);
      setMethodName(data.meta.method.name);
      setSchoolName(data.meta.school);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching timings:", err);
      setLoading(false);
    }
  };

  // On mount: check localStorage or use default
  useEffect(() => {
    const savedCity = localStorage.getItem("savedCity");
    const savedCountry = localStorage.getItem("savedCountry");

    if (savedCity && savedCountry) {
      setCity(savedCity);
      setCountry(savedCountry);
      setManualMode(true);
      loadTimings(savedCity, savedCountry);
    }
  }, []);

  const handleUseLocation = () => {
    setManualMode(false);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { city, country } = await fetchCityFromCoords(latitude, longitude);
        setCity(city);
        setCountry(country);
        localStorage.setItem("savedCity", city);
        localStorage.setItem("savedCountry", country);
        loadTimings(city, country);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to get location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city && country) {
      setManualMode(true);
      localStorage.setItem("savedCity", city);
      localStorage.setItem("savedCountry", country);
      loadTimings(city, country);
    }
  };

  const handleClearLocation = () => {
    localStorage.removeItem("savedCity");
    localStorage.removeItem("savedCountry");
    setCity('');
    setCountry('');
    setTimings({});
  };

  return (
  <div className="d-flex flex-column min-vh-100">
    <div className="container my-5 flex-grow-1">
      <h2 className="text-center mb-4">🕌 Namaz Timings</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2 justify-content-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary">Get Timings</button>
          </div>
        </div>

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-success me-2 mb-2"
            onClick={handleUseLocation}
          >
            Use My Location
          </button>
          <button
            type="button"
            className="btn btn-outline-danger mb-2"
            onClick={handleClearLocation}
          >
            Clear Saved Location
          </button>
        </div>

        <p className="text-center mt-2 text-muted small">
          {manualMode
            ? 'Showing manually selected location'
            : 'Showing auto-detected location'}
        </p>
      </form>

      {loading ? (
        <p className="text-center">Fetching timings...</p>
      ) : (
        <PrayerTimes
          timings={timings}
          methodName={methodName}
          schoolName={schoolName}
        />
      )}
    </div>

    {/* Sticky Footer */}
    <footer className="bg-light text-center py-3 border-top text-muted small">
      © 2025 Namaz Timings. Made with <span style={{ color: 'red' }}>❤️</span> by Sharique
    </footer>
  </div>
);

}

export default App;