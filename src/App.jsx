import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';

export default function App() {
  const userWalletAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState('home');
  const [minedTon, setMinedTon] = useState(0.05);
  const [claimableTime, setClaimableTime] = useState(1200);
  const [miningActive, setMiningActive] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [tasks, setTasks] = useState([
    { id: 1, name: 'Daily Telegram Check-in', reward: 0.05, done: false },
    { id: 2, name: 'Join CyberNode Official Channel', reward: 0.1, done: false },
    { id: 3, name: 'Keyboard AI Bot Assistant Verification', reward: 0.15, done: false },
    { id: 4, name: 'Watch Mining Booster Video', reward: 0.08, done: false },
    { id: 5, name: 'Invite 3 Active Miners', reward: 0.25, done: false },
    { id: 6, name: 'Overclock Hashrate (2x Speed)', reward: 0.2, done: false },
    { id: 7, name: 'VIP Lodge Staking Boost', reward: 0.5, done: false },
    { id: 8, name: 'Complete AI Task Cycle', reward: 0.12, done: false }
  ]);

  useEffect(() => {
    let timer = setInterval(() => {
      setClaimableTime(prev => (prev > 0 ? prev - 1 : 0));
      if (miningActive) setMinedTon(prev => prev + 0.00008);
    }, 1000);
    return () => clearInterval(timer);
  }, [miningActive]);

  const claimTask = (id, reward) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: true } : t));
    setMinedTon(prev => prev + reward);
    setStatusMsg(`Received +${reward} TON into balance!`);
  };

  const handle1TapWithdraw = async () => {
    if (!userWalletAddress) return alert('Connect your Tonkeeper wallet first!');
    if (minedTon <= 0) return alert('No TON available to claim right now.');

    setPayoutLoading(true);
    setStatusMsg('Broadcasting to TON Mainnet live...');

    try {
      const res = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientAddress: userWalletAddress, amountInTon: minedTon.toFixed(4) })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`Success! Sent ${minedTon.toFixed(4)} TON to your wallet.`);
        setMinedTon(0);
        setClaimableTime(1200);
      } else {
        setStatusMsg(`Payout Error: ${data.error}`);
      }
    } catch (e) {
      setStatusMsg('Network failure broadcasting to TON blockchain.');
    } finally {
      setPayoutLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ margin: 0, color: '#38bdf8' }}>CyberNode V3</h2>
          <small style={{ color: '#94a3b8' }}>Real TON Blockchain Miner</small>
        </div>
        <TonConnectButton />
      </header>

      <main style={{ padding: '16px' }}>
        {activeTab === 'home' && (
          <div>
            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #334155' }}>
              <div style={{ width: '120px', height: '120px', margin: '0 auto 16px auto', borderRadius: '50%', border: '5px solid #38bdf8', borderTopColor: 'transparent', animation: 'spin 1.5s linear infinite' }} />
              <h1 style={{ fontSize: '32px', color: '#38bdf8', margin: '10px 0' }}>{minedTon.toFixed(5)} TON</h1>
              <p style={{ color: '#94a3b8' }}>20-Min Cycle Claim Timer: <strong>{formatTime(claimableTime)}</strong></p>
              <button onClick={handle1TapWithdraw} disabled={payoutLoading || minedTon === 0} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '12px' }}>
                {payoutLoading ? 'Broadcasting to TON...' : '1-Tap Withdraw To Connected Wallet'}
              </button>
            </div>

            <h3 style={{ marginTop: '24px' }}>8 Multi-Earning Systems</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {tasks.map(t => (
                <div key={t.id} style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                    <small style={{ color: '#38bdf8' }}>+{t.reward} TON</small>
                  </div>
                  <button onClick={() => claimTask(t.id, t.reward)} disabled={t.done} style={{ background: t.done ? '#334155' : '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                    {t.done ? 'Claimed' : 'Claim'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'favourites' && <div style={{ padding: '20px', textAlign: 'center' }}><h3>Favorites Node Pool</h3></div>}
        {activeTab === 'chat' && <div style={{ padding: '20px', textAlign: 'center' }}><h3>Keyboard AI & Live Chat Bot</h3></div>}
        {activeTab === 'menu' && (
          <div style={{ padding: '20px' }}>
            <h3>Menu & Explorer Links</h3>
            {userWalletAddress && <p style={{ wordBreak: 'break-all' }}>Connected Wallet: {userWalletAddress}</p>}
            <p><a href={`https://tonviewer.com/${userWalletAddress}`} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>Open TON Viewer Explorer</a></p>
          </div>
        )}

        {statusMsg && <div style={{ marginTop: '16px', padding: '12px', background: '#334155', borderRadius: '8px', textAlign: 'center' }}>{statusMsg}</div>}
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: activeTab === 'home' ? '#38bdf8' : '#94a3b8' }}>Home</button>
        <button onClick={() => setActiveTab('favourites')} style={{ background: 'none', border: 'none', color: activeTab === 'favourites' ? '#38bdf8' : '#94a3b8' }}>Favorites</button>
        <button onClick={() => setActiveTab('chat')} style={{ background: 'none', border: 'none', color: activeTab === 'chat' ? '#38bdf8' : '#94a3b8' }}>Live Chat</button>
        <button onClick={() => setActiveTab('menu')} style={{ background: 'none', border: 'none', color: activeTab === 'menu' ? '#38bdf8' : '#94a3b8' }}>Menu</button>
      </nav>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
