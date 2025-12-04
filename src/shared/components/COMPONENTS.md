# Component Catalog

This document provides a quick reference guide to all reusable components in the `src/shared/components/` directory.

## Table of Contents

- [Error Components](#error-components)
- [Expert Coaching Components](#expert-coaching-components)
- [Layout Components](#layout-components)
- [Social Components](#social-components)
- [Analysis Components](#analysis-components)
- [Chart Components](#chart-components)
- [Modal Components](#modal-components)
- [Profile Components](#profile-components)
- [Upload Components](#upload-components)
- [Workout Components](#workout-components)
- [Verification Components](#verification-components)
- [Landing Components](#landing-components)

---

## Error Components

### ErrorBanner

Displays error messages in a prominent banner format.

**Location:** `errors/ErrorBanner.jsx`

**Props:**
- `message` (string, required) - Error message to display
- `type` (string, optional) - Error type: 'error' | 'warning' | 'info' (default: 'error')
- `onDismiss` (Function, optional) - Callback when user dismisses the error
- `style` (Object, optional) - Optional inline styles

**Example:**
```jsx
<ErrorBanner 
  message="Failed to load data" 
  onDismiss={() => setError(null)}
/>
```

**See also:** [Error Handling Guide](../../utils/ERROR_HANDLING.md)

---

### ErrorMessage

Displays inline error messages, typically for form validation.

**Location:** `errors/ErrorMessage.jsx`

**Props:**
- `message` (string, required) - Error message to display
- `size` (string, optional) - Message size: 'small' | 'medium' (default: 'small')
- `style` (Object, optional) - Optional inline styles

**Example:**
```jsx
<ErrorMessage message="This field is required" />
```

---

### ErrorBoundary

React error boundary component for catching and displaying errors.

**Location:** `errors/ErrorBoundary.jsx`

**Props:**
- `children` (React.ReactNode, required) - Child components to wrap
- `onError` (Function, optional) - Callback when error occurs: (error, errorInfo) => void
- `fallback` (React.Component, optional) - Custom fallback component

**Example:**
```jsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**See also:** [Error Handling Guide](../../utils/ERROR_HANDLING.md)

---

## Expert Coaching Components

### ConsultationStatusBadge

Displays consultation status with color-coded badge.

**Location:** `expert-coaching/ConsultationStatusBadge.jsx`

**Props:**
- `status` (string, required) - Consultation status: 'pending', 'pending_booking', 'scheduled', 'active', 'completed', 'cancelled'
- `size` (string, optional) - Badge size: 'small' | 'medium' | 'large' (default: 'medium')

**Example:**
```jsx
<ConsultationStatusBadge status="scheduled" size="large" />
```

**See also:** `expertCoachingConstants`, `createStatusBadgeStyle`

---

### ConsultationTimestamps

Displays consultation lifecycle timestamps (created, started, completed, cancelled).

**Location:** `expert-coaching/ConsultationTimestamps.jsx`

**Props:**
- `consultation` (Object, required) - Consultation object with timestamp fields:
  - `created_at` (string, optional) - ISO timestamp
  - `started_at` (string, optional) - ISO timestamp
  - `completed_at` (string, optional) - ISO timestamp
  - `cancelled_at` (string, optional) - ISO timestamp
- `style` (Object, optional) - Inline styles to override default container styles

**Example:**
```jsx
<ConsultationTimestamps consultation={consultationData} />
```

**Note:** All timestamps displayed in user's local timezone

---

### ConsultationScheduledTime

Displays scheduled consultation times in Eastern timezone.

**Location:** `expert-coaching/ConsultationScheduledTime.jsx`

**Props:**
- `consultation` (Object, required) - Consultation object:
  - `scheduled_start_time` (string, required) - ISO timestamp
  - `scheduled_end_time` (string, optional) - ISO timestamp
  - `booking_requested_at` (string, optional) - ISO timestamp
  - `booking_confirmed_at` (string, optional) - ISO timestamp
  - `meeting_link` (string, optional) - Google Meet link
- `variant` (string, optional) - Display variant: 'full' | 'compact' | 'inline' (default: 'full')
- `style` (Object, optional) - Inline styles to override default container styles

**Example:**
```jsx
// Full variant (default)
<ConsultationScheduledTime consultation={consultationData} />

// Compact variant
<ConsultationScheduledTime consultation={consultationData} variant="compact" />

// Inline variant
<p>Your consultation is scheduled for <ConsultationScheduledTime consultation={consultationData} variant="inline" />.</p>
```

**Note:** Always displays times in Eastern timezone (America/New_York)

---

### PTBookingInfo

Displays booking information for Personal Trainer view.

**Location:** `expert-coaching/PTBookingInfo.jsx`

**Props:**
- `consultation` (Object, required) - Consultation object with status 'pending_booking' or 'scheduled':
  - `status` (string, required) - Must be 'pending_booking' or 'scheduled'
  - `scheduled_start_time` (string, optional) - ISO timestamp
  - `scheduled_end_time` (string, optional) - ISO timestamp
  - `booking_requested_at` (string, optional) - ISO timestamp
  - `booking_confirmed_at` (string, optional) - ISO timestamp
  - `meeting_link` (string, optional) - Google Meet link

**Example:**
```jsx
<PTBookingInfo consultation={consultationData} />
```

**Note:** Only renders for consultations with status 'pending_booking' or 'scheduled'

---

### AcknowledgmentComponent

Component for displaying and handling consultation acknowledgment.

**Location:** `expert-coaching/AcknowledgmentComponent.jsx`

**See file for props and usage.**

---

### PARQComponent

Component for displaying and submitting PAR-Q (Physical Activity Readiness Questionnaire).

**Location:** `expert-coaching/PARQComponent.jsx`

**See file for props and usage.**

---

## Layout Components

### PageContainer

Common page container wrapper with consistent styling.

**Location:** `layout/PageContainer.jsx`

**Props:**
- `children` (React.ReactNode, required) - Content to render inside container
- `maxWidth` (string, optional) - Maximum width (default: '1200px')
- `className` (string, optional) - Additional CSS class names

**Example:**
```jsx
<PageContainer maxWidth="800px">
  <h1>Page Title</h1>
  <p>Content...</p>
</PageContainer>
```

---

### PageHeader

Common page header with authentication-aware UI.

**Location:** `layout/PageHeader.jsx`

**Props:**
- `onLoginClick` (Function, required) - Callback when Login button is clicked

**Example:**
```jsx
<PageHeader onLoginClick={() => setShowLoginModal(true)} />
```

**Features:**
- Shows ProfileMenu when logged in
- Shows Dashboard button when logged in
- Shows Login button when not logged in

---

### Footer

Application footer component.

**Location:** `layout/Footer.jsx`

**See file for props and usage.**

---

## Social Components

### PostCard

Displays a social media post with likes, comments, and interactions.

**Location:** `social/PostCard.jsx`

**Props:**
- `post` (Object, required) - Post object with all post data
- `currentUserId` (string|number, required) - Current user's ID
- `currentUserEmail` (string, required) - Current user's email
- `onUpdate` (Function, optional) - Callback when post is updated
- `onDelete` (Function, optional) - Callback when post is deleted

**See file for detailed usage.**

---

### LikeButton

Interactive like button for social posts.

**Location:** `social/LikeButton.jsx`

**Props:**
- `postId` (string|number, required) - ID of the post to like/unlike
- `isLiked` (boolean, required) - Initial liked state
- `likeCount` (number, required) - Initial like count
- `onUpdate` (Function, optional) - Callback after like status changes

**Example:**
```jsx
<LikeButton 
  postId={post.id}
  isLiked={post.is_liked}
  likeCount={post.like_count}
  onUpdate={() => refreshPost()}
/>
```

---

### FollowButton

Interactive follow/unfollow button for user profiles.

**Location:** `social/FollowButton.jsx`

**Props:**
- `username` (string, required) - Username of the user to follow/unfollow
- `initialFollowing` (boolean, optional) - Initial follow status. If null, fetches from API
- `onUpdate` (Function, optional) - Callback when follow status changes: (isFollowing: boolean) => void
- `isOwnProfile` (boolean, optional) - Whether this is the current user's own profile (default: false)

**Example:**
```jsx
<FollowButton 
  username="john_doe"
  initialFollowing={true}
  onUpdate={(isFollowing) => console.log('Now following:', isFollowing)}
/>
```

**Note:** Automatically hides when `isOwnProfile` is true

---

### CommentSection

Component for displaying and managing post comments.

**Location:** `social/CommentSection.jsx`

**See file for props and usage.**

---

### CommentItem

Component for displaying a single comment.

**Location:** `social/CommentItem.jsx`

**See file for props and usage.**

---

## Analysis Components

### AnalysisUploader

Component for uploading videos for analysis.

**Location:** `analysis/AnalysisUploader.jsx`

**See file for props and usage.**

---

### AngleAnalysis

Displays angle analysis results.

**Location:** `analysis/AngleAnalysis.jsx`

**See file for props and usage.**

---

### AsymmetryAnalysis

Displays asymmetry analysis results.

**Location:** `analysis/AsymmetryAnalysis.jsx`

**See file for props and usage.**

---

### MovementAnalysis

Displays movement analysis results.

**Location:** `analysis/MovementAnalysis.jsx`

**See file for props and usage.**

---

### RepConsistencyAnalysis

Displays rep consistency analysis results.

**Location:** `analysis/RepConsistencyAnalysis.jsx`

**See file for props and usage.**

---

### KneeValgusAnalysis

Displays knee valgus analysis results.

**Location:** `analysis/KneeValgusAnalysis.jsx`

**See file for props and usage.**

---

### AnalysisFilterBar

Filter bar for analysis history.

**Location:** `analysis/AnalysisFilterBar.jsx`

**See file for props and usage.**

---

### AnalysisSectionHeader

Header component for analysis sections.

**Location:** `analysis/AnalysisSectionHeader.jsx`

**See file for props and usage.**

---

## Chart Components

### AnglePlot

Chart component for displaying angle data.

**Location:** `charts/AnglePlot.jsx`

**See file for props and usage.**

---

### AsymmetryPlot

Chart component for displaying asymmetry data.

**Location:** `charts/AsymmetryPlot.jsx`

**See file for props and usage.**

---

### FPPAPlot

Chart component for displaying FPPA (Frontal Plane Projection Angle) data.

**Location:** `charts/FPPAPlot.jsx`

**See file for props and usage.**

---

### PerRepPlot

Chart component for displaying per-rep data.

**Location:** `charts/PerRepPlot.jsx`

**See file for props and usage.**

---

## Modal Components

### LoginModal

Modal component for user login.

**Location:** `modals/LoginModal.jsx`

**See file for props and usage.**

---

### AnalysisModal

Modal component for displaying analysis results.

**Location:** `modals/AnalysisModal.jsx`

**See file for props and usage.**

---

### CreatePostModal

Modal component for creating new social posts.

**Location:** `modals/CreatePostModal.jsx`

**See file for props and usage.**

---

### CreateXPostModal

Modal component for creating X (Twitter) posts.

**Location:** `modals/CreateXPostModal.jsx`

**See file for props and usage.**

---

### ImageLightboxModal

Modal component for displaying images in a lightbox.

**Location:** `modals/ImageLightboxModal.jsx`

**See file for props and usage.**

---

### SendVerificationEmailModal

Modal component for sending verification emails.

**Location:** `modals/SendVerificationEmailModal.jsx`

**See file for props and usage.**

---

## Profile Components

### ProfileMenu

Dropdown menu for user profile actions.

**Location:** `ProfileMenu.jsx`

**See file for props and usage.**

---

### PasswordChangeSection

Component for changing user password.

**Location:** `profile/PasswordChangeSection.jsx`

**See file for props and usage.**

---

### PrivacyToggle

Toggle component for privacy settings.

**Location:** `profile/PrivacyToggle.jsx`

**See file for props and usage.**

---

### ProfileAttributes

Component for displaying and editing profile attributes.

**Location:** `profile/ProfileAttributes.jsx`

**See file for props and usage.**

---

### TokenActivationSection

Component for activating tokens.

**Location:** `profile/TokenActivationSection.jsx`

**See file for props and usage.**

---

### UsernameEditor

Component for editing username.

**Location:** `profile/UsernameEditor.jsx`

**See file for props and usage.**

---

### XConnectionSection

Component for managing X (Twitter) connection.

**Location:** `profile/XConnectionSection.jsx`

**See file for props and usage.**

---

## Upload Components

### FileUploader

Component for uploading files.

**Location:** `upload/FileUploader.jsx`

**See file for props and usage.**

---

### ExerciseSelector

Component for selecting exercises.

**Location:** `upload/ExerciseSelector.jsx`

**See file for props and usage.**

---

### NotesInput

Component for inputting notes.

**Location:** `upload/NotesInput.jsx`

**See file for props and usage.**

---

### UploadError

Component for displaying upload errors.

**Location:** `upload/UploadError.jsx`

**See file for props and usage.**

---

### UploadProgress

Component for displaying upload progress.

**Location:** `upload/UploadProgress.jsx`

**See file for props and usage.**

---

### AnonymousLimitMessage

Component for displaying anonymous upload limit message.

**Location:** `upload/AnonymousLimitMessage.jsx`

**See file for props and usage.**

---

## Workout Components

### WorkoutCalendar

Calendar component for displaying workout plans.

**Location:** `workout/WorkoutCalendar.jsx`

**See file for props and usage.**

---

### DailyView

Daily view component for workout plans.

**Location:** `workout/DailyView.jsx`

**See file for props and usage.**

---

### WeeklyView

Weekly view component for workout plans.

**Location:** `workout/WeeklyView.jsx`

**See file for props and usage.**

---

### ViewModeSelector

Component for selecting view mode (daily/weekly).

**Location:** `workout/ViewModeSelector.jsx`

**See file for props and usage.**

---

## Verification Components

### VerificationBanner

Banner component for email verification status.

**Location:** `verification/VerificationBanner.jsx`

**See file for props and usage.**

---

## Landing Components

### HeroSection

Hero section for landing page.

**Location:** `landing/HeroSection.jsx`

**See file for props and usage.**

---

### BenefitsSection

Benefits section for landing page.

**Location:** `landing/BenefitsSection.jsx`

**See file for props and usage.**

---

### FeatureCard

Card component for displaying features.

**Location:** `landing/FeatureCard.jsx`

**See file for props and usage.**

---

### FeaturesGrid

Grid component for displaying multiple features.

**Location:** `landing/FeaturesGrid.jsx`

**See file for props and usage.**

---

## Other Components

### ScoreBreakdown

Component for displaying overall form score and expandable component breakdowns.

**Location:** `ScoreBreakdown.jsx`

**See file for props and usage.**

---

## Contributing

When adding new components:

1. Add comprehensive JSDoc comments to the component file
2. Update this catalog with component information
3. Include usage examples in JSDoc
4. Document all props with types and descriptions
5. Add notes about any special behavior or edge cases

---

## Related Documentation

- [Styling Guide](../../styles/STYLING_GUIDE.md) - Styling conventions and utilities
- [API Configuration](../../config/api/README.md) - API endpoint organization
- [Error Handling Guide](../../utils/ERROR_HANDLING.md) - Error handling patterns and utilities
- [Date Formatting Utilities](../../utils/expertCoachingDateFormat.js) - Date formatting for expert coaching

