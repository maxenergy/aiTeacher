import { io } from "socket.io-client";
import * as mediapipe from "@mediapipe/face_detection";
import * as drawingUtils from "@mediapipe/drawing_utils";

const videoElement = document.getElementById('video') as HTMLVideoElement;
const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const socket = io();

const faceDetection = new mediapipe.faceDetection.FaceDetection({
  locateFile: (file: string) => {
    return `https://google.github.io/mediapipe/solutions/${file}`;
  },
  minDetectionConfidence: 0.5
});

faceDetection.onResults((results: any) => {
  const mouthOpenHeight = results.multiFaceLandmarks[0]?.mouthUpperInner?.y - results.multiFaceLandmarks[0]?.mouthLowerInner?.y;
  const isSpeaking = mouthOpenHeight > 0.05 ? true : false;
  socket.emit('isSpeaking', isSpeaking);
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  const canvasCtx = canvasElement.getContext('2d');
  drawingUtils.drawConnectors(canvasCtx, results.multiFaceLandmarks, mediapipe.faceDetection.FACEMESH_CONTOURS,
                              {color: '#00FF00', lineWidth: 1});
  drawingUtils.drawLandmarks(canvasCtx, results.multiFaceLandmarks, {color: '#FF0000', lineWidth: 0.2});
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  })
  .then((stream) => {
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play().then(() => resolve(stream));
      };
    });
  })
  .then((stream) => {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceDetection.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });
    camera.start();
  })
  .catch((error) => {
    console.error('navigator.getUserMedia error:', error);
  });
