import Home from "./pages/Home";
import Auth from "./pages/Auth";

import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./App.css";

 import Subscription from "./pages/Subscription";
 import SubscriberDashboard from "./pages/SubscriberDashbord";
import GolfScores from "./component/GolfScores";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth/>} />
        <Route path="/register" element={<Auth />} />
         <Route path="/subscription" element={<Subscription />} />
       <Route path="/dashboard" element={<SubscriberDashboard/>} /> 
       <Route path="/golf-scores" element={<GolfScores/>} />
       <Route path="/admin" element={ <AdminDashboard />  }
/>

       

      </Routes>
    </BrowserRouter>
  )
}

export default App
