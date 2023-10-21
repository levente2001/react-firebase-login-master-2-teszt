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
            quantity: items[item].quantity,
          });
        }
        this.setState({
          lista: newState
        });
      });
}


handleUpdateQuantity = () => {
    if (this.state.selectedItem && this.quantityInput) {
        const newQuantity = this.quantityInput.value;
        const itemsRef = Firebase.database().ref('products').child(this.state.selectedItem.id);
        itemsRef.update({ quantity: newQuantity });
        
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
            <Link style={{textDecoration: "none", color: "grey", fontWeight: "bold"}} to="/">Vissza</Link>
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
                <div className="tetelelista">
                  <div className="szamlalo">{item.nev}</div>
                  <div className="cucclihozz">{item.quantity} db</div>
                  <div className="szamlalok" onClick={() => {this.setState({openModal: true}); this.setState({selectedItem: item})}}>edit</div>
                </div>
              </li>
            )
          })}
        </ul>

        <Modal open={this.state.openModal} onClose={this.onCloseModal}>
            <div className="modal">
                <div className="modal-content">
                    <h2>Edit Quantity for {this.state.selectedItem?.nev}</h2>
                    <input className="input" type="number" defaultValue={this.state.selectedItem?.quantity} ref={(input) => this.quantityInput = input} />
                    <button className="margin" onClick={this.handleUpdateQuantity}>Update</button>
                </div>
            </div>
        </Modal>

        
         
      </div>
    );
  }
}

export default withAuth(Raktarkeszlet);
