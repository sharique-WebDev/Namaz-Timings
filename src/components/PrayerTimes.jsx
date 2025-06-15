import React, { useEffect, useState } from 'react';

export default function PrayerTimes({ timings, methodName, schoolName }) {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Only show these main prayers
  const filteredTimings = Object.entries(timings).filter(([name]) =>
    ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name)
  );

  // Convert "HH:mm" to a Date object today
  function timeStringToDate(timeStr) {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return null;

    const [hours, minutes] = timeStr.split(':');
    const now = new Date();
    now.setHours(parseInt(hours, 10));
    now.setMinutes(parseInt(minutes, 10));
    now.setSeconds(0);
    return now;
  }

  function updateNextPrayer() {
    const now = new Date();
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (let prayer of prayerOrder) {
      const prayerTime = timeStringToDate(timings[prayer]);
      if (!prayerTime) continue;

      if (prayerTime > now) {
        setNextPrayer({ name: prayer, time: prayerTime });
        return;
      }
    }

    // If all have passed, next prayer is tomorrow's Fajr
    const fajrTime = timeStringToDate(timings['Fajr']);
    if (fajrTime) {
      const tomorrow = new Date(fajrTime.getTime() + 24 * 60 * 60 * 1000);
      setNextPrayer({ name: 'Fajr', time: tomorrow });
    }
  }

  function updateTimeLeft() {
    if (!nextPrayer) return;
    const now = new Date();
    const diffMs = nextPrayer.time - now;

    if (diffMs <= 0) {
      setTimeLeft("Now");
      return;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  }

  useEffect(() => {
    updateNextPrayer();
    const interval = setInterval(() => {
      updateNextPrayer();
    }, 60000); // update next prayer every 1 minute
    return () => clearInterval(interval);
  }, [timings]);

  useEffect(() => {
    const timer = setInterval(updateTimeLeft, 1000); // update remaining time every second
    return () => clearInterval(timer);
  }, [nextPrayer]);

  return (
    <div className="card shadow p-3">
      <h4 className="card-title mb-3">Today's Namaz Timings</h4>
      <ul className="list-group list-group-flush">
        {filteredTimings.map(([name, time]) => (
          <li key={name} className="list-group-item d-flex justify-content-between">
            <strong>{name}</strong>
            <span>{time}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 p-3 bg-light rounded">
        <h5>⏭ Next Prayer: <strong>{nextPrayer?.name || '...'}</strong></h5>
        <p className='m-0'>⏲ Time remaining: <strong>{timeLeft || '...'}</strong></p>
      </div>

      <p className="text-muted mt-3">
        Calculation method: {methodName}<br />
        Asr method: {schoolName}
      </p>
    </div>
  );
}
