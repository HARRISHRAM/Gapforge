import { useCallback, useEffect, useRef, useState } from "react";
import { unpack_cascade, run_cascade, cluster_detections, instantiate_detection_memory } from "../utils/pico";

function meanStd(values) {
  if (!values.length) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

let cascadeClassifier = null;
let cascadePromise = null;

async function getCascade() {
  if (cascadeClassifier) return cascadeClassifier;
  if (!cascadePromise) {
    cascadePromise = fetch("/facefinder")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.arrayBuffer();
      })
      .then((buf) => {
        cascadeClassifier = unpack_cascade(new Int8Array(buf));
        return cascadeClassifier;
      })
      .catch((err) => {
        console.warn("Facefinder cascade load failed:", err);
        return null;
      });
  }
  return cascadePromise;
}

function rgbaToGrayscale(rgba, nrows, ncols) {
  const gray = new Uint8Array(nrows * ncols);
  for (let r = 0; r < nrows; ++r) {
    for (let c = 0; c < ncols; ++c) {
      const idx = (r * ncols + c) * 4;
      gray[r * ncols + c] = (299 * rgba[idx] + 587 * rgba[idx + 1] + 114 * rgba[idx + 2]) / 1000;
    }
  }
  return gray;
}

/**
 * Accurately analyzes the video frame for human face presence using:
 *  1. Native browser FaceDetector (Shape Detection API) if available
 *  2. Machine-learning Pico Haar-like cascade detector (trained on face patterns)
 *
 * Returns detected face count:
 *  -1 = still calibrating/loading model
 *   0 = no face detected / camera covered
 *   1 = single face detected
 *  >=2 = crowded (multiple persons)
 */
async function detectFaceCount(ctx, video, width = 240, height = 180, updateMemory = null) {
  // 1. Try native browser FaceDetector API if available
  if (typeof window.FaceDetector === "function") {
    try {
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
      const detected = await detector.detect(video);
      return detected.length;
    } catch {
      // Fall through to Pico cascade
    }
  }

  // 2. High-precision Pico cascade classifier
  const classifier = await getCascade();
  if (!classifier) {
    return -1; // Still loading model
  }

  ctx.drawImage(video, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const gray = rgbaToGrayscale(imgData.data, height, width);

  const image = {
    pixels: gray,
    nrows: height,
    ncols: width,
    ldim: width,
  };

  const params = {
    shiftfactor: 0.1,  // scan step
    minsize: 26,       // detects face far or close
    maxsize: 200,      // maximum face scale
    scalefactor: 1.15, // multi-scale pyramid
  };

  let dets = run_cascade(image, classifier, params);
  if (updateMemory) {
    dets = updateMemory(dets);
  }
  const clusters = cluster_detections(dets, 0.2);

  // Confidence threshold: 2.0+ is a confirmed face
  const confirmed = clusters.filter((c) => c[3] >= 2.0);
  return confirmed.length;
}

export default function useAssessmentProctor({ active }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const keyIntervalsRef = useRef([]);
  const lastKeyAtRef = useRef(null);
  const pasteCountRef = useRef(0);
  const faceMissRef = useRef(0);
  const faceHitRef = useRef(0);
  const extraPersonRef = useRef(0);
  const fullscreenExitRef = useRef(0);
  const tabSwitchRef = useRef(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [fullscreenOn, setFullscreenOn] = useState(false);
  const [proctorWarning, setProctorWarning] = useState("");
  const [faceStatus, setFaceStatus] = useState("waiting"); // waiting | present | missing | crowded
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const showWarning = useCallback((message) => {
    setProctorWarning(message);
    window.setTimeout(() => setProctorWarning(""), 4000);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
      return true;
    } catch (err) {
      setCameraReady(false);
      setCameraError(err?.message || "Camera permission denied");
      return false;
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setFullscreenOn(true);
      return true;
    } catch {
      setFullscreenOn(Boolean(document.fullscreenElement));
      return Boolean(document.fullscreenElement);
    }
  }, []);

  const startSession = useCallback(async () => {
    const camOk = cameraReady || (await startCamera());
    const fsOk = await enterFullscreen();
    if (camOk && fsOk) {
      setSessionStarted(true);
      return true;
    }
    if (!camOk) showWarning("Camera must stay on for this assessment.");
    if (!fsOk) showWarning("Fullscreen is required. Allow fullscreen and try again.");
    return false;
  }, [cameraReady, startCamera, enterFullscreen, showWarning]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const getMetrics = useCallback(() => {
    const keyStats = meanStd(keyIntervalsRef.current.slice(-40));
    const humanLike = keyStats.std > 40 && keyStats.mean > 80 && keyStats.mean < 900;
    const keystrokeConfidence = Math.max(
      20,
      Math.min(100, Math.round((humanLike ? 92 : 55) - pasteCountRef.current * 8))
    );
    const totalFace = faceHitRef.current + faceMissRef.current;
    const presence = totalFace > 0 ? faceHitRef.current / totalFace : 1;
    const attentionScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(presence * 100 - tabSwitchRef.current * 8 - fullscreenExitRef.current * 10 - extraPersonRef.current * 6)
      )
    );
    const originalityScore = Math.max(10, Math.min(100, 100 - pasteCountRef.current * 18));
    const bktMastery = Math.max(0.05, Math.min(0.99, 0.35 + presence * 0.4 - tabSwitchRef.current * 0.04));

    return {
      attentionScore,
      keystrokeConfidence,
      nlpScore: null,
      bktMastery: Number(bktMastery.toFixed(3)),
      originalityScore,
      tabSwitches: tabSwitchRef.current,
      fullscreenExits: fullscreenExitRef.current,
      pasteCount: pasteCountRef.current,
      extraPersonFlags: extraPersonRef.current,
    };
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const onFs = () => {
      const on = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setFullscreenOn(on);
      if (!on && sessionStarted) {
        fullscreenExitRef.current += 1;
        showWarning("Fullscreen exited. Return to fullscreen to continue.");
      }
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") {
        tabSwitchRef.current += 1;
        setTabSwitchCount(tabSwitchRef.current);
        showWarning("Tab switch detected. Stay on this page.");
      }
    };

    const onBlur = () => {
      if (!sessionStarted) return;
      tabSwitchRef.current += 1;
      setTabSwitchCount(tabSwitchRef.current);
      showWarning("Window lost focus. This is logged.");
    };

    const onKey = () => {
      const now = Date.now();
      if (lastKeyAtRef.current) {
        keyIntervalsRef.current.push(now - lastKeyAtRef.current);
        if (keyIntervalsRef.current.length > 80) keyIntervalsRef.current.shift();
      }
      lastKeyAtRef.current = now;
    };

    const onPaste = () => {
      pasteCountRef.current += 1;
      showWarning("Paste detected. Originality score reduced.");
    };

    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
  }, [active, sessionStarted, showWarning]);

  const updateMemoryRef = useRef(null);
  if (!updateMemoryRef.current) {
    updateMemoryRef.current = instantiate_detection_memory(3);
  }

  useEffect(() => {
    if (!active || !cameraReady) return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    let cancelled = false;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const sample = async () => {
      if (cancelled || video.readyState < 2) return;
      const count = await detectFaceCount(ctx, video, 240, 180, updateMemoryRef.current);
      if (cancelled || count < 0) return;

      if (count >= 2) {
        extraPersonRef.current += 1;
        faceHitRef.current += 1;
        setFaceStatus("crowded");
      } else if (count === 1) {
        faceHitRef.current += 1;
        setFaceStatus("present");
      } else {
        faceMissRef.current += 1;
        setFaceStatus("missing");
      }
    };

    const id = window.setInterval(sample, 800);
    sample();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [active, cameraReady]);

  useEffect(() => {
    const node = videoRef.current;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, [sessionStarted, cameraReady]);

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    cameraReady,
    cameraError,
    fullscreenOn,
    proctorWarning,
    faceStatus,
    tabSwitchCount,
    sessionStarted,
    startCamera,
    enterFullscreen,
    startSession,
    stop,
    getMetrics,
  };
}
