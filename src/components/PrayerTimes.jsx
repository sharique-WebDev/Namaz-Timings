import React, { useEffect, useState } from 'react';

// Convert "HH:mm" to a 12-hour formatted string
function formatTime12Hr(timeStr) {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hour, 10));
  date.setMinutes(parseInt(minute, 10));
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Convert "HH:mm" to a Date object today
function timeStringToDate(timeStr) {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(':');
  const now = new Date();
  now.setHours(parseInt(hours, 10));
  now.setMinutes(parseInt(minutes, 10));
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

export default function PrayerTimes({ timings, methodName, schoolName }) {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Only main prayers
  const filteredTimings = Object.entries(timings).filter(([name]) =>
    ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name)
  );

  function updateNextPrayer() {
    const now = new Date();
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (let prayer of prayerOrder) {
      const prayerTime = timeStringToDate(timings[prayer]);
      if (prayerTime && prayerTime > now) {
        setNextPrayer({ name: prayer, time: prayerTime });
        return;
      }
    }

    // All prayers passed — set next prayer as tomorrow's Fajr
    const fajrTime = timeStringToDate(timings['Fajr']);
    if (fajrTime) {
      const tomorrowFajr = new Date(fajrTime.getTime() + 24 * 60 * 60 * 1000);
      setNextPrayer({ name: 'Fajr', time: tomorrowFajr });
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
    const interval = setInterval(updateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [timings]);

  useEffect(() => {
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer]);

  return (
    <div className="card shadow p-3">
      <h5 className="card-title mb-3 text-center">Today's Namaz Timings</h5>

      <ul className="list-group list-group-flush">
        {filteredTimings.map(([name, time]) => (
          <li key={name} className="list-group-item d-flex justify-content-between">
            <strong>{name}</strong>
            <span>{formatTime12Hr(time)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 p-3 bg-warning-subtle rounded">
        <p className="m-1">⇛ <strong>Next Prayer:</strong> {nextPrayer?.name || '...'}</p>
        <p className="m-1">⏲ <strong>Time remaining:</strong> {timeLeft || '...'}</p>
      </div>

      <p className="text-muted mt-3 mb-0 text-center small">
        Calculation method: {methodName} | Asr method: {schoolName}
      </p>
    </div>
  );
}
