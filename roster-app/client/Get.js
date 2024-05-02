const supabaseToken = '4T32guRGGHHxYe2vJ2Oto0SB39fOzKmFOaM7s6GwZDmIwkCAB/+SbhEA3zgFlMGBt/vAX53b6keukYj+OykN3w=='; // Replace with your actual Supabase JWT token

fetch('https://hsixajfgpamanbqvxyyw.supabase.co/rest/v1/aircrafts', {
  headers: {
    Authorization: `Bearer ${supabaseToken}`
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  console.log(data);
})
.catch(error => {
  console.error('There was a problem with the fetch operation:', error);
});
