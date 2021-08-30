const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const moment = require('moment');
const NodeGoogleDrive = require('node-google-drive');
const Excel = require('exceljs');
const cacheHandle = require('./cache');

const DbHandle = require('./../db/config');

const cache = cacheHandle.getCache();
const db = cache && cache.db ? cache.db : new DbHandle();

const ROOT_FOLDER = '1MynrRD03YXUGRVLuU0mwTwZZ8ozR7BmP';
const PATH_TO_CREDENTIALS = path.resolve(
  `${__dirname}/../../config/drive_api_config.json`
);
const PATH_TO_DOWNLOAD = path.resolve(`${__dirname}/../files`);
const FILE_PARAMS = {
  id: '13azn0-FL-kUjGr8FOdFWdQGKNHK4v-0m',
  name: '40th bday names.xlsx',
  kind: 'drive#file',
  mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

class GoogleDriveApi {
  constructor() {}

  async initialize() {
    const creds_service_user = require(PATH_TO_CREDENTIALS);
    const googleDriveInstance = new NodeGoogleDrive({
      ROOT_FOLDER,
    });

    await googleDriveInstance.useServiceAccountAuth(creds_service_user);
    this.instance = googleDriveInstance;
    return googleDriveInstance;
  }

  async hasSpreadsheetBeenUpdated() {
    if (!this.instance) return;

    const fileHandle = await this.instance.listFiles(ROOT_FOLDER, null, false);
    if (fileHandle && !lodash.isEmpty(fileHandle.files)) {
      const file = fileHandle.files[0];
      try {
        const timestamp = moment(file.modifiedTime).unix();
        this.latestTs = timestamp;

        const { updated: lastDbTimestamp } = await db.getLastUpdatedTs();
        console.log('Google Drive spreadsheet last updated at ', timestamp);
        console.log('Database data last updated at ', lastDbTimestamp);
        return timestamp !== lastDbTimestamp;
      } catch (e) {
        console.log('Error parsing file timestamp');
      }
    }
  }

  async refreshSpreadsheet() {
    const filePath = path.resolve(PATH_TO_DOWNLOAD, FILE_PARAMS.name);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }

    await this.downloadSpreadsheet();
    await this.refreshDatabase();
    await db.setTimestamp(this.latestTs);
  }

  async downloadSpreadsheet() {
    if (!this.instance) return;
    await this.instance.getFile(FILE_PARAMS, PATH_TO_DOWNLOAD);
  }

  async refreshDatabase() {
    await db.dropData();

    const wb = new Excel.Workbook();
    const filePath = path.resolve(PATH_TO_DOWNLOAD, FILE_PARAMS.name);

    await wb.xlsx.readFile(filePath).then();
    const sheet = wb.worksheets[0];
    sheet.eachRow((row) => {
      const [_, name, emailRaw] = row.values;
      const email = emailRaw ? emailRaw.text : '';
      db.insert({ name, email });
    });
  }
}

module.exports = GoogleDriveApi;
