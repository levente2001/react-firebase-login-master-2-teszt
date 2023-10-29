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
          selectedQuantitytype: '',
          productName: '',
          ingredients: [{ name: '', quantity: '' }],
          price: '',
          ingredientOptions: []
        };
        this.handleAddIngredient = this.handleAddIngredient.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }



    handleAddIngredient() {
        this.setState(prevState => ({
            ingredients: [...prevState.ingredients, { name: '', quantity: '' }]
        }));
    }

    handleInputChange(index, field, value) {
        const newIngredients = [...this.state.ingredients];
        newIngredients[index][field] = value;
        this.setState({
            ingredients: newIngredients
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const ingredientData = this.state.ingredients.reduce((acc, ing) => {
            acc[ing.name] = parseFloat(ing.quantity);
            return acc;
        }, {});

        const productRef = Firebase.database().ref(`sale/${this.state.productName}`);
        productRef.set({
            nev: this.state.productName,
            ingredients: ingredientData,
            cat: this.state.selectedCategory,
            ar: this.state.price,
        });

        // Reset the form
        this.setState({
            productName: '',
            ingredients: [{ name: '', quantity: '' }],
            price: '',
            selectedCategory: '',
        });
        this.onCloseModall();
    }






onClickButton = e =>{
    e.preventDefault()
    this.setState({openModal : true})
}

 onCloseModal = ()=>{
     this.setState({openModal : false})
     this.setState({selectedItem: ''})
   }
onClickButtonn = e =>{
    e.preventDefault()
    this.setState({openModall : true})
}

 onCloseModall = ()=>{
     this.setState({openModall : false})
     this.setState({selectedItem: ''})
   }

componentDidMount() {
    initialize();

    const itemsRef = Firebase.database().ref('sale');

    itemsRef.on('value', (snapshot) => {
        let items = snapshot.val();
        let newState = [];
        for (let item in items) {
          newState.push({
            id: item,
            nev: items[item].nev,
            ar: items[item].ar,
          });
        }
        this.setState({
          lista: newState
        });
      });

    const warehouseRef = Firebase.database().ref('warehouse');
    
    warehouseRef.on('value', snapshot => {
        const warehouseData = snapshot.val();
        const ingredientNames = [];
        
        for (let ingredient in warehouseData) {
            ingredientNames.push(warehouseData[ingredient].name);
        }
        
        this.setState({ ingredientOptions: ingredientNames });
    });
}


handleUpdateQuantity = () => {
    if (this.state.selectedItem  && this.priceInput && this.nevInput) {
        const newPrice = this.priceInput.value;
        const newNev = this.nevInput.value;
        const itemsRef = Firebase.database().ref('sale').child(this.state.selectedItem.id);
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
    const itemsRef = Firebase.database().ref('sale').child(itemId);
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
            <button className="buttonr" style={{backgroundColor: '#70B69F'}} onClick={this.onClickButtonn}>+</button>
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
                    <button className="margin" style={{ backgroundColor: '#DC5E5E' }} onClick={() => this.handleDeleteItem(this.state.selectedItem.id)}>Törlés</button>
                </div>
            </div>
        </Modal>

        <Modal open={this.state.openModall} onClose={this.onCloseModall}>
            <div style={{width: "74vw", height: "75vh"}}>
                <div className="modal-content">
                    <h2>Új termék hozzáadása</h2>

                    <div style={{display: "flex", flexDirection: "column"}}>
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}}  htmlFor="quantityInput">Név:</label>
                        <div style={{width: "100%"}}>
                            {/*<input 
                                className="input" 
                                type="number" 
                                defaultValue={this.state.selectedItem?.quantity} 
                                ref={(input) => this.quantityInput = input} 
                            />*/}
                            <input
                                className="input" 
                                placeholder="Név"
                                value={this.state.productName}
                                onChange={(e) => this.setState({ productName: e.target.value })}
                            />
                         </div>
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}} htmlFor="priceInput">Ár:</label>
                        <div style={{width: "100%"}}>
                            <input
                                className="input"
                                type="number" 
                                placeholder="Ár"
                                value={this.state.price}  
                                onChange={(e) => this.setState({ price: e.target.value })}
                            />
                        </div>
                       
                        {/*<label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}} htmlFor="priceInput">Név:</label>
                        <div style={{width: "100%"}}>
                            <input
                                className="input width60p"
                                placeholder="Név"
                                defaultValue={this.state.selectedItem?.nev}   
                                ref={(input) => this.nevInput = input} 
                            />
                        </div>*/}
                        {this.state.ingredients.map((ingredient, index) => (
                        <div style={{margin: 10, fontWeight: "bold"}}  key={index}>
                            <select
                                className="input width60p"
                                style={{margin: 5}}
                                value={ingredient.name}
                                onChange={(e) => this.handleInputChange(index, 'name', e.target.value)}
                            >
                                <option value="" disabled>Select Ingredient</option>
                                {this.state.ingredientOptions.map((ingredientName, idx) => (
                                    <option key={idx} value={ingredientName}>
                                        {ingredientName}
                                    </option>
                                ))}
                            </select>
                            <input
                                className="input"
                                style={{margin: 5}}
                                type="number"
                                placeholder="Quantity"
                                value={ingredient.quantity}
                                onChange={(e) => this.handleInputChange(index, 'quantity', e.target.value)}
                            />
                        </div>
                    ))}
                        <label style={{marginTop: 25, marginBottom: 5, fontWeight: "bold"}} htmlFor="categoryInput">Kategória:</label>
                        <div style={{width: "100%"}}>
                            <select 
                                id="categoryInput"
                                className="input width60p"
                                value={this.state.selectedCategory} 
                                onChange={(e) => this.setState({ selectedCategory: e.target.value })}
                            >
                                <option value="valassz">Válassz</option>
                                <option value="meleg">Meleg</option>
                                <option value="üdítők">Üdítők</option>
                                <option value="borok">Borok</option>
                                <option value="koktel">Koktel</option>
                                <option value="rovid2">Rovid2</option>
                                <option value="rovid4">Rovid4</option>
                                <option value="sör">Sör</option>
                                <option value="snack">Snack</option>
                                <option value="jeges italok">Jeges Italok</option>
                            </select>
                        </div>
                    </div>

                    
                    <button className="margin" style={{marginTop: 20}} onClick={this.handleAddItem}>Hozzáadás</button>
                    <button type="button" onClick={this.handleAddIngredient}>Add Ingredient</button>
                    <button onClick={this.handleSubmit}>Add Product</button>
                </div>
            </div>
        </Modal>
        
         
      </div>
    );
  }
}

export default withAuth(Raktarkeszlet);