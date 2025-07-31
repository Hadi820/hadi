
import { supabase } from '../lib/supabase'
import type { 
  User, Client, Project, Package, TeamMember, Transaction, 
  FinancialPocket, AddOn, Profile, TeamProjectPayment, 
  TeamPaymentRecord, Lead, RewardLedgerEntry 
} from '../types'

export class SupabaseService {
  // Users
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) throw error
    
    return data?.map(user => ({
      id: user.id,
      email: user.email,
      password: user.password,
      fullName: user.full_name,
      role: user.role
    })) || []
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    const id = 'USR_' + Date.now()
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id,
        email: user.email,
        password: user.password,
        full_name: user.fullName,
        role: user.role
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      email: data.email,
      password: data.password,
      fullName: data.full_name,
      role: data.role
    }
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        email: updates.email,
        password: updates.password,
        full_name: updates.fullName,
        role: updates.role
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      email: data.email,
      password: data.password,
      fullName: data.full_name,
      role: data.role
    }
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Clients
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      since: client.since,
      instagram: client.instagram,
      status: client.status,
      lastContact: client.last_contact
    })) || []
  }

  static async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    const id = 'CLI' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        since: client.since,
        instagram: client.instagram,
        status: client.status,
        last_contact: client.lastContact
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      since: data.since,
      instagram: data.instagram,
      status: data.status,
      lastContact: data.last_contact
    }
  }

  static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        since: updates.since,
        instagram: updates.instagram,
        status: updates.status,
        last_contact: updates.lastContact
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      since: data.since,
      instagram: data.instagram,
      status: data.status,
      lastContact: data.last_contact
    }
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Projects
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(project => ({
      id: project.id,
      projectName: project.project_name,
      clientName: project.client_name,
      clientId: project.client_id,
      projectType: project.project_type,
      packageName: project.package_name,
      packageId: project.package_id,
      addOns: project.add_ons,
      date: project.date,
      deadlineDate: project.deadline_date,
      location: project.location,
      progress: project.progress,
      status: project.status,
      totalCost: project.total_cost,
      amountPaid: project.amount_paid,
      paymentStatus: project.payment_status,
      team: project.team,
      notes: project.notes,
      accommodation: project.accommodation,
      driveLink: project.drive_link,
      startTime: project.start_time,
      endTime: project.end_time
    })) || []
  }

  static async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const id = 'PRJ' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        id,
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
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      projectName: data.project_name,
      clientName: data.client_name,
      clientId: data.client_id,
      projectType: data.project_type,
      packageName: data.package_name,
      packageId: data.package_id,
      addOns: data.add_ons,
      date: data.date,
      deadlineDate: data.deadline_date,
      location: data.location,
      progress: data.progress,
      status: data.status,
      totalCost: data.total_cost,
      amountPaid: data.amount_paid,
      paymentStatus: data.payment_status,
      team: data.team,
      notes: data.notes,
      accommodation: data.accommodation,
      driveLink: data.drive_link,
      startTime: data.start_time,
      endTime: data.end_time
    }
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        project_name: updates.projectName,
        client_name: updates.clientName,
        client_id: updates.clientId,
        project_type: updates.projectType,
        package_name: updates.packageName,
        package_id: updates.packageId,
        add_ons: updates.addOns,
        date: updates.date,
        deadline_date: updates.deadlineDate,
        location: updates.location,
        progress: updates.progress,
        status: updates.status,
        total_cost: updates.totalCost,
        amount_paid: updates.amountPaid,
        payment_status: updates.paymentStatus,
        team: updates.team,
        notes: updates.notes,
        accommodation: updates.accommodation,
        drive_link: updates.driveLink,
        start_time: updates.startTime,
        end_time: updates.endTime
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      projectName: data.project_name,
      clientName: data.client_name,
      clientId: data.client_id,
      projectType: data.project_type,
      packageName: data.package_name,
      packageId: data.package_id,
      addOns: data.add_ons,
      date: data.date,
      deadlineDate: data.deadline_date,
      location: data.location,
      progress: data.progress,
      status: data.status,
      totalCost: data.total_cost,
      amountPaid: data.amount_paid,
      paymentStatus: data.payment_status,
      team: data.team,
      notes: data.notes,
      accommodation: data.accommodation,
      driveLink: data.drive_link,
      startTime: data.start_time,
      endTime: data.end_time
    }
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Team Members
  static async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      standardFee: member.standard_fee,
      rewardBalance: member.reward_balance
    })) || []
  }

  static async createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const id = 'TM' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        id,
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        standard_fee: member.standardFee,
        reward_balance: member.rewardBalance
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      standardFee: data.standard_fee,
      rewardBalance: data.reward_balance
    }
  }

  static async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: updates.name,
        role: updates.role,
        email: updates.email,
        phone: updates.phone,
        standard_fee: updates.standardFee,
        reward_balance: updates.rewardBalance
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      phone: data.phone,
      standardFee: data.standard_fee,
      rewardBalance: data.reward_balance
    }
  }

  static async deleteTeamMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return data?.map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      projectId: transaction.project_id,
      category: transaction.category,
      method: transaction.method,
      pocketId: transaction.pocket_id
    })) || []
  }

  static async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const id = 'TRN' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        id,
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        project_id: transaction.projectId,
        category: transaction.category,
        method: transaction.method,
        pocket_id: transaction.pocketId
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      date: data.date,
      description: data.description,
      amount: data.amount,
      type: data.type,
      projectId: data.project_id,
      category: data.category,
      method: data.method,
      pocketId: data.pocket_id
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: updates.date,
        description: updates.description,
        amount: updates.amount,
        type: updates.type,
        project_id: updates.projectId,
        category: updates.category,
        method: updates.method,
        pocket_id: updates.pocketId
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      date: data.date,
      description: data.description,
      amount: data.amount,
      type: data.type,
      projectId: data.project_id,
      category: data.category,
      method: data.method,
      pocketId: data.pocket_id
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Financial Pockets
  static async getFinancialPockets(): Promise<FinancialPocket[]> {
    const { data, error } = await supabase
      .from('financial_pockets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(pocket => ({
      id: pocket.id,
      name: pocket.name,
      description: pocket.description,
      icon: pocket.icon,
      type: pocket.type,
      amount: pocket.amount,
      goalAmount: pocket.goal_amount,
      lockEndDate: pocket.lock_end_date,
      members: pocket.members
    })) || []
  }

  static async createFinancialPocket(pocket: Omit<FinancialPocket, 'id'>): Promise<FinancialPocket> {
    const id = 'POC' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('financial_pockets')
      .insert([{
        id,
        name: pocket.name,
        description: pocket.description,
        icon: pocket.icon,
        type: pocket.type,
        amount: pocket.amount,
        goal_amount: pocket.goalAmount,
        lock_end_date: pocket.lockEndDate,
        members: pocket.members
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      type: data.type,
      amount: data.amount,
      goalAmount: data.goal_amount,
      lockEndDate: data.lock_end_date,
      members: data.members
    }
  }

  static async updateFinancialPocket(id: string, updates: Partial<FinancialPocket>): Promise<FinancialPocket> {
    const { data, error } = await supabase
      .from('financial_pockets')
      .update({
        name: updates.name,
        description: updates.description,
        icon: updates.icon,
        type: updates.type,
        amount: updates.amount,
        goal_amount: updates.goalAmount,
        lock_end_date: updates.lockEndDate,
        members: updates.members
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      type: data.type,
      amount: data.amount,
      goalAmount: data.goal_amount,
      lockEndDate: data.lock_end_date,
      members: data.members
    }
  }

  static async deleteFinancialPocket(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_pockets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Packages
  static async getPackages(): Promise<Package[]> {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      description: pkg.description
    })) || []
  }

  static async createPackage(pkg: Omit<Package, 'id'>): Promise<Package> {
    const id = 'PKG' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('packages')
      .insert([{
        id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.description
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description
    }
  }

  static async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    const { data, error } = await supabase
      .from('packages')
      .update({
        name: updates.name,
        price: updates.price,
        description: updates.description
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description
    }
  }

  static async deletePackage(id: string): Promise<void> {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Add-ons
  static async getAddOns(): Promise<AddOn[]> {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data?.map(addon => ({
      id: addon.id,
      name: addon.name,
      price: addon.price
    })) || []
  }

  static async createAddOn(addon: Omit<AddOn, 'id'>): Promise<AddOn> {
    const id = 'ADD' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('addons')
      .insert([{
        id,
        name: addon.name,
        price: addon.price
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: data.price
    }
  }

  static async updateAddOn(id: string, updates: Partial<AddOn>): Promise<AddOn> {
    const { data, error } = await supabase
      .from('addons')
      .update({
        name: updates.name,
        price: updates.price
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      price: data.price
    }
  }

  static async deleteAddOn(id: string): Promise<void> {
    const { error } = await supabase
      .from('addons')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Leads
  static async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return data?.map(lead => ({
      id: lead.id,
      name: lead.name,
      contactChannel: lead.contact_channel,
      location: lead.location,
      status: lead.status,
      date: lead.date,
      notes: lead.notes
    })) || []
  }

  static async createLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const id = 'LEAD' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        id,
        name: lead.name,
        contact_channel: lead.contactChannel,
        location: lead.location,
        status: lead.status,
        date: lead.date,
        notes: lead.notes
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      contactChannel: data.contact_channel,
      location: data.location,
      status: data.status,
      date: data.date,
      notes: data.notes
    }
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({
        name: updates.name,
        contact_channel: updates.contactChannel,
        location: updates.location,
        status: updates.status,
        date: updates.date,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      contactChannel: data.contact_channel,
      location: data.location,
      status: data.status,
      date: data.date,
      notes: data.notes
    }
  }

  static async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Profile
  static async getProfile(): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 'main_profile')
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows found
      throw error
    }
    
    return {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      companyName: data.company_name,
      website: data.website,
      address: data.address,
      bankAccount: data.bank_account,
      bio: data.bio,
      incomeCategories: data.income_categories,
      expenseCategories: data.expense_categories,
      projectTypes: data.project_types,
      eventTypes: data.event_types,
      notificationSettings: data.notification_settings,
      securitySettings: data.security_settings
    }
  }

  static async updateProfile(profile: Profile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profile')
      .upsert([{
        id: 'main_profile',
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        company_name: profile.companyName,
        website: profile.website,
        address: profile.address,
        bank_account: profile.bankAccount,
        bio: profile.bio,
        income_categories: profile.incomeCategories,
        expense_categories: profile.expenseCategories,
        project_types: profile.projectTypes,
        event_types: profile.eventTypes,
        notification_settings: profile.notificationSettings,
        security_settings: profile.securitySettings
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      companyName: data.company_name,
      website: data.website,
      address: data.address,
      bankAccount: data.bank_account,
      bio: data.bio,
      incomeCategories: data.income_categories,
      expenseCategories: data.expense_categories,
      projectTypes: data.project_types,
      eventTypes: data.event_types,
      notificationSettings: data.notification_settings,
      securitySettings: data.security_settings
    }
  }

  // Team Project Payments
  static async getTeamProjectPayments(): Promise<TeamProjectPayment[]> {
    const { data, error } = await supabase
      .from('team_project_payments')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return data?.map(payment => ({
      id: payment.id,
      projectId: payment.project_id,
      teamMemberName: payment.team_member_name,
      teamMemberId: payment.team_member_id,
      date: payment.date,
      status: payment.status,
      fee: payment.fee,
      reward: payment.reward
    })) || []
  }

  static async createTeamProjectPayment(payment: Omit<TeamProjectPayment, 'id'>): Promise<TeamProjectPayment> {
    const id = 'TPP-' + Date.now()
    
    const { data, error } = await supabase
      .from('team_project_payments')
      .insert([{
        id,
        project_id: payment.projectId,
        team_member_name: payment.teamMemberName,
        team_member_id: payment.teamMemberId,
        date: payment.date,
        status: payment.status,
        fee: payment.fee,
        reward: payment.reward
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      projectId: data.project_id,
      teamMemberName: data.team_member_name,
      teamMemberId: data.team_member_id,
      date: data.date,
      status: data.status,
      fee: data.fee,
      reward: data.reward
    }
  }

  static async updateTeamProjectPayment(id: string, updates: Partial<TeamProjectPayment>): Promise<TeamProjectPayment> {
    const { data, error } = await supabase
      .from('team_project_payments')
      .update({
        project_id: updates.projectId,
        team_member_name: updates.teamMemberName,
        team_member_id: updates.teamMemberId,
        date: updates.date,
        status: updates.status,
        fee: updates.fee,
        reward: updates.reward
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      projectId: data.project_id,
      teamMemberName: data.team_member_name,
      teamMemberId: data.team_member_id,
      date: data.date,
      status: data.status,
      fee: data.fee,
      reward: data.reward
    }
  }

  static async deleteTeamProjectPayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_project_payments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Team Payment Records
  static async getTeamPaymentRecords(): Promise<TeamPaymentRecord[]> {
    const { data, error } = await supabase
      .from('team_payment_records')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return data?.map(record => ({
      id: record.id,
      recordNumber: record.record_number,
      teamMemberId: record.team_member_id,
      date: record.date,
      projectPaymentIds: record.project_payment_ids,
      totalAmount: record.total_amount
    })) || []
  }

  static async createTeamPaymentRecord(record: Omit<TeamPaymentRecord, 'id'>): Promise<TeamPaymentRecord> {
    const id = 'TPR' + Date.now().toString().slice(-6)
    
    const { data, error } = await supabase
      .from('team_payment_records')
      .insert([{
        id,
        record_number: record.recordNumber,
        team_member_id: record.teamMemberId,
        date: record.date,
        project_payment_ids: record.projectPaymentIds,
        total_amount: record.totalAmount
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      recordNumber: data.record_number,
      teamMemberId: data.team_member_id,
      date: data.date,
      projectPaymentIds: data.project_payment_ids,
      totalAmount: data.total_amount
    }
  }

  static async updateTeamPaymentRecord(id: string, updates: Partial<TeamPaymentRecord>): Promise<TeamPaymentRecord> {
    const { data, error } = await supabase
      .from('team_payment_records')
      .update({
        record_number: updates.recordNumber,
        team_member_id: updates.teamMemberId,
        date: updates.date,
        project_payment_ids: updates.projectPaymentIds,
        total_amount: updates.totalAmount
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      recordNumber: data.record_number,
      teamMemberId: data.team_member_id,
      date: data.date,
      projectPaymentIds: data.project_payment_ids,
      totalAmount: data.total_amount
    }
  }

  static async deleteTeamPaymentRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_payment_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Reward Ledger Entries
  static async getRewardLedgerEntries(): Promise<RewardLedgerEntry[]> {
    const { data, error } = await supabase
      .from('reward_ledger_entries')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return data?.map(entry => ({
      id: entry.id,
      teamMemberId: entry.team_member_id,
      date: entry.date,
      description: entry.description,
      amount: entry.amount,
      projectId: entry.project_id
    })) || []
  }

  static async createRewardLedgerEntry(entry: Omit<RewardLedgerEntry, 'id'>): Promise<RewardLedgerEntry> {
    const id = 'RLE-' + Date.now()
    
    const { data, error } = await supabase
      .from('reward_ledger_entries')
      .insert([{
        id,
        team_member_id: entry.teamMemberId,
        date: entry.date,
        description: entry.description,
        amount: entry.amount,
        project_id: entry.projectId
      }])
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      teamMemberId: data.team_member_id,
      date: data.date,
      description: data.description,
      amount: data.amount,
      projectId: data.project_id
    }
  }

  static async updateRewardLedgerEntry(id: string, updates: Partial<RewardLedgerEntry>): Promise<RewardLedgerEntry> {
    const { data, error } = await supabase
      .from('reward_ledger_entries')
      .update({
        team_member_id: updates.teamMemberId,
        date: updates.date,
        description: updates.description,
        amount: updates.amount,
        project_id: updates.projectId
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      teamMemberId: data.team_member_id,
      date: data.date,
      description: data.description,
      amount: data.amount,
      projectId: data.project_id
    }
  }

  static async deleteRewardLedgerEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('reward_ledger_entries')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
