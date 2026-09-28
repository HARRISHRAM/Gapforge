import Button from "./Button";
import Card from "./Card";

const FACE_LABEL = {
  waiting: "Calibrating camera…",
  present: "Face detected",
  missing: "No face / camera covered",
  crowded: "More than one person detected",
};

export default function AssessmentProctorGate({
  careerName,
  videoRef,
  cameraReady,
  cameraError,
  fullscreenOn,
  faceStatus,
  onEnableCamera,
  onEnterFullscreen,
  onStart,
}) {
  const ready = cameraReady && fullscreenOn;

  return (
    <Card className="text-center p-8 border-teal-200 max-w-xl mx-auto">
      <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-3xl mb-4">
        🛡️
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
        Proctored session
      </span>
      <h2 className="font-display font-black text-2xl text-ink-950 mt-3 mb-2">
        Integrity checks required
      </h2>
      <p className="text-sm text-ink-600 leading-relaxed mb-6">
        Before starting the <strong>{careerName}</strong> benchmark, enable your camera and enter fullscreen.
        Tab switches, pastes, and face presence are scored with on-device checks.
      </p>

      <div className="relative mx-auto mb-5 w-full max-w-sm overflow-hidden rounded-xl border border-line bg-ink-950 aspect-video">
        <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover scale-x-[-1]" />
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
            Camera preview
          </div>
        )}
      </div>

      <ul className="text-left text-xs space-y-2 mb-6">
        <li className={`flex justify-between rounded-lg border px-3 py-2 ${cameraReady ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <span>Camera</span>
          <span className="font-bold">{cameraReady ? `On · ${FACE_LABEL[faceStatus]}` : cameraError || "Not enabled"}</span>
        </li>
        <li className={`flex justify-between rounded-lg border px-3 py-2 ${fullscreenOn ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <span>Fullscreen</span>
          <span className="font-bold">{fullscreenOn ? "Active" : "Required"}</span>
        </li>
        <li className="flex justify-between rounded-lg border border-line bg-paper px-3 py-2">
          <span>ML / integrity signals</span>
          <span className="font-bold text-ink-700">Gaze proxy · keystroke · paste · BKT</span>
        </li>
      </ul>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button variant="outline" onClick={onEnableCamera}>
          {cameraReady ? "Restart camera" : "Enable camera"}
        </Button>
        <Button variant="outline" onClick={onEnterFullscreen}>
          Enter fullscreen
        </Button>
        <Button variant="accent" disabled={!ready} onClick={onStart}>
          Start assessment
        </Button>
      </div>
    </Card>
  );
}

export function ProctorOverlay({ videoRef, faceStatus, fullscreenOn, warning }) {
  return (
    <>
      {warning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-center py-3 px-4 font-bold text-sm shadow-lg">
          {warning}
        </div>
      )}
      <div className="fixed bottom-4 right-4 z-40 w-36 rounded-xl overflow-hidden border-2 border-white shadow-xl bg-ink-950">
        <video ref={videoRef} muted playsInline autoPlay className="w-full aspect-video object-cover scale-x-[-1]" />
        <div className={`text-[10px] font-bold px-2 py-1 text-center ${
          faceStatus === "present" && fullscreenOn ? "bg-emerald-600 text-white" : "bg-amber-500 text-ink-950"
        }`}>
          {fullscreenOn ? FACE_LABEL[faceStatus] : "Exit fullscreen"}
        </div>
      </div>
    </>
  );
}
