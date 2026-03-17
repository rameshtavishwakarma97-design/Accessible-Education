import { eq, and, ne, ilike, inArray, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, institutes, schools, departments, programs, years, divisions, terms,
  courses, courseOfferings, enrollments, electiveGroups, contentItems, conversionJobs,
  contentProgress, assessments, submissions, threads, messages, announcements,
  analyticsEvents, auditLogs, platformSettings,
  type User, type InsertUser, type Institute, type School, type Department,
  type Program, type Year, type Division, type Term, type Course, type CourseOffering,
  type Enrollment, type ContentItem, type ConversionJob, type Assessment,
  type Submission, type Thread, type Message, type Announcement, type AuditLog,
  type AnalyticsEvent, type PlatformSettings
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  listUsers(filters?: { role?: string; search?: string; status?: string }): Promise<User[]>;
  deleteUser(id: string): Promise<void>;

  createInstitute(data: Partial<Institute>): Promise<Institute>;
  getInstitute(id: string): Promise<Institute | undefined>;
  listInstitutes(): Promise<Institute[]>;
  updateInstitute(id: string, data: Partial<Institute>): Promise<Institute | undefined>;

  createSchool(data: Partial<School>): Promise<School>;
  getSchool(id: string): Promise<School | undefined>;
  listSchools(instituteId: string): Promise<School[]>;
  updateSchool(id: string, data: Partial<School>): Promise<School | undefined>;
  deleteSchool(id: string): Promise<void>;

  createDepartment(data: Partial<Department>): Promise<Department>;
  getDepartment(id: string): Promise<Department | undefined>;
  listDepartments(schoolId: string): Promise<Department[]>;
  updateDepartment(id: string, data: Partial<Department>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<void>;

  createProgram(data: Partial<Program>): Promise<Program>;
  getProgram(id: string): Promise<Program | undefined>;
  listPrograms(departmentId: string): Promise<Program[]>;
  updateProgram(id: string, data: Partial<Program>): Promise<Program | undefined>;
  deleteProgram(id: string): Promise<void>;

  createYear(data: Partial<Year>): Promise<Year>;
  getYear(id: string): Promise<Year | undefined>;
  listYears(programId: string): Promise<Year[]>;
  updateYear(id: string, data: Partial<Year>): Promise<Year | undefined>;
  deleteYear(id: string): Promise<void>;

  createDivision(data: Partial<Division>): Promise<Division>;
  getDivision(id: string): Promise<Division | undefined>;
  listDivisions(yearId: string): Promise<Division[]>;
  updateDivision(id: string, data: Partial<Division>): Promise<Division | undefined>;
  deleteDivision(id: string): Promise<void>;

  createTerm(data: Partial<Term>): Promise<Term>;
  getTerm(id: string): Promise<Term | undefined>;
  listTerms(instituteId: string): Promise<Term[]>;
  updateTerm(id: string, data: Partial<Term>): Promise<Term | undefined>;
  deleteTerm(id: string): Promise<void>;

  createCourse(data: Partial<Course>): Promise<Course>;
  getCourse(id: string): Promise<Course | undefined>;
  listCourses(filters?: { instituteId?: string; departmentId?: string }): Promise<Course[]>;
  updateCourse(id: string, data: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<void>;

  createCourseOffering(data: Partial<CourseOffering>): Promise<CourseOffering>;
  getCourseOffering(id: string): Promise<CourseOffering | undefined>;
  listCourseOfferings(filters?: { courseId?: string; termId?: string; instituteId?: string }): Promise<CourseOffering[]>;
  updateCourseOffering(id: string, data: Partial<CourseOffering>): Promise<CourseOffering | undefined>;
  deleteCourseOffering(id: string): Promise<void>;

  createEnrollment(data: Partial<Enrollment>): Promise<Enrollment>;
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  listEnrollments(filters?: { studentId?: string; courseOfferingId?: string }): Promise<Enrollment[]>;
  updateEnrollment(id: string, data: Partial<Enrollment>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: string): Promise<void>;

  createContentItem(data: Partial<ContentItem>): Promise<ContentItem>;
  getContentItem(id: string): Promise<ContentItem | undefined>;
  listContentItems(filters?: { courseOfferingId?: string; publishStatus?: string; uploadedBy?: string; includeDeleted?: boolean }): Promise<ContentItem[]>;
  updateContentItem(id: string, data: Partial<ContentItem>): Promise<ContentItem | undefined>;
  deleteContentItem(id: string): Promise<void>;
  softDeleteContentItem(id: string, deletedBy: string): Promise<ContentItem | null>;
  restoreContentItem(id: string): Promise<ContentItem | null>;
  permanentDeleteContentItem(id: string): Promise<void>;
  getContentImpact(id: string): Promise<{ viewCount: number; progressCount: number; linkedAssessments: string[] }>;

  createConversionJob(data: Partial<ConversionJob>): Promise<ConversionJob>;
  getConversionJob(id: string): Promise<ConversionJob | undefined>;
  listConversionJobs(filters?: { contentId?: string; courseOfferingId?: string; status?: string }): Promise<ConversionJob[]>;
  updateConversionJob(id: string, data: Partial<ConversionJob>): Promise<ConversionJob | undefined>;

  createAssessment(data: Partial<Assessment>): Promise<Assessment>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  listAssessments(filters?: { courseOfferingId?: string; ownerTeacherId?: string }): Promise<Assessment[]>;
  updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment | undefined>;
  deleteAssessment(id: string): Promise<void>;

  createSubmission(data: Partial<Submission>): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionByStudentAndAssessment(studentId: string, assessmentId: string): Promise<Submission | undefined>;
  listSubmissions(filters?: { assessmentId?: string; studentId?: string }): Promise<Submission[]>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission | undefined>;

  createThread(data: Partial<Thread>): Promise<Thread>;
  getThread(id: string): Promise<Thread | undefined>;
  listThreads(filters?: { courseOfferingId?: string; participantId?: string }): Promise<Thread[]>;
  updateThread(id: string, data: Partial<Thread>): Promise<Thread | undefined>;

  createMessage(data: Partial<Message>): Promise<Message>;
  getMessage(id: string): Promise<Message | undefined>;
  listMessages(threadId: string): Promise<Message[]>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message | undefined>;

  createAnnouncement(data: Partial<Announcement>): Promise<Announcement>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  listAnnouncements(filters?: { courseOfferingId?: string; instituteId?: string }): Promise<Announcement[]>;
  updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<void>;

  createAuditLog(data: Partial<AuditLog>): Promise<AuditLog>;
  listAuditLogs(filters?: { actorId?: string; action?: string; instituteId?: string }): Promise<AuditLog[]>;

  createAnalyticsEvent(data: Partial<AnalyticsEvent>): Promise<AnalyticsEvent>;
  listAnalyticsEvents(filters?: { userId?: string; type?: string; instituteId?: string }): Promise<AnalyticsEvent[]>;

  getPlatformSettings(instituteId: string): Promise<PlatformSettings | undefined>;
  upsertPlatformSettings(instituteId: string, data: Partial<PlatformSettings>): Promise<PlatformSettings>;

  getHierarchyTree(instituteId: string): Promise<any>;
  getAdminStats(instituteId?: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({ ...data, email: data.email.toLowerCase() } as any).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  }

  async listUsers(filters?: { role?: string; search?: string; status?: string }): Promise<User[]> {
    let query = db.select().from(users);
    const conditions = [];
    if (filters?.role) conditions.push(eq(users.role, filters.role as any));
    if (filters?.status) conditions.push(eq(users.status, filters.status as any));
    if (filters?.search) conditions.push(ilike(users.name, `%${filters.search}%`));
    if (conditions.length > 0) {
      return db.select().from(users).where(and(...conditions));
    }
    return db.select().from(users);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createInstitute(data: Partial<Institute>): Promise<Institute> {
    const [inst] = await db.insert(institutes).values(data as any).returning();
    return inst;
  }

  async getInstitute(id: string): Promise<Institute | undefined> {
    const [inst] = await db.select().from(institutes).where(eq(institutes.id, id));
    return inst;
  }

  async listInstitutes(): Promise<Institute[]> {
    return db.select().from(institutes);
  }

  async updateInstitute(id: string, data: Partial<Institute>): Promise<Institute | undefined> {
    const [inst] = await db.update(institutes).set({ ...data, updatedAt: new Date() }).where(eq(institutes.id, id)).returning();
    return inst;
  }

  async createSchool(data: Partial<School>): Promise<School> {
    const [s] = await db.insert(schools).values(data as any).returning();
    return s;
  }

  async getSchool(id: string): Promise<School | undefined> {
    const [s] = await db.select().from(schools).where(eq(schools.id, id));
    return s;
  }

  async listSchools(instituteId: string): Promise<School[]> {
    return db.select().from(schools).where(eq(schools.instituteId, instituteId));
  }

  async updateSchool(id: string, data: Partial<School>): Promise<School | undefined> {
    const [s] = await db.update(schools).set({ ...data, updatedAt: new Date() }).where(eq(schools.id, id)).returning();
    return s;
  }

  async deleteSchool(id: string): Promise<void> {
    await db.update(schools).set({ isActive: false }).where(eq(schools.id, id));
  }

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const [d] = await db.insert(departments).values(data as any).returning();
    return d;
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const [d] = await db.select().from(departments).where(eq(departments.id, id));
    return d;
  }

  async listDepartments(schoolId: string): Promise<Department[]> {
    return db.select().from(departments).where(eq(departments.schoolId, schoolId));
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department | undefined> {
    const [d] = await db.update(departments).set({ ...data, updatedAt: new Date() }).where(eq(departments.id, id)).returning();
    return d;
  }

  async deleteDepartment(id: string): Promise<void> {
    await db.update(departments).set({ isActive: false }).where(eq(departments.id, id));
  }

  async createProgram(data: Partial<Program>): Promise<Program> {
    const [p] = await db.insert(programs).values(data as any).returning();
    return p;
  }

  async getProgram(id: string): Promise<Program | undefined> {
    const [p] = await db.select().from(programs).where(eq(programs.id, id));
    return p;
  }

  async listPrograms(departmentId: string): Promise<Program[]> {
    return db.select().from(programs).where(eq(programs.departmentId, departmentId));
  }

  async updateProgram(id: string, data: Partial<Program>): Promise<Program | undefined> {
    const [p] = await db.update(programs).set({ ...data, updatedAt: new Date() }).where(eq(programs.id, id)).returning();
    return p;
  }

  async deleteProgram(id: string): Promise<void> {
    await db.update(programs).set({ isActive: false }).where(eq(programs.id, id));
  }

  async createYear(data: Partial<Year>): Promise<Year> {
    const [y] = await db.insert(years).values(data as any).returning();
    return y;
  }

  async getYear(id: string): Promise<Year | undefined> {
    const [y] = await db.select().from(years).where(eq(years.id, id));
    return y;
  }

  async listYears(programId: string): Promise<Year[]> {
    return db.select().from(years).where(eq(years.programId, programId));
  }

  async updateYear(id: string, data: Partial<Year>): Promise<Year | undefined> {
    const [y] = await db.update(years).set({ ...data, updatedAt: new Date() }).where(eq(years.id, id)).returning();
    return y;
  }

  async deleteYear(id: string): Promise<void> {
    await db.update(years).set({ isActive: false }).where(eq(years.id, id));
  }

  async createDivision(data: Partial<Division>): Promise<Division> {
    const [d] = await db.insert(divisions).values(data as any).returning();
    return d;
  }

  async getDivision(id: string): Promise<Division | undefined> {
    const [d] = await db.select().from(divisions).where(eq(divisions.id, id));
    return d;
  }

  async listDivisions(yearId: string): Promise<Division[]> {
    return db.select().from(divisions).where(eq(divisions.yearId, yearId));
  }

  async updateDivision(id: string, data: Partial<Division>): Promise<Division | undefined> {
    const [d] = await db.update(divisions).set({ ...data, updatedAt: new Date() }).where(eq(divisions.id, id)).returning();
    return d;
  }

  async deleteDivision(id: string): Promise<void> {
    await db.update(divisions).set({ isActive: false }).where(eq(divisions.id, id));
  }

  async createTerm(data: Partial<Term>): Promise<Term> {
    const [t] = await db.insert(terms).values(data as any).returning();
    return t;
  }

  async getTerm(id: string): Promise<Term | undefined> {
    const [t] = await db.select().from(terms).where(eq(terms.id, id));
    return t;
  }

  async listTerms(instituteId: string): Promise<Term[]> {
    return db.select().from(terms).where(eq(terms.instituteId, instituteId));
  }

  async updateTerm(id: string, data: Partial<Term>): Promise<Term | undefined> {
    const [t] = await db.update(terms).set({ ...data, updatedAt: new Date() }).where(eq(terms.id, id)).returning();
    return t;
  }

  async deleteTerm(id: string): Promise<void> {
    await db.delete(terms).where(eq(terms.id, id));
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const [c] = await db.insert(courses).values(data as any).returning();
    return c;
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [c] = await db.select().from(courses).where(eq(courses.id, id));
    return c;
  }

  async listCourses(filters?: { instituteId?: string; departmentId?: string }): Promise<Course[]> {
    const conditions = [];
    if (filters?.instituteId) conditions.push(eq(courses.instituteId, filters.instituteId));
    if (filters?.departmentId) conditions.push(eq(courses.departmentId, filters.departmentId));
    if (conditions.length > 0) return db.select().from(courses).where(and(...conditions));
    return db.select().from(courses);
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course | undefined> {
    const [c] = await db.update(courses).set({ ...data, updatedAt: new Date() }).where(eq(courses.id, id)).returning();
    return c;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async createCourseOffering(data: Partial<CourseOffering>): Promise<CourseOffering> {
    const [co] = await db.insert(courseOfferings).values(data as any).returning();
    return co;
  }

  async getCourseOffering(id: string): Promise<CourseOffering | undefined> {
    const [co] = await db.select().from(courseOfferings).where(eq(courseOfferings.id, id));
    return co;
  }

  async listCourseOfferings(filters?: { courseId?: string; termId?: string; instituteId?: string }): Promise<CourseOffering[]> {
    const conditions = [];
    if (filters?.courseId) conditions.push(eq(courseOfferings.courseId, filters.courseId));
    if (filters?.termId) conditions.push(eq(courseOfferings.termId, filters.termId));
    if (filters?.instituteId) conditions.push(eq(courseOfferings.instituteId, filters.instituteId));
    if (conditions.length > 0) return db.select().from(courseOfferings).where(and(...conditions));
    return db.select().from(courseOfferings);
  }

  async updateCourseOffering(id: string, data: Partial<CourseOffering>): Promise<CourseOffering | undefined> {
    const [co] = await db.update(courseOfferings).set({ ...data, updatedAt: new Date() }).where(eq(courseOfferings.id, id)).returning();
    return co;
  }

  async deleteCourseOffering(id: string): Promise<void> {
    await db.delete(courseOfferings).where(eq(courseOfferings.id, id));
  }

  async createEnrollment(data: Partial<Enrollment>): Promise<Enrollment> {
    const [e] = await db.insert(enrollments).values(data as any).returning();
    return e;
  }

  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    const [e] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return e;
  }

  async listEnrollments(filters?: { studentId?: string; courseOfferingId?: string }): Promise<Enrollment[]> {
    const conditions = [];
    if (filters?.studentId) conditions.push(eq(enrollments.studentId, filters.studentId));
    if (filters?.courseOfferingId) conditions.push(eq(enrollments.courseOfferingId, filters.courseOfferingId));
    if (conditions.length > 0) return db.select().from(enrollments).where(and(...conditions));
    return db.select().from(enrollments);
  }

  async updateEnrollment(id: string, data: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const [e] = await db.update(enrollments).set({ ...data, updatedAt: new Date() }).where(eq(enrollments.id, id)).returning();
    return e;
  }

  async deleteEnrollment(id: string): Promise<void> {
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  async createContentItem(data: Partial<ContentItem>): Promise<ContentItem> {
    const [ci] = await db.insert(contentItems).values(data as any).returning();
    return ci;
  }

  async getContentItem(id: string): Promise<ContentItem | undefined> {
    const [ci] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return ci;
  }

  async listContentItems(filters?: {
    courseOfferingId?: string;
    publishStatus?: string;
    uploadedBy?: string;
    includeDeleted?: boolean;
  }): Promise<ContentItem[]> {
    const conditions = [];
    if (filters?.courseOfferingId)
      conditions.push(eq(contentItems.courseOfferingId, filters.courseOfferingId));
    if (filters?.publishStatus)
      conditions.push(eq(contentItems.publishStatus, filters.publishStatus as any));
    if (filters?.uploadedBy)
      conditions.push(eq(contentItems.uploadedBy, filters.uploadedBy));
    // Exclude soft_deleted by default unless explicitly requested
    if (!filters?.includeDeleted && !filters?.publishStatus) {
      conditions.push(ne(contentItems.publishStatus, 'soft_deleted' as any));
    }
    if (conditions.length > 0)
      return db.select().from(contentItems)
        .where(and(...conditions))
        .orderBy(desc(contentItems.createdAt));
    return db.select().from(contentItems)
      .where(ne(contentItems.publishStatus, 'soft_deleted' as any))
      .orderBy(desc(contentItems.createdAt));
  }

  async updateContentItem(id: string, data: Partial<ContentItem>): Promise<ContentItem | undefined> {
    const [ci] = await db.update(contentItems).set({ ...data, updatedAt: new Date() }).where(eq(contentItems.id, id)).returning();
    return ci;
  }

  async deleteContentItem(id: string): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async softDeleteContentItem(id: string, deletedBy: string): Promise<ContentItem | null> {
    const now = new Date();
    const permanentDeleteAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const [item] = await db.update(contentItems)
      .set({
        publishStatus: 'soft_deleted' as any,
        deletedAt: now,
        deletedByTeacherId: deletedBy,
        permanentDeleteScheduledAt: permanentDeleteAt,
      })
      .where(eq(contentItems.id, id))
      .returning();
    return item ?? null;
  }

  async restoreContentItem(id: string): Promise<ContentItem | null> {
    const [item] = await db.update(contentItems)
      .set({
        publishStatus: 'draft' as any,
        deletedAt: null,
        deletedByTeacherId: null,
        permanentDeleteScheduledAt: null,
      })
      .where(eq(contentItems.id, id))
      .returning();
    return item ?? null;
  }

  async permanentDeleteContentItem(id: string): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async getContentImpact(id: string): Promise<{ 
    viewCount: number; 
    progressCount: number; 
    linkedAssessments: string[] 
  }> {
    const [item] = await db.select({
      viewCount: contentItems.viewCount,
      progressCount: contentItems.progressCount,
      linkedAssessments: contentItems.linkedAssessments,
    }).from(contentItems).where(eq(contentItems.id, id));
    return {
      viewCount: item?.viewCount ?? 0,
      progressCount: item?.progressCount ?? 0,
      linkedAssessments: (item?.linkedAssessments as string[]) ?? [],
    };
  }

  async createConversionJob(data: Partial<ConversionJob>): Promise<ConversionJob> {
    const [cj] = await db.insert(conversionJobs).values(data as any).returning();
    return cj;
  }

  async getConversionJob(id: string): Promise<ConversionJob | undefined> {
    const [cj] = await db.select().from(conversionJobs).where(eq(conversionJobs.id, id));
    return cj;
  }

  async listConversionJobs(filters?: { contentId?: string; courseOfferingId?: string; status?: string }): Promise<ConversionJob[]> {
    const conditions = [];
    if (filters?.contentId) conditions.push(eq(conversionJobs.contentId, filters.contentId));
    if (filters?.courseOfferingId) conditions.push(eq(conversionJobs.courseOfferingId, filters.courseOfferingId));
    if (filters?.status) conditions.push(eq(conversionJobs.status, filters.status as any));
    if (conditions.length > 0) return db.select().from(conversionJobs).where(and(...conditions)).orderBy(desc(conversionJobs.updatedAt));
    return db.select().from(conversionJobs).orderBy(desc(conversionJobs.updatedAt));
  }

  async updateConversionJob(id: string, data: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
    const [cj] = await db.update(conversionJobs).set({ ...data, updatedAt: new Date() }).where(eq(conversionJobs.id, id)).returning();
    return cj;
  }

  async createAssessment(data: Partial<Assessment>): Promise<Assessment> {
    const [a] = await db.insert(assessments).values(data as any).returning();
    return a;
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [a] = await db.select().from(assessments).where(eq(assessments.id, id));
    return a;
  }

  async listAssessments(filters?: { courseOfferingId?: string; ownerTeacherId?: string }): Promise<Assessment[]> {
    const conditions = [];
    if (filters?.courseOfferingId) conditions.push(eq(assessments.courseOfferingId, filters.courseOfferingId));
    if (filters?.ownerTeacherId) conditions.push(eq(assessments.ownerTeacherId, filters.ownerTeacherId));
    if (conditions.length > 0) return db.select().from(assessments).where(and(...conditions));
    return db.select().from(assessments);
  }

  async updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment | undefined> {
    const [a] = await db.update(assessments).set({ ...data, updatedAt: new Date() }).where(eq(assessments.id, id)).returning();
    return a;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  async createSubmission(data: Partial<Submission>): Promise<Submission> {
    const [s] = await db.insert(submissions).values(data as any).returning();
    return s;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [s] = await db.select().from(submissions).where(eq(submissions.id, id));
    return s;
  }

  async getSubmissionByStudentAndAssessment(studentId: string, assessmentId: string): Promise<Submission | undefined> {
    const [s] = await db.select().from(submissions).where(
      and(eq(submissions.studentId, studentId), eq(submissions.assessmentId, assessmentId))
    );
    return s;
  }

  async listSubmissions(filters?: { assessmentId?: string; studentId?: string }): Promise<Submission[]> {
    const conditions = [];
    if (filters?.assessmentId) conditions.push(eq(submissions.assessmentId, filters.assessmentId));
    if (filters?.studentId) conditions.push(eq(submissions.studentId, filters.studentId));
    if (conditions.length > 0) return db.select().from(submissions).where(and(...conditions));
    return db.select().from(submissions);
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission | undefined> {
    const [s] = await db.update(submissions).set({ ...data, updatedAt: new Date() }).where(eq(submissions.id, id)).returning();
    return s;
  }

  async createThread(data: Partial<Thread>): Promise<Thread> {
    const [t] = await db.insert(threads).values(data as any).returning();
    return t;
  }

  async getThread(id: string): Promise<Thread | undefined> {
    const [t] = await db.select().from(threads).where(eq(threads.id, id));
    return t;
  }

  async listThreads(filters?: { courseOfferingId?: string; participantId?: string }): Promise<Thread[]> {
    if (filters?.courseOfferingId) {
      return db.select().from(threads).where(eq(threads.courseOfferingId, filters.courseOfferingId)).orderBy(desc(threads.lastMessageTime));
    }
    return db.select().from(threads).orderBy(desc(threads.lastMessageTime));
  }

  async updateThread(id: string, data: Partial<Thread>): Promise<Thread | undefined> {
    const [t] = await db.update(threads).set({ ...data, updatedAt: new Date() }).where(eq(threads.id, id)).returning();
    return t;
  }

  async createMessage(data: Partial<Message>): Promise<Message> {
    const [m] = await db.insert(messages).values(data as any).returning();
    return m;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [m] = await db.select().from(messages).where(eq(messages.id, id));
    return m;
  }

  async listMessages(threadId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | undefined> {
    const [m] = await db.update(messages).set({ ...data, updatedAt: new Date() }).where(eq(messages.id, id)).returning();
    return m;
  }

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const [a] = await db.insert(announcements).values(data as any).returning();
    return a;
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [a] = await db.select().from(announcements).where(eq(announcements.id, id));
    return a;
  }

  async listAnnouncements(filters?: { courseOfferingId?: string; instituteId?: string }): Promise<Announcement[]> {
    if (filters?.courseOfferingId) {
      return db.select().from(announcements).where(eq(announcements.courseOfferingId, filters.courseOfferingId)).orderBy(desc(announcements.createdAt));
    }
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement | undefined> {
    const [a] = await db.update(announcements).set({ ...data, updatedAt: new Date() }).where(eq(announcements.id, id)).returning();
    return a;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const [al] = await db.insert(auditLogs).values(data as any).returning();
    return al;
  }

  async listAuditLogs(filters?: { actorId?: string; action?: string; instituteId?: string }): Promise<AuditLog[]> {
    const conditions = [];
    if (filters?.actorId) conditions.push(eq(auditLogs.actorId, filters.actorId));
    if (filters?.action) conditions.push(eq(auditLogs.action, filters.action));
    if (filters?.instituteId) conditions.push(eq(auditLogs.instituteId, filters.instituteId));
    if (conditions.length > 0) return db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.timestamp));
    return db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  }

  async createAnalyticsEvent(data: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    const [ae] = await db.insert(analyticsEvents).values(data as any).returning();
    return ae;
  }

  async listAnalyticsEvents(filters?: { userId?: string; type?: string; instituteId?: string }): Promise<AnalyticsEvent[]> {
    const conditions = [];
    if (filters?.userId) conditions.push(eq(analyticsEvents.userId, filters.userId));
    if (filters?.type) conditions.push(eq(analyticsEvents.type, filters.type));
    if (filters?.instituteId) conditions.push(eq(analyticsEvents.instituteId, filters.instituteId));
    if (conditions.length > 0) return db.select().from(analyticsEvents).where(and(...conditions)).orderBy(desc(analyticsEvents.timestamp));
    return db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.timestamp));
  }

  async getPlatformSettings(instituteId: string): Promise<PlatformSettings | undefined> {
    const [ps] = await db.select().from(platformSettings).where(eq(platformSettings.instituteId, instituteId));
    return ps;
  }

  async upsertPlatformSettings(instituteId: string, data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const existing = await this.getPlatformSettings(instituteId);
    if (existing) {
      const [ps] = await db.update(platformSettings).set({ ...data, updatedAt: new Date() }).where(eq(platformSettings.instituteId, instituteId)).returning();
      return ps;
    }
    const [ps] = await db.insert(platformSettings).values({ ...data, instituteId } as any).returning();
    return ps;
  }

  async getHierarchyTree(instituteId: string): Promise<any> {
    try {
      const inst = await this.getInstitute(instituteId);
      if (!inst) {
        // Return a safe empty root instead of null — frontend always gets a valid tree shape
        console.warn(`[hierarchy] Institute not found: ${instituteId}`);
        return { id: instituteId, name: "Unknown Institute", type: "institute", studentCount: 0, children: [] };
      }

      const tree: any = {
        id: String(inst.id),
        name: inst.name,
        type: "institute",
        studentCount: 0,
        children: [],
      };

      let schoolList: any[] = [];
      try { schoolList = await this.listSchools(instituteId); }
      catch (e) { console.warn(`[hierarchy] Failed to load schools for institute ${instituteId}:`, e); }

      for (const school of schoolList) {
        if (!school.isActive) continue;
        const schoolNode: any = {
          id: String(school.id),
          name: school.name,
          type: "school",
          studentCount: 0,
          children: [],
        };

        let deptList: any[] = [];
        try { deptList = await this.listDepartments(school.id); }
        catch (e) { console.warn(`[hierarchy] Failed to load departments for school ${school.id}:`, e); }

        for (const dept of deptList) {
          if (!dept.isActive) continue;

          // Log orphaned department (schoolId mismatch)
          if (String(dept.schoolId) !== String(school.id)) {
            console.warn(`[hierarchy] Orphaned department ${dept.id}: schoolId=${dept.schoolId} doesn't match parent ${school.id}`);
          }

          const deptNode: any = {
            id: String(dept.id),
            name: dept.name,
            type: "department",
            studentCount: 0,
            children: [],
          };

          let progList: any[] = [];
          try { progList = await this.listPrograms(dept.id); }
          catch (e) { console.warn(`[hierarchy] Failed to load programs for department ${dept.id}:`, e); }

          for (const prog of progList) {
            if (!prog.isActive) continue;

            if (String(prog.departmentId) !== String(dept.id)) {
              console.warn(`[hierarchy] Orphaned program ${prog.id}: departmentId=${prog.departmentId} doesn't match parent ${dept.id}`);
            }

            const progNode: any = {
              id: String(prog.id),
              name: prog.name,
              type: "program",
              studentCount: 0,
              children: [],
            };

            let yearList: any[] = [];
            try { yearList = await this.listYears(prog.id); }
            catch (e) { console.warn(`[hierarchy] Failed to load years for program ${prog.id}:`, e); }

            for (const yr of yearList) {
              if (!yr.isActive) continue;

              let divList: any[] = [];
              try { divList = await this.listDivisions(yr.id); }
              catch (e) { console.warn(`[hierarchy] Failed to load divisions for year ${yr.id}:`, e); }

              const yearNode: any = {
                id: String(yr.id),
                name: yr.label,
                type: "year",
                studentCount: 0,
                children: divList.filter(d => d.isActive).map(d => ({
                  id: String(d.id),
                  name: d.name,
                  type: "division",
                  studentCount: d.studentCount || 0,
                  children: [],
                })),
              };
              yearNode.studentCount = yearNode.children.reduce((s: number, c: any) => s + c.studentCount, 0);
              progNode.children.push(yearNode);
            }
            progNode.studentCount = progNode.children.reduce((s: number, c: any) => s + c.studentCount, 0);
            deptNode.children.push(progNode);
          }
          deptNode.studentCount = deptNode.children.reduce((s: number, c: any) => s + c.studentCount, 0);
          schoolNode.children.push(deptNode);
        }
        schoolNode.studentCount = schoolNode.children.reduce((s: number, c: any) => s + c.studentCount, 0);
        tree.children.push(schoolNode);
      }
      tree.studentCount = tree.children.reduce((s: number, c: any) => s + c.studentCount, 0);
      return tree;
    } catch (error) {
      console.error(`[hierarchy] Critical error building hierarchy tree for institute ${instituteId}:`, error);
      return { id: instituteId, name: "Error loading hierarchy", type: "institute", studentCount: 0, children: [] };
    }
  }

  async getAdminStats(instituteId?: string): Promise<any> {
    const allStudents = await this.listUsers({ role: "student" });
    const allTeachers = await this.listUsers({ role: "teacher" });
    const allContent = await this.listContentItems();
    const allJobs = await this.listConversionJobs();

    const studentsWithDisabilities = allStudents.filter(s => {
      const d = s.disabilities as string[] | null;
      return d && d.length > 0;
    });

    const disabilityCounts: Record<string, number> = {};
    studentsWithDisabilities.forEach(s => {
      const d = s.disabilities as string[];
      d.forEach(dis => {
        disabilityCounts[dis] = (disabilityCounts[dis] || 0) + 1;
      });
    });

    const failedJobs = allJobs.filter(j => j.status === "failed");
    const publishedContent = allContent.filter(c => c.publishStatus === "published");

    // ── Compute 30-day trends ──────────────────────────
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo  = now - 60 * 24 * 60 * 60 * 1000;

    const trend = (items: any[]) => {
      const last30 = items.filter((x: any) =>
        new Date(x.createdAt).getTime() >= thirtyDaysAgo
      ).length;
      const prev30 = items.filter((x: any) => {
        const t = new Date(x.createdAt).getTime();
        return t >= sixtyDaysAgo && t < thirtyDaysAgo;
      }).length;
      if (prev30 === 0) return last30 > 0 ? "+100%" : "0%";
      const pct = Math.round(((last30 - prev30) / prev30) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const studentTrend    = trend(allStudents);
    const teacherTrend    = trend(allTeachers);
    const contentTrend    = trend(allContent);
    const disabledTrend   = trend(studentsWithDisabilities);

    return {
      totalStudents: allStudents.length,
      studentsWithDisabilities: studentsWithDisabilities.length,
      totalTeachers: allTeachers.length,
      contentItems: allContent.length,
      accessibilityCoverage: publishedContent.length > 0 ? Math.round((publishedContent.filter(c => {
        const f = c.formats as string[] | null;
        return f && f.length > 1;
      }).length / publishedContent.length) * 100) : 0,
      conversionFailureRate: allJobs.length > 0 ? Math.round((failedJobs.length / allJobs.length) * 100 * 10) / 10 : 0,
      studentTrend,
      teacherTrend,
      contentTrend,
      disabledTrend,
      disabilityBreakdown: Object.entries(disabilityCounts).map(([name, count]) => ({
        name,
        count,
        percentage: studentsWithDisabilities.length > 0 ? Math.round((count / studentsWithDisabilities.length) * 100) : 0,
      })),
      formatUsage: [
        {
          format: "Transcript",
          usage: allContent.filter((c: any) =>
            c.transcriptStatus === "COMPLETED" ||
            c.transcriptStatus === "APPROVED"
          ).length,
        },
        {
          format: "Simplified",
          usage: allContent.filter((c: any) =>
            c.simplifiedStatus === "COMPLETED" ||
            c.simplifiedStatus === "APPROVED" ||
            c.simplifiedStatus === "READYFORREVIEW"
          ).length,
        },
        {
          format: "Audio",
          usage: allContent.filter((c: any) =>
            c.audioStatus === "COMPLETED" ||
            c.audioStatus === "APPROVED"
          ).length,
        },
        {
          format: "High Contrast",
          usage: allContent.filter((c: any) =>
            c.highContrastStatus === "COMPLETED" ||
            c.highContrastStatus === "APPROVED"
          ).length,
        },
        {
          format: "Braille",
          usage: allContent.filter((c: any) =>
            c.brailleStatus === "COMPLETED" ||
            c.brailleStatus === "APPROVED"
          ).length,
        },
      ],
      monthlyConversions: (() => {
        // Group content by month of creation — last 6 months
        const now = new Date();
        const months: { month: string; conversions: number; students: number }[] = [];

        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const label = d.toLocaleString("default", {
            month: "short",
            year: "2-digit",
          });
          const monthStart = d.getTime();
          const monthEnd = new Date(
            d.getFullYear(), d.getMonth() + 1, 1
          ).getTime();

          const conversionsThisMonth = allContent.filter((c: any) => {
            const t = new Date(c.createdAt).getTime();
            return t >= monthStart && t < monthEnd;
          }).length;

          const studentsThisMonth = allStudents.filter((s: any) => {
            const t = new Date(s.createdAt).getTime();
            return t >= monthStart && t < monthEnd;
          }).length;

          months.push({
            month: label,
            conversions: conversionsThisMonth,
            students: studentsThisMonth,
          });
        }
        return months;
      })(),
    };
  }
}

export const storage = new DatabaseStorage();
