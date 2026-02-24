import {
  useState,
  useRef,
  useCallback,
  type DragEvent,
  type ChangeEvent,
  type ReactNode
} from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Fingerprint,
  Gauge,
  Image as ImageIcon,
  Layers,
  Repeat2,
  ScanLine,
  Search,
  Sparkles,
  SunMedium,
  TextCursorInput,
  UserRound,
  Wand2,
  Waves,
  Workflow,
  X,
  XCircle,
  UploadCloud
} from 'lucide-react'
import './App.css'
import './i18n'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

interface PredictionResult {
  prediction: 'fake' | 'real'
  confidence: number
  fake_probability_raw: number
  real_probability_raw: number
}

const API_URL = import.meta.env.VITE_API_URL

interface AiFeature {
  icon: ReactNode
  title: string
  desc: string
}


function App() {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const AI_FEATURES: AiFeature[] = [
    {
      icon: <Fingerprint className="feature-icon-svg" />,
      title: t('aiSigns.features.hands.title', 'Unnatural Hands & Fingers'),
      desc: t('aiSigns.features.hands.desc', 'AI often generates extra, fused, or oddly bent fingers. Look for six fingers, floating thumbs, or impossible joint angles.')
    },
    {
      icon: <SunMedium className="feature-icon-svg" />,
      title: t('aiSigns.features.lighting.title', 'Inconsistent Lighting'),
      desc: t('aiSigns.features.lighting.desc', 'Shadows may point in different directions or be missing entirely. Light sources often contradict each other across the scene.')
    },
    {
      icon: <Waves className="feature-icon-svg" />,
      title: t('aiSigns.features.texture.title', 'Texture Anomalies'),
      desc: t('aiSigns.features.texture.desc', 'Skin can appear waxy or plastic-like. Hair strands may merge into blobs, and fabric patterns often distort unnaturally.')
    },
    {
      icon: <TextCursorInput className="feature-icon-svg" />,
      title: t('aiSigns.features.text.title', 'Warped Text & Symbols'),
      desc: t('aiSigns.features.text.desc', 'AI struggles with text — letters morph, words become gibberish, and signs contain nonsensical characters.')
    },
    {
      icon: <Layers className="feature-icon-svg" />,
      title: t('aiSigns.features.symmetry.title', 'Symmetry Glitches'),
      desc: t('aiSigns.features.symmetry.desc', "Earrings that don't match, asymmetric collars, or eyes at slightly different heights reveal the AI's pattern-matching limits.")
    },
    {
      icon: <ImageIcon className="feature-icon-svg" />,
      title: t('aiSigns.features.background.title', 'Background Distortion'),
      desc: t('aiSigns.features.background.desc', 'Straight lines may bend, architecture warps, and background objects can melt into each other or disappear entirely.')
    },
    {
      icon: <UserRound className="feature-icon-svg" />,
      title: t('aiSigns.features.faces.title', 'Uncanny Valley Faces'),
      desc: t('aiSigns.features.faces.desc', 'Overly smooth skin, teeth that blend together, or irises with inconsistent patterns are common giveaways.')
    },
    {
      icon: <Sparkles className="feature-icon-svg" />,
      title: t('aiSigns.features.color.title', 'Color Bleeding'),
      desc: t('aiSigns.features.color.desc', 'Colors from one object may leak into adjacent areas. Edges between objects often show unnatural color transitions.')
    },
    {
      icon: <Repeat2 className="feature-icon-svg" />,
      title: t('aiSigns.features.patterns.title', 'Repeating Patterns'),
      desc: t('aiSigns.features.patterns.desc', 'AI may clone textures or patterns — look for identical leaves, bricks, or crowd faces that repeat unnaturally.')
    },
    {
      icon: <Gauge className="feature-icon-svg" />,
      title: t('aiSigns.features.depth.title', 'Depth & Perspective Errors'),
      desc: t('aiSigns.features.depth.desc', 'Railings, stairs, or roads may warp or intersect in impossible ways. Foreground and background objects can appear at inconsistent scales.')
    },
    {
      icon: <Workflow className="feature-icon-svg" />,
      title: t('aiSigns.features.overlaps.title', 'Impossible Object Overlaps'),
      desc: t('aiSigns.features.overlaps.desc', 'Objects can blend through each other or overlap without clear boundaries, especially where limbs, clothing, and accessories meet.')
    },
    {
      icon: <Wand2 className="feature-icon-svg" />,
      title: t('aiSigns.features.glossy.title', 'Over-Processed Glossy Look'),
      desc: t('aiSigns.features.glossy.desc', 'Images can look overly polished, with hyper-smooth skin, razor-sharp edges, and uniform noise that feels more like a filter than a camera sensor.')
    },
    {
      icon: <Brain className="feature-icon-svg" />,
      title: t('aiSigns.features.confusion.title', 'Concept Confusion'),
      desc: t('aiSigns.features.confusion.desc', 'Small story details often fail — clocks with impossible times, reflections that don’t match the subject, or jewelry that changes design across the image.')
    }
  ]

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, WebP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20MB')
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const data: PredictionResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Analysis failed: ${err.message}. Make sure the backend is running on ${API_URL}`
          : 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container">
          <a href="#" className="nav-logo">
            <div className="nav-logo-icon">
              <Search size={18} strokeWidth={1.9} />
            </div>
            AI Detector
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <ul className="nav-links">
              <li><a href="#detect">{t('nav.detect')}</a></li>
              <li><a href="#how-it-works">{t('nav.howItWorks')}</a></li>
              <li><a href="#features">{t('nav.aiSigns')}</a></li>
              <li><a href="#model">{t('nav.model')}</a></li>
            </ul>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            {t('hero.badge')}
          </div>
          <h1>
            {t('hero.title1')} <span className="gradient-text">{t('hero.title2')}</span>
            <br />
            {t('hero.title3')}
          </h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          <a href="#detect" className="hero-cta">
            <span>{t('hero.cta')}</span>
            <ArrowRight size={18} strokeWidth={1.9} />
          </a>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">100%</div>
              <div className="hero-stat-label">{t('hero.stats.accuracy')}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">240px</div>
              <div className="hero-stat-label">{t('hero.stats.inputSize')}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2</div>
              <div className="hero-stat-label">{t('hero.stats.classes')}</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">&lt;1s</div>
              <div className="hero-stat-label">{t('hero.stats.inference')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload / Detect */}
      <section className="section" id="detect">
        <div className="container">
          <div className="section-header">
            <span className="section-label">// {t('detect.label')}</span>
            <h2 className="section-title">{t('detect.title')}</h2>
            <p className="section-description">
              {t('detect.description')}
            </p>
          </div>

          <div className="upload-area">
            {!preview && (
              <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <span className="dropzone-icon">
                  <UploadCloud size={28} strokeWidth={1.8} />
                </span>
                <h3 className="dropzone-title">{t('detect.dropzone.title')}</h3>
                <p className="dropzone-subtitle">
                  {t('detect.dropzone.subtitle').split('or ')[0]}or <span>{t('detect.dropzone.subtitle').split('or ')[1]}</span>
                </p>
                <p className="dropzone-formats">{t('detect.dropzone.formats')}</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              style={{ display: 'none' }}
            />

            {preview && (
              <div className="preview-container">
                <div className="preview-image-wrapper">
                  {loading && <div className="scan-line" />}
                  <img src={preview} alt="Preview" />
                </div>
                <div className="preview-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" /> {t('detect.actions.analyzing')}
                      </>
                    ) : (
                      <>
                        <ScanLine size={18} strokeWidth={1.9} />
                        <span>{t('detect.actions.analyze')}</span>
                      </>
                    )}
                  </button>
                  <button className="btn btn-secondary" onClick={handleReset}>
                    <X size={16} strokeWidth={1.9} />
                    <span>{t('detect.actions.clear')}</span>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-card">
                <span>
                  <AlertTriangle size={18} strokeWidth={2} />
                </span>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className={`result-card result-${result.prediction}`}>
                <div className="result-header">
                  <div className="result-badge">
                    <div className="result-badge-icon">
                      {result.prediction === 'real' ? (
                        <CheckCircle2 size={22} strokeWidth={2.1} />
                      ) : (
                        <XCircle size={22} strokeWidth={2.1} />
                      )}
                    </div>
                    {result.prediction === 'real' ? t('detect.result.real') : t('detect.result.fake')}
                  </div>
                  <div className="result-confidence">
                    <div className="result-confidence-label">{t('detect.result.confidence')}</div>
                    <div className="result-confidence-value">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="result-body">
                  <div className="confidence-bar-container">
                    <div className="confidence-bar-labels">
                      <span>{t('detect.result.low')}</span>
                      <span>{t('detect.result.high')}</span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className="confidence-bar-fill"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="result-details">
                    <div className="result-detail-item">
                      <div className="result-detail-label">{t('detect.result.fakeProb')}</div>
                      <div className="result-detail-value">
                        {(result.fake_probability_raw * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="result-detail-item">
                      <div className="result-detail-label">{t('detect.result.realProb')}</div>
                      <div className="result-detail-value">
                        {(result.real_probability_raw * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-label">// {t('howItWorks.label')}</span>
            <h2 className="section-title">{t('howItWorks.title')}</h2>
            <p className="section-description">
              {t('howItWorks.description')}
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <UploadCloud size={26} strokeWidth={1.8} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.1.title')}</h3>
              <p className="step-desc">
                {t('howItWorks.steps.1.desc')}
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Brain size={26} strokeWidth={1.8} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.2.title')}</h3>
              <p className="step-desc">
                {t('howItWorks.steps.2.desc')}
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <BarChart3 size={26} strokeWidth={1.8} />
              </div>
              <h3 className="step-title">{t('howItWorks.steps.3.title')}</h3>
              <p className="step-desc">
                {t('howItWorks.steps.3.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-label">// {t('aiSigns.label')}</span>
            <h2 className="section-title">{t('aiSigns.title')}</h2>
            <p className="section-description">
              {t('aiSigns.description')}
            </p>
          </div>
          <div className="features-grid">
            {AI_FEATURES.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="model">
        <div className="container">
          <div className="section-header">
            <span className="section-label">// {t('modelInfo.label')}</span>
            <h2 className="section-title">{t('modelInfo.title')}</h2>
            <p className="section-description">
              {t('modelInfo.description')}
            </p>
          </div>
          <div className="model-grid">
            {/* Architecture */}
            <div className="model-card">
              <div className="model-card-header">
                <div className="model-card-icon">
                  <Layers size={22} strokeWidth={1.8} />
                </div>
                <h3 className="model-card-title">{t('modelInfo.architecture.title')}</h3>
              </div>
              <div className="model-specs">
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.architecture.baseModel')}</span>
                  <span className="model-spec-value">EfficientNet-B1</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.architecture.classifier')}</span>
                  <span className="model-spec-value">Linear(1280→2)</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.architecture.parameters')}</span>
                  <span className="model-spec-value">~7.8M</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.architecture.framework')}</span>
                  <span className="model-spec-value">PyTorch</span>
                </div>
              </div>
            </div>

            {/* Input Pipeline */}
            <div className="model-card">
              <div className="model-card-header">
                <div className="model-card-icon">
                  <Workflow size={22} strokeWidth={1.8} />
                </div>
                <h3 className="model-card-title">{t('modelInfo.inputPipeline.title')}</h3>
              </div>
              <div className="model-specs">
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.inputPipeline.inputSize')}</span>
                  <span className="model-spec-value">240 × 240 px</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.inputPipeline.colorSpace')}</span>
                  <span className="model-spec-value">RGB</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.inputPipeline.normMean')}</span>
                  <span className="model-spec-value">[0.485, 0.456, 0.406]</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.inputPipeline.normStd')}</span>
                  <span className="model-spec-value">[0.229, 0.224, 0.225]</span>
                </div>
              </div>
            </div>

            {/* Decision Logic */}
            <div className="model-card model-card-full">
              <div className="model-card-header">
                <div className="model-card-icon">
                  <Gauge size={22} strokeWidth={1.8} />
                </div>
                <h3 className="model-card-title">{t('modelInfo.decisionLogic.title')}</h3>
              </div>
              <div className="model-specs">
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.decisionLogic.activation')}</span>
                  <span className="model-spec-value">Softmax (dim=1)</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.decisionLogic.threshold')}</span>
                  <span className="model-spec-value">0.945</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.decisionLogic.classes')}</span>
                  <span className="model-spec-value">["fake", "real"]</span>
                </div>
                <div className="model-spec-row">
                  <span className="model-spec-label">{t('modelInfo.decisionLogic.rule')}</span>
                  <span className="model-spec-value">{t('modelInfo.decisionLogic.ruleValue')}</span>
                </div>
              </div>
              <div className="threshold-visual">
                <div className="confidence-bar-labels" style={{ fontSize: '0.82rem' }}>
                  <span className="threshold-label-real">
                    <CheckCircle2 size={14} strokeWidth={2} />
                    <span>{t('modelInfo.decisionLogic.classifiedReal')}</span>
                  </span>
                  <span className="threshold-label-fake">
                    <XCircle size={14} strokeWidth={2} />
                    <span>{t('modelInfo.decisionLogic.classifiedFake')}</span>
                  </span>
                </div>
                <div className="threshold-bar">
                  <div className="threshold-marker" style={{ left: '94.5%' }} />
                </div>
                <div className="threshold-labels">
                  <span>0.0</span>
                  <span>← {t('modelInfo.decisionLogic.thresholdLabel')} →</span>
                  <span>1.0</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div
                  className="model-spec-label"
                  style={{ marginBottom: '12px', fontSize: '0.9rem' }}
                >
                  Inference Pipeline
                </div>
                <div className="model-arch-diagram">
                  <div className="arch-block">Image Input</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">Resize 240²</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">Normalize</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">EfficientNet-B1</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">Linear(2)</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">Softmax</div>
                  <span className="arch-arrow">→</span>
                  <div className="arch-block">Threshold</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo">
            <div className="nav-logo-icon nav-logo-icon-small">
              <Search size={16} strokeWidth={1.9} />
            </div>
            <span>AI Detector</span>
          </div>
          <p className="footer-text">
            {t('footer.desc')}
          </p>
          <div className="footer-divider" />
          <p className="footer-bottom">
            {t('footer.bottom')}
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
