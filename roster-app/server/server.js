const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();

// Initialize Supabase client
const supabaseUrl = 'https://hsixajfgpamanbqvxyyw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaXhhamZncGFtYW5icXZ4eXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTA0Mjk1NiwiZXhwIjoyMDI2NjE4OTU2fQ.NVg9rnK4MAZA8x-iom4sigQXbDqb-nKJh9e8SwZPw0A';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define a route handler for the /test-supabase endpoint
app.get('/test-supabase', async (req, res) => {
  try {
    // Test connection by fetching aircraft data
    const { data, error } = await supabase
      .from('aircrafts')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }
    res.json({ message: 'Supabase connected successfully', aircraftData: data });
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
