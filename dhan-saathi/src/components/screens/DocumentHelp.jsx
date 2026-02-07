import React, { useState, useRef } from 'react';
import { Upload, X, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { analyzeFormImage, extractFormFields } from '../../services/documentFormService';

const DocumentHelp = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guidance, setGuidance] = useState(null);
  const [error, setError] = useState(null);
  const [activeField, setActiveField] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result);
    };
    reader.readAsDataURL(file);

    // Analyze form
    await analyzeForm(file);
  };

  const analyzeForm = async (file) => {
    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.split(',')[1];
        const result = await analyzeFormImage(base64);
        setGuidance(result);
        setActiveField(0);
        setError(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to analyze form. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setGuidance(null);
    setActiveField(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentField = guidance?.fields?.[activeField];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📋</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Saathi Form Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a form photo and get AI-powered guidance in simple language
          </p>
        </div>

        {!imagePreview ? (
          // Upload Section
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-dashed border-green-300 p-8 sm:p-12 w-full max-w-2xl text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4"
              >
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Upload className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upload Form Photo</h3>
                  <p className="text-gray-600 mt-1">
                    Click to select or drag an image of your form
                  </p>
                </div>
              </button>

              {error && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  📸 Supported formats: JPG, PNG (Max 5MB)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition"
                >
                  Choose Photo 📸
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Analysis & Guidance Section
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Left: Image & Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Form Preview</h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Upload a different form"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Image Display */}
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Form preview"
                  className="w-full h-auto rounded-lg border border-gray-200 object-cover max-h-80"
                />
              </div>

              {/* Status */}
              {isAnalyzing && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="animate-spin">⚙️</div>
                  <span className="text-sm font-medium text-blue-800">Analyzing form...</span>
                </div>
              )}

              {guidance && !isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-800">
                      Form analyzed! {guidance.fields.length} fields identified.
                    </span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Upload Different Form
                  </button>
                </div>
              )}
            </div>

            {/* Right: Guidance Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">🤖</div>
                    <p className="text-gray-600 font-medium">Analyzing your form...</p>
                  </div>
                </div>
              ) : guidance ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Field Selector */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      FIELD {activeField + 1} OF {guidance.fields.length}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {guidance.fields.map((field, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveField(idx)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            activeField === idx
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Field Guidance */}
                  {currentField && (
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      {/* Field Title */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {currentField.field}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {currentField.importance === 'Critical' ? '🚨 Critical' : '〰️ Required'}
                          </p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          {currentField.type}
                        </span>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span>👉</span> Follow These Steps:
                        </h4>
                        <ol className="space-y-2">
                          {currentField.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                              <span className="font-bold text-green-600 flex-shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Example */}
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">✅ EXAMPLES:</p>
                        <p className="text-sm text-blue-800 font-medium">{currentField.examples}</p>
                      </div>

                      {/* Common Mistakes */}
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-xs font-semibold text-red-900 mb-1">❌ AVOID:</p>
                        <p className="text-sm text-red-800">{currentField.mistakes}</p>
                      </div>

                      {/* Pro Tip */}
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-900">{currentField.tip}</p>
                      </div>

                      {/* Next Button */}
                      {activeField < guidance.fields.length - 1 && (
                        <button
                          onClick={() => setActiveField(activeField + 1)}
                          className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          Next Field <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Summary Card */}
        {guidance && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white text-center mb-8">
            <p className="text-lg font-semibold">{guidance.summary}</p>
          </div>
        )}

        {/* Tips Section */}
        {!imagePreview && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Tips for Best Results:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="font-semibold text-blue-900 mb-2">📸 Clear Photo</p>
                <p className="text-sm text-blue-800">Make sure the form is well-lit and all text is clearly visible</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50">
                <p className="font-semibold text-purple-900 mb-2">📄 Full Form</p>
                <p className="text-sm text-purple-800">Try to capture the entire form or at least all required fields</p>
              </div>
              <div className="p-4 rounded-lg bg-pink-50">
                <p className="font-semibold text-pink-900 mb-2">🎯 Straight Angle</p>
                <p className="text-sm text-pink-800">Hold the camera straight to avoid distorted sections</p>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
    );
};

export default DocumentHelp;
