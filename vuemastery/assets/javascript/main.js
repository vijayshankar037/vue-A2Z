var eventBus = new Vue();

Vue.component('product', {
  props:{
    premium:{
      type: Boolean,
      required: true
    },
    cartcount:{
      type: Number,
      required: true,
      default: 0
    }
  },

  template:`
            <div class="product">
                      <div class="product-image">
              <img v-bind:src="image">
            </div>

            <div class="product-info">
              <h1> {{ title }}</h1>
              <!-- <p v-if="inStock">In Stock</p> -->
              <p v-if="inStock > 10">In Stock</p>
              <p v-else-if="inStock <=10 && inStock > 0">Almost sold out</p>
              <p v-else>Out of Stock</p>
              <a :href="link" target="_blank">More products like this</a>
              <p v-if="onSale">On Sale!</p>
              <p >Shipping: {{shipping}}</p>
              <product-details :details="details"></product-details>

              <div v-for="(variant, index) in variants" :key="variant.varientId"
              class="color-box"
              :style="{ backgroundColor: variant.variantColor}"
              @mouseover="updateProduct(index)"
              >
              </div>
              <button
                v-on:click="addToCart"
                :disabled="!inStock"
                :class="{ disabledButton: !inStock }"
              >Add to cart</button>

              <button
              v-on:click="removeFromCart"
              :disabled="!isCartEmpty"
              :class="{ disabledButton: !isCartEmpty }"
              >Remove from cart</button>
            </div>

            <product-tabs :reviews="reviews"></product-tabs>

          </div>`,
  data(){
    return {

        brand: "Vue Mastery",
        product: "Socks",
        //image: "./assets/images/vmSocks-green-onWhite.jpg",
        //inStock: false,
        selectedVariant: 0,
        //inventory: 80,
        onSale: true,
        link: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
        //inStock: true,
        details: ["80% cotton", "20% polyester", "Gender-neutral"],
        variants: [
          {
            variantId: 123,
            variantColor: "green",
            variantImage: './assets/images/vmSocks-green-onWhite.jpg',
            variantQuantity: 50
          },
          {
            variantId: 124,
            variantColor: "blue",
            variantImage: './assets/images/vmSocks-blue-onWhite.jpg',
            variantQuantity: 0
          }
        ],
        reviews: []

    }
  },
  methods:{
    addToCart(){
      this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
    },
    updateProduct(index){
      this.selectedVariant = index
    },
    removeFromCart(){
      this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
    }
    //,
    // addReview(productReview) {
    //   this.reviews.push(productReview)
    // }
  },
  computed: {
    title(){
      return this.brand + ' ' + this.product
    },
    image(){
      return this.variants[this.selectedVariant].variantImage
    },
    inStock(){
      return this.variants[this.selectedVariant].variantQuantity
    },
    isCartEmpty(){
      return this.cartcount > 0
    },
    shipping(){
      if(this.premium){return "free"}
      return 2.99
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview=>{
      this.reviews.push(productReview)
    })
  }
})

Vue.component('product-details',{
  props:{
  details:{
            type: Array,
            required: true
          }
  },
  template:`<ul>
            <li v-for="detail in details">{{detail}}</li>
          </ul>`
});

Vue.component('product-review',{
  template: `
            <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
              <b>Please correct the following error(s).</b>
              <ul>
                <li v-for="error in errors"> {{error}} </li>
              </ul>
              </p>
            <p>
            <p>
              <label for="name">Name:</label>
              <input id="name" v-model="name" placeholder="name">
            </p>
            <p>
              <label for="review">Review:</label>
              <textarea id="review" v-model="review"></textarea>
            </p>
            <p>
              <label for="rating">Rating:</label>
              <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
              </select>
            </p>

            <p>Would you recommend this product?</p>
            <label>
              Yes
              <input type="radio" value="Yes" v-model="recommend"/>
            </label>
            <label>
              No
              <input type="radio" value="No" v-model="recommend"/>
            </label>

            <p>
              <input type="submit" value="Submit">
            </p>
          </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods:{
    onSubmit() {
      this.errors = []
      if(this.name && this.review && this.rating && this.recommend){
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommend = null
      }else{
        if(!this.name) this.errors.push("Name is required.")
        if(!this.review) this.errors.push("Review is required.")
        if(!this.rating) this.errors.push("Rating is required.")
        if(!this.recommend) this.errors.push("Recommendation required.")
      }
    }
  }
});

Vue.component('product-tabs', {
  props:{
    reviews: {
      type: Array,
      required: true
    }
  },
  template:
    `<div>
      <ul>
        <span :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs"
              @click="selectedTab = tab"
        >{{ tab }}</span>
      </ul>

      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
        <p v-if="!reviews.length">There are no reviews yet.</p>
        <ul>
        <li v-for="review in reviews">
          <p>{{review.name}}</p>
          <p>{{review.review}}</p>
          <p>Rating: {{review.rating}}</p>
          <p>Recommendation: {{review.recommend}}</p>
        </li>
        </ul>
      </div>
      <div v-show="selectedTab === 'Make a Review'">
        <product-review ></product-review>
      </div>
    </div>`,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})

var app = new Vue({
  el: '#app',
  data:{
    premium: true,
    cart:[]
  },
  methods: {
    AddItemToCart(Id){
      this.cart.push(Id)
    },
    removeItemFromCart(Id){
      this.cart.pop(Id)
    }
  },
  computed:{
    itemCount(){
      return this.cart.length
    }
    
  }
});