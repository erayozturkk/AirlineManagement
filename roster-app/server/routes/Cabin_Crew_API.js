// POST route to add a new crew member
async function addCrewMember(req, res) {
    try {
      // Get the last ID from the database
      const { data: lastCrewMember, error: lastCrewMemberError } = await supabase
        .from('cabincrewmembers')
        .select('attendantid')
        .order('attendantid', { ascending: false })
        .limit(1);
  
      if (lastCrewMemberError) {
        throw lastCrewMemberError;
      }
  
      // Calculate the next available ID
      const nextId = lastCrewMember ? lastCrewMember[0].attendantid + 1 : 1;
      
      // Extract parameters from the request query
      const { name, age, gender, nationality, languages, attendanttype, vehiclerestriction} = req.query;
      // Create a new random crew member object the set the next available ID
      const newCrewMember = CabinCrew.generateRandom();
      newCrewMember.setAttendantid(nextId); 
      // Check and set each parameter on the newCrewMember object
      if (name !== undefined) {
        newCrewMember.setName(name);
      }
  
      if (age !== undefined) {
        newCrewMember.setAge(age);
      }
  
      if (gender !== undefined) {
        newCrewMember.setGender(gender);
      }
  
      if (nationality !== undefined) {
        newCrewMember.setNationality(nationality);
      }
  
      if (languages !== undefined) {
        // Assuming languages is an array
        newCrewMember.setLanguages(languages);
      }
  
      if (attendanttype !== undefined) {
        newCrewMember.setAttendanttype(attendanttype);
      }
  
      if (vehiclerestriction !== undefined) {
        // Assuming vehiclerestriction is an array
        newCrewMember.setVehiclerestriction(vehiclerestriction);
      }
  
      // Insert the crew member into the Supabase table
      const { data: insertedCrewMember, error: insertError } = await supabase
        .from('cabincrewmembers')
        .insert(newCrewMember);
  
      if (insertError) {
        throw insertError;
      }
  
      res.status(201).json({ message: 'Crew member added successfully', crewMember: newCrewMember });
    } catch (error) {
      console.error('Error adding crew member:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  // GET route to get a specified number of crew members sorted by attendantid
  async function getCrewMembers(req, res) {
    try {
      // Extract the limit parameter from the query string
      const { limit } = req.query;
      
      // Convert the limit parameter to a number
      const limitNumber = limit ? parseInt(limit) : 10; // Default limit is 10 if not provided
  
      // Fetch the list of crew members from Supabase with sorting by attendant id and the specified limit
      const { data, error } = await supabase
        .from('cabincrewmembers')
        .select('*')
        .order('attendantid', { ascending: true }) // Sort by attendant id in ascending order
        .limit(limitNumber);
  
      if (error) {
        throw error;
      }
  
      res.json({ message: 'Supabase connected successfully', crewMembers: data });
    } catch (error) {
      console.error('Supabase connection error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
  
  async function findCrewMembers(req, res) {
    try {
      // Extract parameters from the query string
      const { attendanttype, vehiclerestriction, limit } = req.query;
  
      // Convert the limit parameter to a number
      const limitNumber = limit ? parseInt(limit) : undefined;
  
      // Fetch crew members from Supabase
      let { data: crewMembers, error } = await supabase
        .from('cabincrewmembers')
        .select('*');
  
      // Handle any error fetching crew members
      if (error) {
        throw error;
      }
  
      // Filter crew members based on parameters
      if (attendanttype) {
        crewMembers = crewMembers.filter(member => member.attendanttype === attendanttype);
      }
      if (vehiclerestriction) {
        crewMembers = crewMembers.filter(member => member.vehiclerestriction.includes(vehiclerestriction));
      }
  
      // Limit the number of crew members returned if specified
      if (limitNumber) {
        crewMembers = crewMembers.slice(0, limitNumber);
      }
  
      // Send response with filtered crew members
      res.json(crewMembers);
    } catch (error) {
      console.error('Error processing request:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports = {
    addCrewMember,
    getCrewMembers,
    findCrewMembers
};