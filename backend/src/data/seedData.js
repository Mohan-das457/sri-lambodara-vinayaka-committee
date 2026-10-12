// Seed data for Sri Lambodara Vinayaka Committee
const bcrypt = require('bcryptjs');

function getSeedData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPassHash = bcrypt.hashSync('admin123', salt);
  const treasurerPassHash = bcrypt.hashSync('treasurer123', salt);
  const secretaryPassHash = bcrypt.hashSync('secretary123', salt);
  const memberPassHash = bcrypt.hashSync('member123', salt);

  const members = [
    {
      id: 1,
      member_code: 'SLV-001',
      full_name: 'K. Mohan Das',
      full_name_te: 'కె. మోహన్ దాస్',
      phone: '9848012345',
      email: 'mohandas@slvcommittee.org',
      address: 'Plot No. 12, Ganesh Nagar, Temple Street',
      designation: 'President',
      designation_te: 'అధ్యక్షులు',
      join_date: '2023-01-15',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 2,
      member_code: 'SLV-002',
      full_name: 'V. Sreenivasulu',
      full_name_te: 'వి. శ్రీనివాసులు',
      phone: '9848023456',
      email: 'sreenivasulu@slvcommittee.org',
      address: 'Door 4/88, Brahmin Street',
      designation: 'Treasurer',
      designation_te: 'కోశాధికారి',
      join_date: '2023-01-15',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 3,
      member_code: 'SLV-003',
      full_name: 'R. Venkateswarlu',
      full_name_te: 'ఆర్. వెంకటేశ్వర్లు',
      phone: '9848034567',
      email: 'venkatesh@slvcommittee.org',
      address: 'H.No 18-2-41, Vinayaka Colony',
      designation: 'Secretary',
      designation_te: 'కార్యదర్శి',
      join_date: '2023-01-15',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 4,
      member_code: 'SLV-004',
      full_name: 'P. Ramakrishna Rao',
      full_name_te: 'పి. రామకృష్ణారావు',
      phone: '9848045678',
      email: 'ramakrishna@slvcommittee.org',
      address: '7th Cross, RTC Colony',
      designation: 'Vice President',
      designation_te: 'ఉపాధ్యక్షులు',
      join_date: '2023-02-01',
      status: 'active',
      created_at: '2023-02-01T10:00:00.000Z'
    },
    {
      id: 5,
      member_code: 'SLV-005',
      full_name: 'B. Narayana Swamy',
      full_name_te: 'బి. నారాయణ స్వామి',
      phone: '9848056789',
      email: 'narayana@slvcommittee.org',
      address: '3/102, Main Bazaar',
      designation: 'Executive Member',
      designation_te: 'కార్యవర్గ సభ్యుడు',
      join_date: '2023-03-10',
      status: 'active',
      created_at: '2023-03-10T10:00:00.000Z'
    },
    {
      id: 6,
      member_code: 'SLV-006',
      full_name: 'T. Subrahmanyam',
      full_name_te: 'టి. సుబ్రహ్మణ్యం',
      phone: '9848067890',
      email: 'subrahmanyam@slvcommittee.org',
      address: 'Near Old Shiva Temple',
      designation: 'Member',
      designation_te: 'సభ్యుడు',
      join_date: '2023-04-12',
      status: 'active',
      created_at: '2023-04-12T10:00:00.000Z'
    },
    {
      id: 7,
      member_code: 'SLV-007',
      full_name: 'G. Chandrasekhar',
      full_name_te: 'జి. చంద్రశేఖర్',
      phone: '9848078901',
      email: 'chandra@slvcommittee.org',
      address: 'Plot 29, Teachers Colony',
      designation: 'Member',
      designation_te: 'సభ్యుడు',
      join_date: '2023-05-20',
      status: 'active',
      created_at: '2023-05-20T10:00:00.000Z'
    },
    {
      id: 8,
      member_code: 'SLV-008',
      full_name: 'M. Anjaneyulu',
      full_name_te: 'ఎం. ఆంజనేయులు',
      phone: '9848089012',
      email: 'anjaneyulu@slvcommittee.org',
      address: 'Ward 5, Railway Station Road',
      designation: 'Member',
      designation_te: 'సభ్యుడు',
      join_date: '2023-06-15',
      status: 'active',
      created_at: '2023-06-15T10:00:00.000Z'
    }
  ];

  const users = [
    {
      id: 1,
      member_id: 1,
      username: 'admin',
      password_hash: adminPassHash,
      role: 'admin',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 2,
      member_id: 2,
      username: 'treasurer',
      password_hash: treasurerPassHash,
      role: 'treasurer',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 3,
      member_id: 3,
      username: 'secretary',
      password_hash: secretaryPassHash,
      role: 'secretary',
      status: 'active',
      created_at: '2023-01-15T10:00:00.000Z'
    },
    {
      id: 4,
      member_id: 6,
      username: 'member',
      password_hash: memberPassHash,
      role: 'member',
      status: 'active',
      created_at: '2023-04-12T10:00:00.000Z'
    }
  ];

  const funds = [
    {
      id: 1,
      fund_code: 'general',
      name: 'General Temple Fund',
      name_te: 'సాధారణ ఆలయ నిధి',
      balance: 148500.00,
      description: 'Monthly member subscriptions, regular temple maintenance, nitya pooja and electricity',
      created_at: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      fund_code: 'festival',
      name: 'Ganesh Utsav & Festival Fund',
      name_te: 'గణేష్ ఉత్సవ & పండుగ నిధి',
      balance: 284000.00,
      description: 'Special donations for Vinayaka Chavithi, Annadanam, Mandapam, decoration and procession',
      created_at: '2023-01-01T00:00:00.000Z'
    }
  ];

  const monthly_dues = [
    // Current month dues
    { id: 1, member_id: 1, due_month: 10, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 2, member_id: 2, due_month: 10, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 3, member_id: 3, due_month: 10, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 4, member_id: 4, due_month: 10, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 5, member_id: 5, due_month: 10, due_year: 2026, amount: 500, paid_amount: 0, status: 'pending', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 6, member_id: 6, due_month: 10, due_year: 2026, amount: 500, paid_amount: 0, status: 'pending', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 7, member_id: 7, due_month: 10, due_year: 2026, amount: 500, paid_amount: 250, status: 'partial', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    { id: 8, member_id: 8, due_month: 10, due_year: 2026, amount: 500, paid_amount: 0, status: 'pending', due_date: '2026-10-15', created_at: '2026-10-01T00:00:00.000Z' },
    // Previous month (September)
    { id: 9, member_id: 1, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 10, member_id: 2, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 11, member_id: 3, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 12, member_id: 4, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 13, member_id: 5, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 14, member_id: 6, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 15, member_id: 7, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' },
    { id: 16, member_id: 8, due_month: 9, due_year: 2026, amount: 500, paid_amount: 500, status: 'paid', due_date: '2026-09-15', created_at: '2026-09-01T00:00:00.000Z' }
  ];

  const payments = [
    {
      id: 1,
      receipt_number: 'SLV-REC-2026-1001',
      member_id: 1,
      due_id: 1,
      fund_code: 'general',
      amount: 500.00,
      payment_mode: 'UPI',
      upi_ref: 'UPI/261012398412/HDFC',
      payment_date: '2026-10-05',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'October 2026 monthly subscription paid via PhonePe',
      created_at: '2026-10-05T11:20:00.000Z'
    },
    {
      id: 2,
      receipt_number: 'SLV-REC-2026-1002',
      member_id: 2,
      due_id: 2,
      fund_code: 'general',
      amount: 500.00,
      payment_mode: 'Cash',
      upi_ref: null,
      payment_date: '2026-10-06',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'October 2026 contribution in cash',
      created_at: '2026-10-06T18:15:00.000Z'
    },
    {
      id: 3,
      receipt_number: 'SLV-REC-2026-1003',
      member_id: 3,
      due_id: 3,
      fund_code: 'general',
      amount: 500.00,
      payment_mode: 'UPI',
      upi_ref: 'UPI/261012487631/SBI',
      payment_date: '2026-10-07',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'October 2026 monthly contribution via GPay',
      created_at: '2026-10-07T14:40:00.000Z'
    },
    {
      id: 4,
      receipt_number: 'SLV-REC-2026-1004',
      member_id: 4,
      due_id: 4,
      fund_code: 'general',
      amount: 500.00,
      payment_mode: 'UPI',
      upi_ref: 'UPI/261012781290/ICICI',
      payment_date: '2026-10-08',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'Monthly contribution transfer',
      created_at: '2026-10-08T09:30:00.000Z'
    },
    {
      id: 5,
      receipt_number: 'SLV-REC-2026-1005',
      member_id: 7,
      due_id: 7,
      fund_code: 'general',
      amount: 250.00,
      payment_mode: 'Cash',
      upi_ref: null,
      payment_date: '2026-10-10',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'Partial payment for October 2026',
      created_at: '2026-10-10T17:00:00.000Z'
    }
  ];

  const expenses = [
    {
      id: 1,
      voucher_number: 'SLV-EXP-2026-091',
      fund_code: 'general',
      title: 'Temple Daily Pooja & Flower Supplies',
      title_te: 'ఆలయ నిత్య పూజ సామగ్రి & పూల ఖర్చులు',
      category: 'Pooja Items',
      amount: 4500.00,
      expense_date: '2026-10-02',
      paid_to: 'Sri Sai Pooja Stores',
      approved_by: 'K. Mohan Das (President)',
      bill_receipt_ref: 'BILL-8821',
      remarks: 'Camphor, incense, oil, coconuts and garlands for monthly poojas',
      created_at: '2026-10-02T16:00:00.000Z'
    },
    {
      id: 2,
      voucher_number: 'SLV-EXP-2026-092',
      fund_code: 'general',
      title: 'Temple Sanctum Electricity & Inverter Battery Maintenance',
      title_te: 'గర్భగుడి విద్యుత్ బిల్లు & ఇన్వర్టర్ నిర్వహణ',
      category: 'Electricity',
      amount: 2850.00,
      expense_date: '2026-10-04',
      paid_to: 'APSPDCL / Sri Balaji Electricals',
      approved_by: 'V. Sreenivasulu (Treasurer)',
      bill_receipt_ref: 'ELEC-OCT-2026',
      remarks: 'Monthly electricity bill and water pump servicing',
      created_at: '2026-10-04T12:00:00.000Z'
    },
    {
      id: 3,
      voucher_number: 'SLV-EXP-2026-093',
      fund_code: 'festival',
      title: 'Advance for Eco-Friendly Clay Vinayaka Idol (9 Feet)',
      title_te: 'పర్యావరణ హిత మట్టి వినాయక విగ్రహం అడ్వాన్స్ (9 అడుగులు)',
      category: 'Ganesh Idol',
      amount: 25000.00,
      expense_date: '2026-09-18',
      paid_to: 'Sri Vigneshwara Murtikara Artists, Dhoolpet',
      approved_by: 'Committee General Body',
      bill_receipt_ref: 'IDOL-ADV-014',
      remarks: 'Clay idol booking advance for upcoming festival celebration',
      created_at: '2026-09-18T10:00:00.000Z'
    },
    {
      id: 4,
      voucher_number: 'SLV-EXP-2026-094',
      fund_code: 'general',
      title: 'Prasadam Distribution (Sankashtahara Chaturthi)',
      title_te: 'సంకష్టహర చతుర్థి ప్రసాద వితరణ ఖర్చు',
      category: 'Prasad',
      amount: 6200.00,
      expense_date: '2026-09-29',
      paid_to: 'Anand Caterers & Grocery Store',
      approved_by: 'R. Venkateswarlu (Secretary)',
      bill_receipt_ref: 'PRASAD-991',
      remarks: 'Sundal, modak, sweet pongal prepared for 400 devotees',
      created_at: '2026-09-29T21:00:00.000Z'
    }
  ];

  const other_income = [
    {
      id: 1,
      receipt_number: 'SLV-DON-2026-041',
      fund_code: 'festival',
      donor_name: 'Dr. K. S. Murthy & Family',
      donor_phone: '9440112233',
      amount: 50000.00,
      income_date: '2026-09-20',
      payment_mode: 'UPI',
      upi_ref: 'UPI/260920194821/SBI',
      purpose: 'Festival Annadanam Sponsorship (మహా అన్నదానం దాత)',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'Grand annadanam donation for Ganesh Utsav Day 3',
      created_at: '2026-09-20T11:00:00.000Z'
    },
    {
      id: 2,
      receipt_number: 'SLV-DON-2026-042',
      fund_code: 'festival',
      donor_name: 'Sri Lakshmi Textiles (Prop. G. Ramesh)',
      donor_phone: '9848123999',
      amount: 25000.00,
      income_date: '2026-09-25',
      payment_mode: 'Cash',
      upi_ref: null,
      purpose: 'Pandal & Floral Decoration Sponsorship (మండప అలంకరణ)',
      received_by: 'K. Mohan Das (President)',
      remarks: 'Festival stage and flower garland sponsorship',
      created_at: '2026-09-25T17:30:00.000Z'
    },
    {
      id: 3,
      receipt_number: 'SLV-DON-2026-043',
      fund_code: 'general',
      donor_name: 'Anonymous Devotee (భక్తుడు)',
      donor_phone: '9988776655',
      amount: 11000.00,
      income_date: '2026-10-01',
      payment_mode: 'Cash',
      upi_ref: null,
      purpose: 'Temple Hundi Special Offering (హుండీ కానుక)',
      received_by: 'V. Sreenivasulu (Treasurer)',
      remarks: 'Monthly Hundi counting special dedication',
      created_at: '2026-10-01T15:00:00.000Z'
    }
  ];

  const meetings = [
    {
      id: 1,
      title: 'October 2026 Regular Monthly Committee Meeting',
      title_te: 'అక్టోబర్ 2026 నెలవారీ కమిటీ సమావేశం',
      meeting_date: '2026-10-15',
      meeting_time: '19:30:00',
      venue: 'Sri Lambodara Vinayaka Temple Sabha Hall',
      venue_te: 'శ్రీ లంబోదర వినాయక ఆలయ సభా ప్రాంగణం',
      agenda: '1. Review of September collections and expenditures.\n2. Review of monthly dues pending list.\n3. Annual Temple Renovation & Deepavali Pooja schedule.\n4. Auditing of festival fund balances and bank fixed deposits.',
      agenda_te: '1. సెప్టెంబర్ నెల ఆదాయ-వ్యయాల సమీక్ష.\n2. బకాయి ఉన్న సభ్యుల చందాల వసూలు కార్యాచరణ.\n3. ఆలయ మరమ్మతులు & దీపావళి విశేష పూజల ప్రణాళిక.\n4. ఉత్సవ నిధి మరియు బ్యాంక్ డిపాజిట్ల ఆడిట్ నివేదిక.',
      minutes: null,
      minutes_te: null,
      decisions: null,
      status: 'Scheduled',
      created_at: '2026-10-01T09:00:00.000Z'
    },
    {
      id: 2,
      title: 'September 2026 Monthly Committee Meeting',
      title_te: 'సెప్టెంబర్ 2026 నెలవారీ కమిటీ సమావేశం',
      meeting_date: '2026-09-15',
      meeting_time: '19:30:00',
      venue: 'Sri Lambodara Vinayaka Temple Sabha Hall',
      venue_te: 'శ్రీ లంబోదర వినాయక ఆలయ సభా ప్రాంగణం',
      agenda: '1. Review of Ganesh Utsav accounts and final bills.\n2. Appreciation of volunteers and donors.\n3. Monthly member contribution collection drive.\n4. Maintenance of sound system and CCTV cameras.',
      agenda_te: '1. గణేష్ ఉత్సవ లెక్కలు మరియు ఫైనల్ బిల్లుల పరిశీలన.\n2. దాతలు మరియు వాలంటీర్లకు అభినందనలు.\n3. నెలవారీ చందాల సేకరణ.\n4. ఆలయ సీసీ కెమెరాలు మరియు మైక్ సెట్ నిర్వహణ.',
      minutes: 'Meeting started at 7:35 PM presided by President K. Mohan Das. Treasurer presented the balance sheet. All members unanimously approved the festival expenses. Decided to install 2 additional CCTV cameras in the inner sanctum.',
      minutes_te: 'సాయంత్రం 7:35 గంటలకు అధ్యక్షులు శ్రీ కె. మోహన్ దాస్ గారి అధ్యక్షతన సమావేశం ప్రారంభమైనది. కోశాధికారి గారు ఆదాయ వ్యయాల పట్టికను ప్రవేశపెట్టారు. సభ్యులందరూ ఏకగ్రీవంగా ఆమోదించారు. గర్భగుడి వద్ద అదనంగా 2 సీసీ కెమెరాలు ఏర్పాటు చేయాలని తీర్మానించారు.',
      decisions: '1. Approved festival audited accounts.\n2. Sanctioned Rs. 15,000 for CCTV camera upgrade.\n3. Reminded all members to clear pending dues before 15th.',
      status: 'Completed',
      created_at: '2026-09-01T09:00:00.000Z'
    }
  ];

  const meeting_attendance = [
    { id: 1, meeting_id: 2, member_id: 1, status: 'Present', notes: 'Chaired the meeting' },
    { id: 2, meeting_id: 2, member_id: 2, status: 'Present', notes: 'Presented accounts' },
    { id: 3, meeting_id: 2, member_id: 3, status: 'Present', notes: 'Recorded minutes' },
    { id: 4, meeting_id: 2, member_id: 4, status: 'Present', notes: '' },
    { id: 5, meeting_id: 2, member_id: 5, status: 'Present', notes: '' },
    { id: 6, meeting_id: 2, member_id: 6, status: 'Present', notes: '' },
    { id: 7, meeting_id: 2, member_id: 7, status: 'Excused', notes: 'Out of station' },
    { id: 8, meeting_id: 2, member_id: 8, status: 'Absent', notes: '' },
    // Scheduled meeting 1 placeholder
    { id: 9, meeting_id: 1, member_id: 1, status: 'Present', notes: '' },
    { id: 10, meeting_id: 1, member_id: 2, status: 'Present', notes: '' },
    { id: 11, meeting_id: 1, member_id: 3, status: 'Present', notes: '' }
  ];

  const announcements = [
    {
      id: 1,
      title: 'Monthly Committee Meeting on 15th October at 7:30 PM',
      title_te: 'ఈ నెల 15వ తేదీ రాత్రి 7:30 గంటలకు కమిటీ సాధారణ సమావేశం',
      message: 'All committee members are cordially requested to attend the monthly committee meeting on Thursday, October 15th at 7:30 PM sharp at the temple hall. Important decisions on Deepavali special poojas and accounts will be finalized.',
      message_te: 'కమిటీ సభ్యులందరికీ నమస్కారం. అక్టోబర్ 15వ తేదీ గురువారం రాత్రి 7:30 గంటలకు ఆలయ ప్రాంగణంలో నెలవారీ సమావేశం జరుగును. దీపావళి విశేష పూజలు మరియు లెక్కల సమీక్ష జరుగును కావున సభ్యులందరూ తప్పక హాజరుకావలసిందిగా కోరుచున్నాము.',
      category: 'Meeting',
      priority: 'High',
      is_active: true,
      created_at: '2026-10-10T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'October Monthly Contribution Reminder (₹500)',
      title_te: 'అక్టోబర్ నెల చందా (₹500) చెల్లింపు రిమైండర్',
      message: 'Kindly remit your monthly subscription of ₹500 for October before 15th via Cash or UPI to ensure smooth maintenance of temple activities. Digital receipts are generated instantly upon confirmation.',
      message_te: 'గౌరవ సభ్యులు అక్టోబర్ నెలకు సంబంధించిన ₹500 చందాను ఈ నెల 15వ తేదీలోగా నగదు లేదా UPI ద్వారా కోశాధికారి గారికి చెల్లించి డిజిటల్ రసీదు పొందగలరు.',
      category: 'Dues',
      priority: 'Normal',
      is_active: true,
      created_at: '2026-10-08T09:00:00.000Z'
    },
    {
      id: 3,
      title: 'Ganesh Utsav Financial Report Released',
      title_te: 'గణేష్ ఉత్సవాల ఆదాయ-వ్యయ నివేదిక విడుదలైనది',
      message: 'The audited financial statement for Vinayaka Chavithi celebrations has been published with total transparent accounting. Total festival collections: ₹3,59,000 | Total expenses: ₹75,000 | Festival Reserve: ₹2,84,000.',
      message_te: 'గత వినాయక చవితి ఉత్సవాలకు సంబంధించి పూర్తి పారదర్శకమైన ఆడిట్ నివేదిక విడుదల చేయబడింది. మొత్తం వసూలైన విరాళాలు: ₹3,59,000, ఖర్చులు: ₹75,000, మిగులు నిధి: ₹2,84,000. భక్తులందరికీ కమిటీ కృతజ్ఞతలు.',
      category: 'Festival',
      priority: 'Normal',
      is_active: true,
      created_at: '2026-10-01T08:00:00.000Z'
    }
  ];

  const documents = [
    {
      id: 1,
      title: 'Temple Committee Bylaws & Constitution 2023',
      category: 'Government Registration',
      file_path: '/documents/bylaws_2023.pdf',
      file_size: 2450000,
      uploaded_by: 'K. Mohan Das (President)',
      created_at: '2023-01-20T10:00:00.000Z'
    },
    {
      id: 2,
      title: 'Vinayaka Chavithi 2026 Audited Balance Sheet',
      category: 'Financial Statement',
      file_path: '/documents/utsav_accounts_2026.pdf',
      file_size: 1120000,
      uploaded_by: 'V. Sreenivasulu (Treasurer)',
      created_at: '2026-10-01T14:30:00.000Z'
    }
  ];

  return {
    members,
    users,
    funds,
    monthly_dues,
    payments,
    expenses,
    other_income,
    meetings,
    meeting_attendance,
    announcements,
    documents
  };
}

module.exports = { getSeedData };
