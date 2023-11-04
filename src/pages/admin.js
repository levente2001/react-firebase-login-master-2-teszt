import React from "react";
import { withAuth } from "../components/auth";
import { Link } from "react-router-dom";
import Firebase from "firebase";
import { initialize } from "../utils/firebase";

import "../styles/admin.css";

class Admin extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };

    this.handleZaras = this.handleZaras.bind(this);
  }

  handleZaras(e) {
    e.preventDefault();
    initialize();
    const itemsRef = Firebase.database().ref('rev');
    itemsRef.remove();
  }
 
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
          <div onClick={this.handleZaras} className="harom">Nyitás</div>
        </div>
        
        <Link to="/">Vissza</Link>
         
      </div>
    );
  }
}

export default withAuth(Admin);
