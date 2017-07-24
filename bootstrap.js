let fs = require('fs');
let fse = require('fs-extra');
let path = require('path');
let request = require('request');

const PWASSEMBLE_TEMPLATES_FOLDER = 'https://api.github.com/repos/pwassemble/pwassemble/contents/client/templates';

const bootstrap = {
  init() {
    // Create and/or empty the ./public/uploads directory
    fse.emptyDir(path.join(__dirname, 'public', 'uploads'))
    .catch((err) => {
      console.warn(err);
    });

    // Dynamically create the templates Pug file
    request.get({
      json: true,
      url: PWASSEMBLE_TEMPLATES_FOLDER,
      headers: {
        'user-agent': 'https://github.com/tomayac/',
      },
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) {
        res.status(response.statusCode || 500);
        res.render('error',
            {error: err || Error(`Status code ${response.statusCode}`)});
      }
      const templatePug = body.map((template) => {
        return `option(value='${template.name}') ${template.name
            .replace(/-/g, ' ').replace(/\w\S*/g, (txt) => {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })}`;
      }).join('\n');
      fs.writeFile(path.join(__dirname, 'views', 'templates.pug'),
          templatePug, (err) => {
        if (err) {
          throw err;
        }
      });
    });
  },
};

module.exports = bootstrap;
