# Contributing to Phobetron

First off, thank you for considering contributing to **Phobetron**! This is a world-first project combining biblical prophecy analysis with NASA-grade astronomical tracking and machine learning. Your contributions help advance both scientific inquiry and biblical scholarship.

## 🌟 Vision & Mission

**Vision**: To provide researchers, scholars, and believers with the most accurate and comprehensive tool for detecting patterns between celestial events and terrestrial phenomena within a biblical eschatological framework.

**Mission**: Combine cutting-edge technology (ML, astronomical precision, 3D visualization) with biblical integrity to reveal correlations that honor both natural and special revelation.

---

## 📖 Code of Conduct

### Our Standards

**Positive behaviors**:
- ✅ Respectful dialogue between different theological perspectives
- ✅ Scientific rigor in data analysis and model development
- ✅ Biblical accuracy in scriptural references and interpretations
- ✅ Constructive feedback on code and methodology
- ✅ Collaborative problem-solving

**Unacceptable behaviors**:
- ❌ Dogmatic assertions without scriptural/scientific backing
- ❌ Date-setting for prophetic events (violates Matthew 24:36)
- ❌ Disrespectful attacks on theological positions
- ❌ Pseudoscience or data manipulation
- ❌ Harassment or discriminatory language

### Theological Boundaries

While we welcome diverse eschatological perspectives (pre-trib, post-trib, amillennial, etc.), all contributions must:
1. Treat Scripture as authoritative
2. Avoid date-setting for Christ's return
3. Present correlations as **patterns**, not **predictions**
4. Maintain intellectual honesty about model limitations

---

## 🚀 How to Contribute

### 1. Types of Contributions

#### 🔬 **Data Science & ML**
- Improve feature engineering for correlation models
- Add new ML algorithms (deep learning, ensemble methods)
- Optimize model performance (hyperparameter tuning)
- Create new correlation models (e.g., solar → earthquakes)
- Add data validation and quality checks

#### 🌌 **Astronomical Accuracy**
- Enhance orbital mechanics calculations
- Add support for more celestial objects
- Improve ephemeris data integration
- Implement additional astronomical events (occultations, transits)
- Optimize 3D rendering performance

#### 📖 **Biblical Scholarship**
- Improve Hebrew calendar calculations
- Add more feast day types
- Correlate historical biblical events
- Enhance Jerusalem visibility calculations
- Add rabbinical commentary references

#### 💻 **Software Engineering**
- Fix bugs and improve error handling
- Optimize database queries
- Enhance API performance
- Add comprehensive testing
- Improve documentation

#### 🎨 **UI/UX Design**
- Improve visualizations (timelines, charts, 3D)
- Enhance mobile responsiveness
- Add accessibility features
- Design better data presentation
- Create educational tutorials

#### 🌍 **Internationalization**
- Translate UI to other languages
- Add support for non-Gregorian calendars
- Localize disaster terminology
- Cultural adaptations for global audience

---

### 2. Development Workflow

#### **Step 1: Fork & Clone**
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR-USERNAME/phobetron_web_app.git
cd phobetron_web_app
git remote add upstream https://github.com/[original-org]/phobetron_web_app.git
```

#### **Step 2: Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**Branch naming conventions**:
- `feature/add-eclipse-predictions`
- `fix/timezone-bug-in-calendar`
- `docs/seismos-correlation-guide`
- `refactor/optimize-db-queries`

#### **Step 3: Set Up Development Environment**

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Testing & linting tools
```

**Frontend**:
```bash
cd frontend
npm install
npm run lint  # Check code style
npm run type-check  # TypeScript validation
```

#### **Step 4: Make Changes**

Follow these guidelines:
- Write clean, readable code with comments
- Add docstrings to functions (Google style for Python)
- Include JSDoc comments for TypeScript functions
- Write unit tests for new features
- Update documentation for API changes

**Python Style**:
```python
def calculate_moon_phase(date: datetime) -> float:
    """
    Calculate moon phase for given date.
    
    Args:
        date: Target datetime for calculation
        
    Returns:
        Moon phase (0.0 = new moon, 0.5 = full moon, 1.0 = new moon)
        
    References:
        Lunar cycle calculation based on known new moon (Jan 6, 2000)
    """
    lunar_cycle = 29.53
    days_since_ref = (date - datetime(2000, 1, 6)).days
    return (days_since_ref % lunar_cycle) / lunar_cycle
```

**TypeScript Style**:
```typescript
/**
 * Predict earthquake risk based on celestial features
 * @param date - Target date for prediction
 * @param features - Array of 10 celestial features
 * @returns Probability (0-1) of M>=6.0 earthquake within 7 days
 */
async function predictEarthquakeRisk(
  date: Date,
  features: number[]
): Promise<number> {
  const response = await fetch('/api/v1/ml/predict-earthquake', {
    method: 'POST',
    body: JSON.stringify({ date, features }),
  });
  return response.json();
}
```

#### **Step 5: Test Your Changes**

**Backend Tests**:
```bash
cd backend
pytest tests/ -v
pytest tests/test_correlations.py -v  # Specific test file
```

**Frontend Tests**:
```bash
cd frontend
npm run test
npm run test:coverage  # Check code coverage
```

**Manual Testing**:
1. Start backend: `uvicorn app.main:app --reload --port 8020`
2. Start frontend: `npm run dev`
3. Test your feature thoroughly in browser
4. Check browser console for errors
5. Verify API responses in Network tab

#### **Step 6: Commit Changes**

Use **semantic commit messages**:
```bash
git add .
git commit -m "feat: add lunar declination to tsunami model"
# or
git commit -m "fix: correct Hebrew calendar leap year calculation"
# or
git commit -m "docs: update correlation model training guide"
```

**Commit message types**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring (no functional change)
- `test:` Add/update tests
- `perf:` Performance improvement
- `chore:` Maintenance tasks

#### **Step 7: Push & Create Pull Request**
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- **Clear title**: "Add lunar declination feature to tsunami correlation model"
- **Description**:
  - What does this PR do?
  - Why is this change needed?
  - How was it tested?
  - Any breaking changes?
  - Screenshots (if UI change)
- **Link to issue** (if applicable): "Fixes #123"

---

### 3. Pull Request Review Process

#### **Review Checklist**

Your PR will be reviewed for:

✅ **Code Quality**
- Follows project coding standards
- Well-commented and readable
- No unnecessary complexity
- Proper error handling

✅ **Testing**
- All tests pass
- New features have tests
- Edge cases covered
- No breaking changes (or documented)

✅ **Documentation**
- API changes documented
- README updated (if needed)
- Docstrings/JSDoc added
- Comments explain "why", not "what"

✅ **Biblical/Scientific Accuracy**
- Scripture references correct
- Astronomical calculations verified
- ML model performance validated
- No date-setting or dogmatic predictions

✅ **Performance**
- No unnecessary database queries
- Efficient algorithms used
- No memory leaks
- Optimized for scale

#### **Addressing Feedback**

When reviewers request changes:
1. Make the requested changes
2. Commit with clear message: `fix: address review feedback on moon phase calculation`
3. Push to same branch
4. Comment on PR: "Addressed feedback - ready for re-review"

---

## 🎯 Priority Contribution Areas

### **High Priority**

1. **Real-Time Data Ingestion**
   - Automated USGS earthquake feed
   - NOAA hurricane API integration
   - Smithsonian volcano RSS feed
   - NASA solar flare alerts

2. **Model Persistence**
   - Save trained ML models to disk
   - Load models on server restart
   - Version control for models
   - A/B testing framework

3. **Performance Optimization**
   - Query optimization (N+1 problems)
   - Database indexing strategy
   - Caching layer (Redis)
   - Frontend bundle size reduction

4. **Mobile Responsiveness**
   - 3D solar system on mobile
   - Touch-friendly timeline
   - Responsive tables
   - Mobile-first alerts

### **Medium Priority**

1. **Enhanced Visualizations**
   - Interactive correlation heatmaps
   - Geographic disaster clustering maps
   - Feature importance charts
   - Animated timeline playback

2. **API Enhancements**
   - GraphQL endpoint
   - Webhook subscriptions
   - Rate limiting
   - API key authentication

3. **Testing Coverage**
   - Unit tests: target 80%+
   - Integration tests for ML pipeline
   - E2E tests for critical flows
   - Load testing for API

### **Low Priority (Future)**

1. **Deep Learning Models**
   - LSTM for time series prediction
   - Transformer models for pattern detection
   - Multi-task learning
   - Neural architecture search

2. **Advanced Features**
   - User accounts & personalization
   - Custom alert configuration
   - Export to PDF/Excel
   - Social sharing

---

## 🧪 Testing Guidelines

### **Write Tests For**
- All new ML model features
- API endpoint logic
- Database queries
- Astronomical calculations
- Biblical calendar functions

### **Test Structure**

**Backend (pytest)**:
```python
def test_moon_phase_calculation():
    """Test moon phase calculation accuracy."""
    # Arrange
    new_moon_date = datetime(2000, 1, 6)  # Known new moon
    full_moon_date = datetime(2000, 1, 21)  # ~15 days later
    
    # Act
    new_phase = calculate_moon_phase(new_moon_date)
    full_phase = calculate_moon_phase(full_moon_date)
    
    # Assert
    assert abs(new_phase - 0.0) < 0.01  # Near 0 (new moon)
    assert abs(full_phase - 0.5) < 0.05  # Near 0.5 (full moon)
```

**Frontend (Jest)**:
```typescript
describe('EarthquakeRiskPredictor', () => {
  it('should display high risk for high probability', () => {
    render(<EarthquakeRiskPredictor probability={0.85} />);
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
  });
  
  it('should display low risk for low probability', () => {
    render(<EarthquakeRiskPredictor probability={0.15} />);
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
  });
});
```

---

## 📝 Documentation Standards

### **Code Documentation**

**Always document**:
- All public functions/methods
- Complex algorithms
- Biblical/astronomical references
- Data sources and citations

**Example**:
```python
def extract_celestial_earthquake_features(
    target_date: datetime,
    celestial_events: List[CelestialEvent],
    solar_events: List[SolarEvent]
) -> List[float]:
    """
    Extract 10-dimensional feature vector for earthquake prediction.
    
    Features align with biblical signs (Matthew 24:29, Revelation 6:12-14):
    - Blood moons, eclipses (sun/moon darkened)
    - Planetary conjunctions (stars falling)
    - Solar flares (sun struck)
    
    Args:
        target_date: Date for which to extract features
        celestial_events: List of celestial events in database
        solar_events: List of solar activity events
        
    Returns:
        10-element feature vector normalized to 0-1 range
        
    References:
        - USGS Earthquake Catalog: https://earthquake.usgs.gov/
        - NASA JPL Horizons: https://ssd.jpl.nasa.gov/horizons/
        - Hebrew Calendar: Traditional rabbinical calculations
    """
    # Implementation...
```

### **API Documentation**

All endpoints must have:
- Clear description
- Parameter specifications
- Response examples
- Error codes
- Biblical/scientific context (where applicable)

---

## 🙏 Questions?

- **General Questions**: [GitHub Discussions](https://github.com/[org]/phobetron_web_app/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/[org]/phobetron_web_app/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/[org]/phobetron_web_app/issues) with `enhancement` label
- **Theological Discussion**: `theological-questions` discussion category

---

## 📜 Attribution

When your PR is merged, you'll be added to:
- **Contributors list** in README
- **Git commit history** (permanent record)
- **Release notes** for significant features

---

## 🌟 Recognition

Outstanding contributors may receive:
- **Collaborator status** (commit access)
- **Mention in documentation** for major features
- **Co-authorship** on academic papers (if applicable)

---

**Thank you for helping advance this world-first project! Your work contributes to both scientific inquiry and biblical scholarship.** 🙏

> *"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."* - Colossians 3:23 (NIV)
