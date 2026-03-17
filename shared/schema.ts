import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);
export const publishStatusEnum = pgEnum("publish_status", ["published", "draft", "converting", "review_required", "soft_deleted", "failed"]);
export const enrollmentTypeEnum = pgEnum("enrollment_type", ["admin_assigned", "student_selected"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "waitlisted", "withdrawn"]);
export const conversionStatusEnum = pgEnum("conversion_status", ["completed", "in_progress", "failed", "ready_for_review", "pending", "approved", "rejected"]);
export const contentTypeEnum = pgEnum("content_type", ["pdf", "video", "audio", "document", "presentation", "image", "url"]);
export const assessmentTypeEnum = pgEnum("assessment_type", ["quiz", "assignment", "exam", "project"]);
export const assessmentStatusEnum = pgEnum("assessment_status", ["upcoming", "in_progress", "completed", "graded", "paused"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "short_answer", "essay", "file_upload", "multi_select", "audio", "video"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "audio", "video", "file"]);
export const announcementStatusEnum = pgEnum("announcement_status", ["draft", "published", "scheduled"]);
export const hierarchyTypeEnum = pgEnum("hierarchy_type", ["institute", "school", "department", "program", "year", "division"]);
export const courseTypeEnum = pgEnum("course_type", ["core", "elective"]);
export const formatTypeEnum = pgEnum("format_type", ["original", "audio", "captions", "transcript", "simplified", "high_contrast", "braille"]);
export const submissionStatusEnum = pgEnum("submission_status", ["in_progress", "paused", "submitted", "graded"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  status: userStatusEnum("status").notNull().default("active"),
  avatar: text("avatar"),
  instituteId: varchar("institute_id"),
  programId: varchar("program_id"),
  yearId: varchar("year_id"),
  divisionId: varchar("division_id"),
  departmentId: varchar("department_id"),
  program: text("program"),
  year: integer("year"),
  division: text("division"),
  disabilities: jsonb("disabilities").$type<string[]>().default([]),
  preferences: jsonb("preferences").$type<{
    fontSize: number;
    ttsSpeed: number;
    extendedTimeMultiplier: number;
    contrastMode: boolean;
    screenReader?: string;
    brailleDisplay?: string;
    preferredNotification?: string[];
    aacDeviceModel?: string;
    voiceEnabled?: boolean;
  }>().default({ fontSize: 1.0, ttsSpeed: 1.0, extendedTimeMultiplier: 1.0, contrastMode: false, voiceEnabled: false }),
  activeModules: jsonb("active_modules").$type<string[]>().default([]),
  profileCompleted: boolean("profile_completed").default(false),
  profileSetupCompletedAt: timestamp("profile_setup_completed_at"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const institutes = pgTable("institutes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logoUrl: text("logo_url"),
  settings: jsonb("settings").$type<{
    hierarchyLabels?: Record<string, string>;
    defaultLanguage?: string;
    academicYearStartMonth?: number;
    primaryColor?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  instituteId: varchar("institute_id").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  departmentId: varchar("department_id").notNull(),
  schoolId: varchar("school_id"),
  instituteId: varchar("institute_id").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type"),
  durationYears: integer("duration_years"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const years = pgTable("years", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  number: integer("number").notNull(),
  label: text("label").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const divisions = pgTable("divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  yearId: varchar("year_id").notNull(),
  programId: varchar("program_id"),
  name: text("name").notNull(),
  capacity: integer("capacity"),
  studentCount: integer("student_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id").notNull(),
  name: text("name").notNull(),
  academicYear: text("academic_year"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id"),
  departmentId: varchar("department_id"),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  credits: integer("credits"),
  courseType: courseTypeEnum("course_type").default("core"),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseOfferings = pgTable("course_offerings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  termId: varchar("term_id"),
  instituteId: varchar("institute_id"),
  term: text("term"),
  year: integer("year"),
  divisions: jsonb("divisions").$type<string[]>().default([]),
  teachers: jsonb("teachers").$type<{ teacherId: string; sectionNames: string[]; assignedAt: string }[]>().default([]),
  studentCount: integer("student_count").default(0),
  capacity: integer("capacity").default(100),
  enrollmentType: enrollmentTypeEnum("enrollment_type").default("admin_assigned"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  courseOfferingId: varchar("course_offering_id").notNull(),
  sectionName: text("section_name"),
  enrollmentType: enrollmentTypeEnum("enrollment_type").default("admin_assigned"),
  status: enrollmentStatusEnum("status").default("active"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  enrolledByAdminId: varchar("enrolled_by_admin_id"),
  waitlistPosition: integer("waitlist_position"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const electiveGroups = pgTable("elective_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id"),
  programId: varchar("program_id"),
  yearId: varchar("year_id"),
  termId: varchar("term_id"),
  name: text("name").notNull(),
  courseIds: jsonb("course_ids").$type<string[]>().default([]),
  minSelections: integer("min_selections").default(1),
  maxSelections: integer("max_selections").default(1),
  selectionDeadline: timestamp("selection_deadline"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id"),
  courseId: varchar("course_id"),
  courseOfferingId: varchar("course_offering_id").notNull(),
  ownerTeacherId: varchar("owner_teacher_id"),
  title: text("title").notNull(),
  description: text("description"),
  tags: jsonb("tags").$type<string[]>().default([]),
  contentType: contentTypeEnum("content_type").default("pdf"),
  type: text("type"),
  originalFilePath: text("original_file_path"),
  originalMimeType: text("original_mime_type"),
  originalSizeBytes: integer("original_size_bytes"),
  originalFilename: text("original_filename"),
  fileSize: text("file_size"),
  duration: text("duration"),
  formats: jsonb("formats").$type<string[]>().default(["original"]),
  availableFormats: jsonb("available_formats").$type<Record<string, { path: string; status: string; errorMessage?: string } | null>>().default({}),
  publishStatus: publishStatusEnum("publish_status").default("draft"),
  conversionProgress: jsonb("conversion_progress").$type<{ tier1: string; tier2: string }>().default({ tier1: "in_progress", tier2: "in_progress" }),
  uploadedBy: varchar("uploaded_by"),
  sections: jsonb("sections").$type<string[]>().default([]),
  visibilityScope: text("visibility_scope").default("offering"),
  specificStudentIds: jsonb("specific_student_ids").$type<string[]>().default([]),
  viewCount: integer("view_count").default(0),
  progressCount: integer("progress_count").default(0),
  linkedAssessments: jsonb("linked_assessments").$type<string[]>().default([]),
  // ─── Per-format conversion paths & statuses ─────────────────────────────────
  audioPath: text("audio_path"),
  audioStatus: text("audio_status").default("PENDING"),
  transcriptPath: text("transcript_path"),
  transcriptStatus: text("transcript_status").default("PENDING"),
  simplifiedPath: text("simplified_path"),
  simplifiedStatus: text("simplified_status").default("PENDING"),
  highContrastPath: text("high_contrast_path"),
  highContrastStatus: text("high_contrast_status").default("PENDING"),
  braillePath: text("braille_path"),
  brailleStatus: text("braille_status").default("PENDING"),
  conversionError: text("conversion_error"),
  deletedAt: timestamp("deleted_at"),
  deletedByTeacherId: varchar("deleted_by_teacher_id"),
  permanentDeleteScheduledAt: timestamp("permanent_delete_scheduled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull(),
  courseOfferingId: varchar("course_offering_id"),
  contentTitle: text("content_title"),
  courseName: text("course_name"),
  teacherName: text("teacher_name"),
  formatType: formatTypeEnum("format_type").notNull(),
  tier: integer("tier").default(1),
  status: conversionStatusEnum("status").default("pending"),
  inputPath: text("input_path"),
  outputPath: text("output_path"),
  reviewedByTeacherId: varchar("reviewed_by_teacher_id"),
  reviewedAt: timestamp("reviewed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentProgress = pgTable("content_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  contentId: varchar("content_id").notNull(),
  courseOfferingId: varchar("course_offering_id"),
  progressPercent: integer("progress_percent").default(0),
  lastPosition: text("last_position"),
  lastFormat: text("last_format"),
  viewCount: integer("view_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseOfferingId: varchar("course_offering_id").notNull(),
  ownerTeacherId: varchar("owner_teacher_id"),
  title: text("title").notNull(),
  instructions: text("instructions"),
  type: assessmentTypeEnum("type").default("quiz"),
  timeLimitMinutes: integer("time_limit_minutes"),
  durationMinutes: integer("duration_minutes"),
  questionCount: integer("question_count").default(0),
  allowedResponseTypes: jsonb("allowed_response_types").$type<string[]>().default(["text"]),
  questions: jsonb("questions").$type<{
    id: string;
    type: string;
    text: string;
    options?: { id: string; text: string }[];
    correctAnswers?: number[];
    marks?: number;
    answered?: boolean;
    selectedAnswer?: string;
  }[]>().default([]),
  publishStatus: text("assessment_publish_status").default("draft"),
  dueDate: timestamp("due_date"),
  openAt: timestamp("open_at"),
  closeAt: timestamp("close_at"),
  maxScore: integer("max_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseOfferingId: varchar("course_offering_id"),
  status: submissionStatusEnum("status").default("in_progress"),
  responses: jsonb("responses").$type<{
    questionId: string;
    responseType: string;
    textAnswer?: string;
    filePath?: string;
    score?: number;
  }[]>().default([]),
  appliedTimeMultiplier: real("applied_time_multiplier").default(1.0),
  timeStartedAt: timestamp("time_started_at"),
  pausedAt: timestamp("paused_at"),
  remainingSeconds: integer("remaining_seconds"),
  timeSubmittedAt: timestamp("time_submitted_at"),
  totalScore: integer("total_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id"),
  scope: text("scope").default("direct"),
  courseOfferingId: varchar("course_offering_id"),
  courseName: text("course_name"),
  sectionName: text("section_name"),
  participants: jsonb("participants").$type<{ id: string; name: string; role: string }[]>().default([]),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
  unreadCount: integer("unread_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name"),
  senderRole: text("sender_role"),
  type: messageTypeEnum("type").default("text"),
  content: text("content"),
  filePath: text("file_path"),
  transcript: text("transcript"),
  captionsPath: text("captions_path"),
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorId: varchar("author_id"),
  instituteId: varchar("institute_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  senderName: text("sender_name"),
  senderRole: text("sender_role"),
  attachments: jsonb("attachments").$type<{ path: string; filename: string }[]>().default([]),
  targetScope: text("target_scope").default("institute"),
  targetIds: jsonb("target_ids").$type<string[]>().default([]),
  courseOfferingId: varchar("course_offering_id"),
  courseName: text("course_name"),
  scope: text("scope"),
  isUrgent: boolean("is_urgent").default(false),
  urgent: boolean("urgent").default(false),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  publishedAt: timestamp("published_at"),
  status: announcementStatusEnum("announcement_status").default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  instituteId: varchar("institute_id"),
  courseOfferingId: varchar("course_offering_id"),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id"),
  actorRole: text("actor_role"),
  instituteId: varchar("institute_id"),
  action: text("action").notNull(),
  targetId: varchar("target_id"),
  targetType: text("target_type"),
  ipAddress: text("ip_address"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  instituteId: varchar("institute_id").notNull().unique(),
  institution: jsonb("institution").$type<{
    name?: string;
    logoPath?: string;
    domain?: string;
    defaultLanguage?: string;
    academicYearStartMonth?: number;
  }>().default({}),
  branding: jsonb("branding").$type<{
    primaryColorHex?: string;
    wcagContrastValid?: boolean;
  }>().default({}),
  apiKeys: jsonb("api_keys").$type<Record<string, string>>().default({}),
  integrations: jsonb("integrations").$type<Record<string, string>>().default({}),
  notifications: jsonb("notifications").$type<Record<string, string>>().default({}),
  security: jsonb("security").$type<{
    sessionTimeoutMinutes?: number;
    minPasswordLength?: number;
    auditLogRetentionDays?: number;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInstituteSchema = createInsertSchema(institutes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertYearSchema = createInsertSchema(years).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDivisionSchema = createInsertSchema(divisions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTermSchema = createInsertSchema(terms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseOfferingSchema = createInsertSchema(courseOfferings).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContentItemSchema = createInsertSchema(contentItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversionJobSchema = createInsertSchema(conversionJobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertThreadSchema = createInsertSchema(threads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Institute = typeof institutes.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Year = typeof years.$inferSelect;
export type Division = typeof divisions.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type CourseOffering = typeof courseOfferings.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
export type ConversionJob = typeof conversionJobs.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type PlatformSettings = typeof platformSettings.$inferSelect;
