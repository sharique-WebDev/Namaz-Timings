import React, { useState } from "react";

export default function CityForm({onSubmit}) {
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')

    const handleSubmit = (e) =>{
        e.preventDefault()
        if(city && country) onSubmit(city, country)
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-2">
                <div className="col-md-5">
                    <input type="text" className="form-control" placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="col-md-5">
                    <input type="text" className="form-control" placeholder="Enter country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary">Get timings</button>
                </div>
            </div>
        </form>
    )
}
