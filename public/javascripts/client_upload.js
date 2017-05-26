
let config = {
  apiKey: 'AIzaSyAYNL_pXtUz8xa5Qkw9YA1PlrXQSeeDkz4',
  authDomain: 'node-test-36a42.firebaseapp.com',
  databaseURL: 'https://node-test-36a42.firebaseio.com',
  storageBucket: 'node-test-36a42.appspot.com',
  messagingSenderId: '13908002465',
};
firebase.initializeApp(config);

let uploadFile = function(el) {
  let imageContainer = document.getElementById('imageContainer');
  let img = document.createElement('img');
  let tStart = performance.now();
  let file = el.files[0];
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      img.src = xhr.responseText;
      imageContainer.innerHTML = '';
      imageContainer.appendChild(img);
      img.onload = function() {
        let rect = img.getBoundingClientRect();
        img.width = 500;
        generateColorPicker('primaryFgColor', 'Primary foreground Color', img);
        generateColorPicker('primaryBgColor', 'Primary background Color', img);
        generateColorPicker('secondaryFgColor', 'Secondary foreground Color', img);
        generateColorPicker('secondaryBgColor', 'Secondary background Color', img);
      };
    }
  };
  let formData = new FormData();
  formData.append('theFile', file);
  xhr.open('POST', 'http://localhost:4000');
  xhr.send(formData);
};

let toggleUploadImageField = function(el) {
  let fileWrapper = document.getElementById('fileForPicker');
  if (el.checked) {
    fileWrapper.style.display = 'block';
  } else {
    fileWrapper.style.display = 'none';
  }
};

let toggleCustomColorPicker = function(el, id) {
  let nativePicker = document.getElementById(id + 'Input');
  let picker = document.getElementById(id);
  let img = document.getElementById('imageContainer').children[0];
  if (el.checked) {
    picker.style.display = 'block';
    nativePicker.style.display = 'none';
    tinycolorpicker(picker);
    let c = picker.children[1].children[0];
    let ctx = c.getContext('2d');
    ctx.drawImage(img, 10, 10);
  } else {
    picker.style.display = 'none';
    nativePicker.style.display = 'block';
  }
};
var generateColorPicker = function(id, labelText, image) {
  let container = document.createElement('div');
  container.id = id + 'Picker';
  container.className = 'colorPicker';
  let color = document.createElement('a');
  color.className = 'color';
  let colorInner = document.createElement('div');
  colorInner.className = 'colorInner';
  color.appendChild(colorInner);
  let track = document.createElement('div');
  track.className = 'track';
  let input = document.createElement('input');
  input.type = 'hidden';
  input.name = id;
  input.className = 'colorInput';
  let label = document.createElement('label');
  label.className = 'picker-label';
  label.innerHTML = labelText;
  container.appendChild(label);
  container.appendChild(color);
  container.appendChild(track);
  container.appendChild(input);
  let place = document.getElementById(id + 'Wrapper');
  place.innerHTML = '';
  place.appendChild(container);
  // init color picker
  let picker = tinycolorpicker(container);

  // put the image to canvas
  let c = container.children[2].children[0];
  let ctx = c.getContext('2d');
  ctx.canvas.width = image.width;
  ctx.canvas.height = image.height;
  ctx.drawImage(image, 0, 0, 500, image.height);
};

let generateNativeColorPicker = function(id) {
  let input = document.createElement('input');
  input.type = 'color';
  input.name = 'id';
  let place = document.getElementById(id + 'Wrapper');
  place.innerHTML = '';
  place.appendChild(input);
};

let showFileName = function(target) {
  target.parentElement.parentElement.childNodes[0].value = target.files[0].name;
};

