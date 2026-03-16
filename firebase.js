const firebaseConfig = {
apiKey: "AIzaSyD3DOjy_OpxmwRGIC-tDNdxXwpSFliJb-c",
authDomain: "webs-50d23.firebaseapp.com",
projectId: "webs-50d23",
storageBucket: "webs-50d23.firebasestorage.app",
messagingSenderId: "473965943790",
appId: "1:473965943790:web:049b5ba5ede76656134cff"
};

/* supaya tidak initialize dua kali */

if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
}

const appCheck = firebase.appCheck();

appCheck.activate(
"6LduqowsAAAAAPeiGV-6lCoGi--Z0q8DNFRxSgS1",
true
);

const db = firebase.firestore();
const auth = firebase.auth();