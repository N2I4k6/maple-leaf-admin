import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';
import { useTheme } from '@/hooks/useTheme';
import { ProtectedRoute } from '@/components/ProtectedRoute/ProtectedRoute';
import { Layout } from '@/components/Layout/Layout';
import { Login } from '@/pages/Login/Login';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Cartoons } from '@/pages/Cartoons/Cartoons';
import { Seasons } from '@/pages/Seasons/Seasons';
import { Episodes } from '@/pages/Episodes/Episodes';
import { Voiceovers } from '@/pages/Voiceovers/Voiceovers';
import { News } from '@/pages/News/News';

interface AntdThemeBridgeProps {
  children: ReactNode;
}

const AntdThemeBridge = ({ children }: AntdThemeBridgeProps) => {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm:
          theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: theme === 'dark' ? '#A63A00' : '#C8102E',
          borderRadius: 10,
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export const App = () => (
  <ThemeProvider>
    <AntdThemeBridge>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/cartoons" element={<Cartoons />} />
                <Route path="/seasons" element={<Seasons />} />
                <Route path="/episodes" element={<Episodes />} />
                <Route path="/voiceovers" element={<Voiceovers />} />
                <Route path="/news" element={<News />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AntdThemeBridge>
  </ThemeProvider>
);