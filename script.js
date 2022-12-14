//have a console on mobile
const consoleOutput = document.getElementById("console");
const log = function (msg) {
  consoleOutput.textContent = `${consoleOutput.textContent}\n${msg}`;
  console.log(msg);
}

//Test browser support
const SUPPORTS_MEDIA_DEVICES = 'mediaDevices' in navigator;

if (SUPPORTS_MEDIA_DEVICES) {
  //Get the environment camera (usually the second one)
  navigator.mediaDevices.enumerateDevices().then(devices => {

    const cameras = devices.filter((device) => device.kind === 'videoinput');

    if (cameras.length === 0) {
      throw 'No camera found on this device.';
    }
    const camera = cameras[cameras.length - 1];
    // Create stream and get video track
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: camera.deviceId,
        facingMode: ['user', 'environment'],
      }
    }).then(stream => {
      const track = stream.getVideoTracks()[0];
      track.applyConstraints({
        advanced: [{
          torch: true
        }]
      });
      //Create image capture object and get camera capabilities
      const imageCapture = new ImageCapture(track)
      imageCapture.getPhotoCapabilities().then(capabilities => {
        //let there be light!
        console.log(capabilities);
        const btn = document.querySelector('.switch');
        const torchSupported = !!capabilities.torch || (
          'fillLightMode' in capabilities &&
          capabilities.fillLightMode.length != 0 &&
          capabilities.fillLightMode != 'none'
        );
        if (torchSupported) {
          log("torch supported");
          let torch = false;
          btn.addEventListener('click', function (e) {
            try {
              track.applyConstraints({
                advanced: [{
                  torch: (torch = !torch)
                }]
              });
              log("torch activated");
            } catch (err) {
              log(err);
            }
          });
        } else {
          log("No torch found");
        }
      }).catch(log);
    }).catch(log);
  }).catch(log);

  //The light will be on as long the track exists
}