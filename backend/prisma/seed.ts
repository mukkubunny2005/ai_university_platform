import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clear existing data safely in reverse dependency order
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('Cleaned existing records.');

  // Password hashes
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const facultyPasswordHash = await bcrypt.hash('Faculty@123456', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123456', 10);

  // 1. Create Departments
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Engineering focusing on software systems, computing fundamentals, and cutting-edge software engineering.',
    },
  });

  const aidsDept = await prisma.department.create({
    data: {
      name: 'Artificial Intelligence & Data Science',
      code: 'AIDS',
      description: 'Department dedicated to AI research, machine learning, deep learning, statistical modeling, and data engineering.',
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      description: 'Department focusing on signal processing, embedded systems, microelectronics, and communications.',
    },
  });

  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      code: 'IT',
      description: 'Department specializing in enterprise software development, database systems, cybersecurity, networking, and cloud computing.',
    },
  });

  const eeeDept = await prisma.department.create({
    data: {
      name: 'Electrical & Electronics Engineering',
      code: 'EEE',
      description: 'Department covering electrical power systems, smart grids, control systems, electric vehicles, renewable energy, and power electronics.',
    },
  });

  const mechDept = await prisma.department.create({
    data: {
      name: 'Mechanical Engineering',
      code: 'MECH',
      description: 'Department specializing in thermodynamics, fluid dynamics, robotics, mechanical design, CAD/CAM, and advanced manufacturing technologies.',
    },
  });

  const civilDept = await prisma.department.create({
    data: {
      name: 'Civil Engineering',
      code: 'CIVIL',
      description: 'Department emphasizing structural mechanics, environmental engineering, geotechnical analysis, transportation systems, and urban infrastructure.',
    },
  });

  const biotechDept = await prisma.department.create({
    data: {
      name: 'Biotechnology Engineering',
      code: 'BIOTECH',
      description: 'Department focused on genetic engineering, molecular biology, bioinformatics, bioprocessing, and biomedical innovation.',
    },
  });

  const chemDept = await prisma.department.create({
    data: {
      name: 'Chemical Engineering',
      code: 'CHEM',
      description: 'Department focusing on chemical reaction engineering, process optimization, materials synthesis, separation techniques, and polymers.',
    },
  });

  const aeroDept = await prisma.department.create({
    data: {
      name: 'Aerospace Engineering',
      code: 'AERO',
      description: 'Department exploring aerodynamics, propulsion systems, flight mechanics, orbital dynamics, and aerospace vehicle structures.',
    },
  });

  console.log('Created 10 Academic Branches/Departments: CSE, AIDS, IT, ECE, EEE, MECH, CIVIL, BIOTECH, CHEM, AERO');

  // 2. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@aiuniversity.edu',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Created Admin: ${admin.email}`);

  // 3. Create Faculty Members
  const alanUser = await prisma.user.create({
    data: {
      name: 'Dr. Alan Turing',
      email: 'alan.turing@aiuniversity.edu',
      passwordHash: facultyPasswordHash,
      role: Role.FACULTY,
    },
  });

  const alanFaculty = await prisma.faculty.create({
    data: {
      userId: alanUser.id,
      facultyId: 'FAC-CSE-001',
      departmentId: cseDept.id,
      designation: 'Senior Professor & Chair',
    },
  });

  const adaUser = await prisma.user.create({
    data: {
      name: 'Dr. Ada Lovelace',
      email: 'ada.lovelace@aiuniversity.edu',
      passwordHash: facultyPasswordHash,
      role: Role.FACULTY,
    },
  });

  const adaFaculty = await prisma.faculty.create({
    data: {
      userId: adaUser.id,
      facultyId: 'FAC-AI-001',
      departmentId: aidsDept.id,
      designation: 'Associate Professor & AI Lab Director',
    },
  });

  const claudeUser = await prisma.user.create({
    data: {
      name: 'Dr. Claude Shannon',
      email: 'claude.shannon@aiuniversity.edu',
      passwordHash: facultyPasswordHash,
      role: Role.FACULTY,
    },
  });

  const claudeFaculty = await prisma.faculty.create({
    data: {
      userId: claudeUser.id,
      facultyId: 'FAC-ECE-001',
      departmentId: eceDept.id,
      designation: 'Professor & Information Systems Lead',
    },
  });

  console.log('Created 3 Faculty members');

  // 4. Create Courses
  const btechCse = await prisma.course.create({
    data: {
      name: 'B.Tech in Computer Science and Engineering',
      code: 'BTECH-CSE',
      description: '4-year undergraduate degree program covering algorithms, system architecture, database design, and software development.',
      departmentId: cseDept.id,
    },
  });

  const btechAids = await prisma.course.create({
    data: {
      name: 'B.Tech in Artificial Intelligence & Data Science',
      code: 'BTECH-AIDS',
      description: '4-year undergraduate specialization focused on machine learning, neural computation, big data analytics, and generative models.',
      departmentId: aidsDept.id,
    },
  });

  const mtechCse = await prisma.course.create({
    data: {
      name: 'M.Tech in Advanced Computer Science',
      code: 'MTECH-CSE',
      description: '2-year post-graduate program emphasizing distributed systems, cloud computing, and advanced computing paradigms.',
      departmentId: cseDept.id,
    },
  });

  const btechEce = await prisma.course.create({
    data: {
      name: 'B.Tech in Electronics & Communication',
      code: 'BTECH-ECE',
      description: '4-year undergraduate degree covering modern telecommunications, digital signal processing, and embedded architectures.',
      departmentId: eceDept.id,
    },
  });

  console.log('Created 4 Courses');

  // 5. Create Subjects
  await prisma.subject.create({
    data: {
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      credits: 4,
      courseId: btechCse.id,
      facultyId: alanFaculty.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Operating Systems & Concurrency',
      code: 'CS203',
      credits: 3,
      courseId: btechCse.id,
      facultyId: alanFaculty.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Database Management Systems',
      code: 'CS202',
      credits: 4,
      courseId: btechCse.id,
      facultyId: null, // Unassigned for assignment testing
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Machine Learning Foundations',
      code: 'AI301',
      credits: 4,
      courseId: btechAids.id,
      facultyId: adaFaculty.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Deep Learning & Neural Architectures',
      code: 'AI302',
      credits: 4,
      courseId: btechAids.id,
      facultyId: adaFaculty.id,
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Digital Signal Processing',
      code: 'EC201',
      credits: 3,
      courseId: btechEce.id,
      facultyId: claudeFaculty.id,
    },
  });

  console.log('Created 6 Subjects');

  // 6. Create Students
  const johnUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@aiuniversity.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  await prisma.student.create({
    data: {
      userId: johnUser.id,
      studentId: 'STU-2026-001',
      departmentId: cseDept.id,
      semester: 4,
    },
  });

  const aliceUser = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice.smith@aiuniversity.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  await prisma.student.create({
    data: {
      userId: aliceUser.id,
      studentId: 'STU-2026-002',
      departmentId: aidsDept.id,
      semester: 6,
    },
  });

  const bobUser = await prisma.user.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob.wilson@aiuniversity.edu',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  await prisma.student.create({
    data: {
      userId: bobUser.id,
      studentId: 'STU-2026-003',
      departmentId: eceDept.id,
      semester: 2,
    },
  });

  console.log('Created 3 Students');
  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
