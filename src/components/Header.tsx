import { useWalletStore } from '@/store/walletStore';

export function Header() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWalletStore();

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        connectWallet(accounts[0]);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 32px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
      height: '80px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(167, 139, 250, 0.4), 0 4px 15px rgba(167, 139, 250, 0.3)',
          border: '1px solid rgba(167, 139, 250, 0.3)'
        }}>
          <img 
            src="/lootpang-logo.png" 
            alt="LootPang Logo" 
            style={{ 
              width: '32px', 
              height: '32px',
              borderRadius: '8px'
            }} 
          />
        </div>
        <h1 style={{ 
          fontSize: '24px', 
          margin: 0, 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.025em',
          textShadow: '0 0 10px rgba(248, 250, 252, 0.3)'
        }}>
          LootPang
        </h1>
      </div>
      <button 
        onClick={isConnected ? disconnectWallet : handleConnect}
        style={{
          background: isConnected 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
          color: isConnected ? '#e2e8f0' : '#1e293b',
          border: isConnected ? '1px solid rgba(148, 163, 184, 0.3)' : 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isConnected 
            ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
            : '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (!isConnected) {
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(167, 139, 250, 0.5), 0 0 30px rgba(167, 139, 250, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnected) {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(167, 139, 250, 0.4), 0 0 20px rgba(167, 139, 250, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {isConnected && address ? `${truncateAddress(address)}` : 'Connect Wallet'}
      </button>
    </header>
  );
} 