require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Winner = require('../models/Winner');
const EventMember = require('../models/EventMember');
const { generateAttendanceToken } = require('../services/qr.service');

const seedRealLifeData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing test collections...');
    
    // Clear existing data to prevent duplicate keys
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      Attendance.deleteMany({}),
      Marks.deleteMany({}),
      Winner.deleteMany({}),
      EventMember.deleteMany({}),
    ]);

    console.log('🌱 Seeding SuperAdmin...');
    const admin = new User({
      userId: 'ADM-000001',
      firstName: 'Super',
      lastName: 'Admin',
      department: 'BCA',
      year: 1,
      className: 'A',
      rollNumber: 'ADMIN-001',
      mobile: '9876543200',
      email: 'admin@eventhandling.com',
      password: 'Admin@123456',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
      accountStatus: 'ACTIVE',
    });
    await admin.save();

    console.log('🌱 Seeding Event Members...');
    const member1 = new EventMember({
      name: 'Mike Johnson',
      email: 'member@eventhandling.com',
      password: 'Member@123456',
      accountStatus: 'ACTIVE',
    });
    const member2 = new EventMember({
      name: 'Emma Watson',
      email: 'emma.member@eventhandling.com',
      password: 'Member@123456',
      accountStatus: 'ACTIVE',
    });
    await Promise.all([member1.save(), member2.save()]);

    console.log('🌱 Seeding Student Users...');
    const studentsData = [
      {
        userId: 'USR-102938',
        firstName: 'John',
        lastName: 'Doe',
        department: 'BCA',
        year: 2,
        className: 'A',
        rollNumber: '21BCA102',
        mobile: '9876543210',
        email: 'john.doe@email.com',
        password: 'Student@123',
        role: 'USER',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
      {
        userId: 'USR-102939',
        firstName: 'Alice',
        lastName: 'Smith',
        department: 'BSc CA & IT',
        year: 3,
        className: 'B',
        rollNumber: '20BSc015',
        mobile: '9876543211',
        email: 'alice.smith@email.com',
        password: 'Student@123',
        role: 'USER',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
      {
        userId: 'USR-102940',
        firstName: 'Bob',
        lastName: 'Johnson',
        department: 'BCA',
        year: 1,
        className: 'A',
        rollNumber: '22BCA042',
        mobile: '9876543212',
        email: 'bob.johnson@email.com',
        password: 'Student@123',
        role: 'USER',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
      {
        userId: 'USR-102941',
        firstName: 'Charlie',
        lastName: 'Brown',
        department: 'BCA',
        year: 2,
        className: 'C',
        rollNumber: '21BCA088',
        mobile: '9876543213',
        email: 'charlie.brown@email.com',
        password: 'Student@123',
        role: 'USER',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
      {
        userId: 'USR-102942',
        firstName: 'Emma',
        lastName: 'Wilson',
        department: 'BSc CA & IT',
        year: 2,
        className: 'A',
        rollNumber: '21BSc021',
        mobile: '9876543214',
        email: 'emma.wilson@email.com',
        password: 'Student@123',
        role: 'USER',
        isEmailVerified: true,
        accountStatus: 'ACTIVE',
      },
    ];

    const savedStudents = await User.create(studentsData);
    const [john, alice, bob, charlie, emma] = savedStudents;

    console.log('🌱 Seeding Events...');
    const eventsData = [
      {
        eventId: 'EVT-1001',
        name: 'Code Carnival 2.0',
        description: 'A coding competition to test your algorithms, debugging speed, and data structure skills.',
        date: new Date('2024-05-25'),
        startTime: '10:00 AM',
        endTime: '04:00 PM',
        location: 'Seminar Hall',
        registrationStart: new Date('2024-05-01'),
        registrationEnd: new Date('2024-05-24'),
        maxParticipants: 100,
        status: 'REGISTRATION_OPEN',
        rules: '1. Individual participation.\n2. Bring your own laptop.\n3. Internet provided for official IDE only.',
        markingCriteria: [
          { name: 'Problem Solving', maxMarks: 40 },
          { name: 'Logic & Approach', maxMarks: 30 },
          { name: 'Code Quality', maxMarks: 20 },
          { name: 'Time Management', maxMarks: 10 },
        ],
        createdBy: admin._id,
      },
      {
        eventId: 'EVT-1002',
        name: 'UI/UX Design Challenge',
        description: 'Design the future with creativity and product innovation using modern design tools.',
        date: new Date('2024-06-10'),
        startTime: '09:00 AM',
        endTime: '02:00 PM',
        location: 'Lab 3',
        registrationStart: new Date('2024-05-05'),
        registrationEnd: new Date('2024-06-09'),
        maxParticipants: 60,
        status: 'REGISTRATION_OPEN',
        rules: 'Figma or Adobe XD permitted.',
        markingCriteria: [
          { name: 'Design Aesthetics', maxMarks: 40 },
          { name: 'User Experience & Flow', maxMarks: 30 },
          { name: 'Interactive Prototype', maxMarks: 30 },
        ],
        createdBy: admin._id,
      },
      {
        eventId: 'EVT-1003',
        name: 'Poster Presentation',
        description: 'Showcase your technical and research ideas through powerful visual posters.',
        date: new Date('2024-06-18'),
        startTime: '11:00 AM',
        endTime: '01:00 PM',
        location: 'Auditorium',
        registrationStart: new Date('2024-05-10'),
        registrationEnd: new Date('2024-06-17'),
        maxParticipants: 80,
        status: 'UPCOMING',
        rules: 'Standard A1/A2 poster size.',
        markingCriteria: [
          { name: 'Topic Clarity & Relevance', maxMarks: 40 },
          { name: 'Visual Appeal & Layout', maxMarks: 30 },
          { name: 'Q&A Presentation', maxMarks: 30 },
        ],
        createdBy: admin._id,
      },
      {
        eventId: 'EVT-1004',
        name: 'Debate Competition',
        description: 'Battle of wits on hot topics in AI, ethics, and future technology.',
        date: new Date('2024-06-30'),
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        location: 'Conference Hall',
        registrationStart: new Date('2024-05-15'),
        registrationEnd: new Date('2024-06-29'),
        maxParticipants: 40,
        status: 'UPCOMING',
        rules: '3 minutes speech + 2 minutes rebuttal.',
        markingCriteria: [
          { name: 'Arguments & Substance', maxMarks: 40 },
          { name: 'Rebuttal Precision', maxMarks: 30 },
          { name: 'Oratory & Poise', maxMarks: 30 },
        ],
        createdBy: admin._id,
      },
    ];

    const savedEvents = await Event.create(eventsData);
    const [codeCarnival, uiuxEvent, posterEvent, debateEvent] = savedEvents;

    console.log('🌱 Seeding Event Registrations & QRs...');
    
    // John Doe registers for Code Carnival 2.0 with attendance QR generated
    const regJohn = new EventRegistration({
      userId: john._id,
      eventId: codeCarnival._id,
      status: 'ATTENDED',
      joinedAt: new Date('2024-05-10'),
    });
    const johnQrToken = generateAttendanceToken(regJohn._id, john._id, codeCarnival._id);
    regJohn.attendanceQrGenerated = true;
    regJohn.attendanceQrToken = johnQrToken;
    await regJohn.save();

    // John registers for UI/UX Challenge
    const regJohn2 = new EventRegistration({
      userId: john._id,
      eventId: uiuxEvent._id,
      status: 'REGISTERED',
      joinedAt: new Date('2024-05-12'),
    });
    await regJohn2.save();

    // Alice registers for Code Carnival & UI/UX
    const regAlice1 = new EventRegistration({
      userId: alice._id,
      eventId: codeCarnival._id,
      status: 'REGISTERED',
      joinedAt: new Date('2024-05-11'),
    });
    await regAlice1.save();

    const regAlice2 = new EventRegistration({
      userId: alice._id,
      eventId: uiuxEvent._id,
      status: 'ATTENDED',
      joinedAt: new Date('2024-05-11'),
    });
    const aliceQrToken = generateAttendanceToken(regAlice2._id, alice._id, uiuxEvent._id);
    regAlice2.attendanceQrGenerated = true;
    regAlice2.attendanceQrToken = aliceQrToken;
    await regAlice2.save();

    // Bob registers for Code Carnival
    const regBob = new EventRegistration({
      userId: bob._id,
      eventId: codeCarnival._id,
      status: 'REGISTERED',
      joinedAt: new Date('2024-05-12'),
    });
    await regBob.save();

    // Charlie registers for Poster
    const regCharlie = new EventRegistration({
      userId: charlie._id,
      eventId: posterEvent._id,
      status: 'REGISTERED',
      joinedAt: new Date('2024-05-12'),
    });
    await regCharlie.save();

    // Emma registers for Debate
    const regEmma = new EventRegistration({
      userId: emma._id,
      eventId: debateEvent._id,
      status: 'REGISTERED',
      joinedAt: new Date('2024-05-13'),
    });
    await regEmma.save();

    console.log('🌱 Seeding Attendance Records...');
    const attendance1 = new Attendance({
      userId: john._id,
      eventId: codeCarnival._id,
      registrationId: regJohn._id,
      processedBy: member1._id,
      processedByModel: 'EventMember',
      processedByRole: 'EVENT_MEMBER',
      status: 'ACCEPTED',
      scannedAt: new Date('2024-05-25T10:21:00'),
      processedAt: new Date('2024-05-25T10:21:00'),
    });

    const attendance2 = new Attendance({
      userId: alice._id,
      eventId: uiuxEvent._id,
      registrationId: regAlice2._id,
      processedBy: admin._id,
      processedByModel: 'User',
      processedByRole: 'SUPER_ADMIN',
      status: 'ACCEPTED',
      scannedAt: new Date('2024-06-10T09:15:00'),
      processedAt: new Date('2024-06-10T09:15:00'),
    });

    await Promise.all([attendance1.save(), attendance2.save()]);

    console.log('🌱 Seeding Marks...');
    const marksJohn = new Marks({
      userId: john._id,
      eventId: codeCarnival._id,
      criteria: [
        { name: 'Problem Solving', marks: 38, maxMarks: 40 },
        { name: 'Logic & Approach', marks: 30, maxMarks: 30 },
        { name: 'Code Quality', marks: 20, maxMarks: 20 },
        { name: 'Time Management', marks: 10, maxMarks: 10 },
      ],
      totalMarks: 98,
      givenBy: member1._id,
      givenByModel: 'EventMember',
    });

    const marksAlice = new Marks({
      userId: alice._id,
      eventId: uiuxEvent._id,
      criteria: [
        { name: 'Design Aesthetics', marks: 38, maxMarks: 40 },
        { name: 'User Experience & Flow', marks: 28, maxMarks: 30 },
        { name: 'Interactive Prototype', marks: 28, maxMarks: 30 },
      ],
      totalMarks: 94,
      givenBy: admin._id,
      givenByModel: 'User',
    });

    await Promise.all([marksJohn.save(), marksAlice.save()]);

    console.log('🌱 Seeding Winners...');
    const winner1 = new Winner({
      eventId: codeCarnival._id,
      userId: john._id,
      position: '1st Place',
      marks: 98,
    });

    const winner2 = new Winner({
      eventId: uiuxEvent._id,
      userId: alice._id,
      position: '2nd Place',
      marks: 94,
    });

    await Promise.all([winner1.save(), winner2.save()]);

    console.log('✅ Real-life Database Seeding Complete!');
    console.log('---------------------------------------------------------');
    console.log('Super Admin:  admin@eventhandling.com  / Admin@123456');
    console.log('Event Member: member@eventhandling.com / Member@123456');
    console.log('Student User: john.doe@email.com       / Student@123');
    console.log('Student User: alice.smith@email.com     / Student@123');
    console.log('---------------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedRealLifeData();
