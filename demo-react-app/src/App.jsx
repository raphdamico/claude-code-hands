import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f0f2f5',
    }}>
      <AppHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <BoardView />
      </div>
    </div>
  );
}

export default App;
