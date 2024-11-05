import React from "react";
import { Redirect, Link } from "react-router-dom";
//import ReactModal from 'react-modal';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { authStates, withAuth } from "../components/auth";
import Firebase from "firebase";
import { signOut, initialize } from "../utils/firebase";
import Loader from "../components/loader";
import logo from '../mylogo.png';
import emailjs from '@emailjs/browser';

function handleSignOut() {
  signOut()
    .then(() => {
      console.log("Signed Out");
    })
    .catch(e => {
      console.log("Error signing out", e);
    });
}




class Home extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      value: '',
      cimnev: '',
      vendeg: '',
      tetel: '',
      modcat: '',
      price: [],
      ar: '',
      id: '',
      idt: '',
      rev: [],
      items: [],
      termekek: [],
      lista: [],
      nevek: [],
      ter: 0,
      zero: 0,
      bevtl: [],
      user: '',
      szamlalo: null,
      isVisible: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitTerm = this.handleSubmitTerm.bind(this);
    this.handleSubmitFiz = this.handleSubmitFiz.bind(this);
    this.handleSubmitTetelTorles = this.handleSubmitTetelTorles.bind(this);
    this.handleZaras = this.handleZaras.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }
  
  handleZaras(e) {
    e.preventDefault();
    initialize();
    const itemsRef = Firebase.database().ref('rev');
    itemsRef.remove();
    let numbers = this.state.lista
    let result = numbers.filter(item => item.vendeg)
    var templateParams = {
      to_name: "Rebeka",
      from_name1: "Pöpi",
      message1: "Forró csoki, espresso, tej 1 dl",
      from_name2: "Levi",
      message2: "Whiskey cola, GinTonic, Coca-cola",
      from_name3: "Zoli",
      message3: "Ásványvíz, tej, sör",
      from_name4: "Péter",
      message4: "Lottó, tej, bubisvíz",
      
    };
    console.log(result)
    emailjs.send('service_gbavh8e', 'template_gnhu46w', templateParams, 'XThjOXCqFi54k7hk-')
      .then(function(response) {
         console.log('SUCCESS!', response.status, response.text);
      }, function(error) {
         console.log('FAILED...', error);
      });
  }

  sendEmail(e){
    e.preventDefault();
    let numbers = this.state.lista
    let result = numbers.filter(item => item.vendeg)
    console.log(result)
    emailjs.sendForm('service_gbavh8e', 'template_gnhu46w', {message_html: result, from_name: "VárosKútIvó Zárás"}, 'XThjOXCqFi54k7hk-')
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  };

  

  handleSubmit(e) {
    e.preventDefault();
    initialize();
    const itemsRef = Firebase.database().ref('items');
    const item = {
      user: this.state.value
    }
    itemsRef.push(item);
    this.setState({
      value: '',
    });
  }

  handleSubmitFiz(e) {
    e.preventDefault();
    initialize();
    const itemsRef = Firebase.database().ref('items/' + this.state.id);
    const itemsRefP = Firebase.database().ref('tetelek/');
    const itemsRefR = Firebase.database().ref('rev');
    let numbers = this.state.lista;
    let result = numbers.filter(item => item.vendeg === this.state.cimnev).reduce((total, currentValue) => total = total + currentValue.ar * currentValue.szamlalo,0);  
    itemsRefR.push({
      vegosszeg: result
    })
    itemsRef.remove()
    itemsRefP.on('value', (snapshot) => {
      let items = snapshot.val();
      for (let item in items) {
        if(items[item].vendeg === this.state.cimnev){
          let id = item
          const delet = Firebase.database().ref('tetelek/' + id)
          delet.remove()
        }
      }
    });
    this.setState({openModallll: true})
    window.location.reload(false)
    /*this.setState({
      cimnev: '',
    })*/
  }

  handleSubmitTetelTorles(e) {
    e.preventDefault();
    initialize();
    
    const itemsRef = Firebase.database().ref('tetelek/' + this.state.idt);
    const productsRef = Firebase.database().ref('sale');
    const warehouseRef = Firebase.database().ref('warehouse');
  
    // Fetch the current state of the item to get its tetel and szamlalo
    itemsRef.once('value', itemSnapshot => {
      const itemData = itemSnapshot.val();
  
      if (itemData) {
        const tetelName = itemData.tetel;
        const szamlaloValue = itemData.szamlalo || 0;
  
        // Now, fetch the product by its name
        productsRef.orderByChild('nev').equalTo(tetelName).once('value', productSnapshot => {
          const products = productSnapshot.val();
  
          if (products) {
            const productId = Object.keys(products)[0];
            const productData = products[productId];
  
            // If the product has an ingredients list, replenish ingredient quantities in the warehouse
            if (productData.ingredients) {
              for (let ingredientName in productData.ingredients) {
                const usedQuantity = productData.ingredients[ingredientName] * szamlaloValue;

                // Retrieve the current quantity of the ingredient from the warehouse
                warehouseRef.child(ingredientName).once('value', ingredientSnapshot => {
                  const ingredientInWarehouse = ingredientSnapshot.val();

                  if (ingredientInWarehouse) {
                    // Add the used quantity back to the current quantity in the warehouse
                    const newQuantity = ingredientInWarehouse.quantity + usedQuantity;

                    // Update the warehouse with the new quantity
                    warehouseRef.child(ingredientName).update({ quantity: newQuantity });
                  }
                });
              }
            }

            // (Optional) If you also want to increment the product's quantity (if any), you can keep this
            if (typeof productData.quantity !== 'undefined') {
              const newQuantity = productData.quantity + szamlaloValue;
              productsRef.child(productId).update({ quantity: newQuantity });
            }
          }
        });
  
        // Finally, remove the item from the database
        itemsRef.remove();
  
        // Update component's state to close the modal
        this.setState({
          openModalll: false
        });
      }
    });
}

  

  decrementSzamlalo = (itemId) => {
    const itemRef = Firebase.database().ref('tetelek/' + itemId);
    const productsRef = Firebase.database().ref('sale');
  
    // Fetch the current state of the item
    itemRef.once('value', itemSnapshot => {
      const itemData = itemSnapshot.val();
  
      if (itemData) {
        // If szamlalo exists in item, increment it, otherwise set it to 1
        const newSzamlalo = (itemData.szamlalo || 0) - 1;
        
        // Update the szamlalo in the database for the item
        itemRef.update({ szamlalo: newSzamlalo });
  
        // Also update the szamlalo in your component's state (if needed)
        this.setState({ szamlalo: newSzamlalo });
  
        // Now, fetch the product by its name (assumed to be stored in itemData.tetel)
        productsRef.orderByChild('nev').equalTo(itemData.tetel).once('value', productSnapshot => {
          const products = productSnapshot.val();
  
          // Assuming product names are unique, there should be only one matching product
          if (products) {
            const productId = Object.keys(products)[0];
            const productData = products[productId];
  
            // Deduct the ingredient quantities for the added product
            if (productData && productData.ingredients) {
                const ingredientData = productData.ingredients;
  
                // Loop through each ingredient associated with the product
                for (let ingredientName in ingredientData) {
                    const requiredQuantity = ingredientData[ingredientName];
  
                    // Retrieve the current quantity of the ingredient from the warehouse in Firebase
                    const warehouseRef = Firebase.database().ref(`warehouse/${ingredientName}`);
                    warehouseRef.once('value', ingredientSnapshot => {
                        const ingredientInWarehouse = ingredientSnapshot.val();
  
                        if (ingredientInWarehouse) {
                            // Deduct the required quantity from the current quantity in the warehouse
                            const newQuantity = ingredientInWarehouse.quantity + requiredQuantity;
  
                            // Update the warehouse with the new quantity
                            warehouseRef.update({ quantity: newQuantity });
                        }
                    });
                }
            }
          }
        });
      }
    });
  }
  

  incrementSzamlalo = (itemId) => {
    const itemRef = Firebase.database().ref('tetelek/' + itemId);
    const productsRef = Firebase.database().ref('sale');
  
    // Fetch the current state of the item
    itemRef.once('value', itemSnapshot => {
      const itemData = itemSnapshot.val();
  
      if (itemData) {
        // If szamlalo exists in item, increment it, otherwise set it to 1
        const newSzamlalo = (itemData.szamlalo || 0) + 1;
        
        // Update the szamlalo in the database for the item
        itemRef.update({ szamlalo: newSzamlalo });
  
        // Also update the szamlalo in your component's state (if needed)
        this.setState({ szamlalo: newSzamlalo });
  
        // Now, fetch the product by its name (assumed to be stored in itemData.tetel)
        productsRef.orderByChild('nev').equalTo(itemData.tetel).once('value', productSnapshot => {
          const products = productSnapshot.val();
  
          // Assuming product names are unique, there should be only one matching product
          if (products) {
            const productId = Object.keys(products)[0];
            const productData = products[productId];
  
            // Deduct the ingredient quantities for the added product
            if (productData && productData.ingredients) {
                const ingredientData = productData.ingredients;
  
                // Loop through each ingredient associated with the product
                for (let ingredientName in ingredientData) {
                    const requiredQuantity = ingredientData[ingredientName];
  
                    // Retrieve the current quantity of the ingredient from the warehouse in Firebase
                    const warehouseRef = Firebase.database().ref(`warehouse/${ingredientName}`);
                    warehouseRef.once('value', ingredientSnapshot => {
                        const ingredientInWarehouse = ingredientSnapshot.val();
  
                        if (ingredientInWarehouse) {
                            // Deduct the required quantity from the current quantity in the warehouse
                            const newQuantity = ingredientInWarehouse.quantity - requiredQuantity;
  
                            // Update the warehouse with the new quantity
                            warehouseRef.update({ quantity: newQuantity });
                        }
                    });
                }
            }
          }
        });
      }
    });
  }
  


handleSubmitTerm(e) {
  e.preventDefault();
  initialize();
  const itemsRef = Firebase.database().ref('tetelek');
  const productsRef = Firebase.database().ref('sale');
  const warehouseRef = Firebase.database().ref('warehouse');
  const { cimnev, tetel, ar, szamlalo } = this.state;

  // Filter by tetel
  itemsRef.orderByChild('tetel').equalTo(tetel).once('value', snapshot => {
    const matchingItems = snapshot.val();
    let existingItem = null;
    let itemId = null;

    // Check if vendeg also matches among the filtered items
    if (matchingItems) {
      for (let key in matchingItems) {
        if (matchingItems[key].vendeg === cimnev) {
          existingItem = matchingItems[key];
          itemId = key;
          break;
        }
      }
    }

    if (existingItem) {
      // If item already exists with matching tetel and vendeg, get its key and update szamlalo

      // Get the current szamlalo from the existing item
      const currentSzamlalo = existingItem.szamlalo || 0;

      // Increment the szamlalo by 1
      const incrementedSzamlalo = currentSzamlalo + 1;

      // Update the szamlalo in the database
      itemsRef.child(itemId).update({ szamlalo: incrementedSzamlalo }, (error) => {
        if (error) {
          console.error("Failed to update szamlalo:", error);
        } else {
          console.log("Szamlalo successfully updated!");
        }
      });

    } else {
      // If item does not exist, add it as a new item
      const item = {
        vendeg: cimnev,
        tetel: tetel,
        ar: ar,
        szamlalo: szamlalo,
      };
      itemsRef.push(item);
    }

    // After adding the item or updating szamlalo, fetch the product details
  productsRef.orderByChild('nev').equalTo(tetel).once('value', productSnapshot => {
    const products = productSnapshot.val();

    if (products) {
      const productId = Object.keys(products)[0];
      const productData = products[productId];

      // If the product has an ingredients list, decrement ingredient quantities from the warehouse
      if (productData.ingredients) {
        for (let ingredientName in productData.ingredients) {
          const requiredQuantity = productData.ingredients[ingredientName];

          // Retrieve the current quantity of the ingredient from the warehouse
          warehouseRef.child(ingredientName).once('value', ingredientSnapshot => {
            const ingredientInWarehouse = ingredientSnapshot.val();

            if (ingredientInWarehouse) {
              // Deduct the required quantity from the current quantity in the warehouse
              const newQuantity = ingredientInWarehouse.quantity - requiredQuantity;

              // Update the warehouse with the new quantity
              warehouseRef.child(ingredientName).update({ quantity: newQuantity });
            }
          });
        }
      }
    }
  });

    // Reset component state
    this.setState({
      vendeg: '',
      tetel: '',
      ar: '',
      szamlalo: ''
    });
  });
}

toggleFullScreen() {
  let elem = document.documentElement;

  if (!document.fullscreenElement && !document.mozFullScreenElement &&
      !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (elem.requestFullscreen) {
          elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
      }
  } else {
      if (document.exitFullscreen) {
          document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
      }
  }
}


  onClickButton = e =>{
    e.preventDefault()
    this.setState({openModal : true})
}

onClickButtonnn = e =>{
  e.preventDefault()
  this.setState({openModalll : true})
}
onClickButtonnnn = e =>{
  e.preventDefault()
  this.setState({openModallll : true})
}

onClickBbuttonnnn = e =>{
  e.preventDefault()
  this.setState({openModalllll : true})
}

onCloseModal = ()=>{
  this.setState({openModal : false})
}
onCloseModalll = ()=>{
  this.setState({openModalll : false})
}
onCloseModallll = ()=>{
  this.setState({openModallll : false})
}
onCloseMmodallll = ()=>{
  this.setState({openModalllll : false})
}

componentDidMount() {
  initialize();
  Firebase.auth().onAuthStateChanged((user) => {
    if (user.email === 'kalolevente@gmail.com' || user.email === 'lalivaroskut@gmail.com') {
      this.setState({ isVisible: true });
    } else {
      this.setState({ isVisible: false });
    }
  });
  const itemsRef = Firebase.database().ref('items');
  const itemsRefT = Firebase.database().ref('sale');
  const itemsRefR = Firebase.database().ref('rev');
  const itemsRefP = Firebase.database().ref('tetelek');
  itemsRefR.on('value', (snapshot) => {
    let items = snapshot.val();
    let ossz = [];
      for (let item in items) {
        ossz.push({
          ossz: items[item].vegosszeg
        });
      }
    
    this.setState({bevtl: ossz});
  });
  itemsRef.on('value', (snapshot) => {
    let items = snapshot.val();
    let newState = [];
    for (let item in items) {
      newState.push({
        id: item,
        user: items[item].user
      });
    }
    this.setState({
      items: newState
    });
  });
  itemsRefT.on('value', (snapshot) => {
    let items = snapshot.val();
    let newState = [];
    for (let item in items) {
      let currentItem = items[item];
      newState.push({
        id: item,
        cat: items[item].cat,
        ar: items[item].ar,
        nev: items[item].nev,
        ingredients: currentItem.ingredients ? Object.entries(currentItem.ingredients).map(([ingName, quantity]) => ({
          name: ingName,
          quantity: quantity
      })) : []
      });
    }
    this.setState({
      termekek: newState
    });
  });
  itemsRefP.on('value', (snapshot) => {
    let items = snapshot.val();
    let newState = [];
    for (let item in items) {
      newState.push({
        id: item,
        ar: items[item].ar,
        tetel: items[item].tetel,
        vendeg: items[item].vendeg,
        szamlalo: items[item].szamlalo,
      });
      this.setState({
        lista: newState
      });
    }
  });
}


  render() {
    if (this.props.authState === authStates.INITIAL_VALUE) {
      return <Loader />;
    }

    if (this.props.authState === authStates.LOGGED_OUT) {
      return <Redirect to="/login"></Redirect>;
    }
    let numbers = this.state.lista;
    let result = numbers.filter(item => item.vendeg === this.state.cimnev).reduce((total, currentValue) => total = total + currentValue.ar * currentValue.szamlalo,0);           
    let bevtl = this.state.bevtl;
    let resultt = bevtl.reduce((total, currentValue) => total + currentValue.ossz,0);
  
    return (
      <div className="container">
        
        
        <div className="helo">

          <div className="feherablak3">
            <p>{resultt} Ft</p>

          </div>

          <div className="feherablak2">
          <img src={logo}  alt="logo" className="img"></img>
          </div>

          <div className="feherablak">
            <h2>{this.state.user}</h2>
            <div className="inner">
              <button className="buttonr" onClick={handleSignOut}> Kijelentkezés </button>
              {/*<button className="button" onClick={this.handleZaras}> ZÁRÁS </button>*/}
              <button className="buttonfl" onClick={this.toggleFullScreen.bind(this)}>Fullscreen</button>
            </div>
            {this.state.isVisible && (
              <div className="inner" style={{ width: "100%", marginTop: 10 }}>
                <Link style={{ textDecoration: "none", backgroundColor: "#F3BB61", padding: 8, borderRadius: 10, color: "white", fontWeight: "bold" }} to="/admin">Admin</Link>
              </div>
            )}
          </div>

          
        </div>

        <div className="feherablak4">
          <div className="feherablak5">

            <h2>Vendéglista</h2>

            <form onSubmit={this.handleSubmit}>
              <label>
                <input type="text" value={this.state.value} placeholder="Vendég neve" onChange={this.handleChange} />
              </label>
              <input className="ipuntplus" type="submit" value="+" />
            </form>
            

            <ul className="nevek">
              {this.state.items.map((item) => {
                return (
                  <li className="nevekli" onClick={() => {this.setState({cimnev: item.user}); this.setState({ter: result}); this.setState({id: item.id})}} key={item.id}>
                    {item.user}
                  </li>
                )
              })}
            </ul>

          </div>

          
          <div className="feherablak6">
            <div className="profil">
              <div className="nev">
                <h2>{this.state.cimnev}</h2>
                
              </div>
              <div className="plus">
                <button onClick={this.onClickButton} className="buttonprof"> + </button>
                <Modal open={this.state.openModal} onClose={this.onCloseModal}>
                 <div className="modd">
                 <div className="szuro">
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "meleg"})}}>Meleg italok</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "üdítők"})}}>Üdítők</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "borok"})}}>Borok</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "koktel"})}}>Koktélok</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "rovid2"})}}>Rövid 2cl</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "rovid4"})}}>Rövid 4cl</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "sör"})}}>Sör</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "snack"})}}>Snackek</button>
                   <button className="modalhozz" onClick={() => {this.setState({modcat: "jeges italok"})}}>Jeges italok </button>
                 </div>

                 <ul className="termlist">
                   {this.state.termekek.filter(item => item.cat === this.state.modcat).map((item) => {
                     return (
                       <li className="nevekli" onClick={() => {this.setState({szamlalo: 1});this.setState({ar: item.ar}); this.setState({tetel: item.nev})}} key={item.id}>
                         <h4>{item.nev}</h4>
                         <h3>{item.ar} Ft</h3>
                         
                       {/*enis.can.write=prg'name'*/}
                       </li>
                     )
                   })}
                 </ul>

                 </div>

                 
                <button className="modalhozz" onClick={this.handleSubmitTerm}>Hozzáad</button>
                </Modal>
              </div>
              <div className="fizetes">
              <Modal open={this.state.openModalllll} onClose={this.onCloseMmodallll}>
                <h6>BIZTOSAN FIZET?</h6>
                <button className="modalhozz" onClick={this.handleSubmitFiz}>FIZET</button>
                <button className="buttonr" onClick={this.onCloseMmodallll}>MÉGSE</button>
                </Modal>
                <button className="buttonfiz" onClick={this.onClickBbuttonnnn}> Fizetés </button>
              </div>

            </div>

            <div className="fizetendo">
            
              Fizetendő: {result} Ft
            </div>

            <ul className="cucclist">
                          {this.state.lista.filter(item => item.vendeg === this.state.cimnev).map((item) => {
                           let szamlalo = item.szamlalo;
                           //const itemsRefs = Firebase.database().ref('tetelek/' + item.id);
                           return (
                              <li  key={item.id}>
                                <div className="tetelelista">
                                  <div className="szamlalo">{item.ar * szamlalo} Ft</div>
                                  <div className="szamlalo">{szamlalo} db</div>
                                  <div className="cucclihozz">{item.tetel}</div>
                                  <div className="szamlalop" onClick={() => this.incrementSzamlalo(item.id)}>+</div>
                                  <div className="szamlalom" onClick={() => this.decrementSzamlalo(item.id)}>-</div>
                                  <div className="szamlalok" onClick={() => {this.setState({openModalll: true}); this.setState({idt: item.id})}}>törlés</div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                        <Modal open={this.state.openModalll} onClose={this.onCloseModalll}>
                                    <h6>BIZTOSAN TÖRÖLNI AKAROD EZT A TÉTELT?</h6>
                                    <button className="modalhozz" onClick={this.handleSubmitTetelTorles}>TÖRLÉS</button>
                        </Modal>
          </div>
        </div>
      </div>
    );
  }
   
}

export default withAuth(Home);
