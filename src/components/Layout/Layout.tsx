import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import styles from './Layout.module.scss';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV: NavItem[] = [
  { to: '/', icon: '📊', label: 'Дашборд' },
  { to: '/cartoons', icon: '📺', label: 'Сериалы' },
  { to: '/seasons', icon: '📁', label: 'Сезоны' },
  { to: '/episodes', icon: '🎬', label: 'Серии' },
  { to: '/voiceovers', icon: '🎙️', label: 'Озвучки' },
  { to: '/news', icon: '📰', label: 'Новости' },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Дашборд',
  '/cartoons': 'Мультсериалы',
  '/seasons': 'Сезоны',
  '/episodes': 'Серии',
  '/voiceovers': 'Озвучки',
  '/news': 'Новости',
};

export const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Maple Leaf Admin';

  return (
    <div className={styles.layout}>
      <aside className={styles.sider}>
        <div className={styles.brand}>
          <span className={styles.logo}>🍁</span>
          <span className={styles.brandText}>Maple Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>

          <div className={styles.headerActions}>
            <span className={styles.user}>
              👤 {user?.name ?? user?.email}
            </span>

            <Tooltip title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}>
              <Button onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
            </Tooltip>

            <Tooltip title="Выйти">
              <Button danger onClick={logout}>
                Выйти
              </Button>
            </Tooltip>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};