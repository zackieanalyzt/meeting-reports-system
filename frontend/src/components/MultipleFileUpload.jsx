import React, { useState, useRef } from 'react';

const MultipleFileUpload = ({ 
  maxFiles = 5, 
  maxSizePerFile = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.docx', '.xlsx', '.md'],
  onFilesChange,
  label = "อัพโหลดไฟล์"
}) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxSizePerFile) {
      errors.push(`${file.name}: ไฟล์ใหญ่เกิน ${maxSizePerFile / 1024 / 1024}MB`);
    }
    
    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExt)) {
      errors.push(`${file.name}: ประเภทไฟล์ไม่รองรับ`);
    }
    
    return errors;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validationErrors = [];
    const validFiles = [];

    // Check max files
    if (files.length + fileArray.length > maxFiles) {
      validationErrors.push(`สามารถอัพโหลดได้สูงสุด ${maxFiles} ไฟล์`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        validationErrors.push(...fileErrors);
      } else {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          progress: 0
        });
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      if (onFilesChange) {
        onFilesChange(updatedFiles.map(f => f.file));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    if (onFilesChange) {
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
        return '🖼️';
      case 'docx':
        return '📝';
      case 'xlsx':
        return '📊';
      case 'md':
        return '📋';
      default:
        return '📎';
    }
  };

  return (
    <div className="multiple-file-upload">
      {/* Upload Area */}
      <div
        className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="upload-text">
          <span className="upload-highlight">คลิกเพื่ออัพโหลด</span> หรือลากไฟล์มาวางที่นี่
        </p>
        
        <p className="upload-info">
          รองรับ: PDF, JPG, DOCX, XLSX, MD (สูงสุด {maxFiles} ไฟล์, {maxSizePerFile / 1024 / 1024}MB/ไฟล์)
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="upload-errors">
          {errors.map((error, index) => (
            <div key={index} className="upload-error">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <span>ไฟล์ที่เลือก ({files.length}/{maxFiles})</span>
          </div>
          
          {files.map((fileItem) => (
            <div key={fileItem.id} className="file-item">
              <div className="file-icon">{getFileIcon(fileItem.name)}</div>
              
              <div className="file-info">
                <div className="file-name">{fileItem.name}</div>
                <div className="file-size">{formatFileSize(fileItem.size)}</div>
              </div>
              
              <button
                type="button"
                className="file-remove"
                onClick={() => removeFile(fileItem.id)}
                aria-label="ลบไฟล์"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleFileUpload;
