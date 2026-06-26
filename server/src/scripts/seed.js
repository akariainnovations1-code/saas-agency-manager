const bcrypt = require('bcryptjs');
const { sequelize, User, Client, Project, Task, Sale, Lead, Document, Activity, Subscription, Proposal, Expense, Notification, Integration } = require('../models');

const seed = async () => {
  try {
    console.log('🔄 Seeding database with realistic Agency operations data...');

    // Force sync the database to reset tables
    await sequelize.sync({ force: true });

    // 1. Seed Users (passwords hashed using bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const secureHashedPassword = await bcrypt.hash('7856853955@Abcdef', salt);

    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@agency.com',
      password: hashedPassword,
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'
    });

    const manager = await User.create({
      name: 'Michael Scott',
      email: 'manager@agency.com',
      password: hashedPassword,
      role: 'Manager',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop'
    });

    const employee = await User.create({
      name: 'Jim Halpert',
      email: 'employee@agency.com',
      password: hashedPassword,
      role: 'Employee',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop'
    });

    const superAdminNew = await User.create({
      name: 'Alok Kumar (Admin)',
      email: 'alokkumar7856853955@gmail.com',
      password: secureHashedPassword,
      role: 'Admin',
      mustChangePassword: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop'
    });

    const managerNew = await User.create({
      name: 'Aman Kumar (Manager)',
      email: 'amankumarajad78568539@gmail.com',
      password: secureHashedPassword,
      role: 'Manager',
      mustChangePassword: false,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'
    });

    console.log('✅ Users Seeded.');

    // 2. Seed Clients
    const client1 = await Client.create({
      name: 'Tony Stark',
      company: 'Stark Industries',
      email: 'tony@stark.com',
      phone: '+1 (555) 300-3000',
      country: 'United States',
      status: 'Active',
      notes: JSON.stringify([
        { date: '2026-05-10', sender: 'Sarah Connor', text: 'Contract signed for CRM software development.' },
        { date: '2026-05-15', sender: 'Michael Scott', text: 'Onboarding meeting completed. Gathered specifications.' }
      ]),
      accountType: 'Business',
      whatsappNumber: '+1 (555) 300-3000',
      subscriptionName: 'Enterprise Core Plus',
      numberOfId: 15,
      loginEmail: 'tony@stark.com',
      loginPassword: 'jarvispassword99',
      issueDate: '2026-05-01',
      expiryDate: '2027-05-01',
      planDuration: '12 Months',
      costPaidToDealer: 450.00,
      paymentFromCustomer: 2500.00,
      dealerName: 'ResellerPro USA'
    });

    const client2 = await Client.create({
      name: 'Bruce Wayne',
      company: 'Wayne Enterprises',
      email: 'bruce@wayne.com',
      phone: '+1 (555) 999-8888',
      country: 'United States',
      status: 'Active',
      notes: JSON.stringify([
        { date: '2026-04-20', sender: 'Sarah Connor', text: 'Renewed master services agreement for 12 months.' }
      ]),
      accountType: 'Enterprise',
      whatsappNumber: '+1 (555) 999-8888',
      subscriptionName: 'Vanguard Security Pro',
      numberOfId: 50,
      loginEmail: 'batman@wayne.com',
      loginPassword: 'alfredpassword123',
      issueDate: '2026-04-20',
      expiryDate: '2027-04-20',
      planDuration: '12 Months',
      costPaidToDealer: 1200.00,
      paymentFromCustomer: 8500.00,
      dealerName: 'Gotham Global Ltd'
    });

    const client3 = await Client.create({
      name: 'Hank Scorpio',
      company: 'Globex Corporation',
      email: 'hank@globex.com',
      phone: '+1 (555) 666-1234',
      country: 'Canada',
      status: 'Prospect',
      notes: JSON.stringify([
        { date: '2026-05-28', sender: 'Michael Scott', text: 'Sent proposal for SEO and Social Media campaigns.' }
      ]),
      accountType: 'Business',
      whatsappNumber: '+1 (555) 666-1234',
      subscriptionName: 'Globex SEO Ultimate',
      numberOfId: 5,
      loginEmail: 'hank@globex.com',
      loginPassword: 'laserpassword7',
      issueDate: '2026-05-28',
      expiryDate: '2026-11-28',
      planDuration: '6 Months',
      costPaidToDealer: 150.00,
      paymentFromCustomer: 1200.00,
      dealerName: 'Canadian Tech Brokers'
    });

    const client4 = await Client.create({
      name: 'Arthur Dent',
      company: 'Megadodo Publications',
      email: 'arthur@hitchhiker.org',
      phone: '+44 20 7946 0958',
      country: 'United Kingdom',
      status: 'Lead',
      notes: JSON.stringify([
        { date: '2026-05-29', sender: 'Jim Halpert', text: 'Expressed interest via website form.' }
      ]),
      accountType: 'Personal',
      whatsappNumber: '+44 20 7946 0958',
      subscriptionName: 'Galaxy Guide Basic',
      numberOfId: 1,
      loginEmail: 'arthur@hitchhiker.org',
      loginPassword: 'dontpanicpassword42',
      issueDate: '2026-05-29',
      expiryDate: '2026-06-29',
      planDuration: '1 Month',
      costPaidToDealer: 10.00,
      paymentFromCustomer: 45.00,
      dealerName: 'Megadodo Distributors'
    });

    console.log('✅ Clients Seeded.');

    // 3. Seed Projects
    const project1 = await Project.create({
      name: 'Ark Reactor Website Rebrand',
      description: 'Complete overhaul of Stark Industries UI and SEO implementation for their energy systems portal.',
      status: 'In Progress',
      progress: 65,
      startDate: '2026-05-01',
      endDate: '2026-07-15',
      budget: 85000.00,
      clientId: client1.id,
      milestones: JSON.stringify([
        { id: '1', title: 'Figma mockups approved', completed: true },
        { id: '2', title: 'Frontend implementation completed', completed: true },
        { id: '3', title: 'Backend integration', completed: false },
        { id: '4', title: 'SEO audit and deployment', completed: false }
      ])
    });

    const project2 = await Project.create({
      name: 'Batcave Security Operations CRM',
      description: 'Secure, high-availability customer portal and tracking application for corporate data integrity.',
      status: 'In Progress',
      progress: 40,
      startDate: '2026-05-10',
      endDate: '2026-08-30',
      budget: 150000.00,
      clientId: client2.id,
      milestones: JSON.stringify([
        { id: '1', title: 'Database schema architecture', completed: true },
        { id: '2', title: 'API deployment', completed: false },
        { id: '3', title: 'Security audit', completed: false }
      ])
    });

    const project3 = await Project.create({
      name: 'Globex Cyber-Defense Campaign',
      description: 'Planning stage for high-end digital PR and cyberdefense campaign mapping visual dashboards.',
      status: 'Planning',
      progress: 10,
      startDate: '2026-06-01',
      endDate: '2026-09-30',
      budget: 45000.00,
      clientId: client3.id,
      milestones: JSON.stringify([
        { id: '1', title: 'Stakeholder discovery meetings', completed: true },
        { id: '2', title: 'Finalize campaign budget', completed: false }
      ])
    });

    console.log('✅ Projects Seeded.');

    // 4. Seed Tasks
    const task1 = await Task.create({
      name: 'Design Homepage Figma layouts',
      description: 'Design premium homepage layout supporting dynamic theme switcher.',
      priority: 'High',
      status: 'Done',
      dueDate: '2026-05-20',
      projectId: project1.id,
      assignedTo: employee.id,
      comments: JSON.stringify([
        { user: 'Sarah Connor', date: '2026-05-18', text: 'This looks fantastic! Let’s proceed to code.' }
      ])
    });

    const task2 = await Task.create({
      name: 'Develop responsive frontend views',
      description: 'Code CSS layouts, dark/light styling, and navbar grids.',
      priority: 'High',
      status: 'In Progress',
      dueDate: '2026-06-10',
      projectId: project1.id,
      assignedTo: employee.id,
      comments: '[]'
    });

    const task3 = await Task.create({
      name: 'Configure PostgreSQL connector',
      description: 'Verify Sequelize settings and migration mappings for robust database transactions.',
      priority: 'Medium',
      status: 'Review',
      dueDate: '2026-06-05',
      projectId: project2.id,
      assignedTo: admin.id,
      comments: JSON.stringify([
        { user: 'Sarah Connor', date: '2026-05-28', text: 'Setup SQLite local config fallback successfully.' }
      ])
    });

    const task4 = await Task.create({
      name: 'Write security filters and sanitization',
      description: 'Implement secure login, authentication guards, and input filters.',
      priority: 'High',
      status: 'Todo',
      dueDate: '2026-06-15',
      projectId: project2.id,
      assignedTo: manager.id,
      comments: '[]'
    });

    const task5 = await Task.create({
      name: 'Write SEO marketing copy drafts',
      description: 'Prepare high-converting marketing copywriting templates.',
      priority: 'Low',
      status: 'Todo',
      dueDate: '2026-06-30',
      projectId: project3.id,
      assignedTo: employee.id,
      comments: '[]'
    });

    console.log('✅ Tasks Seeded.');

    // 5. Seed Sales & Invoices
    await Sale.create({
      invoiceNumber: '001',
      amount: 15000.00,
      status: 'Paid',
      issueDate: '2026-05-01',
      dueDate: '2026-05-15',
      clientId: client1.id,
      items: JSON.stringify([
        { description: 'Initial onboarding and Figma designs', qty: 1, rate: 10000.00, amount: 10000.00 },
        { description: 'Hosting setup & database provisioning', qty: 1, rate: 5000.00, amount: 5000.00 }
      ])
    });

    await Sale.create({
      invoiceNumber: '002',
      amount: 30000.00,
      status: 'Paid',
      issueDate: '2026-05-10',
      dueDate: '2026-05-24',
      clientId: client2.id,
      items: JSON.stringify([
        { description: 'Phase 1 CRM setup architecture', qty: 1, rate: 30000.00, amount: 30000.00 }
      ])
    });

    await Sale.create({
      invoiceNumber: '003',
      amount: 25000.00,
      status: 'Unpaid',
      issueDate: '2026-05-25',
      dueDate: '2026-06-10',
      clientId: client1.id,
      items: JSON.stringify([
        { description: 'Phase 2 UI development milestone', qty: 1, rate: 25000.00, amount: 25000.00 }
      ])
    });

    await Sale.create({
      invoiceNumber: '004',
      amount: 8500.00,
      status: 'Overdue',
      issueDate: '2026-04-15',
      dueDate: '2026-05-15',
      clientId: client3.id,
      items: JSON.stringify([
        { description: 'Consulting fees & campaign scoping', qty: 1, rate: 8500.00, amount: 8500.00 }
      ])
    });

    console.log('✅ Sales & Invoices Seeded.');

    // 6. Seed Leads
    await Lead.create({
      name: 'Clark Kent',
      company: 'Daily Planet',
      email: 'clark@dailyplanet.com',
      phone: '+1 (555) 777-6666',
      source: 'LinkedIn',
      status: 'Contacted',
      notes: 'Interested in digital subscription system integration.',
      followUpDate: '2026-06-02'
    });

    await Lead.create({
      name: 'Oliver Queen',
      company: 'Queen Industries',
      email: 'oliver@queen.com',
      phone: '+1 (555) 888-0000',
      source: 'Referral',
      status: 'New',
      notes: 'Referred by Bruce Wayne. Needs custom enterprise planning software.',
      followUpDate: '2026-06-03'
    });

    await Lead.create({
      name: 'Charles Xavier',
      company: 'Xavier Academy',
      email: 'professor@xavier.edu',
      phone: '+1 (555) 111-2222',
      source: 'Website',
      status: 'Qualified',
      notes: 'High-quality lead. Ready for pitch meeting on customized database portal.',
      followUpDate: '2026-06-01'
    });

    await Lead.create({
      name: 'Lex Luthor',
      company: 'LexCorp',
      email: 'lex@lexcorp.com',
      phone: '+1 (555) 666-6666',
      source: 'Cold Outreach',
      status: 'Lost',
      notes: 'Competitor acquired. Out of scope.',
      followUpDate: null
    });

    console.log('✅ Leads Seeded.');

    // 7. Seed Documents
    await Document.create({
      name: 'Stark_Industries_MSA.pdf',
      category: 'Client',
      fileUrl: '#mock-stark-msa',
      fileSize: '1.8 MB',
      clientId: client1.id,
      projectId: project1.id
    });

    await Document.create({
      name: 'Wayne_CRM_Architecture_v1.pdf',
      category: 'Project',
      fileUrl: '#mock-wayne-arch',
      fileSize: '4.5 MB',
      clientId: client2.id,
      projectId: project2.id
    });

    await Document.create({
      name: 'Globex_SEO_Campaign_Proposal.docx',
      category: 'General',
      fileUrl: '#mock-globex-proposal',
      fileSize: '820 KB',
      clientId: client3.id
    });

    console.log('✅ Documents Seeded.');

    // 9. Seed Subscriptions
    const sub1 = await Subscription.create({
      planName: 'Enterprise Growth Suite',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      price: 2500.00,
      status: 'Active',
      autoRenew: true,
      licenseKey: 'LIC-ENTERPRISE-STARK-99',
      clientId: client1.id
    });

    const sub2 = await Subscription.create({
      planName: 'Cloud Infrastructure License',
      startDate: '2025-05-15',
      endDate: '2026-05-15',
      price: 1200.00,
      status: 'Expired',
      autoRenew: false,
      licenseKey: 'LIC-CLOUD-WAYNE-08',
      clientId: client2.id
    });

    console.log('✅ Subscriptions Seeded.');

    // 10. Seed Proposals
    await Proposal.create({
      title: 'Globex Security Dashboard Integration',
      description: 'Design and deployment of cybersecurity compliance checklist interfaces, audit journals, and automated SMS alerts.',
      amount: 45000.00,
      status: 'Draft',
      validUntil: '2026-07-01',
      clientId: client3.id
    });

    await Proposal.create({
      title: 'Stark Energy Metrics App',
      description: 'Provisioning of interactive dashboard charts plotting real-time reactor metrics and historical yields.',
      amount: 68000.00,
      status: 'Approved',
      validUntil: '2026-06-15',
      signature: 'Sarah Connor e-sign base64-simulated',
      signedAt: '2026-05-28',
      signedBy: 'Sarah Connor',
      clientId: client1.id
    });

    console.log('✅ Proposals Seeded.');

    // 11. Seed Expenses
    await Expense.create({
      title: 'AWS Operations Cloud Cluster hosting',
      category: 'Software License',
      amount: 1450.00,
      date: '2026-05-01',
      vendor: 'Amazon Web Services',
      status: 'Paid'
    });

    await Expense.create({
      title: 'Freelance Figma Designer Payout',
      category: 'Vendor Payment',
      amount: 3200.00,
      date: '2026-05-15',
      vendor: 'Dribbble contractor',
      status: 'Paid'
    });

    await Expense.create({
      title: 'Office Co-working rent Q2',
      category: 'Rent & Utilities',
      amount: 8500.00,
      date: '2026-04-01',
      vendor: 'WeWork Office Space',
      status: 'Paid'
    });

    await Expense.create({
      title: 'SaaS Customer Portal API licensing',
      category: 'Software License',
      amount: 450.00,
      date: '2026-05-20',
      vendor: 'Twilio Services',
      status: 'Pending'
    });

    console.log('✅ Expenses Seeded.');

    // 12. Seed Notifications
    await Notification.create({
      type: 'Renewal',
      title: 'Subscription Expiring Soon',
      message: 'Stark Industries Enterprise Growth Suite subscription is due for renewal on 2026-12-31.',
      isRead: false,
      targetDate: '2026-12-31'
    });

    await Notification.create({
      type: 'Overdue',
      title: 'Outstanding Invoice Alert',
      message: 'Invoice 004 to Globex Corporation (₹8,500.00) is now overdue.',
      isRead: false,
      targetDate: '2026-05-15'
    });

    await Notification.create({
      type: 'Deadline',
      title: 'Upcoming Project Deadline',
      message: 'Milestone "Develop responsive frontend views" is due on 2026-06-10.',
      isRead: true,
      targetDate: '2026-06-10'
    });

    console.log('✅ Notifications Seeded.');

    // 13. Seed Integrations
    await Integration.create({
      serviceName: 'WhatsApp',
      apiKey: 'wh_key_live_99824021',
      status: 'Connected',
      lastSync: new Date()
    });

    await Integration.create({
      serviceName: 'Gmail',
      apiKey: 'gm_oauth_token_active_8829',
      status: 'Connected',
      lastSync: new Date()
    });

    await Integration.create({
      serviceName: 'Calendar',
      apiKey: 'cal_sync_active_382',
      status: 'Disconnected',
      lastSync: null
    });

    await Integration.create({
      serviceName: 'Meetings',
      apiKey: 'zoom_jwt_key_777',
      status: 'Disconnected',
      lastSync: null
    });

    await Integration.create({
      serviceName: 'ChatGPT',
      apiKey: '',
      status: 'Disconnected',
      lastSync: null
    });

    await Integration.create({
      serviceName: 'Gemini',
      apiKey: '',
      status: 'Disconnected',
      lastSync: null
    });

    console.log('✅ Integrations Seeded.');

    // 8. Seed Activities
    await Activity.create({
      type: 'CRM',
      action: 'Registered Client',
      details: 'Added Stark Industries into agency database.',
      userId: admin.id
    });

    await Activity.create({
      type: 'PROJECT',
      action: 'Initiated Project',
      details: 'Launched project "Batcave Security Operations CRM" with ₹1,50,000 budget.',
      userId: admin.id
    });

    await Activity.create({
      type: 'TASK',
      action: 'Completed Task',
      details: 'Jim completed "Design Homepage Figma layouts".',
      userId: employee.id
    });

    await Activity.create({
      type: 'SALE',
      action: 'Received Payment',
      details: 'Invoice 002 (₹30,000.00) paid by Wayne Enterprises.',
      userId: manager.id
    });

    await Activity.create({
      type: 'LEAD',
      action: 'Qualified Lead',
      details: 'Xavier Academy lead qualified by Sarah Connor.',
      userId: admin.id
    });

    console.log('✅ Activities Seeded.');
    console.log('⭐️ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    process.exit(1);
  }
};

// If run directly via node CLI
if (require.main === module) {
  seed();
}

module.exports = seed;
