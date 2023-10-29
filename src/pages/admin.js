import React from "react";
import { withAuth } from "../components/auth";
import { Link } from "react-router-dom";

import "../styles/admin.css";

class Admin extends React.Component {
 
  render() {
    
    return (
      <div className="main">
        <div className="cont">
          <Link style={{textDecoration: "none", color: "white"}} to="/termekek">
            <div className="termhozzaadas">Termékek</div>
          </Link>
          <Link style={{textDecoration: "none", color: "white"}} className="egy" to="/raktar">
            <div className="termhozzaadas egy">Raktárkészlet</div>
          </Link>
          <div className="ketto">Zárás</div>
          <div className="harom">Nyitás</div>
        </div>
        
        <Link to="/">Vissza</Link>
         
      </div>
    );
  }
}

export default withAuth(Admin);
