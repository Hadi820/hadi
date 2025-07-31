
import { supabase } from '../lib/supabase'
import { 
  MOCK_USERS, MOCK_CLIENTS, MOCK_PROJECTS, MOCK_TEAM_MEMBERS, 
  MOCK_TRANSACTIONS, MOCK_PACKAGES, MOCK_ADDONS, MOCK_TEAM_PROJECT_PAYMENTS,
  MOCK_USER_PROFILE, MOCK_FINANCIAL_POCKETS, MOCK_TEAM_PAYMENT_RECORDS, 
  MOCK_LEADS, MOCK_REWARD_LEDGER_ENTRIES 
} from '../constants'

const createTables = async () => {
  console.log('Creating tables...')
  
  // Create tables using SQL
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Member')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Clients table
    `CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      since DATE NOT NULL,
      instagram TEXT,
      status TEXT NOT NULL CHECK (status IN ('Prospek', 'Aktif', 'Tidak Aktif', 'Hilang')),
      last_contact DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Packages table
    `CREATE TABLE IF NOT EXISTS packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price BIGINT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Add-ons table
    `CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price BIGINT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Team Members table
    `CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      standard_fee BIGINT NOT NULL,
      reward_balance BIGINT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Projects table
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      project_name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_id TEXT NOT NULL REFERENCES clients(id),
      project_type TEXT NOT NULL,
      package_name TEXT NOT NULL,
      package_id TEXT NOT NULL REFERENCES packages(id),
      add_ons JSONB DEFAULT '[]',
      date DATE NOT NULL,
      deadline_date DATE,
      location TEXT NOT NULL,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      status TEXT NOT NULL CHECK (status IN ('Tertunda', 'Persiapan', 'Dikonfirmasi', 'Editing', 'Cetak', 'Selesai', 'Dibatalkan')),
      total_cost BIGINT NOT NULL,
      amount_paid BIGINT DEFAULT 0,
      payment_status TEXT NOT NULL CHECK (payment_status IN ('Lunas', 'DP Terbayar', 'Belum Bayar')),
      team JSONB DEFAULT '[]',
      notes TEXT,
      accommodation TEXT,
      drive_link TEXT,
      start_time TEXT,
      end_time TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Financial Pockets table
    `CREATE TABLE IF NOT EXISTS financial_pockets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL CHECK (icon IN ('piggy-bank', 'lock', 'users', 'clipboard-list')),
      type TEXT NOT NULL CHECK (type IN ('Nabung & Bayar', 'Terkunci', 'Bersama', 'Anggaran Pengeluaran')),
      amount BIGINT DEFAULT 0,
      goal_amount BIGINT,
      lock_end_date DATE,
      members JSONB DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Transactions table
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      amount BIGINT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('Pemasukan', 'Pengeluaran')),
      project_id TEXT REFERENCES projects(id),
      category TEXT NOT NULL,
      method TEXT NOT NULL CHECK (method IN ('Transfer Bank', 'Tunai', 'E-Wallet', 'Sistem')),
      pocket_id TEXT REFERENCES financial_pockets(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Team Project Payments table
    `CREATE TABLE IF NOT EXISTS team_project_payments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      team_member_name TEXT NOT NULL,
      team_member_id TEXT NOT NULL REFERENCES team_members(id),
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Paid', 'Unpaid')),
      fee BIGINT NOT NULL,
      reward BIGINT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Team Payment Records table
    `CREATE TABLE IF NOT EXISTS team_payment_records (
      id TEXT PRIMARY KEY,
      record_number TEXT NOT NULL,
      team_member_id TEXT NOT NULL REFERENCES team_members(id),
      date DATE NOT NULL,
      project_payment_ids JSONB NOT NULL,
      total_amount BIGINT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Leads table
    `CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_channel TEXT NOT NULL CHECK (contact_channel IN ('WhatsApp', 'Instagram', 'Website', 'Telepon', 'Referensi', 'Form Saran', 'Lainnya')),
      location TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Baru Masuk', 'Sedang Diskusi', 'Menunggu Follow Up', 'Dikonversi', 'Ditolak')),
      date DATE NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Reward Ledger Entries table
    `CREATE TABLE IF NOT EXISTS reward_ledger_entries (
      id TEXT PRIMARY KEY,
      team_member_id TEXT NOT NULL REFERENCES team_members(id),
      date DATE NOT NULL,
      description TEXT NOT NULL,
      amount BIGINT NOT NULL,
      project_id TEXT REFERENCES projects(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Profile table (single row table)
    `CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY DEFAULT 'main_profile',
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company_name TEXT NOT NULL,
      website TEXT NOT NULL,
      address TEXT NOT NULL,
      bank_account TEXT NOT NULL,
      bio TEXT NOT NULL,
      income_categories JSONB NOT NULL,
      expense_categories JSONB NOT NULL,
      project_types JSONB NOT NULL,
      event_types JSONB NOT NULL,
      notification_settings JSONB NOT NULL,
      security_settings JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  ]
  
  for (const table of tables) {
    const { error } = await supabase.rpc('exec_sql', { sql: table })
    if (error) {
      console.error('Error creating table:', error)
    }
  }
}

const importMockData = async () => {
  console.log('Importing mock data...')
  
  try {
    // Import Users
    const { error: usersError } = await supabase
      .from('users')
      .upsert(MOCK_USERS.map(user => ({
        id: user.id,
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        role: user.role
      })))
    
    if (usersError) console.error('Users import error:', usersError)
    else console.log('Users imported successfully')
    
    // Import Clients
    const { error: clientsError } = await supabase
      .from('clients')
      .upsert(MOCK_CLIENTS.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        since: client.since,
        instagram: client.instagram,
        status: client.status,
        last_contact: client.lastContact
      })))
    
    if (clientsError) console.error('Clients import error:', clientsError)
    else console.log('Clients imported successfully')
    
    // Import Packages
    const { error: packagesError } = await supabase
      .from('packages')
      .upsert(MOCK_PACKAGES.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description
      })))
    
    if (packagesError) console.error('Packages import error:', packagesError)
    else console.log('Packages imported successfully')
    
    // Import Add-ons
    const { error: addonsError } = await supabase
      .from('addons')
      .upsert(MOCK_ADDONS.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price
      })))
    
    if (addonsError) console.error('Add-ons import error:', addonsError)
    else console.log('Add-ons imported successfully')
    
    // Import Team Members
    const { error: teamError } = await supabase
      .from('team_members')
      .upsert(MOCK_TEAM_MEMBERS.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        standard_fee: member.standardFee,
        reward_balance: member.rewardBalance
      })))
    
    if (teamError) console.error('Team members import error:', teamError)
    else console.log('Team members imported successfully')
    
    // Import Financial Pockets
    const { error: pocketsError } = await supabase
      .from('financial_pockets')
      .upsert(MOCK_FINANCIAL_POCKETS.map(pocket => ({
        id: pocket.id,
        name: pocket.name,
        description: pocket.description,
        icon: pocket.icon,
        type: pocket.type,
        amount: pocket.amount,
        goal_amount: pocket.goalAmount,
        lock_end_date: pocket.lockEndDate,
        members: pocket.members || []
      })))
    
    if (pocketsError) console.error('Financial pockets import error:', pocketsError)
    else console.log('Financial pockets imported successfully')
    
    // Import Projects
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(MOCK_PROJECTS.map(project => ({
        id: project.id,
        project_name: project.projectName,
        client_name: project.clientName,
        client_id: project.clientId,
        project_type: project.projectType,
        package_name: project.packageName,
        package_id: project.packageId,
        add_ons: project.addOns,
        date: project.date,
        deadline_date: project.deadlineDate,
        location: project.location,
        progress: project.progress,
        status: project.status,
        total_cost: project.totalCost,
        amount_paid: project.amountPaid,
        payment_status: project.paymentStatus,
        team: project.team,
        notes: project.notes,
        accommodation: project.accommodation,
        drive_link: project.driveLink,
        start_time: project.startTime,
        end_time: project.endTime
      })))
    
    if (projectsError) console.error('Projects import error:', projectsError)
    else console.log('Projects imported successfully')
    
    // Import Transactions
    const { error: transactionsError } = await supabase
      .from('transactions')
      .upsert(MOCK_TRANSACTIONS.map(transaction => ({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        project_id: transaction.projectId,
        category: transaction.category,
        method: transaction.method,
        pocket_id: transaction.pocketId
      })))
    
    if (transactionsError) console.error('Transactions import error:', transactionsError)
    else console.log('Transactions imported successfully')
    
    // Import Team Project Payments
    const { error: teamPaymentsError } = await supabase
      .from('team_project_payments')
      .upsert(MOCK_TEAM_PROJECT_PAYMENTS.map(payment => ({
        id: payment.id,
        project_id: payment.projectId,
        team_member_name: payment.teamMemberName,
        team_member_id: payment.teamMemberId,
        date: payment.date,
        status: payment.status,
        fee: payment.fee,
        reward: payment.reward
      })))
    
    if (teamPaymentsError) console.error('Team project payments import error:', teamPaymentsError)
    else console.log('Team project payments imported successfully')
    
    // Import Team Payment Records
    const { error: paymentRecordsError } = await supabase
      .from('team_payment_records')
      .upsert(MOCK_TEAM_PAYMENT_RECORDS.map(record => ({
        id: record.id,
        record_number: record.recordNumber,
        team_member_id: record.teamMemberId,
        date: record.date,
        project_payment_ids: record.projectPaymentIds,
        total_amount: record.totalAmount
      })))
    
    if (paymentRecordsError) console.error('Team payment records import error:', paymentRecordsError)
    else console.log('Team payment records imported successfully')
    
    // Import Leads
    const { error: leadsError } = await supabase
      .from('leads')
      .upsert(MOCK_LEADS.map(lead => ({
        id: lead.id,
        name: lead.name,
        contact_channel: lead.contactChannel,
        location: lead.location,
        status: lead.status,
        date: lead.date,
        notes: lead.notes
      })))
    
    if (leadsError) console.error('Leads import error:', leadsError)
    else console.log('Leads imported successfully')
    
    // Import Reward Ledger Entries
    const { error: rewardError } = await supabase
      .from('reward_ledger_entries')
      .upsert(MOCK_REWARD_LEDGER_ENTRIES.map(entry => ({
        id: entry.id,
        team_member_id: entry.teamMemberId,
        date: entry.date,
        description: entry.description,
        amount: entry.amount,
        project_id: entry.projectId
      })))
    
    if (rewardError) console.error('Reward ledger entries import error:', rewardError)
    else console.log('Reward ledger entries imported successfully')
    
    // Import Profile
    const { error: profileError } = await supabase
      .from('profile')
      .upsert([{
        id: 'main_profile',
        full_name: MOCK_USER_PROFILE.fullName,
        email: MOCK_USER_PROFILE.email,
        phone: MOCK_USER_PROFILE.phone,
        company_name: MOCK_USER_PROFILE.companyName,
        website: MOCK_USER_PROFILE.website,
        address: MOCK_USER_PROFILE.address,
        bank_account: MOCK_USER_PROFILE.bankAccount,
        bio: MOCK_USER_PROFILE.bio,
        income_categories: MOCK_USER_PROFILE.incomeCategories,
        expense_categories: MOCK_USER_PROFILE.expenseCategories,
        project_types: MOCK_USER_PROFILE.projectTypes,
        event_types: MOCK_USER_PROFILE.eventTypes,
        notification_settings: MOCK_USER_PROFILE.notificationSettings,
        security_settings: MOCK_USER_PROFILE.securitySettings
      }])
    
    if (profileError) console.error('Profile import error:', profileError)
    else console.log('Profile imported successfully')
    
    console.log('All mock data imported successfully!')
    
  } catch (error) {
    console.error('Error importing mock data:', error)
  }
}

// Run the setup
const setupDatabase = async () => {
  await createTables()
  await importMockData()
}

// Run the setup when file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

export { setupDatabase }
