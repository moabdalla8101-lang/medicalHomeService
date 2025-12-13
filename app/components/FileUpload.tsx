'use client';

// FileUpload component is for contract analysis features, not part of medical services app
// To use: npm install react-dropzone

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileUpload, isProcessing }: FileUploadProps) {
  return (
    <div className="w-full p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <p className="text-gray-600">File upload feature is not available in this version.</p>
      <p className="text-sm text-gray-500 mt-2">This component requires react-dropzone package.</p>
    </div>
  );
}
