/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { recordCameraAttempt } from "@/lib/progress";

type Subject = "Maths" | "Biology" | "Chemistry";

interface MarkingResult {
  extracted_answer?: string;
  score: number;
  totalMarks?: number;
  percentage?: number;
  grade?: string;
  feedback: string;
  correct_answer?: string;
  model_answer?: string;
  what_went_wrong?: string[];
  criteriaMatched?: string[];
  criteriaMissed?: string[];
  improvements?: string[];
}

type Stage = "setup" | "camera" | "preview" | "loading" | "result";

interface CameraMarkerProps {
  initialSubject?: string;
  initialContext?: string;
}

export default function CameraMarker({ initialSubject = "", initialContext = "" }: CameraMarkerProps) {
  const validSubjects: Subject[] = ["Maths", "Biology", "Chemistry"];
  const matchedSubject = validSubjects.find((s) => s === initialSubject) || "";
  const [stage, setStage] = useState<Stage>(matchedSubject && initialContext ? "camera" : "setup");
  const [subject, setSubject] = useState<Subject | "">(matchedSubject);
  const [questionContext, setQuestionContext] = useState(initialContext);
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
    if (streamRef.current) { streamRef.current.getTracks().forEach((track) => track.stop()); streamRef.current = null; }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access live camera. Use the \"Take Photo\" button above instead.");
    }
  }, []);

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);
  useEffect(() => { if (stage === "camera" && showLiveCamera) startCamera(); else stopCamera(); }, [stage, showLiveCamera, startCamera, stopCamera]);
  useEffect(() => { if (stage !== "camera") setShowLiveCamera(false); }, [stage]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/png"));
    stopCamera();
    setStage("preview");
  }, [stopCamera]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setCapturedImage(reader.result as string); stopCamera(); setStage("preview"); };
    reader.readAsDataURL(file);
  }, [stopCamera]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null); setError(null); setResult(null); setStage("camera");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleMark = useCallback(async () => {
    if (!capturedImage || !subject) return;
    setStage("loading"); setError(null);
    try {
      const res = await fetch("/api/mark", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage, subject, questionContext }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data: MarkingResult = await res.json();
      setResult(data); setStage("result");
      if (subject) {
        recordCameraAttempt({
          subject: subject as Subject, questionContext, score: data.score, totalMarks: data.totalMarks || 0,
          extractedAnswer: data.extracted_answer || "", feedback: data.feedback, improvements: data.improvements || [], timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.error("Marking error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while marking. Please try again.");
      setStage("preview");
    }
  }, [capturedImage, subject, questionContext]);

  const handleStartOver = useCallback(() => {
    setCapturedImage(null); setResult(null); setError(null); setSubject(""); setQuestionContext(""); setStage("setup");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Stage: Setup */}
      {stage === "setup" && (
        <div className="fade-in bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 md:p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Mark Your Answer</h2>
            <p className="text-[13px] text-zinc-500 mt-1">Select a subject and optionally describe the question, then take a photo of your handwritten answer.</p>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-zinc-900">Subject <span className="text-red-500">*</span></label>
            <div className="flex gap-2.5">
              {(["Maths", "Biology", "Chemistry"] as Subject[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`flex-1 rounded-xl min-h-[48px] text-sm font-medium transition-all active:scale-[0.98] border ${
                    subject === s ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-medium text-zinc-900">Question Context <span className="text-zinc-400">(optional)</span></label>
            <textarea
              value={questionContext}
              onChange={(e) => setQuestionContext(e.target.value)}
              placeholder="e.g. Solve the quadratic equation 2x^2 + 3x - 5 = 0"
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 resize-none"
            />
          </div>

          <button
            onClick={() => setStage("camera")}
            disabled={!subject}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-sm min-h-[48px] w-full transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue to Camera
          </button>
        </div>
      )}

      {/* Stage: Camera */}
      {stage === "camera" && (
        <div className="fade-in bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-4">
          <button onClick={() => { stopCamera(); setStage("setup"); }} className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors active:scale-[0.98]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
            Back
          </button>
          <p className="text-[11px] text-zinc-400">{subject}{questionContext && ` \u2014 ${questionContext}`}</p>

          {/* Take Photo */}
          <label className="block w-full cursor-pointer">
            <div className="flex flex-col items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl min-h-[56px] py-5 px-4 text-center transition-all active:scale-[0.98]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <span className="text-base font-semibold text-white">Take Photo</span>
              <span className="text-[12px] text-zinc-400">Opens your phone camera</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-3"><div className="flex-1 h-px border-t border-zinc-200" /><span className="text-[11px] text-zinc-400">or</span><div className="flex-1 h-px border-t border-zinc-200" /></div>

          <label className="block w-full cursor-pointer">
            <div className="bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 hover:bg-zinc-50 min-h-[48px] transition-all active:scale-[0.98] flex items-center justify-center font-medium">Upload from Gallery</div>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {!showLiveCamera && (
            <>
              <div className="flex items-center gap-3"><div className="flex-1 h-px border-t border-zinc-200" /><span className="text-[11px] text-zinc-400">or</span><div className="flex-1 h-px border-t border-zinc-200" /></div>
              <button onClick={() => setShowLiveCamera(true)} className="bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 hover:bg-zinc-50 min-h-[48px] transition-all active:scale-[0.98] w-full font-medium">Use Live Camera Preview</button>
            </>
          )}

          {showLiveCamera && (
            <div className="space-y-3">
              <div className="flex items-center gap-3"><div className="flex-1 h-px border-t border-zinc-200" /><span className="text-[11px] text-zinc-400">live camera</span><div className="flex-1 h-px border-t border-zinc-200" /></div>
              <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-[3/4] md:aspect-[4/3] border border-zinc-200">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-blue-500 rounded-tl-md" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-blue-500 rounded-tr-md" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-blue-500 rounded-bl-md" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-blue-500 rounded-br-md" />
                </div>
                {!cameraActive && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button onClick={handleCapture} disabled={!cameraActive} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-sm min-h-[48px] w-full transition-all active:scale-[0.98] disabled:opacity-30">Capture from Live View</button>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-[13px]">{error}</div>}
        </div>
      )}

      {/* Stage: Preview */}
      {stage === "preview" && capturedImage && (
        <div className="fade-in bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Review Photo</h2>
            <p className="text-[11px] text-zinc-400 mt-1">{subject}{questionContext && ` \u2014 ${questionContext}`}</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-200"><img src={capturedImage} alt="Captured answer" className="w-full object-contain max-h-[50vh] md:max-h-[60vh]" /></div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-[13px]">{error}</div>}
          <div className="flex gap-3">
            <button onClick={handleRetake} className="flex-1 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-700 hover:bg-zinc-50 min-h-[48px] transition-all active:scale-[0.98] font-medium">Retake</button>
            <button onClick={handleMark} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-sm min-h-[48px] transition-all active:scale-[0.98]">Mark</button>
          </div>
        </div>
      )}

      {/* Stage: Loading */}
      {stage === "loading" && (
        <div className="fade-in bg-white border border-zinc-200 shadow-sm rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium text-center">Marking your answer...</p>
          <p className="text-zinc-400 text-[13px] text-center">This may take a few seconds</p>
        </div>
      )}

      {/* Stage: Result */}
      {stage === "result" && result && (
        <div className="fade-in bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-5">
          <div className="flex items-center justify-center gap-6 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-zinc-900">{result.score}{result.totalMarks != null && <span className="text-lg text-zinc-500 font-normal">/{result.totalMarks}</span>}</p>
              <p className="text-[13px] text-zinc-400 mt-1">Score</p>
            </div>
            {result.grade && (
              <div className="text-center">
                <p className={`text-3xl font-bold ${result.grade === "A*" || result.grade === "A" ? "text-emerald-600" : result.grade === "B" ? "text-blue-600" : result.grade === "C" ? "text-amber-600" : "text-red-600"}`}>{result.grade}</p>
                <p className="text-[13px] text-zinc-400 mt-1">{result.percentage != null ? `${result.percentage}%` : "Grade"}</p>
              </div>
            )}
          </div>

          {result.extracted_answer && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-zinc-500">Extracted Answer</h3>
              <div className="bg-zinc-50 rounded-xl p-3.5 text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap max-h-[30vh] overflow-y-auto">{result.extracted_answer}</div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-[13px] font-medium text-zinc-500">Feedback</h3>
            <div className="bg-zinc-50 rounded-xl p-3.5 text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-y-auto">{result.feedback}</div>
          </div>

          {result.what_went_wrong && result.what_went_wrong.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-red-700">What Went Wrong</h3>
              <ul className="space-y-1.5">{result.what_went_wrong.map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[13px] text-red-700"><span className="mt-0.5 shrink-0">&#10007;</span><span>{item}</span></li>
              ))}</ul>
            </div>
          )}

          {result.correct_answer && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-blue-700">Correct Answer</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-[13px] text-blue-800 leading-relaxed whitespace-pre-wrap max-h-[30vh] overflow-y-auto">{result.correct_answer}</div>
            </div>
          )}

          {result.model_answer && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-zinc-700">Model Answer</h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-[13px] text-zinc-800 leading-relaxed whitespace-pre-wrap max-h-[30vh] overflow-y-auto">{result.model_answer}</div>
            </div>
          )}

          {result.criteriaMatched && result.criteriaMatched.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-emerald-700">Criteria Matched</h3>
              <ul className="space-y-1.5">{result.criteriaMatched.map((c, i) => (
                <li key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[13px] text-emerald-700"><span className="mt-0.5 shrink-0">&#10003;</span><span>{c}</span></li>
              ))}</ul>
            </div>
          )}

          {result.criteriaMissed && result.criteriaMissed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-red-700">Criteria Missed</h3>
              <ul className="space-y-1.5">{result.criteriaMissed.map((c, i) => (
                <li key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[13px] text-red-700"><span className="mt-0.5 shrink-0">&#10007;</span><span>{c}</span></li>
              ))}</ul>
            </div>
          )}

          {result.improvements && result.improvements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium text-amber-700">Improvements</h3>
              <ul className="space-y-1.5">{result.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[13px] text-amber-800"><span className="mt-0.5 shrink-0">&bull;</span><span>{imp}</span></li>
              ))}</ul>
            </div>
          )}

          {capturedImage && (
            <details className="group">
              <summary className="text-[13px] text-zinc-400 cursor-pointer hover:text-zinc-700 transition-colors min-h-[48px] flex items-center">View submitted photo</summary>
              <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200"><img src={capturedImage} alt="Submitted answer" className="w-full object-contain max-h-[40vh]" /></div>
            </details>
          )}

          <button onClick={handleStartOver} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-sm min-h-[48px] w-full transition-all active:scale-[0.98]">Mark Another</button>

          {/* Study links — help her learn from mistakes */}
          {subject && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Keep studying</p>
              <div className="flex gap-2">
                <Link
                  href={`/flashcards?subject=${encodeURIComponent(subject)}`}
                  className="flex-1 text-center py-2.5 bg-zinc-100 text-zinc-700 text-[13px] font-medium rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  {subject} Flashcards
                </Link>
                <Link
                  href={`/mcqs?subject=${encodeURIComponent(subject)}`}
                  className="flex-1 text-center py-2.5 bg-zinc-100 text-zinc-700 text-[13px] font-medium rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  {subject} MCQs
                </Link>
              </div>
              <Link
                href={`/questions?subject=${encodeURIComponent(subject)}`}
                className="block text-center py-2.5 bg-zinc-50 text-zinc-500 text-[13px] font-medium rounded-xl hover:bg-zinc-100 active:scale-95 transition-all"
              >
                More {subject} Written Questions
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
