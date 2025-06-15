import axios from "axios";

export const getPrayerTimesByCity = async ( city, country ) =>{
    const METHOD_ID = 1; // UNIVERSITY OF ISLAMIC SCIENCES KARACHI
    const SCHOOL = 1; // ASR CALCULATION METHOD

    const url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${METHOD_ID}&school=${SCHOOL}`;

    const response = await axios.get(url)
    return response.data.data;
};