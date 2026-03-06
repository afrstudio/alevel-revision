import CameraMarker from "@/components/CameraMarker";

export default function CameraPage() {
  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold mb-1">Camera Mark</h1>
      <p className="text-gray-400 text-sm mb-4">
        Photo your handwritten answer to get it marked by AI.
      </p>
      <CameraMarker />
    </div>
  );
}
