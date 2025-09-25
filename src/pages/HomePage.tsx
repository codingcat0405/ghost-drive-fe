import React, { useState, useCallback, useRef } from 'react';
import type { FileSystemItem } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FileBrowser from '../components/FileBrowser';
import PinModal from '../components/PinModal';
import Footer from '../components/Footer';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SettingsPage from '../pages/SettingsPage';
import MoveItemModal from '../components/MoveItemModal';

// Mock data with hierarchy and status
const mockItems: FileSystemItem[] = [
  { id: '1', name: 'Project Alpha', type: 'folder', parentId: null, status: 'active', modified: '2024-07-28', owner: 'Me' },
  { id: '2', name: 'Personal', type: 'folder', parentId: null, status: 'active', modified: '2024-07-27', owner: 'Me' },
  { id: '3', name: 'Client_Contract.pdf', type: 'file', parentId: null, status: 'active', size: '2.3 MB', modified: '2024-07-26', owner: 'Me' },
  { id: '4', name: 'meeting_notes.docx', type: 'file', parentId: '1', status: 'active', size: '150 KB', modified: '2024-07-25', owner: 'Me' },
  { id: '5', name: 'design_mockup_v3.png', type: 'file', parentId: '1', status: 'active', size: '5.8 MB', modified: '2024-07-24', owner: 'Me' },
  { id: '6', name: '2024_Tax_Returns.zip', type: 'file', parentId: '2', status: 'active', size: '12.1 MB', modified: '2024-04-15', owner: 'Me' },
  { id: '7', name: 'Archived Projects', type: 'folder', parentId: null, status: 'active', modified: '2023-12-10', owner: 'Me' },
  { id: '8', name: 'vacation-photos.jpg', type: 'file', parentId: '2', status: 'active', size: '4.2 MB', modified: '2023-09-01', owner: 'Me' },
  { id: '9', name: 'Assets', type: 'folder', parentId: '1', status: 'active', modified: '2024-07-28', owner: 'Me' },
  { id: '10', name: 'logo.svg', type: 'file', parentId: '9', status: 'active', size: '50 KB', modified: '2024-07-28', owner: 'Me' },
  { id: '11', name: 'Old_Report.pdf', type: 'file', parentId: null, status: 'trashed', size: '1.1 MB', modified: '2022-01-20', owner: 'Me' },
];

type Page = 'login' | 'register' | 'drive' | 'settings';
type View = 'drive' | 'recent' | 'trash';

const DriveLayout: React.FC<{ 
  children: React.ReactNode; 
  onNavigate: (page: Page) => void; 
  onUploadClick: () => void; 
  currentView: View;
  onViewChange: (view: View) => void;
}> = ({ children, onNavigate, onUploadClick, currentView, onViewChange }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  return (
     <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} onUploadClick={onUploadClick} currentView={currentView} onViewChange={onViewChange} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} onNavigate={onNavigate} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  )
}


const HomePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentView, setCurrentView] = useState<View>('drive');
  const [items, setItems] = useState<FileSystemItem[]>(mockItems);
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [actionAfterPin, setActionAfterPin] = useState<'open' | 'download'>('open');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<FileSystemItem[]>([]);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [movingItem, setMovingItem] = useState<FileSystemItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNavigateToFolder = useCallback((folderId: string | null) => {
    setRenamingItemId(null);
    setCurrentView('drive');
    setCurrentFolderId(folderId);

    if (folderId === null) {
      setPath([]);
      return;
    }

    const newPath: FileSystemItem[] = [];
    let currentFolder: FileSystemItem | undefined = items.find(i => i.id === folderId);
    while(currentFolder) {
      newPath.unshift(currentFolder);
      currentFolder = items.find(i => i.id === currentFolder!.parentId && i.status === 'active');
    }
    setPath(newPath);
  }, [items]);

  const handleFileClick = useCallback((item: FileSystemItem) => {
    if (item.type === 'folder') {
      handleNavigateToFolder(item.id);
    } else {
      setActionAfterPin('open');
      setSelectedFile(item);
    }
  }, [handleNavigateToFolder]);
  
  const handleCloseModal = useCallback(() => setSelectedFile(null), []);
  const handlePinSuccess = useCallback(() => {
    if (selectedFile) {
      if (actionAfterPin === 'download') {
        alert(`Successfully decrypted! Starting download for ${selectedFile.name}`);
      } else {
        alert(`Successfully decrypted and opened ${selectedFile.name}`);
      }
      setSelectedFile(null);
    }
  }, [selectedFile, actionAfterPin]);

  const handleNavigate = (page: Page) => setCurrentPage(page);
  const handleViewChange = (view: View) => {
    setRenamingItemId(null);
    if(view === 'drive') handleNavigateToFolder(currentFolderId);
    setCurrentView(view);
  };
  
  const handleCreateNewFolder = useCallback(() => {
    const newFolder: FileSystemItem = {
      id: new Date().toISOString(),
      name: `New Folder`,
      type: 'folder',
      parentId: currentFolderId,
      status: 'active',
      modified: new Date().toLocaleDateString('en-CA'),
      owner: 'Me',
    };
    setItems(prev => [newFolder, ...prev]);
    setRenamingItemId(newFolder.id);
  }, [currentFolderId]);
  
  const handleTrashItem = (itemId: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'trashed' } : item));
  };

  const handleRestoreItem = (itemId: string) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'active' } : item));
  };
  
  const handlePermanentlyDeleteItem = (itemId: string) => {
     if(window.confirm(`This action is irreversible. Are you sure you want to permanently delete this item?`)){
        setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleCommitRename = (itemId: string, newName: string) => {
    if (newName.trim()) {
       setItems(prev => prev.map(item => item.id === itemId ? { ...item, name: newName.trim(), modified: new Date().toLocaleDateString('en-CA') } : item));
    }
    setRenamingItemId(null);
  };

  const handleMoveItem = (destinationFolderId: string | null) => {
    if (movingItem) {
       setItems(prev => prev.map(item => item.id === movingItem.id ? { ...item, parentId: destinationFolderId } : item));
    }
    setMovingItem(null);
  };

  const handleDownloadEncrypted = (item: FileSystemItem) => {
    alert(`Starting encrypted download for ${item.name}...`);
  };

  const handleDownloadDecrypted = (item: FileSystemItem) => {
    setActionAfterPin('download');
    setSelectedFile(item);
  };

  const handleUploadFiles = (files: FileList, destinationFolderId: string | null = currentFolderId) => {
    if (files.length === 0) return;
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    const destinationName = items.find(i => i.id === destinationFolderId)?.name || 'My Drive';
    alert(`Simulating upload of ${fileNames} to ${destinationName}`);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  if (currentPage === 'login') return <LoginPage onLogin={() => handleNavigate('drive')} onNavigate={handleNavigate} />;
  if (currentPage === 'register') return <RegisterPage onRegister={() => handleNavigate('drive')} onNavigate={handleNavigate} />;

  let displayedItems: FileSystemItem[];
  if (currentView === 'drive') {
      displayedItems = items.filter(item => item.parentId === currentFolderId && item.status === 'active');
  } else if (currentView === 'trash') {
      displayedItems = items.filter(item => item.status === 'trashed');
  } else { // 'recent'
      displayedItems = [...items]
          .filter(item => item.status === 'active')
          .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 20); // Limit to 20 most recent items
  }
  const allFolders = items.filter(item => item.type === 'folder' && item.status === 'active');

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={e => handleUploadFiles(e.target.files!)} className="hidden" multiple />
      <DriveLayout onNavigate={handleNavigate} onUploadClick={triggerFileInput} currentView={currentView} onViewChange={handleViewChange}>
        {currentPage === 'settings' ? (
           <SettingsPage onNavigate={handleNavigate}/>
        ) : (
          <FileBrowser 
            items={displayedItems}
            path={path}
            currentView={currentView}
            onNavigate={handleNavigateToFolder}
            onFileClick={handleFileClick} 
            onNewFolder={handleCreateNewFolder}
            onTrashItem={handleTrashItem}
            onRestoreItem={handleRestoreItem}
            onPermanentlyDeleteItem={handlePermanentlyDeleteItem}
            onRenameItem={setRenamingItemId}
            onCommitRename={handleCommitRename}
            renamingItemId={renamingItemId}
            onMoveItem={setMovingItem}
            onUploadFiles={handleUploadFiles}
            onUploadClick={triggerFileInput}
            onDownloadEncrypted={handleDownloadEncrypted}
            onDownloadDecrypted={handleDownloadDecrypted}
          />
        )}
      </DriveLayout>

      {selectedFile && <PinModal fileName={selectedFile.name} onClose={handleCloseModal} onSuccess={handlePinSuccess} />}
      {movingItem && <MoveItemModal item={movingItem} folders={allFolders} onClose={() => setMovingItem(null)} onMove={handleMoveItem} />}
    </>
  );
};

export default HomePage;
