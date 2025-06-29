import { Outlet } from 'react-router-dom';
import { Header } from '@/components/Header';

export function Layout() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'transparent',
      width: '100%'
    }}>
      <Header />
      <main style={{ 
        width: '100%',
        minHeight: 'calc(100vh - 80px)',
        padding: '0'
      }}>
        <Outlet />
      </main>
    </div>
  );
} 