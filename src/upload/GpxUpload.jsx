import { useCallback, useRef, useState } from 'react';
import { parseGpxDistance } from '../gpx/gpxParser.js';
import { metersToBoops } from '../boops/boops.js';
import './GpxUpload.css';

export function GpxUpload({ onResult }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setError(null);
      setIsProcessing(true);
      try {
        const text = await file.text();
        const distance = parseGpxDistance(text);
        const boopsEarned = metersToBoops(distance.meters, distance.activityType);
        onResult({ ...distance, boops: boopsEarned, fileName: file.name });
      } catch (err) {
        setError(err.message || 'Could not read that GPX file.');
      } finally {
        setIsProcessing(false);
      }
    },
    [onResult],
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);
      handleFile(event.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (event) => {
      handleFile(event.target.files?.[0]);
      event.target.value = '';
    },
    [handleFile],
  );

  return (
    <div className="gpx-upload">
      <div
        className={`gpx-dropzone${isDragOver ? ' gpx-dropzone--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
        }}
      >
        {isProcessing ? (
          <p>Reading GPX file…</p>
        ) : (
          <p>Drop a GPX file here, or click to choose one</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx,application/gpx+xml"
          onChange={handleInputChange}
          hidden
        />
      </div>
      {error && <p className="gpx-upload-error">{error}</p>}
    </div>
  );
}
