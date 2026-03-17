#!/usr/bin/env python3
import re

# Read the file
with open('server/routes.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace req.params.X with proper type casting
# This looks for lines with req.params.propertyName and adds type assertions
patterns = [
    (r'const co = await storage\.getCourseOffering\(req\.params\.id\)', 
     'const { id } = req.params as { id: string };\n      const co = await storage.getCourseOffering(id)'),
    
    (r'const tree = await storage\.getHierarchyTree\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const tree = await storage.getHierarchyTree(id)'),
    
    (r'const school = await storage\.getSchool\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const school = await storage.getSchool(id)'),
    
    (r'const dept = await storage\.getDepartment\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const dept = await storage.getDepartment(id)'),
    
    (r'const yr = await storage\.getYear\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const yr = await storage.getYear(id)'),
    
    (r'const course = await storage\.updateCourse\(req\.params\.id, req\.body\)',
     'const { id } = req.params as { id: string };\n      const course = await storage.updateCourse(id, req.body)'),
    
    (r'await storage\.deleteCourse\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      await storage.deleteCourse(id)'),
    
    (r'const co = await storage\.getCourseOffering\(req\.params\.offeringId\)',
     'const { offeringId } = req.params as { offeringId: string };\n      const co = await storage.getCourseOffering(offeringId)'),
    
    (r'const updated = await storage\.updateCourseOffering\(req\.params\.offeringId',
     'const { offeringId } = req.params as { offeringId: string };\n      const updated = await storage.updateCourseOffering(offeringId'),
     
    (r'const enrollment = await storage\.getEnrollment\(req\.params\.enrollmentId\)',
     'const { enrollmentId } = req.params as { enrollmentId: string };\n      const enrollment = await storage.getEnrollment(enrollmentId)'),
    
    (r'await storage\.updateEnrollment\(req\.params\.enrollmentId',
     'const { enrollmentId } = req.params as { enrollmentId: string };\n      await storage.updateEnrollment(enrollmentId'),
    
    (r'await storage\.deleteEnrollment\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      await storage.deleteEnrollment(id)'),
    
    (r'const item = await storage\.getContentItem\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const item = await storage.getContentItem(id)'),
    
    (r'const item = await storage\.updateContentItem\(req\.params\.id, req\.body\)',
     'const { id } = req.params as { id: string };\n      const item = await storage.updateContentItem(id, req.body)'),
    
    (r'const item = await storage\.updateContentItem\(req\.params\.id, \{ publish',
     'const { id } = req.params as { id: string };\n      const item = await storage.updateContentItem(id, { publish'),
    
    (r'const item = await storage\.softDeleteContentItem\(req\.params\.id',
     'const { id } = req.params as { id: string };\n      const item = await storage.softDeleteContentItem(id'),
    
    (r'const impact = await storage\.getContentImpact\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const impact = await storage.getContentImpact(id)'),
    
    (r'const item = await storage\.restoreContentItem\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const item = await storage.restoreContentItem(id)'),
    
    (r'await storage\.permanentDeleteContentItem\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      await storage.permanentDeleteContentItem(id)'),
    
    (r'const item = await storage\.getContentItem\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const item = await storage.getContentItem(id)'),
    
    (r'const assessment = await storage\.getAssessment\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const assessment = await storage.getAssessment(id)'),
    
    (r'const assessment = await storage\.updateAssessment\(req\.params\.id, req\.body\)',
     'const { id } = req.params as { id: string };\n      const assessment = await storage.updateAssessment(id, req.body)'),
    
    (r'await storage\.deleteAssessment\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      await storage.deleteAssessment(id)'),
    
    (r'const job = await storage\.updateConversionJob\(req\.params\.jobId',
     'const { jobId } = req.params as { jobId: string };\n      const job = await storage.updateConversionJob(jobId'),
    
    (r'const job = await storage\.getConversionJob\(req\.params\.jobId\)',
     'const { jobId } = req.params as { jobId: string };\n      const job = await storage.getConversionJob(jobId)'),
     
    (r'const updated = await storage\.updateConversionJob\(req\.params\.jobId',
     'const { jobId } = req.params as { jobId: string };\n      const updated = await storage.updateConversionJob(jobId'),
    
    (r'const thread = await storage\.getThread\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const thread = await storage.getThread(id)'),
    
    (r'const list = await storage\.listMessages\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const list = await storage.listMessages(id)'),
    
    (r'await storage\.updateThread\(req\.params\.id',
     'const { id } = req.params as { id: string };\n      await storage.updateThread(id'),
    
    (r'const announcement = await storage\.getAnnouncement\(req\.params\.id\)',
     'const { id } = req.params as { id: string };\n      const announcement = await storage.getAnnouncement(id)'),
]

# Apply patterns
for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content)

# Write back
with open('server/routes.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all req.params type issues!")
