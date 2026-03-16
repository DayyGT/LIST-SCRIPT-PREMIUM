// ================= FIREBASE =================

const firebaseConfig = {
apiKey: "AIzaSyD3DOjy_OpxmwRGIC-tDNdxXwpSFliJb-c",
authDomain: "webs-50d23.firebaseapp.com",
projectId: "webs-50d23",
storageBucket: "webs-50d23.firebasestorage.app",
messagingSenderId: "473965943790",
appId: "1:473965943790:web:049b5ba5ede76656134cff",
measurementId: "G-E7C14CK9QX"
};

firebase.initializeApp(firebaseConfig);
const appCheck = firebase.appCheck();

appCheck.activate(
"6LduqowsAAAAAPeiGV-6lCoGi--Z0q8DNFRxSgS1",
true
);

const db = firebase.firestore();
const auth = firebase.auth();

/* ================= SECURITY ADMIN ================= */

document.body.style.display = "none";

auth.onAuthStateChanged(async (user)=>{

if(!user){
window.location.replace("login.html");
return;
}

try{

const adminDoc = await db.collection("admins").doc(user.email).get();

if(!adminDoc.exists){

alert("Akses admin ditolak");

await auth.signOut();

window.location.replace("login.html");
return;

}

document.body.style.display = "block";

}catch(err){

console.error("Admin check error:",err);

window.location.replace("login.html");

}

});

const listBarang = document.getElementById("listBarang");

let isDragging = false;
let scrollSpeed = 12;
let mouseY = 0;
let autoScrollInterval = null;

// ================= EDIT PRODUK =================

let currentEditId=null;

function openEdit(id){

currentEditId=id;

db.collection("barang").doc(id).get().then(doc=>{

const data=doc.data();

editNama.value=data.nama||"";
editDeskripsi.value=data.deskripsi||"";
editHarga.value=data.harga||"";
editShowcase.value=data.showcase||"";
editDiskon.value=data.diskon||0;

editModal.classList.add("active");
document.body.classList.remove("modal-open");
});

}

function closeEdit(){
editModal.classList.remove("active");
document.body.classList.remove("modal-open");
}


function saveEdit(){

const nama=editNama.value;
const deskripsi=editDeskripsi.value;
const harga=editHarga.value;
const showcase=editShowcase.value;

let diskon=editDiskon.value||0;
let diskonAktif=diskon>0;

db.collection("barang").doc(currentEditId).update({

nama,
deskripsi,
harga:Number(harga),
showcase,
diskon:Number(diskon),
diskonAktif

}).then(()=>{

closeEdit();

});

}


// ================= SIDEBAR =================

function showSection(section,element){

document.querySelectorAll(".admin-section")
.forEach(sec=>sec.classList.remove("active"));

document.getElementById("section-"+section)
.classList.add("active");

document.querySelectorAll(".admin-menu-item")
.forEach(i=>i.classList.remove("active-menu"));

element.classList.add("active-menu");

adminSidebar.classList.remove("active");
adminOverlay.classList.remove("active");

document.body.classList.remove("no-scroll");

}


function toggleAdminSidebar(){

const active=adminSidebar.classList.contains("active");

if(active){

adminSidebar.classList.remove("active");
adminOverlay.classList.remove("active");

document.body.classList.remove("no-scroll");

}else{

adminSidebar.classList.add("active");
adminOverlay.classList.add("active");

document.body.classList.add("no-scroll");

}

}

adminOverlay.onclick=()=>{

adminSidebar.classList.remove("active");
adminOverlay.classList.remove("active");

document.body.classList.remove("no-scroll");

};


// ================= DISKON INPUT =================

function toggleDiskonInput(){

const aktif=diskonAktif.checked;

diskonInputBox.style.display=aktif?"block":"none";

}


// ================= TAMBAH PRODUK =================

async function tambahBarang(){

const nama=namaBarang.value;
const deskripsi=deskripsiBarang.value;
const harga=hargaBarang.value;

const diskon=diskonBarang.value||0;
const diskonAktifVal=diskonAktif.checked;

const showcase=showcaseLink.value;

if(!nama||!deskripsi||!harga){

alert("Isi semua data produk dulu");
return;

}

const snapshot=await db.collection("barang").get();
const newOrder=snapshot.size+1;

await db.collection("barang").add({

nama,
deskripsi,
harga:Number(harga),
diskon:Number(diskon),
diskonAktif:diskonAktifVal,
order:newOrder,
showcase:showcase||""

});

namaBarang.value="";
deskripsiBarang.value="";
hargaBarang.value="";
diskonBarang.value="";
showcaseLink.value="";

diskonAktif.checked=false;

toggleDiskonInput();

}


// ================= LOAD PRODUK =================

db.collection("barang")
.orderBy("order","asc")
.onSnapshot(snapshot=>{

const fragment=document.createDocumentFragment();

snapshot.forEach(doc=>{

const data=doc.data();

const item=document.createElement("div");

item.className="product-row draggable";
item.setAttribute("draggable","false");
item.dataset.id=doc.id;

item.innerHTML=`

<div class="product-left">

<h3>${data.nama}</h3>

${data.diskon>0?`
<p class="price-old">Rp ${data.harga.toLocaleString("id-ID")}</p>
<p class="price-new">
Rp ${(data.harga-(data.harga*data.diskon/100)).toLocaleString("id-ID")}
</p>
`:
`<p class="price-new">Rp ${data.harga.toLocaleString("id-ID")}</p>`}

<span class="desc-btn" onclick="openDesc('${doc.id}')">
Lihat deskripsi
</span>

</div>

<div class="product-right">


${data.diskon?`<span class="discount-badge">-${data.diskon}%</span>`:""}

<button class="menu-btn" onclick="toggleMenu('${doc.id}',event)">
⋮
</button>
<div class="drag-handle">☰</div>

<div class="menu-dropdown" id="menu-${doc.id}">

<button onclick="moveUp('${doc.id}',${data.order})">
Naik
</button>

<button onclick="moveDown('${doc.id}',${data.order})">
Turun
</button>

<button onclick="openEdit('${doc.id}')">
Edit
</button>

<button onclick="hapusBarang('${doc.id}')">
Hapus
</button>

</div>

</div>

`;

fragment.appendChild(item);

});

listBarang.innerHTML="";
listBarang.appendChild(fragment);

enableDrag();

});


// ================= MENU TITIK 3 =================

function toggleMenu(id,event){

event.stopPropagation();

const menu=document.getElementById("menu-"+id);

document.querySelectorAll(".menu-dropdown")
.forEach(m=>{

if(m!==menu) m.style.display="none";

});

menu.style.display=menu.style.display==="flex"?"none":"flex";

}

document.addEventListener("click",()=>{

document.querySelectorAll(".menu-dropdown")
.forEach(menu=>menu.style.display="none");

});


// ================= DESKRIPSI =================

function openDesc(id){

db.collection("barang").doc(id).get().then(doc=>{

descText.innerText = doc.data().deskripsi;

descModal.classList.add("active");

document.body.classList.add("modal-open"); // lock scroll

});

}

function closeDesc(){

descModal.classList.remove("active");
document.body.classList.remove("modal-open");
}


// ================= MOVE UP =================

async function moveUp(id,currentOrder){

const prevQuery=await db.collection("barang")
.where("order","<",currentOrder)
.orderBy("order","desc")
.limit(1)
.get();

if(!prevQuery.empty){

const prevDoc=prevQuery.docs[0];

await db.collection("barang").doc(id).update({
order:prevDoc.data().order
});

await db.collection("barang").doc(prevDoc.id).update({
order:currentOrder
});

}

}


// ================= MOVE DOWN =================

async function moveDown(id,currentOrder){

const nextQuery=await db.collection("barang")
.where("order",">",currentOrder)
.orderBy("order","asc")
.limit(1)
.get();

if(!nextQuery.empty){

const nextDoc=nextQuery.docs[0];

await db.collection("barang").doc(id).update({
order:nextDoc.data().order
});

await db.collection("barang").doc(nextDoc.id).update({
order:currentOrder
});

}

}


// ================= DRAG SYSTEM =================

function enableDrag(){

const items = document.querySelectorAll(".product-row");

items.forEach(item=>{

const handle = item.querySelector(".drag-handle");
handle.style.touchAction = "none";

handle.addEventListener("pointerdown",()=>{
item.setAttribute("draggable","true");
});

item.addEventListener("dragstart",(e)=>{

isDragging = true;

mouseY = e.clientY;

item.classList.add("dragging");

requestAnimationFrame(autoScroll);

});

item.addEventListener("drag",(e)=>{

mouseY = e.clientY;

});

item.addEventListener("dragend",()=>{

isDragging = false;

item.setAttribute("draggable","false");

item.classList.remove("dragging");

clearInterval(autoScrollInterval);

setTimeout(()=>{
updateOrderAfterDrag();
},100);

});

});

}


listBarang.addEventListener("dragover", e => {

e.preventDefault();

mouseY = e.clientY;

const dragging = document.querySelector(".dragging");
if(!dragging) return;

const afterElement = getDragAfterElement(listBarang, e.clientY);

if(afterElement == null){
listBarang.appendChild(dragging);
}else{
listBarang.insertBefore(dragging, afterElement);
}

});


function getDragAfterElement(container,y){

const draggableElements=[
...container.querySelectorAll(".draggable:not(.dragging)")
];

return draggableElements.reduce((closest,child)=>{

const box=child.getBoundingClientRect();

const offset=y-box.top-box.height*0.35;

if(offset<0 && offset>closest.offset){

return{offset:offset,element:child};

}else{

return closest;

}

},{offset:Number.NEGATIVE_INFINITY}).element;

}


async function updateOrderAfterDrag(){

const items=[...document.querySelectorAll(".draggable")];

for(let i=0;i<items.length;i++){

const id=items[i].dataset.id;

await db.collection("barang").doc(id).update({
order:i+1
});

}

}


// ================= DELETE =================

function hapusBarang(id){

if(confirm("Yakin hapus?")){

db.collection("barang").doc(id).delete();

}

}


// ================= LOGOUT =================

function logoutAdmin(){

auth.signOut().then(()=>{
window.location.href="login.html";
});

}

function autoScroll(){

if(!isDragging) return;

const topZone = 50;
const bottomZone = window.innerHeight - 50;

if(mouseY < topZone){

window.scrollBy(0,-5);

}

else if(mouseY > bottomZone){

window.scrollBy(0,5);

}

requestAnimationFrame(autoScroll);

}

/* ================= SEARCH KONTAK ================= */

let keywordKontak=""
let semuaOrder=[]

const searchKontak=document.getElementById("searchKontak")

if(searchKontak){

searchKontak.addEventListener("input",(e)=>{

keywordKontak=e.target.value.toLowerCase()
renderOrder()

})

}


/* ================= LOAD DATA PEMBELIAN ================= */

const listPembelian = document.getElementById("listPembelian");

if(listPembelian){

db.collection("Customer")
.orderBy("waktu","desc")
.onSnapshot(snapshot=>{

semuaOrder=[]

snapshot.forEach(doc=>{

semuaOrder.push({
id:doc.id,
...doc.data()
})

})

renderOrder()

})

}


/* ================= RENDER ORDER ================= */

function renderOrder(){

listPembelian.innerHTML=""

semuaOrder.forEach(data=>{

if(keywordKontak && !data.kontak.toLowerCase().includes(keywordKontak)) return

const item=document.createElement("div")

item.className="pembelian-card"

const statusClass=
data.status==="selesai"
?"status-selesai"
:"status-menunggu"

item.innerHTML=`

<div class="pembelian-head">

<div>

<p><b>Produk:</b> ${data.produk}</p>

<p><b>Harga:</b> Rp ${Number(data.harga).toLocaleString("id-ID")}</p>

<p>

<b>Status:</b>

<span class="status-badge ${statusClass}">
${data.status}
</span>

</p>

</div>

<div class="order-menu-wrapper">

<button class="menu-btn" onclick="toggleOrderMenu('${data.id}',event)">
⋮
</button>

<div class="order-menu-dropdown" id="orderMenu-${data.id}">

<button onclick="setOrderDone('${data.id}')">
Buat Selesai
</button>

<button onclick="hapusOrder('${data.id}')">
Hapus
</button>

</div>

</div>

</div>

<p><b>Tanggal:</b> ${data.tanggal}</p>

<p><b>Kontak:</b> ${data.kontak}</p>

<div class="menu-dropdown" id="orderMenu-${data.id}">

<button onclick="setOrderDone('${data.id}')">
Buat Selesai
</button>

<button onclick="hapusOrder('${data.id}')">
Hapus
</button>

</div>

`

listPembelian.appendChild(item)

})

}


/* ================= MENU TITIK 3 ORDER ================= */

function toggleOrderMenu(id,event){

event.stopPropagation()

const menu=document.getElementById("orderMenu-"+id)

/* tutup semua menu dulu */

document.querySelectorAll(".order-menu-dropdown").forEach(m=>{

if(m!==menu){
m.style.display="none"
}

})

/* toggle menu yang dipencet */

menu.style.display = menu.style.display==="flex" ? "none" : "flex"

}


document.addEventListener("click",()=>{

document.querySelectorAll(".order-menu-dropdown").forEach(menu=>{
menu.style.display="none"
})

})


/* ================= SET ORDER SELESAI ================= */

function setOrderDone(id){

db.collection("Customer").doc(id).update({
status:"selesai"
})

}


/* ================= HAPUS ORDER ================= */

function hapusOrder(id){

if(confirm("Hapus pesanan ini?")){

db.collection("Customer").doc(id).delete()

}

}