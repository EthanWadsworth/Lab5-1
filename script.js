// script.js

// variables for speech snythesis
var synth = window.speechSynthesis;
var voices = [];
var voiceSelector = document.getElementById('voice-selection');

// text fields 
var bottomText = document.getElementById('text-bottom');
var topText = document.getElementById('text-top');

var volumeSlider = document.querySelector('input[type="range"]'); // slider for volumen control

const resetBtn = document.querySelector('button[type="reset"]'); // clear button
const readTxtBtn = document.querySelector('button[type="button"]'); // read text button
const generateBtn = document.querySelector('button[type="submit"]'); // form submit button

// set up canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

const img = new Image(); // used to load image from <input> and draw to canvas
const fileStore = document.getElementById('image-input'); // variable reference to input file tag

// handles waiting for a file to be added to reset the canvas
fileStore.addEventListener('change', () => {
  img.src = URL.createObjectURL(fileStore.files[0]);
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // make the canvas with black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw image and then draw text
  const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
  drawText();

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

// test update on form submission
const form = document.getElementById('generate-meme');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  resetBtn.disabled = false;
  readTxtBtn.disabled = false;
  generateBtn.disabled = true;

  voiceSelector.disabled = false;

  drawText();
});

// draw text on canvas
function drawText() {
  ctx.font = "40px Impact";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(topText.value.toUpperCase(), canvas.width/2, 40);
  ctx.fillText(bottomText.value.toUpperCase(), canvas.width/2, canvas.height - 20);
}

// test reset initial status on clear button pressed
resetBtn.addEventListener('click', () => {
  resetBtn.disabled = true;
  readTxtBtn.disabled = true;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  generateBtn.disabled = false;
});

// voice synthesis
function populateVoiceDropdown() {
  voices = synth.getVoices();
  document.querySelector('option[value="none"]').textContent = "Default";

  for(var i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelector.appendChild(option);
  }
}

// filling voice-selection dropdown
populateVoiceDropdown();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceDropdown;
}

// speech synthesis read meme

// change volume icon on change to slider value
volumeSlider.addEventListener('change', () => {
  let volumeIcon = document.querySelector('img');

  if (volumeSlider.value >= 67) {
    volumeIcon.src = 'icons/volume-level-3.svg';
  }
  else if (volumeSlider.value >= 34) {
    volumeIcon.src = 'icons/volume-level-2.svg';
  }
  else if (volumeSlider.value >= 1) {
    volumeIcon.src = 'icons/volume-level-1.svg';
  }
  else {
    volumeIcon.src = 'icons/volume-level-0.svg';
  }
});

// start reading text on read text clicked
readTxtBtn.addEventListener('click', () => {
  let speechInput = topText.value + ' ' + bottomText.value;
  let utterThis = new SpeechSynthesisUtterance(speechInput);
  let selectedOption = voiceSelector.selectedOptions[0].getAttribute('data-name');

  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }

  utterThis.volume = Number(volumeSlider.value)/100;
  synth.speak(utterThis);
});