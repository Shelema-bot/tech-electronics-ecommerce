/**
 * ImageSearch — modal for searching products by uploading a photo.
 * Activated by the camera icon in the Navbar search bar.
 */
import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";
import { usePreference } from "../../context/PreferenceContext";
import "./ImageSearch.css";

function ImageSearch({ onClose }) {
  const navigate                  = useNavigate();
  const { fmt }                   = usePreference();
  const fileInputRef              = useRef(null);
  const dropRef                   = useRef(null);

  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null);
  const [error, setError]         = useState("");
  const [dragOver, setDragOver]   = useState(false);

  /* ── File handling ─────────────────────────────────────── */
  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, WEBP).");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("Image must be under 8 MB.");
      return;
    }
    setError("");
    setResults(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onInputChange = (e) => handleFile(e.target.files[0]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = ()   => setDragOver(false);

  /* ── Search ─────────────────────────────────────────────── */
  const search = async () => {
    if (!file) { setError("Please select or drop an image first."); return; }
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await API.post("/products/search-by-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goToProduct = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="is-overlay" onClick={onClose}>
      <div className="is-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="is-header">
          <div>
            <h2 className="is-title">🔍 Search by Image</h2>
            <p className="is-subtitle">Upload a photo of any product to find similar items</p>
          </div>
          <button className="is-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="is-body">

          {/* Drop zone */}
          {!preview ? (
            <div
              ref={dropRef}
              className={`is-dropzone ${dragOver ? "drag-over" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="is-drop-icon">📷</div>
              <div className="is-drop-text">
                <strong>Drop your image here</strong>
                <span>or click to browse</span>
              </div>
              <div className="is-drop-hint">JPG, PNG, WEBP — max 8 MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onInputChange}
                hidden
              />
            </div>
          ) : (
            /* Preview + actions */
            <div className="is-preview-area">
              <div className="is-preview-wrap">
                <img src={preview} alt="Search query" className="is-preview-img" />
                <button className="is-remove-preview" onClick={reset} title="Remove image">✕</button>
              </div>

              {!results && (
                <div className="is-preview-actions">
                  <button
                    className="is-search-btn"
                    onClick={search}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="is-spinner" />
                        Analysing image…
                      </>
                    ) : (
                      "🔍 Search Products"
                    )}
                  </button>
                  <button className="is-change-btn" onClick={() => fileInputRef.current?.click()}>
                    Change Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onInputChange}
                    hidden
                  />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="is-error">{error}</div>
          )}

          {/* AI labels */}
          {results?.detectedLabels?.length > 0 && (
            <div className="is-labels">
              <span className="is-labels-title">Detected:</span>
              {results.detectedLabels.map(l => (
                <span key={l} className="is-label-chip">{l}</span>
              ))}
              {results.matchedCategories?.length > 0 && results.matchedCategories.map(c => (
                <span key={c} className="is-cat-chip">{c}</span>
              ))}
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="is-results">
              <div className="is-results-header">
                <span className="is-results-count">
                  {results.fallback
                    ? "Couldn't identify product — showing popular items"
                    : `${results.count} matching product${results.count !== 1 ? "s" : ""} found`}
                </span>
                <button className="is-new-search-btn" onClick={reset}>
                  ↺ New search
                </button>
              </div>

              {results.products.length === 0 ? (
                <div className="is-no-results">
                  <span style={{ fontSize: 40 }}>🔍</span>
                  <p>No products matched. Try a clearer photo.</p>
                </div>
              ) : (
                <div className="is-results-grid">
                  {results.products.map(p => (
                    <button
                      key={p._id}
                      className="is-result-card"
                      onClick={() => goToProduct(p._id)}
                    >
                      <div className="is-result-img-wrap">
                        {p.images?.[0] ? (
                          <img
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                            className="is-result-img"
                          />
                        ) : (
                          <div className="is-result-no-img">📦</div>
                        )}
                      </div>
                      <div className="is-result-info">
                        <div className="is-result-name">{p.name}</div>
                        <div className="is-result-cat">{p.category}</div>
                        <div className="is-result-price">{fmt(p.price)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ImageSearch;
