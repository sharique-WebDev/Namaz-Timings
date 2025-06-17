// src/components/CityForm.js
import React from "react";

export default function CityForm({ city, country, setCity, setCountry, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (city && country) {
      onSubmit(city, country);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row g-2 justify-content-center">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Enter country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary">Get Timings</button>
        </div>
      </div>
    </form>
  );
}
