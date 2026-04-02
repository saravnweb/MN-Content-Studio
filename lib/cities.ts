/**
 * Master list of Indian cities for creator profiling and grouping.
 * Sorted alphabetically.
 */

export const CITIES = [
  'Ahmedabad',
  'Amritsar',
  'Bangalore',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Delhi',
  'Dehradun',
  'Gurugram',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Jodhpur',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Ludhiana',
  'Madurai',
  'Mumbai',
  'Mysore',
  'Nagpur',
  'Nashik',
  'Noida',
  'Patna',
  'Pune',
  'Raipur',
  'Rajkot',
  'Ranchi',
  'Surat',
  'Thiruvananthapuram',
  'Tiruchirappalli',
  'Vadodara',
  'Varanasi',
  'Vijayawada',
  'Visakhapatnam',
].sort()

export const CITY_OPTIONS = CITIES.map(city => ({
  label: city,
  value: city.toLowerCase()
}))
