const productList = document.getElementById("productList")
const searchInput = document.getElementById("searchInput")

let allProducts=[]


db.collection("barang")
.orderBy("order","asc")
.onSnapshot(snapshot=>{

      allProducts=[]

      snapshot.forEach(doc=>{

            allProducts.push({
                  id:doc.id,
                  ...doc.data()
            })

      })

      renderProducts(allProducts)

})



function renderProducts(products){

      productList.innerHTML=""

      products.forEach(data=>{

            const hargaFinal=data.diskon
            ? data.harga-(data.harga*data.diskon/100)
            : data.harga

            let badge=`<div class="badge-ready">Ready</div>`

            if(data.diskon && data.diskon>0){
                  badge=`<div class="badge-discount">-${data.diskon}%</div>`
            }

            productList.innerHTML+=`
            <div class="product-card">

                  <div class="product-image">

                        <img src="asset/product.png">

                        ${badge}

                  </div>

                  <div class="product-body">

                        <div class="product-tags">
                         <span class="tag">Original</span>
                        </div>

                        <h3 class="product-title">
                              ${data.nama}
                        </h3>

                        <p class="product-desc">
                              • Premium access<br> 
                              • Full Update
                            
                        </p>

                        <div class="price-box">

                              ${data.diskon?`
                              <span class="price-old">
                                    Rp ${data.harga.toLocaleString("id-ID")}
                              </span>
                              `:""}

                              <span class="price-new">
                                    Rp ${hargaFinal.toLocaleString("id-ID")}
                              </span>

                        </div>

                        <div class="product-actions">

                              <button
                              class="btn-detail"
                              onclick="showDetail('${data.id}')">
                              Detail
                              </button>

                        </div>

<button
class="btn-buy"
onclick="openBuy('${data.nama}',${hargaFinal})">
Beli Sekarang
</button>

                  </div>

            </div>
            `
      })

}



searchInput.addEventListener("input",function(){

const keyword=this.value.toLowerCase()

const hero=document.getElementById("heroSection")
const service=document.getElementById("service")
const testi=document.getElementById("testiSection")
const faq=document.getElementById("faq")

if(keyword.length>0){

hero.style.display="none"
service.style.display="none"
testi.style.display="none"
faq.style.display="none"

document.body.classList.add("search-active")

}else{

hero.style.display=""
service.style.display=""
testi.style.display=""
faq.style.display=""

document.body.classList.remove("search-active")

}

const filtered=allProducts.filter(product=>
product.nama.toLowerCase().includes(keyword)
)

renderProducts(filtered)

})

const clearBtn=document.getElementById("clearSearch")

searchInput.addEventListener("input",function(){

if(this.value.length>0){
clearBtn.style.display="block"
}else{
clearBtn.style.display="none"
}

})

clearBtn.addEventListener("click",function(){

searchInput.value=""

clearBtn.style.display="none"

document.body.classList.remove("search-active")

document.getElementById("heroSection").style.display=""
document.getElementById("service").style.display=""
document.getElementById("testiSection").style.display=""
document.getElementById("faq").style.display=""

renderProducts(allProducts)

})