/* Pico.js face detection library - ES Module version */

export function unpack_cascade(bytes) {
  const dview = new DataView(new ArrayBuffer(4));
  let p = 8;

  dview.setUint8(0, bytes[p + 0]);
  dview.setUint8(1, bytes[p + 1]);
  dview.setUint8(2, bytes[p + 2]);
  dview.setUint8(3, bytes[p + 3]);
  const tdepth = dview.getInt32(0, true);
  p += 4;

  dview.setUint8(0, bytes[p + 0]);
  dview.setUint8(1, bytes[p + 1]);
  dview.setUint8(2, bytes[p + 2]);
  dview.setUint8(3, bytes[p + 3]);
  const ntrees = dview.getInt32(0, true);
  p += 4;

  const tcodes = [];
  const tpreds = [];
  const thresh = [];

  for (let t = 0; t < ntrees; ++t) {
    tcodes.push(0, 0, 0, 0);
    const codeLen = 4 * Math.pow(2, tdepth) - 4;
    for (let k = 0; k < codeLen; k++) {
      tcodes.push(bytes[p + k]);
    }
    p += codeLen;

    for (let i = 0; i < Math.pow(2, tdepth); ++i) {
      dview.setUint8(0, bytes[p + 0]);
      dview.setUint8(1, bytes[p + 1]);
      dview.setUint8(2, bytes[p + 2]);
      dview.setUint8(3, bytes[p + 3]);
      tpreds.push(dview.getFloat32(0, true));
      p += 4;
    }

    dview.setUint8(0, bytes[p + 0]);
    dview.setUint8(1, bytes[p + 1]);
    dview.setUint8(2, bytes[p + 2]);
    dview.setUint8(3, bytes[p + 3]);
    thresh.push(dview.getFloat32(0, true));
    p += 4;
  }

  const tcodesArr = new Int8Array(tcodes);
  const tpredsArr = new Float32Array(tpreds);
  const threshArr = new Float32Array(thresh);

  return function classify_region(r, c, s, pixels, ldim) {
    r = 256 * r;
    c = 256 * c;
    let root = 0;
    let o = 0.0;
    const pow2tdepth = Math.pow(2, tdepth) >> 0;

    for (let i = 0; i < ntrees; ++i) {
      let idx = 1;
      for (let j = 0; j < tdepth; ++j) {
        idx =
          2 * idx +
          (pixels[
            ((r + tcodesArr[root + 4 * idx + 0] * s) >> 8) * ldim +
              ((c + tcodesArr[root + 4 * idx + 1] * s) >> 8)
          ] <=
            pixels[
              ((r + tcodesArr[root + 4 * idx + 2] * s) >> 8) * ldim +
                ((c + tcodesArr[root + 4 * idx + 3] * s) >> 8)
            ]);
      }

      o += tpredsArr[pow2tdepth * i + idx - pow2tdepth];

      if (o <= threshArr[i]) return -1;

      root += 4 * pow2tdepth;
    }
    return o - threshArr[ntrees - 1];
  };
}

export function run_cascade(image, classify_region, params) {
  const { pixels, nrows, ncols, ldim } = image;
  const { shiftfactor, minsize, maxsize, scalefactor } = params;

  let scale = minsize;
  const detections = [];

  while (scale <= maxsize) {
    const step = Math.max(shiftfactor * scale, 1) >> 0;
    const offset = (scale / 2 + 1) >> 0;

    for (let r = offset; r <= nrows - offset; r += step) {
      for (let c = offset; c <= ncols - offset; c += step) {
        const q = classify_region(r, c, scale, pixels, ldim);
        if (q > 0.0) {
          detections.push([r, c, scale, q]);
        }
      }
    }

    scale *= scalefactor;
  }

  return detections;
}

export function cluster_detections(dets, iouthreshold) {
  dets.sort((a, b) => b[3] - a[3]);

  function calculate_iou(det1, det2) {
    const [r1, c1, s1] = det1;
    const [r2, c2, s2] = det2;
    const overr = Math.max(0, Math.min(r1 + s1 / 2, r2 + s2 / 2) - Math.max(r1 - s1 / 2, r2 - s2 / 2));
    const overc = Math.max(0, Math.min(c1 + s1 / 2, c2 + s2 / 2) - Math.max(c1 - s1 / 2, c2 - s2 / 2));
    return (overr * overc) / (s1 * s1 + s2 * s2 - overr * overc);
  }

  const assignments = new Array(dets.length).fill(0);
  const clusters = [];

  for (let i = 0; i < dets.length; ++i) {
    if (assignments[i] === 0) {
      let r = 0.0;
      let c = 0.0;
      let s = 0.0;
      let q = 0.0;
      let n = 0;

      for (let j = i; j < dets.length; ++j) {
        if (calculate_iou(dets[i], dets[j]) > iouthreshold) {
          assignments[j] = 1;
          r += dets[j][0];
          c += dets[j][1];
          s += dets[j][2];
          q += dets[j][3];
          n += 1;
        }
      }
      clusters.push([r / n, c / n, s / n, q]);
    }
  }

  return clusters;
}

export function instantiate_detection_memory(size) {
  let n = 0;
  const memory = Array.from({ length: size }, () => []);

  return function update_memory(dets) {
    memory[n] = dets;
    n = (n + 1) % memory.length;
    let combined = [];
    for (let i = 0; i < memory.length; ++i) {
      combined = combined.concat(memory[i]);
    }
    return combined;
  };
}
