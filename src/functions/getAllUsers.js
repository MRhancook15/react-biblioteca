import { db } from '../firebaseConfig/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default async function getAllUsers() {
    const users = [];
    const collectionRef = collection(db, "students");
    const snapshot = await getDocs(collectionRef)
    snapshot.forEach((doc) => {
        users.push(doc.data());
    });
    return users;
}
