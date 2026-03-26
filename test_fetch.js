fetch('http://127.0.0.1:5000/api/student/calendar-events/1')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
