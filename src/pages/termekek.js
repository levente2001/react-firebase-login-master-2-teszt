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
          selectedCategory: '',
        };
    }

onClickButton = e =>{
    e.preventDefault()
    this.setState({openModal : true})
}

 onCloseModal = ()=>{
     this.setState({openModal : false})
   }
onClickButtonn = e =>{
    e.preventDefault()
    this.setState({openModall : true})
}

 onCloseModall = ()=>{
     this.setState({openModall : false})
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
    if (this.state.selectedItem  && this.priceInput && this.nevInput) {
        const newPrice = this.priceInput.value;
        const newNev = this.nevInput.value;
        const itemsRef = Firebase.database().ref('products').child(this.state.selectedItem.id);
        itemsRef.update({ar: newPrice, nev: newNev });
        
        this.setState({ openModal: false, selectedItem: null });
    }
}

handleAddItem = () => {
    const itemsRef = Firebase.database().ref('products');
    const newItem = {
        nev: this.nevInput.value,
        ar: this.priceInput.value,
        quantity: this.quantityInput.value,
        cat: this.state.selectedCategory,
    };
    itemsRef.push(newItem);
    this.onCloseModall();
}

handleDeleteItem = (itemId) => {
    const itemsRef = Firebase.database().ref('products').child(itemId);
    itemsRef.remove();
    this.setState({ openModal: false, selectedItem: null });
}


getQuantityStyle = (quantity) => {
    if (quantity < 10) {
      return {backgroundColor: '#DC5E5E'};
    } else if (quantity >= 10 && quantity < 20) {
      return {backgroundColor: '#E8A86F'};
    } else if (quantity >= 20 && quantity < 30) {
      return {backgroundColor: '#F7F76D'};
    } else {
        return {backgroundColor: '#70B69F'};
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
            {/*<button className="buttonr" style={{backgroundColor: '#70B69F'}} onClick={this.onClickButtonn}>+</button>*/}
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
                <div className="tetelelistaterme" style={{justifyContent: "space-between"}}>
                  <div className="szamlalomasik"   >{item.nev}</div>
                  <div className="cucclihozzmasik" >{item.ar} Ft</div>
                  <div className="szamlalok" onClick={() => {this.setState({openModal: true}); this.setState({selectedItem: item})}}>edit</div>
                </div>
              </li>
            )
          })}
        </ul>

        <Modal open={this.state.openModal} onClose={this.onCloseModal}>
            <div style={{width: "74vw", height: "70vh"}}>
                <div className="modal-content">
                    <h2>A következő módosítása: {this.state.selectedItem?.nev}</h2>

                    <div style={{display: "flex", flexDirection: "column"}}>
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

                    
                    <button className="margin" style={{backgroundColor: '#70B69F'}} onClick={this.handleUpdateQuantity}>Frissítés</button>
                </div>
            </div>
        </Modal>
        
         
      </div>
    );
  }
}

export default withAuth(Raktarkeszlet);
