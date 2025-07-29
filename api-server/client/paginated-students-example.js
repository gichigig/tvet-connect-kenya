// paginated-students-example.js
// Example: Fetch all students in pages using TVETApiClient

const TVETApiClient = require('./tvet-api-client');

const client = new TVETApiClient('http://localhost:3001', 'YOUR_API_KEY_HERE'); // Replace with your API key

async function fetchAllStudents(batchSize = 100) {
  let allStudents = [];
  let pageToken = undefined;
  let page = 1;

  while (true) {
    const filters = { limit: batchSize };
    if (pageToken) filters.pageToken = pageToken;
    const res = await client.getStudents(filters);
    allStudents = allStudents.concat(res.students);
    console.log(`Fetched page ${page}:`, res.students.length, 'students');
    if (!res.nextPageToken || res.students.length === 0) break;
    pageToken = res.nextPageToken;
    page++;
  }

  console.log('Total students fetched:', allStudents.length);
  return allStudents;
}

// Example usage:
fetchAllStudents(500).then(students => {
  // Do something with all students
  // console.log(students);
}).catch(console.error);
