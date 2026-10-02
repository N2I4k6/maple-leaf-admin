import { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { Link } from 'react-router-dom';
import { cartoonsApi } from '@/api/cartoons';
import { episodesApi } from '@/api/episodes';
import { seasonsApi } from '@/api/seasons';
import { newsApi } from '@/api/news';
import { voiceoversApi } from '@/api/voiceovers';
import { getApiErrorMessage } from '@/shared/lib/api-error';
import styles from './Dashboard.module.scss';

interface Stats {
  cartoons: number;
  seasons: number;
  episodes: number;
  news: number;
  voiceovers: number;
}

interface StatCard {
  key: keyof Stats;
  icon: string;
  label: string;
  to: string;
}

const CARDS: StatCard[] = [
  { key: 'cartoons', icon: '📺', label: 'Сериалы', to: '/cartoons' },
  { key: 'seasons', icon: '📁', label: 'Сезоны', to: '/seasons' },
  { key: 'episodes', icon: '🎬', label: 'Серии', to: '/episodes' },
  { key: 'voiceovers', icon: '🎙️', label: 'Озвучки', to: '/voiceovers' },
  { key: 'news', icon: '📰', label: 'Новости', to: '/news' },
];

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [cartoonsData, newsData, voiceoversData] = await Promise.all([
          cartoonsApi.getAll({ limit: 100 }),
          newsApi.getAll({ limit: 1 }),
          voiceoversApi.getAll(),
        ]);

        let seasonsTotal = 0;
        let episodesTotal = 0;

        for (const cartoon of cartoonsData.items) {
          const seasons = await seasonsApi.getByCartoon(cartoon.id);
          seasonsTotal += seasons.length;

          for (const season of seasons) {
            const eps = await episodesApi.getBySeason(season.id);
            episodesTotal += eps.length;
          }
        }

        if (cancelled) return;

        setStats({
          cartoons: cartoonsData.total,
          seasons: seasonsTotal,
          episodes: episodesTotal,
          voiceovers: voiceoversData.length,
          news: newsData.total,
        });
      } catch (error) {
        if (!cancelled) {
          void message.error(getApiErrorMessage(error, 'Не удалось загрузить статистику'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {CARDS.map((card) => (
        <div key={card.key} className={styles.card}>
          <div className={styles.icon}>{card.icon}</div>
          <div className={styles.value}>{stats?.[card.key] ?? 0}</div>
          <div className={styles.label}>{card.label}</div>
          <Link to={card.to} className={styles.link}>
            Открыть →
          </Link>
        </div>
      ))}
    </div>
  );
};