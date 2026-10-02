import { useRef, useState, type ChangeEvent } from 'react';
import { Button, Input, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadsApi } from '@/api/uploads';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import styles from './ImageUploader.module.scss';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(
  /\/api\/?$/,
  '',
);

export const ImageUploader = ({ value, onChange, placeholder }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await uploadsApi.uploadImage(file);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

      onChange?.(fullUrl);
      void message.success('Изображение загружено');
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить файл'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.preview}>
        {value ? (
          <img src={value} alt="preview" />
        ) : (
          <span className={styles.empty}>🖼️</span>
        )}
      </div>

      <div className={styles.input}>
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder ?? 'https://... или загрузите файл'}
        />
        <div className={styles.hint}>Вставьте URL или загрузите файл</div>
      </div>

      <Button
        icon={<UploadOutlined />}
        onClick={handlePick}
        loading={uploading}
      >
        Загрузить
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e)}
      />
    </div>
  );
};