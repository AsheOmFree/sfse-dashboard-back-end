const sqlite3 = require('sqlite3').verbose();
const isEmpty = require('lodash/isEmpty');

class DB {
  constructor() {
    this.db = new sqlite3.Database('./spreadsheet.db', (err) => {
      if (err) {
        return console.error('Error creating database: ', err.message);
      }

      this.createTablesIfNeeded();
      console.log('Connected to the in-memory SQlite database.');
    });
  }

  getDbInstance = () => {
    return this.db;
  };

  getLastUpdatedTs = async () => {
    console.log('getLastUpdatedTs');
    return new Promise((resolve, reject) => {
      this.db.all('SELECT updated FROM lastUpdated', (err, row) => {
        if (!err && row) {
          const timestamp = isEmpty(row) ? 0 : row[0];
          resolve(timestamp);
        } else if (err) {
          reject(err);
        }
      });
    });
  };

  createTablesIfNeeded = () => {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS myTable (name text, email text)`);
      this.db.run(`CREATE TABLE IF NOT EXISTS lastUpdated (updated integer)`);
    });
  };

  getData = async (filters = {}) => {
    const sql = 'SELECT rowId, name, email FROM myTable';

    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, res) => {
        if (!err) {
          console.log('RESULTS: ', res);
          resolve(res);
        } else {
          reject(err);
        }
      });
    });
  };

  insert = (record = {}) => {
    if (isEmpty(record)) return;

    const { name, email } = record;
    const sql = `INSERT INTO myTable (name, email) VALUES ($name, $email)`;
    this.db.run(
      sql,
      {
        $name: name,
        $email: email,
      },
      (err, res) => {}
    );
  };

  setTimestamp = async (ts) => {
    console.log('In setTimestamp...');
    const sql = 'INSERT INTO lastUpdated (updated) VALUES ($updated)';
    const params = { $updated: ts };
    this.db.run(sql, params, (err, res) => {
      if (err) {
        console.log('Error updating spreadsheet timestamp in database: ', err);
      } else {
        return true;
      }
    });
  };

  dropData = async () => {
    console.log('In dropData...');
    await this.db.serialize(() => {
      const dropMyTable = 'DELETE FROM myTable';
      const dropLastUpdated = 'DELETE FROM lastUpdated';

      this.db.run(dropMyTable, (err, res) => {
        if (!err) {
          console.log(`Dropped myTable`);
        }
      });

      this.db.run(dropLastUpdated, (err, res) => {
        if (!err) {
          console.log(`Dropped lastUpdated`);
        }
      });
    });
  };

  close = () => {
    if (!this.db) return;

    // close the database connection
    this.db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Close the database connection.');
    });
  };
}

module.exports = DB;
