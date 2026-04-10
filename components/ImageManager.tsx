'use client';

import { useState, useCallback } from 'react';
import styles from './ImageManager.module.css';

interface ImageManagerProps {
  folder?: string;
  onImageSelect?: (url: string) => void;
}

interface ImageFile {
  id: string;
  filename: string;
  url: string;
  folder: string;
  uploaded_at: string;
}

export default function ImageManager({ folder = 'general', onImageSelect }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [library, setLibrary] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      await uploadFile(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onImageSelect?.(result.url);
      loadLibrary(); // Refresh library
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const loadLibrary = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have an API to fetch the library
      // For now, we'll simulate it
      setLibrary([]);
    } catch (error) {
      console.error('Load library error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.dropZone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="file-upload"
        />
        <label htmlFor="file-upload" className={styles.uploadLabel}>
          {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
        </label>
      </div>

      <div className={styles.library}>
        <h3>Image Library ({folder})</h3>
        <button onClick={loadLibrary} className={styles.refreshButton}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <div className={styles.grid}>
          {library.map((image) => (
            <div key={image.id} className={styles.imageItem}>
              <img src={image.url} alt={image.filename} onClick={() => onImageSelect?.(image.url)} />
              <p>{image.filename}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}