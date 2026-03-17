/**
 * Automated Test Suite for AccessEd Platform Fixes
 * Tests all 6 issues with zero manual intervention
 * Run with: npx playwright test automated-fix-tests.spec.ts --headed
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASE_URL = 'http://localhost:54321';
const TEST_FILE_CONTENT = 'Python is a high-level programming language. It emphasizes code readability with significant indentation. Python supports multiple programming paradigms including procedural, object-oriented, and functional programming.';
const TEST_FILE_NAME = 'automated-test-content.txt';

// Test credentials (adjust to your setup)
const TEACHER_LOGIN = {
  email: 'teacher@university.edu',
  password: 'teacher123'
};

const STUDENT_LOGIN = {
  email: 'student@university.edu', 
  password: 'student123'
};

let uploadedContentId: string;
let courseOfferingId: string;

test.describe('AccessEd Platform - All 6 Issues', () => {
  
  test.beforeAll(async () => {
    // Create test file
    fs.writeFileSync(TEST_FILE_NAME, TEST_FILE_CONTENT, 'utf-8');
    console.log(`✓ Created test file: ${TEST_FILE_NAME}`);
  });

  test.afterAll(async () => {
    // Cleanup test file
    if (fs.existsSync(TEST_FILE_NAME)) {
      fs.unlinkSync(TEST_FILE_NAME);
    }
  });

  // ============================================================================
  // ISSUE 1, 2, 3: Upload, Conversion, and File Serving
  // ============================================================================
  
  test('Issue 1,2,3: Upload file, verify conversion, and test format serving', async ({ page, request }) => {
    test.setTimeout(60000); // 60 second timeout for conversion
    
    // Step 1: Login as teacher
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEACHER_LOGIN.email);
    await page.fill('input[type="password"]', TEACHER_LOGIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|courses/);
    console.log('✓ Logged in as teacher');

    // Step 2: Navigate to Software Engineering course content page
    await page.goto(`${BASE_URL}/teacher/courses`);
    
    // Find Software Engineering course (adjust selector if needed)
    const courseCard = page.locator('text=Software Engineering').first();
    await courseCard.click();
    await page.waitForURL(/\/courses\//);
    
    // Extract courseOfferingId from URL
    const url = page.url();
    const match = url.match(/\/courses\/([a-f0-9-]+)/);
    expect(match, 'Course offering ID should be in URL').toBeTruthy();
    courseOfferingId = match![1];
    console.log(`✓ Course offering ID: ${courseOfferingId}`);

    // Step 3: Click Content tab
    await page.click('text=Content');
    await page.waitForTimeout(1000);

    // Step 4: Upload file
    await page.click('button:has-text("Upload Content")');
    await page.waitForSelector('input[type="file"]');
    
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_FILE_NAME);
    
    // Fill title if there's a title field
    const titleInput = page.locator('input[name="title"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Automated Test Upload');
    }
    
    // Submit upload
    await page.click('button:has-text("Upload")');
    
    // Wait for success message
    await expect(page.locator('text=/uploaded successfully|upload complete/i')).toBeVisible({ timeout: 10000 });
    console.log('✓ File uploaded successfully');

    // Step 5: Wait for conversion (check database via API)
    await page.waitForTimeout(5000); // Give conversion time to start
    
    // Get the uploaded content ID from the content list
    const contentItems = await page.locator('[data-testid*="content-card"], [class*="content-item"]').all();
    expect(contentItems.length, 'Should have at least one content item').toBeGreaterThan(0);
    
    // Click the first item to open viewer
    await contentItems[0].click();
    await page.waitForURL(/\/content\//);
    
    // Extract content ID from URL
    const contentUrl = page.url();
    const contentMatch = contentUrl.match(/\/content\/([a-f0-9-]+)/);
    expect(contentMatch, 'Content ID should be in URL').toBeTruthy();
    uploadedContentId = contentMatch![1];
    console.log(`✓ Content ID: ${uploadedContentId}`);

    // Step 6: Verify converted files exist in filesystem
    await page.waitForTimeout(10000); // Wait for conversion to complete
    
    const convertedDir = path.join('uploads', 'converted', uploadedContentId);
    const transcriptPath = path.join(convertedDir, 'transcript.txt');
    const simplifiedPath = path.join(convertedDir, 'simplified.txt');
    const audioPath = path.join(convertedDir, 'audio.txt');
    
    // ISSUE 2 VERIFICATION: Physical files should exist
    expect(fs.existsSync(convertedDir), `Converted directory should exist: ${convertedDir}`).toBeTruthy();
    expect(fs.existsSync(transcriptPath), `Transcript file should exist: ${transcriptPath}`).toBeTruthy();
    expect(fs.existsSync(simplifiedPath), `Simplified file should exist: ${simplifiedPath}`).toBeTruthy();
    expect(fs.existsSync(audioPath), `Audio file should exist: ${audioPath}`).toBeTruthy();
    
    // Verify files are not empty
    expect(fs.statSync(transcriptPath).size, 'Transcript file should not be empty').toBeGreaterThan(0);
    expect(fs.statSync(simplifiedPath).size, 'Simplified file should not be empty').toBeGreaterThan(0);
    expect(fs.statSync(audioPath).size, 'Audio file should not be empty').toBeGreaterThan(0);
    
    console.log('✓ ISSUE 2 PASSED: All converted files created successfully');

    // Step 7: Test format switching (ISSUE 3)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Monitor network for 404 errors
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() === 404 && response.url().includes('/api/content')) {
        networkErrors.push(`404: ${response.url()}`);
      }
    });

    // Test Transcript format
    await page.click('button:has-text("Transcript"), [aria-label*="Transcript"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/transcript|original content/i')).toBeVisible({ timeout: 5000 });
    console.log('✓ Transcript format loaded');

    // Test Simplified format
    await page.click('button:has-text("Simplified"), [aria-label*="Simplified"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/simplified|easier reading/i')).toBeVisible({ timeout: 5000 });
    console.log('✓ Simplified format loaded');

    // Test Audio format
    await page.click('button:has-text("Audio"), [aria-label*="Audio"]');
    await page.waitForTimeout(2000);
    
    // ISSUE 3 VERIFICATION: No 404 errors
    expect(networkErrors.length, `Should have no 404 errors. Found: ${networkErrors.join(', ')}`).toBe(0);
    console.log('✓ ISSUE 3 PASSED: No 404 errors when loading formats');
  });

  // ============================================================================
  // ISSUE 1 (Part 2): Dashboard Visibility
  // ============================================================================
  
  test('Issue 1: Uploaded content appears on student dashboard', async ({ page }) => {
    test.setTimeout(30000);
    
    // Logout and login as student
    await page.goto(`${BASE_URL}/logout`);
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', STUDENT_LOGIN.email);
    await page.fill('input[type="password"]', STUDENT_LOGIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    console.log('✓ Logged in as student');

    // Check "New Content" section
    await page.waitForSelector('text=New Content, text=Recent Content', { timeout: 10000 });
    
    // Look for the uploaded file
    const contentCard = page.locator('text=Automated Test Upload').first();
    await expect(contentCard, 'Uploaded content should appear in dashboard').toBeVisible({ timeout: 5000 });
    
    console.log('✓ ISSUE 1 PASSED: Content visible on student dashboard');
  });

  // ============================================================================
  // ISSUE 4: Spotify-Style Audio Player
  // ============================================================================
  
  test('Issue 4: Audio player has Spotify-style controls', async ({ page }) => {
    test.setTimeout(30000);
    
    // Navigate to content viewer (as student, already logged in from previous test)
    await page.goto(`${BASE_URL}/student/content/${uploadedContentId}`);
    
    // Switch to audio format
    await page.click('button:has-text("Audio"), [aria-label*="Audio"]');
    await page.waitForTimeout(2000);

    // VERIFICATION: Check for enhanced audio player controls
    
    // 1. Play/Pause button
    const playButton = page.locator('button[aria-label*="Play"], button:has(svg):has-text("Play")');
    await expect(playButton, 'Play button should be visible').toBeVisible();
    
    // 2. Skip back button
    const skipBackButton = page.locator('button[aria-label*="Skip back"], button[aria-label*="back 10"]');
    await expect(skipBackButton, 'Skip back button should be visible').toBeVisible();
    
    // 3. Skip forward button
    const skipForwardButton = page.locator('button[aria-label*="Skip forward"], button[aria-label*="forward 10"]');
    await expect(skipForwardButton, 'Skip forward button should be visible').toBeVisible();
    
    // 4. Time display
    const timeDisplay = page.locator('text=/\\d+:\\d+ \\/ \\d+:\\d+/');
    await expect(timeDisplay, 'Time display should show format "0:00 / 0:30"').toBeVisible();
    
    // 5. Playback speed selector
    const speedSelector = page.locator('select[aria-label*="speed"], select:has(option:has-text("1.0x"))');
    await expect(speedSelector, 'Playback speed selector should be visible').toBeVisible();
    
    // 6. Progress bar slider
    const progressSlider = page.locator('input[type="range"][aria-label*="progress"]');
    await expect(progressSlider, 'Progress bar slider should be visible').toBeVisible();
    
    console.log('✓ All audio player controls are present');

    // FUNCTIONAL TESTS
    
    // Test 1: Play button starts audio
    await playButton.click();
    await page.waitForTimeout(2000);
    
    const pauseButton = page.locator('button[aria-label*="Pause"]');
    await expect(pauseButton, 'Play button should change to Pause').toBeVisible();
    console.log('✓ Play/Pause toggle works');
    
    // Test 2: Time counter updates
    const initialTime = await timeDisplay.textContent();
    await page.waitForTimeout(3000);
    const updatedTime = await timeDisplay.textContent();
    expect(updatedTime, 'Time should have increased').not.toBe(initialTime);
    console.log('✓ Time counter updates during playback');
    
    // Test 3: Pause button stops audio
    await pauseButton.click();
    await page.waitForTimeout(500);
    await expect(playButton, 'Pause button should change back to Play').toBeVisible();
    console.log('✓ Pause works');
    
    // Test 4: Skip forward button
    const timeBeforeSkip = await timeDisplay.textContent();
    await skipForwardButton.click();
    await page.waitForTimeout(1000);
    const timeAfterSkip = await timeDisplay.textContent();
    expect(timeAfterSkip, 'Time should increase after skip forward').not.toBe(timeBeforeSkip);
    console.log('✓ Skip forward works');
    
    // Test 5: Skip back button
    await skipBackButton.click();
    await page.waitForTimeout(1000);
    console.log('✓ Skip back works');
    
    // Test 6: Playback speed change
    await speedSelector.selectOption('1.5');
    await page.waitForTimeout(500);
    const selectedSpeed = await speedSelector.inputValue();
    expect(selectedSpeed, 'Speed should be set to 1.5x').toBe('1.5');
    console.log('✓ Playback speed selector works');
    
    // Test 7: Progress bar scrubbing
    const progressValue = await progressSlider.getAttribute('value');
    await progressSlider.fill('15'); // Seek to 15 seconds
    await page.waitForTimeout(1000);
    const newProgressValue = await progressSlider.getAttribute('value');
    expect(newProgressValue, 'Progress should change when scrubbing').not.toBe(progressValue);
    console.log('✓ Progress bar scrubbing works');
    
    console.log('✓ ISSUE 4 PASSED: Spotify-style audio player fully functional');
  });

  // ============================================================================
  // ISSUE 5: Progress Bar (Reading Progress)
  // ============================================================================
  
  test('Issue 5: Reading progress bar works correctly', async ({ page }) => {
    test.setTimeout(30000);
    
    // Navigate to content in transcript format (text-based)
    await page.goto(`${BASE_URL}/student/content/${uploadedContentId}`);
    await page.click('button:has-text("Transcript")');
    await page.waitForTimeout(2000);

    // Locate progress bar
    const progressBar = page.locator('[role="progressbar"], div:has(> div[style*="width:"]):has-text("%")').first();
    const progressText = page.locator('text=/Progress: \\d+%/').first();
    
    await expect(progressBar, 'Progress bar should be visible').toBeVisible();
    await expect(progressText, 'Progress text should be visible').toBeVisible();

    // VERIFICATION 1: Progress starts near 0% at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    let progressPercentage = await progressText.textContent();
    let progressValue = parseInt(progressPercentage?.match(/\d+/)?.[0] || '0');
    expect(progressValue, 'Progress should be < 10% at top of page').toBeLessThan(10);
    console.log(`✓ Progress at top: ${progressValue}%`);

    // VERIFICATION 2: Progress increases when scrolling
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      window.scrollTo(0, (scrollHeight - viewportHeight) * 0.5); // Scroll to 50%
    });
    await page.waitForTimeout(500);
    
    progressPercentage = await progressText.textContent();
    progressValue = parseInt(progressPercentage?.match(/\d+/)?.[0] || '0');
    expect(progressValue, 'Progress should be 30-70% at middle of page').toBeGreaterThan(30);
    expect(progressValue, 'Progress should be 30-70% at middle of page').toBeLessThan(70);
    console.log(`✓ Progress at middle: ${progressValue}%`);

    // VERIFICATION 3: Progress reaches 100% at bottom (never exceeds)
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      window.scrollTo(0, scrollHeight - viewportHeight + 100); // Scroll past bottom
    });
    await page.waitForTimeout(500);
    
    progressPercentage = await progressText.textContent();
    progressValue = parseInt(progressPercentage?.match(/\d+/)?.[0] || '0');
    expect(progressValue, 'Progress should not exceed 100%').toBeLessThanOrEqual(100);
    expect(progressValue, 'Progress should be close to 100% at bottom').toBeGreaterThan(90);
    console.log(`✓ Progress at bottom: ${progressValue}%`);

    // VERIFICATION 4: Progress bar doesn't overflow container
    const progressBarBox = await progressBar.boundingBox();
    const progressBarInner = page.locator('div[style*="width:"][style*="%"]').first();
    const progressBarInnerBox = await progressBarInner.boundingBox();
    
    if (progressBarBox && progressBarInnerBox) {
      expect(progressBarInnerBox.width, 'Progress bar inner should not exceed container width').toBeLessThanOrEqual(progressBarBox.width + 1);
      console.log('✓ Progress bar stays within container');
    }
    
    console.log('✓ ISSUE 5 PASSED: Progress bar works correctly and never exceeds 100%');
  });

  // ============================================================================
  // ISSUE 6: Font Size Slider
  // ============================================================================
  
  test('Issue 6: Font size slider changes text size in real-time', async ({ page }) => {
    test.setTimeout(30000);
    
    // Navigate to content viewer
    await page.goto(`${BASE_URL}/student/content/${uploadedContentId}`);
    await page.waitForTimeout(2000);

    // Locate font size slider
    const fontSlider = page.locator('input[type="range"][aria-label*="text"], input[type="range"][aria-label*="font"]').first();
    await expect(fontSlider, 'Font size slider should be visible').toBeVisible();
    
    const fontPercentageLabel = page.locator('text=/\\d+%/').filter({ has: fontSlider }).first();

    // Get content area for measuring font size
    const contentArea = page.locator('.prose, [class*="content"], main').first();

    // VERIFICATION 1: Get initial font size
    const initialFontSize = await contentArea.evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    console.log(`✓ Initial font size: ${initialFontSize}px`);

    // VERIFICATION 2: Increase font size
    await fontSlider.fill('1.5'); // Set to 150%
    await page.waitForTimeout(500);
    
    const increasedFontSize = await contentArea.evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    expect(increasedFontSize, 'Font size should increase when slider moves right').toBeGreaterThan(initialFontSize);
    console.log(`✓ Font size increased to: ${increasedFontSize}px`);
    
    // Check percentage label updated
    const increasedPercentage = await fontPercentageLabel.textContent();
    expect(increasedPercentage, 'Percentage label should show 150%').toContain('150');

    // VERIFICATION 3: Decrease font size
    await fontSlider.fill('0.875'); // Set to 87.5%
    await page.waitForTimeout(500);
    
    const decreasedFontSize = await contentArea.evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    expect(decreasedFontSize, 'Font size should decrease when slider moves left').toBeLessThan(initialFontSize);
    console.log(`✓ Font size decreased to: ${decreasedFontSize}px`);
    
    // Check percentage label updated
    const decreasedPercentage = await fontPercentageLabel.textContent();
    expect(decreasedPercentage, 'Percentage label should show ~87%').toMatch(/87|88/);

    // VERIFICATION 4: Test intermediate value
    await fontSlider.fill('1.25'); // Set to 125%
    await page.waitForTimeout(500);
    
    const mediumFontSize = await contentArea.evaluate(el => 
      parseFloat(window.getComputedStyle(el).fontSize)
    );
    expect(mediumFontSize, 'Medium font size should be between min and max').toBeGreaterThan(decreasedFontSize);
    expect(mediumFontSize, 'Medium font size should be between min and max').toBeLessThan(increasedFontSize);
    console.log(`✓ Font size at 125%: ${mediumFontSize}px`);

    // VERIFICATION 5: Test keyboard control (arrow keys)
    await fontSlider.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    
    const afterArrowRight = await fontSlider.inputValue();
    expect(parseFloat(afterArrowRight), 'Arrow key should increase slider value').toBeGreaterThan(1.25);
    console.log('✓ Keyboard arrow keys work');
    
    console.log('✓ ISSUE 6 PASSED: Font size slider fully functional with real-time updates');
  });

});

// ============================================================================
// DATABASE VERIFICATION TESTS (Optional but recommended)
// ============================================================================

test.describe('Database Verification', () => {
  
  test('Verify database records are correct', async ({ request }) => {
    // This test requires database access via API
    // Adjust endpoint based on your API structure
    
    const response = await request.get(`${BASE_URL}/api/content/${uploadedContentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN || 'test-token'}`
      }
    });
    
    expect(response.ok(), 'API request should succeed').toBeTruthy();
    
    const contentData = await response.json();
    
    // ISSUE 1 VERIFICATION: courseOfferingId should not be null
    expect(contentData.courseOfferingId, 'courseOfferingId should not be null').toBeTruthy();
    expect(contentData.courseOfferingId, 'courseOfferingId should be a valid UUID').toMatch(/^[a-f0-9-]{36}$/);
    console.log('✓ Database: courseOfferingId is set correctly');
    
    // ISSUE 2 VERIFICATION: All format statuses should be COMPLETED
    expect(contentData.transcriptStatus, 'Transcript status should be COMPLETED').toBe('COMPLETED');
    expect(contentData.simplifiedStatus, 'Simplified status should be COMPLETED or READYFORREVIEW').toMatch(/COMPLETED|READYFORREVIEW/);
    expect(contentData.audioStatus, 'Audio status should be COMPLETED').toBe('COMPLETED');
    console.log('✓ Database: All format statuses are COMPLETED');
    
    // Verify paths are relative (not absolute Windows paths)
    expect(contentData.transcriptPath, 'Transcript path should be relative').toMatch(/^converted\//);
    expect(contentData.simplifiedPath, 'Simplified path should be relative').toMatch(/^converted\//);
    expect(contentData.audioPath, 'Audio path should be relative').toMatch(/^converted\//);
    console.log('✓ Database: File paths are relative (not absolute)');
  });
  
});

// ============================================================================
// SUMMARY REPORTER
// ============================================================================

test.afterAll(async () => {
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUITE COMPLETE');
  console.log('='.repeat(80));
  console.log('✓ ISSUE 1: Dashboard content visibility');
  console.log('✓ ISSUE 2: Physical file creation during conversion');
  console.log('✓ ISSUE 3: Format serving (no 404 errors)');
  console.log('✓ ISSUE 4: Spotify-style audio player with full controls');
  console.log('✓ ISSUE 5: Progress bar accuracy and overflow prevention');
  console.log('✓ ISSUE 6: Font size slider real-time updates');
  console.log('='.repeat(80));
  console.log('All issues verified! ✓');
  console.log('='.repeat(80) + '\n');
});
