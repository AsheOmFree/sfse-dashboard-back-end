const express = require('express');
const NodeGoogleDrive = require('node-google-drive');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { db } = require('./../db/config');

const router = express.Router();

router.route('/').get(async (req, res) => {
  console.log('/get_doc request...');

  const ROOT_FOLDER = '1MynrRD03YXUGRVLuU0mwTwZZ8ozR7BmP';
  const PATH_TO_CREDENTIALS = path.resolve(
    `${__dirname}/../../config/drive_api_config.json`
  );
  const PATH_TO_DOWNLOAD = path.resolve(`${__dirname}/../files`);

  const creds_service_user = require(PATH_TO_CREDENTIALS);
  const googleDriveInstance = new NodeGoogleDrive({
    ROOT_FOLDER,
  });

  let gdrive = await googleDriveInstance.useServiceAccountAuth(
    creds_service_user
  );

  let responseFile = await googleDriveInstance.getFile(
    {
      id: '13azn0-FL-kUjGr8FOdFWdQGKNHK4v-0m',
      name: '40th bday names.xlsx',
      kind: 'drive#file',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    PATH_TO_DOWNLOAD
  );

  res.send('get doc');
});

module.exports = router;
