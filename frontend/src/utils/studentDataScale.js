// High-Volume Dataset Generator (Scaling to 800+ Student Registrations per Event)

const FIRST_NAMES = [
  'Emma', 'John', 'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Henry',
  'Isabella', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel',
  'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier', 'Yash', 'Zoe', 'Aarav', 'Ananya',
  'Rohan', 'Priya', 'Karan', 'Sneha', 'Vikram', 'Pooja', 'Rahul', 'Neha', 'Aditya', 'Divya',
  'Dev', 'Tanvi', 'Aryan', 'Ishita', 'Arjun', 'Riya', 'Manish', 'Simran', 'Varun', 'Kriti'
];

const LAST_NAMES = [
  'Wilson', 'Doe', 'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Taylor', 'Anderson', 'Thomas',
  'Patel', 'Sharma', 'Shah', 'Verma', 'Gupta', 'Mehta', 'Joshi', 'Chauhan', 'Deshmukh', 'Kulkarni',
  'Reddy', 'Nair', 'Iyer', 'Menon', 'Singh', 'Kapoor', 'Malhotra', 'Bhatia', 'Saxena', 'Pandey'
];

const DEPARTMENTS = ['BCA', 'BSc CA & IT', 'B.Tech CSE', 'Data Science', 'Information Tech'];
const EVENTS = [
  { id: 'EVT-1004', name: 'Code Carnival 2.0', venue: 'Seminar Hall', date: '2026-07-25' },
  { id: 'EVT-1005', name: 'Web Dev Workshop', venue: 'Lab 3, Tech Block', date: '2026-08-10' },
  { id: 'EVT-1006', name: 'Design Hack 2026', venue: 'Innovation Center', date: '2026-08-28' },
  { id: 'EVT-1007', name: 'Music Night', venue: 'Open Air Theatre', date: '2026-09-02' },
  { id: 'EVT-1003', name: 'UI/UX Design Challenge', venue: 'Lab 3', date: '2026-07-10' },
  { id: 'EVT-1001', name: 'Poster Presentation', venue: 'Auditorium', date: '2026-06-18' },
  { id: 'EVT-1002', name: 'Debate Competition', venue: 'Conference Hall', date: '2026-06-30' },
];

export const generate800StudentRegistrations = (targetCount = 840) => {
  const registrations = [];
  const now = Date.now();

  for (let i = 1; i <= targetCount; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 13) % LAST_NAMES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const year = (i % 3) + 1;
    const className = String.fromCharCode(65 + (i % 3)); // A, B, C
    const rollPfx = dept === 'BCA' ? '21BCA' : dept === 'BSc CA & IT' ? '21BSc' : dept === 'B.Tech CSE' ? '21CSE' : '21DS';
    const rollNumber = `${rollPfx}${String(i).padStart(3, '0')}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 10 === 0 ? i : ''}@campus.edu`;
    const evt = EVENTS[i % EVENTS.length];
    const isAttended = i % 4 !== 0; // ~75% attended rate
    const status = isAttended ? 'ATTENDED' : 'REGISTERED';
    const joinedOffsetDays = (i % 30);
    const createdAt = new Date(now - joinedOffsetDays * 86400000).toISOString();

    registrations.push({
      _id: `reg-800-${i}`,
      registrationId: `REG-2026-${String(1000 + i)}`,
      student: {
        _id: `usr-800-${i}`,
        firstName: fn,
        lastName: ln,
        name: `${fn} ${ln}`,
        email,
        department: dept,
        year,
        className,
        rollNumber,
      },
      event: {
        _id: evt.id,
        name: evt.name,
      },
      eventName: evt.name,
      createdAt,
      status,
      qrToken: `CAMPUS-PASS-2026-${rollNumber}`,
    });
  }

  return registrations;
};

export const generate800MasterDataset = (targetCount = 840) => {
  const rows = [];
  for (let i = 1; i <= targetCount; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 13) % LAST_NAMES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const year = String((i % 3) + 1);
    const className = String.fromCharCode(65 + (i % 3));
    const rollPfx = dept === 'BCA' ? '21BCA' : dept === 'BSc CA & IT' ? '21BSc' : dept === 'B.Tech CSE' ? '21CSE' : '21DS';
    const rollNumber = `${rollPfx}${String(i).padStart(3, '0')}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i % 10 === 0 ? i : ''}@campus.edu`;
    const mobile = `98${String(10000000 + i * 37).slice(0, 8)}`;
    const evt = EVENTS[i % EVENTS.length];
    const isAttended = i % 4 !== 0;

    let winnerStatus = '— (Participant)';
    if (i === 1) winnerStatus = '🥇 1st Place Gold Winner';
    else if (i === 2) winnerStatus = '🥈 2nd Place Silver Medal';
    else if (i === 3) winnerStatus = '🥉 3rd Place Bronze Medal';
    else if (i <= 10) winnerStatus = '🎖️ Top 10 Finalist';

    rows.push({
      userId: `USR-${String(100000 + i)}`,
      studentName: `${fn} ${ln}`,
      email,
      mobile,
      department: dept,
      year,
      className,
      rollNumber,
      accountStatus: 'Active',
      eventId: evt.id,
      eventName: evt.name,
      eventDate: evt.date,
      venue: evt.venue,
      attendanceStatus: isAttended ? 'VERIFIED (Attended)' : 'REGISTERED (Pending Scan)',
      winnerStatus,
      certificateId: isAttended ? `CRT-${String(100000 + i)}` : '—',
    });
  }
  return rows;
};
