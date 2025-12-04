# Custom Hooks Documentation

This directory contains custom React hooks for the Reform Client application. These hooks encapsulate reusable logic and state management patterns.

## Available Hooks

### useRequireAuth

**Location:** `shared/utils/useRequireAuth.js`

**Purpose:** Enforces authentication for protected routes and components.

**Signature:**
```typescript
function useRequireAuth(
  navigate: Function,
  callback?: Function
): boolean
```

**Parameters:**
- `navigate` (Function, required) - React Router navigate function from `useNavigate()`
- `callback` (Function, optional) - Optional callback to execute if authenticated. Use `useCallback()` to memoize.

**Returns:** `boolean` - Whether user is authenticated

**Behavior:**
- Checks if user is logged in using `isUserLoggedIn()`
- Redirects to `/?login=1` if not authenticated
- Executes optional callback if authentication is confirmed
- Returns authentication status

**Example:**
```javascript
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const MyProtectedComponent = () => {
  const navigate = useNavigate();
  const isAuthenticated = useRequireAuth(navigate);
  
  if (!isAuthenticated) {
    return null; // Component will redirect, so return null
  }
  
  return <div>Protected content</div>;
};
```

**Example with callback:**
```javascript
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const MyProtectedComponent = () => {
  const navigate = useNavigate();
  
  const loadData = useCallback(async () => {
    // Fetch data only if authenticated
    const data = await fetchUserData();
    setData(data);
  }, []);
  
  const isAuthenticated = useRequireAuth(navigate, loadData);
  
  // Component continues...
};
```

**When to use:**
- Protected pages that require authentication
- Components that need to fetch data only if user is authenticated
- Any component that should redirect unauthenticated users

**Note:** This hook must be called at the top level of a React component (follows React hooks rules).

---

### useImageUpload

**Location:** `shared/hooks/useImageUpload.js`

**Purpose:** Manages image upload state, validation, preview generation, and upload logic for post creation.

**Signature:**
```typescript
function useImageUpload(
  maxImages?: number
): {
  images: Array<ImageObject>,
  error: string,
  setImages: Function,
  setError: Function,
  handleImageSelect: Function,
  removeImage: Function,
  addPreloadedImage: Function,
  resetImages: Function
}
```

**Parameters:**
- `maxImages` (number, optional) - Maximum number of images allowed (default: `UPLOAD_CONSTANTS.MAX_IMAGES` = 5)

**Returns:** Object with:
- `images` (Array) - Array of image objects with structure:
  ```javascript
  {
    id: string | number,
    file: File | null,
    preview: string | null,      // Data URL for preview
    url: string | null,          // Uploaded image URL
    thumbnailUrl: string | null, // Thumbnail URL
    uploading: boolean,
    error: string | null
  }
  ```
- `error` (string) - Current error message
- `setImages` (Function) - Direct state setter for images
- `setError` (Function) - Direct state setter for error
- `handleImageSelect` (Function) - Handler for file input: `(files: FileList | File[]) => Promise<void>`
- `removeImage` (Function) - Remove image by ID: `(imageId: string | number) => void`
- `addPreloadedImage` (Function) - Add image that's already uploaded: `(imageUrl: string, thumbnailUrl?: string) => void`
- `resetImages` (Function) - Clear all images: `() => void`

**Behavior:**
- Validates image files (type, size, count)
- Generates preview URLs for selected images
- Uploads images to server via `API_ENDPOINTS.POST_IMAGE_UPLOAD`
- Manages upload state (uploading, error, success)
- Handles multiple images with individual upload progress

**Example:**
```javascript
import { useImageUpload } from '../shared/hooks/useImageUpload';

const CreatePostComponent = () => {
  const {
    images,
    error,
    handleImageSelect,
    removeImage,
    resetImages
  } = useImageUpload();
  
  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleImageSelect(e.target.files)}
      />
      
      {error && <div className="error">{error}</div>}
      
      <div className="image-preview">
        {images.map(img => (
          <div key={img.id}>
            <img src={img.preview || img.url} alt="Preview" />
            {img.uploading && <span>Uploading...</span>}
            {img.error && <span>Error: {img.error}</span>}
            <button onClick={() => removeImage(img.id)}>Remove</button>
          </div>
        ))}
      </div>
      
      <button onClick={resetImages}>Clear All</button>
    </div>
  );
};
```

**Example with preloaded image:**
```javascript
const EditPostComponent = ({ existingImageUrl }) => {
  const { images, addPreloadedImage } = useImageUpload();
  
  useEffect(() => {
    if (existingImageUrl) {
      addPreloadedImage(existingImageUrl);
    }
  }, [existingImageUrl, addPreloadedImage]);
  
  // Component continues...
};
```

**When to use:**
- Post creation forms with image uploads
- Profile picture uploads
- Any component that needs to upload and preview images
- Components that need to manage multiple image uploads

**Dependencies:**
- Requires `authenticatedFetch` for uploads
- Uses `validateImageFiles` from `imageValidation.js`
- Uses `UPLOAD_CONSTANTS` from `constants/upload.js`

**Error handling:**
- Validation errors are set in `error` state
- Upload errors are set per-image in `images[].error`
- Check both `error` and `images[].error` for complete error state

---

## Hook Patterns

### Authentication Pattern

For components that require authentication:

```javascript
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const ProtectedComponent = () => {
  const navigate = useNavigate();
  const isAuthenticated = useRequireAuth(navigate);
  
  if (!isAuthenticated) {
    return null; // Will redirect, so return null
  }
  
  // Component logic here
};
```

### Data Fetching Pattern

For components that fetch data after authentication:

```javascript
import { useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect } from 'react';
import { useRequireAuth } from '../shared/utils/useRequireAuth';

const DataComponent = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  const fetchData = useCallback(async () => {
    const result = await fetchUserData();
    setData(result);
  }, []);
  
  const isAuthenticated = useRequireAuth(navigate, fetchData);
  
  // Component continues...
};
```

### File Upload Pattern

For components that handle file uploads:

```javascript
import { useImageUpload } from '../shared/hooks/useImageUpload';

const UploadComponent = () => {
  const {
    images,
    error,
    handleImageSelect,
    removeImage,
    resetImages
  } = useImageUpload(3); // Max 3 images
  
  // Component logic here
};
```

## Best Practices

1. **Always use hooks at the top level** - Never call hooks conditionally or in loops
2. **Memoize callbacks** - Use `useCallback()` for callbacks passed to hooks
3. **Handle loading states** - Check hook return values for loading/error states
4. **Clean up resources** - Some hooks may need cleanup (check hook documentation)
5. **Follow hook dependencies** - Respect hook dependency arrays

## Creating New Hooks

When creating a new custom hook:

1. **Follow naming convention** - Start with `use` (e.g., `useCustomHook`)
2. **Add JSDoc comments** - Document parameters, return values, and behavior
3. **Update this README** - Add your hook to the catalog
4. **Follow React hooks rules** - Only call other hooks at the top level
5. **Handle edge cases** - Consider error states, loading states, cleanup

**Example hook structure:**
```javascript
/**
 * Custom hook description
 * 
 * @param {Type} param1 - Parameter description
 * @param {Type} [param2] - Optional parameter description
 * @returns {Object} Return value description
 * 
 * @example
 * const { value, setValue } = useCustomHook(param1);
 */
export function useCustomHook(param1, param2 = null) {
  // Hook implementation
  const [value, setValue] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, [param1]);
  
  return {
    value,
    setValue,
    // Other return values
  };
}
```

## Related Documentation

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Error Handling Guide](../utils/ERROR_HANDLING.md)
- [API Utilities](../utils/UTILS.md)

