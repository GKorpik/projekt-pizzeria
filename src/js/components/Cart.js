import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = 20;
    //console.log('new Cart', thisCart);
  }


  
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone.value);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address.value);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
   
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalPrice: thisCart.totalPrice,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products){
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };      
    
    fetch(url, options)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        console.log(parsedResponse);
      });
  }

  remove(cartProduct){

    const thisCart = this;

    const index = thisCart.products.indexOf('cartProduct');
    console.log('index', thisCart.index);
  
    thisCart.products.splice(index);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }


  add(menuProduct){
    const thisCart = this;

    //console.log('adding product', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generatedHTML', generatedHTML);
    

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('generatedDOM', generatedDOM);
    
    const cartContainer = thisCart.dom.productList;
    //console.log('cartContainer', cartContainer);
    
    cartContainer.appendChild(generatedDOM);
    
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    
    thisCart.update();  
  }

  update(){
    
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(const product of thisCart.products){
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('thisCart.totalPrice',thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

}
