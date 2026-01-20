
import React, { useState, useEffect } from 'react';
import { Upload, Camera, CheckCircle, Loader, User } from 'lucide-react';


// Add this test function
export const testFacePPConnection = async () => {
  try {
    const formData = new FormData();
    formData.append('api_key', FACEPP_CONFIG.API_KEY);
    formData.append('api_secret', FACEPP_CONFIG.API_SECRET);
    formData.append('faceset_token', FACEPP_CONFIG.GLOBAL_FACESET_TOKEN);

    const response = await fetch(`${FACEPP_CONFIG.API_URL}/faceset/getdetail`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('✅ API Test:', data);
    
    if (data.error_message) {
      console.error('❌ API Error:', data.error_message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
};
const FACEPP_CONFIG = {
  API_KEY: 'KLIjbyc4XC9VrGDZSRI_P622kIGTd514',
  API_SECRET: 'KgcpkL-8bUasCaQRjD8AOdjCo3iWXFas',
  API_URL: 'https://api-us.faceplusplus.com/facepp/v3',
  GLOBAL_FACESET_TOKEN: '166b3c625feb21e121b43968646354db'
};

// 🔥 Direct API Call (NO CORS PROXY NEEDED!)
const callFacePPAPI = async (endpoint, formData) => {
  const targetUrl = `${FACEPP_CONFIG.API_URL}${endpoint}`;
  
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

// 🔥 Helper: Calculate distance between two points
const calculateDistance = (p1, p2) => {
  if (!p1 || !p2 || !p1.x || !p1.y || !p2.x || !p2.y) {
    return 0;
  }
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2)
  );
};

// 🔥 Extract Golden Landmarks (12 stable points)
const extractGoldenLandmarks = (landmark) => {
  if (!landmark) {
    console.warn('⚠️ No landmark data available');
    return null;
  }

  try {
    return {
      // Eye landmarks (6 points)
      left_eye_center: landmark.left_eye_center,
      right_eye_center: landmark.right_eye_center,
      left_eye_left_corner: landmark.left_eye_left_corner,
      left_eye_right_corner: landmark.left_eye_right_corner,
      right_eye_left_corner: landmark.right_eye_left_corner,
      right_eye_right_corner: landmark.right_eye_right_corner,
      
      // Nose landmark (1 point)
      nose_tip: landmark.nose_tip,
      
      // Mouth landmarks (2 points)
      mouth_left_corner: landmark.mouth_left_corner,
      mouth_right_corner: landmark.mouth_right_corner,
      
      // Chin landmark (1 point)
      contour_chin: landmark.contour_chin,
      
      // 🔥 CRITICAL RATIOS (Angle-independent measurements)
      interpupillary_distance: calculateDistance(
        landmark.left_eye_center, 
        landmark.right_eye_center
      ),
      nose_to_chin_ratio: calculateDistance(
        landmark.nose_tip, 
        landmark.contour_chin
      ),
      eye_to_mouth_left: calculateDistance(
        landmark.left_eye_center,
        landmark.mouth_left_corner
      ),
      eye_to_mouth_right: calculateDistance(
        landmark.right_eye_center,
        landmark.mouth_right_corner
      ),
      
      // Timestamp for debugging
      captured_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error extracting landmarks:', error);
    return null;
  }
};

const FaceRegistrationPage = () => {
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [faceTokens, setFaceTokens] = useState([]);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [db, setDb] = useState(null);
  const [facesetValid, setFacesetValid] = useState(null);

  // Firebase configuration
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB5VDEo4ewfFQbhj0tqMPAnwhza2fPICe8",
    authDomain: "zenithely.firebaseapp.com",
    projectId: "zenithely",
    storageBucket: "zenithely.firebasestorage.app",
    messagingSenderId: "1079569948368",
    appId: "1:1079569948368:web:de96220d769739c2d648d5"
  };
  // Add this inside FaceRegistrationPage component, after the Firebase useEffect
useEffect(() => {
  if (firebaseReady) {
    testFacePPConnection();
  }
}, [firebaseReady]);
  // Initialize Firebase
  useEffect(() => {
    const loadFirebase = async () => {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        if (!window.firebase) {
          await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
          await loadScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js');
        }

        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(FIREBASE_CONFIG);
        }

        const firestoreDb = window.firebase.firestore();
        setDb(firestoreDb);
        setFirebaseReady(true);
        console.log('✅ Firebase initialized successfully');
        
        checkFacesetValidity();
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setStatus('⚠️ Firebase initialization failed.');
      }
    };

    loadFirebase();
  }, []);

  // Check faceset validity
  const checkFacesetValidity = async () => {
    try {
      const formData = new FormData();
      formData.append('api_key', FACEPP_CONFIG.API_KEY);
      formData.append('api_secret', FACEPP_CONFIG.API_SECRET);
      formData.append('faceset_token', FACEPP_CONFIG.GLOBAL_FACESET_TOKEN);

      const data = await callFacePPAPI('/faceset/getdetail', formData);

      if (data.faceset_token) {
        console.log('✅ Faceset valid:', data.faceset_token);
        console.log('📊 Faces in faceset:', data.face_count);
        setFacesetValid(true);
      } else {
        console.error('❌ Faceset invalid:', data.error_message);
        setFacesetValid(false);
      }
    } catch (error) {
      console.error('Faceset check error:', error);
      setFacesetValid(false);
    }
  };

  // Create new faceset
  const createNewFaceset = async () => {
    try {
      setStatus('Creating new faceset...');
      
      const formData = new FormData();
      formData.append('api_key', FACEPP_CONFIG.API_KEY);
      formData.append('api_secret', FACEPP_CONFIG.API_SECRET);
      formData.append('outer_id', `zenithely_global_${Date.now()}`);
      formData.append('display_name', 'Zenithely Global Faceset');

      const data = await callFacePPAPI('/faceset/create', formData);

      if (data.faceset_token) {
        const newToken = data.faceset_token;
        console.log('✅ New faceset created!');
        console.log('🔑 NEW TOKEN:', newToken);
        
        alert(`✅ New Faceset Created!\n\n🔑 Token: ${newToken}\n\nUpdate GLOBAL_FACESET_TOKEN in your code.`);
        
        setStatus(`✅ New faceset created: ${newToken.substring(0, 20)}...`);
        setFacesetValid(true);
      } else {
        throw new Error(data.error_message || 'Failed to create faceset');
      }
    } catch (error) {
      console.error('Create faceset error:', error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert('Maximum 5 images allowed!');
      return;
    }

    if (files.length < 3) {
      alert('Please upload at least 3 images!');
      return;
    }

    setImages(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
    setStatus('');
    setFaceTokens([]);
  };

  // Detect face using Face++ API
  const detectFaceWithFacePlusPlus = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('api_key', FACEPP_CONFIG.API_KEY);
      formData.append('api_secret', FACEPP_CONFIG.API_SECRET);
      formData.append('image_file', imageFile);
      formData.append('return_landmark', '2');
      formData.append('return_attributes', 'blur,eyestatus,facequality');

      const data = await callFacePPAPI('/detect', formData);

      if (data.faces && data.faces.length > 0) {
        const face = data.faces[0];
        const goldenLandmarks = extractGoldenLandmarks(face.landmark);
        
        return {
          success: true,
          face_token: face.face_token,
          quality: face.attributes?.facequality?.value || 0,
          blur: face.attributes?.blur?.blurness?.value || 0,
          geometry: goldenLandmarks
        };
      } else {
        return { 
          success: false, 
          error: data.error_message || 'No face detected' 
        };
      }
    } catch (error) {
      console.error('Face++ detection error:', error);
      return { success: false, error: error.message };
    }
  };

  // Add face to faceset
  const addFaceToFaceSet = async (faceToken) => {
    try {
      const formData = new FormData();
      formData.append('api_key', FACEPP_CONFIG.API_KEY);
      formData.append('api_secret', FACEPP_CONFIG.API_SECRET);
      formData.append('faceset_token', FACEPP_CONFIG.GLOBAL_FACESET_TOKEN);
      formData.append('face_tokens', faceToken);

      const data = await callFacePPAPI('/faceset/addface', formData);
      
      if (data.face_added && data.face_added > 0) {
        console.log('✅ Face added to faceset');
        return true;
      } else {
        console.error('❌ Failed to add face:', data.error_message);
        return false;
      }
    } catch (error) {
      console.error('Add face error:', error);
      return false;
    }
  };

  // Save to Firestore
  const saveToFirestore = async (userData) => {
    try {
      if (!db || !firebaseReady) {
        throw new Error('Firebase not ready');
      }

      const userRef = db.collection('users').doc(userData.userId);
      
      await userRef.set({
        email: userData.email,
        name: userData.name,
        role: 'student',
        hasFaceRegistered: true,
        faceTokens: userData.faceTokens,
        facesetToken: FACEPP_CONFIG.GLOBAL_FACESET_TOKEN,
        geometryProfiles: userData.geometryProfiles,
        geometryCount: userData.geometryCount,
        fcmToken: userData.fcmToken,
        quality: userData.quality,
        avgQuality: userData.avgQuality,
        avgBlur: userData.avgBlur,
        imageCount: userData.faceTokens.length,
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp(),
        registeredFrom: 'web_portal',
        systemVersion: '2.0_geometric_hybrid'
      }, { merge: true });

      console.log('✅ User + Geometry saved:', userData.userId);
      return { userRef };
    } catch (error) {
      console.error('Firestore save error:', error);
      throw error;
    }
  };

  // Main registration handler
  const handleRegistration = async () => {
    if (!userId || !userName || !userEmail) {
      alert('Please fill in all user details!');
      return;
    }

    if (images.length < 3 || images.length > 5) {
      alert('Please upload 3-5 images!');
      return;
    }

    if (!firebaseReady) {
      alert('Firebase is still loading...');
      return;
    }

    if (facesetValid === false) {
      alert('⚠️ Invalid faceset! Create a new one first.');
      return;
    }

    setLoading(true);
    setStatus('🚀 Starting registration...');
    setProgress(0);

    try {
      const detectedFaceTokens = [];
      const qualityScores = [];
      const geometryProfiles = [];
      const blurScores = [];

      // STEP 1: Detect faces
      setStatus('🔍 Detecting faces...');
      
      for (let i = 0; i < images.length; i++) {
        setProgress(((i + 1) / images.length) * 35);
        setStatus(`🔍 Processing image ${i + 1}/${images.length}...`);
        
        const result = await detectFaceWithFacePlusPlus(images[i]);

        if (result.success) {
          detectedFaceTokens.push(result.face_token);
          qualityScores.push(result.quality);
          blurScores.push(result.blur);
          
          if (result.geometry) {
            geometryProfiles.push(result.geometry);
            console.log(`✅ Geometry captured for image ${i + 1}`);
          }
          
          setStatus(
            `✓ Face ${i + 1} (Quality: ${result.quality.toFixed(1)}, ` +
            `Blur: ${result.blur.toFixed(1)}, Geo: ${result.geometry ? '✓' : '✗'})`
          );
          setFaceTokens([...detectedFaceTokens]);
        } else {
          throw new Error(`Image ${i + 1}: ${result.error}`);
        }

        if (i < images.length - 1) {
          setStatus(`⏳ Cooling down...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (geometryProfiles.length !== detectedFaceTokens.length) {
        console.warn('⚠️ Some geometry missing');
        setStatus('⚠️ Some geometry missing, continuing...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // STEP 2: Add to faceset
      setStatus('📤 Adding to FaceSet...');
      setProgress(40);
      
      for (let i = 0; i < detectedFaceTokens.length; i++) {
        const progressPercent = 40 + ((i + 1) / detectedFaceTokens.length) * 40;
        setProgress(progressPercent);
        setStatus(`📤 Adding face ${i + 1}/${detectedFaceTokens.length}...`);
        
        await addFaceToFaceSet(detectedFaceTokens[i]);
        
        if (i < detectedFaceTokens.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // STEP 3: Prepare data
      setStatus('💾 Preparing data...');
      setProgress(85);

      const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
      const avgBlur = blurScores.reduce((a, b) => a + b, 0) / blurScores.length;

      const userData = {
        userId: userId.trim(),
        email: userEmail.trim().toLowerCase(),
        name: userName.trim(),
        fcmToken: `fcm_${userId.trim()}_${Date.now()}`,
        faceTokens: detectedFaceTokens,
        geometryProfiles: geometryProfiles,
        quality: qualityScores,
        avgQuality: avgQuality,
        avgBlur: avgBlur,
        imageCount: detectedFaceTokens.length,
        geometryCount: geometryProfiles.length,
      };

      console.log('📊 User Data:', {
        userId: userData.userId,
        name: userData.name,
        faceTokens: userData.faceTokens.length,
        geometryProfiles: userData.geometryProfiles.length,
        avgQuality: avgQuality.toFixed(2),
        avgBlur: avgBlur.toFixed(2)
      });

      // STEP 4: Save to Firebase
      setStatus('💾 Saving to Firebase...');
      setProgress(90);
      
      await saveToFirestore(userData);
      
      setProgress(100);
      setStatus(
        `✅ Registration complete!\n` +
        `👤 User: ${userName} (${userId})\n` +
        `📸 ${detectedFaceTokens.length} tokens\n` +
        `📐 ${geometryProfiles.length} geometric profiles\n` +
        `⭐ Quality: ${avgQuality.toFixed(1)} | Blur: ${avgBlur.toFixed(1)}`
      );

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Reset form
      setUserId('');
      setUserName('');
      setUserEmail('');
      setImages([]);
      setPreviews([]);
      setFaceTokens([]);
      setProgress(0);
      setStatus('');

      console.log('✅ Registration complete');

    } catch (error) {
      console.error('❌ Registration error:', error);
      
      const errorMessage = error.message || 'Unknown error';
      setStatus(`❌ Failed: ${errorMessage}`);
      setProgress(0);

      alert(
        `❌ Registration Failed\n\n` +
        `Error: ${errorMessage}\n\n` +
        `Check:\n• Internet\n• Image quality\n• Face++ API limits\n• Firebase`
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #7e22ce 50%, #1e293b 100%)',
      padding: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Camera size={48} color="#a78bfa" />
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', margin: 0 }}>
              Face Registration Portal
            </h1>
          </div>
          <p style={{ color: '#d1d5db', fontSize: '16px' }}>
            Upload 3-5 face images for AI-powered verification
          </p>
          {!firebaseReady && (
            <p style={{ color: '#fbbf24', fontSize: '14px', marginTop: '8px' }}>
              ⏳ Loading Firebase...
            </p>
          )}
          {firebaseReady && (
            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>
              ✅ Firebase Ready
            </p>
          )}
          {facesetValid === false && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                ⚠️ Invalid Faceset Token
              </p>
              <button
                onClick={createNewFaceset}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                🔧 Create New Faceset
              </button>
            </div>
          )}
          {facesetValid === true && (
            <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>
              ✅ Faceset Valid
            </p>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
          gap: '32px'
        }}>
          {/* Left Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <User size={24} color="#a78bfa" />
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                User Details
              </h2>
            </div>

            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                  User ID *
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g., STU001"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g., Rahul Sharma"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="e.g., rahul@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '8px' }}>
                  Upload Face Images (3-5 images) *
                </label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '128px',
                  border: '2px dashed #a78bfa',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <Upload size={32} color="#a78bfa" />
                  <span style={{ color: '#d1d5db', fontSize: '14px', marginTop: '8px' }}>
                    Click to upload images
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                    JPG, PNG (3-5 images required)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <button
                onClick={handleRegistration}
                disabled={loading || images.length === 0 || !firebaseReady}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px 24px',
                  background: loading || images.length === 0 || !firebaseReady ? '#555' : 'linear-gradient(to right, #9333ea, #ec4899)',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading || images.length === 0 || !firebaseReady ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading || images.length === 0 || !firebaseReady ? 0.5 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Register Face Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div>
            {previews.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                  Uploaded Images ({previews.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {previews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Face ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#9333ea',
                        color: 'white',
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {index + 1}
                      </div>
                      {faceTokens[index] && (
                        <div style={{ position: 'absolute', bottom: '4px', left: '4px' }}>
                          <CheckCircle size={20} color="#10b981" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(loading || status) && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                  Registration Status
                </h3>

                {loading && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: '#374151',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(to right, #a78bfa, #ec4899)',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                    <p style={{ textAlign: 'center', color: '#d1d5db', marginTop: '8px', fontSize: '14px' }}>
                      {progress}%
                    </p>
                  </div>
                )}

                <p style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#e5e7eb',
                  fontSize: '14px',
                  fontFamily: 'monospace'
                }}>
                  {status || 'Ready to register...'}
                </p>

                {faceTokens.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      ✓ {faceTokens.length} faces detected successfully
                    </p>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#9ca3af',
                      maxHeight: '128px',
                      overflowY: 'auto'
                    }}>
                      {faceTokens.map((token, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>
                          Face {i + 1}: {token.substring(0, 30)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#93c5fd', marginBottom: '12px' }}>
                📋 Instructions
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Upload 3-5 clear face images',
                  'Use different angles and expressions',
                  'Ensure good lighting and focus',
                  'Face should be clearly visible',
                  '✅ Uses global faceset for all users'
                ].map((item, i) => (
                  <li key={i} style={{
                    color: '#d1d5db',
                    fontSize: '14px',
                    marginBottom: '8px',
                    paddingLeft: '20px',
                    position: 'relative'
                  }}>
                    <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FaceRegistrationPage;