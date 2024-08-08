import './App.css';
import Header from './layouts/header.jsx';
import HeroSection from './layouts/heroSection.jsx';
import Footer from './layouts/footer.jsx';
import SwimmingDetailsSection from './layouts/swimmingDetailsSection.jsx';
import AboutSection from './layouts/aboutSection.jsx';
import BannerSection from './layouts/bannerSection.jsx';
import ContactSection from './layouts/contactSection.jsx';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './pages/loginPage.jsx';
import RegistrationPage from './pages/registrationPage.jsx';
import SwimmingPage from './pages/swimmingPage.jsx';
import DivingPage from './pages/divingPage.jsx';
import WaterPoloPage from './pages/waterPoloPage.jsx';
import Dashboard from './pages/dashboard.jsx';
import ChildDashboard from './pages/childDashboard.jsx';
import CoachDashboard from './pages/coachDashboard.jsx';
import ManagerDashboard from './pages/managerDashboard.jsx';
import ParentDashboard from './pages/parentDashboard.jsx';
import PendingPage from './pages/pendingPage.jsx';

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
          <Route path="/child" element={<ChildDashboard />} />
          <Route path="/coach" element={<CoachDashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/pending" element={<PendingPage />} />
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
