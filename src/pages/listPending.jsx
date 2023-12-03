/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Swal from 'sweetalert2'
import { BsFillCheckSquareFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig/firebase"
import { collection, query, getDocs, where, orderBy, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { motion } from 'framer-motion';

function listPending() {

    const [users, setUsers] = useState([])

    useEffect(() => {
        cargarListaPendientes();
    }, []);

    const cargarListaPendientes = async () => {
        try {
            const lib = query(
                collection(db, 'pendientes'),
                where('fechaPrestamo', '!=', ''),
                orderBy('fechaPrestamo', 'desc'),
            );

            const querySnapshot = await getDocs(lib);
            const pendientesData = [];

            querySnapshot.forEach((doc) => {
                pendientesData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            setUsers(pendientesData);
        } catch (error) {
            console.log("error de captura de usuarios", error);
        }
    };

    const stockBook = async (id,idPrestamo) => {
        const bookPrestamo = doc(db,"pendientes",idPrestamo);
        const bookDoc = doc(db, "books", id);
        const bookSnap = await getDoc(bookDoc);
        const bookData = bookSnap.data();
        const currentStock = parseInt(bookData.stock); // Convertir el stock a tipo numérico
        if (currentStock > 0) {
            const updatedStock = currentStock + 1; // Sumar 1 del stock
            // Actualizar el stock en la base de datos
            await updateDoc(bookDoc, {
                stock: updatedStock.toString(), // Convertir el stock actualizado de nuevo a string si es necesario
            });
        }
        await deleteDoc(bookPrestamo);
        cargarListaPendientes();
    }
        const confirmDelete = (id,idPrestamo) => {
            Swal.fire({
                title: 'Seguro que devolvio el libro?',
                text: "Verifica si devolvio el libro.!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si, devolvio esto!'
            }).then((result) => {
                if (result.isConfirmed) {
                    stockBook(id,idPrestamo)
                    Swal.fire(
                        'Libro Devuelto!',
                        'El estudiante devolvio con exito!.',
                        'success'
                    )
                }
            })
        }


        return (
            <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6 h-4/5 ">
                <div className="text-gray-600 body-font">
                    <div className="container px-5 py-16 mx-auto">
                        <div className="flex flex-col text-center w-full mb-12">
                            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-6 text-gray-900">LISTA DE LIBROS PENDIENTES</h1>
                            
                        </div>
                        <div className="flex flex-wrap -m-2">
                            {users.map((user) => (
                                <motion.div  initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5 }} key={user.id} className="p-2 lg:w-1/3 md:w-1/2 w-full ">
                                    {/*CARD*/}
                                    <div className="h-full flex items-center border-gray-200 border p-4 rounded-lg ">
                                        <img alt="team" className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0  mr-4" src={user.urlImagen} />
                                        <div className="flex-grow">
                                            <h2 className="text-gray-900 title-font font-medium">ESTUDIANTE: {user.nombreEstudiante} {user.apellidoEstudiante}</h2>
                                            <p className="text-gray-500">Libro Prestado: {user.tituloLibro}</p>
                                            <p className="text-gray-500">Fecha: {user.fechaPrestamo}</p>
                                        </div>
                                        <button onClick={() => { confirmDelete(user.idLibro,user.id) }}>
                                            <BsFillCheckSquareFill className="h-6 w-6" />
                                        </button>
                                    </div>
                                    {/* END CARD */}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    export default listPending