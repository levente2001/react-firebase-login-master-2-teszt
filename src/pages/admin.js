import React from "react";
import { withAuth } from "../components/auth";
import { Link } from "react-router-dom";

import "../styles/admin.css";

class Admin extends React.Component {
 
  render() {
    
    return (
      <div className="main">
        <div className="cont">
          <div className="termhozzaadas">Termék Hozzáadás</div>
          <div className="egy"> Funkció2</div>
          <div className="ketto"> Funkció3</div>
          <div className="harom"> Funkció4</div>
        </div>
        
        <Link to="/">Vissza</Link>
         
      </div>
    );
  }
}

export default withAuth(Admin);
