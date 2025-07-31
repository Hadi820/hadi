

import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User } from './types';
import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_TEAM_MEMBERS, MOCK_TRANSACTIONS, MOCK_PACKAGES, MOCK_ADDONS, MOCK_TEAM_PROJECT_PAYMENTS, MOCK_USER_PROFILE, MOCK_FINANCIAL_POCKETS, MOCK_TEAM_PAYMENT_RECORDS, MOCK_LEADS, MOCK_REWARD_LEDGER_ENTRIES, MOCK_USERS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Freelancers from './components/Freelancers';
import Finance from './components/Finance';
import Packages from './components/Packages';
import Settings from './components/Settings';
import CalendarView from './components/CalendarView';
import ClientKPI from './components/ClientKPI';
import Login from './components/Login';
import Header from './components/Header';
import SuggestionForm from './components/SuggestionForm';


export type NavigationAction = {
  type: string;
  id?: string;
  tab?: 'info' | 'project' | 'payment' | 'invoice';
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeView, setActiveView] = useState<ViewType>(ViewType.DASHBOARD);
  const [notification, setNotification] = useState<string>('');
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
        setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lifted State for global management and integration
  const [users, setUsers] = useState<User[]>(() => JSON.parse(JSON.stringify(MOCK_USERS)));
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(JSON.stringify(MOCK_CLIENTS)));
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(JSON.stringify(MOCK_PROJECTS)));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_MEMBERS)));
  const [transactions, setTransactions] = useState<Transaction[]>(() => JSON.parse(JSON.stringify(MOCK_TRANSACTIONS)));
  const [packages, setPackages] = useState<Package[]>(() => JSON.parse(JSON.stringify(MOCK_PACKAGES)));
  const [addOns, setAddOns] = useState<AddOn[]>(() => JSON.parse(JSON.stringify(MOCK_ADDONS)));
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_PROJECT_PAYMENTS)));
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>(() => JSON.parse(JSON.stringify(MOCK_TEAM_PAYMENT_RECORDS)));
  const [pockets, setPockets] = useState<FinancialPocket[]>(() => JSON.parse(JSON.stringify(MOCK_FINANCIAL_POCKETS)));
  const [profile, setProfile] = useState<Profile>(() => JSON.parse(JSON.stringify(MOCK_USER_PROFILE)));
  const [leads, setLeads] = useState<Lead[]>(() => JSON.parse(JSON.stringify(MOCK_LEADS)));
  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>(() => JSON.parse(JSON.stringify(MOCK_REWARD_LEDGER_ENTRIES)));
  
  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, duration);
  };

  const handleLoginSuccess = (user: User) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleNavigation = (view: ViewType, action?: NavigationAction) => {
    setActiveView(view);
    setInitialAction(action || null);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewType.DASHBOARD:
        return <Dashboard 
                  projects={projects} 
                  clients={clients} 
                  transactions={transactions} 
                  pockets={pockets}
                  packages={packages}
                  leads={leads}
                  handleNavigation={handleNavigation}
                />;
      case ViewType.CLIENTS:
        return <Clients 
                    clients={clients} setClients={setClients}
                    projects={projects} setProjects={setProjects}
                    packages={packages}
                    addOns={addOns}
                    transactions={transactions} setTransactions={setTransactions}
                    userProfile={profile}
                    showNotification={showNotification}
                    initialAction={initialAction}
                    setInitialAction={setInitialAction}
                />;
      case ViewType.PROJECTS:
        return <Projects 
                    projects={projects} setProjects={setProjects}
                    clients={clients}
                    packages={packages}
                    teamMembers={teamMembers}
                    teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
                    transactions={transactions} setTransactions={setTransactions}
                    initialAction={initialAction}
                    setInitialAction={setInitialAction}
                    profile={profile}
                    showNotification={showNotification}
                />;
       case ViewType.TEAM:
        return <Freelancers 
                    teamMembers={teamMembers} setTeamMembers={setTeamMembers}
                    teamProjectPayments={teamProjectPayments} setTeamProjectPayments={setTeamProjectPayments}
                    teamPaymentRecords={teamPaymentRecords} setTeamPaymentRecords={setTeamPaymentRecords}
                    transactions={transactions} setTransactions={setTransactions}
                    userProfile={profile}
                    showNotification={showNotification}
                    initialAction={initialAction}
                    setInitialAction={setInitialAction}
                    projects={projects}
                    setProjects={setProjects}
                    rewardLedgerEntries={rewardLedgerEntries} setRewardLedgerEntries={setRewardLedgerEntries}
                />;
      case ViewType.FINANCE:
        return <Finance 
                    transactions={transactions} setTransactions={setTransactions}
                    pockets={pockets} setPockets={setPockets}
                    projects={projects}
                    profile={profile}
                />;
      case ViewType.KPI_KLIEN:
        return <ClientKPI 
                  clients={clients}
                  setClients={setClients}
                  projects={projects}
                  leads={leads}
                  setLeads={setLeads}
                  showNotification={showNotification}
              />;
      case ViewType.CALENDAR:
        return <CalendarView 
                    projects={projects} setProjects={setProjects}
                    teamMembers={teamMembers}
                    profile={profile}
                />;
      case ViewType.PACKAGES:
        return <Packages 
                    packages={packages} setPackages={setPackages}
                    addOns={addOns} setAddOns={setAddOns}
                    projects={projects}
                />;
      case ViewType.SETTINGS:
        return <Settings 
                    profile={profile} setProfile={setProfile} 
                    transactions={transactions}
                    projects={projects}
                    users={users} setUsers={setUsers}
                    currentUser={currentUser}
                />;
      default:
        return <Dashboard projects={projects} clients={clients} transactions={transactions} pockets={pockets} packages={packages} leads={leads} handleNavigation={handleNavigation} />;
    }
  };

  if (route === '#/suggestion') {
    return <SuggestionForm setLeads={setLeads} />;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} users={users} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {notification && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white py-3 px-6 rounded-lg shadow-xl z-[100] animate-fade-in-out">
          {notification}
        </div>
      )}
      <Sidebar 
        activeView={activeView} 
        setActiveView={handleNavigation} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        handleLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={activeView} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
