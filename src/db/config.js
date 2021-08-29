const sqlite3 = require('sqlite3').verbose();

// open database in memory
const db = new sqlite3.Database('./spreadsheet.db', async (err) => {
  if (err) {
    return console.error(err.message);
  }

  console.log('Checking for data...');
  try {
    // db.each(`SELECT rowId, name, email FROM myTable`, async (error, row) => {
    await db.each(`SELECT * FROM myTable`, async (error, row) => {
      console.log('here');
      console.log('Row from callback: ', row);
      console.log('Error from callback: ', error);

      if (error || row === null) {
        await create();
        console.log('db: ', db);
      } else if (row) {
        console.log('Row: ', row);
        // insertSample();
      }
    });
  } catch (e) {
    console.log('Error pulling from table: ', db);
  }
  console.log('Connected to the in-memory SQlite database.');
});

const create = async () => {
  await db.serialize(() => {
    db.run(`CREATE TABLE myTable (name text, email text)`);
  });
};

const insertSample = async (record = null) => {
  await db.serialize(() => {
    db.run(
      `INSERT INTO myTable (name, email) values ('brandon', 'b@email.com')`
    );
  });
};

const insert = async (record) => {};

const close = () => {
  if (!db) return;

  // close the database connection
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });
};

module.exports = {
  db,
  close,
  testInsert: insert,
};
