import { useCallback, useEffect, useState } from 'react';
import { Button, Select, Table, Tag, message, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { episodesApi, type EpisodeFormData } from '@/api/episodes';
import { cartoonsApi } from '@/api/cartoons';
import { seasonsApi } from '@/api/seasons';
import { voiceoversApi } from '@/api/voiceovers';
import { confirmDelete } from '@/components/ConfirmDelete/ConfirmDelete';
import { getApiErrorMessage, getApiErrorStatus } from '@/shared/lib/api-error';
import type { Cartoon, Season, Episode, Voiceover } from '@/types';
import { EpisodeFormModal } from './EpisodeFormModal';
import styles from './Episodes.module.scss';

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const Episodes = () => {
  const [cartoons, setCartoons] = useState<Cartoon[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [voiceovers, setVoiceovers] = useState<Voiceover[]>([]);

  const [selectedCartoon, setSelectedCartoon] = useState<string>();
  const [selectedSeason, setSelectedSeason] = useState<string>();

  const [items, setItems] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Episode | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      cartoonsApi.getAll({ limit: 100 }),
      voiceoversApi.getAll(),
    ])
      .then(([c, v]) => {
        if (cancelled) return;
        setCartoons(c.items);
        setVoiceovers(v);
        if (c.items[0]) setSelectedCartoon(c.items[0].id);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          void message.error(getApiErrorMessage(error, 'Не удалось загрузить данные'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedCartoon) return;

    let cancelled = false;

    void seasonsApi
      .getByCartoon(selectedCartoon)
      .then((s) => {
        if (cancelled) return;
        setSeasons(s);
        setSelectedSeason(s[0]?.id);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          void message.error(getApiErrorMessage(error, 'Не удалось загрузить сезоны'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCartoon]);

  const load = useCallback(async () => {
    if (!selectedSeason) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await episodesApi.getBySeason(selectedSeason));
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Не удалось загрузить серии'));
    } finally {
      setLoading(false);
    }
  }, [selectedSeason]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (ep: Episode) => {
    setEditing(ep);
    setModalOpen(true);
  };

  const handleSubmit = async (values: EpisodeFormData) => {
    setSaving(true);
    try {
      if (editing) {
        await episodesApi.update(editing.id, values);
        void message.success('Серия обновлена');
      } else {
        await episodesApi.create(values);
        void message.success('Серия создана');
      }
      setModalOpen(false);
      void load();
    } catch (error) {
      const status = getApiErrorStatus(error);
      const text = getApiErrorMessage(error, 'Не удалось сохранить');

      if (status === 409) {
        void message.error(text || 'Серия с таким номером уже существует');
      } else {
        void message.error(text);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (ep: Episode) => {
    confirmDelete({
      title: `Удалить «${ep.title}»?`,
      onConfirm: async () => {
        try {
          await episodesApi.remove(ep.id);
          void message.success('Серия удалена');
          void load();
        } catch (error) {
          void message.error(getApiErrorMessage(error, 'Не удалось удалить'));
        }
      },
    });
  };

  const columns: ColumnsType<Episode> = [
    {
      title: '',
      dataIndex: 'thumbnailUrl',
      width: 80,
      render: (url: string) => <img src={url} alt="" className={styles.thumb} />,
    },
    { title: '№', dataIndex: 'number', width: 60 },
    {
      title: 'Название',
      dataIndex: 'title',
      render: (v: string) => <span className={styles.title}>{v}</span>,
    },
    {
      title: 'Длительность',
      dataIndex: 'duration',
      width: 120,
      render: (v: number) => formatDuration(v),
    },
    {
      title: 'Озвучки',
      dataIndex: 'voiceoverIds',
      width: 200,
      render: (list: Voiceover[]) => <span>{list.length} шт.</span>,
    },
    {
      title: 'Статус',
      dataIndex: 'isPublished',
      width: 120,
      render: (v: boolean) =>
        v ? <Tag color="green">Опубликована</Tag> : <Tag>Черновик</Tag>,
    },
    {
      title: 'Действия',
      width: 110,
      fixed: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Редактировать">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(row)} />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Select
            style={{ width: '100%' }}
            placeholder="Сериал"
            value={selectedCartoon}
            onChange={setSelectedCartoon}
            showSearch
            optionFilterProp="label"
            options={cartoons.map((c) => ({ label: c.title, value: c.id }))}
          />
          <Select
            style={{ width: '100%' }}
            placeholder="Сезон"
            value={selectedSeason}
            onChange={setSelectedSeason}
            disabled={!seasons.length}
            options={seasons.map((s) => ({ label: s.title, value: s.id }))}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          disabled={!selectedSeason}
        >
          Новая серия
        </Button>
      </div>

      <div className={styles.tableCard}>
        <Table<Episode>
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={false}
        />
      </div>

      <EpisodeFormModal
        open={modalOpen}
        episode={editing}
        existingEpisodes={items}
        seasonId={selectedSeason}
        cartoonId={selectedCartoon}
        voiceovers={voiceovers}
        loading={saving}
        onCancel={() => setModalOpen(false)}
        onSubmit={(values) => void handleSubmit(values)}
      />
    </div>
  );
};