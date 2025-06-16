import React, { useEffect, useState } from 'react';
import PrayerTimes from './components/PrayerTimes';
import CityForm from './components/CityForm';
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

  // Reverse geocode to get city and country
  const fetchCityFromCoords = async (lat, lon) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const address = response.data.address;
    return {
      city: address.city || address.town || address.village || '',
      country: address.country || '',
    };
  };

  // Load timings by city & country
  const loadTimings = async (c, cn) => {
    try {
      setLoading(true);
      const data = await getPrayerTimesByCity(c, cn);
      setTimings(data.timings);
      setMethodName(data.meta.method.name);
      setSchoolName(data.meta.school);
    } catch (err) {
      console.error("Error fetching timings:", err);
      alert("Could not load timings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // On mount: load from localStorage
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
        const location = await fetchCityFromCoords(latitude, longitude);
        if (location.city && location.country) {
          setCity(location.city);
          setCountry(location.country);
          localStorage.setItem("savedCity", location.city);
          localStorage.setItem("savedCountry", location.country);
          loadTimings(location.city, location.country);
        } else {
          alert("Location not found. Please enter manually.");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to get location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  const handleCitySubmit = (submittedCity, submittedCountry) => {
    setCity(submittedCity);
    setCountry(submittedCountry);
    setManualMode(true);
    localStorage.setItem("savedCity", submittedCity);
    localStorage.setItem("savedCountry", submittedCountry);
    loadTimings(submittedCity, submittedCountry);
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

        <CityForm
          city={city}
          country={country}
          setCity={setCity}
          setCountry={setCountry}
          onSubmit={handleCitySubmit}
        />

        <div className="text-center mt-2">
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
          {manualMode ? 'Showing manually selected location' : 'Showing auto-detected location'}
        </p>

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

      <footer className="bg-light text-center py-3 border-top text-muted small">
        © 2025 Namaz Timings. Made with <span style={{ color: 'red' }}>❤️</span> by Sharique
      </footer>
    </div>
  );
}

export default App;
