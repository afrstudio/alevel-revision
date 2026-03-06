/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Subject = "Maths" | "Biology" | "Chemistry";

interface MarkingResult {
  score: number;
  totalMarks?: number;
  feedback: string;
  criteriaMatched?: string[];
  criteriaMissed?: string[];
}

type Stage = "setup" | "camera" | "preview" | "loading" | "result";

export default function CameraMarker() {
  const [stage, setStage] = useState<Stage>("setup");
  const [subject, setSubject] = useState<Subject | "">("");
  const [questionContext, setQuestionContext] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<MarkingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError(
        "Could not access live camera. Use the \"Take Photo\" button above instead."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Only start live camera when user explicitly opts in
  useEffect(() => {
    if (stage === "camera" && showLiveCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [stage, showLiveCamera, startCamera, stopCamera]);

  // Reset live camera toggle when leaving camera stage
  useEffect(() => {
    if (stage !== "camera") {
      setShowLiveCamera(false);
    }
  }, [stage]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);
    stopCamera();
    setStage("preview");
  }, [stopCamera]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
        setStage("preview");
      };
      reader.readAsDataURL(file);
    },
    [stopCamera]
  );

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    setResult(null);
    setStage("camera");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleMark = useCallback(async () => {
    if (!capturedImage || !subject) return;

    setStage("loading");
    setError(null);

    try {
      const res = await fetch("/api/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          subject,
          questionContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: MarkingResult = await res.json();
      setResult(data);
      setStage("result");
    } catch (err) {
      console.error("Marking error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while marking. Please try again."
      );
      setStage("preview");
    }
  }, [capturedImage, subject, questionContext]);

  const handleStartOver = useCallback(() => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setSubject("");
    setQuestionContext("");
    setStage("setup");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Stage: Setup - Subject + Question Context */}
      {stage === "setup" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-5 md:space-y-6">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            Mark Your Answer
          </h2>
          <p className="text-gray-400 text-sm">
            Select a subject and optionally describe the question, then take a
            photo of your handwritten answer.
          </p>

          {/* Subject Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Subject <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["Maths", "Biology", "Chemistry"] as Subject[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`min-h-[48px] py-3 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                    subject === s
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Question Context */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Question Context{" "}
              <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={questionContext}
              onChange={(e) => setQuestionContext(e.target.value)}
              placeholder="e.g. Solve the quadratic equation 2x^2 + 3x - 5 = 0"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={() => setStage("camera")}
            disabled={!subject}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            Continue to Camera
          </button>
        </div>
      )}

      {/* Stage: Camera / Upload */}
      {stage === "camera" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Capture Your Answer
            </h2>
            <button
              onClick={() => {
                stopCamera();
                setStage("setup");
              }}
              className="min-h-[48px] px-3 text-sm text-gray-400 hover:text-white transition-colors active:scale-[0.98]"
            >
              Back
            </button>
          </div>

          <p className="text-gray-400 text-xs">
            {subject}
            {questionContext && ` \u2014 ${questionContext}`}
          </p>

          {/* PRIMARY: Take Photo button (triggers phone camera via capture="environment") */}
          <div className="space-y-2">
            <label className="block w-full cursor-pointer">
              <div className="flex flex-col items-center justify-center gap-3 min-h-[120px] py-6 px-4 rounded-2xl font-medium text-center transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                  />
                </svg>
                <span className="text-lg font-semibold">Take Photo</span>
                <span className="text-sm text-blue-100 opacity-80">
                  Opens your phone camera
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload from gallery */}
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          </div>

          <label className="block w-full min-h-[48px] py-3 px-4 rounded-xl font-medium text-center cursor-pointer transition-all active:scale-[0.98] bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 border-dashed">
            Upload from Gallery
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* SECONDARY: Live camera option */}
          {!showLiveCamera && (
            <>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              </div>

              <button
                onClick={() => setShowLiveCamera(true)}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl font-medium text-center transition-all active:scale-[0.98] bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 text-sm"
              >
                Use Live Camera Preview
              </button>
            </>
          )}

          {/* Live Camera (shown only when user opts in) */}
          {showLiveCamera && (
            <div className="space-y-3">
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500">live camera</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] md:aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Frame overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-blue-400 rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-blue-400 rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-blue-400 rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-blue-400 rounded-br-md" />
                </div>
                {!cameraActive && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Capture from Live View
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Stage: Preview */}
      {stage === "preview" && capturedImage && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Review Photo</h2>

          <p className="text-gray-400 text-xs">
            {subject}
            {questionContext && ` \u2014 ${questionContext}`}
          </p>

          <div className="rounded-xl overflow-hidden border border-gray-800">
            <img
              src={capturedImage}
              alt="Captured answer"
              className="w-full object-contain max-h-[50vh] md:max-h-[60vh]"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            >
              Retake
            </button>
            <button
              onClick={handleMark}
              className="flex-1 min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500"
            >
              Mark Answer
            </button>
          </div>
        </div>
      )}

      {/* Stage: Loading */}
      {stage === "loading" && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 font-medium text-center">
            Marking your answer...
          </p>
          <p className="text-gray-500 text-sm text-center">
            This may take a few seconds
          </p>
        </div>
      )}

      {/* Stage: Result */}
      {stage === "result" && result && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-5 md:space-y-6">
          <h2 className="text-lg font-semibold text-white">Marking Result</h2>

          {/* Score */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-800 rounded-2xl px-8 py-6 text-center">
              <p className="text-4xl font-bold text-white">
                {result.score}
                {result.totalMarks != null && (
                  <span className="text-lg text-gray-400">
                    /{result.totalMarks}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-400 mt-1">Score</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Feedback</h3>
            <div className="bg-gray-800 rounded-xl p-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {result.feedback}
            </div>
          </div>

          {/* Criteria Matched */}
          {result.criteriaMatched && result.criteriaMatched.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-green-400">
                Criteria Matched
              </h3>
              <ul className="space-y-1">
                {result.criteriaMatched.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-300 bg-green-900/20 border border-green-900/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-green-400 mt-0.5 shrink-0">
                      &#10003;
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Criteria Missed */}
          {result.criteriaMissed && result.criteriaMissed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-400">
                Criteria Missed
              </h3>
              <ul className="space-y-1">
                {result.criteriaMissed.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-300 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-red-400 mt-0.5 shrink-0">
                      &#10007;
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Captured Image Thumbnail */}
          {capturedImage && (
            <details className="group">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-300 transition-colors min-h-[48px] flex items-center">
                View submitted photo
              </summary>
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-800">
                <img
                  src={capturedImage}
                  alt="Submitted answer"
                  className="w-full object-contain max-h-[40vh]"
                />
              </div>
            </details>
          )}

          <button
            onClick={handleStartOver}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-500"
          >
            Mark Another Answer
          </button>
        </div>
      )}
    </div>
  );
}
