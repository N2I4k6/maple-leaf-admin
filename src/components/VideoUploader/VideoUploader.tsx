import { useRef, useState, type ChangeEvent } from 'react';
import { Button, Input, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadsApi } from '@/api/uploads';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import styles from './VideoUploader.module.scss';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(
  /\/api\/?$/,
  '',
);

const MAX_MB = 500;

export const VideoUploader = ({ value, onChange, placeholder }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_MB * 1024 * 1024) {
      void message.error(`Файл больше ${MAX_MB} МБ`);
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadsApi.uploadVideo(file);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

      onChange?.(fullUrl);
      void message.success('Видео загружено');
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить видео'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? 'https://...mp4 или загрузите файл'}
        />
        <Button
          icon={<UploadOutlined />}
          onClick={handlePick}
          loading={uploading}
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </Button>
      </div>

      {value && !uploading && (
        <div className={styles.preview}>
          <video
            src={value}
            controls
            preload="metadata"
            className={styles.video}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        hidden
        onChange={(e) => void handleFile(e)}
      />
    </div>
  );
};