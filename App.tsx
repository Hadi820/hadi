

import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry, User } from './types';
import { SupabaseService } from './services/supabaseService';
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

  // Load data from Supabase on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [
          usersData,
          clientsData,
          projectsData,
          teamMembersData,
          transactionsData,
          packagesData,
          addOnsData,
          teamProjectPaymentsData,
          teamPaymentRecordsData,
          pocketsData,
          profileData,
          leadsData,
          rewardLedgerEntriesData
        ] = await Promise.all([
          SupabaseService.getUsers(),
          SupabaseService.getClients(),
          SupabaseService.getProjects(),
          SupabaseService.getTeamMembers(),
          SupabaseService.getTransactions(),
          SupabaseService.getPackages(),
          SupabaseService.getAddOns(),
          SupabaseService.getTeamProjectPayments(),
          SupabaseService.getTeamPaymentRecords(),
          SupabaseService.getFinancialPockets(),
          SupabaseService.getProfile(),
          SupabaseService.getLeads(),
          SupabaseService.getRewardLedgerEntries()
        ]);

        setUsers(usersData);
        setClients(clientsData);
        setProjects(projectsData);
        setTeamMembers(teamMembersData);
        setTransactions(transactionsData);
        setPackages(packagesData);
        setAddOns(addOnsData);
        setTeamProjectPayments(teamProjectPaymentsData);
        setTeamPaymentRecords(teamPaymentRecordsData);
        setPockets(pocketsData);
        setProfile(profileData);
        setLeads(leadsData);
        setRewardLedgerEntries(rewardLedgerEntriesData);
        
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data from database');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // State for global management and integration with Supabase
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [teamProjectPayments, setTeamProjectPayments] = useState<TeamProjectPayment[]>([]);
  const [teamPaymentRecords, setTeamPaymentRecords] = useState<TeamPaymentRecord[]>([]);
  const [pockets, setPockets] = useState<FinancialPocket[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [rewardLedgerEntries, setRewardLedgerEntries] = useState<RewardLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading data...</p>
          </div>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-slate-600">No profile data found. Please check your database setup.</p>
          </div>
        </div>
      );
    }

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
