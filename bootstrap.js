let fs = require('fs');
let path = require('path');
let express = require('express');
let router = new express.Router();
let request = require('request');

const PWASSEMBLE_TEMPLATES_FOLDER = 'https://api.github.com/repos/pwassemble/pwassemble/contents/client/templates';

const bootstrap = {
  init() {
    request.get({
      json: true,
      url: PWASSEMBLE_TEMPLATES_FOLDER,
      headers: {
        'user-agent': 'https://github.com/tomayac/'
      }
    }, function(err, response, body) {
      if (err || response.statusCode !== 200) {
        res.status(response.statusCode || 500);
        res.render('error');
      }
      const templatePug = body.map(template => {
        return `option(value='${template.name}') ${template.name
            .replace(/\w\S*/g, (txt) => {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })}`;
      }).join('\n');
      fs.writeFile(path.join(__dirname, 'views', 'templates.pug'),
          templatePug, (err) => {
        if (err) {
          throw err;
        }
        console.log('Templates updated.');
      });
    });
  }
};

module.exports = bootstrap;
