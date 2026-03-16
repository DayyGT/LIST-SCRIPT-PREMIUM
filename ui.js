/* ================= CARD EFFECT ================= */
document.addEventListener("click",function(e){
const card=e.target.closest(".product-card")
if(!card)return
document.querySelectorAll(".product-card").forEach(c=>c.classList.remove("active"))
card.classList.add("active")
})

let hargaProduk=0
let namaProduk=""
let statusBayar="belum"
let orderId=null


/* =============== SHOW DETAIL ================= */
function showDetail(id){

db.collection("barang").doc(id).get().then(doc=>{

const data=doc.data()

const hargaFinal=data.diskon
?data.harga-(data.harga*data.diskon/100)
:data.harga

const modal=document.getElementById("productModal")
const content=document.getElementById("modalContent")

const lines=data.deskripsi.split("\n")

let list=""

lines.forEach(line=>{
list+=`<li>${line}</li>`
})

content.innerHTML=`

<div class="detail-info-box">

<div class="detail-head">

<img src="${data.gambar || 'product.png'}" class="detail-img">

<div class="detail-info">

<h3 class="detail-name">
${data.nama}
</h3>

<div class="detail-meta">
${data.kategori || "Script Premium"} • ${data.durasi || "Faster"} • ${data.tag || "Best Seller"}
</div>

<div class="detail-price">
Rp${hargaFinal.toLocaleString("id-ID")}
<span> / ${data.durasi || "Full-Update"}</span>
</div>

</div>

</div>

</div>

<ul class="detail-desc">
${list}
</ul>

<div class="detail-actions">

<a href="${data.showcase || '#'}"
target="_blank"
class="btn-showcase">
Showcase
</a>

<button class="btn-close" onclick="closeModal()">
Tutup
</button>

</div>

`

modal.style.display="flex"
document.body.classList.add("modal-open")

})

}


function closeModal(){
document.getElementById("productModal").style.display="none"
document.body.classList.remove("modal-open")
}


/* ================= BUY FORM ================= */

const buyModal=document.getElementById("buyModal")
const formProduk=document.getElementById("formProduk")
const formKontak=document.getElementById("formKontak")
const formTanggal=document.getElementById("formTanggal")
const formKet=document.getElementById("formKet")


function openBuy(nama,harga){

namaProduk=nama
hargaProduk=harga

formProduk.value=nama

resetBuyForm()

buyModal.style.display="flex"
document.body.classList.add("modal-open")

}


function closeBuy(){

buyModal.style.display="none"
document.body.classList.remove("modal-open")

resetBuyForm()

}

function resetBuyForm(){

formKontak.value=""
formTanggal.value=""
formKet.value=""

document.querySelectorAll(".form-error").forEach(el=>{
el.style.display="none"
})

document.querySelectorAll(".input-error").forEach(el=>{
el.classList.remove("input-error")
})

}

formKontak.addEventListener("input",()=>{
formKontak.classList.remove("input-error")
document.getElementById("errorKontak").style.display="none"
})

formTanggal.addEventListener("input",()=>{
formTanggal.classList.remove("input-error")
document.getElementById("errorTanggal").style.display="none"
})

formKet.addEventListener("input",()=>{
formKet.classList.remove("input-error")
document.getElementById("errorKet").style.display="none"
})
/* ================= SUBMIT ORDER ================= */
let lastOrderTime = 0;
function submitOrder(){

/* ================= ANTI SPAM 10 DETIK ================= */

const now = Date.now();

if(now - lastOrderTime < 10000){

showToast("Tunggu 10 detik")

return;

}

lastOrderTime = now;

/* ================= FORM VALIDATION ================= */

const kontak=formKontak.value.trim()
const tanggal=formTanggal.value.trim()
const ket=formKet.value.trim()

let valid=true

document.querySelectorAll(".form-error").forEach(el=>{
el.style.display="none"
})

document.querySelectorAll(".input-error").forEach(el=>{
el.classList.remove("input-error")
})


if(!kontak){
document.getElementById("errorKontak").innerText="Isi Discord / WhatsApp"
document.getElementById("errorKontak").style.display="block"
formKontak.classList.add("input-error")
valid=false
}

if(!tanggal){
document.getElementById("errorTanggal").innerText="Tanggal belum dipilih"
document.getElementById("errorTanggal").style.display="block"
formTanggal.classList.add("input-error")
valid=false
}

if(!ket){
document.getElementById("errorKet").innerText="Keterangan belum diisi"
document.getElementById("errorKet").style.display="block"
formKet.classList.add("input-error")
valid=false
}

if(!valid)return


const data = {
produk: namaProduk,
harga: hargaProduk,
kontak: kontak,
tanggal: tanggal,
keterangan: ket,
status: "menunggu",
waktu: firebase.firestore.FieldValue.serverTimestamp()
}


db.collection("Customer").add(data).then(doc=>{

orderId=doc.id

buyModal.style.display="none"

document.getElementById("qrisHarga").innerText=
"Rp "+hargaProduk.toLocaleString("id-ID")

document.getElementById("qrisModal").style.display="flex"

document.body.classList.add("modal-open")
document.body.classList.add("qris-active")

statusBayar="belum"

const btn=document.getElementById("btnKirim")

btn.disabled=true
btn.classList.add("disabled")

document.querySelector('input[value="belum"]').checked=true

})

}


/* ================= STATUS BAYAR ================= */

function setBayarStatus(status){

statusBayar=status

const btn=document.getElementById("btnKirim")

if(status==="sudah"){
btn.disabled=false
btn.classList.remove("disabled")
}else{
btn.disabled=true
btn.classList.add("disabled")
}

}


/* ================= RADIO LISTENER (FIX STABIL) ================= */

document.querySelectorAll('input[name="bayar"]').forEach(radio=>{

radio.addEventListener("change",function(){

setBayarStatus(this.value)

})

})


/* ================= CLOSE QRIS ================= */

function closeQris(){

document.getElementById("qrisModal").style.display="none"

document.body.classList.remove("modal-open")
document.body.classList.remove("qris-active")

/* RESET STATE */

statusBayar="belum"
orderId=null

document.getElementById("paymentSuccess").style.display="none"

const btn=document.getElementById("btnKirim")

btn.innerText="Kirim"
btn.disabled=true
btn.classList.add("disabled")

btn.onclick=function(){
kirimOrder()
}

document.querySelector('input[value="belum"]').checked=true

}


/* ================= QRIS ZOOM ================= */

function openQrisImage(){

const zoom=document.getElementById("qrisZoom")

if(zoom)zoom.style.display="flex"

}


const zoomBox=document.getElementById("qrisZoom")

if(zoomBox){

zoomBox.onclick=function(){
this.style.display="none"
}

}


/* ================= KIRIM ORDER ================= */

function kirimOrder(){

if(statusBayar!=="sudah"){
alert("Silakan pilih 'Sudah bayar' terlebih dahulu")
return
}

if(!orderId){
alert("Order tidak ditemukan")
return
}

db.collection("Customer")
.doc(orderId)
.update({
status:"selesai",
waktu_selesai:Date.now()
})
.then(()=>{

sendDiscordWebhook({
produk:namaProduk,
harga:hargaProduk,
kontak:formKontak.value,
tanggal:formTanggal.value,
keterangan:formKet.value
});

document.getElementById("paymentSuccess").style.display="block"

const btn=document.getElementById("btnKirim")

btn.innerText="Lanjut Discord"

btn.disabled=false
btn.classList.remove("disabled")

btn.onclick=function(){
window.open("https://discord.gg/UpPJdb74vV")
}

})
.catch(err=>{
console.log(err)
alert("Gagal mengirim order")
})

}

/* SIDEBAR */
const sidebar=document.querySelector(".sidebar")
const overlay=document.querySelector(".sidebar-overlay")

function openSidebar(){

document.querySelector(".sidebar").classList.add("active")
document.getElementById("sidebarOverlay").classList.add("active")

document.body.classList.add("sidebar-open")

}

function closeSidebar(){

document.querySelector(".sidebar").classList.remove("active")
document.getElementById("sidebarOverlay").classList.remove("active")

document.body.classList.remove("sidebar-open")

}

function scrollToSection(id){

const section=document.getElementById(id)

if(section){
section.scrollIntoView({
behavior:"smooth"
})
}
closeSidebar()
}

function openLogin(){
window.location.href = "login.html";
}

function toggleFaq(element){

const item = element.parentElement
const answer = item.querySelector(".faq-answer")
const icon = item.querySelector(".faq-icon")

if(answer.style.display === "block"){

answer.style.display = "none"
icon.innerText = "+"

}else{

answer.style.display = "block"
icon.innerText = "-"

}
}

function scrollToTop(){

window.scrollTo({

top:0,
behavior:"smooth"

})

}

function showToast(text){

const toast=document.getElementById("toastBox")
const toastText=document.getElementById("toastText")

toastText.innerText=text

toast.classList.add("show")

setTimeout(()=>{
toast.classList.remove("show")
},2500)

}

async function sendDiscordWebhook(data){

const webhook = await getWebhook()

const message = {
embeds:[
{
title:"Order Selesai",
color:Math.floor(Math.random()*16777215),
fields:[
{name:"Produk :",value:data.produk,inline:true},
{name:"Harga :",value:`Rp ${data.harga}`,inline:true},
{name:"Tanggal :",value:data.tanggal,inline:true}
],
footer:{
text:"Website Order System"
}
}
]
}

await fetch(webhook,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(message)
})

}

async function getWebhook(){

const doc = await db.collection("settings")
.doc("discord")
.get()

return doc.data().webhook

}
