let googleCloudStorage = require('@google-cloud/storage');
let uuid = require('uuid-js');
let stream;
let request = require('request');
const path = require('path');
const env = require('node-env-file');
env(path.join(__dirname, '..', '.env'), {raise: false});
let storage = googleCloudStorage({
  projectId: process.env.project_id,
  credentials: {
    type: 'service_account',
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, '\n'),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/209826415520-compute%40developer.gserviceaccount.com',
  },
});
let options = {
  entity: 'allUsers',
  role: googleCloudStorage.acl.READER_ROLE,
};

// Returns the public, anonymously accessable URL to a given Cloud Storage
// object.
// The object's ACL has to be set to public read.
// [START public_url]
let getPublicUrl = function(bucketName, filename) {
  return 'https://storage.googleapis.com/' + bucketName + '/' + filename;
};
// [END public_url]

// Express middleware that will automatically pass uploads to Cloud Storage.
// req.file is processed and will have two new properties:
// * ``cloudStorageObject`` the object name in cloud storage.
// * ``cloudStoragePublicUrl`` the public url to the object.
// [START process]
let sendUploadToGCS = function(reqFile, key, bucket, resultObj) {
  return new Promise(function(resolve, reject) {
    let gcsname = reqFile.originalname;
    let file = bucket.file(gcsname);

    stream = file.createWriteStream({
      metadata: {
        contentType: reqFile.mimetype,
      },
    });

    stream.on('error', function(err) {
      reqFile.cloudStorageError = err;
      return reject(err);
    });

    stream.on('finish', function() {
      reqFile.cloudStorageObject = gcsname;
      reqFile.cloudStoragePublicUrl = getPublicUrl(bucket.metadata.id, gcsname);
      if (key) {
        resultObj[key + 'Url'] = reqFile.cloudStoragePublicUrl;
      }
      return resolve(reqFile.cloudStoragePublicUrl);
    });

    stream.end(reqFile.buffer);
  });
};

let uploadFile = function(req) {
  let resultObj;
  let bucket;
  console.log(JSON.stringify(req.body, null, 2));
  let bucketName = req.body.bucketName;
  return new Promise(function(resolve, reject) {
    findStorageBucket(req.body)
      .then(function(storeBucket) {
        bucket = storeBucket;
        getConfigJson(bucketName).then(function(obj) {
          resultObj = obj;
          // update old configObj with new texts & colors
          let propKeys = Object.keys(req.body);
          propKeys.forEach(function(key) {
            resultObj[key] = req.body[key];
          });
          // update files
          let filesKeys = Object.keys(req.files);
          let promises = [];
          filesKeys.forEach(function(key) {
            promises.push(
              sendUploadToGCS(req.files[key][0], key, bucket, resultObj)
            );
          });
          Promise.all(promises)
            .then(function() {
              writeResultFile(bucket, resultObj);
            })
            .catch(function(err) {
              return reject(err);
            });
        });
        return resolve(JSON.stringify(bucket, null, 2));
      })
      .catch(function(err) {
        return reject(err);
      });
  });
};

let getConfigJson = function(bucketId) {
  return new Promise(function(resolve, reject) {
    request(
      'https://storage.googleapis.com/' + bucketId + '/configuration.json',
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let configObj = JSON.parse(body);
          return resolve(configObj);
        }
        return resolve({});
      }
    );
  });
};

let writeResultFile = function(bucket, resultObj) {
  let file = bucket.file('configuration.json');
  stream = file.createWriteStream({
    metadata: {
      contentType: 'text/plain',
    },
  });
  stream.end(JSON.stringify(resultObj));
};

let findStorageBucket = function(obj) {
  return new Promise(function(resolve, reject) {
    if (obj.bucketName) {
      bucket = storage.bucket(obj.bucketName);
      if (bucket) {
        // bucket found
        return resolve(bucket);
      }
    } else {
      // bucket not found or name is empty
      // need to create a new one with proper acl
      let name =
        obj.companyName.toLowerCase().replace(/\s/g, '-') + uuid.create();
      storage
        .createBucket(name)
        .then(function(data) {
          bucket = data[0];
          bucket.acl.default
            .add(options)
            .then(function() {
              return resolve(bucket);
            })
            .catch(function(err) {
              return reject(err);
            });
        })
        .catch(function(err) {
          return reject(err);
        });
    }
  });
};

// [END process]

// Multer handles parsing multipart/form-data requests.
// This instance is configured to store images in memory.
// This makes it straightforward to upload to Cloud Storage.
// [START multer]
let multerParser = require('multer');
let multer = multerParser({
  storage: multerParser.MemoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 10mb
  },
});
// [END multer]

module.exports = {
  getPublicUrl: getPublicUrl,
  sendUploadToGCS: sendUploadToGCS,
  multer: multer,
  uploadFile: uploadFile,
  getConfigJson: getConfigJson,
};
