import mysql from 'mysql2/promise';
// PLEASE CHANGE THE DB CONFIG(ACCORDING TO YOUR MONGODB CONFIG) AS I HAVE NOT YET TAKEN CLOUD MEMBERSHIP.
const pool = mysql.createPool({
    host: 'localhost',
    port: 3307,
    user: "root",
    password: "astadambole",
    database: "studySyncDb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
console.log('MySQL connection pool created successfully.');
export { pool };