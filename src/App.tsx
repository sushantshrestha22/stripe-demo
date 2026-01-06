import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CheckoutPage from './components/CheckoutPage';
import CheckoutSuccess from './components/CheckoutSuccess';
import CheckoutCancel from './components/CheckoutCancel';
import './App.css';

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to Our App</h1>
      <p>Experience the best features with our premium plans.</p>
      <Link to="/checkout" className="cta-button">
        View Pricing & Subscribe
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="main-nav">
        <Link to="/" className="nav-brand">MyApp</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/checkout">Pricing</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/payment/success" element={<CheckoutSuccess />} />
        <Route path="/payment/cancel" element={<CheckoutCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
