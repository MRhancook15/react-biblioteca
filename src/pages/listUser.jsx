/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Swal from 'sweetalert2'
import { Dialog, Transition } from '@headlessui/react'
import { AiFillDelete } from "react-icons/ai";
import { GrUpdate } from "react-icons/gr";

import { db, storage } from "../firebaseConfig/firebase"
import { useState, useEffect, Fragment, useRef } from 'react'
import { collection, getDoc, updateDoc, getDocs, query, where, limit, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

import QRCode from 'qrcode';
import Scanner from '../components/readerQr'
import StudentBook from '../components/register_User_Book_Qr'
import { motion } from 'framer-motion';

function listUser() {

  const [numEstudiantesCargados, setNumEstudiantesCargados] = useState(10);
  const [totalDeEstudiantes, setTotalDeEstudiantes] = useState(0);
  const usuariosPorPagina = 10;
  const [estudiantesCargados, setEstudiantesCargados] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [users, setUsers] = useState([])

  const cargarEstudiantes = async () => {
    try {
      const lib = query(
        collection(db, 'students'), //Referenciamos el database firestore
        where('fecha', '!=', ''),
        orderBy('fecha', 'desc'),
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
        // Obtener el total de libros solo una vez
        setTotalDeEstudiantes(querySnapshot.size);
        //console.log("querysize",querySnapshot.size)
        //console.log("querysnapshot",querySnapshot)
      }
      setUsers(estudiantesData);
      //console.log("libros data",librosData)

    } catch (error) {
      console.error('Error al cargar los libros', error);
    }
  };

  const cargarMasEstudiantes = () => {
    setNumEstudiantesCargados(numEstudiantesCargados + usuariosPorPagina);
  };

  // FUNCION DE ELIMINAR LIBRO
  // 5. Eliminar  por un id
  const deleteBook = async (id) => {
    const bookDoc = doc(db, "students", id);
    try {
      await deleteDoc(bookDoc);
      // Actualiza el estado de libros eliminando el libro con el ID correspondiente
      setUsers((prevUsers) => prevUsers.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error al eliminar el documento:", error);
    }
  }

  const confirmDelete = (id) => {
    Swal.fire({
      title: 'Seguro que quieres eliminarlo?',
      text: "No podrás revertir esto.!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, elimina esto!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBook(id)
        Swal.fire(
          'Eliminado!',
          'El estudiante se eliminado con exito!.',
          'success'
        )
      }
    })
  }


  // FUNCION DE BUSQUEDA
  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const buscarEstudiante = async () => {
    try {
      const librosRef = collection(db, 'students');
      const busquedaMinuscula = removeAccents(searchTerm.toLowerCase()); // Remover acentos de la cadena de búsqueda
      const q = query(
        librosRef,
        where('nombre'.toLowerCase(), '>=', searchTerm),
        where('nombre'.toLowerCase(), '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);

      const estudiantesEncontrados = [];

      querySnapshot.forEach((doc) => {
        const nombreMinusculas = removeAccents(doc.data().nombre.toLowerCase()); // Remover acentos del título
        //console.log(tituloMinusculas);
        if (nombreMinusculas.includes(busquedaMinuscula)) {
          estudiantesEncontrados.push({
            id: doc.id,
            ...doc.data(),
          });
        }
      });

      setResultados(estudiantesEncontrados);

      if (estudiantesEncontrados.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró ningún estudiante!',
        });

      }
    } catch (error) {
      console.error('Error al buscar estudiante:', error);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');


  //FUNCIONES PARA EDITAR LIBRO
  // 1. traemos los campos del Libro
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [celular, setCelular] = useState('')
  const [grado, setGrado] = useState('1°')
  const [seccion, setSeccion] = useState('A')
  const [nivel, setNivel] = useState('Primaria')
  const [direccion, setDireccion] = useState('')
  const [img, setImg] = useState(null); // Estado para la imagen seleccionada
  const [previewImg, setPreviewImg] = useState(null); // Estado para la vista previa de la imagen
  // Agrega este estado al principio de tu componente
  const [imagenExistenteURL, setImagenExistenteURL] = useState('');
  // traemos el ID para editar el libro
  const [selectedUserId, setSelectedUserId] = useState(null);
  //Funcion para conseguir el ID del libro
  const getUsersById = async (id) => {
    try {
      const user = await getDoc(doc(db, "students", id));
      if (user.exists()) {
        //console.log(book.exists())
        const userData = user.data();
        const imagenURL = userData.img;
        setNombre(userData.nombre || '');
        setApellido(userData.apellido || '');
        setCelular(userData.celular || '');
        setGrado(userData.grado || '1°');
        setSeccion(userData.seccion || 'A');
        setNivel(userData.nivel || 'Primaria');
        setDireccion(userData.direccion || '');

        // Actualiza el estado de la imagen solo si no está vacía
        if (imagenURL) {
          setImg(imagenURL);
          setImagenExistenteURL(imagenURL);
        }
        else {
          setImg(null);
          setImagenExistenteURL(null);
        }
        return imagenURL;
      } else {
        console.log('El estudiante no existe');
      }
    } catch (error) {
      console.error('Error al obtener el estudiante por ID:', error);
    }
  };

  //Una vez editado se sube los cambios
  const update = async (e) => {
    e.preventDefault();

    try {
      const imagenExistenteURL = await getUsersById(selectedUserId);

      if (img) {
        const storageRef = ref(storage, `student_images/${img.name}`);
        const uploadTask = uploadBytesResumable(storageRef, img);
        const uploadSnapshot = await uploadTask;
        const downloadURL = await getDownloadURL(uploadSnapshot.ref);

        const data = {
          nombre,
          apellido,
          celular,
          grado,
          seccion,
          nivel,
          direccion,
          img: downloadURL,
        };

        await updateDoc(doc(db, "students", selectedUserId), data);
        closeModal();
      } else {
        const data = {
          nombre,
          apellido,
          celular,
          grado,
          seccion,
          nivel,
          direccion,
          img: imagenExistenteURL,
        };

        await updateDoc(doc(db, "students", selectedUserId), data);
        closeModal();
      }
    } catch (error) {
      console.error('Error al actualizar el libro:', error);
    }
  };

  // Botones para abrir modal
  const cancelButtonRef = useRef(null)
  const [open, setOpen] = useState(false);

  const openModal = async () => {
    setOpen(true);
  };
  const closeModal = () => {
    cargarEstudiantes();
    setOpen(false);
  };


  //SELECCIONAR IMAGEN SOLO CON REACT PARA VISTA PREVIA
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      setImg(selectedImage);
      // Crear una URL para la vista previa de la imagen
      const objectURL = URL.createObjectURL(selectedImage);
      setPreviewImg(objectURL);
    }
  };

  const handleClicUpdate = () => {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Los cambios se guardaron correctamente!.',
      showConfirmButton: false,
      timer: 1500
    })
  }

  //GENERADOR DE QR
  const [qr, setQr] = useState('')

  const generateQrCode = async (id) => {
    try {
      const response = await QRCode.toDataURL(id);
      setQr(response);
      const data = {
        qr: response,
      };
      await updateDoc(doc(db, "students", id), data);
      cargarEstudiantes();
    } catch (error) {
      console.log(error)
    }
  }

  //LECTOR DE QR
  const cancelButtonRef2 = useRef(null)
  const [open2, setOpen2] = useState(false);

  const openModal2 = async () => {
    //console.log("antes", open2);
    setOpen2(true);
    //console.log("despues", open2);
  };

  //OBTENERMOS EL ID DEL ESTUDIANTE AL REGISTRAR EL QR
  const [scannedResult, setScannedResult] = useState(null)


  const handleScanResult = (result) => {
    setScannedResult(result); // Actualizará el estado de scannedResult en Componente 1
  };

  const [open3, setOpen3] = useState(false);
  //console.log("moda afuera y despues de todo:", open2)
  const scannerRef = useRef(); // Aquí se guarda la referencia al componente hijo

  const closeModal2 = () => {
    scannerRef.current.stopCamera();
    setOpen2(false);
  };

  const closeModal3 = (active) => {
    setOpen3(active);
    setScannedResult('');
  }

  useEffect(() => {
    if (!estudiantesCargados) {
      cargarEstudiantes();
      setEstudiantesCargados(true);
    }
    if (scannedResult) {
      scannerRef.current.stopCamera();
      setOpen2(false);
      setOpen3(true);
    }
  }, [estudiantesCargados, scannedResult, open2]);

  return (
    <section className="text-gray-600 body-font absolute top-0 right-0 w-5/6 h-4/5">
      <div className="flex flex-col text-center w-full">
        <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 mt-8 text-gray-900">LISTA DE ESTUDIANTES</h1>
        <div className="w-full flex justify-center">
          <form className="w-1/2" onSubmit={(e) => e.preventDefault()}>
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="search"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black outline-none dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Buscar estudiante por Nombre o Apellido..."
                required />
              <button
                onClick={buscarEstudiante}
                className="text-white absolute right-2.5 bottom-2.5 bg-blu  e-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="text-gray-600 body-font overflow-hidden ">
        <div className="container px-5 py-8  mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}  className="-my-8 divide-y-2 divide-gray-100">
        <button className='px-6 py-3 border rounded-xl'
          onClick={() => { openModal2() }}>
          Lector QR
        </button>
          {/* CARD */}
          {resultados.length > 0 ? (
            resultados.map((user) => (
              <div key={user.id} className="py-8 flex flex-wrap md:flex-nowrap">
                <div className="md:w-28 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                  <span className="font-semibold title-font text-gray-700">FECHA</span>
                  <span className="mt-1 text-gray-500 text-sm">{user.fecha}</span>
                </div>
                <div className="md:w-40 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                  <img
                    onError={(e) => {
                      e.target.src = "https://firebasestorage.googleapis.com/v0/b/biblioteca-react-5e5a8.appspot.com/o/student_images%2Fdefault_user.png?alt=media&token=ee44e61f-f23c-48f8-af18-aaf8b9aa455c&_gl=1*u5k4gu*_ga*NzkxNjIyMTc1LjE2OTY0MzIxNDI.*_ga_CW55HF8NVT*MTY5NzIwMzY2MC4xMC4xLjE2OTcyMTUwNDMuMzYuMC4w";
                    }}
                    alt="team"
                    className="w-3/4 h-full bg-gray-100 object-cover object-center flex-shrink-0  mr-4"
                    src={user.img} />
                </div>
                <div className="md:flex-grow">
                  <h2 className="text-lg  text-gray-900 title-font mb-2 uppercase font-extrabold">{user.nombre} {user.apellido}</h2>
                  <p className="leading-relaxed text-sm">
                    <span className="font-bold">N° CELULAR:</span> <span className="text-lg">{user.celular}</span>
                    <br />
                    <span className="font-bold">GRADO:</span> <span className="text-lg">{user.grado}</span>
                    <br />
                    <span className="font-bold">SECCION:</span> <span className="text-lg">{user.seccion}</span>
                    <br />
                    <span className="font-bold">DIRECCION:</span> <span className="text-lg">{user.direccion}</span>
                  </p>
                </div>
                <span className="inline-flex gap-8">
                  <button onClick={() => { openModal(); if (user && user.id) getUsersById(user.id); setSelectedUserId(user.id); }} >
                    <GrUpdate />
                  </button>
                  <button onClick={() => { confirmDelete(user.id) }}>
                    <AiFillDelete />
                  </button>
                </span>
              </div>
            ))
            ) : (          
            users.map((user) => (
              <div key={user.id} className="py-8 flex flex-wrap md:flex-nowrap">
                <div className="md:w-28 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                  <span className="font-semibold title-font text-gray-700">FECHA</span>
                  <span className="mt-1 text-gray-500 text-sm">{user.fecha}</span>
                </div>
                <div className="md:w-44 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
                  <img
                    onError={(e) => {
                      e.target.src = "https://firebasestorage.googleapis.com/v0/b/biblioteca-react-5e5a8.appspot.com/o/student_images%2Fdefault_user.png?alt=media&token=ee44e61f-f23c-48f8-af18-aaf8b9aa455c&_gl=1*u5k4gu*_ga*NzkxNjIyMTc1LjE2OTY0MzIxNDI.*_ga_CW55HF8NVT*MTY5NzIwMzY2MC4xMC4xLjE2OTcyMTUwNDMuMzYuMC4w";
                    }}
                    alt="team"
                    className="w-3/4 h-full bg-gray-100 object-cover object-center flex-shrink-0  mr-4"
                    src={user.img} />
                </div>
                <div className="md:flex-grow w-10">
                  <h2 className="text-lg text-gray-900 title-font mb-2 uppercase font-extrabold">{user.nombre} {user.apellido}</h2>
                  <p className="leading-relaxed text-sm">
                    <span className="font-bold">N° CELULAR:</span> <span className="text-lg">{user.celular}</span>
                    <br />
                    <span className="font-bold">GRADO:</span> <span className="text-lg">{user.grado}</span>
                    <br />
                    <span className="font-bold">SECCION:</span> <span className="text-lg">{user.seccion}</span>
                    <br />
                    <span className="font-bold">DIRECCION:</span> <span className="text-lg">{user.direccion}</span>
                  </p>
                </div>

                <div className='flex flex-grow'>
                  <div>
                    <h2 className="text-lg text-gray-900 title-font mb-2 uppercase font-extrabold"> GENERADOR DE QR </h2>
                    <div className='flex items-center justify-center h-28'>

                      {user.qr ? (
                        <p>El QR ya esta generado!</p>
                      ) : (
                        <button
                          className='px-6 py-4 border text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                          onClick={() => { generateQrCode(user.id) }}
                        >
                          Generar QR
                        </button>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-grow justify-center items-center'>
                    <a href={user.qr} download>
                      <img
                        alt="Codigo QR no generado"
                        className="w-32"
                        src={user.qr} />
                    </a>
                  </div>
                </div>


                <span className="inline-flex gap-8">
                  <button onClick={() => { openModal(); if (user && user.id) getUsersById(user.id); setSelectedUserId(user.id); }} >
                    <GrUpdate />
                  </button>
                  <button onClick={() => { confirmDelete(user.id) }}>
                    <AiFillDelete />
                  </button>
                </span>
              </div>
            ))
            )}
            <div className='border border-red-600'>
              {numEstudiantesCargados < totalDeEstudiantes ? ( // SERA ACA EL PROBLEMA?
                <button onClick={cargarMasEstudiantes}>Cargar más estudiantes</button>
              ) : null}
            </div>


          </motion.div>

        </div>
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

                  <div className="container px-5 py-16 h-full w-11/12 mx-auto flex space-x-20 items-center" >
                    <form onSubmit={update} className="lg:w-1/3 md:w-1/2 bg-white border-blue-700 border rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0 relative z-10 shadow-md">
                      <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">ACTUALIZAR ESTUDIANTE</h2>
                      <p className="leading-relaxed mb-5 text-gray-600">Editar Estudiante/ Modificar Estudiante</p>
                      <div className="relative mb-4">
                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Nombres Completos</label>
                        <input value={nombre} onChange={(e) => setNombre(e.target.value)} type="text" id="name" name="name" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                      </div>
                      <div className="relative mb-4">
                        <label htmlFor="lastname" className="leading-7 text-sm text-gray-600">Apellidos Completos</label>
                        <input value={apellido} onChange={(e) => setApellido(e.target.value)} type="text" id="lastname" name="lastname" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                      </div>
                      <div className="relative mb-4">
                        <label htmlFor="phone" className="leading-7 text-sm text-gray-600">N° Celular</label>
                        <input value={celular} onChange={(e) => setCelular(e.target.value)} type="number" id="phone" name="phone" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                      </div>

                      <div className="flex mb-4 left-0">
                        <div className="flex ml-6 items-center">
                          <span className="mr-3">Grado</span>
                          <div className="relative">
                            <select value={grado} onChange={(e) => setGrado(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                              <option>1°</option>
                              <option>2°</option>
                              <option>3°</option>
                              <option>4°</option>
                              <option>5°</option>
                              <option>6°</option>
                            </select>
                            <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="flex ml-6 items-center">
                          <span className="mr-3">Seccion</span>
                          <div className="relative">
                            <select value={seccion} onChange={(e) => setSeccion(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                              <option>A</option>
                              <option>B</option>
                              <option>C</option>
                              <option>D</option>

                            </select>
                            <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M6 9l6 6 6-6"></path>
                              </svg>
                            </span>
                          </div>
                        </div>

                      </div>
                      <div className="flex ml-6 items-center">
                        <span className="mr-3">Nivel</span>
                        <div className="relative">
                          <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-base pl-3 pr-10">
                            <option>Primaria</option>
                            <option>Secundaria</option>

                          </select>
                          <span className="absolute right-0 top-0 h-full w-10 text-center text-gray-600 pointer-events-none flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M6 9l6 6 6-6"></path>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="relative mb-4">
                        <label htmlFor="address" className="leading-7 text-sm text-gray-600">Direccion</label>
                        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} type="text" id="address" name="address" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                      </div>
                      <div className='flex gap-2'>
                        <button
                          type="button"
                          className=" justify-center rounded-md bg-red-600 px-2 py-4 text-sm font-semibold text-white shadow-sm hover:bg-red-500  sm:w-1/2"
                          onClick={closeModal}
                        >
                          Cancelar
                        </button>
                        <button type='submit' onClick={handleClicUpdate} className="text-white text-sm font-semibold dark:bg-[#2563eb] border-0 py-2 px-4 focus:outline-none hover:bg-indigo-600 rounded  w-1/2">
                          Actualizar
                        </button>
                      </div>
                    </form>
                    {/* CONTENIDO PARA IMAGEN DE ESTUDIANTE */}
                    <div className="flex flex-col w-3/5 h-full p-1 overflow-auto">
                      <label className="flex flex-col h-full items-center justify-center py-12 text-base transition duration-500 ease-in-out transform bg-white border border-dashed border-blue-600 rounded-lg text-blueGray-500 focus:border-blue-500 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 hover:cursor-pointer hover:bg-blueGray-100">
                        <span className="text-xl font-semibold text-blueGray-600 mb-2">Seleccionar archivo o suelte aqui cualquier imagen</span>
                        <img src={previewImg || img || imagenExistenteURL} alt="" className="w-full max-h-80 mb-2" /> {/* Mostrar la vista previa */}
                        <input
                          type="file"
                          onChange={handleImageChange}
                          className="cursor-pointer relative w-full py-28 px-48  flex justify-center items-center"
                        />
                      </label>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={open2} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef2} onClose={closeModal2}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all lg:w-1/3 sm:my-6 sm:w-full sm:max-w-7xl">
                  <div className='flex '> {/* Aumenté la altura a 60 */}
                    <div className="container px-5 py-16 h-[80%] w-11/12 mx-auto flex-grow flex flex-col justify-center items-center gap-16">
                      <h1>SCANNER</h1>
                      <Scanner onScan={handleScanResult} forwardedRef={scannerRef} />
                      <button
                        type="button"
                        className="justify-center rounded-md bg-red-600 px-2 py-4 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-1/2"
                        onClick={closeModal2}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>

              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>


      <Transition.Root show={open3} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef2} onClose={setOpen3}>
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

                  {/* ACA VA EL REGISTRADOR DE QR DEL ESTUDIANTE CON EL LIBRO */}
                  <StudentBook dataEstudiante={scannedResult} ActiveModal={closeModal3} />

                </Dialog.Panel>

              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </section >
  )
}

export default listUser