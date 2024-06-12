import './App.css';
import Header from './layouts/header.jsx';
import HeroSection from './layouts/heroSection.jsx';
import Footer from './layouts/footer.jsx';
import SwimmingDetailsSection from './layouts/swimmingDetailsSection.jsx';
import AboutSection from './layouts/aboutSection.jsx';
import InstructorSection from './layouts/instructorSection.jsx';
import BannerSection from './layouts/bannerSection.jsx';
import ContactSection from './layouts/contactSection.jsx';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './pages/loginPage.jsx';
import RegistrationPage from './pages/registrationPage.jsx';
import SwimmingPage from './pages/swimmingPage.jsx';
import DivingPage from './pages/divingPage.jsx';
import WaterPoloPage from './pages/waterPoloPage.jsx';
import Dashboard from './pages/dashboard.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/swimming" element={<SwimmingPage />} />
          <Route path="/diving" element={<DivingPage />} />
          <Route path="/water-polo" element={<WaterPoloPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <HeroSection />
              <SwimmingDetailsSection />
              <AboutSection />
              <BannerSection />
              <ContactSection />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
