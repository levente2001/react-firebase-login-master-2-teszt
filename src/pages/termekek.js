import React from "react";
import { withAuth } from "../components/auth";
import { Link } from "react-router-dom";
import Firebase from "firebase";
import { initialize } from "../utils/firebase";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

import "../styles/admin.css";


class Raktarkeszlet extends React.Component {
    constructor(props){
        super(props);
        this.state = {
          lista: [],
          searchTerm: '',
          openModal: false,
          selectedItem: '',
        };
    }

onClickButton = e =>{
    e.preventDefault()
    this.setState({openModal : true})
}

 onCloseModal = ()=>{
     this.setState({openModal : false})
   }

componentDidMount() {
    initialize();

    const itemsRef = Firebase.database().ref('products');

    itemsRef.on('value', (snapshot) => {
        let items = snapshot.val();
        let newState = [];
        for (let item in items) {
          newState.push({
            id: item,
            nev: items[item].nev,
            ar: items[item].ar,
            quantity: items[item].quantity,
          });
        }
        this.setState({
          lista: newState
        });
      });
}


handleUpdateQuantity = () => {
    if (this.state.selectedItem && this.quantityInput && this.priceInput && this.nevInput) {
        const newQuantity = this.quantityInput.value;
        const newPrice = this.priceInput.value;
        const newNev = this.nevInput.value;
        const itemsRef = Firebase.database().ref('products').child(this.state.selectedItem.id);
        itemsRef.update({ quantity: newQuantity, ar: newPrice, nev: newNev });
        
        this.setState({ openModal: false, selectedItem: null });
    }
}

  

handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };
 
  render() {
    const filteredList = this.state.lista.filter((item) =>
    item.nev.toLowerCase().includes(this.state.searchTerm.toLowerCase())
  );
    
    return (
      <div className="main">

        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", width: "60vw"}}>
            <Link style={{textDecoration: "none", color: "grey", fontWeight: "bold"}} to="/admin">Vissza</Link>
            <input
                type="text"
                placeholder="Keresés..."
                value={this.state.searchTerm}
                onChange={this.handleSearchChange}
                style={{
                    width: '60%',
                  }}
            />
        </div>

        


        <ul className="cucclisttermekek">
          {filteredList.map((item) => {
           return (
              <li  key={item.id}>
                <div className="tetelelistaterme">
                  <div className="szamlalomasik">{item.nev}</div>
                  <div className="cucclihozzmasik">{item.ar} Ft</div>
                  <div className="cucclihozzmasik">{item.quantity} db</div>
                  <div className="szamlalok" onClick={() => {this.setState({openModal: true}); this.setState({selectedItem: item})}}>edit</div>
                </div>
              </li>
            )
          })}
        </ul>

        <Modal open={this.state.openModal} onClose={this.onCloseModal}>
            <div style={{width: "74vw", height: "50vh"}}>
                <div className="modal-content">
                    <h2>A következő módosítása: {this.state.selectedItem?.nev}</h2>

                    <div style={{display: "flex", flexDirection: "column"}}>
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}}  htmlFor="quantityInput">Mennyiség:</label>
                        <div style={{width: "100%"}}>
                            <input 
                                className="input" 
                                type="number" 
                                defaultValue={this.state.selectedItem?.quantity} 
                                ref={(input) => this.quantityInput = input} 
                            />
                        </div>
                        
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}} htmlFor="priceInput">Ár:</label>
                        <div style={{width: "100%"}}>
                            <input
                                className="input"
                                type="number" 
                                placeholder="Price"
                                defaultValue={this.state.selectedItem?.ar}   
                                ref={(input) => this.priceInput = input} 
                            />
                        </div>
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}} htmlFor="priceInput">Név:</label>
                        <div style={{width: "100%"}}>
                            <input
                                className="input width60p"
                                placeholder="Név"
                                defaultValue={this.state.selectedItem?.nev}   
                                ref={(input) => this.nevInput = input} 
                            />
                        </div>
                    </div>

                    
                    <button className="margin" onClick={this.handleUpdateQuantity}>Update</button>
                </div>
            </div>
        </Modal>

        
         
      </div>
    );
  }
}

export default withAuth(Raktarkeszlet);
