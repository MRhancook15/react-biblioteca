/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, Transition } from '@headlessui/react'
import Swal from 'sweetalert2'

import { db, storage } from "../firebaseConfig/firebase"
import { useState, useEffect, Fragment, useRef } from 'react'
import { collection, updateDoc, setDoc, addDoc, getDocs, query, where, limit, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { isSameMonth, lastDayOfMonth, format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';


function listTopUser() {

    const [numEstudiantesCargados, setNumEstudiantesCargados] = useState(10);
    const [totalDeEstudiantes, setTotalDeEstudiantes] = useState(0);
    const usuariosPorPagina = 10;
    const [estudiantesCargados, setEstudiantesCargados] = useState(false);
    const [users, setUsers] = useState([])
    const [books, setBooks] = useState([])
    const [estadoMes, setEstadoMes] = useState(false);

    useEffect(() => {
        if (!estudiantesCargados) {
            //console.log("se carga prinmera vez")
            cargarEstudiantes();
            setEstudiantesCargados(true);

        }
        obtenerFecha();
        //console.log("ya se cargo")
    }, [estudiantesCargados]);

    const cargarEstudiantes = async () => {
        try {
            const lib = query(
                collection(db, 'students'), //Referenciamos el database firestore
                where('librosLeidos', '!=', ''),
                orderBy('librosLeidos', 'desc'),
                limit(numEstudiantesCargados)
            );
            //console.log("lib",lib)
            const querySnapshot = await getDocs(lib);
            const estudiantesData = [];

            querySnapshot.forEach((doc) => {
                estudiantesData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            if (numEstudiantesCargados === 10) {
                setTotalDeEstudiantes(querySnapshot.size);
            }
            setUsers(estudiantesData);

            if (setEstudiantesCargados) {
                const currentDate = new Date(); //31/10/2023
                // Lógica para reiniciar el contador al comenzar un nuevo mes
                const resetCounter = isSameDay(currentDate, lastDayOfMonth(currentDate));
                if (resetCounter && estudiantesData.length > 0) { // Asegúrate de que haya estudiantes cargados
                    await historialEstudiantes(estudiantesData);
                }
            }

        } catch (error) {
            console.error('Error al cargar los libros', error);
        }
    };

    const cargarMasEstudiantes = () => {
        setNumEstudiantesCargados(numEstudiantesCargados + usuariosPorPagina);
    };

    // Botones para abrir modal
    const cancelButtonRef = useRef(null)
    const [open, setOpen] = useState(false);

    const openModal = async () => {
        setOpen(true);
    };
    const closeModal = () => {
        setOpen(false);
    };

    const cargarLibrosLeidos = async (id) => {
        try {
            if (estadoMes) {
                const lib = query(
                    collection(db, 'historialTopStudents', idEstudianteMes, "estudiantes", id, 'prestamos'), //Referenciamos el database firestore
                    orderBy('fechaPrestamo', 'desc'),
                );
                const querySnapshot = await getDocs(lib);
                const librosLeidoData = [];

                querySnapshot.forEach((doc) => {
                    librosLeidoData.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setBooks(librosLeidoData);
                return librosLeidoData;
            } else {
                const lib = query(
                    collection(db, 'students', id, "prestamos"), //Referenciamos el database firestore
                    orderBy('fechaPrestamo', 'desc'),
                );
                const querySnapshot = await getDocs(lib);
                const librosLeidoData = [];

                querySnapshot.forEach((doc) => {
                    librosLeidoData.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setBooks(librosLeidoData);
                return librosLeidoData;
            }
        } catch (error) {
            console.error('Error al cargar los libros', error);
        }
    };

    const historialEstudiantes = async (estudiantesData) => {
        try {
            const currentDate = new Date(); // Obtén la fecha actual
            const currentDateRef = collection(db, "historialTopStudents");
            const newDocRef = await addDoc(currentDateRef, {
                fecha: currentDate,
            });

            // Obtén el ID del documento recién creado
            if (newDocRef.id) {
                console.log('ID del documento:', newDocRef.id);
            } else {
                console.log('No se pudo obtener el ID del documento.');
            }

            const topEstudiantes = estudiantesData.slice(0, 5); // Obtén los 5 mejores estudiantes
            // Guarda los 5 mejores estudiantes en la colección 'historialTopStudents'
            for (const estudiante of topEstudiantes) {
                const libros = await cargarLibrosLeidos(estudiante.id);
                if (libros && libros.length > 0) {
                    const historialEstudianteRef = doc(db, 'historialTopStudents', newDocRef.id, 'estudiantes', estudiante.id);
                    await setDoc(historialEstudianteRef, {
                        ...estudiante,
                    });

                    for (const libro of libros) {
                        await addDoc(collection(historialEstudianteRef, 'prestamos'), libro);
                    }
                } else {
                    console.log('No se encontraron libros para el estudiante con ID:', estudiante.id);
                }
            }
            await reiniciarContadorLibrosLeidos();

            Swal.fire(
                'Se guardo correctamente!',
                'Click en el boton para continuar!',
                'success'
            )

            console.log('Historial de estudiantes guardado con éxito.');
        } catch (error) {
            console.log('Error al guardar el historial de estudiantes', error);
        }
    }

    const reiniciarContadorLibrosLeidos = async () => {
        try {
            const studentsRef = collection(db, 'students');
            const querySnapshot = await getDocs(studentsRef);

            querySnapshot.forEach(async (document) => {
                const studentRef = doc(db, 'students', document.id);
                await updateDoc(studentRef, {
                    librosLeidos: 0,
                });

                // Obtén la referencia a la subcolección 'prestamos' y elimina todos los documentos dentro de ella
                const prestamosRef = collection(studentRef, 'prestamos');
                const prestamosSnapshot = await getDocs(prestamosRef);
                prestamosSnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
            });

            console.log('Contador de libros reiniciado y subcolecciones eliminadas con éxito.');
        } catch (error) {
            console.error('Error al reiniciar el contador de libros y eliminar subcolecciones', error);
        }
    };


    const [fechas, setFechas] = useState([]);
    const [idEstudianteMes, setIdEstudianteMes] = useState(null);

    const obtenerFecha = async () => {
        try {
            const querySnapshot = await getDocs(query(
                collection(db, 'historialTopStudents'),
                orderBy('fecha', 'desc') // Ordenar por el campo de fecha en orden descendente
            ));
            const fechasData = [];

            querySnapshot.forEach((doc) => {
                fechasData.push({
                    id: doc.id,
                    ...doc.data(),
                });
            }
            )
            setFechas(fechasData);
        } catch (error) {
            console.log(error)
        }
    }

    const cargarEstudiantesMes = async (idMes) => {
        try {
            setEstadoMes(true);
            setIdEstudianteMes(idMes);
            const lib = query(
                collection(db, 'historialTopStudents', idMes, 'estudiantes'), //Referenciamos el database firestore
            );
            //console.log("lib",lib)
            const querySnapshot = await getDocs(lib);
            const estudiantesDataMes = [];

            querySnapshot.forEach((doc) => {
                estudiantesDataMes.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            setUsers(estudiantesDataMes);
            return idEstudianteMes;
        } catch (error) {
            console.error('Error al cargar los libros', error);
        }
    };

    const guardaraManualmente = () => {
        historialEstudiantes(users);
    };

    return (
        <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6 h-4/5 ">
            <div className="flex flex-col text-center w-full py-4">
                <h1 className="sm:text-3xl text-2xl font-medium title-font mb-8 mt-8 text-gray-900">RANKING DEL LECTOR</h1>

            </div>
            <div className="text-gray-600 body-font overflow-hidden flex">

                <motion.div initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }} className="container px-5 py-0 mx-auto w-2/3 ">
                    <button className='px-6 py-3 border rounded-xl mb-8'
                        onClick={guardaraManualmente}>
                        Guardar
                    </button>

                    <div className="-my-8 divide-y-2 divide-gray-100">
                        {users.map((user, index) => (
                            <div key={user.id} className="py-8 flex flex-wrap md:flex-nowrap">
                                <div className="md:w-28 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                                    <span className="font-semibold title-font text-gray-700">TOP</span>
                                    <span className="mt-1 text-gray-500 text-sm">{index + 1}</span>
                                </div>
                                <div className="md:w-40 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                                    <img
                                        onError={(e) => {
                                            e.target.src = "https://dummyimage.com/80x80";
                                        }}
                                        alt="team"
                                        className="w-3/4 h-full bg-gray-100 object-cover object-center flex-shrink-0  mr-4"
                                        src={user.img} />
                                </div>
                                <div className="md:flex-grow">
                                    <h2 className="text-lg font-medium text-gray-900 title-font mb-2">{user.nombre} {user.apellido}</h2>
                                    <p className="leading-relaxed text-sm">
                                        N° CELULAR: {user.celular} <br></br> GRADO: {user.grado} <br></br> SECCION: {user.seccion} <br></br> DIRECCION: {user.direccion}
                                    </p>
                                </div>
                                <div className="py-3 w-80 gap-12">
                                    <h2 className="text-lg font-medium text-gray-900 title-font mb-2">N° DE LIBROS LEIDOS</h2>
                                    <p className="leading-relaxed text-sm">
                                        N° Libros leidos: {user.librosLeidos}
                                    </p>
                                    <button onClick={() => { openModal(), cargarLibrosLeidos(user.id) }} type="submit" className="text-white right-2.5 bottom-2.5 mt-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Ver Libros</button>
                                </div>
                            </div>
                        ))}

                    </div>
                </motion.div>
                <motion.div initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }} className='relative max-h-96 bg-white overflow-y-auto w-1/3 drop-shadow-lg mx-auto px-2 py-6 container mr-3'>
                    <h1 className='mb-4 font-bold flex justify-center items-center text-center'>HISTORIAL LECTORES por MES</h1>

                    {fechas.map((fecha) => (
                        <div key={fecha.id} className='flex px-4 py-2 justify-center items-centerw-[100%]'>
                            <button onClick={() => { cargarEstudiantesMes(fecha.id) }} className={`hover:bg-gray-100 flex border rounded w-[100%] py-3 px-6 ${estadoMes && idEstudianteMes === fecha.id ? 'bg-gray-100 text-gray-700' : 'text-gray-700 hover:text-gray-700'
                                }`}>
                                {fecha.fecha.toDate().toLocaleString('es-ES', { year: 'numeric', month: 'long' }).toUpperCase()}
                            </button>
                        </div>
                    ))
                    }
                </motion.div>
            </div>

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center w-screen p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all lg:w-2/3 sm:my-6 sm:w-full sm:max-w-7xl ">

                                    <section className="text-gray-600 body-font">
                                        <div className="container px-5 py-10 mx-auto">
                                            <div className="flex flex-col text-center w-full mb-6">
                                                <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">Libros Leidos</h1>
                                            </div>
                                            <div className="flex flex-wrap -m-2">

                                                {books.map((book) => (
                                                    <motion.div initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ duration: 0.5 }} key={book.id} className="p-2 lg:w-1/3 md:w-1/2 w-full">
                                                        <div className="h-full flex items-center border-gray-200 border p-4 rounded-lg">
                                                            <img alt="team" className="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mr-4" src={book.urlImagen} />
                                                            <div className="flex-grow">
                                                                <h2 className="text-gray-900 title-font font-medium">Titulo: {book.nombre}</h2>
                                                                <p className="text-gray-500">Fecha de Prestamo: {book.fechaPrestamo}</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </Dialog.Panel>

                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </section >
    )
}

export default listTopUser