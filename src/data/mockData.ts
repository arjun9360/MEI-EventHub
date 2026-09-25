export type EventStatus = 'draft' | 'pending' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
export type EventMode = 'offline' | 'online' | 'hybrid';

export interface EventSession { id: string; title: string; start: string; end: string; speaker: string; coordinator: string; venue: string; }
export interface EventDocument { name: string; type: string; url: string; }
export interface Event {
  id: string; title: string; department: string; institution: string; organizer: string;
  category: string; mode: EventMode; date: string; time: string; endTime: string; venue: string;
  lastRegistrationDate: string; lastRegistrationTime: string; totalSlots: number; registeredCount: number;
  openTo: 'all_departments' | 'specific_department'; specifiedDepartments?: string[];
  collegeAccess: 'all_colleges' | 'mei_only' | 'specific_college'; specifiedColleges?: string[];
  description: string; status: EventStatus; popularity: number; fee: number; participationType: 'individual' | 'team';
  contact: string; registrationType: 'internal' | 'external'; registrationUrl?: string; meetingUrl?: string;
  featured?: boolean; sessions: EventSession[]; speakers?: string[]; rules?: string[]; documents?: EventDocument[];
}

export interface Venue { id: string; name: string; building: string; floor: string; room: string; capacity: number; type: string; facilities: string[]; status: 'available' | 'occupied' | 'maintenance'; active: boolean; utilization: number; }
export interface Registration { id: string; eventId: string; name: string; regId: string; department: string; institution: string; status: 'confirmed' | 'waitlisted' | 'attended' | 'no-show'; }
export interface Volunteer { id: string; name: string; regId: string; eventId: string; responsibility: string; status: 'assigned' | 'checked-in' | 'completed'; }
export interface Notification { id: string; title: string; detail: string; time: string; type: 'registration' | 'schedule' | 'venue' | 'reminder'; read: boolean; }

export const events: Event[] = [
  { id:'1', title:'HackFusion 2026', department:'Computer Science', institution:'MEC', organizer:'Dr. S. Anand', category:'Hackathon', mode:'offline', date:'2026-10-15', time:'09:00', endTime:'17:00', venue:'Main Auditorium', lastRegistrationDate:'2026-10-10', lastRegistrationTime:'11:59 PM', totalSlots:120, registeredCount:87, openTo:'all_departments', collegeAccess:'all_colleges', description:'A national-level innovation marathon bringing teams together to solve practical institutional and social challenges.', status:'registration_open', popularity:95, fee:0, participationType:'team', contact:'events@mec.edu · +91 98765 43010', registrationType:'internal', featured:true, speakers:['Ms. Ananya Rao, CTO — Nexa Labs'], rules:['Teams of 2–4 members','Bring a valid college ID','Original submissions only'], documents:[{name:'Event brochure',type:'PDF',url:'#'},{name:'Participation rules',type:'PDF',url:'#'}], sessions:[{id:'s1',title:'Inauguration',start:'09:00',end:'09:30',speaker:'Dr. S. Anand',coordinator:'Priya M',venue:'Main Auditorium'},{id:'s2',title:'Build sprint',start:'09:30',end:'16:00',speaker:'Mentor panel',coordinator:'Karthik R',venue:'Innovation Lab'},{id:'s3',title:'Final presentations',start:'16:00',end:'17:00',speaker:'Jury panel',coordinator:'Priya M',venue:'Main Auditorium'}]},
  { id:'2', title:'RoboWars Championship', department:'Mechanical Engineering', institution:'MIT', organizer:'Prof. R. Kumar', category:'Competition', mode:'offline', date:'2026-10-20', time:'10:00', endTime:'14:00', venue:'Workshop Hall', lastRegistrationDate:'2026-10-18', lastRegistrationTime:'06:00 PM', totalSlots:40, registeredCount:35, openTo:'all_departments', collegeAccess:'mei_only', description:'Build and battle robots across Sumo Bot, Line Follower, and Maze Solver categories.', status:'published', popularity:88, fee:250, participationType:'team', contact:'robotics@mit.edu', registrationType:'internal', sessions:[{id:'s4',title:'Technical inspection',start:'10:00',end:'10:45',speaker:'Technical team',coordinator:'Arun K',venue:'Workshop Hall'},{id:'s5',title:'Competition rounds',start:'11:00',end:'14:00',speaker:'Judges panel',coordinator:'Arun K',venue:'Workshop Hall'}]},
  { id:'3', title:'Code Sprint 3.0', department:'Information Technology', institution:'MEC', organizer:'Ms. V. Nisha', category:'Technical Event', mode:'hybrid', date:'2026-10-25', time:'14:00', endTime:'17:00', venue:'IT Lab Block B', lastRegistrationDate:'2026-10-22', lastRegistrationTime:'11:59 PM', totalSlots:60, registeredCount:42, openTo:'specific_department', specifiedDepartments:['Computer Science','Information Technology'], collegeAccess:'specific_college', specifiedColleges:['MEC'], description:'An intense competitive programming contest with problems from foundational to expert.', status:'registration_open', popularity:76, fee:0, participationType:'individual', contact:'codesprint@mec.edu', registrationType:'external', registrationUrl:'https://forms.google.com', meetingUrl:'https://meet.google.com', sessions:[{id:'s6',title:'Contest briefing',start:'14:00',end:'14:20',speaker:'Ms. V. Nisha',coordinator:'Divya S',venue:'IT Lab Block B'},{id:'s7',title:'Coding round',start:'14:20',end:'17:00',speaker:'',coordinator:'Divya S',venue:'IT Lab Block B'}]},
  { id:'4', title:'TechTalk: Future of AI', department:'Computer Science', institution:'MCE', organizer:'Dr. Maya Iyer', category:'Guest Lecture', mode:'offline', date:'2026-09-05', time:'11:00', endTime:'13:00', venue:'Seminar Hall', lastRegistrationDate:'2026-09-03', lastRegistrationTime:'05:00 PM', totalSlots:200, registeredCount:178, openTo:'all_departments', collegeAccess:'all_colleges', description:'Industry leaders discuss the future of artificial intelligence and its societal impact.', status:'completed', popularity:92, fee:0, participationType:'individual', contact:'cse@mce.edu', registrationType:'internal', speakers:['Dr. Kavya Menon, AI Researcher'], rules:['Carry registration confirmation'], documents:[{name:'Session notes',type:'PDF',url:'#'}], sessions:[{id:'s8',title:'Keynote',start:'11:00',end:'12:00',speaker:'Dr. Kavya Menon',coordinator:'Meena P',venue:'Seminar Hall'},{id:'s9',title:'Open Q&A',start:'12:00',end:'13:00',speaker:'Dr. Kavya Menon',coordinator:'Meena P',venue:'Seminar Hall'}]},
  { id:'5', title:'Design Thinking Workshop', department:'MBA', institution:'MECW', organizer:'Ms. R. Preethi', category:'Workshop', mode:'offline', date:'2026-11-01', time:'09:30', endTime:'15:30', venue:'Conference Hall', lastRegistrationDate:'2026-10-28', lastRegistrationTime:'11:59 PM', totalSlots:50, registeredCount:12, openTo:'all_departments', collegeAccess:'mei_only', description:'A hands-on workshop covering empathize, define, ideate, prototype, and test.', status:'pending', popularity:65, fee:100, participationType:'individual', contact:'mba@mecw.edu', registrationType:'internal', sessions:[{id:'s10',title:'Foundations',start:'09:30',end:'11:00',speaker:'Ms. R. Preethi',coordinator:'Lakshmi N',venue:'Conference Hall'},{id:'s11',title:'Prototype studio',start:'11:15',end:'15:30',speaker:'Facilitator team',coordinator:'Lakshmi N',venue:'Conference Hall'}]}
];

export const venues: Venue[] = [
 {id:'v1',name:'Main Auditorium',building:'Central Block',floor:'Ground',room:'A-001',capacity:150,type:'Auditorium',facilities:['Projector','Stage','AC','Sound system'],status:'occupied',active:true,utilization:78},
 {id:'v2',name:'Seminar Hall',building:'Academic Block',floor:'First',room:'S-104',capacity:220,type:'Seminar Hall',facilities:['Projector','AC','Recording'],status:'available',active:true,utilization:61},
 {id:'v3',name:'Conference Hall',building:'Admin Block',floor:'Second',room:'C-201',capacity:80,type:'Conference Hall',facilities:['Display','Video conference','AC'],status:'available',active:true,utilization:44},
 {id:'v4',name:'IT Lab Block B',building:'Technology Block',floor:'First',room:'B-112',capacity:64,type:'Computer Lab',facilities:['64 systems','Internet','Projector'],status:'occupied',active:true,utilization:72},
 {id:'v5',name:'Open Ground',building:'Sports Campus',floor:'Ground',room:'—',capacity:1000,type:'Open Ground',facilities:['Power','Public address'],status:'maintenance',active:false,utilization:25}
];

export const registrations: Registration[] = [
 {id:'r1',eventId:'1',name:'Abishek R',regId:'22CS001',department:'Computer Science',institution:'MEC',status:'confirmed'},
 {id:'r2',eventId:'1',name:'Divya S',regId:'22IT012',department:'Information Technology',institution:'MEC',status:'attended'},
 {id:'r3',eventId:'2',name:'Gowtham K',regId:'22ME034',department:'Mechanical Engineering',institution:'MIT',status:'confirmed'},
 {id:'r4',eventId:'4',name:'Meena P',regId:'22CS045',department:'Computer Science',institution:'MCE',status:'attended'},
 {id:'r5',eventId:'4',name:'Ravi M',regId:'22ME022',department:'Mechanical Engineering',institution:'MEC',status:'no-show'},
 {id:'r6',eventId:'3',name:'Lakshmi N',regId:'22CS078',department:'Computer Science',institution:'MEC',status:'waitlisted'}
];

export const volunteers: Volunteer[] = [
 {id:'vo1',name:'Priya M',regId:'23CS041',eventId:'1',responsibility:'Registration desk',status:'assigned'},
 {id:'vo2',name:'Karthik R',regId:'23IT019',eventId:'1',responsibility:'QR attendance',status:'checked-in'},
 {id:'vo3',name:'Arun K',regId:'22ME033',eventId:'2',responsibility:'Venue coordination',status:'assigned'},
 {id:'vo4',name:'Lakshmi N',regId:'23BA012',eventId:'5',responsibility:'Participant support',status:'completed'}
];

export const notifications: Notification[] = [
 {id:'n1',title:'Registration confirmed',detail:'Your HackFusion 2026 registration is confirmed.',time:'10 minutes ago',type:'registration',read:false},
 {id:'n2',title:'Venue updated',detail:'Code Sprint 3.0 is now at IT Lab Block B.',time:'2 hours ago',type:'venue',read:false},
 {id:'n3',title:'Registration closes soon',detail:'RoboWars registration closes on 18 October.',time:'Yesterday',type:'reminder',read:true},
 {id:'n4',title:'Schedule published',detail:'The complete HackFusion session schedule is available.',time:'2 days ago',type:'schedule',read:true}
];

export interface Feedback { id:string; eventId:string; studentName:string; regId:string; department:string; rating:number; contentQuality:number; organization:number; venueRating:number; overallExperience:number; comment:string; submittedAt:string; }
export const feedbacks: Feedback[] = [
 {id:'f1',eventId:'4',studentName:'Abishek R',regId:'22CS001',department:'Computer Science',rating:5,contentQuality:5,organization:4,venueRating:4,overallExperience:5,comment:'Excellent talk and useful examples.',submittedAt:'2026-09-05T15:00:00'},
 {id:'f2',eventId:'4',studentName:'Divya S',regId:'22IT012',department:'Information Technology',rating:4,contentQuality:4,organization:5,venueRating:3,overallExperience:4,comment:'Great speaker; the venue was crowded.',submittedAt:'2026-09-05T15:30:00'},
 {id:'f3',eventId:'4',studentName:'Gowtham K',regId:'22EC034',department:'ECE',rating:5,contentQuality:5,organization:5,venueRating:5,overallExperience:5,comment:'Best event of the semester!',submittedAt:'2026-09-05T16:00:00'},
 {id:'f4',eventId:'4',studentName:'Meena P',regId:'22CS045',department:'Computer Science',rating:3,contentQuality:4,organization:3,venueRating:3,overallExperience:3,comment:'Good content; more interaction would help.',submittedAt:'2026-09-05T16:15:00'}
];

export const developers = [
 {name:'Arun Kumar S',dept:'Computer Science',college:'MEC',batch:'2023-2027',image:''},
 {name:'Priya Dharshini M',dept:'Information Technology',college:'MEC',batch:'2023-2027',image:''},
 {name:'Karthik R',dept:'Computer Science',college:'MIT',batch:'2022-2026',image:''},
 {name:'Swetha V',dept:'ECE',college:'MCE',batch:'2023-2027',image:''}
];
